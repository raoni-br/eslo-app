import { gql } from 'apollo-angular';

export const USER_PROFILE = gql`
    fragment userProfile on User {
        id
        firstName
        familyName
        displayName
        primaryEmail
        dateOfBirth
        profileComplete
        onboardingSubmitted
        userIdentificationList {
            id
            countryISO
            category
            code
            attachementUrl
        }
        userAddresses {
            id
            addressType
            postalCode
            street
            streetNumber
            streetComplement
            district
            city
            state
            countryISO
            latitude
            longitude
        }
        userPhoneNumbers {
            id
            countryISO
            category
            code
            rawFormat
            nationalFormat
            internationalFormat
        }
    }
`;

export const USER_CONTACT = gql`
    fragment userContact on User {
        id
        firstName
        familyName
        displayName
        primaryEmail
    }
`;
