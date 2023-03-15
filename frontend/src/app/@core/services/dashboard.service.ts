import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ENROLLMENT_DETAIL } from '../graphql/enrollment.graphql';
import { STUDY_GROUP_SUMMARY } from '../graphql/study-group.graphql';
import { Enrollment } from '../models/enrollment.model';
import { EventOccurrence } from '../models/event-occurrence.model';
import { Subscription } from '../models/subscription.model';

interface IStudent {
    id?: string;
    firstName?: string;
    familyName?: string;
    displayName?: string;
    primaryEmail?: string;
    enrollments?: Enrollment[];
    subscriptions?: Subscription[];
}

interface ITeacherDashboard {
    nextEvents: EventOccurrence[];
    students: IStudent[];
}

interface ITeacherDashboardQuery {
    teacherDashboard: ITeacherDashboard;
}

interface IStudentDashboard {
    nextEvent: EventOccurrence;
    subscriptions: Subscription[];
}

interface IStudentDashboardQuery {
    studentDashboard: IStudentDashboard;
}

export interface IDashboardFilters {
    subscriptionsStatus?: string;
    subscriptionsExpiringInDays?: number;
}

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    constructor(private apollo: Apollo) {}

    getTeacherDashboard(
        filters: IDashboardFilters = { subscriptionsStatus: 'ACTIVE', subscriptionsExpiringInDays: 30 },
    ): Observable<ITeacherDashboard> {
        return this.apollo
            .watchQuery<ITeacherDashboardQuery>({
                query: gql`
                    query TeacherDashboard($filters: DashboardFilters) {
                        teacherDashboard(filters: $filters) {
                            id
                            nextEvents {
                                id
                                title
                                description
                                startDateTime
                                enrollment {
                                    id
                                }
                                studyGroup {
                                    id
                                }
                            }
                            students {
                                id
                                firstName
                                familyName
                                displayName
                                enrollments {
                                    id
                                    studyGroup {
                                        id
                                    }
                                }
                                subscriptions {
                                    id
                                    # renewalDate
                                }
                            }
                        }
                    }
                `,
                variables: {
                    filters,
                },
            })
            .valueChanges.pipe(
                map((result: ApolloQueryResult<ITeacherDashboardQuery>) => result.data.teacherDashboard),
            );
    }

    getStudentDashboard(
        filters: IDashboardFilters = { subscriptionsStatus: 'ACTIVE', subscriptionsExpiringInDays: 100 },
    ): Observable<IStudentDashboard> {
        return this.apollo
            .watchQuery<IStudentDashboardQuery>({
                query: gql`
                    query StudentDashboardQuery($filters: DashboardFilters) {
                        studentDashboard(filters: $filters) {
                            id
                            nextEvent {
                                id
                                title
                                description
                                startDateTime
                                enrollment {
                                    ...enrollmentDetail
                                }
                                studyGroup {
                                    ...studyGroupSummary
                                }
                            }
                            subscriptions {
                                id
                                # renewalDate
                            }
                        }
                    }
                    ${ENROLLMENT_DETAIL}
                    ${STUDY_GROUP_SUMMARY}
                `,
                variables: {
                    filters,
                },
            })
            .valueChanges.pipe(
                map((result: ApolloQueryResult<IStudentDashboardQuery>) => result.data.studentDashboard),
            );
    }
}
