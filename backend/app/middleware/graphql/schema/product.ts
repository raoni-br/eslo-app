import { objectType, extendType, idArg, inputObjectType } from 'nexus';
import { EsloRecurrenceTools } from '../../../utils/recurrence-tools';

import { EsloContext } from '../context';

export const ProductCategory = objectType({
    name: 'ProductCategory',
    definition(t) {
        t.nonNull.id('code');
        t.string('name');
        t.string('description');
        t.list.field('products', {
            // eslint-disable-next-line no-use-before-define
            type: Product,
        });
    },
});

export const ProductSubcategory = objectType({
    name: 'ProductSubcategory',
    definition(t) {
        t.nonNull.id('code');
        t.string('name');
        t.string('description');
        t.field('category', {
            type: ProductCategory,
            resolve: (parent, _, context: EsloContext) =>
                context.models.product.findCategoryByCode(parent.categoryCode),
        });
    },
});

export const PricePeriod = objectType({
    name: 'PricePeriod',
    definition(t) {
        t.nonNull.string('interval');
        t.nonNull.int('intervalCount');
    },
});

export const PricePeriodInput = inputObjectType({
    name: 'PricePeriodInput',
    definition(t) {
        t.nonNull.string('interval');
        t.nonNull.int('intervalCount');
    },
});

export const PriceFilters = inputObjectType({
    name: 'PriceFilters',
    definition(t) {
        t.boolean('active');
    },
});

export const ProductFilters = inputObjectType({
    name: 'ProductFilters',
    definition(t) {
        t.string('categoryCode');
        t.field('priceFilters', { type: PriceFilters });
    },
});

export const ProductPrice = objectType({
    name: 'ProductPrice',
    definition(t) {
        t.nonNull.id('id');
        t.string('name');
        t.string('description');
        t.string('slug');
        t.float('taxAmount');
        t.float('unitTotalAmount');
        t.string('currencyIsoCode');
        t.string('type');
        t.field('pricePeriod', {
            type: PricePeriod,
            resolve: (parent) => EsloRecurrenceTools.getIntervalFromRRule(parent.recurrence),
        });
    },
});

export const Product = objectType({
    name: 'Product',
    definition(t) {
        t.nonNull.id('id');
        t.string('name');
        t.string('description');
        t.string('slug');
        t.field('subcategory', {
            type: ProductSubcategory,
            resolve: (parent, _, context: EsloContext) =>
                context.models.product.findSubcategoryByCode(parent.subcategoryCode),
        });
        t.list.field('prices', {
            type: ProductPrice,
            resolve: (parent, _, context: EsloContext) =>
                context.models.product.findPricesByProduct(parent.id, parent.priceFilters),
        });
    },
});

export const ProductQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('product', {
            type: Product,
            args: { id: idArg({ description: 'Product ID' }) },
            resolve: (_parent, args, context: EsloContext) => context.models.product.findById(args.id),
        });
    },
});

export const ProductsQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('products', {
            type: Product,
            args: { productFilters: ProductFilters },
            resolve: (_parent, args, context: EsloContext) => {
                if (args.productFilters !== undefined) {
                    return context.models.product.findByCategory(
                        args.productFilters.categoryCode,
                        args.productFilters.priceFilters,
                    );
                }

                return context.models.product.findAll();
            },
        });
    },
});

export const CreateProductInput = inputObjectType({
    name: 'CreateProductInput',
    definition(t) {
        t.nonNull.string('name');
        t.nonNull.string('description');
        t.nonNull.string('slug');
        t.nonNull.string('subcategoryCode');
        t.string('startedAt');
        t.string('completedAt');
    },
});

export const CreateProductMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createProduct', {
            type: Product,
            args: {
                createProductInput: CreateProductInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.product.createProduct(args.createProductInput),
        });
    },
});

export const CreateProductPriceInput = inputObjectType({
    name: 'CreateProductPriceInput',
    definition(t) {
        t.nonNull.string('productId');
        t.nonNull.string('name');
        t.nonNull.string('description');
        t.nonNull.string('slug');
        t.nonNull.string('currencyIsoCode');
        t.nonNull.string('type');
        t.nonNull.float('taxAmount');
        t.nonNull.float('unitTotalAmount');
        t.string('recurrence');
        t.field('pricePeriod', { type: PricePeriodInput });
        t.string('startedAt');
        t.string('completedAt');
        t.boolean('allowFreeTrial');
    },
});

export const UpdateProductPriceInput = inputObjectType({
    name: 'UpdateProductPriceInput',
    definition(t) {
        t.nonNull.string('priceId');
        t.string('name');
        t.string('description');
        t.nonNull.string('slug');
        t.string('currencyIsoCode');
        t.string('type');
        t.nonNull.float('taxAmount');
        t.nonNull.float('unitTotalAmount');
        t.string('recurrence');
        t.field('pricePeriod', { type: PricePeriodInput });
        t.boolean('allowFreeTrial');
    },
});

export const CreateProductPriceMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createProductPrice', {
            type: ProductPrice,
            args: {
                createProductPriceInput: CreateProductPriceInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.product.createProductPrice(args.createProductPriceInput),
        });
    },
});

export const UpdateProductPriceMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('updateProductPrice', {
            type: ProductPrice,
            args: {
                updateProductPriceInput: UpdateProductPriceInput,
            },
            resolve: (_root, args, context: EsloContext) =>
                context.models.product.updateProductPrice(args.updateProductPriceInput),
        });
    },
});
