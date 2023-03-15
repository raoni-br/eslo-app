import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RolesGuard } from './@core/auth/guards/roles.guard';
import { SubscriptionGuard } from './@core/auth/guards/subscription.guard';

const appRoutes: Routes = [
    {
        path: '',
        loadChildren: () => import('./app-shell/app-shell.module').then((m) => m.AppShellModule),
    },
    {
        path: 'script/:lessonId',
        loadChildren: () =>
            import('./script-stand-alone/script-stand-alone.module').then((m) => m.ScriptStandAloneModule),
        canActivate: [SubscriptionGuard, RolesGuard],
        data: {
            roles: ['teacher', 'admin'],
        },
    },
    {
        path: 'auth',
        loadChildren: () => import('./authentication/authentication.module').then((m) => m.AuthenticationModule),
    },
    {
        path: 'invitation',
        loadChildren: () => import('./main/invitation/invitation.module').then((m) => m.InvitationModule),
    },
    {
        path: 'user-account',
        loadChildren: () => import('./main/user-account/user-account.module').then((m) => m.UserAccountModule),
    },
];
@NgModule({
    imports: [RouterModule.forRoot(appRoutes, { anchorScrolling: 'enabled' })],
    exports: [RouterModule],
    providers: [],
})
export class AppRoutingModule {}
