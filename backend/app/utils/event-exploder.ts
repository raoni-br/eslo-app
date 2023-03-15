import { Prisma, EventOccurrence, Event } from '@prisma/client';
import { rrulestr } from 'rrule';
import { DateTime } from 'luxon'; // in order to calculate DSTs offsets

import { logger } from './logger';

// Prisma only exposes models with raw attributes.
// When using relations (i.e. include: {})a custom type must be defined
type EventWithRelations = Prisma.EventGetPayload<{
    include: { eventOccurrences: true; eventAttendees: true };
}>;

export class EventExploder {
    events: EventWithRelations[];

    constructor(events: EventWithRelations[]) {
        this.events = events;
    }

    static getEventDateFromRecurrence(recurrenceDate: Date, event: Event): DateTime {
        // consider possible offset in case time zone has daylight saving times (DST)
        // the start/end times of an event should stay the same even when there is DST in effect
        const recurringEventStartDateTime = DateTime.fromJSDate(
            new Date(
                Date.UTC(
                    recurrenceDate.getUTCFullYear(),
                    recurrenceDate.getUTCMonth(),
                    recurrenceDate.getUTCDate(),
                    event.startDateTime.getUTCHours(),
                    event.startDateTime.getUTCMinutes(),
                    0,
                    0,
                ),
            ),
        ).setZone(event.startTimeZone);

        const eventDateTimeStart = DateTime.fromJSDate(event.startDateTime).setZone(event.startTimeZone);
        const timeZoneDiff = recurringEventStartDateTime.offset - eventDateTimeStart.offset;
        return recurringEventStartDateTime.minus({ minutes: timeZoneDiff });
    }

    expandEvents(fromDate: Date, toDate?: Date): EventOccurrence[] {
        const eventsExploded: EventOccurrence[] = [];

        // return no events when fromDate > toDate
        if (toDate && toDate.getTime() < fromDate.getTime()) {
            return eventsExploded;
        }

        this.events.forEach((event) => {
            if (event.status === 'CANCELLED' || (event.completedAt && fromDate > event.completedAt)) {
                // disregard deleted events or events completed prior to given from Date
                return;
            }

            const actualDateStart = new Date(Math.max(event.startedAt.getTime(), fromDate.getTime()));
            const rruleRecurrence = rrulestr(event.recurrence, { dtstart: actualDateStart });
            const eventDuration = event.endDateTime.getTime() - event.startDateTime.getTime();

            // toDate -> get events between dates
            // otherwise, get first event after fromDate
            let actualDateEnd = toDate
                ? new Date(toDate.getTime())
                : DateTime.fromJSDate(fromDate).plus({ months: 1 }).toJSDate();

            if (event.completedAt) {
                actualDateEnd = new Date(Math.min(event.completedAt.getTime(), actualDateEnd.getTime()));
            }

            const recurringEvents: Date[] = rruleRecurrence.between(actualDateStart, actualDateEnd, true);
            const currentEventInstances: EventOccurrence[] = [];

            recurringEvents.forEach((recurringEvent, index) => {
                const eventStartDateTime = EventExploder.getEventDateFromRecurrence(recurringEvent, event);
                const eventEndDateTime = eventStartDateTime.plus({ milliseconds: eventDuration });

                // Define the object to be returned
                currentEventInstances.push({
                    id: `${event.id}--${index}`,
                    originalStartDateTime: eventStartDateTime.toJSDate(),
                    originalStartTimeZone: event.startTimeZone,
                    recurringEventId: event.id,
                    title: event.title,
                    description: event.description,
                    availabilityType: event.availabilityType,
                    sourceType: event.sourceType,
                    enrollmentId: event.enrollmentId,
                    studyGroupId: event.studyGroupId,
                    startDateTime: eventStartDateTime.toJSDate(),
                    startTimeZone: event.startTimeZone,
                    endDateTime: eventEndDateTime.toJSDate(),
                    endTimeZone: event.endTimeZone,
                    status: event.status,
                    conferenceData: event.conferenceData,
                    visibility: event.visibility,
                    sendNotifications: event.sendNotifications,
                    iCalUID: event.iCalUID,
                    organiserId: event.organiserId,
                    ownerId: event.ownerId,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    deletedAt: event.deletedAt,
                });
            });

            event.eventOccurrences.forEach((eventException) => {
                const originalEventIndex = currentEventInstances.findIndex((eventInstance) => {
                    return eventInstance.startDateTime.getTime() === eventException.originalStartDateTime?.getTime();
                });

                if (originalEventIndex === -1) {
                    logger.error({
                        message: 'Recurring event not found for event occurrence',
                        resourceType: 'EventOccurrence',
                        action: 'list',
                        source: 'expandEvents',
                        context: { eventOccurence: eventException.id },
                    });
                    return;
                }

                if (eventException.status !== 'CANCELLED') {
                    currentEventInstances.splice(originalEventIndex, 1, eventException);
                } else {
                    currentEventInstances.splice(originalEventIndex, 1);
                }
            });

            eventsExploded.push(...currentEventInstances);
        });

        return eventsExploded;
    }

    nextEventOccurrence(fromDate?: Date): EventOccurrence | null {
        const nextFromDate = fromDate || new Date();
        const nextEvents = this.expandEvents(nextFromDate);

        let nextEvent: EventOccurrence | null = null;

        nextEvents.forEach((eventInstance) => {
            if (!nextEvent || eventInstance.startDateTime < nextEvent.startDateTime) {
                nextEvent = eventInstance;
            }
        });

        return nextEvent;
    }

    betweenDates(fromDate: Date, toDate: Date): EventOccurrence[] {
        // TODO: adjust to/from dates to consider full day according to user's preference time zone
        return this.expandEvents(fromDate, toDate);
    }
}
