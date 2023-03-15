import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatEventTitle',
})
export class FormatEventTitlePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        return value.split(/(\([0-9]:)/).shift();
    }
}
