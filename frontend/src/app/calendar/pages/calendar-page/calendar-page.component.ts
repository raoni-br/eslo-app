import { WeeklyAvailabilityComponent } from './../../../@shared/components/calendar/weekly-availability/weekly-availability.component';
import { Component, OnDestroy } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { NavigationEnd, Router } from '@angular/router';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-calendar-page',
    templateUrl: './calendar-page.component.html',
    styleUrls: ['./calendar-page.component.scss'],
})
export class CalendarPageComponent implements OnDestroy {
    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: 'month', icon: 'event_note' },
            { path: 'availability', icon: 'group' },
        ],
    };

    private destroy$ = new Subject<void>();

    constructor(private mediaObserver: MediaObserver, private router: Router, private dialog: MatDialog) {
        this.router.events
            .pipe(
                takeUntil(this.destroy$),
                filter((evt) => evt instanceof NavigationEnd),
            )
            .subscribe({
                next: ({ url }: NavigationEnd) => {
                    if (url === '/calendar' && this.isMobile) {
                        this.router.navigate(['/calendar/month']);
                    }
                },
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openAvailabilityDialog(): void {
        this.dialog.open(WeeklyAvailabilityComponent, {
            // minWidth: '400px',
            // height: 'auto',
            panelClass: 'weekly-availability-dialog',
        });
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
