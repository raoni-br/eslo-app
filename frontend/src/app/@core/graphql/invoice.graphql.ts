import { gql } from 'apollo-angular';

export const INVOICE_DETAILS = gql`
    fragment invoiceDetails on InvoicePreview {
        id
        processedAt
        dueDate
        invoicePeriodFrom
        invoicePeriodTo
        companyDetails {
            id
            name
            address
            phone
            email
            webSite
        }
        customerDetails {
            id
            name
            address
            phone
            email
        }
        balanceSummary {
            taxAmount
            totalAmount
            discountAmount
        }
        invoiceItems {
            id
            invoiceLineNumber
            productId
            productName
            productDescription
            balance {
                quantity
                unitPrice
                taxAmount
                totalAmount
                discountAmount
            }
        }
    }
`;
