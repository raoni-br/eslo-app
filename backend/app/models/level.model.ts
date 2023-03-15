import { Level } from '@prisma/client';

import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';

export class LevelModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'lms');
    }

    public async findById(id: string): Promise<Level | null> {
        const level = await this.prismaClient.level.findUnique({
            where: { id },
        });

        if (!level) {
            return null;
        }

        await this.validateIAM({
            action: 'read',
            resourceType: 'Level',
            resource: level,
        });

        return level;
    }

    public async findByModule(moduleId: string): Promise<Level[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Level',
        });

        return this.prismaClient.level.findMany({
            where: {
                AND: { ...iamPermission.filter },
                moduleId,
            },
            orderBy: { moduleOrder: 'asc' },
        });
    }
}
