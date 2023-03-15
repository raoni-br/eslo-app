import { AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

/*  
  Events validators must be an async validator because
  of form values not being in sync with view
*/

export class EventsWithSameDateValidator {
    static validate(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const events = control.value;
            return of(events).pipe(
                delay(0),
                map((events) => {
                    const dateValues = events.map((event) => {
                        return `${event.currentDays?.join(',')} ${event.startDateTime} ${event.endDateTime}`;
                    });
                    const hasSameDate = dateValues.some((dateChecker, index) => {
                        return dateValues.indexOf(dateChecker, index + 1) !== -1;
                    });
                    return hasSameDate ? { hasSameDate: true } : null;
                }),
            );
        };
    }
}

export class EventHasScheduleConflictValidator {
    static validate(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const event = control.value;
            return of(event).pipe(
                delay(0),
                map((event) => {
                    const hasConflict = event.hasConflict;
                    return hasConflict ? { hasConflict: true } : null;
                }),
            );
        };
    }
}

export class EventHasNoDaySelectedValidator {
    static validate(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const event = control.value;
            return of(event).pipe(
                delay(0),
                map((event) => {
                    const hasNoDaySelected = !event.currentDays?.length;
                    return hasNoDaySelected ? { hasNoDaySelected: true } : null;
                }),
            );
        };
    }
}

export class EventHasStartAndEndTimeConflictValidator {
    static validate(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const event = control.value;
            return of(event).pipe(
                delay(0),
                map((event) => {
                    const hasStartAndEndTimeConflict =
                        event.startDateTime === event.endDateTime || event.endDateTime < event.startDateTime;
                    return hasStartAndEndTimeConflict ? { hasStartAndEndTimeConflict: true } : null;
                }),
            );
        };
    }
}
