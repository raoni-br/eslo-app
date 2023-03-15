import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { TransferService } from './transfer.service';
import { ModalTermsConditionsComponent } from '../welcome/modal-terms-conditions/modal-terms-conditions.component';
import { MediaObserver } from '@angular/flex-layout';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.scss'],
})
export class TransferComponent implements OnInit, OnDestroy {
    invitationForm: FormGroup;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _formBuilder: FormBuilder,
        private router: Router,
        private Dialog: MatDialog,
        private transferService: TransferService,
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
        this.transferService.invitationRequest('confirm').subscribe(
            (res) => {
                const status = 'accepted';
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

    refuseInvitation(): void {
        this.transferService.invitationRequest('decline').subscribe(
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
