import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LessonDetailComponent } from './lesson-detail.component';

describe('LessonDetailComponent', () => {
    let component: LessonDetailComponent;
    let fixture: ComponentFixture<LessonDetailComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [LessonDetailComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LessonDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
