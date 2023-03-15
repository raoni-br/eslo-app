import { ISubscriptionsStatusFilters } from './dashboard-model';
import { EnrollmentModel } from './enrollment.model';

import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';

export interface IClassroom {
    id: string;
    activeEnrollmentsOnly?: boolean;
    studyGroupStatus?: string;
}

interface IClassroomFilters {
    activeEnrollmentsOnly?: boolean;
    studyGroupStatus?: 'ACTIVE' | 'DELETED';
}

export interface IClassroomStudent {
    id: string;
    firstName: string;
    familyName: string;
    displayName: string;
    primaryEmail: string;
    activeEnrollmentsOnly?: boolean;
    subscriptionsStatusFilters?: ISubscriptionsStatusFilters;
}

export class ClassroomModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'classroom');
    }

    public async getClassroom(filters: IClassroomFilters): Promise<IClassroom> {
        const classroom: IClassroom = {
            id: this.loggedUser.id,
            activeEnrollmentsOnly: filters.activeEnrollmentsOnly,
            studyGroupStatus: filters.studyGroupStatus,
        };

        return classroom;
    }

    public async findStudentsByTeacher(
        activeEnrollmentsOnly?: boolean,
        subscriptionsStatusFilters?: ISubscriptionsStatusFilters,
    ): Promise<IClassroomStudent[]> {
        const enrollmentModel = new EnrollmentModel(this.loggedUser);
        const enrollments = await enrollmentModel.findTeacherEnrollmentsByUser(
            this.loggedUser.id,
            activeEnrollmentsOnly,
        );
        const students: IClassroomStudent[] = [];

        enrollments.forEach((enrollment) => {
            if (students.find((student) => student.id === enrollment.studentId)) {
                return;
            }

            // add student to list if not yet added
            students.push({
                id: enrollment.student.id,
                firstName: enrollment.student.firstName,
                familyName: enrollment.student.familyName,
                displayName: enrollment.student.displayName,
                primaryEmail: enrollment.student.primaryEmail,
                activeEnrollmentsOnly,
                subscriptionsStatusFilters,
            });
        });

        return students;
    }
}
