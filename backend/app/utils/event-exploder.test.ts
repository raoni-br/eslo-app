import { EventAttendee, EventOccurrence, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';

import { EventExploder } from './event-exploder';
// import { logger } from './logger';

// Prisma only exposes models with raw attributes.
// When using relations (i.e. include: {})a custom type must be defined
type EventWithRelations = Prisma.EventGetPayload<{
    include: { eventOccurrences: true; eventAttendees: true };
}>;

beforeAll(async () => {
    // await esloTest.resetDB();
    // await esloTest.createTestUsers();
});

afterAll(async () => {
    // await esloTest.prismaClient.$disconnect();
});

describe('Get events between dates', () => {
    const ownerAttendee: EventAttendee = {
        id: 'dd3802c7-c1c8-4337-996c-7250b9122564',
        eventId: '8418d303-96b6-482e-864c-590147bc600d',
        attendeeId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        responseStatus: 'ACCEPTED',
        responseDateTime: null,
        optional: false,
        comment: null,
        organiser: true,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    const modifiedEventOccurrence: EventOccurrence = {
        id: '17813b7e-5ba7-4e6d-b351-d46b27ae15e4',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        recurringEventId: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        originalStartDateTime: new Date(Date.UTC(2021, 3, 7, 8, 0)), // 07/04/2021 08:00 UTC --> 07/04/2021 18:00 AEST (+10 GMT)
        originalStartTimeZone: 'Australia/Sydney',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        startDateTime: new Date(Date.UTC(2021, 3, 8, 9, 0)), // 08/04/2021 09:00 UTC --> 08/04/2021 19:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 3, 8, 10, 30)), // 08/04/2021 10:30 UTC --> 08/04/2021 20:30 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
    };

    const deletedEventOccurrence: EventOccurrence = {
        id: '17813b7e-5ba7-4e6d-b351-d46b27ae15e4',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        recurringEventId: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        originalStartDateTime: new Date(Date.UTC(2021, 3, 7, 8, 0)), // 07/04/2021 08:00 UTC --> 07/04/2021 18:00 AEST (+10 GMT)
        originalStartTimeZone: 'Australia/Sydney',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        startDateTime: new Date(Date.UTC(2021, 3, 8, 9, 0)), // 08/04/2021 09:00 UTC --> 08/04/2021 19:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 3, 8, 10, 30)), // 08/04/2021 10:30 UTC --> 08/04/2021 20:30 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        status: 'CANCELLED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
    };

    const ongoingEvent: EventWithRelations = {
        id: '8418d303-96b6-482e-864c-590147bc600d',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
        completedAt: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [],
    };

    const completedEvent: EventWithRelations = {
        id: '8418d303-96b6-482e-864c-590147bc600c',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
        completedAt: new Date(Date.UTC(2021, 3, 15, 7, 0)),
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [],
    };

    const deletedEvent: EventWithRelations = {
        id: '6e075e88-8015-4022-9819-02070e1e7ec4',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
        status: 'CANCELLED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
        completedAt: new Date(Date.UTC(2021, 3, 15, 7, 0)),
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [],
    };

    const eventWithException: EventWithRelations = {
        id: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
        completedAt: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [modifiedEventOccurrence],
    };

    const eventWithDeletedInstance: EventWithRelations = {
        id: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 2, 30, 7, 0)), // 30/03/2021 07:00 UTC --> 01/05/2021 18:00 AEST (+11 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 2, 30, 8, 0)), // 30/03/2021 08:00 UTC --> 01/05/2021 19:00 AEST (+11 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
        completedAt: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [deletedEventOccurrence],
    };

    test('Find no events when start date is greater than the end date', () => {
        const eventExploder = new EventExploder([ongoingEvent]);
        expect(eventExploder.betweenDates(new Date(2021, 4, 1), new Date(2021, 2, 1))).toHaveLength(0);
    });

    test('Find no events from dates prior to event start', () => {
        const eventExploder = new EventExploder([ongoingEvent]);
        expect(eventExploder.betweenDates(new Date(2021, 1, 1), new Date(2021, 2, 1))).toHaveLength(0);
    });

    test('Expand all events between a period that starts before the event when event has no completed date', () => {
        const eventExploder = new EventExploder([ongoingEvent]);
        const expandedEvents = eventExploder.betweenDates(new Date(Date.UTC(2021, 1, 1)), new Date(2021, 4, 1));

        expect(expandedEvents).toHaveLength(10);
    });

    test('Expand only events between event started and completed dates', () => {
        const eventExploder = new EventExploder([completedEvent]);
        const expandedEvents = eventExploder.betweenDates(new Date(Date.UTC(2021, 1, 1)), new Date(2021, 4, 1));

        expect(expandedEvents).toHaveLength(6);
    });

    test('Do not expand deleted events', () => {
        const eventExploder = new EventExploder([completedEvent, deletedEvent]);
        const expandedEvents = eventExploder.betweenDates(new Date(Date.UTC(2021, 1, 1)), new Date(2021, 4, 1));

        expect(expandedEvents).toHaveLength(6);
    });

    test('Event time stays the same event when changing to/from DST', () => {
        const eventExploder = new EventExploder([completedEvent]);
        const eventStartDate = DateTime.fromJSDate(completedEvent.startDateTime).setZone(completedEvent.startTimeZone);

        const expandedEvents = eventExploder.betweenDates(new Date(Date.UTC(2021, 1, 1)), new Date(2021, 4, 1));
        const differentTimes = expandedEvents.filter((event) => {
            const expandedStartDate = DateTime.fromJSDate(event.startDateTime).setZone(completedEvent.startTimeZone);
            return eventStartDate.hour !== expandedStartDate.hour || eventStartDate.minute !== expandedStartDate.minute;
        });

        expect(differentTimes).toHaveLength(0);
    });

    test('Modified event occurrence replaces original event instance', () => {
        const eventExploder = new EventExploder([eventWithException]);
        const eventStartDate = DateTime.fromJSDate(eventWithException.startDateTime).setZone(
            eventWithException.startTimeZone,
        );

        const expandedEvents = eventExploder.betweenDates(new Date(Date.UTC(2021, 1, 1)), new Date(2021, 3, 10));
        const differentTimes = expandedEvents.filter((event) => {
            const expandedStartDate = DateTime.fromJSDate(event.startDateTime).setZone(
                eventWithException.startTimeZone,
            );
            return eventStartDate.hour !== expandedStartDate.hour || eventStartDate.minute !== expandedStartDate.minute;
        });

        expect(expandedEvents).toHaveLength(3);

        expect(expandedEvents[2].startDateTime.getTime()).toBe(new Date(Date.UTC(2021, 3, 8, 9, 0)).getTime());
        expect(expandedEvents[2].endDateTime.getTime()).toBe(new Date(Date.UTC(2021, 3, 8, 10, 30)).getTime());

        expect(differentTimes).toHaveLength(1);
    });

    test('Deleted event instance is not included in the calendar', () => {
        const eventExploder = new EventExploder([eventWithDeletedInstance]);
        const eventStartDate = DateTime.fromJSDate(eventWithException.startDateTime).setZone(
            eventWithException.startTimeZone,
        );

        const expandedEvents = eventExploder.betweenDates(new Date(Date.UTC(2021, 1, 1)), new Date(2021, 3, 10));
        const differentTimes = expandedEvents.filter((event) => {
            const expandedStartDate = DateTime.fromJSDate(event.startDateTime).setZone(
                eventWithException.startTimeZone,
            );
            return eventStartDate.hour !== expandedStartDate.hour || eventStartDate.minute !== expandedStartDate.minute;
        });

        expect(expandedEvents).toHaveLength(2);
        expect(differentTimes).toHaveLength(0);
    });
});

