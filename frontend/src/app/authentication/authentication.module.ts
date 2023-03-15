import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/@shared/shared.module';
import { IConfig, NgxMaskModule } from 'ngx-mask';

import { CreateAccountFormComponent } from './components/create-account-form/create-account-form.component';
import { ForgotPasswordFormComponent } from './components/forgot-password-form/forgot-password-form.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { PlansListComponent } from './components/plans-list/plans-list.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { ResetPasswordFormComponent } from './components/reset-password-form/reset-password-form.component';
import { ConfirmEmailPageComponent } from './pages/confirm-email-page/confirm-email-page.component';
import { CreateAccountPageComponent } from './pages/create-account-page/create-account-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { SelectPlanPageComponent } from './pages/select-plan-page/select-plan-page.component';
import { SubscriptionActivePageComponent } from './pages/subscription-active-page/subscription-active-page.component';

const maskConfig: Partial<IConfig> = {
    validation: true,
};

const routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
        path: 'register',
        component: RegisterPageComponent,
    },
    {
        path: 'create-account',
        component: CreateAccountPageComponent,
    },

    {
        path: 'select-plan',
        component: SelectPlanPageComponent,
    },
    {
        path: 'subscription-canceled',
        component: SelectPlanPageComponent,
    },
    {
        path: 'subscription-active',
        component: SubscriptionActivePageComponent,
    },

    {
        path: 'login',
        component: LoginPageComponent,
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordPageComponent,
    },
    {
        path: 'reset-password/:resetPasswordToken',
        component: ResetPasswordPageComponent,
    },
    {
        path: 'confirm-email',
        component: ConfirmEmailPageComponent,
    },
];

@NgModule({
    declarations: [
        LoginPageComponent,
        LoginFormComponent,

        RegisterPageComponent,
        RegisterFormComponent,

        CreateAccountPageComponent,
        CreateAccountFormComponent,

        ForgotPasswordPageComponent,
        ForgotPasswordFormComponent,

        ResetPasswordPageComponent,
        ResetPasswordFormComponent,

        SelectPlanPageComponent,
        PlansListComponent,

        SubscriptionActivePageComponent,

        ConfirmEmailPageComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatCheckboxModule,
        MatSnackBarModule,
        MatDatepickerModule,
        MatCardModule,
        MatRadioModule,
        NgxMaskModule.forRoot(maskConfig),
        SharedModule,
    ],
})
export class AuthenticationModule {}
