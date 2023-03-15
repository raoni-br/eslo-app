import emailTemplates from '../../../config/email-templates.json';

import { MessageTemplate } from './message-template';

export interface ChangedPasswordMessageInput {
    userName: string;
}

export class ChangedPasswordMessageTemplate extends MessageTemplate {
    public messageInput: ChangedPasswordMessageInput;

    constructor(messageInput: ChangedPasswordMessageInput) {
        super(emailTemplates.changedPassword);

        this.messageInput = messageInput;
    }
}
