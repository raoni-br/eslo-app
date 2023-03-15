import express, { Request, Response } from 'express';
import * as argon2 from 'argon2';
import { uid } from 'rand-token';
import { UserInputError } from 'apollo-server-express';

import { User } from '@prisma/client';

import { prismaClient } from '../prisma';
import { esloPassport } from '../middleware/auth/passport';
import { generateToken } from '../middleware/auth/token';
import { logger } from '../utils/logger';

import { esloConfig } from '../secrets';

import { esloMailService } from '../services/messaging/email-engine';
// import { ConfirmRegistrationMessageTemplate } from '../services/messaging/templates/confirm-registration';
import { ResetPasswordMessageTemplate } from '../services/messaging/templates/password-reset';
import { ChangedPasswordMessageTemplate } from '../services/messaging/templates/changed-password';
import {
    UserAddressInput,
    UserIdentificationInput,
    UserProfileModel,
    UserRegistrationInput,
} from '../models/user-profile.model';

export const authRouter = express.Router();

const options = {
    session: false,
    failureRedirect: '/auth/login',
    failureFlash: true,
};

const authAdminUser = UserProfileModel.getSystemUser('auth');

authRouter.post('/login', esloPassport.authenticate('local', options), async (req, res) => {
    const user: User = req.user as User;
    const rememberMe: boolean = req.body.rememberMe || false;

    // Create jwt token
    const token = await generateToken(res, user, rememberMe);
    res.status(200).send({ token });
});

authRouter.post('/email-validation', async (req, res) => {
    const userProfileModel = new UserProfileModel(authAdminUser);
    const { primaryEmail } = req.body;

    const user = await userProfileModel.findByEmail(primaryEmail);

    if (!user) {
        res.status(400).send({ message: `E-mail ${primaryEmail} is not registered.` });
        return;
    }

    res.status(200).send({ message: `E-mail ${primaryEmail} is already registered.` });
});

