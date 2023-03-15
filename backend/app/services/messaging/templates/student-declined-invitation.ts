import emailTemplates from '../../../config/email-templates.json';

import { MessageTemplate } from './message-template';

export interface StudentDeclinedInvitationMessageInput {
    studentName: string;
    tutorName: string;
    invitationPageUrl: string;
}

export class StudentDeclinedInvitationMessageTemplate extends MessageTemplate {
    public messageInput: StudentDeclinedInvitationMessageInput;

    constructor(messageInput: StudentDeclinedInvitationMessageInput) {
        super(emailTemplates.studentDeclinedInvitation);

        this.messageInput = messageInput;
    }
}
