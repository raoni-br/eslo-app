import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { ONBOARDING_FORM } from '../graphql/onboarding.graphql';
import { IForm } from '../models/onboarding.model';

interface IGetUserTutorialFormQuery {
    getUserTutorialForm: IForm;
}
export interface ISubmitUserTutorialFormAnswer {
    key: string;
    value?: string;
    values?: string[];
}

interface ISubmitUserTutorialFormMutation {
    submitUserTutorialForm: IForm;
}
export interface ISubmitUserTutorialFormInput {
    slug: string;
    answers: ISubmitUserTutorialFormAnswer[];
}
@Injectable({
    providedIn: 'root',
})
export class OnboardingService {
    constructor(private apollo: Apollo) {}

    getUserTutorialFormQuery(slug: string): Observable<IForm> {
        return this.apollo
            .watchQuery({
                query: gql`
                    query getUserTutorialFormQuery($slug: String) {
                        getUserTutorialForm(slug: $slug) {
                            ...formDetails
                        }
                    }
                    ${ONBOARDING_FORM}
                `,
                variables: {
                    slug,
                },
            })
            .valueChanges.pipe(
                map((result: ApolloQueryResult<IGetUserTutorialFormQuery>) => result.data.getUserTutorialForm),
            );
    }

    // mutation {
    //     submmitForm(submmitFormInput: {
    //       slug: "onboarding-form",
    //       answers:
    //       [
    //         {key: "Q1", value: "A"},
    //         {key: "Q2", value: "B"},
    //         {key: "Q3", value: "C"},
    //       ]
    //     }) {id}
    //   }

    submitUserTutorialForm(submitUserTutorialFormInput: ISubmitUserTutorialFormInput) {
        return this.apollo
            .mutate<ISubmitUserTutorialFormMutation>({
                mutation: gql`
                    mutation submitUserTutorialFormMutation($submitUserTutorialFormInput: SubmitUserTutorialFormInput) {
                        submitUserTutorialForm(submitUserTutorialFormInput: $submitUserTutorialFormInput) {
                            id
                        }
                    }
                `,
                variables: {
                    submitUserTutorialFormInput,
                },
            })
            .pipe(
                map((result: ApolloQueryResult<ISubmitUserTutorialFormMutation>) => {
                    return result.data.submitUserTutorialForm;
                }),
            );
    }
}
