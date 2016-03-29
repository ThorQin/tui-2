/// <reference path="base.ts" />
module tui.widget {
	"use strict";

	export class Scrollbar extends Widget {

		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"total": {
					"get": (): any => {
						var value = this._data["total"];
						if (typeof value !== "number" || isNaN(value) || value < 0)
							return 0;
						else
							return value;
					},
					"set": (value: any) => {
						if (typeof value !== "number" || isNaN(value))
							value = 0;
						if (value < 0) 
							value = 0;
						value = Math.round(value);
						this._data["total"] = value;
						if (this.get("value") > value)
							this._set("value", value);
						if (this.get("page") > value)
							this._set("page", value);
					}
				},
				"page": {
					"get": (): any => {
						var value = this._data["page"];
						if (typeof value !== "number" || isNaN(value) || value < 1)
							return 1;
						else
							return value;
					},
					"set": (value: any) => {
						if (typeof value !== "number" || isNaN(value))
							value = 1;
						value = Math.round(value);
						if (value < 1)
							value = 1;
						if (value > this.get("total"))
							value = this.get("total");
						this._data["page"] = value;
					}
				},
				"value": {
					"get": (): any => {
						var value = this._data["value"];
						if (typeof value !== "number" || isNaN(value) || value < 0)
							return 0;
						else
							return value;
					},
					"set": (value: any) => {
						if (typeof value !== "number" || isNaN(value))
							value = 0;
						value = Math.round(value);
						if (value < 0)
							value = 0;
						if (value > this.get("total"))
							value = this.get("total");
						this._data["value"] = value;
					}
				},
				"direction": {
					"get": (): any => {
						var dir = this._data["direction"]; 
						if (dir !== "vertical" && dir !== "horizontal")
							return "vertical";
						else
							return dir;
					},
					"set": (value: any) => {
						if (value !== "vertical" && value !== "horizontal")
							return;
						this._data["direction"] = value;
					}
				}
			});
		}
		
		
		protected init(): void {
			var root$ = $(this._);
			this._.innerHTML = "<span class='tui-scroll-thumb'></span>";
			var btnThumb = this._components["thumb"] = root$.children(".tui-scroll-thumb")[0];
			root$.attr("unselectable", "on");

			$(this._).mousedown((e) => {
				e.stopPropagation();
				e.preventDefault();
				var obj = e.target || e.srcElement;
				if (obj !== this._) {
					return;
				}
				if (this.get("total") <= 0)
					return;
				var dir = this.get("direction");
				var pos: number, thumbLen: number;
				if (dir === "vertical") {
					pos = (typeof e.offsetY === "number" ? e.offsetY : (<any>e)["originalEvent"].layerY);
					thumbLen = btnThumb.offsetHeight;
				} else {
					pos = (typeof e.offsetX === "number" ? e.offsetX : (<any>e)["originalEvent"].layerX);
					thumbLen = btnThumb.offsetWidth;
				}
				var v = this.posToValue(pos - thumbLen / 2);
				this.set("value", v);
				this.fire("scroll", { value: this.get("value"), type: "mousedown"});
				return false;
			});

			var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
			$(this._).on(mousewheelevt, (e: any) => {
				var ev = e.originalEvent;
				var delta = ev.detail ? ev.detail * (-120) : ev.wheelDelta;
				var page = this.get("page");
				//delta returns +120 when wheel is scrolled up, -120 when scrolled down
				var scrollSize = (Math.round(page / 2) > 1 ? Math.round(page / 2) : 1);
				var oldValue = this.get("value");
				if (delta <= -120) {
					this.set("value", oldValue + scrollSize);
				} else {
					this.set("value", oldValue - scrollSize);
				}
				if (oldValue !== this.get("value"))
					this.fire("scroll", { value: this.get("value"), type: "mousewheel"});
				e.stopPropagation();
				e.preventDefault();
			});

			var beginX = 0, beginY = 0, beginLeft = 0, beginTop = 0;
			var dragThumb = (e: any) => {
				var diff = 0;
				var oldValue = this.get("value");
				var pos: number;
				if (this.get("direction") === "vertical") {
					diff = e.clientY - beginY;
					pos = beginTop + diff;
				} else {
					diff = e.clientX - beginX;
					pos = beginLeft + diff;
				}
				this.set("value", this.posToValue(pos));
				if (oldValue !== this.get("value")) {
					this.fire("scroll", { value: this.get("value"), type: "drag" });
				}
			}

			var dragEnd = () => {
				$(this._).removeClass("tui-actived");
				this.fire("dragend", { value: this.get("value") });
			}

			$(btnThumb).mousedown((e) => {
				if (e.which !== 1)
					return;
				beginX = e.clientX;
				beginY = e.clientY;
				beginLeft = btnThumb.offsetLeft;
				beginTop = btnThumb.offsetTop;
				$(this._).addClass("tui-actived");
				openDragMask(dragThumb, dragEnd);
				this.fire("dragstart", { value: this.get("value") });
			});

			this.refresh();
		}
		
		private posToValue(pos: number) {
			var btnThumb = this._components["thumb"];
			var total: number = this.get("total");
			if (total <= 0) {
				return 0;
			}
			var len = 0;
			var val = 0;
			if (this.get("direction") === "vertical") {
				len = this._.clientHeight - btnThumb.offsetHeight;
				val = pos / len * total;
			} else {
				len = this._.clientWidth - btnThumb.offsetWidth;
				val = pos / len * total;
			}
			val = Math.round(val);
			return val;
		}

		private valueToPos(value: number): { pos: number; thumbLen: number; } {
			var minSize = 20;
			var total = this.get("total");
			var page = this.get("page");
			var vertical: boolean = (this.get("direction") === "vertical");
			if (total <= 0) {
				return { pos: 0, thumbLen: 0 };
			}
			var len = (vertical ? this._.clientHeight : this._.clientWidth);
			var thumbLen = Math.round(page / total * len);
			if (thumbLen < minSize)
				thumbLen = minSize;
			if (thumbLen > len - 10)
				thumbLen = len - 10;
			var scale = (value / total);
			if (scale < 0)
				scale = 0;
			if (scale > 1)
				scale = 1;
			var pos = Math.round(scale * (len - thumbLen)) - 1;
			return {
				"pos": pos, "thumbLen": thumbLen
			};
		}

		render() {
			var pos = this.valueToPos(this.get("value"));
			var vertical: boolean = (this.get("direction") === "vertical");
			var btnThumb = this._components["thumb"];
			if (vertical) {
				$(this._).removeClass("tui-horizontal");
				$(this._).addClass("tui-vertical");
				btnThumb.style.height = (pos.thumbLen > 0 ? pos.thumbLen : 0) + "px";
				btnThumb.style.top = pos.pos + "px";
				btnThumb.style.left = "";
				btnThumb.style.width = "";
			} else {
				$(this._).addClass("tui-horizontal");
				$(this._).removeClass("tui-vertical");
				btnThumb.style.width = (pos.thumbLen > 0 ? pos.thumbLen : 0) + "px";
				btnThumb.style.left = pos.pos + "px";
				btnThumb.style.top = "";
				btnThumb.style.height = "";
			}
		}
	}

	register(Scrollbar);
}