import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CreatePasswordStudentInfo } from 'app/@core/models/invitation.model';
import { UserService } from 'app/@core/services/user.service';
import { WelcomeService } from 'app/main/invitation/welcome/welcome.service';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-register-page',
    templateUrl: './register-page.component.html',
    styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent implements OnInit {
    registerFailed = false;

    email: string;

    studentInfo: CreatePasswordStudentInfo;

    constructor(
        private userService: UserService,
        private matSnackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
        private welcomeService: WelcomeService,
    ) {}

    ngOnInit() {
        this.email = this.route.snapshot.queryParams?.email;
        const invitationToken = this.route.snapshot.queryParams?.invitationToken;
        if (invitationToken) {
            this.welcomeService.invitationRequest('confirm', invitationToken).subscribe({
                next: (res) => {
                    if (res.status === 200) {
                        this.studentInfo = res.body;
                    }
                },
                error: (err) => {
                    this.matSnackBar.open('Invitation token is not valid', 'Ok', {
                        duration: 0,
                        panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                    });
                    this.router.navigate(['auth', 'login']);
                },
            });
        }
    }

    onRegister(registerFormValue) {
        let registerBody = registerFormValue;

        if (this.studentInfo) {
            registerBody = { ...registerBody, invitationToken: this.studentInfo.invitationToken };
        }

        this.userService
            .register(registerBody)
            .pipe(
                switchMap((result: any) => {
                    return this.userService.loginSuccess(result);
                }),
            )
            .subscribe({
                next: () => {
                    if (this.studentInfo) {
                        this.router.navigate(['/'], { queryParams: { student: true } });
                        return;
                    }
                    this.router.navigate(['/auth/select-plan'], { queryParams: { teacher: true } });
                },
                error: (err) => {
                    if (err?.length > 0) {
                        this.matSnackBar.open(err.join(' - '), 'Ok', {
                            duration: 0,
                            panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                        });
                    }
                    this.registerFailed = true;
                },
            });
    }
}
