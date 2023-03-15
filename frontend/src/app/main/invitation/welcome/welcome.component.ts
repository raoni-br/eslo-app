import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { ModalTermsConditionsComponent } from './modal-terms-conditions/modal-terms-conditions.component';
import { WelcomeService } from './welcome.service';
import { UserService } from 'app/@core/services/user.service';
import { MediaObserver } from '@angular/flex-layout';

@Component({
    selector: 'invitation-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit, OnDestroy {
    invitationForm: FormGroup;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _formBuilder: FormBuilder,
        private router: Router,
        private Dialog: MatDialog,
        private _welcomeService: WelcomeService,
        private userService: UserService,
        private mediaObserver: MediaObserver,
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.invitationForm = this._formBuilder.group({
            terms: ['', Validators.requiredTrue],
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    showDialogTermsAndConditions(): void {
        this.Dialog.open(ModalTermsConditionsComponent);
    }

    acceptInvitation(): void {
        this._welcomeService.invitationRequest('confirm').subscribe(
            (res) => {
                const { invitationToken } = res.body;
                this.userService.setStudentInfoForCreatePassword(res.body);
                if (res.status === 200) {
                    this.router.navigate(['/auth/register'], { queryParams: { invitationToken } });
                }
            },
            (err) => {
                const status = 'failed';
                this.router.navigate(['/invitation/message', status]);
            },
        );
    }

    refuseInvitation(): void {
        this._welcomeService.invitationRequest('decline').subscribe(
            (res) => {
                const status = 'rejected';
                if (res.status === 200) {
                    this.router.navigate(['/invitation/message', status]);
                }
            },
            (err) => {
                const status = 'failed';
                this.router.navigate(['/invitation/message', status]);
            },
        );
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
