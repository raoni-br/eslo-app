/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UserProfileFormComponent } from './user-profile-form.component';

describe('UserProfileFormComponent', () => {
    let component: UserProfileFormComponent;
    let fixture: ComponentFixture<UserProfileFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserProfileFormComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserProfileFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
