import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// TODO: handle silent session refresh: 1- auto-login every x minutes. 2 - handle refresh token
@Injectable({
    providedIn: 'root',
})
export class UserSessionService {
    constructor(private router: Router, private apollo: Apollo) {}

    getAuthToken(): string {
        return localStorage.getItem('current-user');
    }

    setAuthToken(token: string): void {
        localStorage.setItem('current-user', token);
    }

    removeAuthToken(): void {
        localStorage.removeItem('current-user');

        // stop apollo queries and reset cache
        this.apollo.client.stop();
        this.apollo.client.resetStore();

        this.router.navigate(['/auth/login']);
    }
}
