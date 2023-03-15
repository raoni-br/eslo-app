import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-onboarding-modal',
    templateUrl: './onboarding-modal.component.html',
    styleUrls: ['./onboarding-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingModalComponent implements OnInit, OnDestroy {
    animation: string;

    private destroy$ = new Subject<void>();
    constructor(
        private mediaObserver: MediaObserver,
        private onboardingFormService: OnboardingFormService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.onboardingFormService.animation$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (animation) => {
                this.animation = animation;
                const animationTimeout = setTimeout(() => {
                    this.cdr.markForCheck();
                    clearTimeout(animationTimeout);
                }, 0);
            },
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get isMobile(): boolean {
        return this.mediaObserver.isActive('xs');
    }
}
