import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class TransferService implements Resolve<any> {
    invitationToken = '';

    constructor(private _httpClient: HttpClient) {}

    /**
     * Resolver
     *
     * @param route
     * @param state
     * @returns
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.invitationToken = route.params.invitationToken;
    }

    invitationRequest(choice: string): Observable<HttpResponse<any>> {
        return this._httpClient.post(
            `${environment.apiUrl}/invitation/${choice}/transfer`,
            {
                invitationToken: this.invitationToken,
            },
            {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'text',
                observe: 'response',
            },
        );
    }
}
