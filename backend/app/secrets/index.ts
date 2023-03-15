import { logger } from '../utils/logger';

class EsloConfig {
    public serverPort: number;

    public frontendUrl: string;

    public emailAPIKey: string;

    public jwtSecret: string;

    public senderEmail: string;

    public platformAdminEmail: string;

    public paymentGatewayEnabled: boolean;

    public paymentGatewayApiKey: string | null;

    public paymentGatewayWebhookKey: string | null;

    public paymentGatewayFreeTrialInDays: number | null;

    public iamAgentEnabled: boolean;

    public iamAgentUrl: string | null;

    public iamAgentToken: string | null;

    public liveChatEnabled: boolean;

    public liveChatSecret: string | null;

    constructor() {
        const errorMsgPrefix = 'Error while reading environment variables';
        if (!process.env.ESLO_APP_PORT || Number.isNaN(parseInt(process.env.ESLO_APP_PORT, 10))) {
            logger.error({
                message: errorMsgPrefix,
                source: 'esloConfig',
                context: {
                    variable: 'serverPort',
                    value: process.env.ESLO_APP_PORT,
                },
            });

            process.exit(1);
        }
        this.serverPort = parseInt(process.env.ESLO_APP_PORT, 10);

        if (!process.env.ESLO_APP_FRONTEND_URL) {
            logger.error({
                message: errorMsgPrefix,
                source: 'esloConfig',
                context: {
                    variable: 'frontendUrl',
                    value: process.env.ESLO_APP_FRONTEND_URL,
                },
            });

            process.exit(1);
        }
        this.frontendUrl = process.env.ESLO_APP_FRONTEND_URL;

        if (!process.env.ESLO_APP_EMAIL_API_KEY || process.env.ESLO_APP_EMAIL_API_KEY.substr(0, 3) !== 'SG.') {
            logger.error({
                message: errorMsgPrefix,
                source: 'esloConfig',
                context: {
                    variable: 'emailAPIKey',
                },
            });
            process.exit(1);
        }
        this.emailAPIKey = process.env.ESLO_APP_EMAIL_API_KEY;

        if (!process.env.ESLO_APP_JWT_SECRET) {
            logger.error({
                message: errorMsgPrefix,
                source: 'esloConfig',
                context: {
                    variable: 'jwtSecret',
                },
            });

            process.exit(1);
        }
        this.jwtSecret = process.env.ESLO_APP_JWT_SECRET;

        if (!process.env.ESLO_APP_DATABASE_URL) {
            logger.error({
                message: errorMsgPrefix,
                source: 'esloConfig',
                context: {
                    variable: 'ESLO_APP_DATABASE_URL',
                },
            });
            process.exit(1);
        }

        if (!process.env.ESLO_APP_SENDER_EMAIL) {
            logger.error({
                message: errorMsgPrefix,
                source: 'esloConfig',
                context: {
                    variable: 'senderEmail',
                },
            });

            process.exit(1);
        }
        this.senderEmail = process.env.ESLO_APP_SENDER_EMAIL;

        if (!process.env.ESLO_APP_PLATFORM_ADMIN_EMAIL) {
            logger.error({
                message: errorMsgPrefix,
                source: 'esloConfig',
                context: {
                    variable: 'platformAdminEmail',
                },
            });
            process.exit(1);
        }
        this.platformAdminEmail = process.env.ESLO_APP_PLATFORM_ADMIN_EMAIL;

        // Payment Gateway
        if (
            process.env.ESLO_APP_PAYMENT_GATEWAY_ENABLED &&
            process.env.ESLO_APP_PAYMENT_GATEWAY_ENABLED.toLowerCase() === 'true'
        ) {
            this.paymentGatewayEnabled = true;

            if (!process.env.ESLO_APP_PAYMENT_GATEWAY_API_KEY) {
                logger.error({
                    message: errorMsgPrefix,
                    source: 'esloConfig',
                    context: {
                        variable: 'paymentGatewayApiKey',
                    },
                });
                process.exit(1);
            }
            this.paymentGatewayApiKey = process.env.ESLO_APP_PAYMENT_GATEWAY_API_KEY;

            if (!process.env.ESLO_APP_PAYMENT_GATEWAY_WEBHOOK_KEY) {
                logger.error({
                    message: errorMsgPrefix,
                    source: 'esloConfig',
                    context: {
                        variable: 'paymentGatewayWebhookKey',
                    },
                });
                process.exit(1);
            }
            this.paymentGatewayWebhookKey = process.env.ESLO_APP_PAYMENT_GATEWAY_WEBHOOK_KEY;

            if (
                !process.env.ESLO_APP_PAYMENT_GATEWAY_FREE_TRIAL_DAYS ||
                Number.isNaN(parseInt(process.env.ESLO_APP_PORT, 10))
            ) {
                logger.error({
                    message: errorMsgPrefix,
                    source: 'esloConfig',
                    context: {
                        variable: 'paymentGatewayFreeTrialInDays',
                    },
                });
                process.exit(1);
            }
            this.paymentGatewayFreeTrialInDays = parseInt(process.env.ESLO_APP_PAYMENT_GATEWAY_FREE_TRIAL_DAYS, 10);
        } else {
            this.paymentGatewayEnabled = false;
            this.paymentGatewayApiKey = null;
            this.paymentGatewayWebhookKey = null;
            this.paymentGatewayFreeTrialInDays = null;
        }

        if (process.env.ESLO_APP_IAM_AGENT_ENABLED && process.env.ESLO_APP_IAM_AGENT_ENABLED.toLowerCase() === 'true') {
            this.iamAgentEnabled = true;

            if (!process.env.ESLO_APP_IAM_AGENT_URL) {
                logger.error({
                    message: errorMsgPrefix,
                    source: 'esloConfig',
                    context: {
                        variable: 'iamAgentUrl',
                    },
                });
                process.exit(1);
            }
            this.iamAgentUrl = process.env.ESLO_APP_IAM_AGENT_URL;

            if (!process.env.ESLO_APP_IAM_AGENT_TOKEN) {
                logger.error({
                    message: errorMsgPrefix,
                    source: 'esloConfig',
                    context: {
                        variable: 'iamAgentToken',
                    },
                });
                process.exit(1);
            }
            this.iamAgentToken = process.env.ESLO_APP_IAM_AGENT_TOKEN;
        } else {
            logger.warn({
                message: 'IAM Agent is not enabled',
                source: 'esloConfig',
                context: {
                    variable: 'iamAgentEnabled',
                },
            });

            this.iamAgentEnabled = false;
            this.iamAgentUrl = null;
            this.iamAgentToken = null;
        }

        // Live Chat
        if (process.env.ESLO_APP_LIVE_CHAT_ENABLED && process.env.ESLO_APP_LIVE_CHAT_ENABLED.toLowerCase() === 'true') {
            this.liveChatEnabled = true;

            if (!process.env.ESLO_APP_LIVE_CHAT_SECRET) {
                logger.error({
                    message: errorMsgPrefix,
                    source: 'esloConfig',
                    context: {
                        variable: 'liveChatSecret',
                    },
                });
                process.exit(1);
            }
            this.liveChatSecret = process.env.ESLO_APP_LIVE_CHAT_SECRET;
        } else {
            this.liveChatEnabled = false;
            this.liveChatSecret = null;
        }
    }
}

export const esloConfig = new EsloConfig();
