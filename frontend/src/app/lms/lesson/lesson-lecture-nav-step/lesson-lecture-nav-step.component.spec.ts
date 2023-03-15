import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LessonLectureNavStepComponent } from './lesson-lecture-nav-step.component';

describe('LessonLectureNavStepComponent', () => {
    let component: LessonLectureNavStepComponent;
    let fixture: ComponentFixture<LessonLectureNavStepComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [LessonLectureNavStepComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LessonLectureNavStepComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
