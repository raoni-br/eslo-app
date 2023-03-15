import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/@shared/shared.module';

import { AddEntityStepperComponent } from './components/add-entity-stepper/add-entity-stepper.component';
import { EmptyListComponent } from './components/empty-list/empty-list.component';
import { FilterActiveInListComponent } from './components/filter-active-in-list/filter-active-in-list.component';
import { FiltersListComponent } from './components/filters-list/filters-list.component';
import { GroupAttendeesComponent } from './components/group-attendees/group-attendees.component';
import { GroupEmptyMembersComponent } from './components/group-empty-members/group-empty-members.component';
import { GroupInfoComponent } from './components/group-info/group-info.component';
import { GroupMembersListComponent } from './components/group-members-list/group-members-list.component';
import { SelectProgramComponent } from './components/select-program/select-program.component';
import { GroupsListComponent } from './components/groups-list/groups-list.component';
import { InvitationDialogComponent } from './components/invitation-dialog/invitation-dialog.component';
import { InvitationEventsComponent } from './components/invitation-events/invitation-events.component';
import { CheckEventsControlsPipe } from './components/invitation-form/check-events-controls.pipe';
import { InvitationFormComponent } from './components/invitation-form/invitation-form.component';
import { ScheduleInputDialogComponent } from './components/schedule-input-dialog/schedule-input-dialog.component';
import { SelectGroupEnrollmentComponent } from './components/select-group-enrollment/select-group-enrollment.component';
import { SelectMembersDialogComponent } from './components/select-members-dialog/select-members-dialog.component';
import { StudentInfoComponent } from './components/student-info/student-info.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { ClassListComponent } from './pages/class-list/class-list.component';
import { CreateInvitationPageComponent } from './pages/create-invitation-page/create-invitation-page.component';
import { EnrollmentDetailPageComponent } from './pages/enrollment-detail-page/enrollment-detail-page.component';
import { GroupMembersPageComponent } from './pages/group-members-page/group-members-page.component';
import { GroupSchedulePageComponent } from './pages/group-schedule-page/group-schedule-page.component';
import { GroupsPageComponent } from './pages/groups-page/groups-page.component';
import { FilterEnrollmentGroupPipe } from './pipes/filter-enrollment-group.pipe';
import { ReviewEntityComponent } from './components/review-entity/review-entity.component';
import { FormatEventsDatePipe } from './pipes/format-events-date.pipe';

const routes = [
    { path: '', pathMatch: 'full', redirectTo: 'students' },
    {
        path: 'students',
        component: ClassListComponent,
    },
    {
        path: 'create/:entity',
        component: CreateInvitationPageComponent,
    },
    {
        path: 'edit/:entity/:id',
        component: CreateInvitationPageComponent,
    },
    {
        path: 'enrollments/:enrollmentId',
        component: EnrollmentDetailPageComponent,
    },
    {
        path: 'groups',
        component: GroupsPageComponent,
    },
    {
        path: 'groups/:groupId/schedule',
        component: GroupSchedulePageComponent,
    },
    {
        path: 'groups/:groupId/members',
        component: GroupMembersPageComponent,
    },
];

@NgModule({
    declarations: [
        ClassListComponent,
        StudentListComponent,
        StudentInfoComponent,
        InvitationFormComponent,
        GroupsPageComponent,
        GroupInfoComponent,
        SelectProgramComponent,
        GroupsListComponent,
        GroupSchedulePageComponent,
        GroupMembersPageComponent,
        GroupEmptyMembersComponent,
        SelectGroupEnrollmentComponent,
        EmptyListComponent,
        EnrollmentDetailPageComponent,
        GroupAttendeesComponent,
        FiltersListComponent,
        GroupMembersListComponent,
        InvitationDialogComponent,
        InvitationEventsComponent,
        ScheduleInputDialogComponent,
        SelectMembersDialogComponent,
        CreateInvitationPageComponent,
        FilterActiveInListComponent,
        AddEntityStepperComponent,
        ReviewEntityComponent,
        FormatEventsDatePipe,

        CheckEventsControlsPipe,
        FilterEnrollmentGroupPipe,
    ],
    imports: [
        RouterModule.forChild(routes),

        MatTableModule,
        MatMenuModule,
        MatToolbarModule,
        MatSelectModule,
        MatExpansionModule,
        MatDialogModule,
        MatCheckboxModule,
        MatBottomSheetModule,
        MatTooltipModule,
        MatListModule,
        MatRadioModule,
        MatProgressBarModule,

        SharedModule,
    ],
    // providers: [
    //     { provide: MatDialogRef, useValue: {} },
    //     { provide: MAT_DIALOG_DATA, useValue: [] },
    // ],
})
export class ClassroomModule {}
