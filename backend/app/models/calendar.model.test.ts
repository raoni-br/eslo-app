import {
    AvailabilityType,
    EnrollmentStatus,
    EventAttendeeStatus,
    EventStatus,
    EventVisibility,
    SourceType,
    Prisma,
} from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';

import { CalendarModel, IEventOccurrenceInput, IModifyEventInput } from './calendar.model';
import { esloTest } from '../test';

jest.setTimeout(3 * 60 * 1000);

beforeEach(async () => {
    await esloTest.resetDB();
    await esloTest.createTestUsers();
});

afterEach(async () => {
    await esloTest.prismaClient.$disconnect();
});

const msToHour = 1000 * 60 * 60; // helper variable to convert miliseconds to hour

const teacherAEnrollment = {
    id: uuidv4(),
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    status: 'ACTIVE' as EnrollmentStatus,
    teacherId: esloTest.userTeacherA.id,
    studentId: esloTest.userStudentA.id,
    registrationDate: new Date(),
};

const teacherAStudyGroupEnrollment = {
    id: uuidv4(),
    studyGroupId: esloTest.testStudyGroup.id,
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    status: 'ACTIVE' as EnrollmentStatus,
    teacherId: esloTest.userTeacherA.id,
    studentId: esloTest.userStudentA.id,
    registrationDate: new Date(),
};

const teacherBEnrollment = {
    id: uuidv4(),
    levelId: '1cc42205-ace0-4b9d-99f6-d7586b02e8e6',
    status: 'ACTIVE' as EnrollmentStatus,
    teacherId: esloTest.userTeacherA.id,
    studentId: esloTest.userStudentA.id,
    registrationDate: new Date(),
};

