import { NgModule } from '@angular/core';
import { ConfirmRegistrationComponent } from './confirm-registration/confirm-registration.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/@shared/shared.module';

const userAccountRoutes = [
    {
        path: 'confirm-email/:registrationToken',
        component: ConfirmRegistrationComponent,
    },
];

@NgModule({
    declarations: [ConfirmRegistrationComponent],
    imports: [RouterModule.forChild(userAccountRoutes), SharedModule],
})
export class UserAccountModule {}
