import { Component, OnInit } from '@angular/core';
import { UserProfile } from 'app/@core/models/user-profile.model';
import { UserService } from 'app/@core/services/user.service';

@Component({
    selector: 'app-user-button',
    templateUrl: './user-button.component.html',
    styleUrls: ['./user-button.component.scss'],
})
export class UserButtonComponent implements OnInit {
    loggedUser: UserProfile;

    constructor(private userService: UserService) {}

    ngOnInit() {
        this.userService.loggedUser.subscribe((currentUser) => (this.loggedUser = currentUser));
    }

    logout() {
        this.userService.logout();
    }

    redirectToTermsPage(): void {
        window.open('http://eslo.com.br/termos-e-condicoes/', '_blank');
    }

    redirectToHelpPage(): void {
        window.open('http://eslo.com.br/help/', '_blank');
    }
}
