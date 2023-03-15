import {
    AvailabilityType,
    Enrollment,
    EnrollmentStatus,
    Invitation,
    EventStatus,
    EventVisibility,
    SourceType,
    User,
} from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';
import { prismaClient } from '../prisma';
import { esloTest } from '../test';
import { IEventInput } from './calendar.model';
import { EnrollmentModel } from './enrollment.model';

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

const testEnrollmentAAdvanced: Enrollment = {
    id: uuidv4(),
    levelId: 'd6d2c547-f2fd-49fe-8112-cdac56fed4ee',
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

const testEnrollmentAPending: Enrollment = {
    id: uuidv4(),
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    status: EnrollmentStatus.PENDING,
    teacherId: esloTest.userTeacherA.id,
    studentId: testUserEnrollment.id,
    studyGroupId: null,
    registrationDate: new Date(),
    activationDate: new Date(),
    externalKey: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testEnrollmentAConfirmed: Enrollment = {
    id: uuidv4(),
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    status: EnrollmentStatus.CONFIRMED,
    teacherId: esloTest.userTeacherA.id,
    studentId: testUserEnrollment.id,
    studyGroupId: null,
    registrationDate: new Date(),
    activationDate: new Date(),
    externalKey: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testEnrollmentACancelled: Enrollment = {
    id: uuidv4(),
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    status: EnrollmentStatus.CANCELLED,
    teacherId: esloTest.userTeacherA.id,
    studentId: testUserEnrollment.id,
    studyGroupId: null,
    registrationDate: new Date(),
    activationDate: new Date(),
    externalKey: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testEnrollmentAPendingInvitation: Invitation = {
    id: 'f2af0293-8873-4a3e-89bf-56c44d99eb3b',
    sourceType: 'ENROLLMENT',
    enrollmentId: testEnrollmentAPending.id,
    studyGroupId: null,
    invitationToken: 'KllGMvkQwXml',
    tokenActionedDateTime: null,
    tokenIssuedDateTime: new Date(),
    inviterId: esloTest.userTeacherA.id,
    inviteeId: esloTest.userStudentA.id,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const testStudyGroupA = {
    id: 'b33d892d-0fdc-436c-b380-2f328a26a42d',
    name: 'test',
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    // events: [testStudyGroupEvent],
};

const testStudyGroupEnrollmentA: Enrollment = {
    id: '40d300f0-3703-4450-8b23-974fbcd929a3',
    levelId: testStudyGroupA.levelId,
    status: 'ACTIVE',
    teacherId: esloTest.userTeacherA.id,
    studentId: esloTest.userStudentA.id,
    registrationDate: new Date(),
    studyGroupId: testStudyGroupA.id,
    activationDate: new Date(),
    externalKey: '',
    completedAt: null,
    createdAt: new Date(),
    deletedAt: null,
    updatedAt: null,
};

const testEnrollmentAEvent: IEventInput = {
    // id: uuidv4(),
    title: 'Enrollment',
    description: 'A1 - STARTER',
    sourceType: SourceType.ENROLLMENT,
    availabilityType: AvailabilityType.BUSY,
    startDateTime: '2021-04-27T23:32:56.732Z',
    startTimeZone: 'America/Sao_Paulo',
    endDateTime: '2021-04-27T23:32:56.732Z',
    endTimeZone: 'America/Sao_Paulo',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TH,WE',
    conferenceData: null,
    status: EventStatus.CONFIRMED,
    sendNotifications: true,
    visibility: EventVisibility.PUBLIC,
};

const testStudentAInput = {
    email: 'testStudentA@a.com',
    firstName: 'test',
    surname: 'student',
};

const testEnrollmentAInput = {
    oneOnOne: {
        levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
        events: [testEnrollmentAEvent],
    },
};

const testEnrollmentAStudyGroupInput = {
    studyGroupId: testStudyGroupA.id,
};

const testEnrollmentABothInput = {
    oneOnOne: {
        levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
        events: [testEnrollmentAEvent],
    },
    studyGroupId: testStudyGroupA.id,
};

const testEnrollmentANullInput = {
    oneOnOne: undefined,
    studyGroupId: undefined,
};

beforeEach(async () => {
    await esloTest.resetDB();
    await esloTest.createTestUsers();
    await esloTest.createProductCategories();
    await esloTest.createProductSubCategories();
    await esloTest.createProducts();
    await esloTest.createProductsPrices();
    await esloTest.createUsersSubscriptions();
    await esloTest.createUsersSubscriptionsItems();
});

afterEach(async () => {
    await esloTest.resetDB();
    await esloTest.prismaClient.$disconnect();
});

describe('findById', () => {
    test('Find enrollment by id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        expect(await enrollmentModel.findById(testEnrollment.id)).toBeTruthy();
    });
    // User input errors
    test('Find no enrollment with invalid id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        expect(await enrollmentModel.findById(uuidv4())).toBeNull();
    });

    // Permission errors
    test('Find no enrollments with invalid teacher', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() => enrollmentModel.findById(testEnrollment.id)).rejects.toThrow(
            'You do not have access to read Enrollment',
        );
    });

    test('Find no enrollmens with invalid student', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userStudentB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() => enrollmentModel.findById(testEnrollment.id)).rejects.toThrow(
            'You do not have access to read Enrollment',
        );
    });
});

