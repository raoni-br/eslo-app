/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AudioControlCardComponent } from './audio-control-card.component';

describe('AudioControlCardComponent', () => {
    let component: AudioControlCardComponent;
    let fixture: ComponentFixture<AudioControlCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AudioControlCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AudioControlCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
