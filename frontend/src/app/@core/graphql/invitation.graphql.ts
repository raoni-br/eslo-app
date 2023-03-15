import { gql } from 'apollo-angular';

export const INVITATION_SUMMARY = gql`
    fragment invitationSummary on Invitation {
        id
        inviteeEmail
        inviteeFirstName
        inviteeSurname
    }
`;
