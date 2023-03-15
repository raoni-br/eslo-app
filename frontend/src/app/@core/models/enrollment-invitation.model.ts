import { Enrollment } from './enrollment.model';
import { Event } from './event.model';
import { Invitation } from './invitation.model';

export interface CreateEnrollmentInput {
    enrollmentInput: {
        studyGroupId?: string;
        oneOnOne?: {
            levelId: string;
            events: Event[];
        };
    };
    invitedStudent: {
        email: string;
        firstName: string;
        surname: string;
    };
}

export interface EnrollmentInvitationInput {
    invitation: Invitation;
    enrollment: Enrollment;
}
