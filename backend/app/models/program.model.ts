import { Program } from '@prisma/client';

import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';

export class ProgramModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'lms');
    }

    public async findById(id: string): Promise<Program | null> {
        const program = await this.prismaClient.program.findUnique({
            where: { id },
        });

        if (!program) {
            return null;
        }

        await this.validateIAM({
            action: 'read',
            resourceType: 'Program',
            resource: program,
        });

        return program;
    }

    public async findAll(): Promise<Program[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Program',
        });

        return this.prismaClient.program.findMany({ where: { AND: { ...iamPermission.filter } } });
    }
}
