import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { TokenValidation } from './token-validation.interface';

interface TokenPayload {
    registrationToken: string;
}

@Injectable({
    providedIn: 'root',
})
export class UserAccountService {
    constructor(private _httpClient: HttpClient) {}

    private handleError(error: HttpErrorResponse): Observable<any> {
        return throwError(error);
    }

    public validateRegistrationToken(registrationToken: string): Observable<TokenValidation> {
        const url = `${environment.apiUrl}/auth/confirm-registration`;
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        };

        return this._httpClient.post<TokenPayload>(url, { registrationToken }, httpOptions).pipe(
            map((response: any) => response),
            catchError(this.handleError),
        );
    }
}
