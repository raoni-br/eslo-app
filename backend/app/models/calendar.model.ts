import {
    Event,
    EventAttendee,
    EventOccurrence,
    EventOccurrenceAttendee,
    AvailabilityType,
    SourceType,
    EventStatus,
    EventAttendeeStatus,
    EventVisibility,
    Enrollment,
} from '@prisma/client';

import { UserInputError } from 'apollo-server-express';
import { rrulestr } from 'rrule';

import { EsloModel, ISourceInput } from './eslo.model';
import { EnrollmentModel } from './enrollment.model';
import { StudyGroupModel } from './study-group.model';
import { UserWithSubscription } from './user-profile.model';

import { EventExploder } from '../utils/event-exploder';
import { logger } from '../utils/logger';

export type EventStatusChange = 'DELETED' | 'EDITED' | 'NEW';

export interface IEventInput {
    id?: string;
    title: string;
    description: string;
    availabilityType: AvailabilityType;
    sourceType?: SourceType;
    startDateTime: string;
    startTimeZone: string;
    endDateTime: string;
    endTimeZone: string;
    recurrence: string;
    status: EventStatus;
    sendNotifications?: boolean;
    visibility?: EventVisibility;
    iCalUID?: string;
    conferenceData?: any;
    completedAt?: string;
}

export interface IModifyEventInput extends IEventInput {
    changeStatus: EventStatusChange;
}

export interface IEventOccurrenceInput {
    id: string;
    recurringEventId: string;
    originalStartDateTime: string;
    originalStartTimeZone: string;
    title: string;
    description: string;
    availabilityType: AvailabilityType;
    sourceType: SourceType;
    sourceId: string;
    startDateTime: string;
    startTimeZone: string;
    endDateTime: string;
    endTimeZone: string;
    status: EventStatus;
    sendNotifications: boolean;
    iCalUID?: string;
    organiserId: string;
    ownerId: string;
    visibility: string;
    conferenceData?: any;
}

interface IChangeSchedule extends ISourceInput {
    events: IModifyEventInput[];
}

interface ICreateEventsBySourceInput {
    source: ISourceInput;
    events: IEventInput[];
    status?: EventStatus;
}

