import { AvailabilityType, SourceType, EventStatus, EventVisibility, Enrollment } from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';

import { esloTest } from '../test';
import { StudyGroupModel } from './study-group.model';
// import { InvitationModel } from './invitation.model';
import { ClassRecordModel } from './class-record.model';
import { EventStatusChange, IEventInput, IModifyEventInput } from './calendar.model';
import { prismaClient } from '../prisma';

const testEvent: IEventInput = {
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

const testNewEvent: IModifyEventInput = {
    title: 'Grupo',
    description: 'A1 - STARTER',
    availabilityType: AvailabilityType.BUSY,
    startDateTime: '2021-04-27T23:32:56.732Z',
    startTimeZone: 'America/Sao_Paulo',
    endDateTime: '2021-04-27T23:32:56.732Z',
    endTimeZone: 'America/Sao_Paulo',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TH,WE',
    changeStatus: 'NEW',
    status: EventStatus.CONFIRMED,
    sendNotifications: true,
    visibility: EventVisibility.PUBLIC,
};

const testUpdateGroupEvent = {
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
    studyGroupId: '59bb7e88-087c-4f71-8617-36f16388bcfc',
    changeStatus: 'NEW' as EventStatusChange,
    organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
    ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
    // completedAt: null,
    status: EventStatus.CONFIRMED,
    sendNotifications: true,
    visibility: EventVisibility.PUBLIC,
};

const testStudyGroup = {
    // id: uuidv4(),
    name: 'test',
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    events: [testEvent],
};

jest.setTimeout(3 * 60 * 1000);

beforeEach(async () => {
    await esloTest.resetDB();
    await esloTest.createTestUsers();
});

afterEach(async () => {
    await esloTest.prismaClient.$disconnect();
});

describe('FindGroupById', () => {
    test('find group by id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        expect(await studyGroupModel.findById(newStudyGroup.id)).toBeTruthy();
    });

    // User input error findById
    test('Find no groups for invalid id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        // id does not exist
        expect(await studyGroupModel.findById(uuidv4())).toBeNull();
    });
});

describe('FindGroupsByTeacher', () => {
    test('Find groups by teacher', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        await studyGroupModel.createStudyGroup(testStudyGroup);
        expect(await studyGroupModel.findGroupsByTeacher()).toHaveLength(1);
    });
});

describe('FindStudyGroupTeachers', () => {
    test('Find study group teachers', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        expect(await studyGroupModel.findStudyGroupTeachers(newStudyGroup.id)).toHaveLength(1);
    });

    test('Find study group teacher with invalid id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        expect(await studyGroupModel.findStudyGroupTeachers(uuidv4())).toHaveLength(0);
    });
});

describe('findStudyGroupClassRecord', () => {
    test('find study group class record', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newTestStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: newStudyGroup.levelId,
            status: 'ACTIVE',
            teacherId: esloTest.userTeacherA.id,
            studentId: esloTest.userStudentA.id,
            registrationDate: new Date(),
            studyGroupId: newStudyGroup.id,
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            deletedAt: null,
            updatedAt: null,
        };

        await prismaClient.enrollment.create({ data: newTestStudyGroupEnrollment });

        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });

        expect(await studyGroupModel.findStudyGroupClassRecords(newStudyGroup.id)).toHaveLength(1);
    });

    test('find no study group class record with invalid id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        expect(await studyGroupModel.findStudyGroupClassRecords(uuidv4())).toHaveLength(0);
    });
});

describe('findStudyGroupClassRecordByLesson', () => {
    test('find study group class record by lesson', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newTestStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: newStudyGroup.levelId,
            status: 'ACTIVE',
            teacherId: esloTest.userTeacherA.id,
            studentId: esloTest.userStudentA.id,
            registrationDate: new Date(),
            studyGroupId: newStudyGroup.id,
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            deletedAt: null,
            updatedAt: null,
        };

        await prismaClient.enrollment.create({ data: newTestStudyGroupEnrollment });

        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });

        expect(
            await studyGroupModel.findStudyGroupClassRecordsByLesson(
                newStudyGroup.id,
                '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            ),
        ).toHaveLength(1);
    });
});

