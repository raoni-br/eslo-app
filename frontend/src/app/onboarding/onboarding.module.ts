import { MatCheckboxModule } from '@angular/material/checkbox';
import { OnboardingFormContainerComponent } from './components/onboarding-form-container/onboarding-form-container.component';
import { OnboardingFormComponent } from './components/onboarding-form/onboarding-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingPageComponent } from './pages/onboarding-page/onboarding-page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/@shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { LesloComponent } from './components/leslo/leslo.component';
import { OnboardingDialogComponent } from './components/onboarding-dialog/onboarding-dialog.component';
import { OnboardingDialogBoxComponent } from './components/onboarding-dialog-box/onboarding-dialog-box.component';
import { OnboardingFormService } from './services/onboarding-form.service';
import { OnboardingButtonComponent } from './components/onboarding-button/onboarding-button.component';
import { OnboardingReplaceTextPipe } from './pipes/onboarding-replace-text.pipe';
import { OnboardingQuestionComponent } from './components/onboarding-question/onboarding-question.component';
import { OnboardingCheckboxComponent } from './components/onboarding-checkbox/onboarding-checkbox.component';
import { OnboardingInputComponent } from './components/onboarding-input/onboarding-input.component';
import { OnboardingRadioComponent } from './components/onboarding-radio/onboarding-radio.component';
import { OnboardingStepperComponent } from './components/onboarding-stepper/onboarding-stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { OnboardingDialogTextComponent } from './components/onboarding-dialog-text/onboarding-dialog-text.component';
import { OnboardingDelayTimerComponent } from './components/onboarding-delay-timer/onboarding-delay-timer.component';
import { OnboardingModalComponent } from './components/onboarding-modal/onboarding-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { OnboardingButtonRequiredPipe } from './pipes/onboarding-button-required.pipe';

const routes: Routes = [
    {
        path: '',
        component: OnboardingPageComponent,
    },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        CdkStepperModule,
        MatCheckboxModule,
        MatDialogModule,
        SharedModule,
    ],
    declarations: [
        // Pages
        OnboardingPageComponent,
        // Components
        LesloComponent,
        OnboardingFormComponent,
        OnboardingFormContainerComponent,
        OnboardingDialogComponent,
        OnboardingDialogBoxComponent,
        OnboardingDialogTextComponent,
        OnboardingButtonComponent,
        OnboardingQuestionComponent,
        OnboardingRadioComponent,
        OnboardingInputComponent,
        OnboardingCheckboxComponent,
        OnboardingStepperComponent,
        OnboardingDelayTimerComponent,
        OnboardingModalComponent,
        // Pipes
        OnboardingReplaceTextPipe,
        OnboardingButtonRequiredPipe,
    ],
    providers: [OnboardingFormService],
})
export class OnboardingModule {}
