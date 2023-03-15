import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProgressBarService } from 'app/@core/components/progress-bar/progress-bar.service';
import { throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * This class is for intercepting http requests. When a request starts, call the show method
 * in the ProgressBarService. Once the request completes and we have a response, the method hide it's called.
 * If an error occurs while servicing the request,the method hide it's called.
 *
 * @class {HttpRequestInterceptor}
 */
@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
    constructor(private progressBarService: ProgressBarService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.progressBarService.setMode('indeterminate');
        this.progressBarService.show();
        return next.handle(request).pipe(
            catchError((err) => {
                this.progressBarService.hide();
                return throwError(err);
            }),
            map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
                if (evt instanceof HttpResponse) {
                    this.progressBarService.hide();
                }
                return evt;
            }),
        );
    }
}
