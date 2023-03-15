import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { accountPath, passwordPath } from '../../profile.module';

@Component({
    selector: 'app-user-page',
    templateUrl: 'user-page.component.html',
    styleUrls: ['./user-page.component.scss'],
})
export class UserPageComponent implements OnDestroy {
    links = [accountPath, passwordPath];
    activeLink: string;

    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: accountPath, icon: 'account_box' },
            { path: passwordPath, icon: 'lock_outline' },
        ],
    };

    private destroy$ = new Subject<void>();

    constructor(private router: Router) {
        // check path of current route to activate the right tab
        this.router.events
            .pipe(
                takeUntil(this.destroy$),
                filter((evt) => evt instanceof NavigationEnd),
            )
            .subscribe({
                next: ({ url }: NavigationEnd) => {
                    const currentPath = url.split('/').pop();
                    this.activeLink = this.links.find((link) => link === currentPath);
                },
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
