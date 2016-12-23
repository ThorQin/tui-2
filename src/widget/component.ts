/// <reference path="base.ts" />
/// <reference path="../ajax/ajax.ts" />
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
			var hasController = !!this.get("controller");
			var hasTemplate = !!this.get("template");
			if ((!hasController || hasController && this._scriptReady)
				&& (!hasTemplate || hasTemplate && this._htmlReady)
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
				console.log("on load ..." + this.get("name"));
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
				console.log("componentReady ...." + e.data.name);
				this._noReadyCount--;
				this.checkReady();
			});

			super.initRestriction();
			this.setRestrictions({
				"controller": {
					"set": (value: any) => {
						let oldValue = this._data["controller"];
						if (value && (value + "").trim().length > 0) {
							value = (value + "").trim();
							if (oldValue != value)
								this._changed = true;
							this._data["controller"] = value;
							this._fn = null;
							this._scriptReady = false;
							ajax.getFunction(value).done((result) => {
								console.log("script ready..." + this.get("name"));
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
							delete this._data["controller"];
							this._scriptReady = true;
							this._fn = null;
							this.checkReady();
						}
					}
				},"template": {
					"set": (value: any) => {
						let oldValue = this._data["template"];
						
						if (value && (value + "").trim().length > 0) {
							value = (value + "").trim();
							this._data["template"] = value;
							this._htmlReady = false;
							this._childrenInit = false;
							ajax.getBody(value).done((result) => {
								console.log("html ready..." + this.get("name"));
								this._htmlReady = true;
								this._.innerHTML = result;
								this.loadComponents();
								this.render();
								this.checkReady();
							}).fail(() => {
								this._htmlReady = true;
								this.checkReady();
							});
						} else {
							if (oldValue)
								this._changed = true;
							delete this._data["template"];
							this._htmlReady = true;
							this.checkReady();
						}
					}
				},
			});
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
						if (!fullName.match(/^tui:/i))
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
			if (this.get("template") == null) {
				childNodes.forEach(n => this._.appendChild(n));
				this.loadComponents();
				this.checkReady();
			}
		}

		use(fn: (...arg: any[]) => void, desc?: string): void {
			if (typeof fn === "function") {
				var params = "";
				if (desc)
					params = desc + "";
				else {
					var matched = fn.toString().match(/^\s*function\s*[a-zA-Z0-9_]*\s*\(([\sa-zA-Z0-9,_\$]*)\)/m);
					if (matched) {
						params = matched[1];
					} else {
						matched = fn.toString().match(/^\s*\(([\sa-zA-Z0-9,_\$]*)\)\s*=>/);
						if (matched)
							params = matched[1];
					}
				}
				var argv = (params || "").split(",").map((s) => {
					if (!s)
						return null;
					else if (s[0] === '$') {
						return tui.service.get(s);
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