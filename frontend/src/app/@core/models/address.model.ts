export interface Address {
    id?: string;
    addressType?: string;
    postalCode?: string;
    street?: string;
    streetNumber?: string;
    streetComplement?: string;
    district?: string;
    city?: string;
    state?: string;
    countryISO?: string;
    latitude?: number;
    longitude?: number;
    providerInfo?: any;
}
