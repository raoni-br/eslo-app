import { DOCUMENT } from '@angular/common';
import { AfterViewChecked, Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Enrollment, ENROLLMENT_STATUS } from 'app/@core/models/enrollment.model';
import { ClassroomService, Student } from 'app/@core/services/classroom.service';
import {
    ModalConfirmationComponent,
    ModalConfirmationDataOptions,
} from 'app/@shared/components/modal-confirmation/modal-confirmation.component';
import { EMPTY } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { InvitationDialogComponent, ITab } from '../invitation-dialog/invitation-dialog.component';

@Component({
    selector: 'app-student-list',
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.scss'],
})
export class StudentListComponent implements OnInit, AfterViewChecked {
    @Input() students: Student[];

    fragment: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private matDialog: MatDialog,
        private classroomService: ClassroomService,
        @Inject(DOCUMENT) private document: Document,
    ) {}

    ngOnInit() {
        this.fragment = this.route.snapshot.fragment;
    }

    ngAfterViewChecked(): void {
        try {
            if (this.fragment) {
                this.document.querySelector('#' + this.fragment).scrollIntoView();
            }
        } catch (e) {}
    }

    isEnrollmentActive(enrollment: Enrollment): boolean {
        return [ENROLLMENT_STATUS.ACTIVE, ENROLLMENT_STATUS.CONFIRMED].includes(enrollment?.status);
    }

    goToEnrollment(enrollment: Enrollment): void {
        if (this.isEnrollmentActive(enrollment)) {
            this.router.navigate(['/classroom/enrollments', enrollment.id]);
        }
    }

    onEdit(enrollment: Enrollment): void {
        const groupId = enrollment.sourceType === 'STUDY_GROUP' ? enrollment.studyGroup.id : '';
        if (groupId) {
            this.router.navigate(['/classroom', 'edit', 'student', enrollment.id], { queryParams: { groupId } });
            return;
        }
        this.router.navigate(['/classroom', 'edit', 'student', enrollment.id]);
        return;

        const dialogRef = this.matDialog.open(InvitationDialogComponent, {
            panelClass: 'invitation-dialog--material--editing',
            autoFocus: false,
            disableClose: true,
            // maxWidth: '400px',
            data: {
                enrollment,
                type: 'student',
                tabs: [
                    {
                        title: 'info',
                        active: false,
                        completed: false,
                        icon: 'account_circle',
                    },
                    {
                        title: 'course',
                        active: false,
                        completed: false,
                        icon: 'school',
                    },
                    {
                        title: 'schedule',
                        active: false,
                        completed: false,
                        icon: 'date_range',
                    },
                ] as ITab[],
            },
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe({
                next: (enrollment: Enrollment) => {
                    if (!enrollment) {
                        return;
                    }
                    this.classroomService.classroomRefetch();
                },
            });
    }

    onCancel(enrollment: Enrollment): void {
        const dialogRef = this.matDialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    title: 'Cancel invitation',
                    message: 'Are you sure you want to cancel this invitation?',
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

                    return this.classroomService.cancelEnrollment(enrollment.id);
                }),
            )
            .subscribe({
                next: (cancelledEnrollment: Enrollment) => {
                    this.classroomService.classroomRefetch();
                },
            });
    }

    onOpenStudentEnrollments(studentId: string) {
        this.students = this.students.map((student) => {
            let opened = student?.opened ?? false;
            if (studentId === student?.id) {
                opened = !opened;
            }
            return {
                ...student,
                opened,
            };
        });
    }
}
