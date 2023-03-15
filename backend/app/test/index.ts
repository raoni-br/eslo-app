import {
    PriceType,
    Prisma,
    PrismaClient,
    ProductCategory,
    ProductSubcategory,
    StudyGroup,
    Subscription,
    SubscriptionItem,
    User,
} from '@prisma/client';

import { prismaClient } from '../prisma';
import { logger } from '../utils/logger';

import { insertPrograms } from '../prisma/seeders/0010-create-programs';
import { insertModules } from '../prisma/seeders/0020-create-modules';
import { insertLevels } from '../prisma/seeders/0030-create-levels';
import { insertLessons } from '../prisma/seeders/0040-create-lessons';
import { UserWithSubscription } from '../models/user-profile.model';

class EsloTest {
    public prismaClient: PrismaClient;

    public userTeacherA: UserWithSubscription = {
        id: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        primaryEmail: 'teacher.a@eslo.com.br',
        firstName: 'Teacher',
        familyName: 'A',
        displayName: 'Teacher A',
        profilePicUrl: null,
        dateOfBirth: null,
        gender: null,
        banned: false,
        bannedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        subscriptions: [],
        studentEnrollments: [],
    };

    public userTeacherASubscription: Subscription = {
        id: '98c74bdb-85ca-484e-b40c-a4acf51213de',
        customerId: this.userTeacherA.id,
        autoRenew: true,
        status: 'ACTIVE',
        startedAt: new Date(),
        trialStartedAt: null,
        trialEndedAt: null,
        paymentProviderId: 'sub_stripe_gen_id_18',
        cancelledAutoRenewAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    public userTeacherB: UserWithSubscription = {
        id: '6bbc5054-2709-4d97-8057-8d46c4b95219',
        primaryEmail: 'teacher.b@b.com.br',
        firstName: 'Teacher',
        familyName: 'B',
        displayName: 'Teacher B',
        profilePicUrl: null,
        dateOfBirth: null,
        gender: null,
        banned: false,
        bannedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        subscriptions: [],
        studentEnrollments: [],
    };

    public userTeacherBSubscription: Subscription = {
        id: '0244d7ab-4b54-4c85-8f12-c09f768f2069',
        customerId: this.userTeacherB.id,
        autoRenew: true,
        status: 'ACTIVE',
        startedAt: new Date(),
        trialStartedAt: null,
        trialEndedAt: null,
        paymentProviderId: 'sub_stripe_gen_id_19',
        cancelledAutoRenewAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    public userStudentA: UserWithSubscription = {
        id: '37346d1c-0565-4141-99a5-db9c37a8a2e8',
        primaryEmail: 'student.a@eslo.com.br',
        firstName: 'Student',
        familyName: 'A',
        displayName: 'Student A',
        profilePicUrl: null,
        dateOfBirth: null,
        gender: null,
        banned: false,
        bannedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        subscriptions: [],
        studentEnrollments: [],
    };

    public userStudentASubscription: Subscription = {
        id: '29c5fc25-c45c-4b8a-b693-57d51158f327',
        customerId: this.userStudentA.id,
        autoRenew: true,
        status: 'ACTIVE',
        startedAt: new Date(),
        trialStartedAt: null,
        trialEndedAt: null,
        paymentProviderId: 'sub_stripe_gen_id_20',
        cancelledAutoRenewAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    public userStudentB: UserWithSubscription = {
        id: '9058ed93-f776-42bd-8358-bc319f9851b1',
        primaryEmail: 'student.a@b.com.br',
        firstName: 'Student',
        familyName: 'A',
        displayName: 'Student A',
        profilePicUrl: null,
        dateOfBirth: null,
        gender: null,
        banned: false,
        bannedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        subscriptions: [],
        studentEnrollments: [],
    };

    public userStudentBSubscription: Subscription = {
        id: 'e81f00a2-d568-4e0b-a524-06cb79b190d9',
        customerId: this.userStudentB.id,
        autoRenew: true,
        status: 'ACTIVE',
        startedAt: new Date(),
        trialStartedAt: null,
        trialEndedAt: null,
        paymentProviderId: 'sub_stripe_gen_id_20',
        cancelledAutoRenewAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    public userAdminA: UserWithSubscription = {
        id: '228c1ce1-d09a-4266-a785-07204fe35a2a',
        primaryEmail: 'admin.a@eslo.com.br',
        firstName: 'Admin',
        familyName: 'A',
        displayName: 'Admin A',
        profilePicUrl: null,
        dateOfBirth: null,
        gender: null,
        banned: false,
        bannedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        subscriptions: [],
        studentEnrollments: [],
    };

    public testStudyGroup: StudyGroup = {
        id: '59bb7e88-087c-4f71-8617-36f16388bcfc',
        name: 'test',
        levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: null,
    };

    public testTeacherCategory: ProductCategory = {
        code: 'teacher_licence',
        name: 'Teacher Licence',
        description: 'Licence that grant teacher permissions to a user',
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    public testTeacherSubcategory: ProductSubcategory = {
        code: 'teacher_smart',
        categoryCode: 'teacher_licence',
        name: 'Teacher Smart Licence',
        description: 'Licence that grant private teachers access to the platform',
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    public testTeacherProduct = {
        id: 'ae6dcc45-aad9-406d-b48d-ca2fe76537ed',
        name: 'teacher test product',
        description: 'teacher test product',
        slug: 'teacher-test-product',
        subcategoryCode: 'teacher_smart',
        objectSettings: Prisma.DbNull,
        images: Prisma.DbNull,
        active: true,
        paymentProviderId: '591e6399-8ab5-48f2-9759-a440ff95b165',
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    public testTeacherProductPrice = {
        id: '87b1af1a-f3ba-45ab-8350-d700d99a6eaf',
        productId: this.testTeacherProduct.id,
        name: 'teacher test price',
        description: 'teacher test price',
        slug: 'teacher-test-price',
        taxAmount: 0 as unknown as Prisma.Decimal,
        unitTotalAmount: 100 as unknown as Prisma.Decimal,
        currencyIsoCode: 'BRL',
        type: 'RECURRING' as PriceType,
        recurrence: 'FREQ=MONTHLY;INTERVAL=1',
        subscriptionPeriod: Prisma.DbNull,
        active: true,
        paymentProviderId: 'cef1d335-c5e7-4e0a-ad50-a4c62958122c',
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        completedAt: null,
    };

    public userTeacherASubscriptionItems: SubscriptionItem = {
        id: '126f6d72-5a02-4eb3-ade3-b37e006fecac',
        subscriptionId: this.userTeacherASubscription.id,
        priceId: this.testTeacherProductPrice.id,
        autoRenew: true,
        cancelledAutoRenewAt: null,
        quantity: 1,
        active: true,
        paymentProviderId: 'a03e1c22-664c-4f59-ac82-6ef73741c7e8',
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        completedAt: null,
    };

    constructor() {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Eslo test class can only be instantiated in test mode');
        }

        this.prismaClient = prismaClient;
        EsloTest.createCourses();
    }

    public async createTestUsers(): Promise<void> {
        // remove subscriptions from users (prisma doesn't need that)
        const usersWithSubscription = [this.userTeacherA, this.userTeacherB, this.userStudentA, this.userAdminA];
        const usersWithoutSubscription = usersWithSubscription.map((user: UserWithSubscription): User => {
            return {
                id: user.id,
                primaryEmail: user.primaryEmail,
                firstName: user.firstName,
                familyName: user.familyName,
                displayName: user.displayName,
                profilePicUrl: null,
                dateOfBirth: null,
                gender: null,
                banned: false,
                bannedAt: null,
                createdAt: new Date(),
                updatedAt: null,
                deletedAt: null,
            };
        });

        await this.prismaClient.user.createMany({
            data: usersWithoutSubscription,
        });
    }

    public async createUsersSubscriptions(): Promise<void> {
        await this.prismaClient.subscription.createMany({
            data: [this.userTeacherASubscription, this.userTeacherBSubscription, this.userStudentASubscription],
        });
    }

    public async createProductCategories(): Promise<void> {
        await this.prismaClient.productCategory.createMany({
            data: [this.testTeacherCategory],
        });
    }

    public async createProductSubCategories(): Promise<void> {
        await this.prismaClient.productSubcategory.createMany({
            data: [this.testTeacherSubcategory],
        });
    }

    public async createProducts(): Promise<void> {
        await this.prismaClient.product.createMany({
            data: [this.testTeacherProduct],
        });
    }

    public async createProductsPrices(): Promise<void> {
        await this.prismaClient.price.createMany({
            data: [this.testTeacherProductPrice],
        });
    }

    public async createUsersSubscriptionsItems(): Promise<void> {
        await this.prismaClient.subscriptionItem.createMany({
            data: [this.userTeacherASubscriptionItems],
        });
    }

    public async resetDB(): Promise<boolean> {
        try {
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."User" CASCADE;`;
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."Enrollment" CASCADE;`;
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."StudyGroup" CASCADE;`;
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."Event" CASCADE;`;
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."Subscription" CASCADE;`;
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."Product" CASCADE;`;
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."ProductCategory" CASCADE;`;
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."ProductSubcategory" CASCADE;`;
            await this.prismaClient.$queryRaw`TRUNCATE TABLE public."Price" CASCADE;`;

            return true;
        } catch (error: any) {
            logger.error({
                message: 'Error truncating DB',
                errorDetails: error.message,
                source: 'esloTest',
            });
            return false;
        }
    }

    private static async createCourses(): Promise<boolean> {
        try {
            await Promise.all(insertPrograms());
            await Promise.all(insertModules());
            await Promise.all(insertLevels());
            await Promise.all(insertLessons());

            return true;
        } catch (error: any) {
            logger.error({
                message: 'Error createCourses',
                errorDetails: error.message,
                source: 'esloTest',
            });

            return false;
        }
    }
}

export const esloTest = new EsloTest();
