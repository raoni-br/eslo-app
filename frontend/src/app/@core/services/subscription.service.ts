import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Invoice } from '../models/invoice.model';
import { Product, IProductFilters } from '../models/product.model';
import { PRODUCT_DETAILS } from '../graphql/product.graphql';
import { CUSTOMER_PAYMENT_SETTINGS, SUBSCRIPTION, SUBSCRIPTION_SUMMARY } from '../graphql/subscription.graphql';
import { INVOICE_DETAILS } from '../graphql/invoice.graphql';
import { Subscription } from '../models/subscription.model';

interface IGetInvoicePreview {
    invoicePreview: Invoice | null;
}

interface IGetProducts {
    products: Product[];
}

interface IGetUserSubscriptions {
    userSubscriptions: Subscription[];
}

interface ICreateSubscriptionCheckoutMutation {
    createSubscriptionCheckout: Subscription;
}

interface ICreateSubscriptionMutation {
    createSubscription: Subscription;
}

export interface ISubscriptionItemInput {
    priceId: string;
    quantity: number;
}

export interface ICreateSubscriptionCheckoutInput {
    checkoutItems: ISubscriptionItemInput[];
}

interface ICreateSubscriptionInput {
    type: string;
    subscriptionItems: ISubscriptionItemInput[];
}

export interface ICreatePaymentMethod {
    id: string;
    paymentProviderCheckoutSessionId: string;
    paymentProviderPaymentMethodId: string;
    userId: string;
}
interface ICreatePaymentMethodCheckoutMutation {
    createPaymentMethodCheckoutMutation: ICreatePaymentMethod;
}

interface IActivateAndUpgradeSubscriptionInput {
    subscriptionId: string;
    subscriptionItems: ISubscriptionItemInput[];
}

interface IActivateAndUpgradeSubscriptionMutation {
    activateAndUpgradeSubscription: ICustomerPaymentSettings | ISubscription;
}

export interface ICustomerPaymentSettings {
    id: string;
    userId: string;
    paymentProviderPaymentMethodId: string;
    paymentProviderCheckoutSessionId: string;
}
export interface ISubscription {
    id: string;
    status: string;
    paymentProviderId: string;
}

@Injectable({
    providedIn: 'root',
})
export class SubscriptionService {
    constructor(private apollo: Apollo) {}

    getInvoicePreview(): Observable<Invoice | null> {
        return this.apollo
            .query<IGetInvoicePreview>({
                query: gql`
                    {
                        invoicePreview {
                            ...invoiceDetails
                        }
                    }
                    ${INVOICE_DETAILS}
                `,
            })
            .pipe(map((result: ApolloQueryResult<IGetInvoicePreview>) => result.data.invoicePreview));
    }

    getProducts(productFilters?: IProductFilters) {
        return this.apollo
            .query<IGetProducts>({
                query: gql`
                    query ProductsQuery($productFilters: ProductFilters) {
                        products(productFilters: $productFilters) {
                            ...productDetails
                        }
                    }
                    ${PRODUCT_DETAILS}
                `,
                variables: {
                    productFilters,
                },
            })
            .pipe(map((result: ApolloQueryResult<IGetProducts>) => result.data.products));
    }

    createFreeTrialSubscription(priceId: string) {
        const subscriptionInput: ICreateSubscriptionInput = {
            type: 'FREE_TRIAL',
            subscriptionItems: [
                {
                    priceId,
                    quantity: 1,
                },
            ],
        };

        return this.apollo
            .mutate<ICreateSubscriptionMutation>({
                mutation: gql`
                    mutation createSubscriptionMutation($subscriptionInput: CreateSubscriptionInput) {
                        createSubscription(subscriptionInput: $subscriptionInput) {
                            ...subscriptionSummary
                        }
                    }
                    ${SUBSCRIPTION_SUMMARY}
                `,
                variables: {
                    subscriptionInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<ICreateSubscriptionMutation>) => {
                    return result.data.createSubscription;
                }),
            );
    }

