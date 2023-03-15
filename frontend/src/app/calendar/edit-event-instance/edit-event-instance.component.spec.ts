import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditEventInstanceComponent } from './edit-event-instance.component';

describe('EditEventInstanceComponent', () => {
    let component: EditEventInstanceComponent;
    let fixture: ComponentFixture<EditEventInstanceComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [EditEventInstanceComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EditEventInstanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
