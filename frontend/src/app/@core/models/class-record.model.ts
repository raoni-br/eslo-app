import { Enrollment, SourceType, StudyGroup } from './enrollment.model';
import { Lesson } from './lesson.model';

interface ClassRecordInterface {
    id?: string;
    teacherNotes?: string;
    status?: string;
    startedAt?: string; // DateTime
    completedAt?: string; // DateTime
    lessonStartedAt?: string;
    lessonEndedAt?: string;
    lesson?: Lesson;
    revertClassStatus?: boolean;
}

export interface EnrollmentClassRecord extends ClassRecordInterface {
    enrollmentId: string;
    enrollment?: Enrollment;
}

export interface StudyGroupClassRecord extends ClassRecordInterface {
    studyGroupId: string;
    studyGroup?: StudyGroup;
    studyGroupClassAttendees?: any;
}

export type ClassRecordType = EnrollmentClassRecord | StudyGroupClassRecord;

export interface ClassRecord {
    sourceType: SourceType;
    enrollmentClassRecord?: EnrollmentClassRecord;
    studyGroupClassRecord?: StudyGroupClassRecord;
}

export interface LessonRecordList extends Lesson {
    classRecords?: ClassRecordType[];
}

export interface ClassSession {
    eventStart: string;
    eventEnd: string;
    lessonFinished: boolean;
    attendees?: ClassSessionAttendee[];
}

export interface ClassSessionAttendee {
    studentId: string;
    attended: boolean;
}