describe('findStudyGroupClassRecordById', () => {
    test('find study group class record by id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newTestStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: newStudyGroup.levelId,
            status: 'ACTIVE',
            teacherId: esloTest.userTeacherA.id,
            studentId: esloTest.userStudentA.id,
            registrationDate: new Date(),
            studyGroupId: newStudyGroup.id,
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            deletedAt: null,
            updatedAt: null,
        };

        await prismaClient.enrollment.create({ data: newTestStudyGroupEnrollment });

        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });

        const studyGroupWithClassRecords = await prismaClient.studyGroup.findFirst({
            where: { id: newStudyGroup.id },
            include: { studyGroupClassRecords: true },
        });

        expect(
            await studyGroupModel.findStudyGroupClassRecordById(
                studyGroupWithClassRecords !== null ? studyGroupWithClassRecords?.studyGroupClassRecords[0].id : 'test',
            ),
        ).toBeTruthy();
    });

    // User input errors
    test('find study group class record by id with invalid id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        expect(await studyGroupModel.findStudyGroupClassRecordById(uuidv4())).toBeNull();
    });
});

describe('findStudyGroupClassAttendees', () => {
    test('find study group class attendees', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newTestStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: newStudyGroup.levelId,
            status: 'ACTIVE',
            teacherId: esloTest.userTeacherA.id,
            studentId: esloTest.userStudentA.id,
            registrationDate: new Date(),
            studyGroupId: newStudyGroup.id,
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            deletedAt: null,
            updatedAt: null,
        };

        await prismaClient.enrollment.create({ data: newTestStudyGroupEnrollment });

        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });

        const studyGroupWithClassRecords = await prismaClient.studyGroup.findFirst({
            where: { id: newStudyGroup.id },
            include: { studyGroupClassRecords: true },
        });

        expect(
            await studyGroupModel.findStudyGroupClassAttendees(
                studyGroupWithClassRecords !== null ? studyGroupWithClassRecords?.studyGroupClassRecords[0].id : 'test',
            ),
        ).toHaveLength(1);
    });

    // User input errors findStudyGroupClassAttendees
    test('find study group class attendee with invalid id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        expect(await studyGroupModel.findStudyGroupClassAttendees('8b49dbe9-bd6a-4f4f-bbd6-3b11196ebb7e')).toHaveLength(
            0,
        );
    });
});

describe('createStudyGroup', () => {
    test('Create studyGroup', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        expect(await studyGroupModel.createStudyGroup(testStudyGroup)).toBeTruthy();
    });

    // User input errors createStudyGroup
    test('Thow error when trying to create studyGroup with no events', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        await expect(() =>
            studyGroupModel.createStudyGroup({
                name: 'test',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
                events: [],
            }),
        ).rejects.toThrow('No events received.');
    });

    test('Throw error when trying to create studyGroup with invalid name', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        await expect(() =>
            studyGroupModel.createStudyGroup({
                name: '',
                levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
                events: [testEvent],
            }),
        ).rejects.toThrow('Invalid group name.');
    });

    test('Throw error when trying to create studyGroup with invalid level', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        await expect(() =>
            // levelId does not exist
            studyGroupModel.createStudyGroup({
                name: 'test',
                levelId: '742175ae-4095-4abc-8761-bf32cbc1bf00',
                events: [testEvent],
            }),
        ).rejects.toThrow('Invalid level id.');
    });
});

