import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from 'app/@core/models/event.model';
import { ClassroomService } from 'app/@core/services/classroom.service';
import { ENROLLMENT_STATUS, StudyGroup } from 'app/@core/models/enrollment.model';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
    InvitationDialogComponent,
    ITab,
} from 'app/classroom/components/invitation-dialog/invitation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export interface CreateStudyGroupInput {
    name: string;
    levelId: string;
    events: Event[];
}
@Component({
    selector: 'app-groups-page',
    templateUrl: './groups-page.component.html',
    styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnInit {
    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: '../students', label: 'students', icon: 'person' },
            { path: '../groups', label: 'groups', icon: 'groups' } /* TODO: find the right icon 'groups' */,
        ],
    };
    groups$: Observable<any[]>;

    filterOptions = [
        { label: ENROLLMENT_STATUS.ACTIVE, value: ENROLLMENT_STATUS.ACTIVE },
        { label: ENROLLMENT_STATUS.DELETED, value: ENROLLMENT_STATUS.DELETED },
    ];

    studyGroupStatus = this.classroomService.classroomFiltersInput.studyGroupStatus;

    constructor(
        private matDialog: MatDialog,
        private classroomService: ClassroomService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.getGroups();
    }

    onFilterSelectChange(status: string) {
        this.classroomService.setClassroomFiltersInput({
            studyGroupStatus: status,
        });
        this.classroomService.getGroupsQuery().refetch();
    }

    getGroups() {
        this.groups$ = this.classroomService
            .getGroupsQuery()
            .valueChanges.pipe(map((result: any) => result.data.classroom.studyGroups));
    }

    onAddGroup() {
        this.router.navigate(['classroom/create/group']);
        return;
        const dialogRef = this.matDialog.open(InvitationDialogComponent, {
            panelClass: 'invitation-dialog--material',
            autoFocus: false,
            disableClose: true,
            data: {
                type: 'group',
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
                next: (response) => {
                    if (!response) {
                        return;
                    }

                    const { groupForm, courseForm, eventsForm } = response;

                    let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (!browserTimeZone) {
                        // default to SP if not found
                        browserTimeZone = 'America/Sao_Paulo';
                    }

                    const newGroup: CreateStudyGroupInput = {
                        name: groupForm.name,
                        levelId: courseForm.level.id,
                        events: eventsForm.events.map((event: Event) => ({
                            title: groupForm.name,
                            description: courseForm.level.name,
                            sourceType: 'STUDY_GROUP',
                            availabilityType: 'BUSY',
                            recurrence: event.recurrence,
                            startDateTime: new Date(parseInt(event.startDateTime, 10)).toISOString(),
                            startTimeZone: browserTimeZone,
                            endDateTime: new Date(parseInt(event.endDateTime, 10)).toISOString(),
                            endTimeZone: browserTimeZone,
                        })),
                    };

                    this.classroomService.createStudyGroup(newGroup).subscribe((addedGroup: any) => {
                        this.classroomService.getGroupsQuery().refetch();
                    });
                },
            });
    }

    onGroupDetail(groupId: string) {
        this.router.navigate([groupId, 'schedule'], { relativeTo: this.route });
    }

    onGroupEdit(groupId: string) {
        this.router.navigate(['/classroom', 'edit', 'group', groupId]);
        return;
        this.classroomService
            .getGroupById(groupId)
            .pipe(take(1))
            .subscribe({
                next: (group) => {
                    const dialogRef = this.matDialog.open(InvitationDialogComponent, {
                        panelClass: 'invitation-dialog--material--editing',
                        autoFocus: false,
                        disableClose: true,
                        data: {
                            group,
                            type: 'group',
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
                            next: (group: StudyGroup) => {
                                if (!group) {
                                    return;
                                }
                                this.classroomService.classroomRefetch();
                            },
                        });
                },
            });
    }
}
