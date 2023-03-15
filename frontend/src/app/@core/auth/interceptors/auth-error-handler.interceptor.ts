import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserSessionService } from '../../services/user-session.service';

@Injectable()
export class AuthErrorHandler implements HttpInterceptor {
    constructor(private userSessionService: UserSessionService, private injector: Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((err) => {
                if (err.status === 401) {
                    this.userSessionService.removeAuthToken();
                }

                const error = err.error.message || err.statusText;
                return throwError(error);
            }),
        );
    }
}
