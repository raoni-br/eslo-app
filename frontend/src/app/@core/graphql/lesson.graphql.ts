import { gql } from 'apollo-angular';

export const LESSON_SUMMARY = gql`
    fragment lessonSummary on Lesson {
        id
        code
        title
        category
        subject
        slug
        levelOrder
    }
`;

export const LESSON_DETAILS = gql`
    fragment lessonDetails on Lesson {
        id
        title
        category
        subject
        slug
        levelOrder
        lessonMaterial {
            lectureScript {
                order
                media {
                    id
                    mimeType
                    rootUri
                }
            }
            studentBook {
                order
                media {
                    id
                    mimeType
                    rootUri
                }
            }
            audio {
                order
                media {
                    id
                    mimeType
                    rootUri
                }
            }
            activities {
                order
                title
                activitySlides {
                    order
                    media {
                        id
                        mimeType
                        rootUri
                    }
                }
            }
        }
    }
`;
