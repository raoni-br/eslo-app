import emailTemplates from '../../../config/email-templates.json';

import { MessageTemplate } from './message-template';

export interface StudentAcceptedInvitationMessageInput {
    studentName: string;
    tutorName: string;
    studentsPageUrl: string;
}

export class StudentAcceptedInvitationMessageTemplate extends MessageTemplate {
    public messageInput: StudentAcceptedInvitationMessageInput;

    constructor(messageInput: StudentAcceptedInvitationMessageInput) {
        super(emailTemplates.studentAcceptedInvitation);

        this.messageInput = messageInput;
    }
}
