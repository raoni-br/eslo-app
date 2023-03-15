import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';

@Pipe({
    name: 'utcToDate',
})
export class UTCToDatePipe implements PipeTransform {
    constructor(private mediaObserver: MediaObserver, private datePipe: DatePipe) {}

    transform(value: any, args?: any): any {
        if (!value) {
            return '    ';
        }

        const date = new Date(+value);

        const isMobile = this.mediaObserver.isActive('xs');

        let dateLabel = this.datePipe.transform(date, 'dd/MM/yyyy hh:mm aa');
        if (isMobile) {
            dateLabel = dateLabel.split(/(?<=^\S+)\s/).join('<br/>');
        }

        return dateLabel;
    }
}
