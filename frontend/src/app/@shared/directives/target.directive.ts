import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { PortalService } from '../services/portal.service';

@Directive({
    selector: '[tpTarget]',
})
export class TargetDirective implements OnInit {
    @Input('tpTarget') targetName: string;

    constructor(private portalService: PortalService, private viewContainer: ViewContainerRef) {
        this.portalService.addTarget(this.targetName, this.viewContainer);
    }

    ngOnInit(): void {
        this.portalService.addTarget(this.targetName, this.viewContainer);
    }
}
