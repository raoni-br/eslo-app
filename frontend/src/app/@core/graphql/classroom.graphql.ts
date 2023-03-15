import { gql } from 'apollo-angular';
import { CLASS_RECORD } from './class-record.graphql';
import { ENROLLMENT_SUMMARY } from './enrollment.graphql';
import { CLASSROOM_STUDENT } from './student.graphql';
import { STUDY_GROUP_SUMMARY } from './study-group.graphql';

export const CLASSROOM_SUMMARY = gql`
    fragment classroomSummary on Classroom {
        id
        students {
            ...classroomStudent
            enrollments {
                ...enrollmentSummary
            }
        }
        studyGroups {
            ...studyGroupSummary
        }
        classInProgress {
            ...classRecord
        }
        studentEnrollments {
            ...enrollmentSummary
        }
    }
    ${CLASSROOM_STUDENT}
    ${ENROLLMENT_SUMMARY}
    ${STUDY_GROUP_SUMMARY}
    ${CLASS_RECORD}
`;
