import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LMSService } from 'app/@core/services/lms.service';

@Component({
    selector: 'app-courses-page',
    templateUrl: './courses-page.component.html',
    styleUrls: ['./courses-page.component.scss'],
})
export class CoursesPageComponent {
    courses$ = this.lmsService.getPrograms();

    constructor(private lmsService: LMSService, private router: Router, private route: ActivatedRoute) {}

    onCourseDetail(courseId: string) {
        this.router.navigate([courseId], { relativeTo: this.route });
    }
}
