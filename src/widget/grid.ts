/// <reference path="base.ts" />

module tui.widget {
	"use strict";

	export class Grid extends Widget {
		
		private _lineHeight: number; // 26
		private _setupHeadMoveListener: boolean = false;
		private _vbar: Scrollbar;
		private _hbar: Scrollbar;
		
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
						this._vbar._set("value", 0);
						this._hbar._set("value", 0);
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
						this._vbar._set("value", 0);
						this._hbar._set("value", 0);
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
						this._vbar._set("value", 0);
						this._hbar._set("value", 0);
					},
					"get": (): any => {}
				},
				"scrollTop": {
					"set": (value: any) => {
						this._vbar._set("value", value);
					},
					"get": (): any => {
						return this._vbar.get("value");
					}
				},
				"scrollLeft": {
					"set": (value: any) => {
						this._hbar._set("value", value);
					},
					"get": (): any => {
						return this._hbar.get("value");
					}
				},
				"autoHeight": {
					"set": (value: any) => {
						this._data["autoHeight"] = value;
						this.setupHeaderMonitor();
					}
				},
				"fixedTop": {
					"set": (value: any) => {
						this._data["fixedTop"] = value;
						this.setupHeaderMonitor();
					}
				},
			});
		}

		protected init(): void {
			$(this._).attr({"tabIndex": 0, "unselectable": "on"});
			this._.innerHTML = "<div class='tui-grid-head'></div><div class='tui-content'></div>";
			var head = this._components["head"] = $(this._).children(".tui-grid-head")[0];
			var content = this._components["content"] = $(this._).children(".tui-content")[0];
			this._hbar = <Scrollbar>tui.create("scrollbar", {direction: "horizontal"});
			this._components["hScroll"] = this._hbar.appendTo(this._, false)._;
			this._vbar = <Scrollbar>tui.create("scrollbar");
			this._components["vScroll"] = this._vbar.appendTo(this._, false)._;
			
			var testDiv = browser.toElement("<div class='tui-grid-test'>test</div>")
			document.body.appendChild(testDiv);
			this._lineHeight = testDiv.offsetHeight;
			document.body.removeChild(testDiv);
			
			this.setInit("header", true);
			this.on("resize", () => {
				this.setupHeaderMonitor();
				this.render();
			});
			this._vbar.on("scroll", () => {
				this.drawContent();
			});
			this._hbar.on("scroll", () => {
				this.drawContent();
			});
			var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
			$(this._).on(mousewheelevt, (ev) => {
				if (this.get("autoHeight"))
					return;
				var e = <any>ev.originalEvent;
				var delta = e.detail ? e.detail * (-120) : e.wheelDelta;
				var step = Math.round(this._vbar.get("page") / 2);
				//delta returns +120 when wheel is scrolled up, -120 when scrolled down
				var scrollSize = step > 1 ? step : 1;
				ev.stopPropagation();
				ev.preventDefault();
				this._vbar.set("value", this._vbar.get("value") + (delta <= -120 ? scrollSize : -scrollSize));
				this.drawContent();
			});
		}
		
		private computeWidth(): number {
			return 1000;
		}
		
		private computeScroll() {
			var vScroll = this._vbar;
			$(vScroll._).addClass("tui-hidden");
			var vEnable = false;
			var hScroll = this._hbar;
			$(hScroll._).addClass("tui-hidden");
			var hEnable = false;
			var clientWidth = this._.clientWidth;
			var clientHeight = this._.clientHeight;
			var data = <ds.DS>this.get("data");
			var contentHeight = (data.length() + (this.get("header") ? 1 : 0)) * this._lineHeight;
			var contentWidth = this.get("autoWidth") ? 0 : this.computeWidth();
			var head = this._components["head"];
			var content = this._components["content"];
			
			var computeV = (first: boolean) => {
				var shouldEnable = (this.get("autoHeight") ? false : contentHeight > clientHeight);
				if (shouldEnable) {
					$(vScroll._).removeClass("tui-hidden");
					var scrollHeight = hEnable ? clientHeight - hScroll._.offsetHeight : clientHeight;
					vScroll._.style.height = scrollHeight + "px";
					vScroll._set("total", contentHeight - clientHeight);
					vScroll.set("page", clientHeight / contentHeight * (contentHeight - clientHeight));
				} else if (this.get("autoHeight")) {
					content.style.height = contentHeight + "px";
					this._.style.height = contentHeight + "px";
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
			
			if (this.get("header")) {
				head.style.display = "block";
				head.style.width = (vEnable ? clientWidth - vScroll._.offsetWidth : clientWidth) + "px";
			} else {
				head.style.display = "none";
			}
			content.style.width = (vEnable ? clientWidth - vScroll._.offsetWidth : clientWidth) + "px";
			content.style.height = (hEnable ? clientHeight - hScroll._.offsetHeight : clientHeight) + "px";
		}
		
		private drawLine(line: number) {
			
		}
		
		private drawContent() {
			
		}
		
		private moveHeader = (() => {
			var me = this;
			return function() {
				if (me.get("autoHeight")) {
					var fixedTop = me.get("fixedTop");
					if (typeof fixedTop === "number" && fixedTop >= 0) {
						var header = me._components["head"];
						//var scrollWindow = browser.getWindowScrollElement();
						header.style.position = "absolute";
						header.style.left = "0";
						header.style.top = "0";
						var rect = browser.getRectOfScreen(header);
						if (rect.top < fixedTop) {
							header.style.position = "fixed";
							header.style.left = rect.left + "px";
							header.style.top = fixedTop + "px";
						}
					} else {
						me.setupHeaderMonitor();
					}
				} else {
					me.setupHeaderMonitor();
				}
			}
		})();
		
		private setupHeaderMonitor() {
			if (this.get("autoHeight") && 
				typeof this.get("fixedTop") === "number" && 
				this.get("fixedTop") >= 0) {
				if (!this._setupHeadMoveListener) {
					$(window).on("scroll", this.moveHeader);
					$(window).on("resize", this.moveHeader);
					this._setupHeadMoveListener = true;
				}
			} else {
				if (this._setupHeadMoveListener) {
					$(window).off("scroll", this.moveHeader);
					$(window).off("resize", this.moveHeader);
					this._setupHeadMoveListener = false;
				}
			}
		}
		
		render(): void {
			this.computeScroll();
			this.drawContent();
		}
	}

	register(Grid);
	registerResize(Grid);
}