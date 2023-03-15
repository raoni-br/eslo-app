import {
    IRevertFinishedClassStatusInput,
    IClassroom,
    IRevertLessonStatusInput,
} from './../../../@core/services/classroom.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Enrollment } from 'app/@core/models/enrollment.model';
import { Lesson } from 'app/@core/models/lesson.model';
import { ClassroomService, IStartClassInput } from 'app/@core/services/classroom.service';
import { map, switchMap, take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import {
    ModalConfirmationComponent,
    ModalConfirmationDataOptions,
} from 'app/@shared/components/modal-confirmation/modal-confirmation.component';
import { EMPTY, Observable } from 'rxjs';
import { ClassRecordType, LessonRecordList } from 'app/@core/models/class-record.model';

@Component({
    selector: 'app-enrollment-detail-page',
    templateUrl: './enrollment-detail-page.component.html',
    styleUrls: ['./enrollment-detail-page.component.scss'],
})
export class EnrollmentDetailPageComponent implements OnInit {
    enrollment$: Observable<Enrollment>;
    classInProgress$ = this.classroomService.classInProgress$;

    constructor(
        private route: ActivatedRoute,
        private classroomService: ClassroomService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.getEnrollment();
    }

    getEnrollment() {
        this.enrollment$ = this.classroomService.getEnrollment(this.route.snapshot.params.enrollmentId).pipe(
            map((enrollment) => {
                const mappedEnrollment: Enrollment = {
                    ...enrollment,
                    revertLessonStatus: enrollment.classRecords
                        .filter((record) => record.lesson.id === enrollment.lastLesson.id)
                        .every((record) => record.revertClassStatus),
                    lessonTrackerList: enrollment.lessons.map((lesson: any) => {
                        return {
                            ...lesson,
                            classRecords: enrollment.classRecords.filter((record) => {
                                return record.lesson.id === lesson.id;
                            }),
                        };
                    }),
                };

                return mappedEnrollment;
            }),
        );
    }

    onGoToLesson(lesson: LessonRecordList) {
        this.router.navigate(['lms', 'lessons', lesson.id, 'script']);
    }

    onStartClass(enrollment: Enrollment, lesson: Lesson): void {
        const isGroup = enrollment.sourceType === 'STUDY_GROUP';
        const startClassInput: IStartClassInput = {
            levelId: enrollment.level.id,
            lessonId: lesson.id,
            sourceId: isGroup ? enrollment?.studyGroup?.id : enrollment.id,
            sourceType: enrollment.sourceType,
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

    onRevertClass(classRecordItem: any, enrollment: Enrollment, isGroup: boolean) {
        const tracks = classRecordItem?.classRecord;
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
                        sourceId: enrollment.id,
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

    onRevertLesson(classRecordItem: ClassRecordType, enrollment: Enrollment) {
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
                        sourceId: enrollment.id,
                        sourceType: 'ENROLLMENT',
                    };
                    return this.classroomService.revertLessonStatus(revertLessonStatusInput);
                }),
            )
            .subscribe({
                next: (revertLessonStatus: any) => {
                    if (revertLessonStatus) {
                        this.classroomService.classroomRefetch();

                        // update enrollment
                        this.getEnrollment();
                        setTimeout(() => {
                            this.classroomService.refetchEnrollment();
                        });
                    }
                },
            });
    }
}
