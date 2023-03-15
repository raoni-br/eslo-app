import { PrismaPromise } from '@prisma/client';

import { prismaClient } from '..';
import programs from './seeders_data/v1.0.0/json/program.json';

function insertPrograms(): PrismaPromise<any>[] {
    return programs.map((program) =>
        prismaClient.program.upsert({
            where: { id: program.id },
            update: {},
            create: {
                id: program.id,
                code: program.code,
                name: program.name,
                icon: program.icon,
                label: program.label,
                description: program.description,
                providerInfo: JSON.stringify({
                    providerCode: program.provider_code,
                    providerId: program.provider_id,
                }),
                releasedAt: new Date(),
                removedAt: null,
                createdAt: new Date(),
            },
        }),
    );
}

function deletePrograms(): PrismaPromise<any> {
    return prismaClient.program.deleteMany({
        where: {
            id: {
                in: programs.map((program) => program.id),
            },
        },
    });
}

export { insertPrograms, deletePrograms };
