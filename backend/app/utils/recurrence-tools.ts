import RRule, { rrulestr, Frequency } from 'rrule';

type IntervalType = 'day' | 'month' | 'week' | 'year';

export interface Interval {
    interval: IntervalType;
    intervalCount: number;
}

export class EsloRecurrenceTools {
    /**
     * Returns a human-readable interval from a recurrence rule string.
     * This a safe function, it does not throw exceptions but returns undefined instead.
     * @param recurrence {string}
     * @returns {Interval}
     */
    public static getIntervalFromRRule(recurrence: string): Interval | undefined {
        try {
            const rruleRecurrence = rrulestr(recurrence) as RRule;

            if (!rruleRecurrence) {
                return undefined;
            }

            let interval: IntervalType;
            switch (rruleRecurrence.options.freq) {
                case Frequency.YEARLY:
                    interval = 'year';
                    break;
                case Frequency.MONTHLY:
                    interval = 'month';
                    break;
                case Frequency.WEEKLY:
                    interval = 'week';
                    break;
                default:
                    // defaults to day even for smaller frequencies (hour, minute, etc.)
                    interval = 'day';
            }

            return {
                interval,
                intervalCount: rruleRecurrence.options.interval,
            };
        } catch (error: any) {
            return undefined;
        }
    }
}
