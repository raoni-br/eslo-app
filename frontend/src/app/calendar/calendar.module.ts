import { AvailabilityPageComponent } from './pages/availability-page/availability-page.component';
import { MatDividerModule } from '@angular/material/divider';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SharedModule } from 'app/@shared/shared.module';

import { CalendarComponent } from './calendar/calendar.component';
import { EditEventInstanceComponent } from './edit-event-instance/edit-event-instance.component';
import { CalendarMobileComponent } from './calendar-mobile/calendar-mobile.component';
import { FormatEventTitlePipe } from './pipes/format-event-title.pipe';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { MonthPageComponent } from './pages/month-page/month-page.component';
import { FormatEventTimePipe } from './pipes/format-event-time.pipe';
import { EditEventComponent } from './components/edit-event/edit-event.component';
import { EditEventDialogComponent } from './components/edit-event-dialog/edit-event-dialog.component';
import { EditEventBottomSheetComponent } from './components/edit-event-bottom-sheet/edit-event-bottom-sheet.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { CalendarViewComponent } from './components/calendar-view/calendar-view.component';
import { CheckHoverEventPipe } from './pipes/check-hover-event.pipe';
import { CheckOldEventPipe } from './pipes/check-old-event.pipe';

const routes = [
    {
        path: '',
        component: CalendarPageComponent,
        children: [
            {
                path: 'month',
                component: MonthPageComponent,
            },
            {
                path: 'availability',
                component: AvailabilityPageComponent,
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];

@NgModule({
    declarations: [
        CalendarComponent,
        EditEventInstanceComponent,
        CalendarMobileComponent,
        CalendarPageComponent,
        MonthPageComponent,
        AvailabilityPageComponent,
        EditEventComponent,
        EditEventDialogComponent,
        EditEventBottomSheetComponent,
        // Pipes
        FormatEventTitlePipe,
        FormatEventTimePipe,
        CalendarViewComponent,
        CheckHoverEventPipe,
        CheckOldEventPipe,
    ],
    imports: [
        RouterModule.forChild(routes),

        MatDatepickerModule,
        MatDialogModule,
        MatBottomSheetModule,
        MatTooltipModule,
        MatToolbarModule,
        MatDividerModule,

        NgxMaterialTimepickerModule,

        AngularCalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory,
        }),

        SharedModule,
    ],
    exports: [],
    providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        CheckOldEventPipe,
    ],
})
export class CalendarModule {}
