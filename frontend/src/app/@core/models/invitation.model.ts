import { UserProfile } from './user-profile.model';

export interface Invitation {
    id?: string;
    sourceType?: string;
    sourceId?: string;
    invitationToken?: string;
    tokenIssuedDateTime?: string; // DateTime
    tokenActionedDateTime?: string; // DateTime
    inviterId?: string;
    inviteeId?: string;
    inviteeEmail?: string;
    inviteeFirstName?: string;
    inviteeSurname?: string;
    status?: string;
    invitee?: UserProfile;
    inviter?: UserProfile;
}

export interface CreatePasswordStudentInfo {
    invitationToken: string;
    email: string;
    firstName: string;
    surname: string;
}
