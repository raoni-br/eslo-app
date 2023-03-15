import { PROPERTY_TYPE } from 'app/@core/models/onboarding.model';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'onboardingButtonRequired',
    pure: false,
})
export class OnboardingButtonRequiredPipe implements PipeTransform {
    transform(property: any, args?: any[]): any {
        const [viewModel, button] = args;

        const isRequiredAndIsNext = property.required && button.action === 'next';

        if (property.type === PROPERTY_TYPE.CHECKBOX) {
            const hasNoneChecked = Object.values(viewModel[property.key]).every((value) => !value);
            return hasNoneChecked && isRequiredAndIsNext;
        }

        return !viewModel[property.key] && isRequiredAndIsNext;
    }
}