const teacherAOwner = {
    attendeeId: esloTest.userTeacherA.id,
    responseStatus: 'ACCEPTED' as EventAttendeeStatus,
    responseDateTime: new Date(),
    optional: false,
    comment: null,
    organiser: true,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const studentAAttendee = {
    attendeeId: esloTest.userStudentA.id,
    responseStatus: 'MAYBE' as EventAttendeeStatus,
    responseDateTime: new Date(),
    optional: false,
    comment: null,
    organiser: false,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const teacherBOwner = {
    attendeeId: esloTest.userTeacherB.id,
    responseStatus: 'ACCEPTED' as EventAttendeeStatus,
    responseDateTime: new Date(),
    optional: false,
    comment: null,
    organiser: true,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
};

const deletedEventA = {
    id: uuidv4(),
    title: 'deletedEventA',
    description: 'A2 - Elementary',
    availabilityType: 'BUSY' as AvailabilityType,
    sourceType: 'ENROLLMENT' as SourceType,
    enrollmentId: teacherAEnrollment.id,
    studyGroupId: null,
    startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
    startTimeZone: 'Australia/Sydney',
    endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
    endTimeZone: 'Australia/Sydney',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
    status: 'CANCELLED' as EventStatus,
    sendNotifications: true,
    iCalUID: null,
    organiserId: esloTest.userTeacherA.id,
    ownerId: esloTest.userTeacherA.id,
    visibility: 'PUBLIC' as EventVisibility,
    conferenceData: Prisma.DbNull,
    startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
    completedAt: new Date(Date.UTC(2021, 3, 15, 7, 0)),
    createdAt: new Date(2021, 2, 30),
    updatedAt: null,
    deletedAt: null,
    eventAttendees: { createMany: { data: [teacherAOwner] } },
};

const activeEventA = {
    id: uuidv4(),
    title: 'activeEventA',
    description: 'A2 - Elementary',
    availabilityType: 'BUSY' as AvailabilityType,
    sourceType: 'ENROLLMENT' as SourceType,
    enrollmentId: teacherAEnrollment.id,
    studyGroupId: null,
    startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
    startTimeZone: 'Australia/Sydney',
    endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
    endTimeZone: 'Australia/Sydney',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
    status: 'CONFIRMED' as EventStatus,
    sendNotifications: true,
    iCalUID: null,
    organiserId: esloTest.userTeacherA.id,
    ownerId: esloTest.userTeacherA.id,
    visibility: 'PUBLIC' as EventVisibility,
    conferenceData: Prisma.DbNull,
    startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
    completedAt: null,
    createdAt: new Date(2021, 2, 30),
    updatedAt: null,
    deletedAt: null,
    eventAttendees: { createMany: { data: [teacherAOwner] } },
};

const anotherActiveEventA = {
    id: uuidv4(),
    title: 'anotherActiveEventA',
    description: 'anotherActiveEventA',
    availabilityType: 'BUSY' as AvailabilityType,
    sourceType: 'ENROLLMENT' as SourceType,
    enrollmentId: teacherAEnrollment.id,
    studyGroupId: null,
    startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
    startTimeZone: 'Australia/Sydney',
    endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
    endTimeZone: 'Australia/Sydney',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
    status: 'CONFIRMED' as EventStatus,
    sendNotifications: true,
    iCalUID: null,
    organiserId: esloTest.userTeacherA.id,
    ownerId: esloTest.userTeacherA.id,
    visibility: 'PUBLIC' as EventVisibility,
    conferenceData: Prisma.DbNull,
    startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
    completedAt: null,
    createdAt: new Date(2021, 2, 30),
    updatedAt: null,
    deletedAt: null,
    eventAttendees: { createMany: { data: [teacherAOwner] } },
};

const activeEventB = {
    id: uuidv4(),
    title: 'activeEventB',
    description: 'A2 - Elementary',
    availabilityType: 'BUSY' as AvailabilityType,
    sourceType: 'ENROLLMENT' as SourceType,
    enrollmentId: teacherBEnrollment.id,
    studyGroupId: null,
    startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
    startTimeZone: 'Australia/Sydney',
    endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
    endTimeZone: 'Australia/Sydney',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
    status: 'CONFIRMED' as EventStatus,
    sendNotifications: true,
    iCalUID: null,
    organiserId: esloTest.userTeacherB.id,
    ownerId: esloTest.userTeacherB.id,
    visibility: 'PUBLIC' as EventVisibility,
    conferenceData: Prisma.DbNull,
    startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
    completedAt: null,
    createdAt: new Date(2021, 2, 30),
    updatedAt: null,
    deletedAt: null,
    eventAttendees: { createMany: { data: [teacherBOwner] } },
};

const teacherAStudyGroupActiveEvent = {
    id: uuidv4(),
    title: 'teacherAStudyGroupActiveEvent',
    description: 'A2 - Elementary',
    availabilityType: 'BUSY' as AvailabilityType,
    sourceType: 'STUDY_GROUP' as SourceType,
    enrollmentId: null,
    studyGroupId: esloTest.testStudyGroup.id,
    startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
    startTimeZone: 'Australia/Sydney',
    endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
    endTimeZone: 'Australia/Sydney',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
    status: 'CONFIRMED' as EventStatus,
    sendNotifications: true,
    iCalUID: null,
    organiserId: esloTest.userTeacherA.id,
    ownerId: esloTest.userTeacherA.id,
    visibility: 'PUBLIC' as EventVisibility,
    conferenceData: Prisma.DbNull,
    startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
    completedAt: null,
    createdAt: new Date(2021, 2, 30),
    updatedAt: null,
    deletedAt: null,
    eventAttendees: { createMany: { data: [teacherAOwner] } },
};

const teacherAEventOcurrenceActiveEvent = {
    id: uuidv4(),
    title: 'event occurrence - activeEventA',
    description: 'A2 - Elementary',
    availabilityType: 'BUSY' as AvailabilityType,
    sourceType: 'ENROLLMENT' as SourceType,
    enrollmentId: teacherAEnrollment.id,
    studyGroupId: null,
    recurringEventId: activeEventA.id,
    originalStartDateTime: new Date(Date.UTC(2021, 3, 7, 8, 0)), // 07/04/2021 08:00 UTC --> 07/04/2021 18:00 AEST (+10 GMT)
    originalStartTimeZone: 'Australia/Sydney',
    startDateTime: new Date(Date.UTC(2021, 3, 8, 9, 0)), // 08/04/2021 09:00 UTC --> 08/04/2021 19:00 AEST (+10 GMT)
    startTimeZone: 'Australia/Sydney',
    endDateTime: new Date(Date.UTC(2021, 3, 8, 10, 30)), // 08/04/2021 10:30 UTC --> 08/04/2021 20:30 AEST (+10 GMT)
    endTimeZone: 'Australia/Sydney',
    status: 'CONFIRMED' as EventStatus,
    sendNotifications: true,
    iCalUID: null,
    organiserId: esloTest.userTeacherA.id,
    ownerId: esloTest.userTeacherA.id,
    visibility: 'PUBLIC' as EventVisibility,
    conferenceData: Prisma.DbNull,
    createdAt: new Date(2021, 2, 30),
    updatedAt: null,
    deletedAt: null,
    eventOccurrenceAttendees: { createMany: { data: [teacherAOwner] } },
};

const teacherAEventOcurrenceDeletedEvent = {
    id: uuidv4(),
    title: 'event occurrence - deletedEventA',
    description: 'A2 - Elementary',
    availabilityType: 'BUSY' as AvailabilityType,
    sourceType: 'ENROLLMENT' as SourceType,
    enrollmentId: teacherAEnrollment.id,
    studyGroupId: null,
    recurringEventId: deletedEventA.id,
    originalStartDateTime: new Date(Date.UTC(2021, 3, 7, 8, 0)), // 07/04/2021 08:00 UTC --> 07/04/2021 18:00 AEST (+10 GMT)
    originalStartTimeZone: 'Australia/Sydney',
    startDateTime: new Date(Date.UTC(2021, 3, 8, 9, 0)), // 08/04/2021 09:00 UTC --> 08/04/2021 19:00 AEST (+10 GMT)
    startTimeZone: 'Australia/Sydney',
    endDateTime: new Date(Date.UTC(2021, 3, 8, 10, 30)), // 08/04/2021 10:30 UTC --> 08/04/2021 20:30 AEST (+10 GMT)
    endTimeZone: 'Australia/Sydney',
    status: 'CONFIRMED' as EventStatus,
    sendNotifications: true,
    iCalUID: null,
    organiserId: esloTest.userTeacherA.id,
    ownerId: esloTest.userTeacherA.id,
    visibility: 'PUBLIC' as EventVisibility,
    conferenceData: Prisma.DbNull,
    createdAt: new Date(2021, 2, 30),
    updatedAt: null,
    deletedAt: null,
    eventOccurrenceAttendees: { createMany: { data: [teacherAOwner] } },
};

describe('findEventsBySource', () => {
    test('Find no events for invalid source', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        expect(
            // enrollment does not exist
            await calendarModel.findEventsBySource({
                sourceType: 'ENROLLMENT',
                sourceId: uuidv4(),
            }),
        ).toHaveLength(0);
    });

    test('Teacher A does not find their cancelled events', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        expect(
            await calendarModel.findEventsBySource({
                sourceType: 'ENROLLMENT',
                sourceId: teacherAEnrollment.id,
            }),
        ).toHaveLength(0);
    });

    test('Teacher A find their enrollment events (and only theirs)', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherBEnrollment.id },
            create: teacherBEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventB.id },
            create: activeEventB,
            update: {},
        });

        expect(
            await calendarModel.findEventsBySource({
                sourceType: 'ENROLLMENT',
                sourceId: teacherAEnrollment.id,
            }),
        ).toHaveLength(1);
    });

    test('Teacher B does not find Teacher A events', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherB);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        expect(
            await calendarModel.findEventsBySource({
                sourceType: 'ENROLLMENT',
                sourceId: teacherAEnrollment.id,
            }),
        ).toHaveLength(0);
    });

    test('Teacher A find their study group events (and only from study group)', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.studyGroup.create({ data: esloTest.testStudyGroup });

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAStudyGroupEnrollment.id },
            create: teacherAStudyGroupEnrollment,
            update: {},
        });

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: teacherAStudyGroupActiveEvent.id },
            create: teacherAStudyGroupActiveEvent,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        expect(
            await calendarModel.findEventsBySource({
                sourceType: 'STUDY_GROUP',
                sourceId: esloTest.testStudyGroup.id,
            }),
        ).toHaveLength(1);
    });
});

