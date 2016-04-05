/// <reference path="base.ts" />

module tui.widget {
	"use strict";
	
	interface BufferInfo {
		begin: number;
		end: number;
		lines: HTMLElement[];
	}
	
	interface ColumnInfo {
		name: string;
		width?: number;
		key?: string;
		type?: string;
		icon?: string;
		sortable?: boolean;
		checkable?: boolean;
	}

	export class Grid extends Widget {
		
		private _tuid: string;
		private _lineHeight: number; // 26
		private _setupHeadMoveListener: boolean = false;
		private _vbar: Scrollbar;
		private _hbar: Scrollbar;
		private _dispLines: number;
		private _buffer: BufferInfo;
		private _contentWidth: number;
		private _contentHeight: number;
		
		protected initRestriction(): void {
			
			// Register update callback routine
			var updateCallback: (data: EventInfo) => any = (() => {
				var me = this;
				return function(data: EventInfo): any{
					if (data.data["completely"]) {
						me.render();
					} else {
						me.drawContent();
					}
				};
			})();
			
			super.initRestriction();
			this.setRestrictions({
				"data": {
					"set": (value: any) => {
						if (this._data["data"] && typeof (<any>this._data["data"]).off === "function") {
							(<any>this._data["data"]).off("update", updateCallback);
						}
						if (value instanceof ds.List ||
							value instanceof ds.RemoteList ||
							value instanceof ds.Tree ||
							value instanceof ds.RemoteTree)
							this._data["data"] = value;
						else if (value instanceof Array) {
							this._data["data"] = new ds.List(value);
						}
						if (this._data["data"] && typeof (<any>this._data["data"]).on === "function") {
							(<any>this._data["data"]).on("update", updateCallback);
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
							this._set("data", value);
						else if (value instanceof Array) {
							this._set("data", new ds.List(value));
						}
					},
					"get": (): any => {}
				},
				"columns": {
					"set": (value: any) => {
						if (value instanceof Array) {
							this._data["columns"] = value;
							this.clearBuffer();
						}
					},
					"get": (): any => {
						if (this._data["columns"])
							return this._data["columns"];
						else
							return [];
					}
				},
				"tree": {
					"set": (value: any) => {
						if (value instanceof ds.Tree ||
							value instanceof ds.RemoteTree)
							this._set("data", value);
						else if (value instanceof Array) {
							this._set("data", new ds.Tree(value));
						}
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
				}
			});
		}

		protected init(): void {
			this._tuid = tuid();
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
			
			this._buffer = { begin: 0, end: 0, lines: [] };
			
			this.setInit("header", true);
			this.on("resize", () => {
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
			if (this.get("autoWidth")) {
				return this._.clientWidth;
			} else {
				
				return 1000;
			}
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
			this._contentHeight = (data.length() + (this.get("header") ? 1 : 0)) * this._lineHeight;
			this._contentWidth = this.computeWidth();
			var head = this._components["head"];
			var content = this._components["content"];
			
			var computeV = (first: boolean) => {
				var shouldEnable = (this.get("autoHeight") ? false : this._contentHeight > clientHeight);
				if (shouldEnable) {
					$(vScroll._).removeClass("tui-hidden");
					var scrollHeight = hEnable ? clientHeight - hScroll._.offsetHeight : clientHeight;
					vScroll._.style.height = scrollHeight + "px";
					vScroll._set("total", this._contentHeight - clientHeight);
					vScroll.set("page", clientHeight / this._contentHeight * (this._contentHeight - clientHeight));
				} else if (this.get("autoHeight")) {
					vScroll._set("value", 0);
					content.style.height = this._contentHeight + "px";
					if (hEnable) {
						this._.style.height = this._contentHeight + hScroll._.offsetHeight + "px";
					} else {
						this._.style.height = this._contentHeight + "px";
					}
					clientHeight = this._.clientHeight;
				}
				if (vEnable !== shouldEnable) {
					vEnable = shouldEnable;
					if (!first)
						computeH();
				}
			};
			
			var computeH = () => {
				var shouldEnable = (this.get("autoWidth") ? false : this._contentWidth > clientWidth);
				if (shouldEnable) {
					$(hScroll._).removeClass("tui-hidden");
					var scrollWidth = vEnable ? clientWidth - vScroll._.offsetWidth : clientWidth;
					hScroll._.style.width = scrollWidth + "px";
					hScroll._set("total", this._contentWidth - clientWidth);
					hScroll.set("page", clientWidth / this._contentWidth * (this._contentWidth - clientWidth));
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
			var dispHeight = (hEnable ? clientHeight - hScroll._.offsetHeight : clientHeight);
			content.style.height = dispHeight + "px";
			this._dispLines = Math.ceil((dispHeight - (this.get("header") ? this._lineHeight : 0 )) / this._lineHeight);
		}
		
		private drawLine(line: HTMLElement, index: number, columns: ColumnInfo[], lineData: any) {
			for (var i = 0; i < columns.length; i++) {
				(<HTMLElement>line.childNodes[i].firstChild).innerHTML = lineData[columns[i].key];
			}
		}
		
		private moveLine(line: HTMLElement, index: number, base: number) {
			line.style.top = (base + index * this._lineHeight) + "px";
			line.style.width = this._contentWidth + "px";
		}

		private createLine(parent: HTMLElement): HTMLElement {
			var columns = <ColumnInfo[]>this.get("columns");
			var line = document.createElement("div");
			line.className = "tui-grid-line";
			for (var i = 0; i < columns.length; i++) {
				var span = document.createElement("span");
				var text = document.createElement("span");
				var icon = document.createElement("i");
				span.appendChild(text);
				span.appendChild(icon);
				span.className = this._tuid + "-col-" + i;
				line.appendChild(span);
			}
			console.info("create a line");
			return <HTMLElement>parent.appendChild(line);
		}
		
		private clearBuffer() {
			var content = this._components["content"];
			for (var i = 0; i < this._buffer.lines.length; i++) {
				content.removeChild(this._buffer.lines[i]);
			}
			this._buffer.begin = 0;
			this._buffer.end = 0;
			this._buffer.lines = [];
		}
		
		private drawContent() {
			var vbar = get(this._components["vScroll"]);
			var content = this._components["content"];
			var base = (this.get("header") ? this._lineHeight : 0) - vbar.get("value") % this._lineHeight;
			var begin = Math.floor(vbar.get("value") / this._lineHeight);
			var end = begin + this._dispLines + 1;
			var data = <ds.DS>this.get("data");
			var columns = <ColumnInfo[]>this.get("columns");
			var length = data.length();
			var newBuffer: HTMLElement[] = [];
			var reusable: HTMLElement[] = [];
			for (var i = this._buffer.begin; i < this._buffer.end; i++) {
				if (i < begin || i >= end || i >= length) {
					reusable.push(this._buffer.lines[i - this._buffer.begin]);
				}
			}
			for (var i = begin; i < end && i < length; i++) {
				var line: HTMLElement;
				if (i >= this._buffer.begin && i < this._buffer.end) { // Is buffered.
					line = this._buffer.lines[i - this._buffer.begin];
				} else if (reusable.length > 0) { // has reusable
					line = reusable.pop();
					this.drawLine(line, i, columns, data.get(i));
				} else {
					line = this.createLine(content);
					this.drawLine(line, i, columns, data.get(i));
				}
				
				this.moveLine(line, i - begin, base);
				newBuffer.push(line);
			}
			for (var i = 0; i < reusable.length; i++) {
				content.removeChild(reusable[i]);
			}
			this._buffer.lines = newBuffer;
			this._buffer.begin = begin;
			this._buffer.end = this._buffer.begin + this._buffer.lines.length;
		}
		
		render(): void {
			this.computeScroll();
			this.drawContent();
		}
	}

	register(Grid);
	registerResize(Grid);
}