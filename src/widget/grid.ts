/// <reference path="base.ts" />

module tui.widget {
	"use strict";

	export class Grid extends Widget {
		
		private _lineHeight: number = 26;
		
		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"data": {
					"set": (value: any) => {
						if (value instanceof ds.List ||
							value instanceof ds.RemoteList ||
							value instanceof ds.Tree ||
							value instanceof ds.RemoteTree)
							this._data["data"] = value;
						else if (value instanceof Array) {
							this._data["data"] = new ds.List(value);
						}
						get(this._components["vScroll"])._set("value", 0);
						get(this._components["hScroll"])._set("value", 0);
					},
					"get": (): any => {
						var data = this._data["data"];
						if (data)
							return data;
						else
							return new ds.List([]);
					}
				},
				"list": {
					"set": (value: any) => {
						if (value instanceof ds.List ||
							value instanceof ds.RemoteList)
							this._data["data"] = value;
						else if (value instanceof Array) {
							this._data["data"] = new ds.List(value);
						}
						get(this._components["vScroll"])._set("value", 0);
						get(this._components["hScroll"])._set("value", 0);
					},
					"get": (): any => {}
				},
				"tree": {
					"set": (value: any) => {
						if (value instanceof ds.Tree ||
							value instanceof ds.RemoteTree)
							this._data["data"] = value;
						else if (value instanceof Array) {
							this._data["data"] = new ds.Tree(value);
						}
						get(this._components["vScroll"])._set("value", 0);
						get(this._components["hScroll"])._set("value", 0);
					},
					"get": (): any => {}
				},
				"scrollTop": {
					"set": (value: any) => {
						get(this._components["vScroll"])._set("value", value);
					},
					"get": (): any => {
						return get(this._components["vScroll"]).get("value");
					}
				},
				"scrollLeft": {
					"set": (value: any) => {
						get(this._components["hScroll"])._set("value", value);
					},
					"get": (): any => {
						return get(this._components["hScroll"]).get("value");
					}
				}
			});
		}

		protected init(): void {
			$(this._).attr({"tabIndex": 0, "unselectable": "on"});
			this._.innerHTML = "<div class='tui-grid-head'></div><div class='tui-content'></div>";
			var head = this._components["head"] = $(this._).children(".tui-grid-head")[0];
			var content = this._components["content"] = $(this._).children(".tui-content")[0];
			var hbar = <Scrollbar>tui.create("scrollbar", {direction: "horizontal"});
			this._components["hScroll"] = hbar.appendTo(this._, false)._;
			var vbar = <Scrollbar>tui.create("scrollbar");
			this._components["vScroll"] = vbar.appendTo(this._, false)._;
			
			var testDiv = browser.toElement("<div class='tui-grid-test'>test</div>")
			document.body.appendChild(testDiv);
			this._lineHeight = testDiv.offsetHeight;
			document.body.removeChild(testDiv);
			
			this.setInit("header", true);
			
			this.on("resize", () => {
				this.render();
			});
		}
		
		private computeWidth(): number {
			return 1000;
		}
		
		private computeScroll() {
			var vScroll = get(this._components["vScroll"]);
			$(vScroll._).addClass("tui-hidden");
			var vEnable = false;
			var hScroll = get(this._components["hScroll"]);
			$(hScroll._).addClass("tui-hidden");
			var hEnable = false;
			var clientWidth = this._.clientWidth;
			var clientHeight = this._.clientHeight;
			var data = <ds.DS>this.get("data");
			var contentHeight = data.length() * this._lineHeight + (this.get("header") ? this._lineHeight : 0);
			var contentWidth = this.get("autoWidth") ? 0 : this.computeWidth();
			
			var computeV = (first: boolean) => {
				var shouldEnable = contentHeight > clientHeight;
				if (shouldEnable) {
					$(vScroll._).removeClass("tui-hidden");
					var scrollHeight = hEnable ? clientHeight - hScroll._.offsetHeight : clientHeight;
					vScroll._.style.height = scrollHeight + "px";
					vScroll._set("total", contentHeight - clientHeight);
					vScroll.set("page", clientHeight / contentHeight * (contentHeight - clientHeight));
				}
				if (vEnable !== shouldEnable) {
					vEnable = shouldEnable;
					if (!first)
						computeH();
				}
			};
			
			var computeH = () => {
				var shouldEnable = (this.get("autoWidth") ? false : contentWidth > clientWidth);
				if (shouldEnable) {
					$(hScroll._).removeClass("tui-hidden");
					var scrollWidth = vEnable ? clientWidth - vScroll._.offsetWidth : clientWidth;
					hScroll._.style.width = scrollWidth + "px";
					hScroll._set("total", contentWidth - clientWidth);
					hScroll.set("page", clientWidth / contentWidth * (contentWidth - clientWidth));
				}
				if (hEnable !== shouldEnable) {
					hEnable = shouldEnable;
					computeV(false);
				}
			};
			
			computeV(true);
			computeH();
			var head = this._components["head"];
			var content = this._components["content"];
			if (this.get("header")) {
				head.style.display = "block";
				head.style.width = (vEnable ? clientWidth - vScroll._.offsetWidth : clientWidth) + "px";
			} else {
				head.style.display = "none";
			}
			content.style.width = (vEnable ? clientWidth - vScroll._.offsetWidth : clientWidth) + "px";
			content.style.height = (hEnable ? clientHeight - hScroll._.offsetHeight : clientHeight) + "px";
		}
		
		private drawContent() {
			
		}
		
		render(): void {
			this.computeScroll();
			this.drawContent();
		}
	}

	register(Grid);
	registerResize(Grid);
}