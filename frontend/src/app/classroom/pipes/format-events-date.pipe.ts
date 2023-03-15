import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import RRule from 'rrule';

@Pipe({
    name: 'formatEventsDate',
})
export class FormatEventsDatePipe implements PipeTransform {
    constructor(private datePipe: DatePipe) {}

    transform(events: any, ...args: any): any {
        const dateTexts = events.map((event) => {
            const rrule = RRule.fromString(event.recurrence);

            const startDate = new Date(+event.startDateTime);
            const endDate = new Date(+event.endDateTime);

            const startTime = this.datePipe.transform(startDate, 'HH:mm aa');
            const endTime = this.datePipe.transform(endDate, 'HH:mm aa');

            return { date: rrule.toText(), time: `from ${startTime} to ${endTime}` };
        });
        return dateTexts;
    }
}
