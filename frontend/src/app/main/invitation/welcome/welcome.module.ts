import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';

import { WelcomeComponent } from './welcome.component';
import { WelcomeService } from './welcome.service';

import { ModalTermsConditionsComponent } from './modal-terms-conditions/modal-terms-conditions.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'app/@shared/shared.module';

const routes = [
    {
        path: 'welcome/:invitationToken',
        component: WelcomeComponent,
        resolve: {
            invitation: WelcomeService,
        },
    },
];

@NgModule({
    declarations: [WelcomeComponent, ModalTermsConditionsComponent],
    imports: [RouterModule.forChild(routes), MatCheckboxModule, MatDialogModule, ReactiveFormsModule, SharedModule],
    providers: [WelcomeService],
})
export class WelcomeModule {}
