import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'checkOldEvent',
})
export class CheckOldEventPipe implements PipeTransform {
    transform(event: any): any {
        return new Date(+event?.meta?.startDateTime) < new Date();
    }
}