describe('findActiveById', () => {
    test('Find active enrollment by id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        expect(await enrollmentModel.findActiveById(testEnrollment.id)).toBeTruthy();
    });

    // User input errors
    test('Find no active enrollment with invalid id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        expect(await enrollmentModel.findActiveById(uuidv4())).toBeNull();
    });

    test('Find no active enrollment with pending enrollment', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollmentAPending });
        expect(await enrollmentModel.findActiveById(testEnrollmentAPending.id)).toBeNull();
    });
});

describe('findAll', () => {
    test('Find all', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        expect(await enrollmentModel.findAll()).toHaveLength(1);
    });

    test('Find no enrollments', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        expect(await enrollmentModel.findAll()).toHaveLength(0);
    });

    // Permission errors
    test('Throw error when trying to find with admin user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() => enrollmentModel.findAll()).rejects.toThrow('You do not have access to list Enrollment');
    });
});

describe('findByStudyGroup', () => {
    test('Find by study group', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        await prismaClient.enrollment.create({ data: testStudyGroupEnrollmentA });
        expect(await enrollmentModel.findByStudyGroup(testStudyGroupA.id)).toHaveLength(1);
    });

    test('Find no enrollments by study group with empty study group', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        expect(await enrollmentModel.findByStudyGroup(testStudyGroupA.id)).toHaveLength(0);
    });

    // User input errors
    test('Find by study group with invalid studyGroupId', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        expect(await enrollmentModel.findByStudyGroup(uuidv4())).toHaveLength(0);
    });

    // Permission errors
    test('Find by study group with a invalid teacher', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        await prismaClient.enrollment.create({ data: testStudyGroupEnrollmentA });
        await expect(() => enrollmentModel.findByStudyGroup(testStudyGroupA.id)).rejects.toThrow(
            'You do not have access to list Enrollment',
        );
    });
});

describe('findTeacherEnrollmentsByUser', () => {
    test('Find teacher enrollments by user (ACTIVE STATUS)', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        expect(await enrollmentModel.findTeacherEnrollmentsByUser(esloTest.userTeacherA.id)).toHaveLength(1);
    });

    test('Find teacher enrollments by user (PENDING STATUS)', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollmentAConfirmed });
        expect(await enrollmentModel.findTeacherEnrollmentsByUser(esloTest.userTeacherA.id)).toHaveLength(1);
    });

    // User input errors
    test('Find no teacher enrollments by user (PENDING STATUS)', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollmentAConfirmed });
        expect(await enrollmentModel.findTeacherEnrollmentsByUser(esloTest.userTeacherA.id)).toHaveLength(0);
    });

    test('Find teacher enrollments by user with invalid userId', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        expect(await enrollmentModel.findTeacherEnrollmentsByUser(uuidv4())).toHaveLength(0);
    });

    // Permission errors
    test('Throw error when trying to list with student user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userStudentB);
        await expect(() => enrollmentModel.findTeacherEnrollmentsByUser(esloTest.userStudentB.id)).rejects.toThrow(
            'You do not have access to list Enrollment',
        );
    });
});

describe('findStudentsEnrollmentsByUser', () => {
    test('Find students enrollments by user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        expect(await enrollmentModel.findStudentEnrollmentsByUser(testUserEnrollment.id)).toHaveLength(1);
    });

    test('Find students enrollments by user with status', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        expect(await enrollmentModel.findStudentEnrollmentsByUser(testUserEnrollment.id, 'ACTIVE')).toHaveLength(1);
    });

    test('Find no students enrollments by user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        expect(await enrollmentModel.findStudentEnrollmentsByUser(testUserEnrollment.id)).toHaveLength(0);
    });

    // User input errors
    test('Find students enrollments by user with invalid userId', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        expect(await enrollmentModel.findStudentEnrollmentsByUser(uuidv4())).toHaveLength(0);
    });

    // Permission errors
    test('Throw error when trying to list with teacher', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await expect(() => enrollmentModel.findTeacherEnrollmentsByUser(esloTest.userTeacherB.id)).rejects.toThrow(
            'You do not have access to list Enrollment',
        );
    });
});

