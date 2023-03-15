import { gql } from 'apollo-angular';

export const SUBSCRIPTION_SUMMARY = gql`
    fragment subscriptionSummary on Subscription {
        id
        customerId
        paymentProviderId
        paymentProviderCheckoutId
        subscriptionItems {
            id
            subscriptionId
            priceId
            quantity
            active
        }
        status
        freeTrial {
            trialStartedAt
            trialEndedAt
            expiringInDays
        }
    }
`;

export const SUBSCRIPTION = gql`
    fragment Subscription on Subscription {
        id
        status
        paymentProviderId
    }
`;

export const CUSTOMER_PAYMENT_SETTINGS = gql`
    fragment CustomerPaymentSettings on CustomerPaymentSettings {
        id
        userId
        paymentProviderPaymentMethodId
        paymentProviderCheckoutSessionId
    }
`;
