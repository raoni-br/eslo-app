import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';

import {
    ClassRecord,
    ClassRecordType,
    EnrollmentClassRecord,
    StudyGroupClassRecord,
} from '../models/class-record.model';
import { CreateEnrollmentInput } from 'app/@core/models/enrollment-invitation.model';
import { Enrollment, SourceType, ENROLLMENT_STATUS, StudyGroup } from 'app/@core/models/enrollment.model';
import { Event } from 'app/@core/models/event.model';

import { CreateStudyGroupInput } from 'app/classroom/pages/groups-page/groups-page.component';
import { ENROLLMENT_DETAIL } from 'app/@core/graphql/enrollment.graphql';
import { CLASSROOM_SUMMARY } from '../graphql/classroom.graphql';
import { CLASS_RECORD_SUMMARY } from '../graphql/class-record.graphql';
import { STUDY_GROUP_DETAILS, STUDY_GROUP_SUMMARY } from '../graphql/study-group.graphql';
import { LESSON_SUMMARY } from '../graphql/lesson.graphql';
import { Lesson } from '../models/lesson.model';

interface IStartClassMutation {
    startClass: ClassRecord;
}

export interface IStartClassInput {
    lessonId: string;
    levelId: string;
    sourceId: string;
    sourceType: SourceType;
    teacherNotes?: string;
}

interface ICreateEnrollmentMutation {
    createEnrollment: Enrollment;
}

interface IEnrollment {
    enrollment: Enrollment;
}

interface IGetEnrollments {
    enrollments: Enrollment[];
}

interface IFindGroupById {
    findGroupById: StudyGroup;
}

interface ICancelEnrollmentMutation {
    cancelEnrollment: Enrollment;
}

interface IChangeScheduleInput {
    enrollmentId: string;
    events: Event[];
}

interface IChangeEnrollmentScheduleMutation {
    changeEnrollmentSchedule: Enrollment;
}

interface ICreateStudyGroupMutation {
    createStudyGroup: StudyGroup;
}

interface IUpdateStudyGroupMutation {
    studyGroup: StudyGroup;
}

interface IUpdateStudyGroupInput {
    studyGroupId: string;
    name: string;
    events?: Event[];
}

interface IRemoveGroupInput {
    studyGroupId: string;
}

interface IRemoveGroupMutation {
    group: StudyGroup;
}

interface StudyGroupAttendeInput {
    studentId: string;
    attended: boolean;
}
interface IActivateEnrollmentMutation {
    updatedEnrollment: Enrollment;
}

export interface IFinishClassInput {
    classRecordId: string;
    sourceType: SourceType;
    sourceId: string;
    teacherNotes?: string;
    status: string;
    lessonStartedAt: string;
    lessonEndedAt: string;
    attendees?: StudyGroupAttendeInput[];
}

interface IFinishClassMutation {
    finishClass: ClassRecordType;
}

interface ITransferEnrollmentMutation {
    removeStudentFromGroup: Enrollment;
}
export interface IRevertFinishedClassStatusInput {
    classRecordId: string;
    sourceType: SourceType;
    sourceId: string;
}

interface IRevertFinishedClassStatusMutation {
    revertFinishedClassStatus: ClassRecordType;
}
export interface IRevertLessonStatusInput {
    sourceId: string;
    sourceType: SourceType;
    lessonId: string;
}

interface IRevertLessonStatusMutation {
    revertLessonStatus: Lesson;
}

export interface Student {
    id?: string;
    firstName?: string;
    familyName?: string;
    primaryEmail?: string;
    enrollments?: Enrollment[];
    opened?: boolean; // front-end only field
}

interface IClassroomQuery {
    classroom: IClassroom;
}

export interface IClassroom {
    id?: string;
    classInProgress?: ClassRecordType;
    enrollments?: Enrollment[];
    studyGroups?: StudyGroup[];
    students?: Student[];
    studentEnrollments?: Enrollment[];
}

export interface IClassroomFiltersInput {
    activeEnrollmentsOnly?: boolean;
    studyGroupStatus?: string;
}

interface IAddStudentToGroupMutation {
    addStudentToGroup: Enrollment;
}
interface IAddStudentToGroupInput {
    id: string;
    studyGroupId: string;
}

@Injectable({
    providedIn: 'root',
})
export class ClassroomService {
    private classInProgressSource = new BehaviorSubject<ClassRecord>(undefined);
    public classInProgress$ = this.classInProgressSource.asObservable();

