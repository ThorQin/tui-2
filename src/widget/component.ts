/// <reference path="base.ts" />
/// <reference path="../ajax.ts" />
module tui.widget {
	"use strict";

	export class Component extends Widget {
		
		private _initialized: boolean = false;

		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"controller": {
					"set": (value: any) => {
						this._data["controller"] = value;
						this._initialized = false;
					}
				},"template": {
					"set": (value: any) => {
						this._data["template"] = value;
						this._initialized = false;
						if (value != null) {
							value = (value + "").trim();
							ajax.getBody(value).done((result) => {
								this._.innerHTML = result;
								this.loadComponents();
								this.render();
							});
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
					if (widget) {
						name = tui.get(elem).get("name");
						if (typeof name === "string" && name.trim().length > 0)
							this._components[name] = elem;
					} else {
						name = elem.getAttribute("name");
						if (typeof name === "string" && name.trim().length > 0)
							this._components[name] = elem;
						if (!getFullName(elem).match(/^tui:/i))
							searchElem(<HTMLElement>node);
					}
				}
			};

			this._components = {'': this._};
			searchElem(this._);
		}

		protected initChildren(childNodes: Node[]) {
			if (this.get("template") == null) {
				childNodes.forEach(n => this._.appendChild(n));
				this.loadComponents();
			}
		}

		call(fn: (...arg: any[]) => void, desc?: string): void {
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
					var c: any = s ? this.getComponent(s.trim()) : null;
					if (c && c.__widget__)
						c = c.__widget__;
					return c;
				});
				fn.apply(this, argv);
			}
		}

		render(): void {
			init(this._);
			if (!this._initialized) {
				this._initialized = true;
				var script = this.get("controller");
				if (script != null) {
					script = (script + "").trim();
					ajax.getFunction(script).done((result) => {
						result.call(this);
						this.fire("load");
					});
				}
			}
		}
	}

	register(Component);

}