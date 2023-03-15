import { CdkStepper } from '@angular/cdk/stepper';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { ActivatedRoute } from '@angular/router';
import { LMSService } from 'app/@core/services/lms.service';
import { LayoutService } from 'app/layout/services/layout.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, withLatestFrom } from 'rxjs/operators';

@Component({
    selector: 'app-script-stand-alone-page',
    templateUrl: './script-stand-alone-page.component.html',
    styleUrls: ['./script-stand-alone-page.component.scss'],
})
export class ScriptStandAlonePageComponent implements OnInit, OnDestroy {
    lesson$ = this.lmsService.getLesson(this.route.snapshot.params.lessonId);

    isFullscreen = false;

    @ViewChild('stepper') stepper: CdkStepper;

    private destroy$ = new Subject<void>();

    constructor(
        private lmsService: LMSService,
        private route: ActivatedRoute,
        @Inject(DOCUMENT) private document: Document,
        private mediaObserver: MediaObserver,
        private layoutService: LayoutService,
    ) {}

    ngOnInit() {
        this.listenScroll();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    listenScroll() {
        this.layoutService.scroll$
            .pipe(takeUntil(this.destroy$), debounceTime(350), withLatestFrom(this.lesson$))
            .subscribe({
                next: ([evt, lesson]) => {
                    const isLastPage = this.stepper.selectedIndex === lesson.lessonMaterial.lectureScript.length - 1;

                    if (evt.target.scrollTop === evt.target.scrollHeight - evt.target.offsetHeight) {
                        this.stepper.next();

                        if (!isLastPage) {
                            evt.target.scrollTo(0, 50);
                        }
                    }

                    if (evt.target.scrollTop <= 0) {
                        const hasMorePages = this.stepper.selectedIndex !== 0;
                        if (hasMorePages) {
                            this.stepper.previous();
                        }
                    }
                },
            });
    }

    onFullscreen(imgElement: any) {
        const elem = imgElement || this.document.documentElement;

        if (!this.document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
                this.isFullscreen = true;
            }
        } else {
            if (this.document.exitFullscreen) {
                this.document.exitFullscreen();
                this.isFullscreen = false;
            }
        }
    }

    checkFullscreen() {
        if (this.isFullscreen) {
            this.document.exitFullscreen();
            this.isFullscreen = false;
        }
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
