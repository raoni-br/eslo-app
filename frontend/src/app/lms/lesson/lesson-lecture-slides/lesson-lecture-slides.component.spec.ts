import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LessonLectureSlidesComponent } from './lesson-lecture-slides.component';

describe('LessonLectureSlidesComponent', () => {
    let component: LessonLectureSlidesComponent;
    let fixture: ComponentFixture<LessonLectureSlidesComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [LessonLectureSlidesComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LessonLectureSlidesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
