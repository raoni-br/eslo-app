import { Prisma, PrismaClient, SourceType } from '@prisma/client';
import { ForbiddenError } from 'apollo-server-express';

import { prismaClient } from '../prisma';
import { EsloIAM, esloIAM, ActionTypes, PolicyType } from '../services/iam-client';
import { logger } from '../utils/logger';

import { UserWithSubscription } from './user-profile.model';

export interface ISourceInput {
    sourceType: SourceType;
    sourceId: string;
}

export interface IProviderInfo {
    providerCode: string;
    providerId: string;
    details?: any;
}

export interface ILayoutSettings {
    svgImageUrl?: string;
    icon?: string;
    primaryColour: string; // hex
    secondaryColour: string; // hex
}

export interface IAMPolicy {
    filter?: any;
    omitFields?: string[];
    metadata?: any;
}

export interface IValidateIAMInput {
    action: ActionTypes;
    resourceType: Prisma.ModelName;
    resource?: any;
    context?: any;
}

export abstract class EsloModel {
    protected readonly policy: PolicyType;

    protected loggedUser: UserWithSubscription;

    protected readonly prismaClient: PrismaClient;

    constructor(loggedUser: UserWithSubscription, policy: PolicyType) {
        this.policy = policy;
        this.loggedUser = loggedUser;
        this.prismaClient = prismaClient;
    }

    protected async validateIAM(input: IValidateIAMInput): Promise<IAMPolicy> {
        const policyResult = await esloIAM.validate({
            user: this.loggedUser,
            policy: this.policy,
            ...input,
        });

        if (!policyResult.allow) {
            logger.warn({ message: 'ACCESS_ERROR', context: { input, policyResult } });
            const forbiddenMessage = `You do not have access to ${input.action} ${input.resourceType}`;
            throw new ForbiddenError(policyResult.errors?.join('\n') || forbiddenMessage);
        }

        const filter = EsloIAM.policyFilterToPrisma(policyResult.filter);

        return {
            filter,
            omitFields: policyResult.omitFields,
            metadata: policyResult.metadata,
        };
    }
}
