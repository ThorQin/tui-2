/// <reference path="base.ts" />

module tui.widget {
	"use strict";

	export class Frame extends Widget {

		private _cache: {[index: string]: HTMLElement} = {};
		private _initialized: boolean = false;

		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"src": {
					"set": (value: any) => {
						this.go(value);
					}
				}
			});
		}

		private _go(src: string, cache: boolean = true, name?: string) {
			this._data["src"] = src;
			if (typeof name === UNDEFINED || name == null) {
				name = "";
			}
			var key = name + ":" + src;
			this._.innerHTML = "";
			if (cache && this._cache.hasOwnProperty(key)) {
				this._.appendChild(this._cache[key]);
			} else {
				this._initialized = false;
				ajax.getBody(src).done((content) => {
					var elem = browser.toElement(content, true);
					this._.appendChild(elem);
					this.render();
				});
			}
		}

		go(src: string, cache: boolean = true, name?: string) {
			this._go(src, cache, name);
			this.render();
		}

		render(): void {
			init(this._);
			if (!this._initialized) {
				this._initialized = true;
				this.fire("load");
			}
		}
	}
	register(Frame);
}