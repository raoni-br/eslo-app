import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatNextClassDate',
})
export class FormatNextClassDatePipe implements PipeTransform {
    constructor(private datePipe: DatePipe) {}

    transform(value: any, args?: any): any {
        const date = new Date(+value);

        const dayName = this.datePipe.transform(date, 'EEE');
        const dateString = this.datePipe.transform(date, 'dd/MM/yy');
        const hour = this.datePipe.transform(date, 'hh:mm aa');

        const span = ({ text, className, upperCase }: { text: string; className: string; upperCase?: boolean }) =>
            `<span class="${className}" ${upperCase ? 'style="text-transform: uppercase"' : ''}>${text}</span>`;

        return `
          ${span({ text: dayName, className: 'mat-button-text mat-button-text--size-12', upperCase: true })}
          ${span({ text: dateString, className: 'mat-overline' })}
          ${span({ text: hour, className: 'mat-button-text mat-button-text--size-12' })}
          `;
    }
}
