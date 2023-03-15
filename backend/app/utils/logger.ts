import { Prisma } from '@prisma/client';
import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

import { ActionTypes } from '../services/iam-client';

export interface EsloLog {
    message: string;
    errorDetails?: string;
    source?: string;
    subjectId?: string;
    resourceType?: Prisma.ModelName;
    action?: ActionTypes;
    context?: object;
}

class EsloLogger {
    private logger: winston.Logger;

    constructor() {
        if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test') {
            this.logger = winston.createLogger({
                level: 'debug',
                format: winston.format.prettyPrint(),
                transports: [new winston.transports.Console({ handleExceptions: true })],
            });
        } else {
            this.logger = winston.createLogger({
                level: 'info',
                // Format is breaking the log structure in GCP
                // format: winston.format.json(),
                // In production it goes to GCP Operations Logging
                transports: [
                    new winston.transports.Console(),
                    new LoggingWinston({
                        prefix: 'eslo-app',
                        logName: 'eslo-application-logs',
                        resource: {
                            type: 'cloud_run_revision',
                            labels: {
                                configuration_name: process.env.K_CONFIGURATION || '', // from cloud run
                                location: process.env.K_LOCATION || '', // from terraform
                                revision_name: process.env.K_REVISION || '', // from cloud run
                                service_name: process.env.K_SERVICE || '', // from cloud run
                            },
                        },
                        // TODO: label and service context not properly set
                        labels: {
                            configuration_name: process.env.K_CONFIGURATION || '', // from cloud run
                            location: process.env.K_LOCATION || '', // from terraform
                            revision_name: process.env.K_REVISION || '', // from cloud run
                            service_name: process.env.K_SERVICE || '', // from cloud run
                            projectId: process.env.PROJECT_ID || 'NO_PROJECT_ID',
                        },
                        serviceContext: {
                            service: process.env.K_SERVICE,
                            version: process.env.K_REVISION,
                        },
                    }),
                ],
                exceptionHandlers: [
                    new winston.transports.Console({
                        stderrLevels: ['error', 'crit', 'alert', 'emerg'],
                        handleExceptions: true,
                    }),
                ],
                exitOnError: false,
            });
        }
    }

    public info(esloLog: EsloLog): void {
        this.logger.info(esloLog);
    }

    public warn(esloLog: EsloLog): void {
        this.logger.warn(esloLog);
    }

    public error(esloLog: EsloLog): void {
        this.logger.error(esloLog);
    }
}

export const logger = new EsloLogger();
