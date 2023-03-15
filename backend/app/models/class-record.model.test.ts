import {
    AvailabilityType,
    Enrollment,
    EnrollmentStatus,
    EventStatus,
    EventVisibility,
    SourceType,
    User,
    ClassRecord,
    LessonRecordStatus,
    StudyGroupClassRecord,
    Prisma,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prismaClient } from '../prisma';
import { esloTest } from '../test';
import { IEventInput } from './calendar.model';
// import { EnrollmentModel } from './enrollment.model';
import { ClassRecordModel } from './class-record.model';
import { StudyGroupModel } from './study-group.model';

jest.setTimeout(3 * 60 * 1000);

const testUserEnrollment: User = {
    id: uuidv4(),
    primaryEmail: 'testUserEnrollment@eslo.com.br',
    firstName: 'UserEnrollment',
    familyName: 'Tests',
    displayName: 'Tests',
    profilePicUrl: null,
    dateOfBirth: null,
    gender: null,
    banned: false,
    bannedAt: null,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testUserStudyGroupEnrollment: User = {
    id: uuidv4(),
    primaryEmail: 'testUserStudyGroupEnrollment@eslo.com.br',
    firstName: 'UserStudyGroupEnrollment',
    familyName: 'Tests',
    displayName: 'Tests',
    profilePicUrl: null,
    dateOfBirth: null,
    gender: null,
    banned: false,
    bannedAt: null,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testEnrollment: Enrollment = {
    id: uuidv4(),
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    status: EnrollmentStatus.ACTIVE,
    teacherId: esloTest.userTeacherA.id,
    studentId: testUserEnrollment.id,
    studyGroupId: null,
    registrationDate: new Date(),
    activationDate: new Date(),
    externalKey: '',
    completedAt: null,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testEnrollmentEvent = {
    id: uuidv4(),
    title: 'Enrollment',
    description: 'A1 - STARTER',
    sourceType: SourceType.ENROLLMENT,
    availabilityType: AvailabilityType.BUSY,
    startDateTime: new Date('2021-04-27T23:32:56.732Z'),
    startTimeZone: 'America/Sao_Paulo',
    endDateTime: new Date('2021-04-27T23:32:56.732Z'),
    endTimeZone: 'America/Sao_Paulo',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TH,WE',
    studyGroupId: null,
    enrollmentId: testEnrollment.id,
    iCalUID: null,
    conferenceData: Prisma.DbNull,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    organiserId: esloTest.userTeacherA.id,
    ownerId: esloTest.userTeacherA.id,
    status: EnrollmentStatus.CONFIRMED,
    sendNotifications: true,
    visibility: EventVisibility.PUBLIC,
};

const testEnrollmentClassInProgress: ClassRecord = {
    id: uuidv4(),
    enrollmentId: testEnrollment.id,
    lessonId: 'b5ebe7ec-b41f-4549-8a19-18687b0e3c94',
    teacherNotes: 'IN PROGRESS',
    status: LessonRecordStatus.IN_PROGRESS,
    startedAt: new Date(),
    completedAt: null,
    lessonStartedAt: new Date('2021-04-27T23:32:56.732Z'),
    lessonEndedAt: null,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testEnrollmentFinishedLesson: ClassRecord = {
    id: uuidv4(),
    enrollmentId: testEnrollment.id,
    lessonId: 'b5ebe7ec-b41f-4549-8a19-18687b0e3c94',
    teacherNotes: 'IN PROGRESS',
    status: LessonRecordStatus.LESSON_DONE,
    startedAt: new Date(),
    completedAt: new Date(),
    lessonStartedAt: new Date('2021-04-27T23:32:56.732Z'),
    lessonEndedAt: new Date(),
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testStudyGroupEvent: IEventInput = {
    id: uuidv4(),
    title: 'Grupo',
    description: 'A1 - STARTER',
    sourceType: SourceType.STUDY_GROUP,
    availabilityType: AvailabilityType.BUSY,
    startDateTime: '2021-04-27T23:32:56.732Z',
    startTimeZone: 'America/Sao_Paulo',
    endDateTime: '2021-04-27T23:32:56.732Z',
    endTimeZone: 'America/Sao_Paulo',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TH,WE',
    // organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
    // ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
    status: EventStatus.CONFIRMED,
    sendNotifications: true,
    visibility: EventVisibility.PUBLIC,
};

const testStudyGroup = {
    id: uuidv4(),
    name: 'test',
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    events: [testStudyGroupEvent],
};

beforeEach(async () => {
    await esloTest.resetDB();
    await esloTest.createTestUsers();
});

afterEach(async () => {
    await esloTest.prismaClient.$disconnect();
});

describe('findById', () => {
    test('find lesson tracker by id', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });
        await prismaClient.classRecord.create({ data: testEnrollmentClassInProgress });
        expect(await classRecordModel.findClassRecordById(testEnrollmentClassInProgress.id)).toBeTruthy();
    });

    // User input errors
    test('Find no lesson tracker with invalid id', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        expect(await classRecordModel.findClassRecordById('2915823a-524a-4d26-ae00-985362060a9e')).toBeNull();
    });
});

describe('findClassInProgress', () => {
    test('Find lesson in progress (ENROLLMENT)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });
        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newEnrollment.id,
            sourceType: 'ENROLLMENT',
            teacherNotes: 'test',
        });
        expect(await classRecordModel.findClassInProgressByTeacher(esloTest.userTeacherA.id)).toBeTruthy();
    });

    test('Find lesson in progress (STUDY_GROUP)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        await prismaClient.user.create({ data: testUserStudyGroupEnrollment });

        const testStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            status: EnrollmentStatus.ACTIVE,
            teacherId: esloTest.userTeacherA.id,
            studentId: testUserStudyGroupEnrollment.id,
            studyGroupId: newStudyGroup.id,
            registrationDate: new Date(),
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
        };

        await prismaClient.enrollment.create({ data: testStudyGroupEnrollment });
        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });
        expect(await classRecordModel.findClassInProgressByTeacher(esloTest.userTeacherA.id)).toBeTruthy();
    });

    // User input errors
    test('Find no lesson in progress with invalid source type', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        // eslint-disable-next-line jest/valid-expect
        expect(() => classRecordModel.findClassInProgressByTeacher(esloTest.userTeacherA.id)).rejects.toThrow(
            'Invalid source type.',
        );
    });

    test('Find no lesson in progress for enrollment with no started class', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        expect(await classRecordModel.findClassInProgressByTeacher(esloTest.userTeacherA.id)).toBeNull();
    });

    test('Find no lesson in progress for StudyGroup with no started class', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        await studyGroupModel.createStudyGroup(testStudyGroup);
        expect(await classRecordModel.findClassInProgressByTeacher(esloTest.userTeacherA.id)).toBeNull();
    });
});