describe('Get next event instance from date', () => {
    const ownerAttendee: EventAttendee = {
        id: 'dd3802c7-c1c8-4337-996c-7250b9122564',
        eventId: '8418d303-96b6-482e-864c-590147bc600d',
        attendeeId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        responseStatus: 'ACCEPTED',
        responseDateTime: null,
        optional: false,
        comment: null,
        organiser: true,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    const earlyEventOccurrence: EventOccurrence = {
        id: '17813b7e-5ba7-4e6d-b351-d46b27ae15e4',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        recurringEventId: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        originalStartDateTime: new Date(Date.UTC(2021, 4, 19, 0, 0)), // 17/05/2021 00:00 UTC --> 17/05/2021 10:00 AEST (+10 GMT)
        originalStartTimeZone: 'Australia/Sydney',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        startDateTime: new Date(Date.UTC(2021, 4, 16, 0, 0)), // 20/05/2021 00:00 UTC --> 20/05/2021 10:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 16, 1, 30)), // 20/05/2021 01:30 UTC --> 20/05/2021 11:30 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
    };

    const lateEventOccurrence: EventOccurrence = {
        id: '17813b7e-5ba7-4e6d-b351-d46b27ae15e4',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        recurringEventId: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        originalStartDateTime: new Date(Date.UTC(2021, 4, 17, 0, 0)), // 17/05/2021 00:00 UTC --> 17/05/2021 10:00 AEST (+10 GMT)
        originalStartTimeZone: 'Australia/Sydney',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        startDateTime: new Date(Date.UTC(2021, 4, 20, 0, 0)), // 20/05/2021 00:00 UTC --> 20/05/2021 10:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 20, 1, 30)), // 20/05/2021 01:30 UTC --> 20/05/2021 11:30 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
    };

    const deletedEventOccurrence: EventOccurrence = {
        id: '17813b7e-5ba7-4e6d-b351-d46b27ae15e4',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        recurringEventId: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        originalStartDateTime: new Date(Date.UTC(2021, 4, 17, 0, 0)), // 17/05/2021 00:00 UTC --> 17/05/2021 10:00 AEST (+10 GMT)
        originalStartTimeZone: 'Australia/Sydney',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        startDateTime: new Date(Date.UTC(2021, 4, 17, 0, 0)), // 17/05/2021 00:00 UTC --> 17/05/2021 10:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 17, 1, 0)), // 17/05/2021 01:00 UTC --> 17/05/2021 11:00 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        status: 'CANCELLED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
    };

    const ongoingEvent: EventWithRelations = {
        id: '8418d303-96b6-482e-864c-590147bc600d',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 4, 1, 0, 0)), // 01/05/2021 00:00 UTC --> 01/05/2021 10:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 1, 1, 0)), // 01/05/2021 01:00 UTC --> 01/05/2021 11:00 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 4, 1, 0, 0)),
        completedAt: null,
        createdAt: new Date(2021, 4, 1),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [],
    };

    const completedEvent: EventWithRelations = {
        id: '8418d303-96b6-482e-864c-590147bc600c',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 4, 15, 5, 0)), // 15/05/2021 05:00 UTC --> 15/05/2021 15:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 15, 6, 0)), // 15/05/2021 06:00 UTC --> 15/05/2021 16:00 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 4, 1, 0, 0)),
        completedAt: new Date(Date.UTC(2021, 4, 15, 7, 0)),
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [],
    };

    const eventWithLateException: EventWithRelations = {
        id: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 4, 1, 0, 0)), // 01/05/2021 00:00 UTC --> 01/05/2021 10:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 1, 1, 0)), // 01/05/2021 01:00 UTC --> 01/05/2021 11:00 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
        completedAt: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [lateEventOccurrence],
    };

    const eventWithEarlyException: EventWithRelations = {
        id: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 4, 1, 0, 0)), // 01/05/2021 00:00 UTC --> 01/05/2021 10:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 1, 1, 0)), // 01/05/2021 01:00 UTC --> 01/05/2021 11:00 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
        completedAt: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [earlyEventOccurrence],
    };

    const eventWithDeletedInstance: EventWithRelations = {
        id: '4a7dbfee-86b7-4ea9-9668-c1e1ebe972b8',
        title: 'Renato (1 on 1)',
        description: 'A2 - Elementary',
        availabilityType: 'BUSY',
        sourceType: 'ENROLLMENT',
        enrollmentId: 'cedcd791-95ac-4d74-a2c6-587bd0b0161c',
        studyGroupId: null,
        startDateTime: new Date(Date.UTC(2021, 4, 1, 0, 0)), // 01/05/2021 00:00 UTC --> 01/05/2021 10:00 AEST (+10 GMT)
        startTimeZone: 'Australia/Sydney',
        endDateTime: new Date(Date.UTC(2021, 4, 1, 1, 0)), // 01/05/2021 01:00 UTC --> 01/05/2021 11:00 AEST (+10 GMT)
        endTimeZone: 'Australia/Sydney',
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE',
        status: 'CONFIRMED',
        sendNotifications: true,
        iCalUID: null,
        organiserId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        ownerId: '8bd1e5f9-df10-4172-87e8-15e31f009b45',
        visibility: 'PUBLIC',
        conferenceData: null,
        startedAt: new Date(Date.UTC(2021, 2, 30, 7, 0)),
        completedAt: null,
        createdAt: new Date(2021, 2, 30),
        updatedAt: null,
        deletedAt: null,
        eventAttendees: [ownerAttendee],
        eventOccurrences: [deletedEventOccurrence],
    };

    test('Get next event instance disregarding finished event', () => {
        const eventExploder = new EventExploder([completedEvent, ongoingEvent]);

        const nextEvent = eventExploder.nextEventOccurrence(new Date(Date.UTC(2021, 4, 15)));

        expect(nextEvent).toBeTruthy();
        expect(nextEvent?.startDateTime.getTime()).toBe(new Date(Date.UTC(2021, 4, 18, 0, 0)).getTime());
    });

    test('Ignore modified event instance that will occur later than previously scheduled', () => {
        const eventExploder = new EventExploder([eventWithLateException]);

        const nextEvent = eventExploder.nextEventOccurrence(new Date(Date.UTC(2021, 4, 15)));

        expect(nextEvent).toBeTruthy();
        expect(nextEvent?.startDateTime.getTime()).toBe(new Date(Date.UTC(2021, 4, 19, 0, 0)).getTime());
    });

    test('Get modified event instance that will occur before the recurring instances', () => {
        const eventExploder = new EventExploder([eventWithEarlyException]);

        const nextEvent = eventExploder.nextEventOccurrence(new Date(Date.UTC(2021, 4, 15)));

        expect(nextEvent).toBeTruthy();
        expect(nextEvent?.startDateTime.getTime()).toBe(new Date(Date.UTC(2021, 4, 16, 0, 0)).getTime());
    });

    test('Skip deleted event instance', () => {
        const eventExploder = new EventExploder([eventWithDeletedInstance]);

        const nextEvent = eventExploder.nextEventOccurrence(new Date(Date.UTC(2021, 4, 15)));

        expect(nextEvent).toBeTruthy();
        expect(nextEvent?.startDateTime.getTime()).toBe(new Date(Date.UTC(2021, 4, 19, 0, 0)).getTime());
    });
});
