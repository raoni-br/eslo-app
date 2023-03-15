import { WeeklyAvailabilityComponent } from './../../../@shared/components/calendar/weekly-availability/weekly-availability.component';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import { EventOccurrence, IEventOccurrenceInput } from 'app/@core/models/event-occurrence.model';
import { CalendarService } from 'app/@core/services/calendar.service';
import {
    ModalConfirmationComponent,
    ModalConfirmationDataOptions,
} from 'app/@shared/components/modal-confirmation/modal-confirmation.component';
import { EMPTY } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

@Component({
    selector: 'app-edit-event',
    templateUrl: './edit-event.component.html',
    styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements OnInit, OnChanges {
    eventStart: string;
    eventEnd: string;

    lessonFinished = false;

    hasDateConflict = false;

    selectedDate: any;

    @Input() event!: CalendarEvent;
    @Input() events!: CalendarEvent[];

    @Input() today!: Date;
    selectedMonth: Date;

    @Output() closeEvent = new EventEmitter<any>();

    @ViewChild(MatCalendar, { static: false }) calendar: MatCalendar<Date>;

    timePickerTheme: NgxMaterialTimepickerTheme = {
        container: {
            buttonColor: '#71B8CA',
            primaryFontFamily: 'Comfortaa',
        },
        dial: {
            dialBackgroundColor: '#EEFFFF',
            dialActiveColor: '#71B8CA',
            dialInactiveColor: 'black',
            dialEditableActiveColor: 'blue',
            dialEditableBackgroundColor: 'purple',
        },
        clockFace: {
            clockFaceBackgroundColor: 'rgba(113, 184, 202, 0.24)',
            clockHandColor: '#71B8CA',
            clockFaceTimeInactiveColor: '#EEFFFF',
        },
    };

    isStartBiggerThanEnd = false;

    constructor(
        private datePipe: DatePipe,
        private calendarService: CalendarService,
        private dialog: MatDialog,
        private dateAdapter: DateAdapter<any>,
    ) {}

    ngOnInit() {
        const { start, end } = this.event;
        this.eventStart = this.datePipe.transform(start, 'HH:mm');
        this.eventEnd = this.datePipe.transform(end, 'HH:mm');

        this.selectedDate = start;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const { today: todayChanges } = changes;

        if (todayChanges?.currentValue) {
            // this.selectedDate = todayChanges.currentValue;
            this.calendar.activeDate = this.dateAdapter.today();
        }
    }

    onSelect(event) {
        this.selectedDate = event;
        this.hasDateConflict = false;
    }

    updateTimeStart(value: string): void {
        this.eventStart = value;
        this.hasDateConflict = false;
    }

    updateTimeEnd(value: string): void {
        this.eventEnd = value;
        this.hasDateConflict = false;
    }

    checkTimes() {
        this.isStartBiggerThanEnd = this.eventStart > this.eventEnd;
    }

    onConfirm() {
        const {
            meta: {
                sourceId,
                sourceType,
                availabilityType,
                description,
                id,
                recurringEventId,
                sendNotifications,
                startDateTime: originalStartDateTimeUnparsed,
                startTimeZone: originalStartTimeZone,
                title,
                visibility,
            },
        } = this.event;

        const originalStartDateTime = new Date(+originalStartDateTimeUnparsed).toISOString();

        const selectedDate = this.selectedDate instanceof Date ? this.selectedDate : this.selectedDate.toDate();

        this.eventStart = this.eventStart.replace(' AM', '');
        this.eventStart = this.eventStart.replace(' PM', '');

        const [startHour, startMinute] = this.eventStart.split(':');
        const newStartDate = new Date(selectedDate);
        newStartDate.setHours(+startHour, +startMinute);
        const startDateTime = newStartDate.toISOString();

        this.eventEnd = this.eventEnd.replace(' AM', '');
        this.eventEnd = this.eventEnd.replace(' PM', '');
        const [endHour, endMinute] = this.eventEnd.split(':');
        const newEndDate = new Date(selectedDate);
        newEndDate.setHours(+endHour, +endMinute);
        const endDateTime = newEndDate.toISOString();

        let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!browserTimeZone) {
            // default to SP if not found
            browserTimeZone = 'America/Sao_Paulo';
        }

        this.hasDateConflict = this.events.some((event) => event.start >= newStartDate && event.end <= newEndDate);

        if (this.hasDateConflict) {
            return;
        }

        const changeSpecificEventInput: IEventOccurrenceInput = {
            status: 'CONFIRMED',
            id,
            recurringEventId,
            originalStartDateTime,
            originalStartTimeZone,
            sourceType,
            sourceId,
            title,
            description,
            availabilityType,
            visibility,
            sendNotifications,
            startDateTime,
            startTimeZone: browserTimeZone,
            endDateTime,
            endTimeZone: browserTimeZone,
        };

        const dialogRef = this.dialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    title: 'Update event',
                    message: 'Are you sure you want to change this event?',
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

                    return this.calendarService.changeSpecificEvent(changeSpecificEventInput);
                }),
            )
            .subscribe({
                next: (changeSpecificEvent: EventOccurrence) => {
                    this.closeEvent.emit();
                },
            });
    }

    openAvailabilityDialog(): void {
        this.dialog.open(WeeklyAvailabilityComponent, {
            // minWidth: '400px',
            // height: 'auto',
            panelClass: 'weekly-availability-dialog',
        });
    }

    onDelete() {}
}
