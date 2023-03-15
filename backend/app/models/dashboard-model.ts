import { EnrollmentStatus, SubscriptionStatus } from '@prisma/client';
import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';

interface IDashboard {
    id: string; // loggedUser
    enrollmentStatus?: EnrollmentStatus;
    subscriptionsStatus?: SubscriptionStatus;
    subscriptionsExpiringInDays?: number;
}

export interface ISubscriptionsStatusFilters {
    subscriptionsStatus?: SubscriptionStatus;
    subscriptionsExpiringInDays?: number;
}

interface IDashboardFIlters extends ISubscriptionsStatusFilters {
    enrollmentStatus?: EnrollmentStatus;
}

export class DashboardModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'dashboard');
    }

    public async getDashboard(filters: IDashboardFIlters): Promise<IDashboard> {
        const dashboard: IDashboard = {
            id: this.loggedUser.id,
            enrollmentStatus: filters.enrollmentStatus,
            subscriptionsStatus: filters.subscriptionsStatus,
            subscriptionsExpiringInDays: filters.subscriptionsExpiringInDays,
        };

        return dashboard;
    }
}
