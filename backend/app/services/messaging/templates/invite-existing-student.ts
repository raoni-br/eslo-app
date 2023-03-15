import emailTemplates from '../../../config/email-templates.json';

import { MessageTemplate } from './index';

export interface InviteExistingStudentMessageInput {
    studentName: string;
    tutorName: string;
    invitationLink: string;
}

export class InviteExistingStudentMessageTemplate extends MessageTemplate {
    public messageInput: InviteExistingStudentMessageInput;

    constructor(messageInput: InviteExistingStudentMessageInput) {
        super(emailTemplates.inviteExistingStudent);

        this.messageInput = messageInput;
    }
}
