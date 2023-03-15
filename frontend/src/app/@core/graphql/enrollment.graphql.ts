import { gql } from 'apollo-angular';

import { CLASS_RECORD } from './class-record.graphql';
import { USER_CONTACT } from './user-profile.graphql';
import { LESSON_SUMMARY } from './lesson.graphql';
import { STUDY_GROUP_SUMMARY } from './study-group.graphql';
import { LEVEL_SUMMARY } from './level.graphql';
import { EVENT_OCCURRENCE_SUMMARY, EVENT_SUMMARY } from './events.graphql';
import { INVITATION_SUMMARY } from './invitation.graphql';

export const ENROLLMENT_SUMMARY = gql`
    fragment enrollmentSummary on Enrollment {
        id
        sourceType
        status
        nextLesson {
            id
        }
        teacher {
            id
            firstName
            familyName
        }
        student {
            ...userContact
        }
        invitation {
            id
        }
        studyGroup {
            ...studyGroupSummary
        }
        level {
            ...levelSummary
        }
        events {
            ...eventSummary
        }
        lessons {
            id
        }
    }
    ${LEVEL_SUMMARY}
    ${STUDY_GROUP_SUMMARY}
    ${USER_CONTACT}
    ${EVENT_SUMMARY}
`;

export const ENROLLMENT_DETAIL = gql`
    fragment enrollmentDetail on Enrollment {
        id
        sourceType
        status
        studyGroup {
            ...studyGroupSummary
        }
        level {
            ...levelSummary
        }
        student {
            ...userContact
        }
        invitation {
            ...invitationSummary
        }
        events {
            ...eventSummary
        }
        classInProgress {
            ...classRecord
        }
        lastLesson {
            ...classRecord
        }
        nextLesson {
            ...lessonSummary
        }
        nextEventOccurrence {
            ...eventOccurrenceSummary
        }
        lessons {
            ...lessonSummary
        }
        classRecords {
            ...classRecord
        }
    }
    ${CLASS_RECORD}
    ${LESSON_SUMMARY}
    ${INVITATION_SUMMARY}
    ${USER_CONTACT}
    ${EVENT_SUMMARY}
    ${EVENT_OCCURRENCE_SUMMARY}
    ${STUDY_GROUP_SUMMARY}
`;
