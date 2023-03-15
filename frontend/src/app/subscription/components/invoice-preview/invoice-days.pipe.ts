import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'invoiceDays',
})
export class InvoiceDaysPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        const now = new Date();
        const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        return Math.round(value * days);
    }
}
