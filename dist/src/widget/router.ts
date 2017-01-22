/// <reference path="base.ts" />

module tui.widget {
	"use strict";

	export class Page extends EventObject {
		address: string;
		state: string;
		script: string;
		cache: boolean;
		singleton: boolean;
		url: string[];
		body: HTMLElement;
	}

	export class Router extends Widget {

		private _randerState: string = null;

		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"state": {
					"set": (value: any) => {
						var pages: Page[] = this.get("pages");
						if (pages && pages.length > 0) {
							for (let p of pages) {
								if (p.state === value) {
									this._data["state"] = value;
									return;
								}
							}
						}
						this._data["state"] = null;
					}
				}, 
				"pages": {
					"set": (value: any) => {
						this._data["pages"] = value;
						this._set("state", this.get("state"));
					}
				}
			});
		}

		protected initChildren(childNodes: Node[]) {
			var pages: Page[] = [];
			function addChild(node: HTMLElement) {
				let item = new Item(node);
				let address = item.get("address");
				if (address === null)
					return;
				let state = item.get("state");
				if (state === null)
					return;
				let page: Page = new Page();
				page.address = address;
				page.state = state;
				page.cache = !!item.get("cache", true);
				page.singleton = !!item.get("singleton", true);
				page.script = item.get("script");
				page.state = item.get("state");
				let path = browser.getNodeOwnText(node).split("\n");
				path = path.map(function(p){return p.trim()}).filter(function(p){return p.length > 0;});
				page.url = path;
				pages.push(page);
			}
			for (let i = 0; i < childNodes.length; i++) {
				let node = childNodes[i];
				if (getFullName(node) === "tui:page") {
					addChild(<HTMLElement>node);
				}
			}
			this.set("pages", pages);
		}

		

		render(): void {
			var pages: Page[] = this.get("pages");
			var state = this.get("state");
			var defaultState = this.get("defaultState");
			if (state == null && defaultState != null) {
				this._set("state", defaultState);
				state = this.get("state");
			}
			if (this._randerState == state)
				return;
			this._randerState = state;
			this._.innerHTML = "";
			if (pages === null || state === null) {
				return;
			}
			for (var p of pages) {
				if (p.state === state) {
					if (p.body) {
						this._.appendChild(p.body);
						init(this._);
						this.fire("load", {init: false});
					} else {
						ajax.getBody(p.address).done((content) => {
							p.body = browser.toElement(content, true);
							this._.appendChild(p.body);
							init(this._);
							if (typeof p.script === "string") {
								ajax.getFunction(p.script.trim()).done((result) => {
									result.call(p);
									this.fire("load", {init: true});
								});
							} else
								this.fire("load", {init: true});
						});
					}
					break;
				}
			}
		}
	}
	register(Router);
}