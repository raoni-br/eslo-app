import emailTemplates from '../../../config/email-templates.json';

import { MessageTemplate } from './message-template';

export interface ActivateStudentMessageInput {
    studentName: string;
    activationUrl: string;
}

export class ActivateStudentMessageTemplate extends MessageTemplate {
    public messageInput: ActivateStudentMessageInput;

    constructor(messageInput: ActivateStudentMessageInput) {
        super(emailTemplates.activateStudent);

        this.messageInput = messageInput;
    }
}
