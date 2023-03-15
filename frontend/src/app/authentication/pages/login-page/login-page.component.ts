import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'app/@core/services/user.service';
import { throwError } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    loginFailed = {
        error: false,
        message: '',
    };

    email: string;

    constructor(
        private userService: UserService,
        private router: Router,
        private mediaObserver: MediaObserver,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.email = this.route.snapshot.queryParams?.email;

        if (this.email) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { email: null },
                queryParamsHandling: 'merge',
            });
        }
    }

    login({ email, password }: { email: string; password: string }): void {
        this.userService
            .login(email, password)
            .pipe(
                first(),
                switchMap((result) => {
                    return this.userService.loginSuccess(result);
                }),
                catchError((err) => throwError(err)),
            )
            .subscribe({
                next: () => {
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    if (err === 'Bad Request') {
                        this.loginFailed = {
                            error: true,
                            message: 'Invalid email or password',
                        };
                        return;
                    }
                    this.loginFailed = {
                        error: true,
                        message: 'Error validating email/password',
                    };
                },
            });
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
