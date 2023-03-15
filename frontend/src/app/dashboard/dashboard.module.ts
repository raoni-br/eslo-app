import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { SharedModule } from 'app/@shared/shared.module';
import { TeacherDashboardCardComponent } from './components/teacher-dashboard-card/teacher-dashboard-card.component';

const routes = [
    {
        path: '',
        component: DashboardPageComponent,
    },
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
    declarations: [DashboardPageComponent, TeacherDashboardCardComponent],
})
export class DashboardModule {}
