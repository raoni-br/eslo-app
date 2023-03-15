import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutModule } from 'app/layout/layout.module';
import { AppShellRoutingModule } from './app-shell-routing.module';
import { AppShellComponent } from './app-shell.component';

@NgModule({
    imports: [CommonModule, AppShellRoutingModule, LayoutModule],
    exports: [],
    declarations: [AppShellComponent],
    providers: [],
})
export class AppShellModule {}
