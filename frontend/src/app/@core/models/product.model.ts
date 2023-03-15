export interface Product {
    description: string;
    id: string;
    name: string;
    prices: ProductPrice[];
    slug: string;
    subcategory: ProductSubcategory;
    selected?: boolean; // front-end only field
    hover?: boolean; // front-end only field
}

export interface ProductCategory {
    code: string;
    description: string;
    name: string;
}

type IntervalType = 'day' | 'month' | 'week' | 'year';
export interface PricePeriod {
    interval: IntervalType;
    intervalCount: number;
}

export interface ProductPrice {
    currencyIsoCode: string;
    description: string;
    id: string;
    name: string;
    pricePeriod: PricePeriod;
    slug: string;
    taxAmount: number;
    type: string;
    unitTotalAmount: number;
}

export interface ProductSubcategory {
    category: ProductCategory;
    code: string;
    description: string;
    name: string;
}

export interface IProductFilters {
    categoryCode?: 'teacher_licence' | 'student_licence';
}
