import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'invitation-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit, OnDestroy {
    private sub: any;
    status: string;
    title: string;
    subtitle: string;
    icon: string;

    constructor(private route: ActivatedRoute, private mediaObserver: MediaObserver) {
        // Initialize variables
        this.status = '';
        this.title = '';
        this.subtitle = '';
        this.icon = '';
    }

    ngOnInit(): void {
        this.sub = this.route.params.subscribe((params) => {
            this.status = params.status;
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
