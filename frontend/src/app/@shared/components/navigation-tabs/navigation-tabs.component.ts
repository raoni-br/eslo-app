import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

export interface INavigationTabsPath {
    path: string;
    icon?: string;
    textIcon?: string;
    label?: string;
    layoutOnly?: boolean;
    queryParams?: Record<string, string>;
}

export interface INavigationTabsConfig {
    links: INavigationTabsPath[];
}

@Component({
    selector: 'app-navigation-tabs',
    templateUrl: './navigation-tabs.component.html',
    styleUrls: ['./navigation-tabs.component.scss'],
})
export class NavigationTabsComponent implements OnInit, OnDestroy {
    _navigationTabsConfig: INavigationTabsConfig;
    get navigationTabsConfig() {
        return this._navigationTabsConfig;
    }

    @Input() set navigationTabsConfig(value) {
        this._navigationTabsConfig = value;

        if (value) {
            this.updateNavigationTabsConfig();
        }
    }

    activePath: string;

    private destroy$ = new Subject<void>();

    constructor(private router: Router, private mediaObserver: MediaObserver) {}

    updateNavigationTabsConfig() {
        // check path of current route to activate the right tab
        this.router.events
            .pipe(
                takeUntil(this.destroy$),
                filter((evt) => evt instanceof NavigationEnd),
            )
            .subscribe({
                next: ({ url }: NavigationEnd) => {
                    this.checkRoute(url);
                },
            });
    }

    ngOnInit(): void {
        const url = this.router.url;
        this.checkRoute(url);
    }

    checkRoute(url: string) {
        const currentPath = url.split('/').pop();
        this.activePath = this.navigationTabsConfig.links.find(
            (link) => link.path.replace(/..\//g, '') === currentPath,
        )?.path;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get isGreaterThanMobile() {
        return this.mediaObserver.isActive('gt-xs');
    }
}