describe('findClassInProgressById', () => {
    test('Find lesson in progress by id (ENROLLMENT)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });
        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newEnrollment.id,
            sourceType: 'ENROLLMENT',
            teacherNotes: 'test',
        });
        expect(
            await classRecordModel.findClassInProgressBySource({
                sourceType: 'ENROLLMENT',
                sourceId: newEnrollment.id,
            }),
        ).toBeTruthy();
    });

    test('Find lesson in progress by id (STUDY_GROUP)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        await prismaClient.user.create({ data: testUserStudyGroupEnrollment });

        const testStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            status: EnrollmentStatus.ACTIVE,
            teacherId: esloTest.userTeacherA.id,
            studentId: testUserStudyGroupEnrollment.id,
            studyGroupId: newStudyGroup.id,
            registrationDate: new Date(),
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
        };

        await prismaClient.enrollment.create({ data: testStudyGroupEnrollment });
        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });

        expect(
            await classRecordModel.findClassInProgressBySource({
                sourceType: 'STUDY_GROUP',
                sourceId: newStudyGroup.id,
            }),
        ).toBeTruthy();
    });

    // User input errors
    test('Find no lesson in progress for enrollment with no started class', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });

        expect(
            await classRecordModel.findClassInProgressBySource({
                sourceType: 'ENROLLMENT',
                sourceId: newEnrollment.id,
            }),
        ).toBeNull();
    });

    test('Find no lesson in progress for StudyGroup with no started class', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        expect(
            await classRecordModel.findClassInProgressBySource({
                sourceType: 'STUDY_GROUP',
                sourceId: newStudyGroup.id,
            }),
        ).toBeNull();
    });

    test('find no lesson in progress with invalid studyGroupId', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        // eslint-disable-next-line jest/valid-expect
        expect(() =>
            classRecordModel.findClassInProgressBySource({
                sourceType: 'STUDY_GROUP',
                sourceId: '3f33a233-741e-4009-be3b-bde36198ec30',
            }),
        ).rejects.toThrow('Study group not found.');
    });

    test('find no lesson in progress with invalid enrollmentId', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        // eslint-disable-next-line jest/valid-expect
        expect(() =>
            classRecordModel.findClassInProgressBySource({
                sourceType: 'ENROLLMENT',
                sourceId: '3f33a233-741e-4009-be3b-bde36198ec30',
            }),
        ).rejects.toThrow('Enrollment not found.');
    });
});

