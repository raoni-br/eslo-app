/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SystemBannerComponent } from './system-banner.component';

describe('SystemBannerComponent', () => {
    let component: SystemBannerComponent;
    let fixture: ComponentFixture<SystemBannerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SystemBannerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SystemBannerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
