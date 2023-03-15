import { gql } from 'apollo-angular';

export const LEVEL_SUMMARY = gql`
    fragment levelSummary on Level {
        id
        name
        code
        label
        layoutSettings {
            svgImageUrl
            icon
            primaryColour
            secondaryColour
        }
        module {
            id
            program {
                id
                code
                label
                name
                icon
                label
            }
        }
    }
`;
