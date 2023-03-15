import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatEventTime',
})
export class FormatEventTimePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        return new Date(+value);
    }
}
