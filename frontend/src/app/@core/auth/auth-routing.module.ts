import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const authRoutes: Routes = [];

@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule],
    providers: [],
})
export class AuthRoutingModule {}
