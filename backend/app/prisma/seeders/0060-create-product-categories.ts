import { prismaClient } from '..';

async function createProductCategories(): Promise<any[]> {
    return prismaClient.$transaction([
        // category
        prismaClient.productCategory.upsert({
            where: {
                code: 'teacher_licence',
            },
            update: {},
            create: {
                code: 'teacher_licence',
                name: 'Teacher Licence',
                description: 'Licence that grant teacher permissions to a user',
            },
        }),
        prismaClient.productCategory.upsert({
            where: {
                code: 'student_licence',
            },
            update: {},
            create: {
                code: 'student_licence',
                name: 'Student Licence',
                description: 'Licence that grant a student access to the plataform',
            },
        }),
        // subcategory
        prismaClient.productSubcategory.upsert({
            where: {
                code: 'teacher_smart',
            },
            update: {},
            create: {
                code: 'teacher_smart',
                categoryCode: 'teacher_licence',
                name: 'Teacher Smart Licence',
                description: 'Licence that grant private teachers access to the platform',
            },
        }),
        prismaClient.productSubcategory.upsert({
            where: {
                code: 'teacher_student_licence',
            },
            update: {},
            create: {
                code: 'teacher_student_licence',
                categoryCode: 'student_licence',
                name: 'Teacher Student Licence',
                description: 'Licence that grant acesss to students of private teachers',
            },
        }),
    ]);
}

async function deleteProductCategories(): Promise<boolean> {
    await prismaClient.productCategory.deleteMany({
        where: {
            code: { in: ['teacher_licence', 'student_licence'] },
        },
    });

    await prismaClient.productSubcategory.deleteMany({
        where: {
            code: { in: ['teacher_smart', 'teacher_student_licence'] },
        },
    });

    return true;
}

export { createProductCategories, deleteProductCategories };