describe('findNextEventOccurrenceBySource', () => {
    test('Teacher A does not have next event ocurrence for cancelled events', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        expect(
            await calendarModel.findNextEventOccurrenceBySource({
                sourceType: 'ENROLLMENT',
                sourceId: teacherAEnrollment.id,
            }),
        ).toBeNull();
    });

    test('Teacher A finds their next event ocurrence for an active event', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        const eventOcurrence = await calendarModel.findNextEventOccurrenceBySource({
            sourceType: 'ENROLLMENT',
            sourceId: teacherAEnrollment.id,
        });

        expect(eventOcurrence).toBeTruthy();
        expect(eventOcurrence?.recurringEventId).toEqual(activeEventA.id);
    });

    test('Teacher B does not find events from teacher A', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherB);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        const eventOcurrence = await calendarModel.findNextEventOccurrenceBySource({
            sourceType: 'ENROLLMENT',
            sourceId: teacherAEnrollment.id,
        });

        expect(eventOcurrence).toBeNull();
    });
});

describe('findEventOccurrencesByEvent', () => {
    test('Teacher A can find event occurrences even for cancelled events', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        await esloTest.prismaClient.eventOccurrence.upsert({
            where: { id: teacherAEventOcurrenceDeletedEvent.id },
            create: teacherAEventOcurrenceDeletedEvent,
            update: {},
        });

        expect(await calendarModel.findEventOccurrencesByEvent(deletedEventA.id)).toHaveLength(1);
    });

    test('Teacher A finds event ocurrences for an active event', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        await esloTest.prismaClient.eventOccurrence.upsert({
            where: { id: teacherAEventOcurrenceActiveEvent.id },
            create: teacherAEventOcurrenceActiveEvent,
            update: {},
        });

        expect(await calendarModel.findEventOccurrencesByEvent(activeEventA.id)).toHaveLength(1);
    });

    test("Teacher B does not find event occurrences from Teacher A's event", async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherB);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        await esloTest.prismaClient.eventOccurrence.upsert({
            where: { id: teacherAEventOcurrenceActiveEvent.id },
            create: teacherAEventOcurrenceActiveEvent,
            update: {},
        });

        expect(await calendarModel.findEventOccurrencesByEvent(activeEventA.id)).toHaveLength(0);
    });
});

