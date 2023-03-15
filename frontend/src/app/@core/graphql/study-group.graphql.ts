import { gql } from 'apollo-angular';
import { EVENT_SUMMARY } from './events.graphql';
import { LEVEL_SUMMARY } from './level.graphql';

export const STUDY_GROUP_SUMMARY = gql`
    fragment studyGroupSummary on StudyGroup {
        id
        name
        lessons {
            id
        }
        level {
            ...levelSummary
        }
        events {
            ...eventSummary
        }
        studyGroupClassRecords {
            id
            status
            lesson {
                id
            }
        }
        studyGroupTeachers {
            teacher {
                firstName
                familyName
            }
        }
        nextLesson {
            id
            title
            category
            subject
        }
    }
    ${LEVEL_SUMMARY}
    ${EVENT_SUMMARY}
`;

export const STUDY_GROUP_DETAILS = gql`
    fragment studyGroupDetails on StudyGroup {
        id
        name
        level {
            ...levelSummary
        }
        studyGroupTeachers {
            teacher {
                firstName
                familyName
            }
        }
        lastLesson {
            id
            lesson {
                id
            }
        }
        nextLesson {
            id
            code
            title
            category
            subject
            slug
            levelOrder
            level {
                id
            }
        }
        lessons {
            id
            code
            title
            category
            subject
            slug
            levelOrder
        }
        enrollments {
            id
            status
            sourceType
            studyGroup {
                id
            }
            level {
                id
                label
                module {
                    program {
                        name
                        label
                    }
                }
            }
            nextLesson {
                id
            }
            student {
                id
                firstName
                familyName
                displayName
            }
        }
        studyGroupClassRecords {
            id
            teacherNotes
            status
            startedAt
            completedAt
            lessonStartedAt
            lessonEndedAt
            revertClassStatus
            lesson {
                id
            }
            studyGroupClassAttendees {
                attended
                student {
                    student {
                        firstName
                        familyName
                    }
                }
            }
        }
        events {
            ...eventSummary
        }
    }
    ${LEVEL_SUMMARY}
    ${EVENT_SUMMARY}
`;
