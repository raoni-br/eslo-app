import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
    name: 'checkEventsControls',
    pure: false,
})
export class CheckEventsControlsPipe implements PipeTransform {
    transform(eventsControls: AbstractControl[], ...args: any[]): any {
        const filteredEventsControls = eventsControls.filter(
            ({ value: { changeStatus } }) => changeStatus !== 'DELETED',
        );

        const hasOnlyOneEvent = filteredEventsControls.length === 1;

        return hasOnlyOneEvent;
    }
}
