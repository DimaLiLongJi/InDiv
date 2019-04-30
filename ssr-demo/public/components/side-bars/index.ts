// import './style.less';

import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestory, Input, ContentChild, ContentChildren, AfterMount, ChangeDetectionStrategy, MarkForCheck, TMarkForCheck } from '@indiv/core';
import { RouteChange, NvLocation } from '@indiv/router';

import { navs } from '../../constants/nav';

import TestService from '../../service/test.service';

type nav = {
    name: string;
    to: string;
    active?: string;
    child?: nav[];
};

@Component({
    selector: 'side-bar',
    // templateUrl: './template.html',
    templateUrl: './components/side-bars/template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export default class SideBar implements OnInit, AfterMount, RouteChange, OnDestory {
    public navs: nav[] = navs();
    public num: number = 1;
    public subscribeToken: Subscription;
    @Input() handleSideBar: () => void;
    @ContentChild('a') htmltemplateA: any;
    @ContentChildren('a') htmltemplateAs: any[];
    @MarkForCheck() marker: TMarkForCheck;

    constructor(
        private testS: TestService,
        private location: NvLocation,
    ) {
        this.subscribeToken = this.testS.subscribe(this.subscribe);
    }

    public subscribe(value: any) {
        console.log('RXJS value from SideBar', value);
    }

    public nvOnInit() {
        this.showColor();
        console.log('SideBar onInit', this.navs);
    }

    public nvAfterMount() {
        console.log('SideBar afterMount', this.htmltemplateA, this.htmltemplateAs);
    }

    public nvRouteChange(lastRoute?: string, newRoute?: string): void {
        this.showColor();
    }

    public nvOnDestory() {
        console.log('SideBar nvOnDestory');
        this.subscribeToken.unsubscribe();
    }

    public showColor() {
        const location = this.location.get();
        this.navs.forEach(nav => {
            nav.active = null;
            if (nav.to === location.path) nav.active = 'active';
            if (nav.child) {
                nav.child.forEach(n => {
                    n.active = null;
                    if (n.to === location.path) {
                        nav.active = 'active';
                        n.active = 'active';
                    }
                });
            }
        });
        this.marker().then(() => {
            console.log('渲染完成');
        });
    }

    public changeShowSideBar() {
        this.handleSideBar();
    }
}
