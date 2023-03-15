import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { map, take } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { InvitationFormComponent } from '../../components/invitation-form/invitation-form.component';
import { ClassroomService } from 'app/@core/services/classroom.service';
import { Event } from 'app/@core/models/event.model';
import { CreateEnrollmentInput } from 'app/@core/models/enrollment-invitation.model';
import { Enrollment } from 'app/@core/models/enrollment.model';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import {
    InvitationDialogComponent,
    ITab,
} from 'app/classroom/components/invitation-dialog/invitation-dialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-class-list',
    templateUrl: './class-list.component.html',
    styleUrls: ['./class-list.component.scss'],
})
export class ClassListComponent implements OnDestroy {
    dialogRef: MatDialogRef<InvitationFormComponent>;

    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: '../students', label: 'students', icon: 'person' },
            { path: '../groups', label: 'groups', icon: 'groups' },
        ],
    };

    students$ = this.classroomService.getClassroom$().pipe(map(({ students }) => students));

    filterOptions = [
        { label: 'Active', value: true },
        { label: 'Archived', value: false },
    ];

    filterActiveOnly = this.classroomService.classroomFiltersInput.activeEnrollmentsOnly;

    private _unsubscribeAll: Subject<any>;

    constructor(private matDialog: MatDialog, private classroomService: ClassroomService, private router: Router) {
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onFilterSelectChange(activeEnrollmentsOnly: boolean) {
        this.classroomService.setClassroomFiltersInput({
            activeEnrollmentsOnly,
        });
        this.classroomService.classroomRefetch();
    }

    /**
     * New invitation
     */
    createInvitation(): void {
        this.router.navigate(['classroom/create/student']);

        return;

        const dialogRef = this.matDialog.open(InvitationDialogComponent, {
            panelClass: 'invitation-dialog--material',
            autoFocus: false,
            disableClose: true,
            data: {
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
}
