import { Pipe, PipeTransform } from '@angular/core';
import { PricePeriod } from 'app/@core/models/product.model';

@Pipe({
    name: 'intervalLabel',
})
export class ConvertIntervalLabel implements PipeTransform {
    transform(value: PricePeriod, args?: any): string {
        if (value.intervalCount === 1) {
            if (value.interval === 'day') {
                return 'daily';
            }
            return `${value.interval}`; // yearly, monthly, weekly
        }

        return `every ${value.intervalCount} ${value.interval}s`;
    }
}
