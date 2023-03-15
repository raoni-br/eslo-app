import emailTemplates from '../../../config/email-templates.json';

import { MessageTemplate } from './index';

export interface InviteStudentMessageInput {
    studentName: string;
    tutorName: string;
    invitationLink: string;
}

export class InviteStudentMessageTemplate extends MessageTemplate {
    public messageInput: InviteStudentMessageInput;

    constructor(messageInput: InviteStudentMessageInput) {
        super(emailTemplates.inviteStudent);

        this.messageInput = messageInput;
    }
}