describe('findLastLessonBySource', () => {
    test('find last lesson (ENROLLMENT with no lesson tracker)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });
        expect(
            await classRecordModel.findLastLessonBySource({ sourceType: 'ENROLLMENT', sourceId: newEnrollment.id }),
        ).toBeNull();
    });

    test('find last lesson (ENROLLMENT with lesson tracker)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });

        const classRecord = await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newEnrollment.id,
            sourceType: 'ENROLLMENT',
            teacherNotes: 'test',
        });

        expect(classRecord).toBeTruthy();

        await classRecordModel.finishClass({
            classRecordId: classRecord.id,
            status: 'LESSON_DONE',
            lessonStartedAt: '2021-04-27T23:32:56.732Z',
            lessonEndedAt: '2021-04-27T23:32:56.732Z',
            teacherNotes: 'FINISH',
            attendees: [{ studentId: '', attended: true }],
            sourceType: 'ENROLLMENT',
            sourceId: newEnrollment.id,
        });
        expect(
            await classRecordModel.findLastLessonBySource({ sourceType: 'ENROLLMENT', sourceId: newEnrollment.id }),
        ).toBeTruthy();
    });

    test('find last lesson (STUDY_GROUP with no lesson tracker)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        expect(
            await classRecordModel.findLastLessonBySource({ sourceType: 'STUDY_GROUP', sourceId: newStudyGroup.id }),
        ).toBeNull();
    });
});

describe('findNextLesson', () => {
    test('find next lesson (ENROLLMENT with no lesson trackers)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });
        expect(
            await classRecordModel.findNextLessonBySource({ sourceType: 'ENROLLMENT', sourceId: newEnrollment.id }),
        ).toBeTruthy();
    });

    test('find next lesson (ENROLLMENT with lesson tracker)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });

        const classRecord = await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newEnrollment.id,
            sourceType: 'ENROLLMENT',
            teacherNotes: 'test',
        });

        await classRecordModel.finishClass({
            classRecordId: classRecord.id,
            status: 'LESSON_DONE',
            lessonStartedAt: '2021-04-27T23:32:56.732Z',
            lessonEndedAt: '2021-04-27T23:32:56.732Z',
            teacherNotes: 'FINISH',
            attendees: [{ studentId: '', attended: true }],
            sourceType: 'ENROLLMENT',
            sourceId: newEnrollment.id,
        });

        expect(
            await classRecordModel.findNextLessonBySource({ sourceType: 'ENROLLMENT', sourceId: newEnrollment.id }),
        ).toBeTruthy();
    });

    test('find next lesson (STUDY_GROUP) with lesson tracker', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        await prismaClient.user.create({ data: testUserStudyGroupEnrollment });
        const testStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            status: EnrollmentStatus.ACTIVE,
            teacherId: esloTest.userTeacherA.id,
            studentId: testUserStudyGroupEnrollment.id,
            studyGroupId: newStudyGroup.id,
            registrationDate: new Date(),
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
        };

        const newStudyGroupEnrollment = await prismaClient.enrollment.create({ data: testStudyGroupEnrollment });

        const classRecord = await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });

        await classRecordModel.finishClass({
            classRecordId: classRecord.id,
            status: 'LESSON_DONE',
            lessonStartedAt: '2021-04-27T23:32:56.732Z',
            lessonEndedAt: '2021-04-27T23:32:56.732Z',
            teacherNotes: 'FINISH',
            attendees: [{ studentId: newStudyGroupEnrollment.id, attended: true }],
            sourceType: 'STUDY_GROUP',
            sourceId: newStudyGroup.id,
        });
        expect(
            await classRecordModel.findNextLessonBySource({ sourceType: 'STUDY_GROUP', sourceId: newStudyGroup.id }),
        ).toBeTruthy();
    });

    test('find next lesson (STUDY_GROUP with no lesson trackers)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        expect(
            await classRecordModel.findNextLessonBySource({ sourceType: 'STUDY_GROUP', sourceId: newStudyGroup.id }),
        ).toBeTruthy();
    });
});

