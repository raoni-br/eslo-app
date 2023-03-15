import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { ActivatedRoute } from '@angular/router';
import { LMSService } from 'app/@core/services/lms.service';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';

@Component({
    selector: 'app-lesson-script-page',
    templateUrl: './lesson-script-page.component.html',
    styleUrls: ['./lesson-script-page.component.scss'],
})
export class LessonScriptPageComponent {
    lesson$ = this.lmsService.getLesson(this.route.snapshot.params.lessonId);

    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: '../script', label: 'script', icon: 'description' },
            { path: '../class', label: 'lesson', icon: 'class' },
        ],
    };

    isFullscreen = false;

    constructor(
        private lmsService: LMSService,
        private route: ActivatedRoute,
        @Inject(DOCUMENT) private document: Document,
        private mediaObserver: MediaObserver,
    ) {}

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
