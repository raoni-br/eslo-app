import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'convertTime',
})
export class ConvertTimePipe implements PipeTransform {
    constructor() {}

    transform(value: any, args?: any): any {
        console.log('', value);

        const hour24h = +value.split(':').shift();
        const hour12h = ((hour24h + 11) % 12) + 1;
        const addZero = hour12h < 10 ? '0' : '';

        return `${addZero}${hour12h}:00`;
    }
}
