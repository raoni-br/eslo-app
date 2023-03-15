import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDate2Formatter extends CalendarDateFormatter {
    // you can override any of the methods defined in the parent class

    public monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
        return formatDate(date, 'EEE', locale);
    }
}
