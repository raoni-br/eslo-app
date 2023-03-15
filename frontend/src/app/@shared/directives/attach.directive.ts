import { ApplicationRef } from '@angular/core';
import { Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { PortalService } from 'app/@shared/services/portal.service';

@Directive({ selector: '[tpAttach]' })
export class AttachDirective implements OnInit, OnDestroy {
    @Input('tpAttach') targetName: string;

    attachTimeout: NodeJS.Timeout;

    hasPreviousNavigation: boolean;

    constructor(private portalService: PortalService, private templateRef: TemplateRef<any>, private router: Router) {
        // a way to check if it's the first time that app loads
        this.hasPreviousNavigation = Boolean(this.router.getCurrentNavigation()?.previousNavigation);
    }

    ngOnInit(): void {
        this.attachWithTimeout();
    }

    private attach() {
        this.portalService.attach(this.targetName, this.templateRef);
    }

    private attachWithTimeout() {
        this.attachTimeout = setTimeout(() => {
            this.attach();
        }, 0);
    }

    ngOnDestroy(): void {
        this.portalService.clear(this.targetName);

        if (this.attachTimeout) {
            clearTimeout(this.attachTimeout);
        }
    }
}
