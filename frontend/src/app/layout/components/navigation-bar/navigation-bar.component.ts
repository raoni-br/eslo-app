import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { Component } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-navigation-bar',
    templateUrl: 'navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss'],
})
export class NavigationBarComponent implements OnChanges {
    isOpen = false;

    @Input() links: any[];
    leftLinks: any[] = [];
    rightLinks: any[] = [];
    menuLinks: any[] = [];
    openFromButton = false;

    @Input() hasAdminRole: boolean;
    @Input() hasTeacherRole: boolean;
    @Input() hasStudentRole: boolean;

    @Input() activeLink: string;

    constructor(private mediaObserver: MediaObserver, private router: Router, private route: ActivatedRoute) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['links']?.currentValue) {
            this.links.forEach((link) => {
                const position = link.position;
                if (position === 'left') {
                    this.leftLinks.push(link);
                } else if (position === 'right') {
                    this.rightLinks.push(link);
                } else if (position === 'menu') {
                    this.menuLinks.push(link);
                }
            });
        }
    }

    onClickedOutside() {
        this.isOpen = false;
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }

    getIsLinkActive(path: string) {
        return this.router.isActive(path, {
            paths: 'subset',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored',
        });
    }
}
