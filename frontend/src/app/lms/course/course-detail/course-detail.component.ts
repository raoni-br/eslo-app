import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LMSService } from 'app/@core/services/lms.service';

import { Program } from 'app/@core/models/program.model';
import { Level } from 'app/@core/models/level.model';

@Component({
    selector: 'app-course-detail',
    templateUrl: './course-detail.component.html',
    styleUrls: ['./course-detail.component.scss'],
})
export class CourseDetailComponent implements OnDestroy {
    program: Program;
    levels: Level[];
    categories: string[];
    filteredLessons: any[];
    currentCategory: string;
    currentLevel: Level;
    searchTerm: string;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param _academyLessonsService
     */
    constructor(private activatedRoute: ActivatedRoute, private lmsService: LMSService) {
        // Set the defaults
        this.currentCategory = 'all';
        this.searchTerm = '';

        this.categories = ['all', 'GRAMMAR', 'LISTENING', 'SPEAKING', 'READING'];

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((params) => this.loadProgram(params['programId']));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private loadProgram(programId: string): void {
        this.lmsService
            .getProgram(programId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((program: Program) => {
                this.program = program;
                this.levels = [].concat(...this.program.modules.map((module) => module.levels));

                // select first level by default
                if (!this.currentLevel) {
                    // Assumes modules and levels are ordered by program/module order
                    if (this.program.modules && this.program.modules[0]?.levels) {
                        // this.currentLevel = this.program.modules[0].levels[0];
                        this.filterLessonsByLevel(0);
                    }
                }
            });
    }

    /**
     * Filter lessons according to selected category and level.
     * Also filters based on search term.
     */
    private consolidateLessonFilter(): void {
        if (!this.currentLevel) {
            return;
        }

        const searchTerm = this.searchTerm.toLowerCase();

        this.filteredLessons = this.currentLevel.lessons.filter(
            (lesson) =>
                (lesson.category === this.currentCategory || this.currentCategory === 'all') &&
                (lesson.title.toLowerCase().includes(searchTerm) ||
                    lesson.subject.toLowerCase().includes(searchTerm) ||
                    searchTerm === ''),
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    filterLessonsByLevel(tabIndex: number): void {
        if (!this.levels) {
            return;
        }

        this.currentLevel = this.levels[tabIndex];
        this.consolidateLessonFilter();
    }

    /**
     * Filter lessons by category
     *
     * @param category
     */
    public filterLessonsByCategory(category: string): void {
        this.currentCategory = category;
        this.consolidateLessonFilter();
    }

    /**
     * Filter lessons by term
     */
    public filterLessonsByTerm(): void {
        this.consolidateLessonFilter();
    }
}