    private editingEnrollmentSource = new BehaviorSubject<Enrollment | null>(null);
    public editingEnrollment$ = this.editingEnrollmentSource.asObservable();

    private editingGroupSource = new BehaviorSubject<StudyGroup | null>(null);
    public editingGroup$ = this.editingGroupSource.asObservable();

    getGroupByIdQuery$: QueryRef<IFindGroupById>;
    getEnrollmentQuery$: QueryRef<IEnrollment>;
    classroomQuery$: QueryRef<IClassroomQuery>;

    classroomFiltersInput: IClassroomFiltersInput = {
        activeEnrollmentsOnly: true,
        studyGroupStatus: ENROLLMENT_STATUS.ACTIVE,
    };

    constructor(private apollo: Apollo) {}

    getClassroom$(): Observable<IClassroom> {
        this.classroomQuery$ = this.apollo.watchQuery({
            query: gql`
                query Classroom($filters: ClassroomFiltersInput) {
                    classroom(filters: $filters) {
                        ...classroomSummary
                    }
                }
                ${CLASSROOM_SUMMARY}
            `,
            variables: {
                filters: this.classroomFiltersInput,
            },
        });

        return this.classroomQuery$.valueChanges.pipe(
            map((result: ApolloQueryResult<IClassroomQuery>) => {
                const classInProgress = result.data.classroom.classInProgress;
                if (!classInProgress) {
                    this.classInProgressSource.next(null);
                } else {
                    if ('enrollmentId' in classInProgress) {
                        this.classInProgressSource.next({
                            sourceType: 'ENROLLMENT',
                            enrollmentClassRecord: classInProgress as EnrollmentClassRecord,
                            studyGroupClassRecord: null,
                        });
                    } else {
                        this.classInProgressSource.next({
                            sourceType: 'STUDY_GROUP',
                            enrollmentClassRecord: null,
                            studyGroupClassRecord: classInProgress as StudyGroupClassRecord,
                        });
                    }
                }

                return result.data.classroom;
            }),
            share(),
        );
    }

    classroomRefetch(): void {
        this.getClassroom$();
        this.classroomQuery$.refetch();
    }

    setClassroomFiltersInput(filters: IClassroomFiltersInput = {}) {
        this.classroomFiltersInput = { ...this.classroomFiltersInput, ...filters };
    }

    createEnrollmentInvitation(createEnrollmentInput: CreateEnrollmentInput): Observable<Enrollment> {
        return this.apollo
            .mutate<ICreateEnrollmentMutation>({
                mutation: gql`
                    mutation CreateEnrollment($enrollmentInput: EnrollmentInput, $invitedStudent: StudentInput) {
                        createEnrollment(enrollmentInput: $enrollmentInput, invitedStudent: $invitedStudent) {
                            ...enrollmentDetail
                        }
                    }
                    ${ENROLLMENT_DETAIL}
                `,
                variables: {
                    enrollmentInput: createEnrollmentInput.enrollmentInput,
                    invitedStudent: createEnrollmentInput.invitedStudent,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<ICreateEnrollmentMutation>) => {
                    return result.data.createEnrollment;
                }),
            );
    }

    getEnrollment(enrollmentId: string): Observable<Enrollment> {
        this.getEnrollmentQuery$ = this.apollo.watchQuery({
            query: gql`
            {
                enrollment(id: "${enrollmentId}") {
                    ...enrollmentDetail
                }
            }
            ${ENROLLMENT_DETAIL}
            `,
        });

        return this.getEnrollmentQuery$.valueChanges.pipe(
            map((result: ApolloQueryResult<IEnrollment>) => result.data.enrollment),
        );
    }

    refetchEnrollment(): void {
        if (this.getEnrollmentQuery$) {
            this.getEnrollmentQuery$.refetch();
        }
    }

    cancelEnrollment(id: string): Observable<Enrollment> {
        return this.apollo
            .mutate<ICancelEnrollmentMutation>({
                mutation: gql`
                    mutation CancelEnrollmentMutation {
                        cancelEnrollment(id: "${id}") {
                            ...enrollmentDetail
                        }
                    }
                    ${ENROLLMENT_DETAIL}
                `,
            })
            .pipe(
                map((result: ApolloQueryResult<ICancelEnrollmentMutation>) => {
                    this.classroomRefetch();
                    return result.data.cancelEnrollment;
                }),
            );
    }

