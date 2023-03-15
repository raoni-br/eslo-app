import { Apollo, gql } from 'apollo-angular';
import { ApolloQueryResult } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { UserAuthDetails, UserProfile } from 'app/@core/models/user-profile.model';
import { UserSessionService } from 'app/@core/services/user-session.service';
import { USER_PROFILE } from '../graphql/user-profile.graphql';
import { CreatePasswordStudentInfo } from '../models/invitation.model';
import { LiveChatService } from './live-chat.service';

interface ILoginResult {
    token: string;
}

interface IUserResult {
    myProfile: UserProfile;
}

interface IUpdateMyProfileResult {
    updateMyProfile: UserProfile;
}

interface IChangePassword {
    user: UserProfile;
}

interface INewUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    cpf: string;
    postalCode: string;
    street: string;
    streetNumber: string;
    streetComplement: string;
    district: string;
    city: string;
    state: string;
    addressType?: string;
    countryISO?: string;
    category?: string;
    earlyAccessCode?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private loggedUserSubject: BehaviorSubject<UserAuthDetails>;
    public loggedUser: Observable<UserAuthDetails>;

    private studentInfoSubject = new BehaviorSubject<CreatePasswordStudentInfo | null>(null);
    studentInfo$ = this.studentInfoSubject.asObservable();

    constructor(
        private http: HttpClient,
        private apollo: Apollo,
        private _userSessionService: UserSessionService,
        private liveChatService: LiveChatService,
    ) {
        this.loggedUserSubject = new BehaviorSubject<UserAuthDetails>(null);
        this.loggedUser = this.loggedUserSubject.asObservable();

        this.setUserFromAuthToken().subscribe();
    }

    setUserFromAuthToken(): Observable<UserAuthDetails> {
        const jwt = this._userSessionService.getAuthToken();
        if (!jwt) {
            return of(undefined);
        }

        this.liveChatService.getLiveChatToken();
        const jwtPayload = JSON.parse(atob(jwt.split('.')[1])) as UserAuthDetails;
        if (!jwtPayload.roles) {
            jwtPayload.roles = [];
        }

        this.loggedUserSubject.next(jwtPayload);

        return of(jwtPayload);
    }

    getUserProfile(): Observable<UserProfile> {
        if (!this._userSessionService.getAuthToken()) {
            return EMPTY;
        }

        return this.apollo
            .query({
                query: gql`
                    {
                        myProfile {
                            ...userProfile
                        }
                    }
                    ${USER_PROFILE}
                `,
                fetchPolicy: 'network-only',
            })
            .pipe(map((result: ApolloQueryResult<IUserResult>) => result.data.myProfile));
    }

    updateMyProfile(userProfile: UserProfile): Observable<UserProfile> {
        return this.apollo
            .mutate<IUpdateMyProfileResult>({
                variables: {
                    userProfile,
                },
                mutation: gql`
                    mutation updateMyProfile($userProfile: UserInput) {
                        updateMyProfile(userProfile: $userProfile) {
                            ...userProfile
                        }
                    }
                    ${USER_PROFILE}
                `,
            })
            .pipe(
                map((result: ApolloQueryResult<IUpdateMyProfileResult>) => {
                    const updatedUser = result.data.updateMyProfile;
                    return updatedUser;
                }),
            );
    }

    changePassword(changePasswordInput: {
        userEmail: string;
        oldPassword: string;
        newPassword: string;
    }): Observable<any> {
        return this.apollo
            .mutate<IChangePassword>({
                variables: {
                    changePasswordInput,
                },
                mutation: gql`
                    mutation changeMyPassword($changePasswordInput: ChangePasswordInput) {
                        changeMyPassword(changePasswordInput: $changePasswordInput) {
                            id
                        }
                    }
                `,
            })
            .pipe(
                map((result: ApolloQueryResult<IChangePassword>) => {
                    const updatedUser = result.data.user;
                    return updatedUser;
                }),
            );
    }

    register(newUser: INewUser): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/register`, newUser);
    }

    login(email: string, password: string): Observable<{ token: string }> {
        return this.http.post<any>(
            `${environment.apiUrl}/auth/login`,
            { email, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json',
            },
        );
    }

    login2(email: string, password: string): Observable<UserProfile> {
        return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password });
    }

    loginSuccess(result: ILoginResult) {
        this._userSessionService.setAuthToken(result.token);
        return this.setUserFromAuthToken();
    }

    logout(): void {
        this.loggedUserSubject.next(null);
        this._userSessionService.removeAuthToken();
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post<any>(
            `${environment.apiUrl}/auth/forgot-password`,
            { email },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json',
            },
        );
    }

    resetPassword(resetPasswordToken: string, newPassword: string): Observable<any> {
        return this.http.post<any>(
            `${environment.apiUrl}/auth/reset-password`,
            { resetPasswordToken, newPassword },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json',
            },
        );
    }

    validateEmail(email: string): Observable<any> {
        return this.http.post<any>(
            `${environment.apiUrl}/auth/email-validation`,
            { primaryEmail: email },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json',
            },
        );
    }

    setStudentInfoForCreatePassword(studentInfo: CreatePasswordStudentInfo) {
        this.studentInfoSubject.next(studentInfo);
    }

    getStudentInfo() {
        return this.studentInfoSubject.getValue();
    }

    hasRole(role: string) {
        const { roles } = this.loggedUserSubject.getValue();
        return roles.includes(role);
    }
}
