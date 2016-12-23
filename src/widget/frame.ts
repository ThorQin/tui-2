/// <reference path="base.ts" />

module tui.widget {
	"use strict";

	export class Frame extends Widget {

		private _cache: {[index: string]: HTMLCollection};

		protected initRestriction(): void {
			this._cache = {};
			super.initRestriction();
			this.setRestrictions({
				"src": {
					"set": (value: any) => {
						this._go(value);
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
			if (cache && this._cache.hasOwnProperty(key)) {
				this._.innerHTML = "";
				var children: HTMLCollection = this._cache[key];
				for (let i = 0; i < children.length; i++) {
					this._.appendChild(children[i]);
				}
			} else {
				ajax.getBody(src).done((content) => {
					this._.innerHTML = content;
					if (cache) {
						this._cache[key] = this._.children;
					}
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
		}
	}
	register(Frame);
}