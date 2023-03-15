import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { IConfig, NgxMaskModule } from 'ngx-mask';

import { AudioControlCardComponent } from './components/audio-control-card/audio-control-card.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { ScheduleInputComponent } from './components/calendar/schedule-input/schedule-input.component';
import { WeeklyAvailabilityComponent } from './components/calendar/weekly-availability/weekly-availability.component';
import { ClassRecordListComponent } from './components/class-record-list/class-record-list.component';
import { ClassRecordTimerComponent } from './components/class-record-timer/class-record-timer.component';
import { CustomStepperComponent } from './components/custom-stepper/custom-stepper.component';
import { DisplayCardComponent } from './components/display-card/display-card.component';
import { EnrollmentCardComponent } from './components/enrollment-card/enrollment-card.component';
import { EsloLetterLogoComponent } from './components/eslo-letter-logo/eslo-letter-logo.component';
import { EsloLogoComponent } from './components/eslo-logo/eslo-logo.component';
import { EsloOrbComponent } from './components/eslo-orb/eslo-orb.component';
import { AddressInputComponent } from './components/forms/address-input/address-input.component';
import { ModalConfirmationComponent } from './components/modal-confirmation/modal-confirmation.component';
import { NavigationTabsComponent } from './components/navigation-tabs/navigation-tabs.component';
import { PillTabComponent } from './components/pill-tabs/pill-tab/pill-tab.component';
import { PillTabsComponent } from './components/pill-tabs/pill-tabs.component';
import { PlanCardComponent } from './components/plan-card/plan-card.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { TopBarTitleComponent } from './components/top-bar-title/top-bar-title.component';
import { UserButtonComponent } from './components/user-button/user-button.component';
import { AttachDirective } from './directives/attach.directive';
import { DisableControlDirective } from './directives/disable-control.directive';
import { TargetDirective } from './directives/target.directive';
import { ConvertTimePipe } from './pipes/convert-time.pipe';
import { FormatNextClassDatePipe } from './pipes/format-next-class-date.pipe';
import { ConvertIntervalLabel } from './pipes/interval-to-label.pipe';
import { IsLastClassLessonDonePipe } from './pipes/is-last-class-lesson-done.pipe';
import { MinutesToHoursPipe } from './pipes/minutes-to-hours.pipe';
import { ParseCompletedLessonsPipe } from './pipes/parse-completed-lessons.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { UTCToDatePipe } from './pipes/utc-to-date.pipe';
import { WeeklyAvailabilityDialogComponent } from './components/calendar/weekly-availability-dialog/weekly-availability-dialog.component';

// 3rd party
const maskConfig: Partial<IConfig> = {
    validation: true,
};

@NgModule({
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: Window, useValue: window },
        DatePipe,
    ],
    declarations: [
        // Components
        WeeklyAvailabilityComponent,
        ScheduleInputComponent,
        AddressInputComponent,
        ModalConfirmationComponent,
        EsloLetterLogoComponent,
        TopBarTitleComponent,
        UserButtonComponent,
        NavigationTabsComponent,
        BackButtonComponent,
        PillTabsComponent,
        PillTabComponent,
        AvatarComponent,
        ClassRecordTimerComponent,
        CustomStepperComponent,
        AuthLayoutComponent,
        SvgIconComponent,
        ClassRecordListComponent,
        AudioControlCardComponent,
        EnrollmentCardComponent,
        EsloLogoComponent,
        EsloOrbComponent,
        PlanCardComponent,
        DisplayCardComponent,

        // Directives
        DisableControlDirective,
        TargetDirective,
        AttachDirective,

        // Pipes
        ConvertIntervalLabel,
        ConvertTimePipe,
        MinutesToHoursPipe,
        UTCToDatePipe,
        SafePipe,
        IsLastClassLessonDonePipe,
        FormatNextClassDatePipe,
        ParseCompletedLessonsPipe,
        WeeklyAvailabilityDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        FlexLayoutModule,

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatFormFieldModule,
        MatGridListModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatMenuModule,
        MatChipsModule,
        MatRippleModule,
        MatSelectModule,
        MatSliderModule,
        MatTooltipModule,
        MatCardModule,
        CdkStepperModule,
        DragDropModule,

        // 3rd party impors
        NgxMaskModule.forRoot(maskConfig),
    ],
    // Exports common modules to be shared
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        CdkStepperModule,

        FlexLayoutModule,

        // Components
        WeeklyAvailabilityComponent,
        ScheduleInputComponent,
        AddressInputComponent,
        ModalConfirmationComponent,
        EsloLetterLogoComponent,
        TopBarTitleComponent,
        UserButtonComponent,
        NavigationTabsComponent,
        BackButtonComponent,
        PillTabsComponent,
        PillTabComponent,
        AvatarComponent,
        ClassRecordTimerComponent,
        CustomStepperComponent,
        AuthLayoutComponent,
        SvgIconComponent,
        ClassRecordListComponent,
        AudioControlCardComponent,
        EnrollmentCardComponent,
        EsloLogoComponent,
        EsloOrbComponent,
        PlanCardComponent,
        DisplayCardComponent,

        // Directives
        DisableControlDirective,
        TargetDirective,
        AttachDirective,

        // Pipes,
        ConvertIntervalLabel,
        ConvertTimePipe,
        MinutesToHoursPipe,
        UTCToDatePipe,
        SafePipe,
        IsLastClassLessonDonePipe,

        // Modules
        NgxMaskModule,
    ],
})
export class SharedModule {}
