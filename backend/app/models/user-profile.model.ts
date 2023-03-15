import { Prisma, User, UserAddress, UserAuthentication, UserIdentification, UserPhoneNumber } from '@prisma/client';
import * as argon2 from 'argon2';
import { ApolloError, UserInputError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';
import { uid } from 'rand-token';

import { EsloModel } from './eslo.model';

import { logger } from '../utils/logger';
import { esloConfig } from '../secrets';
import { esloMailService } from '../services/messaging/email-engine';
import { ChangedPasswordMessageTemplate } from '../services/messaging/templates/changed-password';
import { ConfirmRegistrationMessageTemplate } from '../services/messaging/templates/confirm-registration';
import { InvitationModel } from './invitation.model';

// Prisma only exposes models with raw attributes.
// When using relations (i.e. include: {})a custom type must be defined
export type UserWithSubscription = Prisma.UserGetPayload<{
    include: {
        subscriptions: {
            include: {
                subscriptionItems: {
                    include: { price: { include: { product: true } } };
                };
            };
        };
        studentEnrollments: true;
    };
}>;

export type UserWithAuthentication = Prisma.UserGetPayload<{
    include: {
        userAuthenticationList: true;
    };
}>;

export interface UserLocalAuthInput {
    email: string;
    password: string;
}

export interface UserIdentificationInput {
    id?: string;
    countryISO: string;
    category: string;
    code: string;
    attachementUrl: string | null;
}

export interface UserAddressInput {
    id?: string;
    addressType: string;
    postalCode?: string;
    street?: string;
    streetNumber?: string;
    streetComplement?: string;
    district?: string;
    city?: string;
    state?: string;
    countryISO: string;
    latitude?: number;
    longitude?: number;
}

interface UserPhoneNumberInput {
    id?: string;
    countryISO: string;
    category: string;
    code: string;
    rawFormat?: string;
    nationalFormat?: string;
    internationalFormat?: string;
}

interface UserInput {
    primaryEmail: string;
    firstName: string;
    familyName: string;
    displayName?: string;
    dateOfBirth?: string;
    profileComplete?: boolean; // read-only field - ignored when updating
    userIdentificationList: UserIdentificationInput[];
    userAddresses: UserAddressInput[];
    userPhoneNumbers: UserPhoneNumberInput[];
}

interface ICreateUserInput {
    primaryEmail: string;
    firstName: string;
    familyName: string;
    displayName?: string;
}

export interface UserRegistrationInput extends ICreateUserInput {
    password: string;
    userAddress: UserAddressInput;
    userIdentification: UserIdentificationInput;
}

export class UserProfileModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'user_profile');
    }

    public static getSystemUser(systemUserType: 'payment' | 'auth'): UserWithSubscription {
        return {
            id: uuidv4(),
            familyName: systemUserType,
            primaryEmail: `${systemUserType}@admin.eslo`,
            firstName: 'system',
            displayName: 'system user',
            gender: null,
            banned: false,
            bannedAt: null,
            profilePicUrl: null,
            dateOfBirth: null,
            createdAt: null,
            updatedAt: null,
            deletedAt: null,
            subscriptions: [],
            studentEnrollments: [],
        };
    }

    public static isValidPassword(password: string): boolean {
        const regex = new RegExp(/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,64}$/);
        return regex.test(password);
    }

    public findById(id: string): Promise<User | null> {
        if (!id) {
            return new Promise((resolve) => resolve(null));
        }

        return this.prismaClient.user.findUnique({
            where: { id },
        });
    }

    public findByEmail(email: string): Promise<User | null> {
        if (!email) {
            return new Promise((resolve) => resolve(null));
        }

        return this.prismaClient.user.findUnique({
            where: { primaryEmail: email },
        });
    }

    public findUserIdentificationList(userId: string): Promise<UserIdentification[]> {
        return this.prismaClient.userIdentification.findMany({
            where: { userId },
        });
    }

    public findUserAddresses(userId: string): Promise<UserAddress[]> {
        return this.prismaClient.userAddress.findMany({
            where: { userId },
        });
    }

    public findUserPhoneNumber(userId: string): Promise<UserPhoneNumber[]> {
        return this.prismaClient.userPhoneNumber.findMany({
            where: { userId },
        });
    }

    public async registerUser(newUser: UserRegistrationInput, invitationToken?: string): Promise<User> {
        let registeredUser: User;
        if (invitationToken) {
            const invitationModel = new InvitationModel(UserProfileModel.getSystemUser('auth'));
            const invitation = await invitationModel.findByInvitationToken(invitationToken);

            if (!invitation || invitation.status !== 'PENDING') {
                throw new UserInputError('Invalid invitation token');
            }

            const user = await this.findById(invitation.inviteeId);
            if (!user) {
                const message = 'Invalid user reference for invitation token';
                logger.error({
                    message,
                    subjectId: this.loggedUser.id,
                    resourceType: 'User',
                    source: 'registerUser',
                    action: 'create',
                    context: {
                        user: invitation.inviteeId,
                        invitationToken: invitation.invitationToken,
                    },
                });
                throw new ApolloError('User not found with invitation token provided');
            }

            registeredUser = user;
        } else {
            registeredUser = await this.createUser(newUser);
        }

        const [localStrategy] = await Promise.all([
            this.createUserLocalAuthStrategy(
                registeredUser,
                {
                    email: registeredUser.primaryEmail,
                    password: newUser.password,
                },
                invitationToken !== undefined,
            ),
            this.createUserAddress(registeredUser, newUser.userAddress),
            this.createUserIdentification(registeredUser, newUser.userIdentification),
        ]);

        // send email to validate email if not yet validated
        if (!invitationToken) {
            const { frontendUrl } = esloConfig;
            const registerUserTemplate = new ConfirmRegistrationMessageTemplate({
                userName: registeredUser.firstName,
                confirmRegistrationUrl: `${frontendUrl}/user-account/confirm-email/${localStrategy.registrationToken}`,
                classesUrl: `${frontendUrl}/classroom/classes`,
                profileUrl: `${frontendUrl}/profile`,
            });

            esloMailService.sendEmailWithTemplate(registeredUser.primaryEmail, registerUserTemplate);
        }

        return registeredUser;
    }

    private async createUserLocalAuthStrategy(
        user: User,
        newAuth: UserLocalAuthInput,
        emailIsValidated: boolean,
    ): Promise<UserAuthentication> {
        if (!UserProfileModel.isValidPassword(newAuth.password)) {
            throw new UserInputError('Invalid password');
        }

        const hashedPassword = await argon2.hash(newAuth.password, { type: argon2.argon2id });
        const registrationToken = uid(12);

        const userLocalStrategy = await this.prismaClient.userAuthentication.findUnique({
            where: {
                userId_strategyCode: {
                    userId: user.id,
                    strategyCode: 'LOCAL',
                },
            },
        });

        if (userLocalStrategy) {
            throw new UserInputError('Local strategy (email/password) already created for this user');
        }

        return this.prismaClient.userAuthentication.create({
            data: {
                userId: user.id,
                strategyCode: 'LOCAL',
                strategyId: newAuth.email,
                status: emailIsValidated ? 'ACTIVE' : 'UNCONFIRMED',
                hashedPassword,
                registrationToken: emailIsValidated ? null : registrationToken,
                registrationTokenTimestamp: emailIsValidated ? null : new Date(),
            },
        });
    }

    private async createUserIdentification(
        user: User,
        identification: UserIdentificationInput,
    ): Promise<UserIdentificationInput> {
        return this.prismaClient.userIdentification.create({
            data: {
                userId: user.id,
                ...identification,
            },
        });
    }

    private async createUserAddress(user: User, address: UserAddressInput): Promise<UserAddress> {
        return this.prismaClient.userAddress.create({
            data: {
                userId: user.id,
                ...address,
            },
        });
    }

    /**
     * Create a user without an authentication strategy.
     * This is useful when inviting others to the platform.
     * @param newUser {ICreateUserInput}
     * @returns {User}
     */
    public async createUser(newUser: ICreateUserInput): Promise<User> {
        const user = await this.findByEmail(newUser.primaryEmail);

        if (user) {
            const message = 'User is already registered';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'User',
                source: 'registerUser',
                action: 'create',
                context: {
                    userEmail: newUser.primaryEmail,
                },
            });
            throw new UserInputError(message);
        }

        return this.prismaClient.user.create({
            data: {
                primaryEmail: newUser.primaryEmail,
                firstName: newUser.firstName,
                familyName: newUser.familyName,
                displayName: newUser.displayName || newUser.firstName,
            },
        });
    }

    public async checkMyProfile(): Promise<boolean> {
        const userProfile = await this.prismaClient.user.findUnique({
            where: { id: this.loggedUser.id },
            include: {
                userAddresses: true,
                userIdentificationList: true,
                userPhoneNumbers: true,
            },
        });

        if (!userProfile) {
            return false;
        }

        if (!(userProfile.userAddresses?.length > 0)) {
            return false;
        }

        if (!(userProfile.userIdentificationList?.length > 0)) {
            return false;
        }

        return true;
    }

    public async changeMyPassword(userEmail: string, oldPassword: string, newPassword: string): Promise<User> {
        // fetch active local strategy for given email
        const userWithAuth = await this.prismaClient.user.findFirst({
            where: {
                id: this.loggedUser.id,
            },
            include: {
                userAuthenticationList: {
                    where: {
                        strategyCode: 'LOCAL',
                        strategyId: userEmail,
                        status: 'ACTIVE',
                    },
                },
            },
        });

        // validate that there is one (and only one) local auth strategy with given email
        if (!userWithAuth || userWithAuth.userAuthenticationList.length !== 1) {
            throw new UserInputError('This email is not linked with your profile.');
        }
        const authStrategy = userWithAuth.userAuthenticationList[0];

        // validate current password
        let isValidCurrentPassword: boolean;
        try {
            isValidCurrentPassword = await argon2.verify(authStrategy.hashedPassword || '', oldPassword);
        } catch (error: any) {
            const message = 'Your password could not be validated';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'User',
                source: 'changeMyPassword',
                action: 'update',
            });
            throw new ApolloError(message);
        }

        if (!isValidCurrentPassword) {
            throw new UserInputError('The current password is incorrect.');
        }

        // validate new password
        if (!UserProfileModel.isValidPassword(newPassword)) {
            throw new UserInputError('The new password does not satisfy the password requirements.');
        }
        const newHashedPassword = await argon2.hash(newPassword, {
            type: argon2.argon2id,
        });

        // update password
        await this.prismaClient.userAuthentication.update({
            data: {
                hashedPassword: newHashedPassword,
            },
            where: {
                id: authStrategy.id,
            },
        });

        logger.info({
            message: 'Your password has been changed',
            subjectId: this.loggedUser.id,
            resourceType: 'User',
            source: 'changeMyPassword',
            action: 'update',
            context: { userEmail },
        });

        const changedPasswordTemplate = new ChangedPasswordMessageTemplate({ userName: this.loggedUser.firstName });
        esloMailService.sendEmailWithTemplate(this.loggedUser.primaryEmail, changedPasswordTemplate);

        return this.loggedUser;
    }

    public async updateMyProfile(userProfile: UserInput): Promise<User> {
        // TODO: at the moment it can only have one address, id and phone.
        return this.prismaClient.user.update({
            data: {
                primaryEmail: userProfile.primaryEmail,
                firstName: userProfile.firstName,
                familyName: userProfile.familyName,
                userIdentificationList: {
                    upsert: {
                        create: {
                            countryISO: userProfile.userIdentificationList[0].countryISO,
                            category: userProfile.userIdentificationList[0].category,
                            code: userProfile.userIdentificationList[0].code,
                        },
                        update: {
                            countryISO: userProfile.userIdentificationList[0].countryISO,
                            category: userProfile.userIdentificationList[0].category,
                            code: userProfile.userIdentificationList[0].code,
                        },
                        where: {
                            id: userProfile.userIdentificationList[0].id,
                        },
                    },
                },
                userAddresses: {
                    upsert: {
                        create: {
                            addressType: userProfile.userAddresses[0].addressType,
                            postalCode: userProfile.userAddresses[0].postalCode,
                            street: userProfile.userAddresses[0].street,
                            streetNumber: userProfile.userAddresses[0].streetNumber,
                            streetComplement: userProfile.userAddresses[0].streetComplement,
                            district: userProfile.userAddresses[0].district,
                            city: userProfile.userAddresses[0].city,
                            state: userProfile.userAddresses[0].state,
                            countryISO: userProfile.userAddresses[0].countryISO,
                        },
                        update: {
                            addressType: userProfile.userAddresses[0].addressType,
                            postalCode: userProfile.userAddresses[0].postalCode,
                            street: userProfile.userAddresses[0].street,
                            streetNumber: userProfile.userAddresses[0].streetNumber,
                            streetComplement: userProfile.userAddresses[0].streetComplement,
                            district: userProfile.userAddresses[0].district,
                            city: userProfile.userAddresses[0].city,
                            state: userProfile.userAddresses[0].state,
                            countryISO: userProfile.userAddresses[0].countryISO,
                        },
                        where: {
                            id: userProfile.userAddresses[0].id,
                        },
                    },
                },
            },
            where: {
                id: this.loggedUser.id,
            },
        });
    }
}
