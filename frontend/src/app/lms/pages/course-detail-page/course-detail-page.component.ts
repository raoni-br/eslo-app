import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lesson } from 'app/@core/models/lesson.model';
import { LMSService } from 'app/@core/services/lms.service';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'app-course-detail-page',
    templateUrl: './course-detail-page.component.html',
    styleUrls: ['./course-detail-page.component.scss'],
})
export class CourseDetailPageComponent implements OnInit, OnDestroy {
    navigationTabsConfig: INavigationTabsConfig = {
        links: [],
    };

    levels: any[];

    currentLevel: any;

    course$ = this.lmsService.getProgram(this.route.snapshot.params.courseId).pipe(
        tap({
            next: (program) => {
                this.levels = [].concat(...program.modules.map((module) => module.levels));

                this.navigationTabsConfig.links = this.levels.map((level) => {
                    const [levelCode, _] = level.name.split(' - ');
                    return {
                        path: './',
                        queryParams: {
                            level: levelCode,
                        },
                        textIcon: levelCode,
                        label: level.label,
                    };
                });
            },
        }),
    );

    private destroy$ = new Subject<void>();

    constructor(private route: ActivatedRoute, private lmsService: LMSService, private router: Router) {}

    ngOnInit() {
        this.checkCurrentLevel();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    checkCurrentLevel() {
        /* 'combineLatest' is used to wait for course to be loaded
         to filter the levels array */
        combineLatest([this.route.queryParamMap, this.course$])
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ([queryParamMap, _]) => {
                    const levelQuery = queryParamMap.get('level');
                    this.currentLevel = this.levels.find((level) => {
                        const levelCode = level?.code.split('-').pop();
                        return levelCode === levelQuery;
                    });

                    // set the first level if doesn't have any query param
                    if (!this.currentLevel) {
                        const firstLevelLink = [...this.navigationTabsConfig.links].shift();
                        this.router.navigate([], {
                            relativeTo: this.route,
                            queryParams: firstLevelLink.queryParams,
                            queryParamsHandling: 'merge',
                        });
                    }
                },
            });
    }

    goToLesson(lesson: Lesson): void {
        this.router.navigate(['lms', 'lessons', lesson.id, 'script']);
    }
}
