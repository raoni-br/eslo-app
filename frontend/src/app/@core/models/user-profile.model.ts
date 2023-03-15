import { Address } from './address.model';
import { ClassRecord } from './class-record.model';

export interface UserAddress extends Address {
    userId?: string;
}

export interface UserIdentification {
    id?: string;
    countryISO?: string;
    category?: string;
    code?: string;
    attachementUrl?: string;
}

export interface UserPhoneNumber {
    id?: string;
    countryISO?: string;
    category?: string;
    code?: string;
    rawFormat?: string;
    nationalFormat?: string;
    internationalFormat?: string;
}

export interface UserAuthDetails {
    id: string;
    primaryEmail: string;
    displayName: string;
    firstName: string;
    familyName: string;
    profileComplete: boolean;
    roles: string[];
}

export interface UserProfile {
    id?: string;
    primaryEmail?: string;
    firstName?: string;
    familyName?: string;
    displayName?: string;
    profilePicUrl?: string;
    dateOfBirth?: string; // DateTime
    gender?: string;
    profileComplete?: boolean;
    onboardingSubmitted?: boolean;
    userAddresses?: UserAddress[];
    userIdentificationList?: UserIdentification[];
    userPhoneNumbers?: UserPhoneNumber[];
    classInProgress?: ClassRecord;
}
