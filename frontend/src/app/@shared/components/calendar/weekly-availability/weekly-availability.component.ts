import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Event } from 'app/@core/models/event.model';
import { CalendarService } from 'app/@core/services/calendar.service';
import RRule, { Weekday } from 'rrule';

@Component({
    selector: 'app-weekly-availability',
    templateUrl: './weekly-availability.component.html',
    styleUrls: ['./weekly-availability.component.scss'],
})
export class WeeklyAvailabilityComponent implements OnInit, OnChanges {
    @Input() eventsToAdd: any[] = [];

    @Input() startHourAvailability = 7; // 07:00
    @Input() endHourAvailability = 22; // 22:00

    daysWithHours: any[];

    events: Event[];

    weekDays: Weekday[];
    weekDaysLabels: string[];

    screenHeight: number;

    labelDay: { icon: string; hours?: any[] } = {
        icon: 'schedule',
    };

    constructor(
        private calendarService: CalendarService,
        private datePipe: DatePipe,
        @Inject(Window) private window: Window,
    ) {
        // see first day of the week - Sunday
        this.weekDays = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
        this.weekDaysLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        this.events = [];
        this.initGrid();
    }

    ngOnInit(): void {
        if (this.calendarService.getMyEventsQuery$) {
            this.calendarService.getMyEventsRefetch();
        }

        this.calendarService.getMyEvents().subscribe({
            next: (events: Event[]) => {
                this.events = events;
                if (this.events && this.events.length > 0) {
                    this.populateGrid();
                }
            },
        });

        this.checkScreenHeight();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['startHour'] || changes['endHour']) {
            this.initGrid();
        }

        if (changes['eventsToAdd']) {
            this.initGrid();
            this.populateGrid();
            this.checkEventsToAdd();
        }
    }

    checkScreenHeight() {
        this.screenHeight = this.window.innerHeight;
    }

    initGrid() {
        const todayDate = new Date();
        todayDate.setMinutes(0);

        this.labelDay.hours = [];
        for (let index = this.startHourAvailability; index < this.endHourAvailability + 1; index++) {
            const time = this.datePipe.transform(todayDate.setHours(index), 'h a');
            this.labelDay.hours.push(time);
        }

        this.daysWithHours = [];
        for (let j = 0; j < this.weekDays.length; j++) {
            const name = this.weekDays[j];
            const label = this.weekDaysLabels[j];
            const dayIndex = j;
            const hours = [];
            for (let index = this.startHourAvailability; index < this.endHourAvailability + 1; index++) {
                const time = this.datePipe.transform(todayDate.setHours(index), 'HH:mm');
                const period = index < 12 ? 'AM' : 'PM';

                let minutes = [];
                for (let z = 0; z < 4; z++) {
                    // (z + 1) * 15: starts with 15 min and end with 60 min
                    minutes.push({ value: (z + 1) * 15, hasEvent: false, isActive: false });
                }

                hours.push({ time, period, minutes });
            }
            this.daysWithHours.push({ name, label, hours, dayIndex });
        }
    }

    populateGrid(): void {
        this.events.forEach((event) => {
            const isEditingEvent = this.eventsToAdd.find((eventToAdd) => eventToAdd.id === event.id);
            if (isEditingEvent) {
                return;
            }

            const eventRRule = RRule.fromString(event.recurrence);
            const eventDays = eventRRule.options.byweekday;

            const eventStartDate = new Date(parseInt(event.startDateTime, 10));
            const eventStartHour = eventStartDate.getHours();
            const eventStartMinutes = Math.round(eventStartDate.getMinutes() / 15) * 15;

            const eventEndDate = new Date(parseInt(event.endDateTime, 10));
            const eventEndHour = eventEndDate.getHours();
            const eventEndMinutes = Math.round(eventEndDate.getMinutes() / 15) * 15;

            for (let index = eventStartHour; index <= eventEndHour; index++) {
                eventDays.forEach((eventDay) => {
                    const currentDay = this.daysWithHours[eventDay];
                    const currentHours = currentDay.hours;

                    const currentHour = currentHours.find((hour) => {
                        const onlyHour = +hour.time.split(':').shift();
                        return onlyHour === index;
                    });

                    if (currentHour) {
                        currentHour.minutes = currentHour?.minutes.map((minute) => {
                            const { value } = minute;

                            // start hour
                            if (index === eventStartHour && value > eventStartMinutes) {
                                currentHour.title = event.title;
                                minute.hasEvent = true;
                            }

                            // end hour
                            if (index === eventEndHour && value <= eventEndMinutes) {
                                currentHour.title = event.title;
                                minute.hasEvent = true;
                            }

                            // in between hours
                            if (index > eventStartHour && index < eventEndHour) {
                                currentHour.title = event.title;
                                minute.hasEvent = true;
                            }

                            // start and end time with same hour
                            if (
                                eventStartHour === eventEndHour &&
                                (value > eventEndMinutes || value <= eventStartMinutes)
                            ) {
                                currentHour.title = '';
                                minute.hasEvent = false;
                            }

                            return minute;
                        });
                    }
                });
            }
        });
    }

    checkEventsToAdd() {
        if (!this.eventsToAdd?.length) {
            return;
        }

        this.eventsToAdd.forEach((eventToAdd) => {
            if (!eventToAdd.currentDays?.length) {
                eventToAdd.hasConflict = false;
                return;
            }
            eventToAdd.hasConflict = false;

            const eventRRule = RRule.fromString(eventToAdd.recurrence);
            const eventDays = eventRRule.options?.byweekday;

            const eventStartDate = new Date(parseInt(eventToAdd.startDateTime, 10));
            const eventStartHour = eventStartDate.getHours();
            const eventStartMinutes = Math.round(eventStartDate.getMinutes() / 15) * 15;

            const eventEndDate = new Date(parseInt(eventToAdd.endDateTime, 10));
            const eventEndHour = eventEndDate.getHours();
            const eventEndMinutes = Math.round(eventEndDate.getMinutes() / 15) * 15;

            for (let index = eventStartHour; index <= eventEndHour; index++) {
                eventDays.forEach((eventDay) => {
                    const currentDay = this.daysWithHours[eventDay];
                    const currentHours = currentDay.hours;

                    const currentHour = currentHours.find((hour) => {
                        const onlyHour = +hour.time.split(':').shift();
                        return onlyHour === index;
                    });

                    if (currentHour) {
                        currentHour.minutes = currentHour?.minutes.map((minute) => {
                            const { value } = minute;

                            // start hour
                            if (index === eventStartHour && value > eventStartMinutes) {
                                minute.isActive = true;
                            }

                            // end hour
                            if (index === eventEndHour && value <= eventEndMinutes) {
                                minute.isActive = true;
                            }

                            // in between hours
                            if (index > eventStartHour && index < eventEndHour) {
                                minute.isActive = true;
                            }

                            // start and end time with same hour
                            if (
                                eventStartHour === eventEndHour &&
                                (value > eventEndMinutes || value <= eventStartMinutes)
                            ) {
                                minute.isActive = false;
                            }

                            // event with conflict
                            if (minute.isActive && minute.hasEvent) {
                                eventToAdd.hasConflict = true;
                            }

                            return minute;
                        });
                    }
                });
            }
        });
    }
}
