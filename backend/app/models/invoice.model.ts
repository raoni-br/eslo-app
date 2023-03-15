import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

import { Invoice, Subscription } from '@prisma/client';
import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';
import { SubscriptionModel } from './subscription.model';
import { ProductModel } from './product.model';
import { esloPaymentGateway } from '../services/payment';
import { logger } from '../utils/logger';

interface IBalanceDetails {
    quantity: number;
    unitPrice: number;
    taxAmount?: number;
    totalAmount: number;
    discountAmount?: number;
}

interface IInvoiceItem {
    id: string;
    productId?: string;
    productName: string;
    productDescription: string;
    balance: IBalanceDetails;
}

interface ICompanyDetails {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    webSite: string;
}

interface ICustomerDetails {
    id: string;
    name: string;
    address: string;
    email: string;
}

interface IBalanceSummary {
    taxAmount?: number;
    totalAmount: number;
    discountAmount?: number;
}

interface IInvoicePreview {
    id: string;
    processedAt: string;
    dueDate?: string;
    currencyCode: string;
    companyDetails: ICompanyDetails;
    balanceSummary: IBalanceSummary;
    invoiceItems: IInvoiceItem[];
    customerDetails: ICustomerDetails;
}

interface ICreateInvoiceFromStripeInput {
    subscription: Subscription;
    invoice: Stripe.Invoice;
}

interface IPayInvoiceInput {
    id: string;
    paymentProviderId: string;
    paymentProviderPaymentMethodId: string;
}

export class InvoiceModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'invoice');
    }

    public async findBySubscriptionId(subscriptionId: string): Promise<Invoice | null> {
        return this.prismaClient.invoice.findFirst({
            where: { subscriptionId },
            include: { subscription: true },
        });
    }

    // new Date(response.period_end * 1000).toUTCString()
    public async createInvoiceFromStripe(input: ICreateInvoiceFromStripeInput): Promise<void> {
        await this.prismaClient.invoice.create({
            data: {
                customerId: input.subscription.customerId,
                subscriptionId: input.subscription.id,
                paymentProviderId: input.invoice.id,
                status: 'PENDING',
                processedAt: new Date(),
                dueDate: new Date(input.invoice.period_end * 1000),
                currencyIsoCode: input.invoice.currency,
                periodStart: new Date(input.invoice.period_start * 1000),
                periodEnd: new Date(input.invoice.period_end * 1000),
                taxAmount: input.invoice.tax || 0,
                discountAmount: Number(input.invoice.discount) || 0,
                totalAmount: input.invoice.subtotal / 100,
                description: 'Stripe webhook',
                // invoiceItems:
            },
        });
    }

    public async payInvoice(input: IPayInvoiceInput): Promise<Invoice> {
        // pay
        const paydInvoice = await esloPaymentGateway.payInvoice({
            invoiceId: input.paymentProviderId,
            paymentMethodId: input.paymentProviderPaymentMethodId,
        });

        if (!paydInvoice || paydInvoice.status !== 'paid') {
            throw new Error('Error when trying pay invoice.');
        }

        // update invoice
        return this.prismaClient.invoice.update({
            data: { status: 'PAID' },
            where: { id: input.id },
        });
    }

    public async previewStripeInvoice(): Promise<IInvoicePreview | null> {
        const subscriptionModel = new SubscriptionModel(this.loggedUser);
        const productModel = new ProductModel(this.loggedUser);
        const customerPaymentSettings = await subscriptionModel.findCustomerPaymentSettings();

        if (!customerPaymentSettings) {
            return null;
            // throw new Error(`Customer payment settings not found.`);
        }

        const companyDetails: ICompanyDetails = {
            id: uuidv4(),
            name: 'eslo',
            address: 'Rua José da Cunha Claro, 739. Mogi Mirim, SP - 13806345',
            phone: '+55 19 98279 0537',
            email: 'help@eslo.com.br',
            webSite: 'www.eslo.com.br',
        };

        const response = await esloPaymentGateway.previewInvoice(customerPaymentSettings.paymentProviderId);

        if (!response) {
            // throw new Error('[previewStripeInvoice] - No response received from payment gateway');
            return null;
        }

        const invoiceItems: IInvoiceItem[] = (
            await Promise.all(
                response.lines.data.map(async (item: Stripe.InvoiceLineItem) => {
                    if (!item.price) {
                        logger.error({
                            message: 'Price not provided by payment provider',
                            subjectId: this.loggedUser.id,
                            resourceType: 'Invoice',
                            source: 'previewStripeInvoice',
                            action: 'read',
                            context: { stripeItem: item.id },
                        });
                        return [] as IInvoiceItem[];
                    }

                    const price = await productModel.findPriceByProviderId(item.price.id);

                    if (!price) {
                        logger.error({
                            message: 'Price not found for payment provider',
                            subjectId: this.loggedUser.id,
                            resourceType: 'Invoice',
                            source: 'previewStripeInvoice',
                            action: 'read',
                            context: { stripeItem: item.id, priceId: item.price.id },
                        });
                        return [] as IInvoiceItem[];
                    }

                    if (
                        item.price.unit_amount &&
                        item.price.unit_amount !== Math.round(price.unitTotalAmount.toNumber() * 100)
                    ) {
                        logger.error({
                            message: 'Price discrepancy with payment provider',
                            subjectId: this.loggedUser.id,
                            resourceType: 'Invoice',
                            source: 'previewStripeInvoice',
                            action: 'read',
                            context: {
                                stripeItem: item.id,
                                priceId: item.price.id,
                                esloPrice: price.unitTotalAmount,
                                stripePrice: item.price.unit_amount_decimal,
                            },
                        });
                    }

                    const invoiceItem: IInvoiceItem = {
                        id: item.id,
                        productId: price.product.id,
                        productName: price.product.name,
                        productDescription: price.product.description,
                        balance: {
                            quantity: item.quantity || 1,
                            unitPrice: price.unitTotalAmount.toNumber(),
                            // taxAmount:
                            // discountAmount:
                            totalAmount: item.amount / 100,
                        },
                    };

                    return [invoiceItem];
                }),
            )
        ).flat(1);

        const balanceSummary: IBalanceSummary = {
            totalAmount: response.total / 100,
            taxAmount: response.tax || 0,
        };

        // find customer infos
        const customerInfo = await this.prismaClient.user.findFirst({
            where: {
                id: this.loggedUser.id,
            },
            include: { userAddresses: true, userPhoneNumbers: true },
        });

        const address =
            customerInfo?.userAddresses && customerInfo?.userAddresses.length > 0
                ? `${customerInfo?.userAddresses[0].street}, ${customerInfo?.userAddresses[0].streetNumber}. ${customerInfo?.userAddresses[0].state} ${customerInfo?.userAddresses[0].postalCode}`
                : '';

        const customerDetails: ICustomerDetails = {
            id: this.loggedUser.id,
            name: `${this.loggedUser.firstName} ${this.loggedUser.familyName}`,
            address,
            email: this.loggedUser.primaryEmail,
        };

        const stripeInvoice: IInvoicePreview = {
            id: uuidv4(),
            processedAt: new Date().toUTCString(),
            dueDate: new Date(response.period_end * 1000).toUTCString(),
            currencyCode: response.currency,
            companyDetails,
            invoiceItems,
            balanceSummary,
            customerDetails,
        };

        return stripeInvoice;
    }
}
