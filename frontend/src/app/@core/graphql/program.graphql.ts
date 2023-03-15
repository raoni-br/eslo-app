import { gql } from 'apollo-angular';

export const PROGRAM_SUMMARY = gql`
    fragment programSummary on Program {
        id
        code
        name
        icon
        label
        description
        modules {
            id
            code
            name
            programOrder
            description
            levels {
                id
                code
                name
                label
                moduleOrder
                description
            }
        }
    }
`;

export const PROGRAM_DETAILS = gql`
    fragment programDetails on Program {
        id
        code
        name
        icon
        label
        description
        modules {
            id
            code
            name
            programOrder
            description
            levels {
                id
                code
                name
                label
                moduleOrder
                description
                lessons {
                    id
                    title
                    category
                    subject
                    slug
                    levelOrder
                }
            }
        }
    }
`;
