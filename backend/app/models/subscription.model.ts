import { CustomerPaymentSettings, Subscription, SubscriptionItem, SubscriptionStatus } from '@prisma/client';
import { UserInputError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';
import { esloPaymentGateway, ISubscriptionItemsUpdateInput } from '../services/payment';
// import { logger } from '../utils/logger';

import { ProductModel } from './product.model';
import { InvoiceModel } from './invoice.model';
import { esloConfig } from '../secrets';

export interface ISubscriptionItemInput {
    priceId: string;
    quantity: number;
}

export interface IStudentSubscription {
    id: string;
    customerId: string;
    renewalDate?: string;
    status: string;
}

interface ISubscriptionsFilters {
    status?: SubscriptionStatus;
    expiringInDays?: number;
}

export interface ICheckoutMetadataInput {
    subscriptionId?: string;
}

export interface ICreatePaymentMethodInput {
    type: 'card';
    metadata?: ICheckoutMetadataInput;
}

interface ICreateCompleteSubscriptionInput {
    type: 'FREE_TRIAL';
    subscriptionItems: ISubscriptionItemInput[];
}

interface IActivateAndUpgradeSubscriptionInput {
    subscriptionId: string;
    subscriptionItems: ISubscriptionItemInput[];
}

interface ICreateSubscriptionInput {
    status: SubscriptionStatus;
    paymentProviderId: string;
    subscriptionItems: ISubscriptionItemInput[];
}

interface IFreeTrialInfos {
    trialStartedAt: string;
    trialEndedAt: string | null;
    expiringInDays: number;
}

interface IPayAndFinishSubscriptionFreeTrialPeriod {
    subscription?: Subscription;
    subscriptionId?: string;
}

interface IActivateSubscriptionInput extends IPayAndFinishSubscriptionFreeTrialPeriod {}

export class SubscriptionModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'subscription');
    }

    public async findById(id: string): Promise<Subscription | null> {
        const subscription = await this.prismaClient.subscription.findUnique({
            where: { id },
        });

        await this.validateIAM({
            action: 'read',
            resourceType: 'Subscription',
            resource: subscription,
        });

        return subscription;
    }

    public async findAll(): Promise<Subscription[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Subscription',
        });

        return this.prismaClient.subscription.findMany({ where: { AND: { ...iamPermission.filter } } });
    }

    public async findByPaymentProviderId(paymentProviderId: string): Promise<Subscription | null> {
        // await this.validateIAM({
        //     action: 'read',
        //     resourceType: 'Subscription',
        //     resource: subscription,
        // });

        return this.prismaClient.subscription.findFirst({
            where: { paymentProviderId },
        });
    }

    public async findCustomerPaymentSettings(userId?: string): Promise<CustomerPaymentSettings | null> {
        return this.prismaClient.customerPaymentSettings.findFirst({
            where: {
                userId: userId || this.loggedUser.id,
                deletedAt: null,
            },
        });
    }

    public async findSubscriptionItems(subscriptionId: string): Promise<SubscriptionItem[]> {
        // TODO: iam permissions
        return this.prismaClient.subscriptionItem.findMany({
            where: { subscriptionId },
        });
    }

    /**
     * TODO: Filter expiringInDays is ignored
     * The field should be virtually created in the GraphQL
     * @param userId string
     * @param filters ISubscriptionsFilters
     * @returns Subscription
     */
    public async findByUser(userId: string, filters: ISubscriptionsFilters): Promise<Subscription[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Subscription',
        });

        let filterStatus = {};
        if (filters.status) {
            filterStatus = { status: filters.status };
        }

        return this.prismaClient.subscription.findMany({
            where: {
                AND: { ...iamPermission.filter },
                ...filterStatus,
                customerId: userId,
                status: filters.status || undefined,
            },
        });
    }

    public async findSubscriptionsByUser(): Promise<Subscription[]> {
        await this.validateIAM({
            action: 'list',
            resourceType: 'Subscription',
        });

        return this.prismaClient.subscription.findMany({
            where: {
                customerId: this.loggedUser.id,
                status: { in: ['ACTIVE', 'TRIALING', 'TRIAL_EXPIRED'] },
            },
        });
    }

    /**
     * TODO: This function is temporary as it bypasses the IAM permissions
     * Teachers should not have access to their student's subscriptions
     * @param studentId string
     * @param filters ISubscriptionsFilters
     * @returns IStudentSubscription
     */
    public async findByStudentId(studentId: string, filters: ISubscriptionsFilters): Promise<IStudentSubscription[]> {
        // const iamPermission = await this.validateIAM({
        //     action: 'list',
        //     resourceType: 'Subscription',
        // });

        let filterStatus = {};
        if (filters.status) {
            filterStatus = { status: filters.status };
        }

        let maxDate: Date | null = null;
        if (filters.expiringInDays) {
            maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + filters.expiringInDays);
        }

        const studentsSubscriptionsExpiringInDays: IStudentSubscription[] = [];

        const subscriptions = await this.prismaClient.subscription.findMany({
            where: {
                // AND: { ...iamPermission.filter },
                ...filterStatus,
                customerId: studentId,
                status: filters.status || undefined,
            },
        });

        const studentSubscriptions = await Promise.all(
            subscriptions.map(async (subscription) => {
                let renewalDate: Date | null = null;
                if (subscription.status === 'ACTIVE') {
                    renewalDate = await this.getStripeSubscriptionRenewalDate(subscription.customerId);
                }

                const studentSubscription: IStudentSubscription = {
                    id: subscription.id,
                    customerId: subscription.customerId,
                    status: subscription.status,
                    renewalDate: renewalDate ? renewalDate.toISOString() : undefined,
                };

                if (filters.status === 'ACTIVE' && filters.expiringInDays && maxDate) {
                    if (renewalDate !== null && renewalDate < maxDate) {
                        studentsSubscriptionsExpiringInDays.push(studentSubscription);
                    }
                }

                return studentSubscription;
            }),
        );

        return filters.expiringInDays ? studentsSubscriptionsExpiringInDays : studentSubscriptions;
    }

    public async createCustomerPaymentSettings(): Promise<CustomerPaymentSettings | null> {
        const newCustomer = await esloPaymentGateway.createCustomer(this.loggedUser);

        if (!newCustomer) {
            return null;
        }

        return this.prismaClient.customerPaymentSettings.create({
            data: {
                userId: this.loggedUser.id,
                paymentProviderId: newCustomer.id,
            },
        });
    }

    public async updateCustomerPaymentSettings(
        checkoutSession: Stripe.Checkout.Session,
    ): Promise<CustomerPaymentSettings | null> {
        if (
            !checkoutSession.setup_intent ||
            typeof checkoutSession.setup_intent !== 'string' ||
            !checkoutSession.customer ||
            typeof checkoutSession.customer !== 'string'
        ) {
            return null;
        }

        // get setup intent
        const setupIntent = await esloPaymentGateway.getSetupIntent(checkoutSession.setup_intent);

        if (!setupIntent || typeof setupIntent.payment_method !== 'string') {
            return null;
        }

        // update customerPaymentSettings
        const customerPaymentSettings = await this.prismaClient.customerPaymentSettings.update({
            where: { paymentProviderId: checkoutSession.customer },
            data: {
                paymentProviderPaymentMethodId: setupIntent.payment_method,
                updatedAt: new Date(),
            },
        });

        // set default payment method
        await esloPaymentGateway.updateCustomer({
            customerId: checkoutSession.customer,
            paymentMethodId: setupIntent.payment_method,
        });

        return customerPaymentSettings;
    }

    public async createPaymentMethodCheckoutSession(
        input: ICreatePaymentMethodInput,
    ): Promise<CustomerPaymentSettings | null> {
        if (input.type !== 'card') {
            throw new Error('Invalid type');
        }

        // get/create customer payment settings
        let customerPaymentSettings = await this.findCustomerPaymentSettings();
        if (!customerPaymentSettings) {
            customerPaymentSettings = await this.createCustomerPaymentSettings();
        }

        if (!customerPaymentSettings) {
            throw new UserInputError('Error when trying to get customer payment settings.');
        }

        const checkoutSession = await esloPaymentGateway.createPaymentMethodCheckoutSession({
            customerPaymentSettings,
            customer: this.loggedUser,
            metadata: { subscriptionId: input.metadata?.subscriptionId },
        });

        if (!checkoutSession) {
            throw new UserInputError('Error when trying to create checkout session.');
        }
        return this.prismaClient.customerPaymentSettings.update({
            where: { id: customerPaymentSettings.id },
            data: { paymentProviderCheckoutSessionId: checkoutSession.id },
        });
    }

    public async activateAndUpgradeSubscription(
        input: IActivateAndUpgradeSubscriptionInput,
    ): Promise<Subscription | CustomerPaymentSettings> {
        // find current subscription
        const currentSubscription = await this.prismaClient.subscription.findFirst({
            where: { id: input.subscriptionId },
            include: { subscriptionItems: true },
        });

        // only trialing subscriptions (for now)
        if (
            !currentSubscription ||
            !currentSubscription.paymentProviderId ||
            (currentSubscription.status !== 'TRIALING' && currentSubscription.status !== 'TRIAL_EXPIRED')
        ) {
            throw new Error('No valid trialing subscription found.');
        }

        // permissions
        await this.validateIAM({
            action:
                input.subscriptionItems[0].priceId !== currentSubscription.subscriptionItems[0].priceId
                    ? 'update'
                    : 'activate',
            resourceType: 'Subscription',
            resource: currentSubscription,
        });

        const checkoutItems: ISubscriptionItemsUpdateInput[] = [];

        // get/create customer payment settings
        let customerPaymentSettings = await this.findCustomerPaymentSettings();
        if (!customerPaymentSettings) {
            customerPaymentSettings = await this.createCustomerPaymentSettings();
        }

        if (!customerPaymentSettings) {
            throw new UserInputError('Error when trying to get customer payment settings.');
        }

        // validate price update
        // TODO: Create new logic to deal with two or more items
        // TODO: Create new logic to pdate product
        if (currentSubscription.subscriptionItems[0].priceId !== input.subscriptionItems[0].priceId) {
            if (!currentSubscription.subscriptionItems[0].paymentProviderId) {
                // subscriptions have only one item (for now)
                throw new Error('Invalid current subscription item.');
            }

            const newItem = await this.prismaClient.price.findUnique({
                where: { id: input.subscriptionItems[0].priceId }, // subscriptions have only one item (for now)
            });

            if (!newItem || !newItem.paymentProviderId) {
                throw new Error('Invalid priceId.');
            }

            checkoutItems.push({
                id: currentSubscription.subscriptionItems[0].paymentProviderId, // subscriptions have only one item (for now)
                price: newItem.paymentProviderId,
            });

            // update subscription with the new prices
            await esloPaymentGateway.updateSubscription({
                subscriptionId: currentSubscription.paymentProviderId,
                items: checkoutItems,
            });

            await this.prismaClient.subscription.update({
                where: { id: currentSubscription.id },
                data: {
                    updatedAt: new Date(),
                    subscriptionItems: {
                        update: {
                            data: input.subscriptionItems[0],
                            where: { paymentProviderId: currentSubscription.subscriptionItems[0].paymentProviderId }, // subscriptions have only one item (for now)
                        },
                    },
                },
            });
        }

        // pay/create checkout
        if (customerPaymentSettings.paymentProviderPaymentMethodId) {
            // get invoice from subscription
            const invoiceModel = new InvoiceModel(this.loggedUser);
            const invoice = await invoiceModel.findBySubscriptionId(currentSubscription.id);

            if (checkoutItems.length === 0 && invoice && invoice.paymentProviderId) {
                // pay
                await invoiceModel.payInvoice({
                    id: invoice.id,
                    paymentProviderId: invoice.paymentProviderId,
                    paymentProviderPaymentMethodId: customerPaymentSettings.paymentProviderPaymentMethodId,
                });
            } else {
                // end free trial (pays automatically with new items)
                await this.payAndFinishSubscriptionFreeTrialPeriod({
                    subscription: currentSubscription,
                });
            }
        } else {
            // create payment method checkout session
            const checkoutSession = await this.createPaymentMethodCheckoutSession({
                type: 'card',
                metadata: { subscriptionId: currentSubscription.id },
            });

            if (!checkoutSession) {
                throw new Error('Error when trying to create payment method checkout session');
            }

            const paymentSettings = await this.findCustomerPaymentSettings();

            if (!paymentSettings) {
                throw new Error('Error when trying to get customer payment settings.');
            }

            return paymentSettings;
        }

        // activate/update subscription (in case of payment suceed)
        return this.activateSubscription({
            subscription: currentSubscription,
        });
    }

    public async activateSubscription(input: IActivateSubscriptionInput): Promise<Subscription> {
        if (!input.subscriptionId && !input.subscription) {
            throw new Error('Subscription not provided.');
        }

        const subscription =
            input.subscription ||
            (await this.prismaClient.subscription.findUnique({ where: { id: input.subscriptionId } }));

        if (!subscription) {
            throw new Error('Subscription not found.');
        }

        // permissions
        await this.validateIAM({
            action: 'activate',
            resourceType: 'Subscription',
            resource: subscription,
        });

        return this.prismaClient.subscription.update({
            where: { id: subscription.id },
            data: {
                trialEndedAt: subscription.status === ('TRIALING' || 'TRIAL_EXPIRED') ? new Date() : undefined,
                status: 'ACTIVE',
                updatedAt: new Date(),
            },
        });
    }

    public async activateSubscriptionFromProvider(subscriptionId: string): Promise<Subscription | null> {
        // find subscription
        const subscription = await this.prismaClient.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            return null;
        }

        // permissions
        await this.validateIAM({
            action: 'activate',
            resourceType: 'Subscription',
            resource: subscription,
        });

        // end free-trial
        await this.payAndFinishSubscriptionFreeTrialPeriod({
            subscription,
        });

        // activate subscription
        return this.activateSubscription({ subscription });
    }

    public async payAndFinishSubscriptionFreeTrialPeriod(
        input: IPayAndFinishSubscriptionFreeTrialPeriod,
    ): Promise<Stripe.Subscription | null> {
        if (!input.subscriptionId && !input.subscription) {
            return null;
        }

        // find subscription
        const subscription = input.subscriptionId ? await this.findById(input.subscriptionId) : input.subscription;

        if (!subscription) {
            return null;
        }

        // end free trial (pays automatically)
        return esloPaymentGateway.updateSubscription({
            subscriptionId: subscription.paymentProviderId,
            endFreeTrial: true,
        });
    }

    public async createCompleteSubscription(input: ICreateCompleteSubscriptionInput): Promise<Subscription> {
        await this.validateIAM({
            action: 'create',
            resourceType: 'Subscription',
        });

        if (input.type !== 'FREE_TRIAL') {
            throw new UserInputError('Invalid type.');
        }

        if (input.subscriptionItems.length === 0) {
            throw new UserInputError('Subscription items was not provided.');
        }

        if (input.subscriptionItems.length > 1) {
            throw new UserInputError('Please, provide only one subscription item.');
        }

        const productModel = new ProductModel(this.loggedUser);

        // get/create customer payment settings
        let customerPaymentSettings = await this.findCustomerPaymentSettings();
        if (!customerPaymentSettings) {
            customerPaymentSettings = await this.createCustomerPaymentSettings();
        }

        if (!customerPaymentSettings) {
            throw new UserInputError('Error when trying to get customer payment settings.');
        }

        // price validation
        const checkoutPrices = await Promise.all(
            input.subscriptionItems.map(async (item): Promise<ISubscriptionItemInput> => {
                const price = await productModel.findActivePriceById(item.priceId);
                if (!price || !price.paymentProviderId) {
                    throw new UserInputError('Invalid priceId.');
                }
                return {
                    priceId: price.paymentProviderId,
                    quantity: item.quantity,
                };
            }),
        );

        // free-trial validations
        if (input.type === 'FREE_TRIAL') {
            const customerStripeSubscriptions = await esloPaymentGateway.listSubscriptions(
                customerPaymentSettings.paymentProviderId,
            );

            if (
                customerStripeSubscriptions &&
                customerStripeSubscriptions?.data.some((subscription) => subscription.trial_start)
            ) {
                throw new Error('User has already used a free-trial subscription.');
            }

            const freeTrialPrices = await productModel.findFreeTrialPrices();
            if (!freeTrialPrices) {
                throw new Error('Free trial prices not found.');
            }

            if (input.subscriptionItems.some((item) => !freeTrialPrices.some((price) => price.id === item.priceId))) {
                throw new Error('Invalid subscription free-trial items.');
            }
        }

        // create Stripe subscription
        const stripeSubscription = await esloPaymentGateway.createSubscription({
            type: input.type === 'FREE_TRIAL' ? 'FREE_TRIAL' : 'PURCHASE',
            customerId: customerPaymentSettings.paymentProviderId,
            items: checkoutPrices,
        });

        if (!stripeSubscription) {
            throw new UserInputError('Error when trying to create Stripe subscription.');
        }

        // create subscription
        const newSubscription = await this.createSubscription({
            status: input.type === 'FREE_TRIAL' ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
            paymentProviderId: stripeSubscription?.id,
            subscriptionItems: input.subscriptionItems.map((item) => {
                return {
                    ...item,
                    paymentProviderId: stripeSubscription.items.data[0].id, // subscriptions have only one item (for now)
                };
            }),
        });

        return newSubscription;
    }

    public async createSubscription(input: ICreateSubscriptionInput): Promise<Subscription> {
        await this.validateIAM({
            action: 'create',
            resourceType: 'Subscription',
        });

        return this.prismaClient.subscription.create({
            data: {
                id: uuidv4(),
                customerId: this.loggedUser.id,
                autoRenew: true,
                status: input.status,
                paymentProviderId: input.paymentProviderId,
                trialStartedAt: input.status === 'TRIALING' ? new Date() : null,
                subscriptionItems: {
                    createMany: {
                        data: input.subscriptionItems,
                    },
                },
            },
        });
    }

    public async getStripeSubscriptionRenewalDate(userId: string): Promise<Date | null> {
        // TODO: IAM permissions
        const customerPaymentSettings = await this.findCustomerPaymentSettings(userId);

        if (!customerPaymentSettings) {
            return null;
        }

        const response = await esloPaymentGateway.previewInvoice(customerPaymentSettings?.paymentProviderId);

        if (!response) {
            return null;
        }

        return new Date(response.period_end * 1000);
    }

    // eslint-disable-next-line class-methods-use-this
    public getFreeTrialInfos(subscription: Subscription): IFreeTrialInfos | null {
        if (
            !esloConfig.paymentGatewayFreeTrialInDays ||
            !subscription.trialStartedAt ||
            (subscription.status !== 'TRIALING' && subscription.status !== 'TRIAL_EXPIRED')
        ) {
            return null;
        }

        const expiringInDays =
            subscription.trialStartedAt.getDate() + esloConfig.paymentGatewayFreeTrialInDays - new Date().getDate();

        return {
            trialStartedAt: subscription.trialStartedAt.toISOString(),
            trialEndedAt: subscription.trialEndedAt ? subscription.trialEndedAt.toISOString() : null,
            expiringInDays: expiringInDays >= 0 ? expiringInDays : 0,
        };
    }
}
