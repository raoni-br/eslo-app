import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserSessionService } from '../../services/user-session.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private userSessionService: UserSessionService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.userSessionService.getAuthToken();
        const skipIntercept = request.headers.has('skip');

        if (skipIntercept) {
            request = request.clone({
                headers: request.headers.delete('skip'),
            });

            return next.handle(request);
        }

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        return next.handle(request).pipe(
            tap((event) => {
                if (event instanceof HttpResponse) {
                    const response = event as HttpResponse<any>;

                    const token = response.headers.get('Token');
                    if (token) {
                        this.userSessionService.setAuthToken(token);
                    }
                }
            }),
        );
    }
}