describe('findEventsOrganisedByUser', () => {
    test('Teacher A does not find cancelled events they organised', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        expect(await calendarModel.findEventsOrganisedByUser(esloTest.userTeacherA.id)).toHaveLength(0);
    });

    test('Teacher A finds events they organised', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        expect(await calendarModel.findEventsOrganisedByUser(esloTest.userTeacherA.id)).toHaveLength(1);
    });

    test('Teacher B does not find events organised by Teacher A', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherB);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        expect(await calendarModel.findEventsOrganisedByUser(esloTest.userTeacherA.id)).toHaveLength(0);
    });
});

describe('findEventsOwnedByUser', () => {
    test('Teacher A does not find cancelled events they organised', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        expect(await calendarModel.findEventsOwnedByUser(esloTest.userTeacherA.id)).toHaveLength(0);
    });

    test('Teacher A finds events they organised', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        expect(await calendarModel.findEventsOwnedByUser(esloTest.userTeacherA.id)).toHaveLength(1);
    });

    test('Teacher B does not find events organised by Teacher A', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherB);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        expect(await calendarModel.findEventsOwnedByUser(esloTest.userTeacherA.id)).toHaveLength(0);
    });
});

describe('findEventOccurrenceAttendees', () => {
    test('Teacher A can find event occurrences attendees even for cancelled events', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        await esloTest.prismaClient.eventOccurrence.upsert({
            where: { id: teacherAEventOcurrenceDeletedEvent.id },
            create: teacherAEventOcurrenceDeletedEvent,
            update: {},
        });

        expect(await calendarModel.findEventOccurrenceAttendees(teacherAEventOcurrenceDeletedEvent.id)).toHaveLength(1);
    });

    test('Teacher A finds event ocurrences attendees for an active event', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        await esloTest.prismaClient.eventOccurrence.upsert({
            where: { id: teacherAEventOcurrenceActiveEvent.id },
            create: teacherAEventOcurrenceActiveEvent,
            update: {},
        });

        expect(await calendarModel.findEventOccurrenceAttendees(teacherAEventOcurrenceActiveEvent.id)).toHaveLength(1);
    });

    test("Teacher B does not find event occurrences attendees from Teacher A's event", async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherB);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        await esloTest.prismaClient.eventOccurrence.upsert({
            where: { id: teacherAEventOcurrenceActiveEvent.id },
            create: teacherAEventOcurrenceActiveEvent,
            update: {},
        });

        expect(await calendarModel.findEventOccurrenceAttendees(teacherAEventOcurrenceActiveEvent.id)).toHaveLength(0);
    });
});

describe('findEventAttendees', () => {
    test('Teacher A finds event attendees even for cancelled events', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        expect(await calendarModel.findEventAttendees(deletedEventA.id)).toHaveLength(1);
    });

    test('Teacher A finds event attendes for active events they organised', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        expect(await calendarModel.findEventAttendees(activeEventA.id)).toHaveLength(1);
    });

    test('Teacher B does not find event attendees for events organised by Teacher A', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherB);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        expect(await calendarModel.findEventAttendees(activeEventA.id)).toHaveLength(0);
    });
});

describe('getMyCalendar', () => {
    const fromDate = new Date(Date.UTC(2021, 3, 1, 10, 0));
    const toDate = new Date(Date.UTC(2021, 3, 30, 23, 59));

    test('Teacher A does not have cancelled events in his calendar', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        expect(await calendarModel.getMyCalendar(fromDate.toISOString(), toDate.toISOString())).toHaveLength(0);
    });

    test('Teacher A finds in their calendar events they organised', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        const calendarEvents = await calendarModel.getMyCalendar(fromDate.toISOString(), toDate.toISOString());
        expect(calendarEvents.length).toBeGreaterThanOrEqual(1);
    });

    test('Teacher B does not find in their calendar events organised by Teacher A', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherB);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        const calendarEvents = await calendarModel.getMyCalendar(fromDate.toISOString(), toDate.toISOString());
        expect(calendarEvents.length).toBeGreaterThanOrEqual(0);
    });

    test('Error is thrown when given invalid from/to dates', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        await expect(() => calendarModel.getMyCalendar('invalid date', toDate.toISOString())).rejects.toThrow(
            'Invalid input dates.',
        );

        await expect(() => calendarModel.getMyCalendar(fromDate.toISOString(), 'invalid date')).rejects.toThrow(
            'Invalid input dates.',
        );
    });
});

