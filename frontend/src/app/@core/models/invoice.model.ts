export interface Invoice {
    id: string;
    processedAt: string;
    dueDate: string;
    invoicePeriodFrom: string;
    invoicePeriodTo: string;
    companyDetails: Details;
    customerDetails: Details;
    balanceSummary: BalanceSummary;
    invoiceItems: InvoiceItem[];
}

export interface BalanceSummary {
    taxAmount: number;
    totalAmount: number;
    discountAmount: number;
}

export interface Details {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    webSite?: string;
}

export interface InvoiceItem {
    id: string;
    invoiceLineNumber: number;
    productId: string;
    productName: string;
    productDescription: string;
    balance: Balance;
}

export interface Balance {
    quantity: number;
    unitPrice: number;
    taxAmount: number;
    totalAmount: number;
    discountAmount: number;
}
