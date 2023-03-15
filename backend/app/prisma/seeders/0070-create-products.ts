import { prismaClient } from '..';
import { ProductModel } from '../../models/product.model';
import { UserProfileModel } from '../../models/user-profile.model';

async function createProducts(): Promise<void> {
    // teacher
    const productModel = new ProductModel(UserProfileModel.getSystemUser('payment'));

    const teacherProduct = await productModel.createProduct({
        name: 'Smart',
        description: 'For private teachers that want to spend most of their time in the classroom',
        slug: 'teacher-smart',
        subcategoryCode: 'teacher_smart',
    });

    await productModel.createProductPrice({
        productId: teacherProduct.id,
        name: 'R$450 / year',
        description: 'Teacher Smart - All you need for your ESL classes',
        slug: 'teacher-smart-free-trial-yearly',
        taxAmount: 0,
        unitTotalAmount: 450,
        currencyIsoCode: 'BRL',
        type: 'RECURRING',
        recurrence: 'FREQ=YEARLY;INTERVAL=1',
        subscriptionPeriod: {
            interval: 'yearly',
            intervalCount: 1,
        },
        allowFreeTrial: true,
    });

    await productModel.createProductPrice({
        productId: teacherProduct.id,

        name: 'R$45 / month',
        description: 'Teacher Smart - All you need for your ESL classes',
        slug: 'teacher-smart-free-trial-monthly',
        taxAmount: 0,
        unitTotalAmount: 45,
        currencyIsoCode: 'BRL',
        type: 'RECURRING',
        recurrence: 'FREQ=MONTHLY;INTERVAL=1',
        subscriptionPeriod: {
            interval: 'monthly',
            intervalCount: 1,
        },
        allowFreeTrial: true,
    });
}

async function deleteProducts(): Promise<boolean> {
    await prismaClient.price.deleteMany({
        where: {
            active: true,
        },
    });

    await prismaClient.product.deleteMany({
        where: {
            active: true,
        },
    });

    return true;
}

export { createProducts, deleteProducts };
