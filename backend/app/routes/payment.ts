import express, { Request, Response } from 'express';
import Stripe from 'stripe';

import { SubscriptionModel } from '../models/subscription.model';

import { logger } from '../utils/logger';
import { UserProfileModel } from '../models/user-profile.model';
import { InvoiceModel } from '../models/invoice.model';

export const paymentRouter = express.Router();

paymentRouter.post('/invoice', async (req: Request, res: Response) => {
    try {
        const event = req.body;
        const invoice = event.data.object as Stripe.Invoice;

        switch (event.type) {
            case 'invoice.created': {
                logger.info({
                    message: 'Stripe event received',
                    source: 'stripeInvoiceWebhook',
                    context: {
                        eventType: event.type,
                        invoice: invoice.id,
                        paymentStatus: invoice.status,
                    },
                });

                if (invoice.subscription && typeof invoice.subscription === 'string') {
                    // find subscription
                    const subscriptionModel = new SubscriptionModel(UserProfileModel.getSystemUser('payment'));
                    const subscription = await subscriptionModel.findByPaymentProviderId(invoice.subscription);

                    if (subscription) {
                        // create invoice
                        const invoiceModel = new InvoiceModel(UserProfileModel.getSystemUser('payment'));
                        await invoiceModel.createInvoiceFromStripe({
                            invoice,
                            subscription,
                        });

                        return res.status(200).send({ received: true });
                    }
                }

                return res.status(200).send({ received: true });
            }

            default:
                logger.warn({
                    message: 'Unhandled stripe event received',
                    source: 'stripeInvoiceWebhook',
                    context: {
                        eventType: event.type,
                        invoice: invoice.id,
                        invoiceStatus: invoice.status,
                    },
                });
                return res.status(200).send({ received: true });
        }
    } catch (error: any) {
        logger.error({
            message: 'Payment webhook error',
            errorDetails: error.message,
            source: 'stripeInvoiceWebhook',
        });
        return res.status(400).send({ received: false });
    }
});

paymentRouter.post('/checkout', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    try {
        const event = req.body;
        const checkout = event.data.object as Stripe.Checkout.Session;

        switch (event.type) {
            case 'checkout.session.completed': {
                logger.info({
                    message: 'Stripe event received',
                    source: 'stripeCheckoutWebhook',
                    context: {
                        eventType: event.type,
                        checkout: checkout.id,
                        // paymentStatus: checkout.payment_status,
                    },
                });

                if (checkout.mode === 'setup') {
                    const subscriptionModel = new SubscriptionModel(UserProfileModel.getSystemUser('payment'));
                    await subscriptionModel.updateCustomerPaymentSettings(checkout);

                    if (checkout.metadata && checkout.metadata.subscriptionId) {
                        // activate subscription
                        subscriptionModel.activateSubscriptionFromProvider(checkout.metadata!.subscriptionId);
                    }

                    return res.status(200).send({ received: true });
                }

                return res.status(200).send({ received: true });
            }

            default:
                logger.warn({
                    message: 'Unhandled stripe event received',
                    source: 'stripeCheckoutWebhook',
                    context: {
                        eventType: event.type,
                        checkout: checkout.id,
                        // paymentStatus: checkout.payment_status,
                    },
                });
                return res.status(200).send({ received: true });
        }
    } catch (error: any) {
        logger.error({
            message: 'Payment webhook error',
            errorDetails: error.message,
            source: 'stripeCheckoutWebhook',
        });
        return res.status(400).send({ received: false });
    }
});

// paymentRouter.post('/checkout', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
//     try {
//         const event = req.body;
//         const checkout = event.data.object as Stripe.Checkout.Session;

//         switch (event.type) {
//             case 'checkout.session.completed': {
//                 logger.info({
//                     message: 'Stripe event received',
//                     source: 'stripeCheckoutWebhook',
//                     context: {
//                         eventType: event.type,
//                         checkout: checkout.id,
//                         paymentStatus: checkout.payment_status,
//                     },
//                 });
//                 if (checkout.payment_status === 'paid') {
//                     const subscriptionModel = new SubscriptionModel(UserProfileModel.getSystemUser('payment'));
//                     await subscriptionModel.activateSubscriptionFromProvider(checkout);
//                     return res.status(200).send({ received: true });
//                 }

//                 return res.status(200).send({ received: true });
//             }

//             default:
//                 logger.warn({
//                     message: 'Unhandled stripe event received',
//                     source: 'stripeCheckoutWebhook',
//                     context: {
//                         eventType: event.type,
//                         checkout: checkout.id,
//                         paymentStatus: checkout.payment_status,
//                     },
//                 });
//                 return res.status(200).send({ received: true });
//         }
//     } catch (error) {
//         logger.error({
//             message: 'Payment webhook error',
//             errorDetails: error.message,
//             source: 'stripeCheckoutWebhook',
//         });
//         return res.status(400).send({ received: false });
//     }
// });
