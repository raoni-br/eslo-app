import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LessonListComponent } from './lesson-list.component';

describe('LessonListComponent', () => {
    let component: LessonListComponent;
    let fixture: ComponentFixture<LessonListComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [LessonListComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LessonListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
