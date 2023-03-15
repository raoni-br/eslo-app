export interface Event {
    id?: string;
    title?: string;
    description?: string;
    availabilityType?: string;
    sourceType?: string;
    sourceId?: string;
    startDateTime?: string; // DateTime
    startTimeZone?: string;
    endDateTime?: string; // DateTime
    endTimeZone?: string;
    recurrence?: string;
    status?: string;
    sendNotifications?: boolean;
    iCalUID?: string;
    organiserId?: string;
    ownerId?: string;
    visibility?: string;
    conferenceData?: any;
    startedAt?: string; // DateTime
    completedAt?: string; // DateTime
    changeStatus?: 'NEW' | 'EDITED' | 'DELETED'; // Frontend-only field for backend to use to add, update or delete the event
    selectedWeekday?: string; // Frontend-only field to identify the selected day
    formArrayIndex?: number; // Frontend-only field to identify the index of event in the form to perform operations (update and delete)
    currentDays?: number[]; // Frontend-only field to identify the current selected days (update and delete)
    hasConflict?: boolean; // Frontend-only field to identify if has conflict
}
