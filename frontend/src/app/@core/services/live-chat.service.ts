import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql } from 'apollo-angular';

interface ILiveChatTokenResult {
    liveChatToken: string;
}

@Injectable({
    providedIn: 'root',
})
export class LiveChatService {
    private zE: any;
    private currentRoute: string;
    private liveChatToken: string;

    /**
     * Live Chat Settings
     *  - only chat and contact form enabled
     *  - set authentication based on live chat token (from server)
     *  - offset live chat icon (very important om mobile)
     */
    private zESettings = {
        webWidget: {
            chat: { supress: false },
            contactForm: { suppress: false },
            helpCenter: { supress: true },
            talk: { supress: true },
            authenticate: {
                chat: {
                    jwtFn: (callback: Function) => {
                        if (this.liveChatToken) {
                            callback(this.liveChatToken);
                        }
                    },
                },
            },
            offset: {
                horizontal: '20px',
                vertical: '20px',
                mobile: {
                    horizontal: '0px',
                    vertical: '60px', // TODO: @Rodrigo check if we can calculate offset
                },
            },
        },
    };

    constructor(private router: Router, private apollo: Apollo) {
        this.zE = window['zE'];
        this.watchRoute();
    }

    private enableChat(): boolean {
        return (
            this.zE !== undefined && this.currentRoute !== undefined && ['/dashboard', '/'].includes(this.currentRoute)
        );
    }

    /**
     * Watch route and toggle live chat depending on route
     */
    private watchRoute(): void {
        this.router.events.subscribe({
            next: (event) => {
                if (event instanceof NavigationEnd) {
                    const { url } = event as NavigationEnd;

                    if (this.currentRoute !== url) {
                        this.currentRoute = url;
                        if (this.currentRoute) {
                            this.updateSettings();
                        }
                    }
                }
            },
        });
    }

    /**
     * This function is executed from user service when jwt is set (user logged in)
     */
    getLiveChatToken(): void {
        this.apollo
            .query({
                query: gql`
                    {
                        liveChatToken
                    }
                `,
            })
            .subscribe((result: ApolloQueryResult<ILiveChatTokenResult>) => {
                this.liveChatToken = result.data.liveChatToken;
                this.updateSettings();
            });
    }

    /**
     * update Live Chat settings (check zESettings)
     * TODO: error when hard reloading page after toggling chat. Steps to reproduce:
     *  - login and stay on dashboard; hit refresh. No error occurrs.
     *  - Hard reset the page. Error occurs.
     */
    private updateSettings(): void {
        this.zE = window['zE'];
        this.zE('webWidget', 'updateSettings', this.zESettings);

        if (typeof this.zE.show !== 'function') {
            return;
        }

        if (this.enableChat()) {
            this.zE.show();
        } else if (this.currentRoute) {
            this.zE.hide();
        }
    }
}
