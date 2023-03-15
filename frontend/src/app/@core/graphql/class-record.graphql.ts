import { gql } from 'apollo-angular';

export const CLASS_RECORD_SUMMARY = gql`
    fragment classRecordSummary on ClassRecord {
        ... on EnrollmentClassRecord {
            id
            lesson {
                id
            }
            enrollment {
                id
            }
        }
        ... on StudyGroupClassRecord {
            id
            lesson {
                id
            }
            studyGroup {
                id
            }
        }
    }
`;

export const CLASS_RECORD = gql`
    fragment classRecord on ClassRecord {
        ... on EnrollmentClassRecord {
            id
            enrollmentId
            teacherNotes
            status
            startedAt
            completedAt
            lessonStartedAt
            lessonEndedAt
            revertClassStatus
            lesson {
                id
                code
                title
                levelOrder
            }
            enrollment {
                id
                student {
                    id
                    firstName
                    familyName
                    displayName
                }
            }
        }
        ... on StudyGroupClassRecord {
            id
            studyGroupId
            teacherNotes
            status
            startedAt
            completedAt
            lessonStartedAt
            lessonEndedAt
            revertClassStatus
            lesson {
                id
                code
                title
                levelOrder
            }
            studyGroup {
                id
                enrollments {
                    id
                    student {
                        id
                        firstName
                        familyName
                        displayName
                    }
                }
            }
            studyGroupClassAttendees {
                id
                studentId
                student {
                    id
                    student {
                        id
                        firstName
                        familyName
                        displayName
                    }
                }
            }
        }
    }
`;
