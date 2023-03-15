import { Pipe, PipeTransform } from '@angular/core';

export const TEXT_REGEX = /\$\{(.*)\}/g;

@Pipe({
    name: 'onboardingReplaceText',
})
export class OnboardingReplaceTextPipe implements PipeTransform {
    transform(text: string, user?: any): string {
        let result: RegExpMatchArray;
        while (null != (result = TEXT_REGEX.exec(text))) {
            const tag: string = result[0];
            const value: string = result[1];
            const type = value.split('.')[0];
            let key = value.split('.')[1];

            switch (type) {
                case 'user':
                    key = key === 'primaryName' ? 'firstName' : key;
                    text = text.replace(tag, user?.[key]);
                    break;
            }
        }

        return text.replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/`/g, '');
    }
}
