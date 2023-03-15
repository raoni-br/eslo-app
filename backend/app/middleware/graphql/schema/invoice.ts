import { objectType, extendType } from 'nexus';

import { EsloContext } from '../context';

export const InvoiceCompanyDetails = objectType({
    name: 'CompanyDetails',
    definition(t) {
        t.nonNull.id('id');
        t.string('name');
        t.string('address');
        t.string('phone');
        t.string('email');
        t.string('webSite');
    },
});

export const InvoiceCustomerDetails = objectType({
    name: 'CustomerDetails',
    definition(t) {
        t.nonNull.id('id');
        t.string('name');
        t.string('address');
        t.string('phone');
        t.string('email');
    },
});

export const InvoiceBalanceDetails = objectType({
    name: 'BalanceDetails',
    definition(t) {
        t.float('quantity');
        t.float('unitPrice');
        t.float('taxAmount');
        t.float('totalAmount');
        t.float('discountAmount');
    },
});

export const InvoiceBalanceSummary = objectType({
    name: 'BalanceSummary',
    definition(t) {
        t.float('taxAmount');
        t.float('totalAmount');
        t.float('discountAmount');
    },
});

export const InvoiceItem = objectType({
    name: 'InvoiceItem',
    definition(t) {
        t.nonNull.id('id');
        t.int('invoiceLineNumber');
        t.string('productId');
        t.string('productName');
        t.string('productDescription');
        t.field('balance', {
            type: InvoiceBalanceDetails,
        });
    },
});

export const InvoicePreview = objectType({
    name: 'InvoicePreview',
    definition(t) {
        t.nonNull.id('id');
        t.string('processedAt');
        t.string('dueDate');
        t.string('invoicePeriodFrom');
        t.string('invoicePeriodTo');
        t.field('companyDetails', {
            type: InvoiceCompanyDetails,
        });
        t.field('customerDetails', {
            type: InvoiceCustomerDetails,
        });
        t.field('balanceSummary', {
            type: InvoiceBalanceSummary,
        });
        t.list.field('invoiceItems', {
            type: InvoiceItem,
        });
    },
});

export const InvoicePreviewQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('invoicePreview', {
            type: InvoicePreview,
            resolve: async (_parent, _args, context: EsloContext) => context.models.invoice.previewStripeInvoice(),
        });
    },
});
