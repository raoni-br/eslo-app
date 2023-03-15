import { Prisma, Price, PriceType, Product, ProductCategory, ProductSubcategory } from '@prisma/client';
import { ApolloError, UserInputError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';
import { rrulestr, Frequency } from 'rrule';

import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';

import { esloPaymentGateway } from '../services/payment';
import { logger } from '../utils/logger';

export type PriceWithProduct = Prisma.PriceGetPayload<{
    include: {
        product: true;
    };
}>;

export interface IProductInput {
    name: string;
    description: string;
    slug: string;
    subcategoryCode: string;
    objectSettings?: any;
    images?: any;
    startedAt?: Date;
    completedAt?: Date;
}

interface IProductPriceBaseInput {
    productId: string;
    slug: string;
    taxAmount: number;
    unitTotalAmount: number;
    recurrence?: string;
    subscriptionPeriod?: any;
    startedAt?: Date;
    completedAt?: Date;
    allowFreeTrial?: boolean;
}

export interface IProductPriceInput extends IProductPriceBaseInput {
    name: string;
    description: string;
    currencyIsoCode: string;
    type: PriceType;
}

interface IUpdateProductPriceInput extends IProductPriceBaseInput {
    name?: string;
    description?: string;
    currencyIsoCode?: string;
    type?: PriceType;
    priceId: string;
}

interface IPriceFilters {
    active: boolean;
}

interface IProductWithFilters extends Product {
    priceFilters?: IPriceFilters;
}

export class ProductModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'product');
    }

    private static filterActive(): object {
        const now = new Date();
        return {
            startedAt: { lte: now },
            OR: [{ completedAt: null }, { completedAt: { gte: now } }],
        };
    }

    private static isActive(startedAt: Date, completedAt: Date | null | undefined): boolean {
        const now = new Date();
        return startedAt <= now && (!completedAt || completedAt >= now);
    }

    private static isProductActive(product: Product | IProductInput): boolean {
        return ProductModel.isActive(product.startedAt || new Date(), product.completedAt);
    }

    private static isPriceActive(price: Price | IProductPriceInput): boolean {
        return ProductModel.isActive(price.startedAt || new Date(), price.completedAt);
    }

    private static isValidPriceType(type: PriceType, recurrence: string | undefined): boolean {
        if (type !== 'RECURRING') {
            return true;
        }

        if (!recurrence) {
            return false;
        }

        try {
            const recurringRule = rrulestr(recurrence);
            if (![Frequency.YEARLY, Frequency.MONTHLY, Frequency.WEEKLY].includes(recurringRule.options.freq)) {
                return false;
            }
        } catch (error: any) {
            return false;
        }

        return true;
    }

    public findById(id: string): Promise<Product | null> {
        return this.prismaClient.product.findUnique({
            where: { id },
        });
    }

    public findBySlug(slug: string): Promise<Product | null> {
        return this.prismaClient.product.findUnique({
            where: { slug },
        });
    }

    public findAll(): Promise<Product[]> {
        return this.prismaClient.product.findMany();
    }

    public async findByCategory(
        categoryCode: string,
        priceFilters?: IPriceFilters,
    ): Promise<Product[] | IProductWithFilters[]> {
        let productList: Product[] | IProductWithFilters[];

        productList = await this.prismaClient.product.findMany({
            where: {
                subcategory: {
                    categoryCode,
                },
            },
        });

        if (priceFilters) {
            productList = productList.map((product: Product): IProductWithFilters => {
                const productWithFilter: IProductWithFilters = {
                    ...product,
                    priceFilters,
                };
                return productWithFilter;
            });
        }

        return productList;
    }

    public findCategoryByCode(code: string): Promise<ProductCategory | null> {
        return this.prismaClient.productCategory.findUnique({
            where: { code },
        });
    }

    public findSubcategoryByCode(code: string): Promise<ProductSubcategory | null> {
        return this.prismaClient.productSubcategory.findUnique({
            where: { code },
        });
    }

    public findPriceById(id: string): Promise<Price | null> {
        return this.prismaClient.price.findUnique({
            where: { id },
        });
    }

    public findActivePriceById(id: string): Promise<Price | null> {
        return this.prismaClient.price.findFirst({
            where: {
                id,
                ...ProductModel.filterActive(),
            },
        });
    }

    public findPriceByProviderId(paymentProviderId: string): Promise<PriceWithProduct | null> {
        return this.prismaClient.price.findFirst({
            where: { paymentProviderId },
            include: { product: true },
        });
    }

    public findPriceBySlug(slug: string): Promise<Price | null> {
        return this.prismaClient.price.findUnique({
            where: { slug },
        });
    }

    public findFreeTrialPrices(): Promise<Price[] | null> {
        return this.prismaClient.price.findMany({
            where: { allowFreeTrial: true, active: true },
        });
    }

    public findPricesByProduct(productId: string, filters?: IPriceFilters): Promise<Price[]> {
        return this.prismaClient.price.findMany({
            where: {
                productId,
                ...ProductModel.filterActive(),
                ...filters,
            },
        });
    }

    public async createProduct(newProduct: IProductInput): Promise<Product> {
        await this.validateIAM({
            action: 'create',
            resourceType: 'Product',
        });

        const productId = uuidv4();

        // validate subcategory
        const subcategory = await this.findSubcategoryByCode(newProduct.subcategoryCode);
        if (!subcategory) {
            throw new UserInputError('Invalid subcategory');
        }

        // validate slug
        const regex = new RegExp(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        if (!regex.test(newProduct.slug)) {
            throw new UserInputError('The product URL reference (slug) is not valid.');
        }

        const slugAlreadyExists = await this.findBySlug(newProduct.slug);
        if (slugAlreadyExists) {
            throw new UserInputError(`The product URL reference (slug) must be unique. 
            There is already a product created with the same reference.`);
        }

        const createdProduct = await this.prismaClient.product.create({
            data: {
                id: productId,
                name: newProduct.name,
                description: newProduct.description,
                slug: newProduct.slug,
                subcategoryCode: newProduct.subcategoryCode,
                objectSettings: newProduct.objectSettings,
                images: newProduct.images,
                active: ProductModel.isProductActive(newProduct),
            },
        });

        try {
            const paymentProviderInfo = await esloPaymentGateway.createProduct(createdProduct);

            return this.prismaClient.product.update({
                where: { id: productId },
                data: {
                    paymentProviderId: paymentProviderInfo?.id,
                },
            });
        } catch (error: any) {
            const message = 'Error while creating product on payment provider';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'Product',
                source: 'createProduct',
                action: 'create',
                context: { product: productId },
            });
            throw new ApolloError(message);
        }
    }

    public async updateProductPrice(priceInfos: IUpdateProductPriceInput): Promise<Price> {
        await this.validateIAM({
            action: 'update',
            resourceType: 'Price',
        });

        // find and validate old price
        const oldPrice = await this.findPriceById(priceInfos.priceId);
        if (!oldPrice) {
            throw new UserInputError('No price found with the given price id.');
        }

        if (!ProductModel.isPriceActive(oldPrice)) {
            throw new UserInputError('This price is not active.');
        }

        // create new price
        const updatedPrice = await this.createProductPrice({
            name: priceInfos.name || oldPrice.name,
            description: priceInfos.description || oldPrice.description,
            slug: priceInfos.slug,
            currencyIsoCode: priceInfos.currencyIsoCode || oldPrice.currencyIsoCode,
            type: priceInfos.type || oldPrice.type,
            taxAmount: priceInfos.taxAmount,
            unitTotalAmount: priceInfos.unitTotalAmount,
            recurrence: priceInfos.recurrence ? priceInfos.recurrence : oldPrice.recurrence || undefined,
            subscriptionPeriod: priceInfos.subscriptionPeriod || oldPrice.subscriptionPeriod,
            startedAt: priceInfos.startedAt || oldPrice.startedAt,
            productId: priceInfos.productId || oldPrice.productId,
            allowFreeTrial: priceInfos.allowFreeTrial || oldPrice.allowFreeTrial,
        });

        // complete old price (only in eslo environment)
        await this.disableProductPrice(oldPrice.id);

        return updatedPrice;
    }

    public async disableProductPrice(priceId: string): Promise<Price> {
        await this.validateIAM({
            action: 'cancel',
            resourceType: 'Price',
        });

        // find price
        const price = await this.findPriceById(priceId);

        if (!price) {
            throw new UserInputError('No price found with the given price id.');
        }

        // disable in stripe
        await esloPaymentGateway.disablePrice(price);

        // disable in db
        return this.prismaClient.price.update({
            where: { id: price.id },
            data: {
                active: false,
                completedAt: new Date(),
            },
        });
    }

    public async createProductPrice(newPrice: IProductPriceInput): Promise<Price> {
        await this.validateIAM({
            action: 'create',
            resourceType: 'Price',
        });

        const priceId = uuidv4();

        // validate product
        const product = await this.findById(newPrice.productId);
        if (!product) {
            throw new UserInputError('Product not found.');
        }

        // validate slug
        const regex = new RegExp(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        if (!regex.test(newPrice.slug)) {
            throw new UserInputError('The product URL reference (slug) is not valid.');
        }

        const slugAlreadyExists = await this.findPriceBySlug(newPrice.slug);
        if (slugAlreadyExists) {
            throw new UserInputError(`The price URL reference (slug) must be unique. 
            There is already a price created with the same reference.`);
        }

        // validate recurrence
        if (!ProductModel.isValidPriceType(newPrice.type, newPrice.recurrence)) {
            throw new UserInputError('Recurring prices must have a valid rule.');
        }

        const freeTrialOptions = newPrice.allowFreeTrial ? { allowFreeTrial: newPrice.allowFreeTrial } : undefined;

        const createdPrice = await this.prismaClient.price.create({
            data: {
                id: priceId,
                productId: newPrice.productId,
                name: newPrice.name,
                description: newPrice.description,
                slug: newPrice.slug,
                currencyIsoCode: newPrice.currencyIsoCode,
                type: newPrice.type,
                taxAmount: newPrice.taxAmount,
                unitTotalAmount: newPrice.unitTotalAmount,
                recurrence: newPrice.recurrence,
                active: ProductModel.isPriceActive(newPrice),
                ...freeTrialOptions,
            },
        });

        try {
            const paymentProviderInfo = await esloPaymentGateway.createPrice(createdPrice);

            return this.prismaClient.price.update({
                where: { id: priceId },
                data: {
                    paymentProviderId: paymentProviderInfo?.id,
                },
            });
        } catch (error: any) {
            const message = 'Error while creating price on payment provider';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'Price',
                source: 'createProductPrice',
                action: 'create',
                context: { price: priceId },
            });
            throw new ApolloError(message);
        }
    }
}
