import { objectType, inputObjectType, extendType } from 'nexus';

import { EsloContext } from '../context';
import { Enrollment } from './enrollment';
import { StudyGroup } from './study-group';
import { User } from './user';

export const ConferenceData = objectType({
    name: 'ConferenceData',
    definition(t) {
        t.string('sourceType');
        t.string('sourceId');
        t.string('conferenceKey');
        t.string('conferenceUrl');
    },
});

export const EventInput = inputObjectType({
    name: 'EventInput',
    definition(t) {
        t.nonNull.string('title');
        t.string('description');
        t.nonNull.string('availabilityType');
        t.nonNull.string('sourceType');
        t.string('sourceId');
        t.nonNull.string('startDateTime');
        t.nonNull.string('startTimeZone');
        t.nonNull.string('endDateTime');
        t.nonNull.string('endTimeZone');
        t.string('recurrence');
        t.string('status');
        t.boolean('sendNotifications');
        t.string('iCalUID');
        t.string('startedAt');
        t.string('completedAt');
        t.string('visibility');
    },
});

export const EventsInput = inputObjectType({
    name: 'EventsInput',
    definition(t) {
        t.list.field('events', { type: EventInput });
    },
});

export const ChangeEventInput = inputObjectType({
    name: 'ChangeEventInput',
    definition(t) {
        t.nonNull.string('changeStatus');
        t.id('id');
        t.nonNull.string('title');
        t.nonNull.string('description');
        t.nonNull.string('availabilityType');
        t.nonNull.string('sourceType');
        t.nonNull.string('startDateTime');
        t.nonNull.string('startTimeZone');
        t.nonNull.string('endDateTime');
        t.nonNull.string('endTimeZone');
        t.nonNull.string('recurrence');
        t.string('organiserId');
        t.string('ownerId');
        t.boolean('sendNotifications');
        t.string('visibility');
        t.string('completedAt');
    },
});

export const EventOccurrenceInput = inputObjectType({
    name: 'EventOccurrenceInput',
    definition(t) {
        t.nonNull.string('id');
        t.nonNull.string('recurringEventId');
        t.nonNull.string('status');
        t.nonNull.string('sourceType');
        t.nonNull.id('sourceId');
        t.nonNull.string('originalStartDateTime');
        t.nonNull.string('originalStartTimeZone');
        t.nonNull.string('title');
        t.nonNull.string('description');
        t.nonNull.string('availabilityType');
        t.nonNull.string('startDateTime');
        t.nonNull.string('startTimeZone');
        t.nonNull.string('endDateTime');
        t.nonNull.string('endTimeZone');
        t.boolean('sendNotifications');
        t.string('visibility');
    },
});

export const ChangeScheduleInput = inputObjectType({
    name: 'ChangeScheduleInput',
    definition(t) {
        t.nonNull.id('enrollmentId');
        t.list.field('events', { type: ChangeEventInput });
    },
});

export const EventAttendee = objectType({
    name: 'EventAttendee',
    definition(t) {
        t.nonNull.id('id');
        t.string('responseStatus');
        t.string('responseDateTime');
        t.boolean('optional');
        t.string('comment');
        t.boolean('organiser');
        t.field('attendee', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.attendeeId),
        });
    },
});

export const EventOccurrenceAttendee = objectType({
    name: 'EventOccurrenceAttendee',
    definition(t) {
        t.nonNull.id('id');
        t.string('eventOccurrenceId');
        t.string('responseStatus');
        t.string('responseDateTime');
        t.boolean('optional');
        t.string('comment');
        t.boolean('organiser');
        t.field('attendee', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.attendeeId),
        });
    },
});

export const EventOccurrence = objectType({
    name: 'EventOccurrence',
    definition(t) {
        t.nonNull.id('id');
        t.string('title');
        t.string('description');
        t.string('availabilityType');
        t.string('sourceType');
        t.string('sourceId', {
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => {
                switch (parent.sourceType) {
                    case 'ENROLLMENT':
                        return parent.enrollmentId;
                    case 'STUDY_GROUP':
                        return parent.studyGroupId;
                    default:
                        // Invalid source type
                        return null;
                }
            },
        });
        t.string('startDateTime');
        t.string('startTimeZone');
        t.string('endDateTime');
        t.string('endTimeZone');
        t.string('status');
        t.boolean('sendNotifications');
        t.string('iCalUID');
        t.field('conferenceData', {
            type: ConferenceData,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.conferenceData),
        });
        t.string('visibility');
        t.field('enrollment', {
            type: Enrollment,
            resolve: (parent, _, context: EsloContext) =>
                parent.sourceType === 'ENROLLMENT' ? context.models.enrollment.findById(parent.enrollmentId) : null,
        });
        t.field('studyGroup', {
            type: StudyGroup,
            resolve: (parent, _, context: EsloContext) =>
                parent.sourceType === 'STUDY_GROUP' ? context.models.studyGroup.findById(parent.studyGroupId) : null,
        });
        t.field('organiser', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.organiserId),
        });
        t.field('owner', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.ownerId),
        });
        t.id('recurringEventId');
        t.string('originalStartDateTime');
        t.string('originalStartTimeZone');
        t.list.field('eventOccurrenceAttendees', {
            type: EventOccurrenceAttendee,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, context: EsloContext) =>
                context.models.calendar.findEventOccurrenceAttendees(parent.id),
        });
    },
});

export const Event = objectType({
    name: 'Event',
    definition(t) {
        t.nonNull.id('id');
        t.string('title');
        t.string('description');
        t.string('availabilityType');
        t.string('sourceType');
        t.string('sourceId', {
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => {
                switch (parent.sourceType) {
                    case 'ENROLLMENT':
                        return parent.enrollmentId;
                    case 'STUDY_GROUP':
                        return parent.studyGroupId;
                    default:
                        // Invalid source type
                        return null;
                }
            },
        });
        t.string('startDateTime');
        t.string('startTimeZone');
        t.string('endDateTime');
        t.string('endTimeZone');
        t.string('status');
        t.boolean('sendNotifications');
        t.string('iCalUID');
        t.field('conferenceData', {
            type: ConferenceData,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.conferenceData),
        });
        t.string('startedAt');
        t.string('completedAt');
        t.string('visibility');
        t.field('enrollment', {
            type: Enrollment,
            resolve: (parent, _, context: EsloContext) => context.models.enrollment.findById(parent.sourceId),
        });
        t.field('organiser', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.organiserId),
        });
        t.field('owner', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.ownerId),
        });
        t.string('recurrence');
        t.list.field('eventOccurrences', {
            type: EventOccurrence,
            resolve: (parent, _, context: EsloContext) =>
                context.models.calendar.findEventOccurrencesByEvent(parent.id),
        });
        t.list.field('eventAttendees', {
            type: EventAttendee,
            resolve: (parent, _, context: EsloContext) => context.models.calendar.findEventAttendees(parent.id),
        });
    },
});

export const changeSpecificEventBySourceMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('changeSpecificEvent', {
            type: EventOccurrence,
            args: {
                changeSpecificEventInput: EventOccurrenceInput,
            },
            resolve: (_parent, args, context: EsloContext) =>
                context.models.calendar.changeSpecificEventBySource(args.changeSpecificEventInput),
        });
    },
});
