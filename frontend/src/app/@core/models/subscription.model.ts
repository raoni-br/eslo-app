import { Enrollment } from './enrollment.model';
import { UserProfile } from './user-profile.model';

export interface Subscription {
    id?: string;
    status?: string;
    customerId?: string;
    paymentProviderId?: string;
    paymentProviderCheckoutId?: string;
    renewalDate?: string;
    customer?: UserProfile;
    subscriptionItems?: SubscriptionItem[];
    enrollments?: Enrollment[];
    freeTrial?: IFreeTrial;
}

export interface IFreeTrial {
    trialStartedAt: string;
    trialEndedAt: string;
    expiringInDays: string;
}

export interface SubscriptionItem {
    id?: string;
    subscriptionId?: string;
    priceId?: string;
    quantity?: number;
    active?: boolean;
}
