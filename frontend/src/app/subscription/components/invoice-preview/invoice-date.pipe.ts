import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'invoiceDate',
})
export class InvoiceDatePipe implements PipeTransform {
    constructor(private datePipe: DatePipe) {}

    transform(value: any, args?: any): any {
        if (!value) {
            return;
        }

        const dateSplit = value.split(':')[0] as string;
        const date = dateSplit.substring(0, dateSplit.length - 2);
        const formattedDate = this.datePipe.transform(date);

        return formattedDate;
    }
}
