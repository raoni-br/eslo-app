import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/@core/auth/guards/auth.guard';
import { FreeTrialGuard } from 'app/@core/auth/guards/free-trial.guard';
import { OnboardingCompletedGuard } from 'app/@core/auth/guards/onboarding-completed.guard';
import { RolesGuard } from 'app/@core/auth/guards/roles.guard';
import { SubscriptionGuard } from 'app/@core/auth/guards/subscription.guard';

import { AppShellComponent } from './app-shell.component';

const routes: Routes = [
    {
        path: '',
        component: AppShellComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard',
                loadChildren: () => import('../dashboard/dashboard.module').then((m) => m.DashboardModule),
                canActivate: [FreeTrialGuard, OnboardingCompletedGuard, SubscriptionGuard, RolesGuard],
                data: {
                    roles: ['teacher', 'student', 'admin'],
                },
            },
            {
                path: 'enrolled',
                loadChildren: () => import('../enrolled/enrolled.module').then((m) => m.EnrolledModule),
                canActivate: [FreeTrialGuard, SubscriptionGuard, RolesGuard],
                data: {
                    roles: ['student', 'admin'],
                },
            },
            {
                path: 'calendar',
                loadChildren: () => import('../calendar/calendar.module').then((m) => m.CalendarModule),
                canActivate: [FreeTrialGuard, OnboardingCompletedGuard, SubscriptionGuard, RolesGuard],
                data: {
                    roles: ['teacher', 'admin'],
                },
            },
            {
                path: 'lms',
                loadChildren: () => import('../lms/lms.module').then((m) => m.LMSModule),
                canActivate: [FreeTrialGuard, OnboardingCompletedGuard, SubscriptionGuard, RolesGuard],
                data: {
                    roles: ['teacher', 'admin'],
                },
            },
            {
                path: 'classroom',
                loadChildren: () => import('../classroom/classroom.module').then((m) => m.ClassroomModule),
                canActivate: [FreeTrialGuard, OnboardingCompletedGuard, SubscriptionGuard, RolesGuard],
                data: {
                    roles: ['teacher', 'admin'],
                },
            },
            {
                path: 'profile',
                loadChildren: () => import('../profile/profile.module').then((m) => m.ProfileModule),
                canActivate: [FreeTrialGuard, OnboardingCompletedGuard, AuthGuard],
            },
            {
                path: 'payment',
                loadChildren: () => import('../subscription/subscription.module').then((m) => m.SubscriptionModule),
                canActivate: [SubscriptionGuard, OnboardingCompletedGuard, RolesGuard],
                data: {
                    roles: ['teacher', 'admin'],
                },
            },
            {
                path: 'eslo-world',
                loadChildren: () => import('../eslo-world/eslo-world.module').then((m) => m.EsloWorldModule),
                canActivate: [FreeTrialGuard, AuthGuard],
            },
            {
                path: 'onboarding',
                loadChildren: () => import('../onboarding/onboarding.module').then((m) => m.OnboardingModule),
                canActivate: [FreeTrialGuard, AuthGuard],
            },
        ],
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class AppShellRoutingModule {}
