/// <reference path="base.ts" />

module tui.widget {
	"use strict";

	export class Frame extends Widget {

		private _cache: {[index: string]: HTMLElement};

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
				if (tui.ieVer > 0)
					while (this._.children.length > 0) {
						this._.removeChild(this._.children[0]);
					}
				else
					this._.innerHTML = "";
				let page: HTMLElement = this._cache[key];
				this._.appendChild(page);
			} else {
				ajax.getBody(src).done((content) => {
					let page = browser.toElement(content, true);
					if (tui.ieVer > 0)
						while (this._.children.length > 0) {
							this._.removeChild(this._.children[0]);
						}
					else
						this._.innerHTML = "";
					this._.appendChild(page);
					if (cache) {
						this._cache[key] = page;
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