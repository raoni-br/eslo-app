import emailTemplates from '../../../config/email-templates.json';

import { MessageTemplate } from './message-template';

export interface ResetPasswordMessageInput {
    userName: string;
    resetPasswordUrl: string;
}

export class ResetPasswordMessageTemplate extends MessageTemplate {
    public messageInput: ResetPasswordMessageInput;

    constructor(messageInput: ResetPasswordMessageInput) {
        super(emailTemplates.forgotPassword);

        this.messageInput = messageInput;
    }
}
