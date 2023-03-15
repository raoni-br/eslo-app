import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private themeSource = new BehaviorSubject<string>(localStorage.getItem('theme') || 'light-theme');
    theme$ = this.themeSource.asObservable();

    constructor(private overlayContainer: OverlayContainer) {
        this.initTheme();
    }

    initTheme() {
        const currentTheme = this.themeSource.getValue();
        this.changeTheme(currentTheme);
    }

    changeTheme(theme: string) {
        this.themeSource.next(theme);
        this.updateOverlay(theme);
        localStorage.setItem('theme', theme);
    }

    updateOverlay(theme: string) {
        const classList = this.overlayContainer.getContainerElement().classList;
        const toRemove = Array.from(classList).filter((item: string) => item.includes('-theme'));
        if (toRemove.length) {
            classList.remove(...toRemove);
        }
        classList.add(theme);
    }
}
