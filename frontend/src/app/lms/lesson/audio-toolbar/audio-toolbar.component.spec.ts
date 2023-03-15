import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AudioToolbarComponent } from './audio-toolbar.component';

describe('AudioToolbarComponent', () => {
    let component: AudioToolbarComponent;
    let fixture: ComponentFixture<AudioToolbarComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [AudioToolbarComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AudioToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