describe('createEnrollment', () => {
    test('createEnrollment', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        expect(await enrollmentModel.createEnrollment(testStudentAInput, testEnrollmentAInput)).toBeTruthy();
    });

    test('createEnrollment study group', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        expect(await enrollmentModel.createEnrollment(testStudentAInput, testEnrollmentAStudyGroupInput)).toBeTruthy();
    });

    // User input errors
    test('Throw error when trying to create enrollment with no one on one/study group input', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userStudentA);
        await expect(() =>
            enrollmentModel.createEnrollment(testStudentAInput, testEnrollmentANullInput),
        ).rejects.toThrow('You must inform either the group or one-on-one details');
    });

    test('Throw error when trying to create enrollment with both on one/study group input', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userStudentA);
        await expect(() =>
            enrollmentModel.createEnrollment(testStudentAInput, testEnrollmentABothInput),
        ).rejects.toThrow('You cannot create a enrollment that is both group and one-on-one');
    });

    // Permission errors
    test('Throw error when trying to create enrollment with student user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userStudentA);
        await expect(() => enrollmentModel.createEnrollment(testStudentAInput, testEnrollmentAInput)).rejects.toThrow(
            'You do not have access to create Enrollment',
        );
    });

    test('Throw error when trying to create enrollment with admin user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userAdminA);
        await expect(() => enrollmentModel.createEnrollment(testStudentAInput, testEnrollmentAInput)).rejects.toThrow(
            'You do not have access to create Enrollment',
        );
    });
});

describe('addStudentToGroup', () => {
    test('Add student to group', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        expect(
            await enrollmentModel.addStudentToGroup({
                id: newEnrollment.id,
                studyGroupId: testStudyGroupA.id,
            }),
        ).toBeTruthy();
    });

    // User input errors
    test('Throw error when trying to add student to group with invalid enrollment id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await expect(() =>
            enrollmentModel.addStudentToGroup({
                id: uuidv4(),
                studyGroupId: testStudyGroupA.id,
            }),
        ).rejects.toThrow('Enrollment not found');
    });

    test('Throw error when trying to add student to group with an already study group enrollment', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        const newEnrollment = await prismaClient.enrollment.create({ data: testStudyGroupEnrollmentA });
        await expect(() =>
            enrollmentModel.addStudentToGroup({
                id: newEnrollment.id,
                studyGroupId: testStudyGroupA.id,
            }),
        ).rejects.toThrow('Enrollment is already part of a studyGroup');
    });

    test('Throw error when trying to add student to group with invalid study group id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() =>
            enrollmentModel.addStudentToGroup({
                id: testEnrollment.id,
                studyGroupId: uuidv4(),
            }),
        ).rejects.toThrow('Study group not found');
    });

    test('Throw error when trying to add student to group with different levels', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollmentAAdvanced });
        await expect(() =>
            enrollmentModel.addStudentToGroup({
                id: newEnrollment.id,
                studyGroupId: testStudyGroupA.id,
            }),
        ).rejects.toThrow('The enrollment can only be part of a group with the same level');
    });

    // Permission errors
    test('Throw error when trying to add student to group with invalid teacher', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() =>
            enrollmentModel.addStudentToGroup({
                id: newEnrollment.id,
                studyGroupId: testStudyGroupA.id,
            }),
        ).rejects.toThrow('You do not have access to read Enrollment');
    });

    test('Throw error when trying to add student to group with admin user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userAdminA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() =>
            enrollmentModel.addStudentToGroup({
                id: newEnrollment.id,
                studyGroupId: testStudyGroupA.id,
            }),
        ).rejects.toThrow('You do not have access to update Enrollment');
    });
});