authRouter.post('/register', async (req, res) => {
    let userAddress: UserAddressInput;
    try {
        userAddress = {
            postalCode: req.body.postalCode,
            street: req.body.street,
            streetNumber: req.body.streetNumber,
            streetComplement: req.body.streetComplement,
            district: req.body.district,
            city: req.body.city,
            state: req.body.state,
            addressType: req.body.addressType,
            countryISO: req.body.countryISO,
        };
    } catch {
        return res.status(400).send({ message: ['Invalid address'] });
    }

    let userIdentification: UserIdentificationInput;
    try {
        userIdentification = {
            category: req.body.category,
            code: req.body.cpf,
            countryISO: req.body.countryISO,
            attachementUrl: null,
        };
    } catch {
        return res.status(400).send({ message: ['Invalid identification document'] });
    }

    let userRegistrationInput: UserRegistrationInput;
    try {
        userRegistrationInput = {
            primaryEmail: req.body.email,
            firstName: req.body.firstName,
            familyName: req.body.lastName,
            password: req.body.password,
            userAddress,
            userIdentification,
        };
    } catch {
        return res.status(400).send({ message: ['Invalid profile details'] });
    }

    const { invitationToken } = req.body;

    const userProfileModel = new UserProfileModel(authAdminUser);
    let createdUser: User;
    try {
        createdUser = await userProfileModel.registerUser(userRegistrationInput, invitationToken);
    } catch (error: any) {
        if (error instanceof UserInputError) {
            return res.status(400).send({ message: [error.message] });
        }
        return res.status(500).send({ message: [(error as any).message] });
    }

    // Create jwt token
    const token = await generateToken(res, createdUser, false);
    return res.status(200).send({ token });
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ message: 'Missing user email.' });
    }

    const user = await prismaClient.user.findFirst({
        where: {
            primaryEmail: email,
        },
        include: {
            userAuthenticationList: {
                where: {
                    strategyCode: 'LOCAL',
                    strategyId: email,
                },
            },
        },
    });

    if (!user) {
        return res.status(400).send({ message: 'User not found.' });
    }

    const resetPasswordToken = uid(12);
    const resetPasswordTokenTimestamp = new Date();

    if (user.userAuthenticationList.length === 0) {
        await prismaClient.userAuthentication.create({
            data: {
                userId: user.id,
                strategyCode: 'LOCAL',
                strategyId: email,
                resetPasswordToken,
                resetPasswordTokenTimestamp,
                status: 'UNCONFIRMED',
            },
        });
    } else {
        const authStrategy = user.userAuthenticationList[0];

        await prismaClient.userAuthentication.update({
            where: {
                id: authStrategy.id,
            },
            data: {
                resetPasswordToken,
                resetPasswordTokenTimestamp,
            },
        });
    }

    const resetPasswordMessageTemplate = new ResetPasswordMessageTemplate({
        userName: user.firstName,
        resetPasswordUrl: `${esloConfig.frontendUrl}/auth/reset-password/${resetPasswordToken}`,
    });

    esloMailService.sendEmailWithTemplate(email, resetPasswordMessageTemplate);

    logger.info({
        message: 'Reset password email sent',
        subjectId: user.id,
        resourceType: 'User',
        source: 'forgotPassword',
        action: 'update',
        context: { userEmail: email },
    });

    return res.status(200).send({
        message: 'Reset password email sent.',
        userEmail: user.primaryEmail,
    });
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
    const { resetPasswordToken, newPassword } = req.body;

    if (!resetPasswordToken) {
        return res.status(400).send({ message: 'Missing reset password token.' });
    }

    const localAuthStrategy = await prismaClient.userAuthentication.findFirst({
        where: {
            resetPasswordToken,
            strategyCode: 'LOCAL',
        },
        include: { user: true },
    });

    if (!localAuthStrategy) {
        return res.status(400).send({ message: 'Cannot found any user with the given token.' });
    }

    const resetPasswordTimestamp = localAuthStrategy.resetPasswordTokenTimestamp;
    if (!resetPasswordTimestamp) {
        return res.status(400).send({ message: 'Cannot found token timestamp.' });
    }
    resetPasswordTimestamp.setHours(resetPasswordTimestamp.getHours() + 24);
    const now = new Date();

    if (resetPasswordTimestamp < now) {
        return res.status(400).send({ message: 'Expired token.' });
    }

    if (!UserProfileModel.isValidPassword(newPassword)) {
        return res.status(400).send({ message: 'The new password does not satisfy the password requirements.' });
    }

    const newHasehdPassword = await argon2.hash(newPassword, { type: argon2.argon2id });

    await prismaClient.userAuthentication.update({
        where: {
            id: localAuthStrategy.id,
        },
        data: {
            hashedPassword: newHasehdPassword,
            passwordChangedTimestamp: new Date(),
            resetPasswordToken: null,
            resetPasswordTokenTimestamp: null,
            status: 'ACTIVE',
        },
    });

    // TODO: send email informing password has been reset.
    const changedPasswordTemplate = new ChangedPasswordMessageTemplate({ userName: localAuthStrategy.user.firstName });
    esloMailService.sendEmailWithTemplate(localAuthStrategy.strategyId, changedPasswordTemplate);

    return res.status(200).send({
        message: 'Password updated.',
        userEmail: localAuthStrategy.strategyId,
    });
});

authRouter.post('/confirm-registration', async (req: Request, res: Response) => {
    const { registrationToken } = req.body;

    if (!registrationToken) {
        return res.status(400).send({ message: 'Missing registration token.' });
    }

    const confirmedUser = await prismaClient.user.findFirst({
        where: {
            userAuthenticationList: {
                some: {
                    strategyCode: 'LOCAL',
                    registrationToken,
                    status: 'UNCONFIRMED',
                },
            },
        },
        include: { userAuthenticationList: true },
    });

    if (!confirmedUser || !confirmedUser.userAuthenticationList || confirmedUser.userAuthenticationList.length === 0) {
        const message = 'Invalid token or email has already been confirmed';
        logger.error({
            message,
            subjectId: confirmedUser?.id,
            resourceType: 'User',
            source: 'confirmRegistration',
            action: 'update',
            context: { registrationToken },
        });

        return res.status(400).send({ message });
    }

    await prismaClient.userAuthentication.update({
        where: {
            id: confirmedUser.userAuthenticationList[0].id,
        },
        data: {
            status: 'ACTIVE',
            registrationTokenTimestamp: new Date(),
        },
    });

    logger.info({
        message: 'User email validated',
        subjectId: confirmedUser.id,
        resourceType: 'User',
        source: 'confirmRegistration',
        action: 'update',
        context: { registrationToken },
    });

    return res.status(200).send({
        message: 'Account has been activated.',
    });
});
