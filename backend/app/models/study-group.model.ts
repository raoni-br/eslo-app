import { StudyGroup, StudyGroupClassRecord, StudyGroupTeacher, StudyGroupClassAttendee } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UserInputError } from 'apollo-server-express';

import { EsloModel } from './eslo.model';
import { CalendarModel, IEventInput, IModifyEventInput } from './calendar.model';
import { UserWithSubscription } from './user-profile.model';
import { ClassRecordModel } from './class-record.model';

import { logger } from '../utils/logger';

interface ICreateStudyGroupInput {
    name: string;
    levelId: string;
    events: IEventInput[];
}

interface IUpdateStudyGroupInput {
    studyGroupId: string;
    name: string;
    events: IModifyEventInput[];
}

export class StudyGroupModel extends EsloModel {
    private activeFilter = { deletedAt: null };

    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'study_group');
    }

    public findById(id: string): Promise<StudyGroup | null> {
        return this.prismaClient.studyGroup.findUnique({
            where: { id },
        });
    }

    public async findGroupsByTeacher(status?: string): Promise<StudyGroup[]> {
        if (status !== undefined && status !== 'ACTIVE' && status !== 'DELETED') {
            const message = 'Invalid status filter option';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroup',
                source: 'findGroupsByTeacher',
                action: 'list',
                context: { status },
            });
            throw new UserInputError(message);
        }

        if (status === undefined || status === 'ACTIVE') {
            return this.prismaClient.studyGroup.findMany({
                where: {
                    deletedAt: null,
                    studyGroupTeachers: {
                        some: {
                            teacherId: this.loggedUser.id,
                        },
                    },
                },
                orderBy: [{ name: 'asc' }],
            });
        }

        return this.prismaClient.studyGroup.findMany({
            where: {
                NOT: {
                    deletedAt: null,
                },
                studyGroupTeachers: {
                    some: {
                        teacherId: this.loggedUser.id,
                    },
                },
            },
        });
    }

    public findStudyGroupTeachers(studyGroupId: string): Promise<StudyGroupTeacher[]> {
        return this.prismaClient.studyGroupTeacher.findMany({
            where: { studyGroupId },
        });
    }

    public findStudyGroupClassRecords(studyGroupId: string): Promise<StudyGroupClassRecord[]> {
        return this.prismaClient.studyGroupClassRecord.findMany({
            where: {
                studyGroupId,
                deletedAt: null,
            },
        });
    }

    public findStudyGroupClassRecordById(studyGroupClassRecordId: string): Promise<StudyGroupClassRecord | null> {
        return this.prismaClient.studyGroupClassRecord.findUnique({
            where: { id: studyGroupClassRecordId },
        });
    }

    public findStudyGroupClassRecordsByLesson(
        studyGroupId: string,
        lessonId: string,
    ): Promise<StudyGroupClassRecord[] | null> {
        return this.prismaClient.studyGroupClassRecord.findMany({
            where: {
                studyGroupId,
                lessonId,
                deletedAt: null,
            },
        });
    }

    public findStudyGroupClassAttendees(studyGroupClassRecordId: string): Promise<StudyGroupClassAttendee[]> {
        return this.prismaClient.studyGroupClassAttendee.findMany({
            where: { studyGroupClassRecordId },
        });
    }

    public async createStudyGroup(newStudyGroup: ICreateStudyGroupInput): Promise<StudyGroup> {
        // name validation
        if (newStudyGroup.name.length < 1 || newStudyGroup.name === null) {
            const message = 'Invalid group name';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroup',
                source: 'createStudyGroup',
                action: 'create',
            });
            throw new UserInputError(message);
        }

        // level validation
        const level = await this.prismaClient.level.findUnique({
            where: {
                id: newStudyGroup.levelId,
            },
        });

        if (!level) {
            const message = 'Level not found';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroup',
                source: 'createStudyGroup',
                action: 'create',
                context: { level: newStudyGroup.levelId },
            });
            throw new UserInputError(message);
        }

        // create group
        const studyGroup = await this.prismaClient.studyGroup.create({
            data: {
                id: uuidv4(),
                name: newStudyGroup.name,
                levelId: newStudyGroup.levelId,
            },
        });

        await this.prismaClient.studyGroupTeacher.create({
            data: {
                id: uuidv4(),
                studyGroupId: studyGroup.id,
                teacherId: this.loggedUser.id,
            },
        });

        // validating events
        if (newStudyGroup.events.length === 0 || newStudyGroup.events === null || newStudyGroup.events === undefined) {
            const message = 'No events received';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroup',
                source: 'createStudyGroup',
                action: 'create',
            });
            throw new UserInputError(message);
        }

        // create group events
        const calendarModel = new CalendarModel(this.loggedUser);
        await calendarModel.createEventsBySource({
            source: {
                sourceId: studyGroup.id,
                sourceType: 'STUDY_GROUP',
            },
            events: newStudyGroup.events,
        });

        return studyGroup;
    }

    public async removeStudyGroup(studyGroupId: string): Promise<StudyGroup> {
        const classRecordModel = new ClassRecordModel(this.loggedUser);
        const studyGroup = await this.prismaClient.studyGroup.findUnique({
            where: {
                id: studyGroupId,
            },
            include: {
                enrollments: true,
                studyGroupTeachers: true,
            },
        });

        if (!studyGroup) {
            throw new UserInputError('Group not found.');
        }

        // TODO: iam-agent
        // if (studyGroup?.studyGroupTeachers.some((teacher) => teacher.teacherId === this.loggedUser.id) === false) {
        //     logger.error(`User ${this.loggedUser.id} is not a teacher from ${studyGroup?.id}`);
        //     throw new UserInputError('Logged user is not a teacher from this study group.');
        // }

        // checking if the group is already deleted
        if (studyGroup.deletedAt != null) {
            throw new UserInputError('This group is already deleted.');
        }

        // find lesson in progress
        const classInProgress = await classRecordModel.findClassInProgressBySource({
            sourceType: 'STUDY_GROUP',
            sourceId: studyGroup.id,
        });

        if (classInProgress) {
            const message = 'There is a lesson in progress for this studyGroup';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroup',
                source: 'removeStudyGroup',
                action: 'delete',
                context: { studyGroup: studyGroup.id },
            });
            throw new UserInputError(message);
        }

        // deleting empty group
        if (studyGroup.enrollments.some((enrollment) => enrollment.status !== 'CANCELLED')) {
            throw new UserInputError('This group is not empty.');
        }

        await this.prismaClient.studyGroup.update({
            where: {
                id: studyGroup.id,
            },
            data: {
                deletedAt: new Date(),
                studyGroupTeachers: {
                    updateMany: {
                        data: {
                            completedAt: new Date(),
                        },
                        where: { completedAt: null },
                    },
                },
                events: {
                    updateMany: {
                        data: {
                            completedAt: new Date(),
                            status: 'CANCELLED',
                        },
                        where: { completedAt: null },
                    },
                },
            },
        });

        return studyGroup;
    }

    public async updateStudyGroup(studyGroupInput: IUpdateStudyGroupInput): Promise<StudyGroup> {
        // checking if the group exists
        const studyGroup = await this.prismaClient.studyGroup.findUnique({
            where: {
                id: studyGroupInput.studyGroupId,
            },
            include: { studyGroupTeachers: true },
        });

        if (!studyGroup) {
            throw new UserInputError('Group not found.');
        }

        // TODO: iam-agent
        // if (studyGroup?.studyGroupTeachers.some((teacher) => teacher.teacherId === this.loggedUser.id) === false) {
        //     logger.error(`User ${this.loggedUser.id} is not a teacher from ${studyGroup?.id}`);
        //     throw new UserInputError('Logged user is not a teacher from this study group.');
        // }

        // checking name
        if (studyGroupInput.name.length < 1 || studyGroupInput.name === null) {
            const message = 'Invalid study group name';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroup',
                source: 'updateStudyGroup',
                action: 'update',
                context: { studyGroup: studyGroup.id },
            });
            throw new UserInputError(message);
        }

        const calendarModel = new CalendarModel(this.loggedUser);
        await calendarModel.changeScheduleBySource({
            sourceType: 'STUDY_GROUP',
            sourceId: studyGroup.id,
            events: studyGroupInput.events,
        });

        return this.prismaClient.studyGroup.update({
            where: { id: studyGroup.id },
            data: { name: studyGroupInput.name },
        });
    }
}
