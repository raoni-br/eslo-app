import { EventOccurrence } from './event-occurrence.model';
import { Event } from './event.model';
import { Invitation } from './invitation.model';
import { LessonRecordList, ClassRecordType } from './class-record.model';
import { Lesson } from './lesson.model';
import { Level } from './level.model';
import { UserProfile } from './user-profile.model';

export type SourceType = 'ENROLLMENT' | 'STUDY_GROUP';

export enum ENROLLMENT_STATUS {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    DELETED = 'DELETED',
}

export interface StudyGroup {
    enrollments?: Enrollment[];
    events?: Event[];
    id?: string;
    level?: Level;
    name?: string;
    studyGroupClassRecords?: ClassRecordType[];
    lessons?: Lesson[];
    studyGroupTeachers?: Event[];
    nextLesson?: ClassRecordType | any;
    lastLesson?: ClassRecordType;
}

export interface Enrollment {
    sourceType?: SourceType;
    revertLessonStatus?: boolean;
    id?: string;
    levelId?: string;
    teacherId?: string;
    studentId?: string;
    studyGroupId?: string;
    studyGroup?: StudyGroup;
    registrationDate?: string; // DateTime
    activationDate?: string; // DateTime?
    status?: ENROLLMENT_STATUS;
    externalKey?: string;
    level?: Level;
    teacher?: UserProfile;
    student?: UserProfile;
    invitation?: Invitation;
    lastLesson?: ClassRecordType;
    classInProgress?: ClassRecordType;
    events?: Event[];
    eventsOrganised?: Event[];
    nextLesson?: Lesson;
    nextEventOccurrence?: EventOccurrence;
    lessons?: Lesson[];
    classRecords?: ClassRecordType[];
    lessonTrackerList?: LessonRecordList[]; // front end only field
    selected?: boolean; // front end only field
}
