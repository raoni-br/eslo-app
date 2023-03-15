import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LessonMidiaContentComponent } from './lesson-media-content.component';

describe('LessonLectureBookComponent', () => {
    let component: LessonMidiaContentComponent;
    let fixture: ComponentFixture<LessonMidiaContentComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [LessonMidiaContentComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LessonMidiaContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
