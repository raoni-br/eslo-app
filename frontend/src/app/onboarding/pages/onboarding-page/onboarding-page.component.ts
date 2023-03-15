import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'app/@core/services/user.service';
import { OnboardingModalComponent } from 'app/onboarding/components/onboarding-modal/onboarding-modal.component';

@Component({
    selector: 'app-onboarding-page',
    templateUrl: './onboarding-page.component.html',
    styleUrls: ['./onboarding-page.component.scss'],
})
export class OnboardingPageComponent implements OnInit, OnDestroy {
    user$ = this.userService.loggedUser;

    onboardingModal: MatDialogRef<OnboardingModalComponent>;

    constructor(private userService: UserService, private dialog: MatDialog) {}

    ngOnInit() {
        this.openOnboarding();
    }

    ngOnDestroy() {
        if (this.onboardingModal) {
            this.onboardingModal.close();
        }
    }

    openOnboarding() {
        if (this.onboardingModal) {
            return;
        }

        this.onboardingModal = this.dialog.open(OnboardingModalComponent, {
            panelClass: 'onboarding-modal',
            hasBackdrop: false,
            disableClose: true,
        });
    }
}
