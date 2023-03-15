import { Module } from '@prisma/client';

import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';

export class ModuleModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'lms');
    }

    public async findById(id: string): Promise<Module | null> {
        const module = await this.prismaClient.module.findUnique({
            where: { id },
        });

        if (!module) {
            return null;
        }

        await this.validateIAM({
            action: 'read',
            resourceType: 'Module',
            resource: module,
        });

        return module;
    }

    public async findByProgram(programId: string): Promise<Module[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Module',
        });

        return this.prismaClient.module.findMany({
            where: {
                AND: { ...iamPermission.filter },
                programId,
            },
            orderBy: { programOrder: 'asc' },
        });
    }
}