describe('findClassRecords', () => {
    test('Find lesson tracker records with no lesson tracker', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });
        expect(await classRecordModel.findAllByEnrollment(newEnrollment.id)).toHaveLength(0);
    });

    test('Find lesson tracker records with 1 lesson tracker', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });

        const classRecord = await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newEnrollment.id,
            sourceType: 'ENROLLMENT',
            teacherNotes: 'test',
        });

        await classRecordModel.finishClass({
            classRecordId: classRecord.id,
            status: 'LESSON_DONE',
            lessonStartedAt: '2021-04-27T23:32:56.732Z',
            lessonEndedAt: '2021-04-27T23:32:56.732Z',
            teacherNotes: 'FINISH',
            attendees: [{ studentId: '', attended: true }],
            sourceType: 'ENROLLMENT',
            sourceId: newEnrollment.id,
        });

        expect(await classRecordModel.findAllByEnrollment(newEnrollment.id)).toHaveLength(1);
    });
});

describe('isClassReversible', () => {
    test('is class reversible with lesson in progress (ENROLLMENT)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });

        const enrollmentClassInProgress = await prismaClient.classRecord.create({
            data: testEnrollmentClassInProgress,
        });

        expect(
            await classRecordModel.canRevertClassRecord(
                { sourceType: 'ENROLLMENT', sourceId: newEnrollment.id },
                enrollmentClassInProgress.id,
            ),
        ).toBeFalsy();
    });

    test('is class reversible with finished lesson (ENROLLMENT)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });
        const enrollmentClassInProgress = await prismaClient.classRecord.create({
            data: testEnrollmentFinishedLesson,
        });
        expect(
            await classRecordModel.canRevertClassRecord(
                { sourceType: 'ENROLLMENT', sourceId: newEnrollment.id },
                enrollmentClassInProgress.id,
            ),
        ).toBeTruthy();
    });

    test('is class reversible with finished lesson (ENROLLMENT) +7 days', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });

        const testEnrollmentFinishedLessonSevenDays: ClassRecord = {
            id: uuidv4(),
            enrollmentId: testEnrollment.id,
            lessonId: 'b5ebe7ec-b41f-4549-8a19-18687b0e3c94',
            teacherNotes: 'IN PROGRESS',
            status: LessonRecordStatus.LESSON_DONE,
            startedAt: new Date(),
            completedAt: new Date('2021-04-27T23:32:56.732Z'),
            lessonStartedAt: new Date('2021-04-27T23:32:56.732Z'),
            lessonEndedAt: new Date(),
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
        };

        const enrollmentClassInProgress = await prismaClient.classRecord.create({
            data: testEnrollmentFinishedLessonSevenDays,
        });
        expect(
            await classRecordModel.canRevertClassRecord(
                { sourceType: 'ENROLLMENT', sourceId: newEnrollment.id },
                enrollmentClassInProgress.id,
            ),
        ).toBeFalsy();
    });

    test('is class reversible with lesson in progress (STUDY GROUP)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        // const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newStudyGroup = await prismaClient.studyGroup.create({
            data: {
                id: uuidv4(),
                name: 'test',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            },
        });

        const newStudyGroupTeacher = await prismaClient.studyGroupTeacher.create({
            data: {
                id: uuidv4(),
                studyGroupId: newStudyGroup.id,
                teacherId: esloTest.userTeacherA.id,
            },
        });

        await prismaClient.user.create({ data: testUserStudyGroupEnrollment });

        const testStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            status: EnrollmentStatus.ACTIVE,
            teacherId: esloTest.userTeacherA.id,
            studentId: testUserStudyGroupEnrollment.id,
            studyGroupId: newStudyGroup.id,
            registrationDate: new Date(),
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
        };

        const testStudyGroupClassInProgress: StudyGroupClassRecord = {
            id: uuidv4(),
            studyGroupId: newStudyGroup.id,
            lessonId: 'b5ebe7ec-b41f-4549-8a19-18687b0e3c94',
            teacherNotes: 'TEST',
            status: LessonRecordStatus.IN_PROGRESS,
            lessonStartedAt: new Date('2021-04-27T23:32:56.732Z'),
            lessonEndedAt: null,
            startedAt: new Date('2021-04-27T23:32:56.732Z'),
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
            studyGroupTeacherId: newStudyGroupTeacher.id,
        };

        await prismaClient.enrollment.create({ data: testStudyGroupEnrollment });
        await prismaClient.studyGroupClassRecord.create({ data: testStudyGroupClassInProgress });

        expect(
            await classRecordModel.canRevertClassRecord(
                { sourceType: 'STUDY_GROUP', sourceId: newStudyGroup.id },
                testStudyGroupClassInProgress.id,
            ),
        ).toBeFalsy();
    });

    test('is class reversible with finished lesson (STUDY GROUP)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        // const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newStudyGroup = await prismaClient.studyGroup.create({
            data: {
                id: uuidv4(),
                name: 'test',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            },
        });

        const newStudyGroupTeacher = await prismaClient.studyGroupTeacher.create({
            data: {
                id: uuidv4(),
                studyGroupId: newStudyGroup.id,
                teacherId: esloTest.userTeacherA.id,
            },
        });

        await prismaClient.user.create({ data: testUserStudyGroupEnrollment });

        const testStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            status: EnrollmentStatus.ACTIVE,
            teacherId: esloTest.userTeacherA.id,
            studentId: testUserStudyGroupEnrollment.id,
            studyGroupId: newStudyGroup.id,
            registrationDate: new Date(),
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
        };

        const testStudyGroupFinishedLesson: StudyGroupClassRecord = {
            id: uuidv4(),
            studyGroupId: newStudyGroup.id,
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            teacherNotes: 'TEST',
            status: LessonRecordStatus.LESSON_DONE,
            lessonStartedAt: new Date('2021-04-27T23:32:56.732Z'),
            lessonEndedAt: new Date(),
            startedAt: new Date('2021-04-27T23:32:56.732Z'),
            completedAt: new Date(),
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
            studyGroupTeacherId: newStudyGroupTeacher.id,
        };

        await prismaClient.enrollment.create({ data: testStudyGroupEnrollment });
        await prismaClient.studyGroupClassRecord.create({ data: testStudyGroupFinishedLesson });

        expect(
            await classRecordModel.canRevertClassRecord(
                { sourceType: 'STUDY_GROUP', sourceId: newStudyGroup.id },
                testStudyGroupFinishedLesson.id,
            ),
        ).toBeTruthy();
    });

    test('is class reversible with finished lesson (STUDY GROUP) +7 days', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);

        const newStudyGroup = await prismaClient.studyGroup.create({
            data: {
                id: uuidv4(),
                name: 'test',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            },
        });

        const newStudyGroupTeacher = await prismaClient.studyGroupTeacher.create({
            data: {
                id: uuidv4(),
                studyGroupId: newStudyGroup.id,
                teacherId: esloTest.userTeacherA.id,
            },
        });

        await prismaClient.user.create({ data: testUserStudyGroupEnrollment });

        const testStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            status: EnrollmentStatus.ACTIVE,
            teacherId: esloTest.userTeacherA.id,
            studentId: testUserStudyGroupEnrollment.id,
            studyGroupId: newStudyGroup.id,
            registrationDate: new Date(),
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
        };

        const testStudyGroupFinishedLesson: StudyGroupClassRecord = {
            id: uuidv4(),
            studyGroupId: newStudyGroup.id,
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            teacherNotes: 'TEST',
            status: LessonRecordStatus.LESSON_DONE,
            lessonStartedAt: new Date('2021-04-27T23:32:56.732Z'),
            lessonEndedAt: new Date(),
            startedAt: new Date('2021-04-27T23:32:56.732Z'),
            completedAt: new Date('2021-04-27T23:32:56.732Z'),
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
            studyGroupTeacherId: newStudyGroupTeacher.id,
        };

        await prismaClient.enrollment.create({ data: testStudyGroupEnrollment });
        await prismaClient.studyGroupClassRecord.create({ data: testStudyGroupFinishedLesson });

        expect(
            await classRecordModel.canRevertClassRecord(
                { sourceType: 'STUDY_GROUP', sourceId: newStudyGroup.id },
                testStudyGroupFinishedLesson.id,
            ),
        ).toBeFalsy();
    });
});

