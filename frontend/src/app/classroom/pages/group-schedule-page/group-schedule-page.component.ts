import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Enrollment, StudyGroup } from 'app/@core/models/enrollment.model';
import { ClassRecord, ClassRecordType, LessonRecordList } from 'app/@core/models/class-record.model';
import { Lesson } from 'app/@core/models/lesson.model';
import {
    ClassroomService,
    IClassroom,
    IRevertFinishedClassStatusInput,
    IRevertLessonStatusInput,
    IStartClassInput,
} from 'app/@core/services/classroom.service';
import {
    ModalConfirmationComponent,
    ModalConfirmationDataOptions,
} from 'app/@shared/components/modal-confirmation/modal-confirmation.component';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import { GroupAttendeesComponent } from 'app/classroom/components/group-attendees/group-attendees.component';
import { EMPTY, Observable, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'app-group-schedule-page',
    templateUrl: './group-schedule-page.component.html',
    styleUrls: ['./group-schedule-page.component.scss'],
})
export class GroupSchedulePageComponent implements OnInit, OnDestroy {
    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: '../schedule', label: 'schedule', icon: 'event_note' },
            { path: '../members', label: 'members', icon: 'group' },
        ],
    };

    group$: Observable<any>;
    classInProgress$ = this.classroomService.classInProgress$;

    getGroupTimeout: any;

    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private classroomService: ClassroomService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.getGroupById();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.getGroupTimeout) {
            clearTimeout(this.getGroupTimeout);
        }
    }

    getGroupById() {
        const groupId = this.route.snapshot.params.groupId;

        this.group$ = this.classroomService.getGroupById(groupId).pipe(
            takeUntil(this.destroy$),
            map((group: any) => {
                return {
                    ...group,
                    revertLessonStatus: group.studyGroupClassRecords
                        .filter((record) => record.lesson.id === group.lastLesson.id)
                        .every((record) => record.revertClassStatus),
                    lessonTrackerList: group.lessons.map((lessonTrack: ClassRecordType) => {
                        return {
                            ...lessonTrack,
                            classRecords:
                                group.studyGroupClassRecords.filter((record) => {
                                    return record.lesson.id === lessonTrack.id;
                                }) || [],
                        };
                    }),
                };
            }),
        );
    }

    onGoToLesson(lesson: LessonRecordList) {
        this.router.navigate(['lms', 'lessons', lesson.id, 'script']);
    }

    onStartClass(group: StudyGroup, lesson: Lesson): void {
        const startClassInput: IStartClassInput = {
            levelId: group.level.id,
            lessonId: lesson.id,
            sourceId: group.id,
            sourceType: 'STUDY_GROUP',
            teacherNotes: '',
        };
        this.classroomService.startClass(startClassInput).subscribe((updatedEnrollment: Enrollment) => {
            if (updatedEnrollment) {
                this.classroomService.classroomRefetch();
                this.router.navigate(['lms', 'lessons', lesson.id, 'class']);
            }
        });
    }

    onResumeClass(lesson: Lesson) {
        this.router.navigate(['lms', 'lessons', lesson.id, 'class']);
    }

    onRevertClass(classRecordItem: any, group: any, isGroup: boolean) {
        const tracks = classRecordItem?.studyGroupLessonRecord;
        const revertTrack = [...tracks].pop();
        const dialogRef = this.dialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    title: 'Revert class',
                    message: 'Are you sure?',
                },
            },
        );

        dialogRef
            .afterClosed()
            .pipe(
                take(1),
                switchMap((confirm: boolean) => {
                    if (!confirm) {
                        return EMPTY;
                    }
                    const sourceType = isGroup ? 'STUDY_GROUP' : 'ENROLLMENT';
                    const revertFinishedClassStatusInput: IRevertFinishedClassStatusInput = {
                        classRecordId: revertTrack.id,
                        sourceId: group.id,
                        sourceType,
                    };

                    return this.classroomService.revertFinishedClassStatus(revertFinishedClassStatusInput);
                }),
            )
            .subscribe({
                next: (classroom: IClassroom) => {
                    if (classroom) {
                        this.classroomService.classroomRefetch();
                    }
                },
            });
    }

    onRevertLesson(classRecordItem: ClassRecordType, group: StudyGroup) {
        const dialogRef = this.dialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    title: 'Revert lesson',
                    message: 'Are you sure?',
                },
            },
        );

        dialogRef
            .afterClosed()
            .pipe(
                take(1),
                switchMap((confirm: boolean) => {
                    if (!confirm) {
                        return EMPTY;
                    }
                    const revertLessonStatusInput: IRevertLessonStatusInput = {
                        lessonId: classRecordItem.id,
                        sourceId: group.id,
                        sourceType: 'STUDY_GROUP',
                    };
                    return this.classroomService.revertLessonStatus(revertLessonStatusInput);
                }),
            )
            .subscribe({
                next: (revertLessonStatus: any) => {
                    if (revertLessonStatus) {
                        this.classroomService.classroomRefetch();

                        // refetch group
                        this.getGroupById();
                        this.getGroupTimeout = setTimeout(() => {
                            this.classroomService.refetchCurrentGroupById();
                        });
                    }
                },
            });
    }

    onOpenAttendees(attendees: any) {
        this.dialog.open(GroupAttendeesComponent, {
            width: '280px',
            panelClass: 'dialog-border-radius',
            data: {
                attendees,
            },
        });
    }
}