    getUserSubscriptions(): Observable<Subscription[]> {
        return this.apollo
            .query<IGetUserSubscriptions>({
                query: gql`
                    query UserSubscriptionsQuery {
                        userSubscriptions {
                            ...subscriptionSummary
                        }
                    }
                    ${SUBSCRIPTION_SUMMARY}
                `,
            })
            .pipe(map((result: ApolloQueryResult<IGetUserSubscriptions>) => result.data.userSubscriptions));
    }

    createSubscriptionCheckout(subscriptionCheckoutInput: ICreateSubscriptionCheckoutInput) {
        return this.apollo
            .mutate<ICreateSubscriptionCheckoutMutation>({
                mutation: gql`
                    mutation createSubscriptionCheckoutMutation(
                        $subscriptionCheckoutInput: CreateSubscriptionCheckoutInput
                    ) {
                        createSubscriptionCheckout(subscriptionCheckoutInput: $subscriptionCheckoutInput) {
                            ...subscriptionSummary
                        }
                    }
                    ${SUBSCRIPTION_SUMMARY}
                `,
                variables: {
                    subscriptionCheckoutInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<ICreateSubscriptionCheckoutMutation>) => {
                    return result.data.createSubscriptionCheckout;
                }),
            );
    }

    createPaymentMethodCheckoutMutation(type: string) {
        return this.apollo
            .mutate<ICreatePaymentMethodCheckoutMutation>({
                mutation: gql`
                    mutation createPaymentMethodCheckoutMutation($type: String) {
                        createPaymentMethodCheckoutMutation(type: $type) {
                            id
                            userId
                            paymentProviderPaymentMethodId
                            paymentProviderCheckoutSessionId
                        }
                    }
                `,
                variables: {
                    type,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<ICreatePaymentMethodCheckoutMutation>) => {
                    return result.data.createPaymentMethodCheckoutMutation;
                }),
            );
    }

    activateAndUpgradeSubscriptionMutation(activateAndUpgradeSubscriptionInput: IActivateAndUpgradeSubscriptionInput) {
        return this.apollo
            .mutate<IActivateAndUpgradeSubscriptionMutation>({
                mutation: gql`
                    mutation activateAndUpgradeSubscriptionMutation(
                        $activateAndUpgradeSubscriptionInput: ActivateAndUpgradeSubscriptionInput
                    ) {
                        activateAndUpgradeSubscription(
                            activateAndUpgradeSubscriptionInput: $activateAndUpgradeSubscriptionInput
                        ) {
                            ...Subscription
                            ...CustomerPaymentSettings
                        }
                    }
                    ${SUBSCRIPTION}
                    ${CUSTOMER_PAYMENT_SETTINGS}
                `,
                variables: {
                    activateAndUpgradeSubscriptionInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<IActivateAndUpgradeSubscriptionMutation>) => {
                    return result.data.activateAndUpgradeSubscription;
                }),
            );
    }

    getSubscriptionById(id: string) {
        return this.apollo.watchQuery<any>({
            query: gql`
                query SubscriptionQuery($id: ID) {
                    subscription(id: $id) {
                        ...subscriptionSummary
                    }
                }
                ${SUBSCRIPTION_SUMMARY}
            `,
            pollInterval: 5000,
            variables: {
                id,
            },
        });
    }

    getSubscriptionByCheckoutId(checkoutId: string) {
        return this.apollo.watchQuery<any>({
            query: gql`
                query SubscriptionQueryByStripeCheckoutId($checkoutId: ID) {
                    subscriptionByStripeCheckoutId(checkoutId: $checkoutId) {
                        ...subscriptionSummary
                    }
                }
                ${SUBSCRIPTION_SUMMARY}
            `,
            pollInterval: 5000,
            variables: {
                checkoutId,
            },
        });
    }
}
