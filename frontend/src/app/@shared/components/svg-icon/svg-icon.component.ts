import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-svg-icon',
    templateUrl: './svg-icon.component.html',
    styleUrls: ['./svg-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgIconComponent implements OnInit {
    @Input() svg: string;
    @Input() fill: string;
    @Input() stroke: string;
    @Input() style: string;

    svgSafeHtml: SafeHtml;

    constructor(private sanitizer: DomSanitizer, private http: HttpClient, private cdr: ChangeDetectorRef) {}

    ngOnInit() {
        this.http.get(`../../../..${this.svg}`, { responseType: 'text' }).subscribe((logo) => {
            // check fill or stroke with regex to check in between quotes
            logo = logo.replace(/fill=(["'])(?:\\.|[^\\])*?\1/g, `fill="${this.fill}"`);
            logo = logo.replace(/stroke=(["'])(?:\\.|[^\\])*?\1/g, `stroke="${this.stroke}"`);

            // inject style in svg tag -> '<svg :style ...'
            logo = logo.slice(0, 5) + `style="${this.style}" ` + logo.slice(5);

            this.svgSafeHtml = this.sanitizer.bypassSecurityTrustHtml(logo);
            this.cdr.markForCheck();
        });
    }
}
