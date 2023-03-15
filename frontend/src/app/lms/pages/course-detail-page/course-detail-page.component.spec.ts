/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CourseDetailPageComponent } from './course-detail-page.component';

describe('CourseDetailPageComponent', () => {
    let component: CourseDetailPageComponent;
    let fixture: ComponentFixture<CourseDetailPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CourseDetailPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CourseDetailPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
