import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PostalCodeService {
    constructor(private httpClient: HttpClient) {}

    getAddress(postalCode: string): Observable<any> {
        return this.httpClient.get(`https://viacep.com.br/ws/${postalCode}/json/`, {
            headers: { skip: 'true' },
            responseType: 'json',
        });
    }
}
