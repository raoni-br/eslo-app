import { Enrollment, Event, StudyGroup, User } from '@prisma/client';
import { ApolloError, ForbiddenError } from 'apollo-server-express';

import { logger } from '../utils/logger';
import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';

export interface IAppData {
    id: string;
    users: User[];
    studyGroups: StudyGroup[];
    enrollments: Enrollment[];
    events: Event[];
}

export class AdminModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'admin');
    }

    public async extractData(): Promise<IAppData> {
        const userDomain = this.loggedUser.primaryEmail.split('@')[1];

        if (userDomain !== 'eslo.com.br') {
            // TODO: move to iam agent
            // logger.warn(`User ${this.loggedUser.id} attempted admin endpoint with domain ${userDomain}`);
            throw new ForbiddenError('User does not have permission.');
        }

        // User, UserPhoneNumber, UserIdentification, UserAuthentication (N/A), UserAddress
        const users = await this.prismaClient.user.findMany({}).catch((error) => {
            const message = 'Error while retrieving users';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                errorDetails: error.message,
                source: 'extractData',
            });
            throw new ApolloError(message);
        });

        // StudyGroup, StudyGroupTeacher, StudyGroupClassRecord, StudyGroupClassAttendee
        const studyGroups = await this.prismaClient.studyGroup.findMany({}).catch((error) => {
            const message = 'Error while retrieving studyGroups';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                errorDetails: error.message,
                source: 'extractData',
            });

            throw new ApolloError(message);
        });

        // Enrollment, Invitation, ClassRecord
        const enrollments = await this.prismaClient.enrollment.findMany({}).catch((error) => {
            const message = 'Error while retrieving enrollments';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                errorDetails: error.message,
                source: 'extractData',
            });
            throw new ApolloError(message);
        });

        // Event, EventAttendee, EventOccurrence, EventOccurrenceAttendee
        const events = await this.prismaClient.event.findMany({}).catch((error) => {
            const message = 'Error while retrieving events';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                errorDetails: error.message,
                source: 'extractData',
            });
            throw new ApolloError(message);
        });

        // Not included: Program, Module, Level, Lesson
        const appData: IAppData = { id: this.loggedUser.id, users, enrollments, events, studyGroups };
        return appData;
    }
}
