import { Component } from '@angular/core';
import { UserService } from 'app/@core/services/user.service';

@Component({
    selector: 'app-free-trial-ended-page',
    templateUrl: './free-trial-ended-page.component.html',
    styleUrls: ['./free-trial-ended-page.component.scss'],
})
export class FreeTrialEndedPageComponent {
    user$ = this.userService.loggedUser;

    constructor(private userService: UserService) {}
}