describe('removeStudyGroup', () => {
    test('Remove Study Group', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        expect(await studyGroupModel.removeStudyGroup(newStudyGroup.id)).toBeTruthy();
    });

    // User input errors removeStudyGroup
    test('Throw error when trying to delete group with invalid id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        // studyGrupId does not exist
        await expect(() => studyGroupModel.removeStudyGroup(uuidv4())).rejects.toThrow('Group not found.');
    });

    test('Throw error when trying to delete group already deleted', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        await studyGroupModel.removeStudyGroup(newStudyGroup.id);
        await expect(() => studyGroupModel.removeStudyGroup(newStudyGroup.id)).rejects.toThrow(
            'This group is already deleted.',
        );
    });

    test('Throw error when trying to delete a group with a invalid teacher', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        // find studyGroupTeacher id
        const studyGroupTeacher = await esloTest.prismaClient.studyGroupTeacher.findFirst({
            where: { studyGroupId: newStudyGroup.id },
        });

        // Editing teacherId
        await esloTest.prismaClient.studyGroupTeacher.update({
            data: {
                teacherId: esloTest.userTeacherB.id,
            },
            where: {
                id: studyGroupTeacher?.id,
            },
        });
        await expect(() => studyGroupModel.removeStudyGroup(newStudyGroup.id)).rejects.toThrow(
            'Logged user is not a teacher from this study group.',
        );
    });

    test('Throw error when trying to delete a not empty group', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        // const invitationModel = new InvitationModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        // create enrollment invitation to populate group
        // const enrollmentInput = {
        //     studyGroupId: newStudyGroup.id,
        //     levelId: '',
        //     events: [],
        // };

        // const invitationInput = {
        //     inviteeEmail: 'teste@teste.com',
        //     inviteeFirstName: 'teste',
        //     inviteeSurname: 'teste',
        //     sourceType: SourceType.STUDY_GROUP,
        // };

        // await invitationModel.sendEnrollmentInvitation(invitationInput, enrollmentInput);

        // trying to remove the not empty group
        await expect(() => studyGroupModel.removeStudyGroup(newStudyGroup.id)).rejects.toThrow(
            'This group is not empty.',
        );
    });

    test('Throw error when trying to delete a group with a lesson in progress', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newTestStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: newStudyGroup.levelId,
            status: 'ACTIVE',
            teacherId: esloTest.userTeacherA.id,
            studentId: esloTest.userStudentA.id,
            registrationDate: new Date(),
            studyGroupId: newStudyGroup.id,
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            deletedAt: null,
            updatedAt: null,
        };

        await prismaClient.enrollment.create({ data: newTestStudyGroupEnrollment });

        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });

        await expect(() => studyGroupModel.removeStudyGroup(newStudyGroup.id)).rejects.toThrow(
            'There is a lesson in progress for this studyGroup.',
        );
    });
});

describe('updateStudyGroup', () => {
    test('UpdateStudyGroup', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        expect(
            await studyGroupModel.updateStudyGroup({
                studyGroupId: newStudyGroup.id,
                name: 'updateTest',
                events: [testUpdateGroupEvent],
            }),
        ).toBeTruthy();
    });

    // User input errors updateStudyGroup
    test('Throw error when trying to update group with invalid id', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        await expect(() =>
            // studyGroupId does not exist
            studyGroupModel.updateStudyGroup({
                studyGroupId: uuidv4(),
                name: 'test',
                events: [testNewEvent],
            }),
        ).rejects.toThrow('Group not found.');
    });

    test('Throw error when trying to update group with invalid name', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);
        await expect(() =>
            // studyGroupId does not exist
            studyGroupModel.updateStudyGroup({
                studyGroupId: newStudyGroup.id,
                name: '',
                events: [testNewEvent],
            }),
        ).rejects.toThrow('Invalid group name.');
    });

    test('Throw error when trying to update a group with a invalid teacher', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        // find studyGroupTeacher id
        const studyGroupTeacher = await esloTest.prismaClient.studyGroupTeacher.findFirst({
            where: { studyGroupId: newStudyGroup.id },
        });

        // Editing teacherId
        await esloTest.prismaClient.studyGroupTeacher.update({
            data: {
                teacherId: esloTest.userTeacherB.id,
            },
            where: {
                id: studyGroupTeacher?.id,
            },
        });
        await expect(() =>
            studyGroupModel.updateStudyGroup({
                studyGroupId: newStudyGroup.id,
                name: 'test',
                events: [testNewEvent],
            }),
        ).rejects.toThrow('Logged user is not a teacher from this study group.');
    });

    test('Throw error when trying to update a group with a lesson in progress', async () => {
        const studyGroupModel = new StudyGroupModel(esloTest.userTeacherA);
        const classRecordModel = new ClassRecordModel(esloTest.userTeacherA);
        const newStudyGroup = await studyGroupModel.createStudyGroup(testStudyGroup);

        const newTestStudyGroupEnrollment: Enrollment = {
            id: uuidv4(),
            levelId: newStudyGroup.levelId,
            status: 'ACTIVE',
            teacherId: esloTest.userTeacherA.id,
            studentId: esloTest.userStudentA.id,
            registrationDate: new Date(),
            studyGroupId: newStudyGroup.id,
            activationDate: new Date(),
            externalKey: '',
            completedAt: null,
            createdAt: new Date(),
            deletedAt: null,
            updatedAt: null,
        };

        await prismaClient.enrollment.create({ data: newTestStudyGroupEnrollment });

        await classRecordModel.startClass({
            lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
            levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
            sourceId: newStudyGroup.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: 'test',
        });

        await expect(() =>
            studyGroupModel.updateStudyGroup({
                studyGroupId: newStudyGroup.id,
                name: 'test',
                events: [testNewEvent],
            }),
        ).rejects.toThrow('There is a lesson in progress for this studyGroup.');
    });
});
