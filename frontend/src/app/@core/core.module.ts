import { APOLLO_OPTIONS } from 'apollo-angular';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { CommonModule } from '@angular/common';

import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { environment } from '../../environments/environment';
import { httpInterceptorProviders } from './interceptors';

import { ProgressBarModule } from '../@core/components/progress-bar/progress-bar.module';

import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { HttpClientModule } from '@angular/common/http';

const uri = `${environment.apiUrl}/graphql`; // <-- add the URL of the GraphQL server here

export const createApollo = (httpLink: HttpLink, matSnackBar: MatSnackBar) => {
    // Get the authentication token from local storage if it exists
    const token = localStorage.getItem('token');
    const auth = setContext((operation, context) => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }));

    const errorLink = onError(({ graphQLErrors, networkError }) => {
        let errorMessage: string;

        if (graphQLErrors) {
            errorMessage = graphQLErrors.map(({ message }) => message).join(' \n');
        }

        if (networkError) {
            if (errorMessage) {
                errorMessage += ` ${networkError.message}`;
            } else {
                errorMessage = networkError.message;
            }
        }

        if (errorMessage) {
            const panelClass = ['snackbar-panel'];
            const buttonLabel = 'dismiss';

            if (errorMessage.length <= 35) {
                panelClass.push('snackbar-panel--one-line');
            } else {
                panelClass.push('snackbar-panel--two-line');
            }

            matSnackBar.open(errorMessage, buttonLabel, {
                duration: 0,
                panelClass,
            });
        }
    });

    return {
        link: errorLink.concat(httpLink.create({ uri, includeExtensions: true })),
        // https://www.apollographql.com/docs/react/data/fragments/#using-fragments-with-unions-and-interfaces
        cache: new InMemoryCache({
            possibleTypes: {
                ClassRecord: ['EnrollmentClassRecord', 'StudyGroupClassRecord'],
            },
        }),
    };
};

@NgModule({
    exports: [HttpClientModule, ProgressBarModule],
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory: createApollo,
            deps: [HttpLink, MatSnackBar],
        },
        httpInterceptorProviders,
    ],
    declarations: [],
    imports: [CommonModule, MatSnackBarModule],
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error(
                'CoreModule has already been loaded. You should import the core module in the main AppModule only.',
            );
        }
    }
}
