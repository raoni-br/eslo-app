import axios, { AxiosInstance } from 'axios';
import { Prisma } from '@prisma/client';

import { esloConfig } from '../../secrets';
import { UserWithSubscription } from '../../models/user-profile.model';
import { logger } from '../../utils/logger';

export type ActionTypes =
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'list'
    | 'cancel'
    | 'complete'
    | 'activate'
    | 'bulk_update'
    | 'bulk_insert';

export type PolicyType =
    | 'admin'
    | 'calendar'
    | 'class_record'
    | 'classroom'
    | 'dashboard'
    | 'enrollment'
    | 'invitation'
    | 'invoice'
    | 'lms'
    | 'product'
    | 'student'
    | 'study_group'
    | 'subscription'
    | 'user_profile';

export interface EsloPolicyInput {
    user: UserWithSubscription;
    policy: PolicyType;
    action: ActionTypes;
    resourceType: Prisma.ModelName;
    resource?: any;
    context?: any;
}

interface EsloPolicyResult {
    allow: boolean;
    metadata?: any;
    errors?: string[];
    filter?: { [key: string]: object };
    omitFields?: string[];
}

export type ApiAccess = {
    queries: { [key: string]: boolean };
    mutations: { [key: string]: boolean };
};

export class EsloIAM {
    private iamAgent: AxiosInstance | undefined;

    constructor() {
        if (esloConfig.iamAgentEnabled && esloConfig.iamAgentUrl) {
            this.iamAgent = axios.create({
                baseURL: esloConfig.iamAgentUrl,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${esloConfig.iamAgentToken}`,
                },
            });
        }
    }

    // type IFilter =
    public static policyFilterToPrisma(filters: { [key: string]: object } | undefined): object {
        // no filter or empty condition (equivalent to no filter)

        if (!filters) {
            return {};
        }

        const filtersList = Object.keys(filters).map((key) => filters[key]);

        // Object.keys filters.some((filter) => Object.keys(filter).length === 0)
        switch (filtersList.length) {
            case 0:
                return {};
            case 1:
                return filtersList[0];
            default:
                return { OR: filtersList };
        }
    }

    public async getRoles(user: UserWithSubscription): Promise<string[]> {
        if (!this.iamAgent) {
            return ['teacher'];
        }

        if (!user) {
            return [];
        }

        const response = await this.iamAgent.post(`/data/app/user/roles`, { input: { user } }).catch((err) => {
            logger.error({
                message: 'IAM API - Roles',
                subjectId: user.id,
                errorDetails: err.message,
                source: 'esloIAM.getRoles',
            });
            throw new Error('IAM Agent - Error retrieving roles');
        });

        if (!response?.data) {
            return [];
        }

        const roles = response.data.result as string[];
        return roles;
    }

    public async getApiAccess(user: UserWithSubscription): Promise<ApiAccess> {
        if (!this.iamAgent) {
            // if not enabled will deny access to all queries/mutations
            return {
                queries: {},
                mutations: {},
            };
        }

        if (!user) {
            return {
                queries: {},
                mutations: {},
            };
        }

        const response = await this.iamAgent
            .post(`/data/app/api/graphql/introspect`, { input: { user } })
            .catch((err) => {
                logger.error({
                    message: 'IAM API - GraphQL Introspect',
                    subjectId: user.id,
                    errorDetails: err.message,
                    source: 'esloIAM',
                });
                throw new Error('IAM Agent - Error retrieving GraphQL Introspect');
            });

        if (!response?.data) {
            return {
                queries: {},
                mutations: {},
            };
        }

        const apiAccess = response.data.result as ApiAccess;
        return apiAccess;
    }

    public async validate(input: EsloPolicyInput): Promise<EsloPolicyResult> {
        if (!this.iamAgent) {
            return {
                allow: true,
            };
        }

        const response = await this.iamAgent.post(`/data/app/${input.policy}`, { input }).catch((err) => {
            logger.error({
                message: 'IAM API - Validate',
                subjectId: input.user.id,
                errorDetails: err.message,
                source: 'esloIAM',
                context: {
                    policy: input.policy,
                    action: input.action,
                    resourceType: input.resourceType,
                    resource: input.resource?.id,
                    error: err,
                },
            });

            throw new Error('IAM Agent - Error validating permissions');
        });

        if (!response?.data) {
            return {
                allow: false,
            };
        }

        const policyResult = response.data.result as EsloPolicyResult;
        return policyResult;
    }
}

const esloIAM = new EsloIAM();
export { esloIAM };
