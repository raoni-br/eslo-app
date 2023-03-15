import { PrismaPromise } from '@prisma/client';

import { prismaClient } from '..';
import levels from './seeders_data/v1.0.0/json/level.json';

function insertLevels(): PrismaPromise<any>[] {
    return levels.map((level) =>
        prismaClient.level.upsert({
            where: { id: level.id },
            update: {},
            create: {
                id: level.id,
                code: level.code,
                name: level.name,
                description: level.description,
                label: level.label,
                moduleOrder: parseInt(level.module_order, 10),
                moduleId: level.module_id,
                providerInfo: JSON.stringify({
                    providerCode: level.provider_code,
                    providerId: level.provider_id,
                }),
                layoutSettings: JSON.stringify({
                    svgImageUrl: level.svg_image_url,
                    icon: level.icon,
                    primaryColour: level.primary_colour,
                    secondaryColour: level.secondary_colour,
                }),
                createdAt: new Date(),
            },
        }),
    );
}

function deleteLevels(): PrismaPromise<any> {
    return prismaClient.level.deleteMany({
        where: {
            id: {
                in: levels.map((level) => level.id),
            },
        },
    });
}

export { insertLevels, deleteLevels };
