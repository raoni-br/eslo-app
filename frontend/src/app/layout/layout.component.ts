import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
    ClassRecord,
    ClassSession,
    EnrollmentClassRecord,
    StudyGroupClassRecord,
} from 'app/@core/models/class-record.model';
import { ClassroomService, IClassroom, IFinishClassInput } from 'app/@core/services/classroom.service';
import { SubscriptionService } from 'app/@core/services/subscription.service';
import { UserService } from 'app/@core/services/user.service';
import { LessonFinishedDialogComponent } from 'app/lms/components/lesson-finished-dialog/lesson-finished-dialog.component';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { LayoutService } from './services/layout.service';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
    @Input() showNavigationBar = true;

    classInProgress$: Observable<ClassRecord>;

    classInProgressPosition: any;

    subscriptions$ = this.userService.loggedUser.pipe(
        switchMap((user) => {
            if (user?.roles?.includes('student')) {
                return of(false);
            }

            return this.subscriptionService.getUserSubscriptions();
        }),
    );

    hasAdminRole = this.userService.hasRole('admin');
    hasTeacherRole = this.userService.hasRole('teacher');
    hasStudentRole = this.userService.hasRole('student');

    links = [
        {
            label: 'Panel',
            path: 'dashboard',
            icon: 'dashboard',
            teacher: true,
            student: true,
            admin: true,
            position: 'left',
        },

        {
            label: 'Enrolled',
            path: 'enrolled',
            icon: 'badge',
            student: true,
            admin: true,
            position: this.hasAdminRole ? 'menu' : 'right',
        },

        {
            label: 'Courses',
            path: 'lms',
            icon: 'school',
            teacher: true,
            admin: true,
            position: 'left',
        },
        {
            label: 'Classes',
            path: 'classroom',
            icon: 'group',
            teacher: true,
            admin: true,
            position: 'right',
        },
        {
            label: 'Calendar',
            path: 'calendar',
            icon: 'calendar_today',
            teacher: true,
            admin: true,
            position: 'right',
        },
        {
            label: 'Payment',
            path: 'payment',
            icon: 'payment',
            teacher: true,
            admin: true,
            position: 'menu',
        },
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private mediaObserver: MediaObserver,
        private dialog: MatDialog,
        private location: Location,
        private classroomService: ClassroomService,
        private layoutService: LayoutService,
        private router: Router,
        private userService: UserService,
        private subscriptionService: SubscriptionService,
    ) {}

    ngOnInit() {
        this.classroomService.getClassroom$().pipe(take(1)).subscribe();

        this.listenClassInProgress();

        const classInProgressPosition = localStorage.getItem('classInProgressPosition');
        this.classInProgressPosition = classInProgressPosition ? JSON.parse(classInProgressPosition) : '';
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    listenClassInProgress() {
        this.classInProgress$ = this.classroomService.getClassroom$().pipe(
            takeUntil(this.destroy$),
            map((classroom: IClassroom) => {
                const classInProgress = classroom.classInProgress;
                if (!classInProgress) {
                    return null;
                } else {
                    if ('enrollmentId' in classInProgress) {
                        return {
                            sourceType: 'ENROLLMENT',
                            enrollmentClassRecord: classInProgress as EnrollmentClassRecord,
                            studyGroupClassRecord: null,
                        };
                    } else {
                        return {
                            sourceType: 'STUDY_GROUP',
                            enrollmentClassRecord: null,
                            studyGroupClassRecord: classInProgress as StudyGroupClassRecord,
                        };
                    }
                }
            }),
        );
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }

    onDoneLesson(classInProgress: ClassRecord) {
        const dialogRef = this.dialog.open(LessonFinishedDialogComponent, {
            panelClass: 'dialog-border-radius',
            data: {
                classInProgress,
            },
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe({
                next: (response: { confirm: boolean; session: ClassSession }) => {
                    if (!response) {
                        return;
                    }
                    const { confirm, session } = response;
                    if (!confirm) {
                        return;
                    }
                    this.markAsDone(session, classInProgress);
                },
            });
    }

    markAsDone(session: ClassSession, classInProgress: ClassRecord): void {
        const status = session.lessonFinished ? 'LESSON_DONE' : 'SESSION_DONE';
        const { eventStart, eventEnd, attendees } = session;

        const sourceType = classInProgress.sourceType;
        let sourceId: string;
        let classRecordId: string;
        if (sourceType === 'ENROLLMENT') {
            classRecordId = classInProgress.enrollmentClassRecord.id;
            sourceId = classInProgress.enrollmentClassRecord.enrollmentId;
        } else {
            classRecordId = classInProgress.studyGroupClassRecord.id;
            sourceId = classInProgress.studyGroupClassRecord.studyGroupId;
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

        this.classroomService.finishClass(finishClassInput).subscribe({
            next: (classroom) => {
                this.classroomService.classroomRefetch();

                this.classroomService.refetchEnrollment();

                if (sourceType === 'ENROLLMENT') {
                    this.router.navigate(['classroom', 'enrollments', sourceId]);
                } else if (sourceType === 'STUDY_GROUP') {
                    this.router.navigate(['classroom', 'groups', sourceId, 'schedule']);
                    this.classroomService.refetchCurrentGroupById(sourceId);
                }
            },
        });
    }

    navigateBack(): void {
        this.location.back();
    }

    onScroll(evt) {
        this.layoutService.onScroll(evt);
    }
}
