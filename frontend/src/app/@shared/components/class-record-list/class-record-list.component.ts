import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { Enrollment, StudyGroup } from 'app/@core/models/enrollment.model';
import { ClassRecord, LessonRecordList, ClassRecordType } from 'app/@core/models/class-record.model';

@Component({
    selector: 'app-class-record-list',
    templateUrl: './class-record-list.component.html',
    styleUrls: ['./class-record-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassRecordListComponent {
    @Input() lessonTrackerList: LessonRecordList[];
    @Input() enrollment: Enrollment;
    @Input() classInProgress: ClassRecord;

    @Input() isGroup: boolean;
    @Input() group: StudyGroup;

    @Input() student: boolean;

    @Output() startClassEvent = new EventEmitter();
    @Output() resumeClassEvent = new EventEmitter();
    @Output() revertClassEvent = new EventEmitter();
    @Output() revertLessonEvent = new EventEmitter();
    @Output() openAttendeesEvent = new EventEmitter();
    @Output() openStudentBookEvent = new EventEmitter();
    @Output() goToLessonEvent = new EventEmitter();

    constructor(private mediaObserver: MediaObserver) {}

    onStartClass(classRecordItem: any) {
        this.startClassEvent.emit(classRecordItem);
    }

    onResumeClass(classRecordItem: any) {
        this.resumeClassEvent.emit(classRecordItem);
    }

    onRevertLesson(classRecordItem: any) {
        this.revertLessonEvent.emit(classRecordItem);
    }

    onOpenAttendees(track: any) {
        this.openAttendeesEvent.emit(track.studyGroupClassAttendees);
    }

    getLastClass(lesson: LessonRecordList): ClassRecordType {
        if (!lesson.classRecords || lesson.classRecords.length === 0) {
            return undefined;
        }

        let lastClass: ClassRecordType;
        lesson.classRecords.forEach((classLectured: ClassRecordType) => {
            const currentStartedDate = new Date(parseInt(classLectured.startedAt, 10)).getDate();
            if (!lastClass || parseInt(classLectured.startedAt, 10) > parseInt(lastClass.startedAt, 10)) {
                lastClass = classLectured;
            }
        });

        return lastClass;
    }

    public isLastLesson(classRecordItem: LessonRecordList): boolean {
        return this.isGroup
            ? classRecordItem?.id === this.group?.lastLesson?.lesson?.id
            : classRecordItem?.id === this.enrollment?.lastLesson?.lesson?.id &&
                  this.enrollment.sourceType === 'ENROLLMENT' &&
                  this.enrollment?.revertLessonStatus;
    }

    get isMobile(): boolean {
        return this.mediaObserver.isActive('xs');
    }

    public isLessonInProgress(lessonRecordItem: LessonRecordList): boolean {
        if (!this.classInProgress) {
            return false;
        }

        if (this.classInProgress.sourceType === 'ENROLLMENT') {
            return !this.isGroup && this.classInProgress.enrollmentClassRecord?.lesson?.id === lessonRecordItem.id;
        } else {
            return this.isGroup && this.classInProgress.studyGroupClassRecord?.lesson?.id === lessonRecordItem.id;
        }
    }

    goToStudentBook(lessonRecordItem: LessonRecordList) {
        this.openStudentBookEvent.emit(lessonRecordItem);
    }

    goToLesson(lessonRecordItem: LessonRecordList) {
        this.goToLessonEvent.emit(lessonRecordItem);
    }
}
