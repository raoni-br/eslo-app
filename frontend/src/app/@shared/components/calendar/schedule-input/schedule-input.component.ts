import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Event } from 'app/@core/models/event.model';
import { RRule, Weekday } from 'rrule';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
@Component({
    selector: 'app-schedule-input',
    templateUrl: './schedule-input.component.html',
    styleUrls: ['./schedule-input.component.scss'],
})
export class ScheduleInputComponent implements OnInit {
    @Input() event: Event;
    @Input() eventControl: AbstractControl;

    @Input() startHourAvailability = 7; // 07:00
    @Input() endHourAvailability = 22; // 22:00

    @Input() onlyRead: boolean;

    @Output() eventChange = new EventEmitter<Event>();

    weekDays: Weekday[] = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
    selectedWeekdays: number[] = [];

    eventRecurrence: RRule;
    log;
    eventStart: string;
    eventEnd: string;

    DAYS = DAYS;

    constructor(private datePipe: DatePipe) {}

    ngOnInit() {
        if ('recurrence' in this.event) {
            const { startDateTime, endDateTime, recurrence } = this.event;
            const eventRecurrence = RRule.fromString(recurrence);
            const hasDay = recurrence.includes('BYDAY=');
            this.selectedWeekdays = hasDay ? eventRecurrence.options.byweekday : [];

            this.eventStart = this.datePipe.transform(new Date(parseInt(startDateTime, 10)), 'HH:mm');
            this.eventEnd = this.datePipe.transform(new Date(parseInt(endDateTime, 10)), 'HH:mm');

            this.validateRecurrence();
        }
    }

    onWeekdayChange(weekday: Weekday): void {
        const index = this.selectedWeekdays.findIndex((wd) => wd === weekday.weekday);
        if (index === -1) {
            this.selectedWeekdays.push(weekday.weekday);
        } else {
            this.selectedWeekdays.splice(index, 1);
        }

        this.validateRecurrence();
    }

    updateTimeStart(value: string): void {
        this.eventStart = value;

        const startHour = +value.split(':')[0];
        if (startHour < this.startHourAvailability) {
            return;
        }

        this.validateRecurrence();
    }

    updateTimeEnd(value: string): void {
        this.eventEnd = value;

        const endHour = +value.split(':')[0];
        if (endHour > this.endHourAvailability + 1) {
            return;
        }

        this.validateRecurrence();
    }

    validateRecurrence(): void {
        this.event = {
            ...this.event,
            recurrence: new RRule({
                freq: RRule.WEEKLY,
                interval: 1,
                byweekday: this.selectedWeekdays,
            }).toString(),
            currentDays: this.selectedWeekdays,
        };

        if (!this.eventStart || !this.eventEnd) {
            this.eventChange.emit(this.event);
            return;
        }

        const eventStartSplit = this.eventStart?.split(':');
        let eventStartDateTime = new Date(parseInt(this.event.startDateTime, 10));
        if (!(eventStartDateTime instanceof Date) || isNaN(eventStartDateTime.getTime())) {
            eventStartDateTime = new Date();
        }
        eventStartDateTime.setHours(parseInt(eventStartSplit[0], 10), parseInt(eventStartSplit[1], 10), 0, 0);
        this.event.startDateTime = eventStartDateTime.getTime().toString();

        const eventEndSplit = this.eventEnd?.split(':');
        let eventEndDateTime = new Date(parseInt(this.event.endDateTime, 10));
        if (!(eventEndDateTime instanceof Date) || isNaN(eventEndDateTime.getTime())) {
            eventEndDateTime = new Date();
        }
        eventEndDateTime.setHours(parseInt(eventEndSplit[0], 10), parseInt(eventEndSplit[1], 10), 0, 0);
        this.event.endDateTime = eventEndDateTime.getTime().toString();

        this.eventChange.emit(this.event);
    }
}
