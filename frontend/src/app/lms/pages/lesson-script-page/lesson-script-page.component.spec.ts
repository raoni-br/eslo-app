/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LessonScriptPageComponent } from './lesson-script-page.component';

describe('LessonScriptPageComponent', () => {
    let component: LessonScriptPageComponent;
    let fixture: ComponentFixture<LessonScriptPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LessonScriptPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LessonScriptPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
