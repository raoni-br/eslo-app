import * as argon2 from 'argon2';

import { prismaClient } from '..';

async function insertUserAdmins(): Promise<any[]> {
    const results = await Promise.all([
        prismaClient.user.upsert({
            where: { id: '8bdc2430-7a75-48b3-a5e3-f09eb17ed861' },
            update: {},
            create: {
                id: '8bdc2430-7a75-48b3-a5e3-f09eb17ed861',
                primaryEmail: 'raoni@eslo.com.br',
                firstName: 'Raoni',
                familyName: 'Araujo',
                displayName: 'Raoni',
                createdAt: new Date(),
                userAuthenticationList: {
                    create: {
                        id: '5cddcf26-ab58-4fc0-84a2-942c7cd0d0f5',
                        strategyCode: 'LOCAL',
                        strategyId: 'raoni@eslo.com.br',
                        status: 'ACTIVE',
                        hashedPassword: await argon2.hash('!limaoMeiolimao2limoes', { type: argon2.argon2id }),
                        createdAt: new Date(),
                    },
                },
            },
        }),
        prismaClient.user.upsert({
            where: { id: '766427c4-8947-454c-9cd9-adb667b37603' },
            update: {},
            create: {
                id: '766427c4-8947-454c-9cd9-adb667b37603',
                primaryEmail: 'renato@eslo.com.br',
                firstName: 'Renato',
                familyName: 'Araujo',
                displayName: 'Renato',
                createdAt: new Date(),
                userAuthenticationList: {
                    create: {
                        id: 'd52ecdde-0895-42fb-ad19-bc4a09297750',
                        strategyCode: 'LOCAL',
                        strategyId: 'renato@eslo.com.br',
                        status: 'ACTIVE',
                        hashedPassword: await argon2.hash('!limaoMeiolimao2limoes', { type: argon2.argon2id }),
                        createdAt: new Date(),
                    },
                },
            },
        }),
    ]);

    return results;
}

function deleteUserAdmins(): Promise<any> {
    return prismaClient.user.deleteMany({
        where: {
            id: {
                in: ['8bdc2430-7a75-48b3-a5e3-f09eb17ed861', '766427c4-8947-454c-9cd9-adb667b37603'],
            },
        },
    });
}

export { insertUserAdmins, deleteUserAdmins };
