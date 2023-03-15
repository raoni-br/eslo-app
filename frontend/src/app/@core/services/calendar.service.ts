import { Apollo, gql } from 'apollo-angular';
import { ApolloQueryResult } from '@apollo/client/core';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Event } from 'app/@core/models/event.model';
import { EventOccurrence, IEventOccurrenceInput } from 'app/@core/models/event-occurrence.model';
import { EVENT_OCCURRENCE_SUMMARY, EVENT_SUMMARY } from '../graphql/events.graphql';

export interface IMyCalendar {
    myCalendar: EventOccurrence[];
}

interface IMyEvents {
    myProfile: IEventsOrganised;
}

interface IEventsOrganised {
    eventsOrganised: Event[];
}

interface IChangeSpecificEventBySourceMutation {
    changeSpecificEvent: EventOccurrence;
}

@Injectable({
    providedIn: 'root',
})
export class CalendarService {
    getMyEventsQuery$: any;

    constructor(private apollo: Apollo) {}

    getMyEvents(): Observable<Event[]> {
        this.getMyEventsQuery$ = this.apollo.watchQuery({
            query: gql`
                {
                    myProfile {
                        id
                        eventsOrganised {
                            ...eventSummary
                        }
                    }
                }
                ${EVENT_SUMMARY}
            `,
        });

        return this.getMyEventsQuery$.valueChanges.pipe(
            map((result: ApolloQueryResult<IMyEvents>) => result.data.myProfile.eventsOrganised),
        );
    }

    getMyEventsRefetch() {
        if (this.getMyEventsQuery$) {
            this.getMyEventsQuery$.refetch();
        }
    }

    getMyCalendar(fromDate: Date, toDate: Date) /* : Observable<EventOccurrence[]> */ {
        return this.apollo.watchQuery({
            query: gql`
          {
            myCalendar(fromDate: "${fromDate.toISOString()}", toDate: "${toDate.toISOString()}") {
                ...eventOccurrenceSummary
              }
          }
          ${EVENT_OCCURRENCE_SUMMARY}`,
        });
    }

    changeSpecificEvent(changeSpecificEventInput: IEventOccurrenceInput) {
        return this.apollo
            .mutate<IChangeSpecificEventBySourceMutation>({
                mutation: gql`
                    mutation changeSpecificEventBySourceMutation($changeSpecificEventInput: EventOccurrenceInput) {
                        changeSpecificEvent(changeSpecificEventInput: $changeSpecificEventInput) {
                            id
                        }
                    }
                `,
                variables: {
                    changeSpecificEventInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<IChangeSpecificEventBySourceMutation>) => {
                    return result.data.changeSpecificEvent;
                }),
            );
    }
}
