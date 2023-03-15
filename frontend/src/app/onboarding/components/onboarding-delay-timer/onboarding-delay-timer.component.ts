import { IOnboardingDelay } from 'app/@core/models/onboarding.model';
import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';
import { interval, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'app-onboarding-delay-timer',
    templateUrl: './onboarding-delay-timer.component.html',
    styleUrls: ['./onboarding-delay-timer.component.scss'],
})
export class OnboardingDelayTimerComponent implements OnChanges, OnDestroy {
    @Input() delay: IOnboardingDelay;

    interval$: Observable<any>;

    private destroy$ = new Subject<void>();

    constructor(private onboardingFormService: OnboardingFormService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.delay.currentValue) {
            this.initDelay();
        }
    }

    ngOnDestroy() {
        this.emitDestroy();
    }

    emitDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    initDelay() {
        this.onboardingFormService.currentStep$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (stepIndex) => {
                if (this.delay?.index === stepIndex) {
                    this.interval$ = interval(1000).pipe(
                        takeUntil(this.destroy$),
                        map((interval) => {
                            const progress = (interval * 100) / (this.delay.time / 1000);
                            return progress;
                        }),
                        tap((progress) => {
                            if (progress > 100) {
                                this.onboardingFormService.emitDelay(this.delay);
                                this.emitDestroy();
                            }
                        }),
                    );
                }
            },
        });
    }
}
