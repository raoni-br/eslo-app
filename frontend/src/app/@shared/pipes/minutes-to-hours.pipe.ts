import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'minutesToHours',
})
export class MinutesToHoursPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        const hours = Math.floor(value / 60);
        const minutes = value % 60;

        const hourLabel = hours > 1 ? 'hours' : 'hour';
        const minuteLabel = minutes > 1 ? 'minutes' : 'minute';

        return `${hours === 0 ? '' : `${hours} ${hourLabel}`} ${minutes === 0 ? '' : `${minutes} ${minuteLabel}`}`;
    }
}