    changeEnrollmentSchedule(changeScheduleInput: IChangeScheduleInput): Observable<Enrollment> {
        return this.apollo
            .mutate<IChangeEnrollmentScheduleMutation>({
                mutation: gql`
                    mutation ChangeEnrollmentScheduleMutation($changeScheduleInput: ChangeScheduleInput) {
                        changeEnrollmentSchedule(changeScheduleInput: $changeScheduleInput) {
                            ...enrollmentDetail
                        }
                    }
                    ${ENROLLMENT_DETAIL}
                `,
                variables: {
                    changeScheduleInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<IChangeEnrollmentScheduleMutation>) => {
                    return result.data.changeEnrollmentSchedule;
                }),
            );
    }

    transferEnrollment(id: string, events: Event[]) {
        return this.apollo
            .mutate<ITransferEnrollmentMutation>({
                mutation: gql`
                    mutation removeStudentFromGroup($id: id, $events: EventsInput) {
                        removeStudentFromGroup(id: $id, events: $events) {
                            ...enrollmentDetail
                        }
                    }
                    ${ENROLLMENT_DETAIL}
                `,
                variables: {
                    id,
                    events,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<ITransferEnrollmentMutation>) => {
                    this.classroomRefetch();
                    return result.data.removeStudentFromGroup;
                }),
            );
    }

    startClass(startClassInput: IStartClassInput): Observable<ClassRecord> {
        return this.apollo
            .mutate<IStartClassMutation>({
                mutation: gql`
                    mutation StartClassMutation($startClassInput: StartClassInput) {
                        startClass(startClassInput: $startClassInput) {
                            ...classRecordSummary
                        }
                    }
                    ${CLASS_RECORD_SUMMARY}
                `,
                variables: { startClassInput },
            })
            .pipe(
                map((result: ApolloQueryResult<IStartClassMutation>) => {
                    const classInProgress = result.data.startClass;
                    this.classInProgressSource.next(classInProgress);

                    this.classroomRefetch();
                    return classInProgress;
                }),
            );
    }

    finishClass(finishClassInput: IFinishClassInput): Observable<ClassRecordType> {
        return this.apollo
            .mutate<IFinishClassMutation>({
                mutation: gql`
                    mutation FinishClassMutation($finishClassInput: FinishClassInput) {
                        finishClass(finishClassInput: $finishClassInput) {
                            ...classRecordSummary
                        }
                    }
                    ${CLASS_RECORD_SUMMARY}
                `,
                variables: { finishClassInput },
            })
            .pipe(
                map((result: ApolloQueryResult<IFinishClassMutation>) => {
                    this.classroomRefetch();
                    return result.data.finishClass;
                }),
            );
    }

    getGroupsQuery() {
        return this.apollo.watchQuery({
            query: gql`
                query ClassroomQuery($filters: ClassroomFiltersInput) {
                    classroom(filters: $filters) {
                        id
                        studyGroups {
                            ...studyGroupSummary
                        }
                    }
                }
                ${STUDY_GROUP_SUMMARY}
            `,
            variables: {
                filters: this.classroomFiltersInput,
            },
        });
    }

    getGroupById(id: string): Observable<StudyGroup> {
        this.getGroupByIdQuery$ = this.apollo.watchQuery<any>({
            query: gql`
                query findGroupById($id: String) {
                    findGroupById(id: $id) {
                        ...studyGroupDetails
                    }
                }
                ${STUDY_GROUP_DETAILS}
            `,
            variables: {
                id,
            },
        });

        return this.getGroupByIdQuery$.valueChanges.pipe(
            map((result: ApolloQueryResult<IFindGroupById>) => result.data.findGroupById),
        );
    }

    refetchCurrentGroupById(groupId?: string): void {
        if (groupId) {
            this.getGroupById(groupId);
        }

        if (this.getGroupByIdQuery$) {
            this.getGroupByIdQuery$.refetch();
        }
    }

    createStudyGroup(createGroupInput: CreateStudyGroupInput): Observable<StudyGroup> {
        return this.apollo
            .mutate<ICreateStudyGroupMutation>({
                mutation: gql`
                    mutation CreateGroupMutation($createGroupInput: CreateStudyGroupInput) {
                        createStudyGroup(createGroupInput: $createGroupInput) {
                            id
                            name
                        }
                    }
                `,
                variables: {
                    createGroupInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<ICreateStudyGroupMutation>) => {
                    this.classroomRefetch();
                    return result.data.createStudyGroup;
                }),
            );
    }

