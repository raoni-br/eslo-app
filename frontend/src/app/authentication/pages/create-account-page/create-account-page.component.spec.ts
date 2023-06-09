/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CreateAccountPageComponent } from './create-account-page.component';

describe('CreateAccountPageComponent', () => {
    let component: CreateAccountPageComponent;
    let fixture: ComponentFixture<CreateAccountPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CreateAccountPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateAccountPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
