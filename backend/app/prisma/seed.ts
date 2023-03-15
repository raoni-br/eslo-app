import { prismaClient } from './index';

import { insertPrograms } from './seeders/0010-create-programs';
import { insertModules } from './seeders/0020-create-modules';
import { insertLevels } from './seeders/0030-create-levels';
import { insertLessons } from './seeders/0040-create-lessons';
import { insertUserAdmins } from './seeders/0050-create-user-admins';
import { createProductCategories } from './seeders/0060-create-product-categories';
import { createProducts } from './seeders/0070-create-products';
// import { restoreProduction } from './seeders/0080-restore-production';
import { logger } from '../utils/logger';

// Run seed
async function main() {
    await Promise.all([
        prismaClient.$transaction([...insertPrograms(), ...insertModules(), ...insertLevels(), ...insertLessons()]),
        insertUserAdmins(),
        createProductCategories(),
    ]);

    await createProducts();
}

main()
    .catch((e) => {
        logger.error({
            message: 'Error while seeding database',
            errorDetails: e.message,
            resourceType: 'User',
            source: 'databaseSeed',
        });
        process.exit(1);
    })
    .finally(async () => {
        await prismaClient.$disconnect();
    });