export class CalendarModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'calendar');
    }

    private readonly activeFilter = {
        NOT: {
            status: 'CANCELLED' as EventStatus,
        },
    };

    private readonly permissionFilter = {
        eventAttendees: {
            some: {
                attendeeId: this.loggedUser.id,
            },
        },
    };

    private static getDeleteEventData(): object {
        return {
            completedAt: new Date(),
            status: 'CANCELLED',
        };
    }

    private static getSourceFilter(source: ISourceInput): object {
        return {
            sourceType: source.sourceType,
            OR: [{ enrollmentId: source.sourceId }, { studyGroupId: source.sourceId }],
        };
    }

    public async findEventById(id: string): Promise<Event | null> {
        const event = await this.prismaClient.event.findFirst({
            where: { id },
            include: { eventAttendees: true },
        });

        await this.validateIAM({
            action: 'read',
            resourceType: 'Event',
            resource: event,
        });

        return event;
    }

    public async findEventsBySource(source: ISourceInput): Promise<Event[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Event',
        });

        return this.prismaClient.event.findMany({
            where: {
                AND: { ...iamPermission.filter },
                ...this.activeFilter,
                ...CalendarModel.getSourceFilter(source),
            },
        });
    }

    public async findNextEventOccurrenceBySource(source: ISourceInput): Promise<EventOccurrence | null> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Event',
        });

        const events = await this.prismaClient.event.findMany({
            where: {
                AND: { ...iamPermission.filter },
                ...this.activeFilter,
                ...CalendarModel.getSourceFilter(source),
            },
            include: {
                eventOccurrences: true,
                eventAttendees: true,
                enrollment: true,
                studyGroup: true,
            },
        });

        const eventExploder = new EventExploder(events);
        return eventExploder.nextEventOccurrence();
    }

    public async findNextEventOccurrenceByUser(): Promise<EventOccurrence | null> {
        const enrollmentModel = new EnrollmentModel(this.loggedUser);
        const studentEnrollments = await enrollmentModel.findStudentEnrollmentsByUser(this.loggedUser.id);
        const teacherEnrollments = await enrollmentModel.findTeacherEnrollmentsByUser(this.loggedUser.id);

        const enrollments = studentEnrollments.concat(teacherEnrollments);

        const nextEventsOcurrences: EventOccurrence[] = [];
        await Promise.all(
            enrollments.map(async (enrollment) => {
                const eventOcurrence = await this.findNextEventOccurrenceBySource({
                    sourceType: enrollment.studyGroupId ? 'STUDY_GROUP' : 'ENROLLMENT',
                    sourceId: enrollment.studyGroupId ? enrollment.studyGroupId : enrollment.id,
                });

                if (eventOcurrence) {
                    nextEventsOcurrences.push(eventOcurrence);
                }
            }),
        );

        // filter closest event date
        let closestDate = new Date();
        closestDate.setFullYear(closestDate.getFullYear() + 1);
        let closestEventOcurrence: EventOccurrence | null = null;

        nextEventsOcurrences.forEach((event) => {
            if (event.startDateTime < closestDate) {
                closestDate = event.startDateTime;
                closestEventOcurrence = event;
            }
        });

        return closestEventOcurrence;
    }

    public async findEventOccurrencesByEvent(eventId: string): Promise<EventOccurrence[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'EventOccurrence',
        });

        const eventOccurrences = await this.prismaClient.eventOccurrence.findMany({
            where: {
                AND: { ...iamPermission.filter },
                recurringEventId: eventId,
            },
        });

        return eventOccurrences;
    }

    public async findEventsOrganisedByUser(userId: string): Promise<Event[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Event',
        });

        return this.prismaClient.event.findMany({
            where: {
                AND: { ...iamPermission.filter },
                ...this.activeFilter,
                organiserId: userId,
            },
        });
    }

    public async findEventsOwnedByUser(userId: string): Promise<Event[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Event',
        });

        return this.prismaClient.event.findMany({
            where: {
                AND: { ...iamPermission.filter },
                ...this.activeFilter,
                ownerId: userId,
            },
        });
    }

    public async findEventOccurrenceAttendees(eventOccurrenceId: string): Promise<EventOccurrenceAttendee[]> {
        const eventOccurrence = await this.prismaClient.eventOccurrence.findFirst({
            where: { id: eventOccurrenceId },
            include: { eventOccurrenceAttendees: true },
        });

        await this.validateIAM({
            action: 'read',
            resourceType: 'EventOccurrence',
            resource: eventOccurrence,
        });

        return eventOccurrence?.eventOccurrenceAttendees || [];
    }

    public async findEventAttendees(eventId: string): Promise<EventAttendee[]> {
        const event = await this.prismaClient.event.findFirst({
            where: { id: eventId },
            include: { eventAttendees: true },
        });

        await this.validateIAM({
            action: 'read',
            resourceType: 'Event',
            resource: event,
        });

        return event?.eventAttendees || [];
    }

    public async getMyCalendar(fromDateStr: string, toDateStr: string): Promise<EventOccurrence[]> {
        const fromDate = new Date(fromDateStr);
        const toDate = new Date(toDateStr);

        if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
            throw new UserInputError('Invalid input dates');
        }

        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Event',
        });

        const userEvents = await this.prismaClient.event.findMany({
            where: {
                // permissions are handled elsewhere, however this is the myCalendar query
                // So it's expected to return only the user's events irrespective of wider permissions granted
                eventAttendees: {
                    some: {
                        attendeeId: this.loggedUser.id,
                    },
                },
                AND: { ...iamPermission.filter },
                ...this.activeFilter,
            },
            include: {
                eventOccurrences: true,
                eventAttendees: true,
            },
        });

        const eventExploder = new EventExploder(userEvents);
        return eventExploder.betweenDates(fromDate, toDate);
    }

    public async changeSpecificEventBySource(
        changeSpecificEvent: IEventOccurrenceInput,
    ): Promise<EventOccurrence | null> {
        // find enrollment
        if (changeSpecificEvent.sourceType === 'ENROLLMENT') {
            const enrollmentModel = new EnrollmentModel(this.loggedUser);
            const enrollment = await enrollmentModel.findById(changeSpecificEvent.sourceId);

            if (!enrollment) {
                const message = 'Enrollment not found';
                logger.warn({
                    message,
                    subjectId: this.loggedUser.id,
                    resourceType: 'Enrollment',
                    source: 'changeSpecificEventBySource',
                    action: 'update',
                    context: { enrollment: changeSpecificEvent.sourceId },
                });

                throw new UserInputError(message);
            }
        }

        // find study group
        if (changeSpecificEvent.sourceType === 'STUDY_GROUP') {
            const studyGroupModel = new StudyGroupModel(this.loggedUser);
            const studyGroup = await studyGroupModel.findById(changeSpecificEvent.sourceId);

            if (!studyGroup) {
                const message = 'Study group not found';
                logger.warn({
                    message,
                    subjectId: this.loggedUser.id,
                    resourceType: 'StudyGroup',
                    source: 'changeSpecificEventBySource',
                    action: 'update',
                    context: { studyGroup: changeSpecificEvent.sourceId },
                });
                throw new UserInputError(message);
            }
        }

        const startDateTime = new Date(changeSpecificEvent.startDateTime);
        const endDateTime = new Date(changeSpecificEvent.endDateTime);

        if (
            Number.isNaN(startDateTime.getTime()) ||
            Number.isNaN(endDateTime.getTime()) ||
            startDateTime >= endDateTime
        ) {
            const message = 'Invalid event dates';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroup',
                source: 'changeSpecificEventBySource',
                action: 'update',
                context: { studyGroup: changeSpecificEvent.sourceId },
            });
            throw new UserInputError(message);
        }

        // find recurrent event
        const recurringEvent = await this.findEventById(changeSpecificEvent.recurringEventId);
        if (!recurringEvent) {
            // TODO: There is no option to create additional event occurrences yet
            throw new UserInputError('Event recurrence not found');
        }

        // check if user can modify event by creating event exception
        await this.validateIAM({
            action: 'update',
            resourceType: 'Event',
            resource: recurringEvent,
        });

        // Event occurrences generated when an event is expanded are created with id in the format:
        // {recurringEventId}--{index}
        const eventOccurrenceId = changeSpecificEvent.id.split('--')[0];

        let eventException: EventOccurrence;
        if (eventOccurrenceId === changeSpecificEvent.recurringEventId) {
            // validate that original event start time falls within schedule of recurring event
            const originalStartDateTime = new Date(changeSpecificEvent.originalStartDateTime);
            const recurrence = rrulestr(recurringEvent.recurrence, { dtstart: originalStartDateTime });
            const originalStartDate = new Date(
                Date.UTC(
                    originalStartDateTime.getUTCFullYear(),
                    originalStartDateTime.getUTCMonth(),
                    originalStartDateTime.getUTCDate(),
                    0,
                    0,
                    0,
                    0,
                ),
            );

            const msToHour = 1000 * 60 * 60; // helper variable to convert miliseconds to hour
            const originalEventSchedule = recurrence.between(
                originalStartDate,
                new Date(originalStartDate.getTime() + msToHour * 24),
                true,
            );

            if (originalEventSchedule.length !== 1) {
                throw new UserInputError('Original event start date is not within event schedule');
            }

            const eventDateTime = EventExploder.getEventDateFromRecurrence(originalEventSchedule[0], recurringEvent);
            if (eventDateTime.toJSDate().toISOString() !== changeSpecificEvent.originalStartDateTime) {
                throw new UserInputError('Original event start date is not within event schedule');
            }

            // event attendees from recurring event
            const eventOccurrenceAttendees = (await this.findEventAttendees(recurringEvent.id)).map((attendee) => ({
                attendeeId: attendee.attendeeId,
                organiser: attendee.organiser,
                optional: attendee.optional,
                comment: attendee.comment,
                responseStatus: (attendee.attendeeId === this.loggedUser.id
                    ? 'ACCEPTED'
                    : 'PENDING') as EventAttendeeStatus,
            }));

            // create event exception
            eventException = await this.prismaClient.eventOccurrence.create({
                data: {
                    recurringEventId: changeSpecificEvent.recurringEventId,
                    originalStartDateTime: changeSpecificEvent.originalStartDateTime,
                    originalStartTimeZone: changeSpecificEvent.originalStartTimeZone,
                    title: changeSpecificEvent.title,
                    description: changeSpecificEvent.description,
                    availabilityType: changeSpecificEvent.availabilityType,
                    sourceType: changeSpecificEvent.sourceType,
                    enrollmentId: changeSpecificEvent.sourceType === 'ENROLLMENT' ? changeSpecificEvent.sourceId : null,
                    studyGroupId:
                        changeSpecificEvent.sourceType === 'STUDY_GROUP' ? changeSpecificEvent.sourceId : null,
                    startDateTime: changeSpecificEvent.startDateTime,
                    startTimeZone: changeSpecificEvent.startTimeZone,
                    endDateTime: changeSpecificEvent.endDateTime,
                    endTimeZone: changeSpecificEvent.endTimeZone,
                    status: changeSpecificEvent.status,
                    sendNotifications: changeSpecificEvent.sendNotifications,
                    organiserId: this.loggedUser.id,
                    ownerId: this.loggedUser.id,
                    visibility: changeSpecificEvent.visibility,
                    eventOccurrenceAttendees: { createMany: { data: eventOccurrenceAttendees } },
                },
            });
        } else {
            // modify existing event occurrence
            eventException = await this.prismaClient.eventOccurrence.update({
                where: {
                    id: eventOccurrenceId,
                },
                data: {
                    title: changeSpecificEvent.title,
                    description: changeSpecificEvent.description,
                    startDateTime: changeSpecificEvent.startDateTime,
                    startTimeZone: changeSpecificEvent.startTimeZone,
                    endDateTime: changeSpecificEvent.endDateTime,
                    endTimeZone: changeSpecificEvent.endTimeZone,
                    status: changeSpecificEvent.status,
                    eventOccurrenceAttendees: {
                        updateMany: {
                            data: { responseStatus: 'PENDING' as EventAttendeeStatus },
                            where: { NOT: { attendeeId: this.loggedUser.id } },
                        },
                    },
                },
            });
        }

        return eventException;
    }

    public async confirmEnrollmentEvents(enrollment: Enrollment): Promise<Event[]> {
        let source: ISourceInput;

        if (enrollment.studyGroupId) {
            source = { sourceType: 'STUDY_GROUP', sourceId: enrollment.studyGroupId };

            const studyGroupEventIds = (await this.findEventsBySource(source)).map((event) => event.id);

            this.prismaClient.eventAttendee.updateMany({
                data: {
                    responseStatus: 'ACCEPTED',
                    responseDateTime: new Date(),
                },
                where: {
                    eventId: { in: studyGroupEventIds },
                    attendeeId: enrollment.studentId,
                },
            });
        } else {
            source = { sourceType: 'ENROLLMENT', sourceId: enrollment.id };
            const pendingEvents = (await this.findEventsBySource(source)).filter(
                (event) => event.status === 'TENTATIVE',
            );

            await this.prismaClient.$transaction(
                pendingEvents.map((event: Event) =>
                    this.prismaClient.event.update({
                        where: { id: event.id },
                        data: {
                            status: 'CONFIRMED',
                            eventAttendees: {
                                updateMany: {
                                    where: {
                                        responseStatus: 'PENDING',
                                    },
                                    data: {
                                        responseStatus: 'ACCEPTED',
                                        responseDateTime: new Date(),
                                    },
                                },
                            },
                        },
                    }),
                ),
            );
        }

        return this.findEventsBySource(source);
    }

    public async createEventsBySource(input: ICreateEventsBySourceInput): Promise<Event[]> {
        if (input.events.length === 0) {
            throw new UserInputError('No events to be created');
        }

        if (!['ENROLLMENT', 'STUDY_GROUP'].includes(input.source.sourceType)) {
            throw new UserInputError('Invalid source type');
        }

        await this.validateIAM({
            action: 'bulk_insert',
            resourceType: 'Event',
        });

        // add loggedUser as organiser
        const eventAttendees = [
            {
                attendeeId: this.loggedUser.id,
                responseStatus: 'ACCEPTED' as EventAttendeeStatus,
                organiser: true,
            },
        ];

        // validate source
        const enrollmentModel = new EnrollmentModel(this.loggedUser);
        if (input.source.sourceType === 'ENROLLMENT') {
            // add enrolled student as attendee
            const enrollment = await enrollmentModel.findById(input.source.sourceId);
            if (!enrollment) {
                throw new UserInputError('Enrollment not found');
            }

            eventAttendees.push({
                attendeeId: enrollment.studentId,
                responseStatus: input.status === 'CONFIRMED' ? 'ACCEPTED' : 'PENDING',
                organiser: false,
            });
        } else {
            // add students from study group as attendee
            const studyGroupModel = new StudyGroupModel(this.loggedUser);
            const studyGroup = await studyGroupModel.findById(input.source.sourceId);

            if (!studyGroup) {
                throw new UserInputError('Study Group not found');
            }

            const enrollments = await enrollmentModel.findByStudyGroup(input.source.sourceId);
            if (enrollments.length > 0) {
                enrollments.forEach((studyGroupEnrollment) => {
                    eventAttendees.push({
                        attendeeId: studyGroupEnrollment.studentId,
                        responseStatus: input.status === 'CONFIRMED' ? 'ACCEPTED' : 'PENDING',
                        organiser: false,
                    });
                });
            }
        }

        await this.prismaClient.$transaction(
            input.events.map((event: IEventInput) => {
                return this.prismaClient.event.create({
                    data: {
                        title: event.title,
                        description: event.description,
                        sourceType: input.source.sourceType,
                        enrollmentId: input.source.sourceType === 'ENROLLMENT' ? input.source.sourceId : null,
                        studyGroupId: input.source.sourceType === 'STUDY_GROUP' ? input.source.sourceId : null,
                        availabilityType: 'BUSY',
                        status:
                            input.source.sourceType === 'ENROLLMENT' && input.status === 'CONFIRMED'
                                ? 'CONFIRMED'
                                : 'TENTATIVE',
                        recurrence: event.recurrence,
                        startDateTime: event.startDateTime,
                        startTimeZone: event.startTimeZone,
                        endDateTime: event.endDateTime,
                        endTimeZone: event.endTimeZone,
                        organiserId: this.loggedUser.id,
                        ownerId: this.loggedUser.id,
                        eventAttendees: {
                            createMany: { data: eventAttendees },
                        },
                    },
                });
            }),
        );

        return this.prismaClient.event.findMany({
            where: {
                ...CalendarModel.getSourceFilter({
                    sourceType: input.source.sourceType,
                    sourceId: input.source.sourceId,
                }),
                ...this.activeFilter,
                ownerId: this.loggedUser.id,
            },
            include: { eventAttendees: true },
        });
    }

    public async cancelEvent(eventId: string): Promise<Event> {
        const event = await this.findEventById(eventId);

        if (!event) {
            throw new UserInputError('Event not found');
        }

        await this.validateIAM({
            action: 'cancel',
            resourceType: 'Event',
            resource: event,
        });

        return this.prismaClient.event.update({
            where: { id: event.id },
            data: CalendarModel.getDeleteEventData(),
        });
    }

    public async cancelAllEventsBySource(source: ISourceInput): Promise<boolean> {
        const iamPermission = await this.validateIAM({
            action: 'bulk_update',
            resourceType: 'Event',
        });

        await this.prismaClient.event.updateMany({
            where: {
                AND: { ...iamPermission.filter },
                ...CalendarModel.getSourceFilter(source),
                ...this.activeFilter,
            },
            data: CalendarModel.getDeleteEventData(),
        });

        return true;
    }

    public async changeScheduleBySource(schedule: IChangeSchedule): Promise<Event[]> {
        const iamPermission = await this.validateIAM({
            action: 'bulk_update',
            resourceType: 'Event',
        });

        const currentEvents = await this.prismaClient.event.findMany({
            where: {
                AND: { ...iamPermission.filter },
                ...CalendarModel.getSourceFilter({ sourceType: schedule.sourceType, sourceId: schedule.sourceId }),
                ...this.activeFilter,
            },
            include: {
                eventAttendees: {
                    select: {
                        attendeeId: true,
                        responseStatus: true,
                        organiser: true,
                    },
                },
            },
        });

        const deletedEvents: IModifyEventInput[] = [];
        const editedEvents: IModifyEventInput[] = [];
        const newEvents: IModifyEventInput[] = [];
        const modifiedEventIds: string[] = [];

        schedule.events.forEach((event) => {
            if (event.changeStatus === 'NEW') {
                const newEvent = { ...event };
                newEvent.id = undefined;
                newEvents.push(newEvent);
            } else {
                const valid = currentEvents.filter((currentEvent) => currentEvent.id === event.id);
                if (valid.length !== 1) {
                    throw new UserInputError('At least one modified event does not belong to the source');
                }

                // validate that there is no more than one record for the same event
                if (modifiedEventIds.includes(event.id || '')) {
                    throw new UserInputError('Multiple operations detected for the same event');
                }
                modifiedEventIds.push(event.id || '');

                if (event.changeStatus === 'EDITED') {
                    editedEvents.push(event);
                } else {
                    deletedEvents.push(event);
                }
            }
        });

        if (deletedEvents.length === 0 && editedEvents.length === 0 && newEvents.length === 0) {
            throw new UserInputError(`No events received.`);
        }

        if (deletedEvents.length === currentEvents.length && newEvents.length === 0) {
            throw new UserInputError(
                `All active events would be deleted for this source. There must be at least one active event`,
            );
        }

        // cancel edited and deleted events
        if (deletedEvents.length > 0 || editedEvents.length > 0) {
            const eventIds: string[] = deletedEvents
                .map((deletedEvent) => deletedEvent.id || '')
                .concat(editedEvents.map((editedEvent) => editedEvent.id || ''))
                .filter((event) => event !== '');

            eventIds.map(async (id) => {
                const deletedEvent = await this.cancelEvent(id);
                return deletedEvent;
            });
        }

        // create events for edited and new events
        if (newEvents.length > 0 || editedEvents.length > 0) {
            const events: IEventInput[] = newEvents.concat(editedEvents);
            await this.createEventsBySource({
                source: {
                    sourceId: schedule.sourceId,
                    sourceType: schedule.sourceType,
                },
                events,
                status: 'CONFIRMED',
            });
        }

        return this.prismaClient.event.findMany({
            where: {
                ...CalendarModel.getSourceFilter({ sourceType: schedule.sourceType, sourceId: schedule.sourceId }),
                ...this.activeFilter,
                ownerId: this.loggedUser.id,
            },
            include: { eventAttendees: true },
        });
    }
}
