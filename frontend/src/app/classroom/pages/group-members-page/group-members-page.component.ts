import { SelectMembersDialogComponent } from './../../components/select-members-dialog/select-members-dialog.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateEnrollmentInput } from 'app/@core/models/enrollment-invitation.model';
import { Enrollment, ENROLLMENT_STATUS, StudyGroup } from 'app/@core/models/enrollment.model';
import { Event } from 'app/@core/models/event.model';
import { ClassroomService, Student } from 'app/@core/services/classroom.service';
import {
    ModalConfirmationComponent,
    ModalConfirmationDataOptions,
} from 'app/@shared/components/modal-confirmation/modal-confirmation.component';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import {
    InvitationDialogComponent,
    ITab,
} from 'app/classroom/components/invitation-dialog/invitation-dialog.component';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
    selector: 'app-group-members-page',
    templateUrl: './group-members-page.component.html',
    styleUrls: ['./group-members-page.component.scss'],
})
export class GroupMembersPageComponent implements OnInit {
    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: '../schedule', label: 'schedule', icon: 'event_note' },
            { path: '../members', label: 'members', icon: 'group' },
        ],
    };

    group$: Observable<any>;

    constructor(
        private route: ActivatedRoute,
        private matDialog: MatDialog,
        private classroomService: ClassroomService,
        private router: Router,
        private matSnackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.getGroupById();
    }

    getGroupById(): void {
        const groupId = this.route.snapshot.params.groupId;

        this.group$ = this.classroomService.getGroupById(groupId).pipe(
            map((group) => {
                const activeEnrollments = group.enrollments.filter(
                    (enrollment) => enrollment.status === ENROLLMENT_STATUS.ACTIVE,
                );

                return { ...group, enrollments: activeEnrollments };
            }),
        );
    }

    /**
     * add new member using invitation
     */
    addNewMember(group: StudyGroup): void {
        this.router.navigate(['/classroom', 'create', 'student'], {
            queryParams: {
                groupId: group.id,
            },
        });

        return;

        const dialogRef = this.matDialog.open(InvitationDialogComponent, {
            panelClass: 'invitation-dialog--material',
            autoFocus: false,
            disableClose: true,
            data: {
                type: 'student',
                selectedGroup: group,
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

        dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }

            const { studentForm, courseForm, eventsForm } = response;

            let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (!browserTimeZone) {
                // default to SP if not found
                browserTimeZone = 'America/Sao_Paulo';
            }

            const enrollmentInvitation: CreateEnrollmentInput = {
                invitedStudent: {
                    email: studentForm.studentInfo.email,
                    firstName: studentForm.studentInfo.firstName,
                    surname: studentForm.studentInfo.lastName,
                },
                enrollmentInput: {},
            };

            if (studentForm?.selectedGroup) {
                enrollmentInvitation.enrollmentInput.studyGroupId = studentForm?.selectedGroup?.id;
            } else {
                enrollmentInvitation.enrollmentInput.oneOnOne = {
                    levelId: courseForm.level.id,
                    events: eventsForm.events.map((event: Event) => ({
                        title: `${studentForm.studentInfo.firstName} ${
                            studentForm.studentInfo.lastName ? studentForm.studentInfo.lastName : ''
                        } (1 on 1)`,
                        description: courseForm.level.name,
                        sourceType: 'ENROLLMENT',
                        availabilityType: 'BUSY',
                        status: 'TENTATIVE',
                        recurrence: event.recurrence,
                        startDateTime: new Date(parseInt(event.startDateTime, 10)).toISOString(),
                        startTimeZone: browserTimeZone,
                        endDateTime: new Date(parseInt(event.endDateTime, 10)).toISOString(),
                        endTimeZone: browserTimeZone,
                    })),
                };
            }

            this.classroomService
                .createEnrollmentInvitation(enrollmentInvitation)
                .pipe(take(1))
                .subscribe((newEnrollment: Enrollment) => {
                    if (newEnrollment) {
                        this.classroomService.classroomRefetch();
                    }
                });
        });
    }

    addExistingMembers(group: StudyGroup) {
        let toastRef: MatSnackBarRef<any>;

        this.classroomService
            .getClassroom$()
            .pipe(
                take(1),
                map(({ students }) => {
                    const enrollments = students.reduce((acc, currStudent) => {
                        const enrollments = currStudent.enrollments
                            .filter((enrollment) => {
                                const validEnrollment =
                                    enrollment?.studyGroup?.id !== group.id &&
                                    enrollment.level.code === group.level.code &&
                                    enrollment.status === ENROLLMENT_STATUS.ACTIVE;
                                return validEnrollment;
                            })
                            .map((enrollment) => ({ ...enrollment, selected: false }));

                        return [...acc, ...enrollments];
                    }, []);

                    return enrollments;
                }),
                switchMap((enrollments) => {
                    const dialogRef = this.matDialog.open(SelectMembersDialogComponent, {
                        autoFocus: false,
                        disableClose: true,
                        panelClass: 'dialog-border-radius--padding',
                        data: {
                            enrollments,
                        },
                    });

                    return dialogRef.afterClosed();
                }),
                switchMap((selectedEnrollments: Enrollment[]) => {
                    if (!selectedEnrollments || selectedEnrollments.length === 0) {
                        return EMPTY;
                    }

                    const requests = selectedEnrollments.map(({ id }) =>
                        this.classroomService.addStudentToGroup({ id, studyGroupId: group.id }),
                    );

                    toastRef = this.matSnackBar.open('Adding members...', '', {
                        duration: 0,
                        panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                    });

                    return forkJoin(requests);
                }),
            )
            .subscribe({
                next: (response) => {
                    this.matSnackBar.open('All students added successfully', 'Ok', {
                        duration: 0,
                        panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                    });
                },
                error: (err) => {
                    this.matSnackBar.open('Error while adding members', 'Ok', {
                        duration: 0,
                        panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                    });
                },
                complete: () => {
                    if (toastRef) {
                        toastRef.dismiss();
                    }
                },
            });
    }

    onRemoveGroup(studyGroupId: string): void {
        const dialogRef = this.matDialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    title: 'Remove group',
                    message: 'Are you sure you want to remove this group?',
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

                    return this.classroomService.removeStudyGroup({ studyGroupId });
                }),
            )
            .subscribe({
                next: (group: any) => {
                    this.classroomService.getGroupsQuery().refetch();
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
            });
    }

    onEnrollmentDetail(enrollmentId: string): void {
        this.router.navigate(['classroom', 'enrollments', enrollmentId]);
    }

    onEnrollmentEdit(enrollmentId: string): void {}
}
