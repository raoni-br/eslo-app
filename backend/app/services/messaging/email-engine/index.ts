import { MailDataRequired, MailService } from '@sendgrid/mail';

import { esloConfig } from '../../../secrets';
import { logger } from '../../../utils/logger';
import { MessageTemplate } from '../templates';

const environment = process.env.NODE_ENV || 'local';

class EsloMailService extends MailService {
    constructor() {
        super();

        this.setApiKey(esloConfig.emailAPIKey);
    }

    sendEmailWithTemplate(recipient: string, templateData: MessageTemplate): Promise<any> {
        const emailData: MailDataRequired = {
            from: esloConfig.senderEmail,
            to: recipient,
            templateId: templateData.templateId,
            dynamicTemplateData: templateData.messageInput,
        };

        logger.info({
            message: 'Email sent',
            source: 'sendEmailWithTemplate',
            context: { emailData },
        });

        if (environment === 'production') {
            return this.send(emailData);
        }

        return Promise.resolve('Fake email sent');
    }
}

export const esloMailService = new EsloMailService();