describe('changeSpecificEventBySource', () => {
    const newEnrollmentEventException: IEventOccurrenceInput = {
        sourceType: 'ENROLLMENT' as SourceType,
        sourceId: teacherAEnrollment.id,
        id: `${activeEventA.id}--1`,
        title: 'event occurrence - activeEventA',
        description: 'newEnrollmentEventException',
        availabilityType: 'BUSY' as AvailabilityType,
        recurringEventId: activeEventA.id,
        originalStartDateTime: new Date(Date.UTC(2021, 3, 6, 8, 0)).toISOString(), // 06/04/2021 08:00 UTC --> 06/04/2021 18:00 AEST (+10 GMT)
        originalStartTimeZone: 'Australia/Sydney',
        startDateTime: new Date(Date.UTC(2021, 3, 7, 9, 0)).toISOString(), // 07/04/2021 09:00 UTC --> 07/04/2021 19:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 3, 7, 10, 30)).toISOString(), // 07/04/2021 10:30 UTC --> 07/04/2021 20:30 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        status: 'CONFIRMED' as EventStatus,
        sendNotifications: true,
        organiserId: esloTest.userTeacherA.id,
        ownerId: esloTest.userTeacherA.id,
        visibility: 'PUBLIC' as EventVisibility,
        conferenceData: Prisma.DbNull,
    };

    const newStudyGroupEventException: IEventOccurrenceInput = {
        sourceType: 'STUDY_GROUP' as SourceType,
        sourceId: esloTest.testStudyGroup.id,
        id: `${teacherAStudyGroupActiveEvent.id}--1`,
        title: 'event occurrence - teacherAStudyGroupActiveEvent',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY' as AvailabilityType,
        recurringEventId: teacherAStudyGroupActiveEvent.id,
        originalStartDateTime: new Date(Date.UTC(2021, 3, 7, 8, 0)).toISOString(), // 07/04/2021 08:00 UTC --> 07/04/2021 18:00 AEST (+10 GMT)
        originalStartTimeZone: 'Australia/Sydney',
        startDateTime: new Date(Date.UTC(2021, 3, 8, 9, 0)).toISOString(), // 08/04/2021 09:00 UTC --> 08/04/2021 19:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 3, 8, 10, 30)).toISOString(), // 08/04/2021 10:30 UTC --> 08/04/2021 20:30 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        status: 'CONFIRMED' as EventStatus,
        sendNotifications: true,
        organiserId: esloTest.userTeacherA.id,
        ownerId: esloTest.userTeacherA.id,
        visibility: 'PUBLIC' as EventVisibility,
        conferenceData: Prisma.DbNull,
    };

    beforeEach(async () => {
        // enrollment
        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        // study group
        await esloTest.prismaClient.studyGroup.upsert({
            where: { id: esloTest.testStudyGroup.id },
            create: esloTest.testStudyGroup,
            update: {},
        });

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAStudyGroupEnrollment.id },
            create: teacherAStudyGroupEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: teacherAStudyGroupActiveEvent.id },
            create: teacherAStudyGroupActiveEvent,
            update: {},
        });
    });

    test('Teacher A cannot create event exception when source enrollment is not found', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        const invalidEnrollmentEventOccurrence = { ...newEnrollmentEventException };
        invalidEnrollmentEventOccurrence.sourceId = uuidv4();

        await expect(() => calendarModel.changeSpecificEventBySource(invalidEnrollmentEventOccurrence)).rejects.toThrow(
            'Enrollment not found.',
        );
    });

    test('Teacher A cannot create event exception when source study group is not found', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        const invalidStudyGroupEventOccurrence = { ...newStudyGroupEventException };
        invalidStudyGroupEventOccurrence.sourceId = uuidv4();

        await expect(() => calendarModel.changeSpecificEventBySource(invalidStudyGroupEventOccurrence)).rejects.toThrow(
            'Study group not found.',
        );
    });

    test('Teacher A cannot create event exception with invalid dates', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        const invalidEventOccurrence = { ...newEnrollmentEventException };
        invalidEventOccurrence.startDateTime = 'invalid date';

        await expect(() => calendarModel.changeSpecificEventBySource(invalidEventOccurrence)).rejects.toThrow(
            'Invalid event dates.',
        );

        invalidEventOccurrence.startDateTime = new Date(new Date().getTime() + msToHour).toISOString();
        invalidEventOccurrence.endDateTime = 'invalid date';
        await expect(() => calendarModel.changeSpecificEventBySource(invalidEventOccurrence)).rejects.toThrow(
            'Invalid event dates.',
        );

        // startDate > endDate
        invalidEventOccurrence.startDateTime = new Date(new Date().getTime() + msToHour * 2).toISOString();
        invalidEventOccurrence.endDateTime = new Date(new Date().getTime() + msToHour).toISOString();
        await expect(() => calendarModel.changeSpecificEventBySource(invalidEventOccurrence)).rejects.toThrow(
            'Invalid event dates.',
        );
    });

    test('Teacher A cannot create event exception that is not linked with a recurrence', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        const invalidEnrollmentEventOccurrence = { ...newEnrollmentEventException };
        invalidEnrollmentEventOccurrence.recurringEventId = uuidv4();

        await expect(() => calendarModel.changeSpecificEventBySource(invalidEnrollmentEventOccurrence)).rejects.toThrow(
            'Event recurrence not found',
        );
    });

    test('Teacher A cannot create event exception when original start date is not within event schedule', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        const invalidEventOccurrence = { ...newEnrollmentEventException };
        invalidEventOccurrence.originalStartDateTime = new Date(Date.UTC(2021, 5, 4, 7, 0)).toISOString();

        await expect(() => calendarModel.changeSpecificEventBySource(invalidEventOccurrence)).rejects.toThrow(
            'Original event start date is not within event schedule',
        );
    });

    test('Teacher A cannot create event exception when original start time does not match the schedule', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        const invalidEventOccurrence = { ...newEnrollmentEventException };
        invalidEventOccurrence.originalStartDateTime = new Date(Date.UTC(2021, 5, 3, 10, 0)).toISOString();

        await expect(() => calendarModel.changeSpecificEventBySource(invalidEventOccurrence)).rejects.toThrow(
            'Original event start date is not within event schedule',
        );
    });

    test('Teacher A can create event exception linked with a recurring event from enrollment', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const newEventOccurrence = await calendarModel.changeSpecificEventBySource(newEnrollmentEventException);
        expect(newEventOccurrence).toBeTruthy();
        expect(newEventOccurrence?.originalStartDateTime?.toISOString()).toEqual(
            newEnrollmentEventException.originalStartDateTime,
        );
        expect(newEventOccurrence?.startDateTime?.toISOString()).toEqual(newEnrollmentEventException.startDateTime);
    });

    test('Teacher A can update existing event exception linked with a recurring event from enrollment', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const newEventOccurrence = {
            id: uuidv4(),
            sourceType: newEnrollmentEventException.sourceType,
            enrollmentId: newEnrollmentEventException.sourceId,
            title: newEnrollmentEventException.title,
            description: newEnrollmentEventException.description,
            availabilityType: newEnrollmentEventException.availabilityType,
            recurringEventId: newEnrollmentEventException.recurringEventId,
            originalStartDateTime: newEnrollmentEventException.originalStartDateTime,
            originalStartTimeZone: newEnrollmentEventException.originalStartTimeZone,
            startDateTime: newEnrollmentEventException.startDateTime,
            startTimeZone: newEnrollmentEventException.startTimeZone,
            endDateTime: newEnrollmentEventException.endDateTime,
            endTimeZone: newEnrollmentEventException.endTimeZone,
            status: newEnrollmentEventException.status,
            sendNotifications: newEnrollmentEventException.sendNotifications,
            organiserId: newEnrollmentEventException.organiserId,
            ownerId: newEnrollmentEventException.ownerId,
            visibility: newEnrollmentEventException.visibility,
            eventOccurrenceAttendees: { createMany: { data: [teacherAOwner, studentAAttendee] } },
        };

        const eventOccurrence = await esloTest.prismaClient.eventOccurrence.create({
            data: newEventOccurrence,
        });

        const toBeUpdatedEventOcurrence = { ...newEnrollmentEventException };
        toBeUpdatedEventOcurrence.id = eventOccurrence.id;
        toBeUpdatedEventOcurrence.status = 'CANCELLED';

        const updatedEventOccurrence = await calendarModel.changeSpecificEventBySource(toBeUpdatedEventOcurrence);

        expect(updatedEventOccurrence).toBeTruthy();
        expect(updatedEventOccurrence?.id).toEqual(eventOccurrence.id);
        expect(updatedEventOccurrence?.status).toEqual('CANCELLED');

        const eventOccurrenceAttendees = await calendarModel.findEventOccurrenceAttendees(eventOccurrence.id);

        expect(eventOccurrenceAttendees).toHaveLength(2);

        const studentAttendee = eventOccurrenceAttendees.find(
            (attendee) => attendee.attendeeId === esloTest.userStudentA.id,
        );

        expect(studentAttendee).toBeTruthy();
        expect(studentAttendee?.responseStatus).toEqual('PENDING');
    });
});

