import { ApolloError } from 'apollo-server-errors';
import { objectType, extendType, inputObjectType, idArg, stringArg, unionType } from 'nexus';
import { generateToken } from '../../auth/token';

import { EsloContext } from '../context';
import { Student } from './classroom';
import { User } from './user';

export const SubscriptionItemsInput = inputObjectType({
    name: 'SubscriptionItemsInput',
    definition(t) {
        t.nonNull.string('priceId');
        t.nonNull.int('quantity');
    },
});

export const ActivateAndUpgradeSubscriptionInput = inputObjectType({
    name: 'ActivateAndUpgradeSubscriptionInput',
    definition(t) {
        t.nonNull.string('subscriptionId');
        t.list.field('subscriptionItems', {
            type: SubscriptionItemsInput,
        });
    },
});

export const CreateSubscriptionInput = inputObjectType({
    name: 'CreateSubscriptionInput',
    definition(t) {
        t.nonNull.string('type');
        t.nonNull.list.field('subscriptionItems', { type: SubscriptionItemsInput });
    },
});

export const SubscriptionItem = objectType({
    name: 'SubscriptionItem',
    definition(t) {
        t.nonNull.id('id');
        t.string('subscriptionId');
        t.string('priceId');
        t.float('quantity');
        t.boolean('active');
    },
});

export const StudentSubscriptions = objectType({
    name: 'StudentSubscriptions',
    definition(t) {
        t.id('id');
        t.string('customerId');
        t.string('renewalDate');
        t.string('status');
        t.field('student', {
            type: Student,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.customerId),
        });
    },
});

export const FreeTrial = objectType({
    name: 'FreeTrial',
    definition(t) {
        t.string('trialStartedAt');
        t.string('trialEndedAt');
        t.string('expiringInDays');
    },
});

export const Subscription = objectType({
    name: 'Subscription',
    definition(t) {
        t.nonNull.id('id');
        t.string('customerId');
        t.string('status');
        t.string('paymentProviderId');
        t.string('paymentProviderCheckoutId');
        // t.string('renewalDate');
        t.field('freeTrial', {
            type: FreeTrial || null,
            resolve: (parent, _, context: EsloContext) => context.models.subscription.getFreeTrialInfos(parent),
        });
        t.field('customer', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.customerId),
        });
        t.list.field('subscriptionItems', {
            type: SubscriptionItem,
            resolve: (parent, _, context: EsloContext) => context.models.subscription.findSubscriptionItems(parent.id),
        });
    },
});

export const CustomerPaymentSettings = objectType({
    name: 'CustomerPaymentSettings',
    definition(t) {
        t.nonNull.id('id');
        t.string('userId');
        t.string('paymentProviderPaymentMethodId');
        t.string('paymentProviderCheckoutSessionId');
    },
});

export const ActivateAndUpdateSubscriptionType = unionType({
    name: 'ActivateAndUpdateSubscriptionType',
    resolveType(parent) {
        return 'subscriptionItems' in parent ? 'Subscription' : 'CustomerPaymentSettings';
    },
    definition(t) {
        t.members('Subscription', 'CustomerPaymentSettings');
    },
});

export const SubscriptionQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('subscription', {
            type: Subscription,
            args: { id: idArg({ description: 'Subscription ID' }) },
            resolve: async (_root, args, context: EsloContext) => context.models.subscription.findById(args.id),
        });
    },
});

export const UserSubscriptionsQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('userSubscriptions', {
            type: Subscription,
            resolve: async (_root, args, context: EsloContext) => context.models.subscription.findSubscriptionsByUser(),
        });
    },
});

export const createSubscriptionMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createSubscription', {
            type: Subscription,
            args: { subscriptionInput: CreateSubscriptionInput },
            resolve: async (_root, args, context: EsloContext) => {
                const subscription = await context.models.subscription.createCompleteSubscription({
                    type: args.subscriptionInput.type,
                    subscriptionItems: args.subscriptionInput.subscriptionItems,
                });

                // no status validation (free-trial only, for now)

                const subscriptionUser = await context.models.user.findById(subscription.customerId);

                if (!subscriptionUser) {
                    throw new ApolloError('Invalid subscription customer');
                }

                await generateToken(context.res, subscriptionUser, true);

                return subscription;
            },
        });
    },
});

export const activateAndUpgradeSubscriptionMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('activateAndUpgradeSubscription', {
            type: ActivateAndUpdateSubscriptionType,
            args: { activateAndUpgradeSubscriptionInput: ActivateAndUpgradeSubscriptionInput },
            resolve: async (_root, args, context: EsloContext) => {
                const response = await context.models.subscription.activateAndUpgradeSubscription({
                    subscriptionId: args.activateAndUpgradeSubscriptionInput.subscriptionId,
                    subscriptionItems: args.activateAndUpgradeSubscriptionInput.subscriptionItems,
                });

                const subscription = await context.models.subscription.findById(
                    args.activateAndUpgradeSubscriptionInput.subscriptionId,
                );

                if (subscription && subscription.status === 'ACTIVE') {
                    const subscriptionUser = await context.models.user.findById(subscription.customerId);

                    if (!subscriptionUser) {
                        throw new ApolloError('Invalid subscription customer');
                    }
                    await generateToken(context.res, subscriptionUser, true);
                }

                return response;
            },
        });
    },
});

export const createPaymentMethodCheckoutMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createPaymentMethodCheckoutMutation', {
            type: CustomerPaymentSettings,
            args: { type: stringArg({ description: 'Payment method type' }) },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.subscription.createPaymentMethodCheckoutSession({ type: args.type }),
        });
    },
});
