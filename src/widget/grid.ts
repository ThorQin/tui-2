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
		fixed?: boolean;
		key?: string;
		type?: string;
		icon?: string;
		sortable?: boolean;
		checkable?: boolean;
		arrow?: boolean;
	}

	export class Grid extends Widget {
		
		static CELL_SPACE = 4; 
		
		private _tuid: string;
		private _lineHeight: number; // 26
		private _setupHeadMoveListener: boolean = false;
		private _vbar: Scrollbar;
		private _hbar: Scrollbar;
		private _dispLines: number;
		private _buffer: BufferInfo;
		private _contentWidth: number;
		private _contentHeight: number;
		private _columnWidths: number[] = [];
		private _gridStyle: HTMLStyleElement;
		private _vLines: HTMLElement[] = [];
		private _handlers: HTMLElement[] = [];
		private _activeLine: number = null;
		private _activeColumn: number = null;
		
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
				"dataType": {
					"set": (value: any) => {}
				},
				"data": {
					"set": (value: any) => {
						if (this._data["data"] && typeof (<any>this._data["data"]).off === "function") {
							(<any>this._data["data"]).off("update", updateCallback);
						}
						if (value instanceof ds.List ||
							value instanceof ds.RemoteList) {
							this._data["data"] = value;
							this._data["dataType"] = "list";
						} else if (value instanceof ds.Tree ||
							value instanceof ds.RemoteTree) {
							this._data["data"] = value;
							this._data["dataType"] = "tree";
						} else if (value instanceof Array) {
							this._data["data"] = new ds.List(value);
						}
						if (this._data["data"] && typeof (<any>this._data["data"]).on === "function") {
							(<any>this._data["data"]).on("update", updateCallback);
						}
						this._vbar._set("value", 0);
						this._hbar._set("value", 0);
						this._activeLine = null;
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
							this._columnWidths = [];
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
				},
				"activeLine": {
					"set": (value: any) => {
						if (typeof value === "number" && !isNaN(value) || value === null) {
							if (value < 0)
								value = 0;
							if (value > this._data["data"].length() - 1)
								value = this._data["data"].length() - 1;
							if (this._data["activeLine"] != null)
								$(this._buffer.lines[this._data["activeLine"] - this._buffer.begin]).removeClass("tui-actived");
							this._data["activeLine"] = value;
							if (value != null)
								$(this._buffer.lines[value - this._buffer.begin]).addClass("tui-actived");
						}
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
			
			if ((<any>document).createStyleSheet) {
				this._gridStyle = (<any>document).createStyleSheet();
			} else {
				this._gridStyle = document.createElement("style");
				document.head.appendChild(this._gridStyle);
			}
			
			this._buffer = { begin: 0, end: 0, lines: [] };
			
			this.setInit("header", true);
			this.on("resize", () => {
				this.render();
			});
			this._vbar.on("scroll", () => {
				this.drawContent();
			});
			this._hbar.on("scroll", () => {
				//this.drawContent();
				this.computeHOffset();
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
			
			var scrollX = (distance: number) => {
				var oldValue = this._hbar.get("value");
				this._hbar.set("value", oldValue - distance);
				this.drawContent();
				this.computeHOffset();
				if (this._hbar.get("value") !== oldValue && Math.abs(lastSpeed) > 0.02) {
					return true;
				} else {
					return false;
				}
			};
			
			var scrollY = (distance: number) => {
				var oldValue = this._vbar.get("value");
				this._vbar.set("value", oldValue - distance);
				this.drawContent();
				if (this._vbar.get("value") !== oldValue && Math.abs(lastSpeed) > 0.02) {
					return true;
				} else {
					return false;
				}
			}
			
			var inTouched = false;
			var lastSpeed = 0;
			var lastPos: {x: number, y: number};
			var lastTime: number;
			var direction: string = null;
			$(this._).on("touchstart", function (ev) {
				if (inTouched)
					return;
				direction = null;
				inTouched = true;
				lastSpeed = 0;
				var e = <any>ev.originalEvent;
				if (e.targetTouches.length != 1)
					return;
				var touch = e.targetTouches[0];
				lastPos = { x: touch.pageX, y: touch.pageY };
				lastTime = new Date().getMilliseconds();
			});
			$(this._).on("touchmove", function (ev) {
				clearTimeout(hittestTimer);
				if (!inTouched)
					return;
				var e = <any>ev.originalEvent;
				var touch = e.targetTouches[0];
				var movePos = { x: touch.pageX, y: touch.pageY };
				var moveX = movePos.x - lastPos.x;
				var moveY = movePos.y - lastPos.y;
				var currentTime = new Date().getMilliseconds();
				var spanTime = currentTime - lastTime;
				lastPos = movePos;
				lastTime = currentTime;
				if (direction == null) {
					if (Math.abs(moveX) > 0 && Math.abs(moveY) > 0)
						direction = Math.abs(moveX) > Math.abs(moveY) ? "x" : "y";
					else if (Math.abs(moveX) > 0)
						direction = "x";
					else if (Math.abs(moveY) > 0)
						direction = "y";
				}
				
				if (direction === "x") {
					lastSpeed = moveX / spanTime;
					if (scrollX(moveX)) {
						ev.stopPropagation();
						ev.preventDefault();
					}
				} else if (direction === "y") {
					lastSpeed = moveY / spanTime;
					if (scrollY(moveY)) {
						ev.stopPropagation();
						ev.preventDefault();
					}
				}
				
			});
			$(this._).on("touchend", function(ev) {
				clearTimeout(hittestTimer);
				requestAnimationFrame(function keepMove(timestamp:number) {
					if (Math.abs(lastSpeed) > 0.1) {
						if (direction === "x") {
							if (scrollX(lastSpeed * 20)) {
								lastSpeed *= 0.95;
								requestAnimationFrame(keepMove);
							} 
						} else if (direction === "y") {
							if (scrollY(lastSpeed * 20)) {
								lastSpeed *= 0.95;
								requestAnimationFrame(keepMove);
							} 
						} else {
							lastSpeed = 0;
						}
					}
				});
				inTouched = false;
				lastTime = null;
			});
			
			$(this._).on("mousedown", (ev) => {
				var obj = <HTMLElement>(ev.target || ev.srcElement);
				if ($(obj).hasClass("tui-grid-handler")) { // Resizing
					ev.stopPropagation();
					ev.preventDefault();
					var idx = this._handlers.indexOf(obj);
					var columns = this.get("columns");
					var l = obj.offsetLeft;
					var srcX = ev.clientX;
					obj.style.height = this._.clientHeight + "px";
					$(obj).addClass("tui-handler-move");
					var mask = widget.openDragMask((e) => {
						obj.style.left = l + e.clientX - srcX + "px";
					}, (e) => {
						obj.style.height = "";
						$(obj).removeClass("tui-handler-move");
						columns[idx].width = columns[idx].width + e.clientX - srcX;
						this._columnWidths = [];
						this.initColumnWidth();
						this.computeScroll();
						this.computeColumnWidth();
						this.drawHeader();
						this.computeHOffset();
					});
					mask.style.cursor = "col-resize";
				}
			});
			
			var hittestTimer: number = null;
			var testLine = (obj: HTMLElement) => {
				while (obj) {
					var parent = <HTMLElement>obj.parentNode;
					if (parent && $(parent).hasClass("tui-grid-line")) {
						var l = this._buffer.begin + this._buffer.lines.indexOf(parent);
						//var c = parseInt(obj.getAttribute("col"));
						this._set("activeLine", l);
						//this.set("activeCol", c);
						break;
					}
					obj = parent;
				}
			};
			
			$(this._).on("mousedown", (ev) => {
				var obj = <HTMLElement>(ev.target || ev.srcElement);
				testLine(obj);
			});
			$(this._).on("touchstart", (ev) => {
				var obj = <HTMLElement>(ev.target || ev.srcElement);
				hittestTimer = setTimeout(()=>{
					testLine(obj)
				}, 50);
			});
			
			$(this._).keydown((e) => {
				var k = e.keyCode;
				if (k >= 33 && k <= 40) {
					if (k === KeyCode.LEFT) {
						if (!this.get("autoWidth")) {
							this._hbar.set("value", this._hbar.get("value") - 30);
							this.computeHOffset();
						}
					} else if (k === KeyCode.UP) {
						if (this.get("activeLine") === null) {
							this._set("activeLine", 0);
							this.scrollTo(this.get("activeLine"));
						} else {
							this._set("activeLine", this.get("activeLine") - 1);
							this.scrollTo(this.get("activeLine"));
						}
					} else if (k === KeyCode.RIGHT) {
						if (!this.get("autoWidth")) {
							this._hbar.set("value", this._hbar.get("value") + 30);
							this.computeHOffset();
						}
					} else if (k === KeyCode.DOWN) {
						if (this.get("activeLine") === null) {
							this._set("activeLine", 0);
							this.scrollTo(this.get("activeLine"));
						} else {
							this._set("activeLine", this.get("activeLine") + 1);
							this.scrollTo(this.get("activeLine"));
						}
					} else if (k === KeyCode.PRIOR) {
						if (this.get("activeLine") === null) {
							this._set("activeLine", 0);
							this.scrollTo(this.get("activeLine"));
						} else {
							this._set("activeLine", this.get("activeLine") - this._dispLines + 1);
							this.scrollTo(this.get("activeLine"));
						}
					} else if (k === KeyCode.NEXT) {
						if (this.get("activeLine") === null) {
							this._set("activeLine", 0);
							this.scrollTo(this.get("activeLine"));
						} else {
							this._set("activeLine", this.get("activeLine") + this._dispLines - 1);
							this.scrollTo(this.get("activeLine"));
						}
					} else if (k === KeyCode.HOME) {
						this._set("activeLine", 0);
						this.scrollTo(this.get("activeLine"));
					} else if (k === KeyCode.END) {
						var data = this.get("data");
						this._set("activeLine", data.length() - 1);
						this.scrollTo(this.get("activeLine"));
					}
					e.preventDefault();
					e.stopPropagation();
				} 
			});
		}
		
		scrollTo(index: number) {
			if (typeof index !== "number" || isNaN(index) || index < 0 || index >= this.get("data").length())
				return;
			var v = this._vbar.get("value");
			if (v > index * this._lineHeight) {
				this._vbar.set("value", index * this._lineHeight);
				this.drawContent();
			} else {
				var h = (index - this._dispLines + 1) * this._lineHeight;
				var diff = (this._.clientHeight - this.getComponent("head").offsetHeight - this._hbar._.offsetHeight - this._dispLines * this._lineHeight);
				if (v < h - diff) {
					this._vbar.set("value", h - diff);
					this.drawContent();
				}
			}
		}
		
		
		private computeWidth(): number {
			if (this.get("autoWidth")) {
				return this._.clientWidth;
			} else {
				var contentWidth = 0;
				for (var i = 0; i < this._columnWidths.length; i++) {
					contentWidth += this._columnWidths[i] + Grid.CELL_SPACE * 2;
				}
				return contentWidth;
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
				var realClientHeight = clientHeight - (hEnable ? hScroll._.offsetHeight : 0);
				var shouldEnable = (this.get("autoHeight") ? false : this._contentHeight > realClientHeight);
				if (shouldEnable) {
					$(vScroll._).removeClass("tui-hidden");
					vScroll._.style.height = realClientHeight + "px";
					vScroll._set("total", this._contentHeight - realClientHeight);
					vScroll.set("page", realClientHeight / this._contentHeight * (this._contentHeight - realClientHeight));
				} else if (this.get("autoHeight")) {
					vScroll._set("value", 0);
					content.style.height = this._contentHeight + "px";
					if (hEnable) {
						this._.style.height = this._contentHeight + hScroll._.offsetHeight + "px";
					} else {
						this._.style.height = this._contentHeight + "px";
					}
					clientHeight = this._.clientHeight;
				} else
					vScroll._set("value", 0);
				if (vEnable !== shouldEnable) {
					vEnable = shouldEnable;
					if (!first)
						computeH();
				}
			};
			
			var computeH = () => {
				var realClientWidth = clientWidth - (vEnable ? vScroll._.offsetWidth : 0);
				var shouldEnable = (this.get("autoWidth") ? false : this._contentWidth > realClientWidth);
				if (shouldEnable) {
					$(hScroll._).removeClass("tui-hidden");
					hScroll._.style.width = realClientWidth + "px";
					hScroll._set("total", this._contentWidth - realClientWidth);
					hScroll.set("page", realClientWidth / this._contentWidth * (this._contentWidth - realClientWidth));
				} else {
					hScroll._set("total", 0);
					hScroll.set("value", 0);
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
			if (line.childNodes.length != columns.length) {
				line.innerHTML = "";
				for (var i = 0; i < columns.length; i++) {
					var span = document.createElement("span");
					span.className = "tui-grid-" + this._tuid + "-" + i;
					(<any>span)["col"] = i;
					line.appendChild(span);
				}
			}
			var isTree = this.get("dataType") === "tree";
			for (var i = 0; i < columns.length; i++) {
				let col = columns[i];
				var prefix = "";
				var item = isTree ? lineData.item : lineData;
				if (col.arrow === true && isTree) { // draw a tree arrow 
					for (var j = 0; j < lineData.level; j++) {
						prefix += "<i class='tui-space'></i>";
					}
					if (lineData.hasChild) {
						if (lineData.expand)
							prefix += "<i class='tui-arrow-expand'></i>";
						else
							prefix += "<i class='tui-arrow-contract'></i>";
					} else {
						prefix += "<i class='tui-space'></i>";
					}
				}
				
				(<HTMLElement>line.childNodes[i]).innerHTML = prefix + item[columns[i].key];
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
		
		private drawHeader() {
			if (!this.get("header"))
				return;
			var head = this._components["head"];
			head.innerHTML = "";
			var columns = <ColumnInfo[]>this.get("columns");
			for (var i = 0; i < columns.length; i++) {
				var span = document.createElement("span");
				span.className = "tui-grid-" + this._tuid + "-" + i
				head.appendChild(span);
				span.innerHTML = columns[i].name;
			}
		}
		
		private _drawTimer: number;
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
				} else {
					if (reusable.length > 0) { // has reusable
						line = reusable.pop();
						line.innerHTML = "";
					} else {
						line = this.createLine(content);
					}
					if (i === this.get("activeLine")) {
						$(line).addClass("tui-actived");
					} else {
						$(line).removeClass("tui-actived");
					}
				}
				this.moveLine(line, i - begin, base);
				newBuffer.push(line);
			}
			
			clearTimeout(this._drawTimer);
			this._drawTimer = setTimeout(() => {
				var begin = Math.floor(vbar.get("value") / this._lineHeight);
				var end = begin + this._dispLines + 1;
				for (var i = this._buffer.begin; i < this._buffer.end; i++) {
					if (i >= begin && i < end)
						this.drawLine(this._buffer.lines[i - this._buffer.begin], i, columns, data.get(i));
				}
			}, 96);
			
			for (var i = 0; i < reusable.length; i++) {
				content.removeChild(reusable[i]);
			}
			this._buffer.lines = newBuffer;
			this._buffer.begin = begin;
			this._buffer.end = this._buffer.begin + this._buffer.lines.length;
		}
		
		private initColumnWidth() {
			var columns = <ColumnInfo[]>this.get("columns");
			for (var i = 0; i < columns.length; i++) {
				if (typeof this._columnWidths[i] !== "number" || isNaN(this._columnWidths[i])) {
					if (typeof columns[i].width === "number" && !isNaN(columns[i].width))
						this._columnWidths[i] = columns[i].width;
					else
						this._columnWidths[i] = 150;
				}
				if (this._columnWidths[i] < 0)
					this._columnWidths[i] = 0;
			}
		}
		
		private computeHOffset() {
			//var widths: number[] = [];
			var head = this._components["head"];
			var content = this._components["content"]; 
			var scrollLeft: number = this._hbar.get("value");
			var columns = <ColumnInfo[]>this.get("columns");
			head.scrollLeft = scrollLeft;
			content.scrollLeft = scrollLeft;
			var used = 0;
			for (var i = 0; i < columns.length; i++) {
				this._vLines[i].style.left = used + columns[i].width +  (Grid.CELL_SPACE * 2) - scrollLeft + "px";
				used += columns[i].width +  (Grid.CELL_SPACE * 2);
			}
			if (this.get("header")) {
				used = 0;
				for (var i = 0; i < columns.length; i++) {
					this._handlers[i].style.left = used + columns[i].width +  (Grid.CELL_SPACE) - this._hbar.get("value") + "px";
					used += columns[i].width +  (Grid.CELL_SPACE * 2);
				}
			}
		}
		
		private computeColumnWidth() {
			//var widths: number[] = [];
			var columns = <ColumnInfo[]>this.get("columns");
			if (this.get("autoWidth")) {
				var total = this._contentWidth;
				var totalNoBorder = total - (Grid.CELL_SPACE * 2) * columns.length;
				var totalNoFixed = totalNoBorder;
				var totalCompute = 0;
				// Exclude all fixed columns
				for (var i = 0; i < columns.length; i++) {
					if (columns[i].fixed) {
						totalNoFixed -= this._columnWidths[i];
					} else {
						totalCompute += this._columnWidths[i];
					}
				}
				
				for (var i = 0; i < columns.length; i++) {
					if (!columns[i].fixed) {
						this._columnWidths[i] = (this._columnWidths[i] * 1.0) / totalCompute * totalNoFixed;
					}
				}
			} 
			for (var i = 0; i < this._columnWidths.length; i++) {
				let val = Math.round(this._columnWidths[i]);
				//widths.push(val);
				columns[i].width = val;
			}
			// Add V lines
			for (var i = 0; i < this._vLines.length; i++) {
				if (this._vLines[i].parentNode)
					this._.removeChild(this._vLines[i]);
			}
			var used = 0;
			for (var i = 0; i < columns.length; i++) {
				if (i >= this._vLines.length) {
					this._vLines[i] = document.createElement("div");
					this._vLines[i].className = "tui-grid-vline";
				}
				this._vLines[i].style.left = used + columns[i].width +  (Grid.CELL_SPACE * 2) - this._hbar.get("value") + "px";
				used += columns[i].width +  (Grid.CELL_SPACE * 2);
				this._vLines[i].style.height = Math.min(this._contentHeight, this._.clientHeight) + "px";  
				this._.appendChild(this._vLines[i]);
			}
			// Add Handlers
			for (var i = 0; i < this._handlers.length; i++) {
				if (this._handlers[i].parentNode)
					this._.removeChild(this._handlers[i]);
			}
			if (this.get("header")) {
				used = 0;
				for (var i = 0; i < columns.length; i++) {
					if (i >= this._handlers.length) {
						this._handlers[i] = document.createElement("div");
						this._handlers[i].className = "tui-grid-handler";
					}
					this._handlers[i].style.left = used + columns[i].width +  (Grid.CELL_SPACE) - this._hbar.get("value") + "px";
					used += columns[i].width +  (Grid.CELL_SPACE * 2);
					this._.appendChild(this._handlers[i]);
				}
			}
			
			var cssText = "";
			for (var i = 0; i < columns.length; i++) {
				cssText += (".tui-grid-" + this._tuid + "-" + i + "{width:" + columns[i].width + "px}");
			}
			if ((<any>document).createStyleSheet) // IE
				(<any>this._gridStyle).cssText = cssText;
			else
				this._gridStyle.innerHTML = cssText;
				
			for (var i = 0; i < this._buffer.lines.length; i++) {
				var line: HTMLElement = this._buffer.lines[i];
				line.style.width = this._contentWidth + "px";
			}
		}
		
		render(): void {
			this.initColumnWidth();
			this.computeScroll();
			this.computeColumnWidth();
			this.drawHeader();
			this.drawContent();
			this.computeHOffset();
		}
	}

	register(Grid);
	registerResize(Grid);
}