// eslint-disable-next-line jest/no-commented-out-tests
describe('startClass', () => {
    // User input errors
    test('start class with invalid lessonId', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        // eslint-disable-next-line jest/valid-expect
        expect(async () =>
            classRecordModel.startClass({
                lessonId: 'fef47ca7-ee20-4e02-80ef-57f773e75842',
                levelId: '79c5c41a-f64b-4558-a5c8-edf77359d610',
                teacherNotes: 'test',
                sourceId: 'test',
                sourceType: 'ENROLLMENT',
            }),
        ).rejects.toThrow('Invalid lesson.');
    });

    test('start class ENROLLMENT (with lesson in progress)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });
        await prismaClient.classRecord.create({
            data: testEnrollmentClassInProgress,
        });

        // eslint-disable-next-line jest/valid-expect
        expect(async () =>
            classRecordModel.startClass({
                lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
                teacherNotes: 'test',
                sourceId: 'test',
                sourceType: 'ENROLLMENT',
            }),
        ).rejects.toThrow('There is a lesson in progress.');
    });

    test('start class STUDYGROUP (with lesson in progress', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        // const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newStudyGroup = await prismaClient.studyGroup.create({
            data: {
                id: uuidv4(),
                name: 'test',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            },
        });

        const newStudyGroupTeacher = await prismaClient.studyGroupTeacher.create({
            data: {
                id: uuidv4(),
                studyGroupId: newStudyGroup.id,
                teacherId: esloTest.userTeacherA.id,
            },
        });

        await prismaClient.user.create({ data: testUserStudyGroupEnrollment });

        const testStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            status: EnrollmentStatus.ACTIVE,
            teacherId: esloTest.userTeacherA.id,
            studentId: testUserStudyGroupEnrollment.id,
            studyGroupId: newStudyGroup.id,
            registrationDate: new Date(),
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
        };

        const testStudyGroupClassInProgress: StudyGroupClassRecord = {
            id: uuidv4(),
            studyGroupId: newStudyGroup.id,
            lessonId: 'b5ebe7ec-b41f-4549-8a19-18687b0e3c94',
            teacherNotes: 'TEST',
            status: LessonRecordStatus.IN_PROGRESS,
            lessonStartedAt: new Date('2021-04-27T23:32:56.732Z'),
            lessonEndedAt: null,
            startedAt: new Date('2021-04-27T23:32:56.732Z'),
            completedAt: null,
            createdAt: new Date(),
            updatedAt: null,
            deletedAt: null,
            studyGroupTeacherId: newStudyGroupTeacher.id,
        };

        await prismaClient.enrollment.create({ data: testStudyGroupEnrollment });
        await prismaClient.studyGroupClassRecord.create({ data: testStudyGroupClassInProgress });

        // eslint-disable-next-line jest/valid-expect
        expect(async () =>
            classRecordModel.startClass({
                lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
                teacherNotes: 'test',
                sourceId: newStudyGroup.id,
                sourceType: 'STUDY_GROUP',
            }),
        ).rejects.toThrow('There is a lesson in progress.');
    });

    test('Start class ENROLLMENT (with invalid enrollmentId)', async () => {
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.event.create({ data: testEnrollmentEvent });

        // eslint-disable-next-line jest/valid-expect
        expect(async () =>
            classRecordModel.startClass({
                lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
                teacherNotes: 'test',
                sourceId: 'da4ef8c4-fbe3-4497-b470-421b9a9dba4a',
                sourceType: 'ENROLLMENT',
            }),
        ).rejects.toThrow('Enrollment is invalid or is not active.');
    });
});