describe('removeStudentFromGroup', () => {
    test('Remove student from group', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        const newEnrollment = await prismaClient.enrollment.create({ data: testStudyGroupEnrollmentA });
        expect(await enrollmentModel.removeStudentFromGroup(newEnrollment.id, [testEnrollmentAEvent])).toBeTruthy();
    });

    // User input errors
    test('Throw error when trying to remove student of a group with invalid enrollment id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        await expect(() => enrollmentModel.removeStudentFromGroup(uuidv4(), [testEnrollmentAEvent])).rejects.toThrow(
            'Enrollment not found',
        );
    });

    test('Throw error when trying to remove student of a group with no events', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        await prismaClient.enrollment.create({ data: testStudyGroupEnrollmentA });
        await expect(() => enrollmentModel.removeStudentFromGroup(testStudyGroupEnrollmentA.id, [])).rejects.toThrow(
            'There must be events for the one on one classes',
        );
    });

    test('Throw error when trying to remove student of a group with no study group enrollment', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() =>
            enrollmentModel.removeStudentFromGroup(testEnrollment.id, [testEnrollmentAEvent]),
        ).rejects.toThrow('Enrollment is not part of a study group');
    });

    // Permission errors
    test('Throw error when trying to remove student of a group with invalid teacher', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        await prismaClient.enrollment.create({ data: testStudyGroupEnrollmentA });
        await expect(() =>
            enrollmentModel.removeStudentFromGroup(testStudyGroupEnrollmentA.id, [testEnrollmentAEvent]),
        ).rejects.toThrow('You do not have access to read Enrollment');
    });

    test('Throw error when trying to remove student of a group with admin user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userAdminA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.studyGroup.create({ data: testStudyGroupA });
        await prismaClient.enrollment.create({ data: testStudyGroupEnrollmentA });
        await expect(() =>
            enrollmentModel.removeStudentFromGroup(testStudyGroupEnrollmentA.id, [testEnrollmentAEvent]),
        ).rejects.toThrow('You do not have access to update Enrollment');
    });
});

describe('cancelEnrollment', () => {
    test('CancelEnrollment', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        expect(await enrollmentModel.cancelEnrollment(newEnrollment.id)).toBeTruthy();
    });

    test('Cancel pending enrollment with invitation', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollmentAPending });
        await prismaClient.invitation.create({ data: testEnrollmentAPendingInvitation });
        expect(await enrollmentModel.cancelEnrollment(testEnrollmentAPending.id)).toBeTruthy();
    });

    // User input errors
    test('CancelEnrollment with invalid id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await expect(() => enrollmentModel.cancelEnrollment(uuidv4())).rejects.toThrow('Enrollment not found');
    });

    test('Throw error when trying to cancel an already cancelled enrollment', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollmentACancelled });
        await expect(() => enrollmentModel.cancelEnrollment(newEnrollment.id)).rejects.toThrow(
            'Enrollment can only be cancelled when pending or active',
        );
    });

    test('Cancel enrollment with a lesson in progress', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await prismaClient.classRecord.create({
            data: {
                lessonId: '0c9e7cb0-361b-4a1e-887b-c99fafdf9095',
                enrollmentId: newEnrollment.id,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
            },
        });
        await expect(() => enrollmentModel.cancelEnrollment(newEnrollment.id)).rejects.toThrow(
            'There is a lesson in progress for this enrollment',
        );
    });

    // Permission errors
    test('Throw error when trying to cancel enrollment with invalid teacher', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() => enrollmentModel.cancelEnrollment(testEnrollment.id)).rejects.toThrow(
            'You do not have access to read Enrollment',
        );
    });

    test('Throw error when trying to cancel enrollment with admin user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userAdminA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() => enrollmentModel.cancelEnrollment(testEnrollment.id)).rejects.toThrow(
            'You do not have access to cancel Enrollment',
        );
    });
});

describe('activateEnrollment', () => {
    test('Activate enrollment', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollmentAPending });
        await prismaClient.invitation.create({ data: testEnrollmentAPendingInvitation });
        expect(await enrollmentModel.activateEnrollment(testEnrollmentAPending.id)).toBeTruthy();
    });

    // User input errors activateEnrollment
    test('Throw error when trying to activate enrollment with invalid id', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollmentAPending });
        await prismaClient.invitation.create({ data: testEnrollmentAPendingInvitation });
        await expect(() => enrollmentModel.activateEnrollment('0f8aac89-c8b1-46d7-916f-9fd0fb12a29b')).rejects.toThrow(
            'Enrollment not found',
        );
    });

    test('Throw error when trying to activate an already active enrollment', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherA);
        await prismaClient.user.create({ data: testUserEnrollment });
        const newEnrollment = await prismaClient.enrollment.create({ data: testEnrollment });
        await expect(() => enrollmentModel.activateEnrollment(newEnrollment.id)).rejects.toThrow(
            'Enrollment is already active or has been cancelled',
        );
    });

    // Permission errors
    test('Throw error when trying to cancel enrollment with teacher user', async () => {
        const enrollmentModel = new EnrollmentModel(esloTest.userTeacherB);
        await prismaClient.user.create({ data: testUserEnrollment });
        await prismaClient.enrollment.create({ data: testEnrollmentAPending });
        await prismaClient.invitation.create({ data: testEnrollmentAPendingInvitation });
        await expect(() => enrollmentModel.cancelEnrollment(testEnrollmentAPending.id)).rejects.toThrow(
            'You do not have access to read Enrollment',
        );
    });
});
