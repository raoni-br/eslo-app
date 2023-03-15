import { gql } from 'apollo-angular';

export const CLASSROOM_STUDENT = gql`
    fragment classroomStudent on Student {
        id
        firstName
        familyName
        displayName
        primaryEmail
    }
`;
