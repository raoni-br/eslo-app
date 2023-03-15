import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'checkHoverEvent',
})
export class CheckHoverEventPipe implements PipeTransform {
    transform(hoveredEvent: any, event: any): any {
        const hasSameTitle = hoveredEvent?.title === event?.title;
        const hasSameDate =
            hoveredEvent?.meta?.startDateTime === event?.meta?.startDateTime &&
            hoveredEvent?.meta?.endDateTime === event?.meta?.endDateTime;
        const isUpcomingEvent = new Date(+hoveredEvent?.meta?.startDateTime) > new Date();

        const hasHoverState = hasSameTitle && hasSameDate && isUpcomingEvent;

        return hasHoverState;
    }
}
