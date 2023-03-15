import {
    Lesson,
    LessonRecordStatus,
    ClassRecord,
    StudyGroupClassRecord,
    Enrollment,
    StudyGroupClassAttendee,
} from '@prisma/client';
import { UserInputError, ApolloError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../utils/logger';
import { EnrollmentModel } from './enrollment.model';
import { EsloModel, ISourceInput } from './eslo.model';
import { StudyGroupModel } from './study-group.model';
import { UserWithSubscription } from './user-profile.model';
import { LessonModel } from './lesson.model';

interface IClassAttendeeInput {
    studentId: string;
    attended: boolean;
}

interface IStartClassInput extends ISourceInput {
    levelId: string;
    lessonId: string;
    teacherNotes: string;
}

interface IFinishClassInput extends ISourceInput {
    status: LessonRecordStatus;
    classRecordId: string;
    lessonStartedAt: string;
    lessonEndedAt: string;
    teacherNotes: string;
    attendees?: IClassAttendeeInput[];
}

interface IEditFinishedClassInput extends ISourceInput {
    classRecordId: string;
    lessonStartedAt: string;
    lessonEndedAt: string;
    teacherNotes: string;
    attendees: IClassAttendeeInput[];
}

interface IRevertClassInput extends ISourceInput {
    classRecordId: string;
}

interface IRevertLessonInput extends ISourceInput {
    lessonId: string;
}

export class ClassRecordModel extends EsloModel {
    private activeFilter = { deletedAt: null };

    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'class_record');
    }

    private static validateSource(source: ISourceInput): void {
        if (!['ENROLLMENT', 'STUDY_GROUP'].includes(source.sourceType)) {
            const message = 'Invalid source type';
            throw new UserInputError(message);
        }
    }

    private async findLastClassRecord(filter: object): Promise<ClassRecord | null> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'ClassRecord',
        });

        return this.prismaClient.classRecord.findFirst({
            where: {
                ...iamPermission.filter,
                ...filter,
                ...this.activeFilter,
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    private async findLastStudyGroupClassRecord(filter: object): Promise<StudyGroupClassRecord | null> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'StudyGroupClassRecord',
        });

        return this.prismaClient.studyGroupClassRecord.findFirst({
            where: {
                ...iamPermission.filter,
                ...filter,
                ...this.activeFilter,
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    private async findLastClass(
        enrollmentFilter: object,
        studyGroupFilter: object,
    ): Promise<ClassRecord | StudyGroupClassRecord | null> {
        const enrollmentClass = await this.findLastClassRecord(enrollmentFilter);
        const studyGroupClass = await this.findLastStudyGroupClassRecord(studyGroupFilter);

        if (enrollmentClass && studyGroupClass) {
            const message = 'Found two classes in progress at the same time';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'ClassRecord',
                source: 'findLastClass',
                action: 'read',
                context: { classRecord: enrollmentClass.id, studyGroupClassRecord: studyGroupClass.id },
            });
            throw new ApolloError(message);
        }

        return enrollmentClass || studyGroupClass || null;
    }

    private static isClassFinished(status: LessonRecordStatus): boolean {
        return ['SESSION_DONE', 'LESSON_DONE'].includes(status);
    }

    public async findClassRecordById(id: string): Promise<ClassRecord | null> {
        const classRecord = await this.prismaClient.classRecord.findUnique({
            where: { id },
        });

        await this.validateIAM({
            action: 'read',
            resourceType: 'ClassRecord',
            resource: classRecord,
        });

        return classRecord;
    }

    public async findStudyGroupClassRecordById(id: string): Promise<StudyGroupClassRecord | null> {
        const studyGroupClassRecord = await this.prismaClient.studyGroupClassRecord.findUnique({
            where: { id },
        });

        await this.validateIAM({
            action: 'read',
            resourceType: 'StudyGroupClassRecord',
            resource: studyGroupClassRecord,
        });

        return studyGroupClassRecord;
    }

    public async findAllByEnrollment(enrollmentId: string): Promise<ClassRecord[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'ClassRecord',
        });

        return this.prismaClient.classRecord.findMany({
            where: {
                ...iamPermission.filter,
                ...this.activeFilter,
                enrollmentId,
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    public async findByEnrollmentLesson(enrollmentId: string, lessonId: string): Promise<ClassRecord[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'ClassRecord',
        });

        return this.prismaClient.classRecord.findMany({
            where: {
                ...iamPermission.filter,
                ...this.activeFilter,
                enrollmentId,
                lessonId,
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    public async findByStudyGroupLesson(studyGroupId: string, lessonId: string): Promise<StudyGroupClassRecord[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'StudyGroupClassRecord',
        });

        return this.prismaClient.studyGroupClassRecord.findMany({
            where: {
                ...iamPermission.filter,
                ...this.activeFilter,
                studyGroupId,
                lessonId,
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    public async findClassInProgressByTeacher(teacherId: string): Promise<ClassRecord | StudyGroupClassRecord | null> {
        const enrollmentFilter = {
            status: 'IN_PROGRESS',
            enrollment: { teacherId, studyGroupId: null },
        };

        const studyGroupTeacher = {
            status: 'IN_PROGRESS',
            studyGroupTeacher: { teacherId },
        };

        return this.findLastClass(enrollmentFilter, studyGroupTeacher);
    }

    public async findClassInProgressBySource(
        source: ISourceInput,
    ): Promise<ClassRecord | StudyGroupClassRecord | null> {
        ClassRecordModel.validateSource(source);

        // enrollment
        if (source.sourceType === 'ENROLLMENT') {
            return this.findLastClassRecord({ enrollmentId: source.sourceId, status: 'IN_PROGRESS' });
        }

        // study group
        return this.findLastStudyGroupClassRecord({ studyGroupId: source.sourceId, status: 'IN_PROGRESS' });
    }

    public async findLastLessonBySource(source: ISourceInput): Promise<ClassRecord | StudyGroupClassRecord | null> {
        ClassRecordModel.validateSource(source);

        // enrollment
        if (source.sourceType === 'ENROLLMENT') {
            return this.findLastClassRecord({ enrollmentId: source.sourceId });
        }

        // study group
        return this.findLastStudyGroupClassRecord({ studyGroupId: source.sourceId });
    }

    public async findNextLessonBySource(source: ISourceInput): Promise<Lesson | null> {
        ClassRecordModel.validateSource(source);

        let levelId: string;
        if (source.sourceType === 'ENROLLMENT') {
            const enrollmentModel = new EnrollmentModel(this.loggedUser);
            const enrollment = await enrollmentModel.findById(source.sourceId);
            if (!enrollment) {
                throw new UserInputError('Enrollment is invalid or is not active.');
            }

            levelId = enrollment.levelId;
        } else {
            const studyGroupModel = new StudyGroupModel(this.loggedUser);
            const studyGroup = await studyGroupModel.findById(source.sourceId);
            if (!studyGroup) {
                throw new UserInputError('Study Group is invalid or is not active.');
            }

            levelId = studyGroup.levelId;
        }

        const lessonModel = new LessonModel(this.loggedUser);
        const lastClassRecord = await this.findLastLessonBySource(source);

        if (!lastClassRecord) {
            // no class found so return first lesson of the level
            return lessonModel.findFirstLessonByLevel(levelId);
        }

        if (lastClassRecord.status !== 'LESSON_DONE') {
            // last lesson is still current
            return lessonModel.findById(lastClassRecord.lessonId);
        }

        return lessonModel.findNextLesson(lastClassRecord.lessonId);
    }

    public async canRevertClassRecord(source: ISourceInput, id: string): Promise<boolean> {
        ClassRecordModel.validateSource(source);

        // enrollment
        if (source.sourceType === 'ENROLLMENT') {
            const classRecord = await this.findClassRecordById(id);

            if (!classRecord) {
                throw new UserInputError('Class Record not found');
            }

            try {
                await this.validateIAM({
                    action: 'delete',
                    resourceType: 'ClassRecord',
                    resource: classRecord,
                });

                return true;
            } catch (error: any) {
                return false;
            }
        }

        // study group
        const studyGroupClassRecord = await this.findStudyGroupClassRecordById(id);

        if (!studyGroupClassRecord) {
            throw new UserInputError('Class Record not found');
        }

        try {
            await this.validateIAM({
                action: 'delete',
                resourceType: 'StudyGroupClassRecord',
                resource: studyGroupClassRecord,
            });

            return true;
        } catch (error: any) {
            return false;
        }
    }

    public async startClass(startClassInput: IStartClassInput): Promise<ClassRecord | StudyGroupClassRecord> {
        const source: ISourceInput = { sourceType: startClassInput.sourceType, sourceId: startClassInput.sourceId };
        ClassRecordModel.validateSource(source);

        // find lesson
        const lessonModel = new LessonModel(this.loggedUser);
        const lesson = await lessonModel.findById(startClassInput.lessonId);

        if (!lesson) {
            throw new UserInputError('Invalid lesson.');
        }

        const newClassRecord = {
            lessonId: lesson.id,
            teacherNotes: startClassInput.teacherNotes,
        };

        const enrollmentModel = new EnrollmentModel(this.loggedUser);
        const classInProgress = await this.findClassInProgressByTeacher(this.loggedUser.id);
        const nextLesson = await this.findNextLessonBySource(source);

        if (classInProgress) {
            throw new UserInputError('There is already a class in progress.');
        }

        if (nextLesson?.id !== startClassInput.lessonId) {
            throw new UserInputError('The given next lesson id is not the same of enrollment next lesson id.');
        }

        // enrollment
        if (source.sourceType === 'ENROLLMENT') {
            const enrollment = await enrollmentModel.findById(source.sourceId); // ACTIVE

            if (!enrollment) {
                throw new UserInputError('Enrollment is invalid or is not active.');
            }

            await this.validateIAM({
                action: 'create',
                resourceType: 'ClassRecord',
                resource: newClassRecord,
                context: {
                    enrollment,
                    classInProgress,
                    nextLesson,
                },
            });

            return this.prismaClient.classRecord.create({
                data: {
                    ...newClassRecord,
                    enrollmentId: enrollment.id,
                    status: 'IN_PROGRESS',
                    startedAt: new Date(),
                },
            });
        }

        // study group
        const studyGroupModel = new StudyGroupModel(this.loggedUser);
        const studyGroup = await studyGroupModel.findById(source.sourceId);

        if (!studyGroup) {
            const message = 'Study group not found';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroupClassRecord',
                source: 'startClass',
                action: 'create',
                context: { studyGroup: source.sourceId },
            });
            throw new UserInputError(message);
        }

        const studyGroupTeachers = await studyGroupModel.findStudyGroupTeachers(studyGroup.id);
        const studyGroupTeacher = studyGroupTeachers.find((teacher) => teacher.teacherId === this.loggedUser.id);

        if (!studyGroupTeacher) {
            throw new UserInputError('You are not a teacher of this study group');
        }

        const studyGroupEnrollments = await enrollmentModel.findByStudyGroup(studyGroup.id);
        if (studyGroupEnrollments.length === 0) {
            throw new UserInputError('You cannot start class for an empty study group');
        }

        await this.validateIAM({
            action: 'create',
            resourceType: 'ClassRecord',
            resource: newClassRecord,
            context: {
                studyGroup,
                studyGroupEnrollments,
                classInProgress,
                nextLesson,
            },
        });

        const classRecordId = uuidv4();
        await this.prismaClient.$transaction([
            this.prismaClient.studyGroupClassRecord.create({
                data: {
                    id: classRecordId,
                    ...newClassRecord,
                    studyGroupId: studyGroup.id,
                    status: 'IN_PROGRESS',
                    startedAt: new Date(),
                    studyGroupTeacherId: studyGroupTeacher.id,
                },
            }),
            // Assume all students attended the class and delete later if no show by end of the class
            ...studyGroupEnrollments.map((studentEnrollment: Enrollment) =>
                this.prismaClient.classRecord.create({
                    data: {
                        ...newClassRecord,
                        enrollmentId: studentEnrollment.id,
                        lessonId: lesson.id,
                        status: 'IN_PROGRESS',
                        startedAt: new Date(),
                        studyGroupClassAttendee: {
                            create: {
                                studyGroupClassRecordId: classRecordId,
                                studentId: studentEnrollment.id,
                                attended: true,
                            },
                        },
                    },
                }),
            ),
        ]);

        const createdClassRecord = await this.findStudyGroupClassRecordById(classRecordId);
        if (!createdClassRecord) {
            throw new ApolloError('Error while creating study group class record');
        }

        return createdClassRecord;
    }

    public async finishClass(finishClassInput: IFinishClassInput): Promise<ClassRecord | StudyGroupClassRecord | null> {
        const source: ISourceInput = { sourceType: finishClassInput.sourceType, sourceId: finishClassInput.sourceId };
        ClassRecordModel.validateSource(source);

        if (!ClassRecordModel.isClassFinished(finishClassInput.status)) {
            throw new UserInputError('Invalid class status');
        }

        const enrollmentModel = new EnrollmentModel(this.loggedUser);
        const classInProgress = await this.findClassInProgressByTeacher(this.loggedUser.id);

        const classRecordInput = {
            status: finishClassInput.status,
            lessonStartedAt: finishClassInput.lessonStartedAt,
            lessonEndedAt: finishClassInput.lessonEndedAt,
            teacherNotes: finishClassInput.teacherNotes,
        };

        // enrollment
        if (source.sourceType === 'ENROLLMENT') {
            const classRecord = await this.findClassRecordById(finishClassInput.classRecordId);

            if (!classRecord || classRecord.enrollmentId !== source.sourceId) {
                throw new UserInputError('Class record not found');
            }

            // find enrollment
            const enrollment = await enrollmentModel.findById(source.sourceId);

            if (!enrollment) {
                throw new UserInputError('Enrollment is invalid or is not active.');
            }

            if (!classInProgress || classInProgress.id !== classRecord.id) {
                throw new UserInputError('The class record is not the current class in progress');
            }

            // finish class
            return this.prismaClient.classRecord.update({
                data: {
                    ...classRecordInput,
                    completedAt: new Date(),
                },
                where: { id: classInProgress?.id },
                include: { enrollment: true },
            });
        }

        // study group
        const classRecord = await this.findStudyGroupClassRecordById(finishClassInput.classRecordId);

        if (!classRecord || classRecord.studyGroupId !== source.sourceId) {
            throw new UserInputError('Class record not found');
        }

        const studyGroupModel = new StudyGroupModel(this.loggedUser);
        const studyGroup = await studyGroupModel.findById(source.sourceId);
        if (!studyGroup) {
            throw new UserInputError('Study group not found');
        }

        if (!classInProgress || classInProgress.id !== classRecord.id) {
            throw new UserInputError('The class record is not the current class in progress');
        }

        if (!finishClassInput.attendees || finishClassInput.attendees.length === 0) {
            throw new UserInputError('Invalid attendees list.');
        }

        if (finishClassInput.attendees.filter((att) => att.attended).length === 0) {
            throw new UserInputError('At least one student must be present in class');
        }

        // individual student presence status
        const classAttendees = await studyGroupModel.findStudyGroupClassAttendees(classRecord.id);
        const noShowList: StudyGroupClassAttendee[] = [];
        const attendedList: StudyGroupClassAttendee[] = [];
        classAttendees.forEach((attendee) => {
            const status = finishClassInput.attendees?.filter((att) => att.studentId === attendee.studentId);
            if (!status || status.length !== 1) {
                throw new UserInputError('Invalid attendees list.');
            }
            if (!status[0].attended) {
                noShowList.push(attendee);
            } else {
                attendedList.push(attendee);
            }
        });

        await this.prismaClient.$transaction([
            this.prismaClient.studyGroupClassRecord.update({
                where: {
                    id: classInProgress.id,
                },
                data: {
                    ...classRecordInput,
                    completedAt: new Date(),
                    studyGroupClassAttendees: {
                        updateMany: {
                            data: {
                                attended: false,
                            },
                            where: { id: { in: noShowList.map((att) => att.id) } },
                        },
                    },
                },
            }),
            // set lesson as done in student record for those who attended
            this.prismaClient.classRecord.updateMany({
                data: {
                    ...classRecordInput,
                    completedAt: new Date(),
                },
                where: {
                    id: { in: attendedList.map((att) => att.classRecordId) },
                },
            }),
            // delete student record for no shows
            this.prismaClient.classRecord.updateMany({
                data: {
                    deletedAt: new Date(),
                },
                where: {
                    id: { in: noShowList.map((att) => att.classRecordId) },
                },
            }),
        ]);

        const finishedClassRecord = await this.findStudyGroupClassRecordById(classRecord.id);
        if (!finishedClassRecord) {
            throw new ApolloError('Error while updating study group class record');
        }

        return finishedClassRecord;
    }

    public async revertFinishedClassStatus(
        revertclassInput: IRevertClassInput,
    ): Promise<ClassRecord | StudyGroupClassRecord | null> {
        const source: ISourceInput = { sourceType: revertclassInput.sourceType, sourceId: revertclassInput.sourceId };
        ClassRecordModel.validateSource(source);

        const enrollmentModel = new EnrollmentModel(this.loggedUser);

        // enrollment
        if (source.sourceType === 'ENROLLMENT') {
            const classRecord = await this.findClassRecordById(revertclassInput.classRecordId);

            if (!classRecord || classRecord.enrollmentId !== source.sourceId) {
                throw new UserInputError('Class record not found');
            }

            if (!ClassRecordModel.isClassFinished(classRecord.status)) {
                throw new UserInputError('Class is not finished yet');
            }

            // find enrollment
            const enrollment = await enrollmentModel.findById(source.sourceId);
            if (!enrollment) {
                throw new UserInputError('Enrollment is invalid or is not active.');
            }

            const canReverse = await this.canRevertClassRecord(source, classRecord.id);
            if (!canReverse) {
                throw new UserInputError('This class cannot be reverted.');
            }

            // delete lesson
            return this.prismaClient.classRecord.update({
                data: {
                    deletedAt: new Date(),
                },
                where: { id: classRecord.id },
            });
        }

        // study group
        const classRecord = await this.findStudyGroupClassRecordById(revertclassInput.classRecordId);

        if (!classRecord || classRecord.studyGroupId !== source.sourceId) {
            throw new UserInputError('Class record not found');
        }

        if (!ClassRecordModel.isClassFinished(classRecord.status)) {
            throw new UserInputError('Class is not finished yet');
        }

        const studyGroupModel = new StudyGroupModel(this.loggedUser);
        const studyGroup = await studyGroupModel.findById(source.sourceId);
        if (!studyGroup) {
            throw new UserInputError('Study group not found');
        }

        const canReverse = await this.canRevertClassRecord(source, classRecord.id);
        if (!canReverse) {
            throw new UserInputError('This class cannot be reverted.');
        }

        const classAttendees = await studyGroupModel.findStudyGroupClassAttendees(classRecord.id);

        await this.prismaClient.$transaction([
            this.prismaClient.studyGroupClassRecord.update({
                where: { id: classRecord.id },
                data: {
                    deletedAt: new Date(),
                    studyGroupClassAttendees: {
                        updateMany: {
                            data: {
                                deletedAt: new Date(),
                            },
                            where: { classRecordId: classRecord.id, deletedAt: null },
                        },
                    },
                },
            }),
            this.prismaClient.classRecord.updateMany({
                data: {
                    deletedAt: new Date(),
                },
                where: {
                    id: { in: classAttendees.map((att) => att.classRecordId) },
                    deletedAt: null,
                },
            }),
        ]);

        const finishedClassRecord = await this.findStudyGroupClassRecordById(classRecord.id);
        if (!finishedClassRecord) {
            throw new ApolloError('Error while updating study group class record');
        }

        return finishedClassRecord;
    }

    public async editFinishedClass(
        editFinishedClassInput: IEditFinishedClassInput,
    ): Promise<ClassRecord | StudyGroupClassRecord | null> {
        const source: ISourceInput = {
            sourceType: editFinishedClassInput.sourceType,
            sourceId: editFinishedClassInput.sourceId,
        };
        ClassRecordModel.validateSource(source);

        const enrollmentModel = new EnrollmentModel(this.loggedUser);

        // enrollment
        if (source.sourceType === 'ENROLLMENT') {
            const classRecord = await this.findClassRecordById(editFinishedClassInput.classRecordId);

            if (!classRecord || classRecord.enrollmentId !== source.sourceId) {
                throw new UserInputError('Class record not found');
            }

            if (!ClassRecordModel.isClassFinished(classRecord.status)) {
                throw new UserInputError('Class is not finished yet');
            }

            // find enrollment
            const enrollment = await enrollmentModel.findById(source.sourceId);
            if (!enrollment) {
                throw new UserInputError('Enrollment is invalid or is not active.');
            }

            const canReverse = await this.canRevertClassRecord(source, classRecord.id);
            if (!canReverse) {
                throw new UserInputError('This class cannot be updated.');
            }

            // update class
            return this.prismaClient.classRecord.update({
                data: {
                    lessonStartedAt: editFinishedClassInput.lessonStartedAt,
                    lessonEndedAt: editFinishedClassInput.lessonEndedAt,
                    teacherNotes: editFinishedClassInput.teacherNotes,
                },
                where: { id: classRecord.id },
            });
        }

        // study group
        const classRecord = await this.findStudyGroupClassRecordById(editFinishedClassInput.classRecordId);

        if (!classRecord || classRecord.studyGroupId !== source.sourceId) {
            throw new UserInputError('Class record not found');
        }

        if (!ClassRecordModel.isClassFinished(classRecord.status)) {
            throw new UserInputError('Class is not finished yet');
        }

        const studyGroupModel = new StudyGroupModel(this.loggedUser);
        const studyGroup = await studyGroupModel.findById(source.sourceId);
        if (!studyGroup) {
            throw new UserInputError('Study group not found');
        }

        const canReverse = await this.canRevertClassRecord(source, classRecord.id);
        if (!canReverse) {
            throw new UserInputError('This class cannot be updated');
        }

        // individual student presence status
        const classAttendees = await studyGroupModel.findStudyGroupClassAttendees(classRecord.id);
        const updatedAttendees: StudyGroupClassAttendee[] = [];
        classAttendees.forEach((attendee) => {
            const status = editFinishedClassInput.attendees?.filter((att) => att.studentId === attendee.studentId);
            if (!status || status.length !== 1) {
                throw new UserInputError('Invalid attendees list.');
            }

            if (attendee.attended !== status[0].attended) {
                updatedAttendees.push({
                    id: attendee.id,
                    attended: status[0].attended,
                    studyGroupClassRecordId: attendee.studyGroupClassRecordId,
                    studentId: attendee.studentId,
                    classRecordId: attendee.classRecordId,
                    createdAt: attendee.createdAt,
                    updatedAt: attendee.updatedAt,
                    deletedAt: attendee.deletedAt,
                });
            }
        });

        await this.prismaClient.$transaction([
            this.prismaClient.studyGroupClassRecord.update({
                where: { id: classRecord.id },
                data: {
                    lessonStartedAt: editFinishedClassInput.lessonStartedAt,
                    lessonEndedAt: editFinishedClassInput.lessonEndedAt,
                    teacherNotes: editFinishedClassInput.teacherNotes,
                },
            }),
            ...updatedAttendees.map((attendee) =>
                this.prismaClient.studyGroupClassAttendee.update({
                    data: {
                        attended: attendee.attended,
                        deletedAt: null,
                    },
                    where: { id: attendee.id },
                }),
            ),
            // delete class record
            this.prismaClient.classRecord.updateMany({
                data: {
                    lessonStartedAt: editFinishedClassInput.lessonStartedAt,
                    lessonEndedAt: editFinishedClassInput.lessonEndedAt,
                    teacherNotes: editFinishedClassInput.teacherNotes,
                    deletedAt: new Date(),
                },
                where: { id: { in: updatedAttendees.filter((att) => !att.attended).map((attendee) => attendee.id) } },
            }),
            // reverse class record deletion
            this.prismaClient.classRecord.updateMany({
                data: {
                    lessonStartedAt: editFinishedClassInput.lessonStartedAt,
                    lessonEndedAt: editFinishedClassInput.lessonEndedAt,
                    teacherNotes: editFinishedClassInput.teacherNotes,
                    deletedAt: null,
                },
                where: { id: { in: updatedAttendees.filter((att) => att.attended).map((attendee) => attendee.id) } },
            }),
        ]);

        const finishedClassRecord = await this.findStudyGroupClassRecordById(classRecord.id);
        if (!finishedClassRecord) {
            throw new ApolloError('Error while updating study group class record');
        }

        return finishedClassRecord;
    }

    public async revertLessonStatus(revertLessonInput: IRevertLessonInput): Promise<Lesson | null> {
        const source: ISourceInput = {
            sourceType: revertLessonInput.sourceType,
            sourceId: revertLessonInput.sourceId,
        };
        ClassRecordModel.validateSource(source);

        const lessonModel = new LessonModel(this.loggedUser);
        const lesson = await lessonModel.findById(revertLessonInput.lessonId);
        if (!lesson) {
            throw new UserInputError('Lesson not found.');
        }

        const lastLesson = await this.findLastLessonBySource(source);

        logger.info({ message: 'revertLessonStatus', context: { lesson, lastLesson } });
        if (!lastLesson || lastLesson.lessonId !== lesson.id) {
            throw new UserInputError('Only the last lesson given can be reversed');
        }

        let classRecords: ClassRecord[] | StudyGroupClassRecord[];
        if (source.sourceType === 'ENROLLMENT') {
            const enrollmentModel = new EnrollmentModel(this.loggedUser);

            // find enrollment
            const enrollment = await enrollmentModel.findById(source.sourceId);
            if (!enrollment) {
                throw new UserInputError('Enrollment is invalid or is not active.');
            }

            classRecords = await this.findByEnrollmentLesson(enrollment.id, lesson.id);
        } else {
            const studyGroupModel = new StudyGroupModel(this.loggedUser);
            const studyGroup = await studyGroupModel.findById(source.sourceId);
            if (!studyGroup) {
                throw new UserInputError('Study group not found');
            }

            classRecords = await this.findByStudyGroupLesson(studyGroup.id, lesson.id);
        }

        // validate if all class records can be reverted first
        await Promise.all(
            classRecords.map((classRecord: ClassRecord | StudyGroupClassRecord) =>
                this.canRevertClassRecord(source, classRecord.id),
            ),
        );

        // then revert class records
        await Promise.all(
            classRecords.map(async (classRecord: ClassRecord | StudyGroupClassRecord) =>
                this.revertFinishedClassStatus({
                    ...source,
                    classRecordId: classRecord.id,
                }),
            ),
        );

        return lesson;
    }
}
