import { MediaObserver } from '@angular/flex-layout';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApolloQueryResult } from '@apollo/client/core';
import { CalendarEvent, CalendarEventAction, CalendarMonthViewDay, CalendarWeekViewComponent } from 'angular-calendar';
import { EventOccurrence } from 'app/@core/models/event-occurrence.model';
import { CalendarService, IMyCalendar } from 'app/@core/services/calendar.service';
import { WeeklyAvailabilityComponent } from 'app/@shared/components/calendar/weekly-availability/weekly-availability.component';
import { EditEventInstanceComponent } from 'app/calendar/edit-event-instance/edit-event-instance.component';
import { CheckOldEventPipe } from 'app/calendar/pipes/check-old-event.pipe';
import { isSameDay, isSameMonth, startOfDay } from 'date-fns';
import { Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { EditEventDialogComponent } from '../edit-event-dialog/edit-event-dialog.component';

@Component({
    selector: 'app-calendar-view',
    templateUrl: './calendar-view.component.html',
    styleUrls: ['./calendar-view.component.scss'],
})
export class CalendarViewComponent implements OnInit {
    actions: CalendarEventAction[];
    activeDayIsOpen: boolean;
    events: CalendarEvent[];
    refresh: Subject<any> = new Subject();
    selectedDay: any;
    view: 'month' | 'week' | 'day';
    viewDate: Date;

    mouseHoverEvent = null;

    myCalendarQuery$: any;

    @ViewChild('calendar', { static: true }) calendar: CalendarWeekViewComponent;

    constructor(
        private calendarService: CalendarService,
        private dialog: MatDialog,
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef,
        private checkOldEventPipe: CheckOldEventPipe,
        private mediaObserver: MediaObserver,
    ) {
        // Set the defaults
        this.view = 'week';
        this.viewDate = new Date();
        this.activeDayIsOpen = true;
        this.selectedDay = { date: startOfDay(new Date()) };

        this.actions = [];
    }

    ngOnInit(): void {
        const fromDate = new Date();
        fromDate.setFullYear(fromDate.getFullYear() - 1);

        const toDate = new Date();
        toDate.setFullYear(toDate.getFullYear() + 1);

        this.myCalendarQuery$ = this.calendarService.getMyCalendar(fromDate, toDate);

        this.myCalendarQuery$.valueChanges
            .pipe(map((result: ApolloQueryResult<IMyCalendar>) => result.data.myCalendar))
            .subscribe((events: EventOccurrence[]) => {
                this.events = events.map((event: EventOccurrence) => {
                    const startDate = new Date(parseInt(event.startDateTime, 10));
                    const startDateTxt = Intl.DateTimeFormat('default', {
                        hour: 'numeric',
                        minute: 'numeric',
                    }).format(startDate);

                    const endDate = new Date(parseInt(event.endDateTime, 10));
                    const endDateTxt = Intl.DateTimeFormat('default', {
                        hour: 'numeric',
                        minute: 'numeric',
                    }).format(endDate);

                    const title = `${event.title} (${startDateTxt} - ${endDateTxt})`;
                    const isActive = event.status === 'CONFIRMED';
                    return {
                        id: event.id,
                        title: isActive ? title : `(Pending) - ${title}`,
                        actions: this.actions,
                        start: startDate,
                        end: endDate,
                        allDay: true,
                        cssClass: !isActive ? 'notActive' : '',
                        meta: {
                            ...event,
                        },
                        // color: !isActive ? { primary: '#969696' } : {},
                    };
                });

                this.columnBackground();
            });
    }

    viewDateChange(date: any) {
        this.selectedDay = { date };
        this.columnBackground();
    }

    columnBackground(): void {
        const timeout = setTimeout(() => {
            const viewDate = this.calendar.viewDate.getDate();
            const todayDate = new Date();
            const todayDayNumber = todayDate.getDate();

            if (viewDate !== todayDayNumber) {
                clearTimeout(timeout);
                return;
            }
            const calAllDayEvents = this.document.querySelector('.cal-all-day-events');
            const calDayColumns = calAllDayEvents?.children[0];
            const todayWeekDayNumber = todayDate.getDay();
            const todayCalDayColumn = calDayColumns?.children[todayWeekDayNumber];
            const dayHeader = this.document.getElementById(`day-${todayWeekDayNumber - 1}`);
            dayHeader.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            this.renderer.addClass(todayCalDayColumn, 'bg-primary--50');
            clearTimeout(timeout);
        }, 0);
    }

    /**
     * Before View Renderer
     *
     * @param header
     * @param body
     */
    beforeMonthViewRender({ header, body }): void {
        /**
         * Get the selected day
         */
        const _selectedDay = body.find((_day) => _day.date.getTime() === this.selectedDay.date.getTime());

        if (_selectedDay) {
            /**
             * Set selected day style
             *
             * @type {string}
             */
            _selectedDay.cssClass = 'cal-selected';
        }
    }

    /**
     * Day clicked
     *
     * @param day
     */
    dayClicked(day: CalendarMonthViewDay): void {
        const date: Date = day.date;
        const events: CalendarEvent[] = day.events;

        if (isSameMonth(date, this.viewDate)) {
            if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
        this.selectedDay = day;
        this.refresh.next();
    }

    /**
     * Edit Event
     *
     * @param action
     * @param event
     */
    editEvent(event: CalendarEvent): void {
        const dialogRef2: MatDialogRef<EditEventDialogComponent> = this.dialog.open(EditEventDialogComponent, {
            width: '360px',
            panelClass: 'dialog-border-radius',
            disableClose: true,
            data: { event, events: this.events },
        });

        dialogRef2
            .afterClosed()
            .pipe(take(1))
            .subscribe({
                next: (refresh) => {
                    if (refresh && this.myCalendarQuery$) {
                        this.myCalendarQuery$.refetch();
                    }
                },
            });

        return;
        if (event.actions.length === 0) {
            return;
        }

        const eventIndex = this.events.indexOf(event);
        const dialogRef: MatDialogRef<EditEventInstanceComponent> = this.dialog.open(EditEventInstanceComponent, {
            panelClass: 'event-form-dialog',
            data: { event: event },
        });

        dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }

            const actionType: string = response[0];
            const formData: FormGroup = response[1];
            switch (actionType) {
                /**
                 * Save
                 */
                case 'save':
                    // this.events[eventIndex] = Object.assign(this.events[eventIndex], formData.getRawValue());
                    this.refresh.next(true);

                    break;
                /**
                 * Delete
                 */
                case 'delete':
                    this.deleteEvent(event);
                    break;
            }
        });
    }

    onEventClicked(eventClicked, weekEvent) {
        const isOldEvent = this.checkOldEventPipe.transform(weekEvent.event);

        if (isOldEvent) {
            return;
        }

        eventClicked.emit({ event: weekEvent.event });
    }

    // saveEvent(event: CalendarEvent)
    deleteEvent(event: CalendarEvent): void {}

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
