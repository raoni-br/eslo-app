import { PrismaPromise } from '@prisma/client';

import { prismaClient } from '..';
import modules from './seeders_data/v1.0.0/json/module.json';

function insertModules(): PrismaPromise<any>[] {
    return modules.map((module) =>
        prismaClient.module.upsert({
            where: { id: module.id },
            update: {},
            create: {
                id: module.id,
                code: module.code,
                name: module.name,
                description: module.description,
                programOrder: parseInt(module.program_order, 10),
                programId: module.program_id,
                releasedAt: new Date(),
                createdAt: new Date(),
            },
        }),
    );
}

function deleteModules(): PrismaPromise<any> {
    return prismaClient.module.deleteMany({
        where: {
            id: {
                in: modules.map((module) => module.id),
            },
        },
    });
}

export { insertModules, deleteModules };