describe('changeScheduleBySource', () => {
    const newActiveEventA: IModifyEventInput = {
        changeStatus: 'NEW',
        id: uuidv4(),
        title: 'newActiveEventA',
        description: 'newActiveEventA',
        availabilityType: 'BUSY' as AvailabilityType,
        startDateTime: new Date(Date.UTC(2021, 4, 31, 7, 0)).toISOString(), // 31/05/2021 07:00 UTC --> 31/05/2021 18:00 AEST (+11 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 31, 8, 0)).toISOString(), // 31/05/2021 08:00 UTC --> 31/05/2021 19:00 AEST (+11 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO',
        status: 'CONFIRMED' as EventStatus,
        sendNotifications: true,
        visibility: 'PUBLIC' as EventVisibility,
    };

    // adding Saturday in the schedule and changing title
    const updatedActiveEventA: IModifyEventInput = {
        changeStatus: 'EDITED',
        id: activeEventA.id,
        title: 'updatedActiveEventA',
        description: 'updatedActiveEventA',
        availabilityType: 'BUSY' as AvailabilityType,
        startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)).toISOString(),
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)).toISOString(),
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH,SA',
        status: 'CONFIRMED' as EventStatus,
        sendNotifications: true,
        visibility: 'PUBLIC' as EventVisibility,
        conferenceData: Prisma.DbNull,
    };

    const deletedActiveEventA: IModifyEventInput = { ...updatedActiveEventA };
    deletedActiveEventA.changeStatus = 'DELETED';

    // study group
    const newStudyGroupActiveEvent: IModifyEventInput = {
        changeStatus: 'NEW',
        title: 'newStudyGroupActiveEvent',
        description: 'newStudyGroupActiveEvent',
        availabilityType: 'BUSY' as AvailabilityType,
        startDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)).toISOString(),
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 2, 30, 9, 0)).toISOString(),
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=FR',
        status: 'CONFIRMED' as EventStatus,
        sendNotifications: true,
        visibility: 'PUBLIC' as EventVisibility,
        conferenceData: Prisma.DbNull,
    };

    const updatedStudyGroupActiveEvent: IModifyEventInput = {
        changeStatus: 'EDITED',
        id: teacherAStudyGroupActiveEvent.id,
        title: 'updatedStudyGroupActiveEvent',
        description: 'updatedStudyGroupActiveEvent',
        availabilityType: 'BUSY' as AvailabilityType,
        startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)).toISOString(),
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)).toISOString(),
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=WE',
        status: 'CONFIRMED' as EventStatus,
        sendNotifications: true,
        visibility: 'PUBLIC' as EventVisibility,
        conferenceData: Prisma.DbNull,
    };

    beforeEach(async () => {
        // enrollment
        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAEnrollment.id },
            create: teacherAEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: activeEventA.id },
            create: activeEventA,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: deletedEventA.id },
            create: deletedEventA,
            update: {},
        });

        // study group
        await esloTest.prismaClient.studyGroup.upsert({
            where: { id: esloTest.testStudyGroup.id },
            create: esloTest.testStudyGroup,
            update: {},
        });

        await esloTest.prismaClient.enrollment.upsert({
            where: { id: teacherAStudyGroupEnrollment.id },
            create: teacherAStudyGroupEnrollment,
            update: {},
        });

        await esloTest.prismaClient.event.upsert({
            where: { id: teacherAStudyGroupActiveEvent.id },
            create: teacherAStudyGroupActiveEvent,
            update: {},
        });
    });

    test('Teacher A cannot update events when none is given', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: uuidv4(),
            events: [],
        };

        await expect(() => calendarModel.changeScheduleBySource(changeEventInput)).rejects.toThrow(
            'No events received.',
        );
    });

    test('Teacher A attempts to delete an event that does not belong to the source causes an error', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        const deletedEvent = { ...newActiveEventA };
        deletedEvent.changeStatus = 'DELETED';

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: teacherAEnrollment.id,
            events: [deletedEvent],
        };

        await expect(() => calendarModel.changeScheduleBySource(changeEventInput)).rejects.toThrow(
            'At least one modified event does not belong to the source',
        );
    });

    test('Teacher A attempts to update an event that does not belong to the source causes an error', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);
        const deletedEvent: IModifyEventInput = { ...newActiveEventA, changeStatus: 'EDITED' };

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: teacherAEnrollment.id,
            events: [deletedEvent],
        };

        await expect(() => calendarModel.changeScheduleBySource(changeEventInput)).rejects.toThrow(
            'At least one modified event does not belong to the source',
        );
    });

    test('Teacher A attempting to update a deleted event causes an error', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const modifyDeletedEvent: IModifyEventInput = {
            changeStatus: 'EDITED',
            id: deletedEventA.id,
            title: 'modifyDeletedEvent',
            description: 'attemped to modify deleted event: deletedEventA',
            availabilityType: 'BUSY' as AvailabilityType,
            startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)).toISOString(), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
            startTimeZone: 'Australia/Sydney',
            endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)).toISOString(), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
            endTimeZone: 'Australia/Sydney',
            recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
            status: 'CANCELLED' as EventStatus,
            sendNotifications: true,
            visibility: 'PUBLIC' as EventVisibility,
            conferenceData: Prisma.DbNull,
        };

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: teacherAEnrollment.id,
            events: [modifyDeletedEvent],
        };

        await expect(() => calendarModel.changeScheduleBySource(changeEventInput)).rejects.toThrow(
            'At least one modified event does not belong to the source',
        );
    });

    test('Teacher A attemping to edited the same event twice in the same operation causes an error', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: teacherAEnrollment.id,
            events: [updatedActiveEventA, updatedActiveEventA],
        };

        await expect(() => calendarModel.changeScheduleBySource(changeEventInput)).rejects.toThrow(
            'Multiple operations detected for the same event',
        );
    });

    test('Attempt to delete all events leaving the source without any event causes an error', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: teacherAEnrollment.id,
            events: [deletedActiveEventA],
        };

        await expect(() => calendarModel.changeScheduleBySource(changeEventInput)).rejects.toThrow(
            'All active events would be deleted for this source. There must be at least one active event',
        );
    });

    // enrollment
    test('Teacher A updates a single event for an enrollment successfully', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: teacherAEnrollment.id,
            events: [updatedActiveEventA],
        };

        const updatedEvents = await calendarModel.changeScheduleBySource(changeEventInput);

        expect(updatedEvents).toBeTruthy();
        expect(updatedEvents).toHaveLength(1);
        expect(updatedEvents[0].title).toEqual(updatedActiveEventA.title);
        expect(updatedEvents[0].recurrence).toEqual(updatedActiveEventA.recurrence);
    });

    test('Teacher A adds a new event for an enrollment successfully', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: teacherAEnrollment.id,
            events: [newActiveEventA],
        };

        const updatedEvents = await calendarModel.changeScheduleBySource(changeEventInput);

        expect(updatedEvents).toBeTruthy();
        expect(updatedEvents).toHaveLength(2);
    });

    test('Teacher A deletes an event for an enrollment successfully', async () => {
        await esloTest.prismaClient.event.upsert({
            where: { id: anotherActiveEventA.id },
            create: anotherActiveEventA,
            update: {},
        });

        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const changeEventInput = {
            sourceType: 'ENROLLMENT' as SourceType,
            sourceId: teacherAEnrollment.id,
            events: [deletedActiveEventA],
        };

        const updatedEvents = await calendarModel.changeScheduleBySource(changeEventInput);
        expect(updatedEvents).toBeTruthy();
        expect(updatedEvents).toHaveLength(1);
        expect(updatedEvents[0].title).toEqual(anotherActiveEventA.title);
        expect(updatedEvents[0].recurrence).toEqual(anotherActiveEventA.recurrence);
    });

    test.todo('Teacher A adds, updates, and deletes events for an enrollment at once successfully');

    // study group
    test('Teacher A updates a single event for an study group successfully', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const changeEventInput = {
            sourceType: 'STUDY_GROUP' as SourceType,
            sourceId: esloTest.testStudyGroup.id,
            events: [updatedStudyGroupActiveEvent],
        };

        const updatedEvents = await calendarModel.changeScheduleBySource(changeEventInput);

        expect(updatedEvents).toBeTruthy();
        expect(updatedEvents).toHaveLength(1);
        expect(updatedEvents[0].title).toEqual(updatedStudyGroupActiveEvent.title);
        expect(updatedEvents[0].recurrence).toEqual(updatedStudyGroupActiveEvent.recurrence);
    });

    test('Teacher A adds a new event for an study group successfully', async () => {
        const calendarModel = new CalendarModel(esloTest.userTeacherA);

        const changeEventInput = {
            sourceType: 'STUDY_GROUP' as SourceType,
            sourceId: esloTest.testStudyGroup.id,
            events: [newStudyGroupActiveEvent],
        };

        const updatedEvents = await calendarModel.changeScheduleBySource(changeEventInput);

        expect(updatedEvents).toBeTruthy();
        expect(updatedEvents).toHaveLength(2);
    });

    test.todo('Teacher A deletes an event for an study group successfully');
    test.todo('Teacher A adds, updates, and deletes events for an study group at once successfully');

    test.todo('validate event attendees for enrollment events');
    test.todo('validate event attendees for study group events');
});
