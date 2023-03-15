import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';

import { PillTabComponent } from './pill-tab/pill-tab.component';

@Component({
    selector: 'app-pill-tabs',
    templateUrl: './pill-tabs.component.html',
    styleUrls: ['./pill-tabs.component.scss'],
})
export class PillTabsComponent implements AfterContentInit {
    @ContentChildren(PillTabComponent) tabs: QueryList<PillTabComponent>;

    // contentChildren are set
    ngAfterContentInit() {
        // get all active tabs
        let activeTabs = this.tabs.filter((tab) => tab.active);

        // if there is no active tab set, activate the first
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    selectTab(tab: any) {
        // deactivate all tabs
        this.tabs.toArray().forEach((tab) => (tab.active = false));

        // activate the tab the user has clicked on.
        tab.active = true;
    }
}
