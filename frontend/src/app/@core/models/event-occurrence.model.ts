import { Enrollment, SourceType, StudyGroup } from './enrollment.model';
import { Event } from './event.model';

export interface EventOccurrence extends Event {
    recurringEventId?: string;
    originalStartDateTime?: string;
    originalStartTimeZone?: string;
    enrollment?: Enrollment;
    studyGroup?: StudyGroup;
}

export interface IEventOccurrenceInput {
    status: string;
    id: string;
    recurringEventId: string;
    originalStartDateTime: string;
    originalStartTimeZone: string;
    sourceType: SourceType;
    sourceId: string;
    availabilityType: string;
    title: string;
    description: string;
    startDateTime: string;
    startTimeZone: string;
    endDateTime: string;
    endTimeZone: string;
    sendNotifications: boolean;
    visibility: string;
}
