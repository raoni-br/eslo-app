import { IFinishClassInput } from './../../../@core/services/classroom.service';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { Lesson } from 'app/@core/models/lesson.model';
import { LMSService } from 'app/@core/services/lms.service';

import { ClassroomService } from 'app/@core/services/classroom.service';
import { MatDialog } from '@angular/material/dialog';
import { LessonFinishedDialogComponent } from 'app/lms/components/lesson-finished-dialog/lesson-finished-dialog.component';
import { Location } from '@angular/common';
import { ClassRecord } from 'app/@core/models/class-record.model';

@Component({
    selector: 'app-lesson-detail',
    templateUrl: './lesson-detail.component.html',
    styleUrls: ['./lesson-detail.component.scss'],
})
export class LessonDetailComponent implements OnDestroy {
    // Private
    private _unsubscribeAll: Subject<any>;

    public selectedTab: number;
    public lesson: Lesson;

    public classInProgress: ClassRecord;

    constructor(
        private location: Location,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private lmsService: LMSService,
        private dialog: MatDialog,

        private classroomService: ClassroomService,
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.selectedTab = 0;

        this.activatedRoute.params.pipe(takeUntil(this._unsubscribeAll)).subscribe((params) => {
            this.loadLesson(params['lessonId']);

            this.classroomService.classInProgress$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((classInProgress) => {
                    this.classInProgress = classInProgress;
                });
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private loadLesson(lessonId: string): void {
        this.lmsService
            .getLesson(lessonId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lesson: Lesson) => {
                this.lesson = lesson;
            });
    }

    goToPreviousTab(): void {
        this.selectedTab = this.selectedTab - 1;
    }

    goToNextTab(): void {
        this.selectedTab = this.selectedTab + 1;
    }

    leaveLesson(): void {
        if (this.classInProgress) {
            if (this.classInProgress.sourceType === 'ENROLLMENT') {
                this.router.navigate([
                    'classroom',
                    'enrollments',
                    this.classInProgress.enrollmentClassRecord.enrollmentId,
                ]);
            } else {
                this.router.navigate([
                    'classroom',
                    'groups',
                    this.classInProgress.studyGroupClassRecord.studyGroupId,
                    'schedule',
                ]);
            }
        } else {
            this.router.navigate(['/lms']);
        }
    }

    onDoneLesson() {
        const dialogRef = this.dialog.open(LessonFinishedDialogComponent, {
            data: {
                lesson: this.lesson,
                classInProgress: this.classInProgress,
            },
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe({
                next: (response) => {
                    if (!response) {
                        return;
                    }
                    const { confirm, session } = response;
                    if (!confirm) {
                        return;
                    }
                    this.markAsDone(session);
                },
            });
    }

    markAsDone(session: any): void {
        const status = session.lessonFinished ? 'LESSON_DONE' : 'SESSION_DONE';

        const { eventStart, eventEnd, attendees } = session;
        const sourceType = this.classInProgress.sourceType;
        let sourceId: string;
        let classRecordId: string;
        if (sourceType === 'ENROLLMENT') {
            classRecordId = this.classInProgress.enrollmentClassRecord.id;
            sourceId = this.classInProgress.enrollmentClassRecord.enrollmentId;
        } else {
            classRecordId = this.classInProgress.studyGroupClassRecord.id;
            sourceId = this.classInProgress.studyGroupClassRecord.studyGroupId;
        }

        const [startHour, startMinutes] = eventStart.split(':');
        let lessonStartedAt: Date | string = new Date();
        lessonStartedAt.setHours(+startHour, +startMinutes);
        lessonStartedAt = lessonStartedAt.toISOString();

        const [endHour, endMinutes] = eventEnd.split(':');
        let lessonEndedAt: Date | string = new Date();
        lessonEndedAt.setHours(+endHour, +endMinutes);
        lessonEndedAt = lessonEndedAt.toISOString();

        const finishClassInput: IFinishClassInput = {
            classRecordId,
            sourceId,
            sourceType,
            status,
            lessonStartedAt,
            lessonEndedAt,
            attendees: attendees.length ? attendees : undefined,
        };

        this.classroomService
            .finishClass(finishClassInput)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.classInProgress = undefined;
                this.navigateBack();
            });
    }

    navigateBack(): void {
        this.location.back();
    }
}
