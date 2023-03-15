import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import {
    MatMomentDateModule,
    MomentDateAdapter,
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';

import { NgxMaskModule, IConfig } from 'ngx-mask';

import { SharedModule } from 'app/@shared/shared.module';

import { UserProfilePageComponent } from './pages/user-profile-page/user-profile-page.component';
import { UserPageComponent } from './pages/user-page/user-page.component';
import { UserPasswordPageComponent } from './pages/user-password-page/user-password-page.component';
import { UserProfileFormComponent } from './components/user-profile-form/user-profile-form.component';

const maskConfig: Partial<IConfig> = {
    validation: true,
};

export const accountPath = 'account';
export const passwordPath = 'password';

const routes: Routes = [
    {
        path: '',
        component: UserPageComponent,
        children: [
            {
                path: accountPath,
                component: UserProfilePageComponent,
            },
            {
                path: passwordPath,
                component: UserPasswordPageComponent,
            },
        ],
    },
];

@NgModule({
    declarations: [UserProfilePageComponent, UserPageComponent, UserPasswordPageComponent, UserProfileFormComponent],
    imports: [
        RouterModule.forChild(routes),

        MatStepperModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatCardModule,

        NgxMaskModule.forRoot(maskConfig),

        SharedModule,
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        { provide: DateAdapter, useClass: MomentDateAdapter },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    ],
})
export class ProfileModule {}
