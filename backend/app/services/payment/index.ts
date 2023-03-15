import { Stripe } from 'stripe';
import { Price, Product, User, CustomerPaymentSettings } from '@prisma/client';

import { logger } from '../../utils/logger';
import paymentSettings from '../../config/payment-settings.json';
import { esloConfig } from '../../secrets';
import { ISubscriptionItemInput, ICheckoutMetadataInput } from '../../models/subscription.model';
import { EsloRecurrenceTools } from '../../utils/recurrence-tools';

interface PaymentSettings {
    invoiceEmail: string;
    currencyCode: string;
    paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
    checkoutSuccessUrl: string;
    checkoutCancelledUrl: string;
}

interface ICreateSubscriptionInput {
    type: 'FREE_TRIAL' | 'PURCHASE';
    customerId: string;
    items: ISubscriptionItemInput[];
}

interface IPayInvoiceInput {
    invoiceId: string;
    paymentMethodId: string;
}

export interface ISubscriptionItemsUpdateInput {
    id: string; // current payment provider item id
    price: string; // new price id to attach to the item
}

interface IUpdateSubscriptionInput {
    subscriptionId: string;
    endFreeTrial?: boolean;
    items?: ISubscriptionItemsUpdateInput[];
}

interface IUpdateCustomerInput {
    customerId: string;
    paymentMethodId?: string;
}

interface ICreatePaymentMethodCheckoutSession {
    customer: User;
    customerPaymentSettings: CustomerPaymentSettings;
    metadata?: ICheckoutMetadataInput;
}

class EsloPaymentGateway {
    private paymentGateway: Stripe | undefined;

    private settings: PaymentSettings;

