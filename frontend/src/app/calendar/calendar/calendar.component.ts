import { IMyCalendar } from '../../@core/services/calendar.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { startOfDay, isSameDay, isSameMonth } from 'date-fns';
import { CalendarEventAction, CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { CalendarService } from 'app/@core/services/calendar.service';
import { EventOccurrence } from 'app/@core/models/event-occurrence.model';

import { EditEventInstanceComponent } from '../edit-event-instance/edit-event-instance.component';

import { CalendarDateFormatter } from 'angular-calendar';
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { EditEventDialogComponent } from '../components/edit-event-dialog/edit-event-dialog.component';
import { WeeklyAvailabilityComponent } from 'app/@shared/components/calendar/weekly-availability/weekly-availability.component';
import { ApolloQueryResult } from '@apollo/client/core';
import { map, take } from 'rxjs/operators';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: CalendarDateFormatter,
            useClass: CustomDateFormatter,
        },
    ],
})
export class CalendarComponent implements OnInit {
    actions: CalendarEventAction[];
    activeDayIsOpen: boolean;
    events: CalendarEvent[];
    refresh: Subject<any> = new Subject();
    selectedDay: any;
    view: 'month' | 'week' | 'day';
    viewDate: Date;

    myCalendarQuery$: any;

    constructor(private calendarService: CalendarService, private dialog: MatDialog) {
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
                        cssClass: !isActive ? 'notActive' : '',
                        meta: {
                            ...event,
                        },
                        // color: !isActive ? { primary: '#969696' } : {},
                    };
                });
            });
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

    openAvailabilityDialog(): void {
        this.dialog.open(WeeklyAvailabilityComponent, {
            // minWidth: '400px',
            // height: 'auto',
            panelClass: 'weekly-availability-dialog',
        });
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
            // panelClass: 'edit-event-dialog',
            panelClass: 'dialog-border-radius',
            data: { event },
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

    // saveEvent(event: CalendarEvent)
    deleteEvent(event: CalendarEvent): void {}
}
