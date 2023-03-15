import { Component, Input } from '@angular/core';
import { UserService } from 'app/@core/services/user.service';

@Component({
    selector: 'app-onboarding-dialog-text',
    templateUrl: './onboarding-dialog-text.component.html',
    styleUrls: ['./onboarding-dialog-text.component.scss'],
})
export class OnboardingDialogTextComponent {
    @Input() text: string;
    user$ = this.userService.loggedUser;
    constructor(private userService: UserService) {}
}