    updateStudyGroup(studyGroupInput: IUpdateStudyGroupInput): Observable<StudyGroup> {
        return this.apollo
            .mutate<IUpdateStudyGroupMutation>({
                mutation: gql`
                    mutation UpdateStudyGroupMutation($studyGroupInput: UpdateStudyGroupInput) {
                        updateStudyGroup(studyGroupInput: $studyGroupInput) {
                            id
                            name
                        }
                    }
                `,
                variables: {
                    studyGroupInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<IUpdateStudyGroupMutation>) => {
                    this.classroomRefetch();
                    return result.data.studyGroup;
                }),
            );
    }

    removeStudyGroup(removeGroupInput: IRemoveGroupInput): Observable<StudyGroup> {
        return this.apollo
            .mutate<IRemoveGroupMutation>({
                mutation: gql`
                    mutation RemoveStudyGroupMutation($removeGroupInput: RemoveStudyGroupInput) {
                        removeStudyGroup(removeGroupInput: $removeGroupInput) {
                            id
                            name
                        }
                    }
                `,
                variables: {
                    removeGroupInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<IRemoveGroupMutation>) => {
                    this.classroomRefetch();
                    return result.data.group;
                }),
            );
    }

    addStudentToGroup(enrollmentInput: IAddStudentToGroupInput) {
        return this.apollo
            .mutate<IAddStudentToGroupMutation>({
                mutation: gql`
                    mutation AddStudentToGroupMutation($enrollmentInput: AddStudentToGroupInput) {
                        addStudentToGroup(enrollmentInput: $enrollmentInput) {
                            id
                        }
                    }
                `,
                variables: {
                    enrollmentInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<IAddStudentToGroupMutation>) => {
                    this.classroomRefetch();
                    this.refetchCurrentGroupById();
                    return result.data.addStudentToGroup;
                }),
            );
    }

    revertFinishedClassStatus(
        revertFinishedClassStatusInput: IRevertFinishedClassStatusInput,
    ): Observable<ClassRecordType> {
        return this.apollo
            .mutate<IRevertFinishedClassStatusMutation>({
                mutation: gql`
                    mutation revertFinishedClassStatusMutation(
                        $revertFinishedClassStatusInput: RevertFinishedClassStatusInput
                    ) {
                        revertFinishedClassStatus(revertFinishedClassStatusInput: $revertFinishedClassStatusInput) {
                            ...classRecordSummary
                        }
                    }
                    ${CLASS_RECORD_SUMMARY}
                `,
                variables: { revertFinishedClassStatusInput },
            })
            .pipe(
                map((result: ApolloQueryResult<IRevertFinishedClassStatusMutation>) => {
                    this.classroomRefetch();
                    return result.data.revertFinishedClassStatus;
                }),
            );
    }

    revertLessonStatus(revertLessonStatusInput: IRevertLessonStatusInput): Observable<Lesson> {
        return this.apollo
            .mutate<IRevertLessonStatusMutation>({
                mutation: gql`
                    mutation revertLessonStatusMutation($revertLessonStatusInput: RevertLessonStatusInput) {
                        revertLessonStatus(revertLessonStatusInput: $revertLessonStatusInput) {
                            ...lessonSummary
                        }
                    }
                    ${LESSON_SUMMARY}
                `,
                variables: { revertLessonStatusInput },
            })
            .pipe(
                map((result: ApolloQueryResult<IRevertLessonStatusMutation>) => {
                    this.classroomRefetch();
                    return result.data.revertLessonStatus;
                }),
            );
    }

    activateEnrollment(enrollmentId: string): Observable<any> {
        return this.apollo
            .mutate<IActivateEnrollmentMutation>({
                mutation: gql`
                    mutation ActivateEnrollmentMutation($enrollmentId: ID) {
                        activateEnrollment(enrollmentId: $enrollmentId) {
                            id
                        }
                    }
                `,
                variables: { enrollmentId },
            })
            .pipe(
                map((result: ApolloQueryResult<IActivateEnrollmentMutation>) => {
                    this.classroomRefetch();
                    return result.data.updatedEnrollment;
                }),
            );
    }

    setEditingEnrollment(enrollment: Enrollment | null) {
        this.editingEnrollmentSource.next(enrollment);
    }

    get editingEnrollment(): Enrollment | null {
        return this.editingEnrollmentSource.getValue();
    }

    setEditingGroup(group: StudyGroup | null) {
        this.editingGroupSource.next(group);
    }

    get editingGroup(): StudyGroup | null {
        return this.editingEnrollmentSource.getValue();
    }
}
