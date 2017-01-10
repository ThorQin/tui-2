/// <reference path="base.ts" />
/// <reference path="../ajax/ajax.ts" />
/// <reference path="../service/service.ts" />

module tui.widget {
	"use strict";

	export class Component extends Widget {
		
		private _scriptReady: boolean;
		private _htmlReady: boolean;
		private _childrenInit: boolean;
		private _fn: () => void;
		private _changed: boolean;
		private _noReadyCount: number;

		private checkReady() {
			var hasHandler = !!this.get("handler");
			var hasSrc = !!this.get("src");
			if ((!hasHandler || hasHandler && this._scriptReady)
				&& (!hasSrc || hasSrc && this._htmlReady)
				&& this._changed 
				&& this._childrenInit
				&& this._noReadyCount <= 0) {
				this._changed = false;
				if (this._fn) {
					try {
						this._fn.call(this);
					} finally {
						this._fn = null;
					}
				}
				this.fire("load");
				var parent = this.get("parent");
				parent && parent.fire("componentReady", {name: this.get("name")});
			}
		}

		protected initRestriction(): void {
			this._fn = null;
			this._changed = true;
			this._noReadyCount = 0;
			this._childrenInit = false;
			this._scriptReady = false;
			this._htmlReady = false;


			this.on("componentReady", (e:any) => {
				this._noReadyCount--;
				this.checkReady();
			});

			super.initRestriction();
			this.setRestrictions({
				"handler": {
					"set": (value: any) => {
						let oldValue = this._data["handler"];
						if (value && (value + "").trim().length > 0) {
							value = (value + "").trim();
							if (oldValue != value)
								this._changed = true;
							this._data["handler"] = value;
							this._fn = null;
							this._scriptReady = false;
							ajax.getFunction(value).done((result) => {
								this._fn = result;
								this._scriptReady = true;
								this.checkReady();
							}).fail(() => {
								this._scriptReady = true;
								this.checkReady();
							});
						} else {
							if (oldValue)
								this._changed = true;
							delete this._data["handler"];
							this._scriptReady = true;
							this._fn = null;
							this.checkReady();
						}
					}
				},"src": {
					"set": (value: any) => {
						let oldValue = this._data["src"];
						
						if (value && (value + "").trim().length > 0) {
							value = (value + "").trim();
							this._data["src"] = value;
							this._htmlReady = false;
							this._childrenInit = false;
							ajax.getComponent(this.get("url")).done((result, handler) => {
								this._htmlReady = true;
								this._.innerHTML = result;
								this.loadComponents();
								handler && this.set("handler", handler);
								this.render();
								this.checkReady();
							}).fail(() => {
								this._htmlReady = true;
								this.checkReady();
							});
						} else {
							if (oldValue)
								this._changed = true;
							delete this._data["src"];
							this._htmlReady = true;
							this.checkReady();
						}
					}
				}, "url": {
					"get": () => {
						var parentUrl = this.getParentUrl();
						var path = this.get("src");
						if (!path)
							return parentUrl;
						else {
							if (text.isAbsUrl(path))
								return path;
							else
								return text.joinUrl(text.getBaseUrl(parentUrl), path);
						}
					}
				}
			});
		}

		private getParentUrl() {
			let elem = this._.parentNode;
			while (elem) {
				if ((<any>elem).__widget__ && (<any>elem).__widget__.getNodeName() === "component") {
					return (<any>elem).__widget__.get("url");
				} else {
					elem = elem.parentNode;
				}
			}
			return location.href;
		}

		private loadComponents() {
			let searchElem = (parent: HTMLElement) => {
				for (let i = 0; i < parent.childNodes.length; i++) {
					let node: Node = parent.childNodes[i];
					if (node.nodeType !== 1) { // Is not an element
						continue;
					}
					let elem = <HTMLElement>node;
					let widget = (<any>elem).__widget__; 
					let name: string;
					let fullName = getFullName(elem);
					if (fullName === "tui:component")
						this._noReadyCount++;
					if (widget) {
						name = tui.get(elem).get("name");
						if (typeof name === "string" && name.trim().length > 0)
							this._components[name] = elem;
					} else {
						name = elem.getAttribute("name");
						if (typeof name === "string" && name.trim().length > 0)
							this._components[name] = elem;
						if (!fullName.match(/^tui:/i) || fullName.match(/^tui:(input-group|group|button-group)$/))
							searchElem(<HTMLElement>node);
					}
				}
			};

			this._components = {'': this._};
			this._noReadyCount = 0;
			searchElem(this._);
			this._childrenInit = true;
		}

		protected initChildren(childNodes: Node[]) {
			if (this.get("src") == null) {
				childNodes.forEach(n => this._.appendChild(n));
				this.loadComponents();
				this.checkReady();
			}
		}

		use(fn: (...arg: any[]) => void, desc?: string): void {
			if (typeof fn === "function") {
				var params = service.parseParameters(fn, desc);
				var argv = params.split(",").map((s) => {
					if (!s)
						return null;
					else if (s[0] === '$') {
						return tui.service.get(s.substr(1));
					} else {
						var c: any = this.getComponent(s.trim());
						if (c && c.__widget__)
							c = c.__widget__;
						return c;
					}
				});
				fn.apply(this, argv);
			}
		}

		render(): void {
			init(this._);
		}
	}

	register(Component);

}