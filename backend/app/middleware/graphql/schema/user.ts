import { objectType, extendType, inputObjectType, stringArg } from 'nexus';
import { User as UserModel } from '@prisma/client';

import { EsloContext } from '../context';
import { Event, EventOccurrence } from './event';
import { Invitation } from './invitation';

import { generateToken, generateLiveChatToken } from '../../auth/token';

export const UserIdentificationInput = inputObjectType({
    name: 'UserIdentificationInput',
    definition(t) {
        t.id('id');
        t.string('countryISO');
        t.string('category');
        t.string('code');
        t.string('attachementUrl');
    },
});

export const ChangePasswordInput = inputObjectType({
    name: 'ChangePasswordInput',
    definition(t) {
        t.string('userEmail');
        t.string('oldPassword');
        t.string('newPassword');
    },
});

export const UserAddressInput = inputObjectType({
    name: 'UserAddressInput',
    definition(t) {
        t.id('id');
        t.string('addressType');
        t.string('postalCode');
        t.string('street');
        t.string('streetNumber');
        t.string('streetComplement');
        t.string('district');
        t.string('city');
        t.string('state');
        t.string('countryISO');
        t.float('latitude');
        t.float('longitude');
    },
});

export const UserPhoneNumberInput = inputObjectType({
    name: 'UserPhoneNumberInput',
    definition(t) {
        t.id('id');
        t.string('countryISO');
        t.string('category');
        t.string('code');
        t.string('rawFormat');
        t.string('nationalFormat');
        t.string('internationalFormat');
    },
});

export const UserInput = inputObjectType({
    name: 'UserInput',
    definition(t) {
        t.string('primaryEmail');
        t.string('firstName');
        t.string('familyName');
        t.string('displayName');
        // t.string('dateOfBirth');
        t.boolean('profileComplete'); // read-only field - ignored when updating
        t.list.field('userIdentificationList', {
            type: UserIdentificationInput,
        });
        t.list.field('userAddresses', {
            type: UserAddressInput,
        });
        /* t.list.field('userPhoneNumbers', {
            type: UserPhoneNumberInput,
        }); */
    },
});

export const UserIdentification = objectType({
    name: 'UserIdentification',
    definition(t) {
        t.nonNull.id('id');
        t.string('countryISO');
        t.string('category');
        t.string('code');
        t.string('attachementUrl');
    },
});

export const UserAddress = objectType({
    name: 'UserAddress',
    definition(t) {
        t.nonNull.id('id');
        t.string('addressType');
        t.string('postalCode');
        t.string('street');
        t.string('streetNumber');
        t.string('streetComplement');
        t.string('district');
        t.string('city');
        t.string('state');
        t.string('countryISO');
        t.float('latitude');
        t.float('longitude');
    },
});

export const UserPhoneNumber = objectType({
    name: 'UserPhoneNumber',
    definition(t) {
        t.nonNull.id('id');
        t.string('countryISO');
        t.string('category');
        t.string('code');
        t.string('rawFormat');
        t.string('nationalFormat');
        t.string('internationalFormat');
    },
});

export const User = objectType({
    name: 'User',
    definition(t) {
        t.nonNull.id('id');
        t.string('primaryEmail');
        t.string('firstName');
        t.string('familyName');
        t.string('displayName');
        t.string('dateOfBirth');
        t.boolean('profileComplete', {
            resolve: async (parent, _, context: EsloContext) => context.models.user.checkMyProfile(),
        });
        t.boolean('onboardingSubmitted', {
            resolve: async (parent, _, context: EsloContext) => context.models.userTutorial.checkOnboardingSubmission()
        })
        t.list.field('userIdentificationList', {
            type: UserIdentification,
            resolve: (parent, _, context: EsloContext) => context.models.user.findUserIdentificationList(parent.id),
        });
        t.list.field('userAddresses', {
            type: UserAddress,
            resolve: (parent, _, context: EsloContext) => context.models.user.findUserAddresses(parent.id),
        });
        t.list.field('userPhoneNumbers', {
            type: UserPhoneNumber,
            resolve: (parent, _, context: EsloContext) => context.models.user.findUserPhoneNumber(parent.id),
        });
        t.list.field('eventsOrganised', {
            type: Event,
            resolve: (parent, _, context: EsloContext) => context.models.calendar.findEventsOrganisedByUser(parent.id),
        });
        t.list.field('eventsOwned', {
            type: Event,
            resolve: (parent, _, context: EsloContext) => context.models.calendar.findEventsOwnedByUser(parent.id),
        });
        t.list.field('invitationsReceived', {
            type: Invitation,
            resolve: (parent, _, context: EsloContext) =>
                context.models.invitation.findInvitationsReceivedByUser(parent.id),
        });
    },
});

export const MyProfileQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('myProfile', {
            type: User,
            resolve: (_parent, _, context: EsloContext) => context.req.user,
        });
    },
});

export const MyCalendarQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('myCalendar', {
            type: EventOccurrence,
            args: {
                fromDate: stringArg({ description: 'Start date of calendar view' }),
                toDate: stringArg({ description: 'End date of calendar view' }),
            },
            resolve: async (_parent, args, context: EsloContext) =>
                context.models.calendar.getMyCalendar(args.fromDate, args.toDate),
        });
    },
});

export const GetLiveChatToken = extendType({
    type: 'Query',
    definition(t) {
        t.id('liveChatToken', {
            resolve: async (_parent, args, context: EsloContext) =>
                generateLiveChatToken(context.res, context.req.user as UserModel),
        });
    },
});

export const ChangeMyPasswordMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('changeMyPassword', {
            type: User,
            args: {
                changePasswordInput: ChangePasswordInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.user.changeMyPassword(
                    args.changePasswordInput.userEmail,
                    args.changePasswordInput.oldPassword,
                    args.changePasswordInput.newPassword,
                ),
        });
    },
});

export const UpdateMyProfileMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('updateMyProfile', {
            type: User,
            args: {
                userProfile: UserInput,
            },
            resolve: async (_root, args, context: EsloContext) => {
                const user = await context.models.user.updateMyProfile(args.userProfile);
                await generateToken(context.res, user, true);
                return user;
            },
        });
    },
});
