import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CourseDetailComponent } from './course-detail.component';

describe('CourseDetailComponent', () => {
    let component: CourseDetailComponent;
    let fixture: ComponentFixture<CourseDetailComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [CourseDetailComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CourseDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
