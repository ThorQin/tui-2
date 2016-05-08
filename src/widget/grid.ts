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
		arrow?: boolean;
		sortable?: boolean;
		iconKey?: string;
		checkKey?: string;
	}

	/**
	 * <tui:gird>
	 * Attributes: data, list(array type data), tree(tree type data), 
	 * columns, sortColumn, sortType, scrollTop, scrollLeft, activeRow, 
	 * activeColumn
	 * Method: scrollTo, setSortFlag
	 * Events: sort, rowclick, rowdblclick, rowcheck, keyselect
	 */
	export class Grid extends Widget {
		
		static CELL_SPACE = 4; 
		static LINE_HEIGHT = 31;
		protected _lineHeight: number; // 31
		
		private _tuid: string;
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
						} else if (value === null) {
							this._data["data"] = new ds.List([]);
						}
						if (this._data["data"] && typeof (<any>this._data["data"]).on === "function") {
							(<any>this._data["data"]).on("update", updateCallback);
						}
						this._vbar._set("value", 0);
						this._hbar._set("value", 0);
						this._set("activeRow", null);
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
						} else if (value === null) {
							this._set("data", null);
						}
					},
					"get": (): any => {}
				},
				"tree": {
					"set": (value: any) => {
						if (value instanceof ds.Tree ||
							value instanceof ds.RemoteTree)
							this._set("data", value);
						else if (value instanceof Array) {
							this._set("data", new ds.Tree(value));
						} else if (value === null) {
							this._set("data", null);
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
				"activeRow": {
					"set": (value: any) => {
						if (typeof value === "number" && !isNaN(value) || value === null) {
							if (value < 0)
								value = 0;
							if (value > this._data["data"].length() - 1)
								value = this._data["data"].length() - 1;
							if (this._data["activeRow"] != null)
								$(this._buffer.lines[this._data["activeRow"] - this._buffer.begin]).removeClass("tui-actived");
							this._data["activeRow"] = value;
							if (value != null)
								$(this._buffer.lines[value - this._buffer.begin]).addClass("tui-actived");
						}
					}
				},
				"activeRowData": {
					"set": (value: any) => {},
					"get": () :any => {
						var r = this._data["activeRow"];
						if (r != null) {
							return this.get("data").get(r);
						} else
							return r;
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
			
			this._lineHeight = Grid.LINE_HEIGHT;
			
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
				var step = this._lineHeight;
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
			
			var hittest = (obj: HTMLElement): {line: number, col: number} => {
				var line: number = null;
				var col: number = null;
				var srcObj = obj;
				while (obj) {
					var parent = <HTMLElement>obj.parentNode;
					if (parent && $(parent).hasClass("tui-grid-line")) {
						line = this._buffer.begin + this._buffer.lines.indexOf(parent);
						col = (<any>obj).col;
						this._set("activeRow", line);
						this._set("activeColumn", col);
						break;
					}
					obj = parent;
				}
				return {line: line, col: col};
			}
			
			var hittestTimer: number = null;
			var testLine = (ev: JQueryEventObject) => {
				var obj = <HTMLElement>(ev.target || ev.srcElement);
				var target = hittest(obj);
				if (target.line === null) 
					return;
				var data = this.get("data");
				if ($(obj).hasClass("tui-arrow-expand")) {
					data.collapse(target.line);
					this.render();
					ev.preventDefault();
					this.fire("collapse", {e:ev, line:target.line});
				} else if ($(obj).hasClass("tui-arrow-collapse")) {
					data.expand(target.line);
					this.render();
					ev.preventDefault();
					this.fire("expand", {e:ev, line:target.line});
				} else if ($(obj).hasClass("tui-grid-check")) {
					var column = this.get("columns")[target.col];
					var checkKey = column.checkKey ? column.checkKey : "checked";
					var checked: boolean;
					if (this.get("dataType") === "tree") {
						checked = data.get(target.line).item[checkKey] = !data.get(target.line).item[checkKey];
					} else {
						checked = data.get(target.line)[checkKey] = !data.get(target.line)[checkKey];
					}
					this.drawLine(this._buffer.lines[target.line - this._buffer.begin], 
						target.line, this.get("columns"), data.get(target.line));
					ev.preventDefault();
					this.fire("rowcheck", {e: ev, row: target.line, col: target.col, checked: checked });
				}
			};
			
			$(this._).on("mousedown", (ev) => {
				testLine(ev);
			});
			
			$(content).click((ev)=>{
				var obj = <HTMLElement>(ev.target || ev.srcElement);
				if ($(obj).hasClass("tui-arrow-expand")) {
					return;
				} else if ($(obj).hasClass("tui-arrow-collapse")) {
					return;
				} else if ($(obj).hasClass("tui-grid-check")) {
					return;
				}
				var target = hittest(obj);
				if (target.line != null)
					this.fire("rowclick", {e: ev, row: this.get("activeRow"), col: this.get("activeColumn")});
			});
			
			$(content).dblclick((ev)=>{
				var obj = <HTMLElement>(ev.target || ev.srcElement);
				if ($(obj).hasClass("tui-arrow-expand")) {
					return;
				} else if ($(obj).hasClass("tui-arrow-collapse")) {
					return;
				} else if ($(obj).hasClass("tui-grid-check")) {
					return;
				}
				var target = hittest(obj);
				if (target.line != null)
					this.fire("rowdblclick", {e: ev, row: this.get("activeRow"), col: this.get("activeColumn")});
			});
			
			$(this._).keydown((e) => {
				var k = e.keyCode;
				if (k >= 33 && k <= 40 || k == KeyCode.ENTER) {
					if (k === KeyCode.LEFT) {
						if (this.get("dataType") === "tree") {
							var activeRow = this.get("activeRow");
							if (activeRow !== null) {
								let node = <ds.TreeNode>this.get("data").get(activeRow);
								if (node.hasChild && node.expand) {
									this.get("data").collapse(activeRow);
									this.render();
									this.fire("collapse", {e:e, line:activeRow});
									return;
								}
							}
						}
						if (!this.get("autoWidth")) {
							this._hbar.set("value", this._hbar.get("value") - 30);
							this.computeHOffset();
						}
					} else if (k === KeyCode.UP) {
						if (this.get("activeRow") === null) {
							this._set("activeRow", 0);
						} else {
							this._set("activeRow", this.get("activeRow") - 1);
						}
						this.scrollTo(this.get("activeRow"));
						this.fire("keyselect", {e:e, row:this.get("activeRow")});
					} else if (k === KeyCode.RIGHT) {
						if (this.get("dataType") === "tree") {
							var activeRow = this.get("activeRow");
							if (activeRow !== null) {
								let node = <ds.TreeNode>this.get("data").get(activeRow);
								if (node.hasChild && !node.expand) {
									this.get("data").expand(activeRow);
									this.render();
									this.fire("collapse", {e:e, line:activeRow});
									return;
								}
							}
						}
						if (!this.get("autoWidth")) {
							this._hbar.set("value", this._hbar.get("value") + 30);
							this.computeHOffset();
						}
					} else if (k === KeyCode.DOWN) {
						if (this.get("activeRow") === null) {
							this._set("activeRow", 0);
						} else {
							this._set("activeRow", this.get("activeRow") + 1);
						}
						this.scrollTo(this.get("activeRow"));
						this.fire("keyselect", {e:e, row:this.get("activeRow")});
					} else if (k === KeyCode.PRIOR) {
						if (this.get("activeRow") === null) {
							this._set("activeRow", 0);
						} else {
							this._set("activeRow", this.get("activeRow") - this._dispLines + 1);
						}
						this.scrollTo(this.get("activeRow"));
						this.fire("keyselect", {e:e, row:this.get("activeRow")});
					} else if (k === KeyCode.NEXT) {
						if (this.get("activeRow") === null) {
							this._set("activeRow", 0);
						} else {
							this._set("activeRow", this.get("activeRow") + this._dispLines - 1);
						}
						this.scrollTo(this.get("activeRow"));
						this.fire("keyselect", {e:e, row:this.get("activeRow")});
					} else if (k === KeyCode.HOME) {
						this._set("activeRow", 0);
						this.scrollTo(this.get("activeRow"));
						this.fire("keyselect", {e:e, row:this.get("activeRow")});
					} else if (k === KeyCode.END) {
						var data = this.get("data");
						this._set("activeRow", data.length() - 1);
						this.scrollTo(this.get("activeRow"));
						this.fire("keyselect", {e:e, row:this.get("activeRow")});
					} else if (k === KeyCode.ENTER) {
						if (this.get("activeRow") != null) {
							this.fire("rowclick", {e: e, row: this.get("activeRow"), col: this.get("activeColumn")});
						}
					}
					e.preventDefault();
					e.stopPropagation();
				} 
			});
			
			$(head).click((ev) => { // header click: change sort flag 
				var obj = <HTMLElement>(ev.target || ev.srcElement);
				var columns = <ColumnInfo[]>this.get("columns");
				while (obj) {
					if (obj.parentNode === head) {
						var col = (<any>obj).col;
						if (columns[col].sortable) {
							var sortType = "asc";
							if (this.get("sortColumn") == col) {
								if (this.get("sortType") === "asc")
									sortType = "desc";
								else {
									sortType = null;
									col = null;
								}
							}
							this.setSortFlag(col, sortType);
							this.drawHeader();
							this.fire("sort", {e: ev, column: col === null ? null : columns[col], type: sortType});
						}
						return;
					} else
						obj = <HTMLElement>obj.parentNode;
				}
			});
		}
		
		setSortFlag(col: number, type: string) {
			this._set("sortColumn", col);
			this._set("sortType", type);
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
		
		iterate(func: (item: any, path: number[]) => boolean) {
			var data = this.get("data");
			var dataType = this.get("dataType");
			function iterateItem(treeItem: any, path: number[]): boolean {
				if (func(treeItem, path) === false)
					return false;
				var children = treeItem[childrenKey];
				if (children) {
					for (let i = 0; i < children.length; i++) {
						if (iterateItem(children[i], path.concat(i)) === false)
							return false;
					}
				}
			}
			if (dataType === "tree") {
				var tree = <ds.TreeBase>data;
				var childrenKey: string = tree.getConfig().children;
				var rawData = tree.getRawData();
				if (!rawData)
					return;
				for (let i = 0; i < rawData.length; i++) {
					if (iterateItem(rawData[i], [i]) === false)
						break;
				}
			} else {
				var list = <ds.DS>data;
				for (let i = 0; i < list.length(); i++) {
					if (func(list.get(i), [i]) === false)
						break;
				}
			}
		}
		
		/**
		 * Search a row by condition, get field value by 'dataKey' and compare to value, if match then active it.
		 * Should only used in local data type, e.g. List or Tree, if used in RemoteList or RemoteTree may not work correctly.
		 */
		activeTo(dataKey: string, value: any) {
			var data = this.get("data");
			var dataType = this.get("dataType");
			var path: number[] = [];
			var childrenKey: string;
			
			// If is a subset return 1, if equals return 2, otherwise return 0
			function matchPath(p1: number[], p2: number[]): number {
				for (var i = 0; i < p1.length; i++) {
					if (i >= p2.length)
						return 0;
					else if (p1[i] !== p2[i])
						return 0;
				}
				return p1.length === p2.length ? 2 : 1;
			}
			
			if (dataType === "tree") {
				var tree = <ds.TreeBase>data;
				this.iterate(function(item: any, p: number[]): boolean {
					if (item[dataKey] === value) {
						path = p;
						return false;
					}
				});
				
				if (path && path.length > 0) {
					var searchPath: number[] = [];
					var searchLevel = -1;
					var found = false;
					for (var i = 0; i < tree.length(); i++) {
						var node = tree.get(i);
						if (node.level === searchLevel) {
							searchPath[searchLevel]++;
						} else if (node.level < searchLevel) {
							for (var j = node.level; j < searchLevel; j++)
								searchPath.pop();
							searchLevel = node.level;
							searchPath[searchLevel]++;
						} else {
							searchPath.push(0);
							searchLevel++;
						}
						var state = matchPath(searchPath, path);
						if (state === 2) {
							found = true;
							break;
						} else if (state === 1) {
							tree.expand(i);
						}
					}
					if (found) {
						this._set("activeRow", i);
						this.computeScroll();
						this.scrollTo(i);
					}
				}
			} else {
				var list = <ds.DS>data;
				for (let i = 0; i < list.length(); i++) {
					if (list.get(i)[dataKey] === value) {
						this._set("activeRow", i);
						this.scrollTo(i);
						break;
					}
				}
			}
		}
		
		protected computeWidth(): number {
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
		
		protected computeScroll() {
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
					vScroll._set("total", 0);
					content.style.height = this._contentHeight + "px";
					if (hEnable) {
						this._.style.height = this._contentHeight + hScroll._.offsetHeight + "px";
					} else {
						this._.style.height = this._contentHeight + "px";
					}
					clientHeight = this._.clientHeight;
				} else {
					vScroll._set("value", 0);
					vScroll._set("total", 0);
				}
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
		
		protected drawLine(line: HTMLElement, index: number, columns: ColumnInfo[], lineData: any) {
			var isTree = this.get("dataType") === "tree";
			var item = isTree ? lineData.item : lineData;
			var tipKey = this.get("rowTooltipKey");
			if (item[tipKey]) {
				line.setAttribute("tooltip", item[tipKey]);
			}
			lineData
			if (line.childNodes.length != columns.length) {
				line.innerHTML = "";
				for (var i = 0; i < columns.length; i++) {
					var span = document.createElement("span");
					span.className = "tui-grid-" + this._tuid + "-" + i;
					span.setAttribute("unselectable", "on");
					(<any>span).col = i;
					line.appendChild(span);
				}
			}
			for (var i = 0; i < columns.length; i++) {
				let col = columns[i];
				var prefix = "";
				if (col.arrow === true && isTree) { // draw a tree arrow 
					for (var j = 0; j < lineData.level; j++) {
						prefix += "<i class='tui-space'></i>";
					}
					if (lineData.hasChild) {
						if (lineData.expand)
							prefix += "<i class='tui-arrow-expand'></i>";
						else
							prefix += "<i class='tui-arrow-collapse'></i>";
					} else {
						prefix += "<i class='tui-arrow'></i>";
					}
				}
				if (col.type === "check") {
					var k = (col.checkKey ? col.checkKey : "checked"); 
					if (item[k] === true)
						prefix += "<i class='fa fa-check-square-o tui-grid-check'></i>";
					else if (item[k] === false)
						prefix += "<i class='fa fa-square-o tui-grid-check'></i>";
					else
						prefix += "<i class='tui-grid-no-check'>&bull;</i>";
				} else if (col.type === "tristate") {
					var k = (col.checkKey ? col.checkKey : "checked"); 
					if (item[k] === true)
						prefix += "<i class='fa-check-square-o tui-grid-check'></i>";
					else if (item[k] === false)
						prefix += "<i class='fa-square-o tui-grid-check'></i>";
					else if (item[k] === "tristate")
						prefix += "<i class='fa-check-square tui-grid-check'></i>";
					else
						prefix += "<i class='tui-grid-no-check'>&bull;</i>";
				} else if (col.type === "select") {
					prefix += "<i class='fa fa-caret-down tui-grid-select'></i>";
				} else if (col.type === "edit") {
					prefix += "<i class='fa fa-edit tui-grid-edit'></i>";
				}
				
				if (col.iconKey && item[col.iconKey]) {
					prefix += "<i class='fa " + item[col.iconKey] + " tui-grid-icon'></i>";
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
			line.setAttribute("unselectable", "on");
			return <HTMLElement>parent.appendChild(line);
		}
		
		protected clearBuffer() {
			if (!this._buffer) {
				return;
			}
			var content = this._components["content"];
			for (var i = 0; i < this._buffer.lines.length; i++) {
				content.removeChild(this._buffer.lines[i]);
			}
			this._buffer.begin = 0;
			this._buffer.end = 0;
			this._buffer.lines = [];
		}
		
		protected drawHeader() {
			if (!this.get("header"))
				return;
			var head = this._components["head"];
			head.innerHTML = "";
			var columns = <ColumnInfo[]>this.get("columns");
			for (var i = 0; i < columns.length; i++) {
				var prefix = "";
				if (columns[i].sortable && this.get("sortColumn") == i) {
					if (this.get("sortType") === "desc") {
						prefix = "<i class='tui-grid-desc'></i>";
					} else {
						prefix = "<i class='tui-grid-asc'></i>";
					}
				}
				var sortClass = "";
				if (columns[i].sortable)
					sortClass = "tui-sortable";
				var span = document.createElement("span");
				span.className = "tui-grid-" + this._tuid + "-" + i + " " + sortClass;
				(<any>span).col = i;
				head.appendChild(span);
				span.innerHTML = prefix + columns[i].name;
			}
		}
		
		private _drawTimer: number;
		protected drawContent() {
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
						line.removeAttribute("tooltip");
					} else {
						line = this.createLine(content);
					}
					if (i === this.get("activeRow")) {
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
			}, 32);
			
			for (var i = 0; i < reusable.length; i++) {
				content.removeChild(reusable[i]);
			}
			this._buffer.lines = newBuffer;
			this._buffer.begin = begin;
			this._buffer.end = this._buffer.begin + this._buffer.lines.length;
		}
		
		protected initColumnWidth() {
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
		
		protected computeHOffset() {
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
		
		protected computeColumnWidth() {
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
	
	
	/**
	 * <tui:list>
	 */
	export class List extends Grid {
		
		private _column: ColumnInfo;
		static LINE_HEIGHT = 30;
		
		protected initRestriction(): void {
			super.initRestriction();
			this._column = {
				name: "",
				key: "name",
				checkKey: "check",
				iconKey: "icon",
				arrow: true
			};
			this.setRestrictions({
				"columns": {
					"set": (value: any) => {},
					"get": (): any => {
						return [this._column];
					}
				},
				"checkKey": {
					"set": (value: any) => {
						this._column.checkKey = value;
						this.clearBuffer();
					},
					"get": () => {
						return this._column.checkKey;
					}
				},
				"nameKey": {
					"set": (value: any) => {
						this._column.key = value;
						this.clearBuffer();
					},
					"get": () => {
						return this._column.key;
					}
				},
				"iconKey": {
					"set": (value: any) => {
						this._column.iconKey = value;
						this.clearBuffer();
					},
					"get": () => {
						return this._column.iconKey;
					}
				},
				"checkable": {
					"set": (value: any) => {
						this._column.type = value ? "check" : null;
						this.clearBuffer();
					},
					"get": () => {
						return this._column.type === "check";
					}
				},
				"checkedValues": {
					"set": (value: any) => {
						var valueKey = this.get("valueKey");
						var checkKey = this.get("checkKey");
						if (value === null)
							value = [];
						if (!(value instanceof Array))
							value = [value];
						this.iterate(function(item: any, path: number[]): boolean {
							if (typeof item[checkKey] === "boolean") {
								if (value.indexOf(item[valueKey]) >= 0)
									item[checkKey] = true;
								else
									item[checkKey] = false;
							}
							return true;
						});
					},
					"get": () => {
						var value: any[] = [];
						var valueKey = this.get("valueKey");
						var checkKey = this.get("checkKey");
						this.iterate(function(item: any, path: number[]): boolean {
							if (item[checkKey] === true)
								value.push(item[valueKey]);
							return true;
						});
						return value;
					}
				},
				"checkedNames": {
					"set": (value: any) => {},
					"get": () => {
						var names: any[] = [];
						var nameKey = this.get("nameKey");
						var checkKey = this.get("checkKey");
						this.iterate(function(item: any, path: number[]): boolean {
							if (item[checkKey] === true)
								names.push(item[nameKey]);
							return true;
						});
						return names;
					}
				}
				
			});
		}
		
		protected init(): void {
			super.init();
			this._lineHeight = List.LINE_HEIGHT;	
			this._set("header", false);
			this.setInit("autoWidth", true);
			this.setInit("valueKey", "value");
		}
		
		selectAll() {
			var checkKey = this.get("checkKey");
			this.iterate(function(item: any, path: number[]): boolean {
				if (typeof item[checkKey] === "boolean") {
					item[checkKey] = true;
				}
				return true;
			});
			this.render();
		}
		
		deselectAll() {
			var checkKey = this.get("checkKey");
			this.iterate(function(item: any, path: number[]): boolean {
				if (typeof item[checkKey] === "boolean") {
					item[checkKey] = false;
				}
				return true;
			});
			this.render();
		}
	}
	
	register(List);
	registerResize(List);
}