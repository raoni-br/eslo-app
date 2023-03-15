import { gql } from 'apollo-angular';

export const PRODUCT_DETAILS = gql`
    fragment productDetails on Product {
        id
        name
        slug
        description
        subcategory {
            code
            name
            description
            category {
                code
                name
                description
            }
        }
        prices {
            id
            name
            slug
            pricePeriod {
                interval
                intervalCount
            }
            description
            taxAmount
            unitTotalAmount
            currencyIsoCode
            type
        }
    }
`;