    constructor() {
        this.settings = {
            invoiceEmail: paymentSettings.invoiceEmail,
            currencyCode: paymentSettings.currencyCode,
            paymentMethodTypes:
                paymentSettings.paymentMethodTypes as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
            checkoutSuccessUrl: `${esloConfig.frontendUrl}/${paymentSettings.checkoutSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
            checkoutCancelledUrl: `${esloConfig.frontendUrl}/${paymentSettings.checkoutCancelledUrl}`,
        };

        if (!esloConfig.paymentGatewayEnabled) {
            logger.warn({
                message: 'Payment gateway API is not enabled',
                source: 'EsloPaymentGateway',
            });
            return;
        }

        if (!esloConfig.paymentGatewayApiKey) {
            throw new Error('Payment gateway api key not found');
        }

        this.paymentGateway = new Stripe(esloConfig.paymentGatewayApiKey, { apiVersion: '2020-08-27' });
    }

    private static getStripeIntervalFromRecurrence(
        recurrence: string | null,
    ): Stripe.PriceCreateParams.Recurring | undefined {
        if (recurrence) {
            const priceInterval = EsloRecurrenceTools.getIntervalFromRRule(recurrence);
            if (priceInterval) {
                return { interval: priceInterval.interval, interval_count: priceInterval.intervalCount };
            }
        }
        return undefined;
    }

    // product
    public async createProduct(product: Product): Promise<Stripe.Product | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        const providerProduct = await this.paymentGateway.products.create({
            id: product.id,
            name: product.name,
            description: product.description,
            active: product.active,
            metadata: {
                slug: product.slug,
            },
        });

        return providerProduct;
    }

    public async updateProduct(product: Product): Promise<Stripe.Product | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        const providerProduct = await this.paymentGateway.products.update(product.id, {
            name: product.name,
            description: product.description,
            active: product.active,
            metadata: {
                slug: product.slug,
            },
        });

        return providerProduct;
    }

    // price
    public async createPrice(price: Price): Promise<Stripe.Price | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        const providerPrice = await this.paymentGateway.prices.create({
            product: price.productId,
            currency: price.currencyIsoCode.toLowerCase(),
            unit_amount: price.unitTotalAmount.toNumber() * 100, // in cents: 29.90 => 2,990
            active: price.active,
            recurring: EsloPaymentGateway.getStripeIntervalFromRecurrence(price.recurrence),
            metadata: {
                name: price.name,
                description: price.description,
                slug: price.slug,
            },
        });

        return providerPrice;
    }

    public async updatePrice(price: Price): Promise<Stripe.Price | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        // parse provider object
        if (!price.paymentProviderId) {
            const message = 'Price does not have a relation with payment provider';
            logger.error({
                message,
                resourceType: 'Price',
                source: 'updatePrice',
                action: 'update',
                context: { price: price.id },
            });
            throw new Error(message);
        }

        const providerPrice = await this.paymentGateway.prices.update(price.paymentProviderId, {
            // active: price.active,
            recurring: EsloPaymentGateway.getStripeIntervalFromRecurrence(price.recurrence),
            metadata: {
                name: price.name,
                description: price.description,
                slug: price.slug,
            },
        });

        return providerPrice;
    }

    public async disablePrice(price: Price): Promise<Stripe.Price | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        // parse provider object
        if (!price.paymentProviderId) {
            const message = 'Price does not have a relation with payment provider';
            logger.error({
                message,
                resourceType: 'Price',
                source: 'disablePrice',
                action: 'cancel',
                context: { price: price.id },
            });
            throw new Error(message);
        }

        return this.paymentGateway.prices.update(price.paymentProviderId, {
            active: false,
        });
    }

    // customer
    public async createCustomer(customer: User): Promise<Stripe.Customer | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        return this.paymentGateway.customers.create({
            email: customer.primaryEmail,
            name: `${customer.firstName} ${customer.familyName}`,
        });
    }

    public async updateCustomer(input: IUpdateCustomerInput): Promise<Stripe.Customer | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        let invoiceSettings = {};

        if (input.paymentMethodId) {
            invoiceSettings = {
                invoice_settings: {
                    default_payment_method: input.paymentMethodId,
                },
            };
        }

        return this.paymentGateway.customers.update(input.customerId, {
            ...invoiceSettings,
        });
    }

    public async getSetupIntent(id: string): Promise<Stripe.SetupIntent | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        return this.paymentGateway.setupIntents.retrieve(id);
    }

    // subscription
    public async createSubscription(input: ICreateSubscriptionInput): Promise<Stripe.Subscription | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        if (!esloConfig.paymentGatewayFreeTrialInDays) {
            throw new Error('Payment gateway webhook key not found');
        }

        const items = input.items.map((item) => {
            return { price: item.priceId };
        });

        const subscription = await this.paymentGateway.subscriptions.create({
            customer: input.customerId,
            items,
            trial_period_days: input.type === 'FREE_TRIAL' ? esloConfig.paymentGatewayFreeTrialInDays : undefined,
            payment_behavior: input.type === 'PURCHASE' ? 'allow_incomplete' : undefined,
        });

        return subscription;
    }

    public async listSubscriptions(customerId?: string): Promise<Stripe.ApiList<Stripe.Subscription> | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        return this.paymentGateway.subscriptions.list({
            customer: customerId,
            status: 'all',
        });
    }

    public async updateSubscription(input: IUpdateSubscriptionInput): Promise<Stripe.Subscription | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        const items = input.items || undefined;

        return this.paymentGateway.subscriptions.update(input.subscriptionId, {
            trial_end: input.endFreeTrial ? 'now' : undefined,
            items,
        });
    }

    // checkout
    public async createPaymentMethodCheckoutSession(
        input: ICreatePaymentMethodCheckoutSession,
    ): Promise<Stripe.Checkout.Session | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        const subscriptionMetadata = input.metadata
            ? {
                  subscriptionId: input.metadata.subscriptionId,
              }
            : undefined;

        const checkoutSession = await this.paymentGateway.checkout.sessions.create({
            payment_method_types: this.settings.paymentMethodTypes,
            mode: 'setup',
            customer: input.customerPaymentSettings.paymentProviderId,
            client_reference_id: input.customer.id,
            metadata: {
                customerId: input.customerPaymentSettings.paymentProviderId,
                ...subscriptionMetadata,
            },
            success_url: this.settings.checkoutSuccessUrl, // validate
            cancel_url: this.settings.checkoutCancelledUrl, // validate
        });

        return checkoutSession;
    }

    // invoice
    public async previewInvoice(customerId: string): Promise<Stripe.Invoice | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        if (!esloConfig.paymentGatewayWebhookKey) {
            throw new Error('Payment gateway webhook key not found');
        }

        const response = await this.paymentGateway.invoices.retrieveUpcoming({
            customer: customerId,
        });

        return response;
    }

    public async payInvoice(input: IPayInvoiceInput): Promise<Stripe.Invoice | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        return this.paymentGateway.invoices.pay(input.invoiceId, {
            payment_method: input.paymentMethodId,
        });
    }

    // webhook
    public async validateSignature(body: any, signature: string | string[]): Promise<Stripe.Event | null> {
        if (!this.paymentGateway) {
            return Promise.resolve(null);
        }

        if (!esloConfig.paymentGatewayWebhookKey) {
            throw new Error('Payment gateway webhook key not found');
        }

        return this.paymentGateway.webhooks.constructEvent(body, signature, 'whsec_URvnTE1U9Ze4saB1SzgjgRU7tldTxloB');
    }
}

const esloPaymentGateway = new EsloPaymentGateway();
export { esloPaymentGateway };
