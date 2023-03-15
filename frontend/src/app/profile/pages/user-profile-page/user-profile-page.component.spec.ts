import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserProfilePageComponent } from './user-profile-page.component';

describe('UserProfilePageComponent', () => {
    let component: UserProfilePageComponent;
    let fixture: ComponentFixture<UserProfilePageComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [UserProfilePageComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(UserProfilePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
