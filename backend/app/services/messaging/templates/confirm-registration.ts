import emailTemplates from '../../../config/email-templates.json';

import { MessageTemplate } from './message-template';

export interface ConfirmRegistrationMessageInput {
    userName: string;
    confirmRegistrationUrl: string;
    profileUrl: string;
    classesUrl: string;
}

export class ConfirmRegistrationMessageTemplate extends MessageTemplate {
    public messageInput: ConfirmRegistrationMessageInput;

    constructor(messageInput: ConfirmRegistrationMessageInput) {
        super(emailTemplates.confirmEmail);

        this.messageInput = messageInput;
    }
}
