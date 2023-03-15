import { gql } from 'apollo-angular';

export const EVENT_SUMMARY = gql`
    fragment eventSummary on Event {
        id
        title
        description
        availabilityType
        sourceType
        sourceId
        status
        startDateTime
        startTimeZone
        endDateTime
        endTimeZone
        recurrence
        visibility
        sendNotifications
        startedAt
        completedAt
        eventAttendees {
            id
            attendee {
                id
                firstName
            }
        }
    }
`;

export const EVENT_OCCURRENCE_SUMMARY = gql`
    fragment eventOccurrenceSummary on EventOccurrence {
        id
        recurringEventId
        originalStartDateTime
        originalStartTimeZone
        sourceType
        sourceId
        status
        title
        description
        availabilityType
        startDateTime
        startTimeZone
        endDateTime
        endTimeZone
        sendNotifications
        visibility
    }
`;
