/// <reference path="base.ts" />

module tui.widget {
	"use strict";
	
	$(function(){
		var searchGrid: () => NodeListOf<Element>;
		if (typeof (<any>document.body).scopeName === "string") {
			searchGrid = function(){
				return document.getElementsByTagName("grid");
			};
		} else {
			searchGrid = function(){
				return document.getElementsByTagName("tui:grid");
			};
		}
		
		function adjustHead(){
			var grids = searchGrid();
			for (var i = 0; i < grids.length; i++) {
				var grid: any = grids[i];
				if (grid.scopeName && grid.scopeName.toUpperCase() !== "TUI")
					continue;
				if (grid.__widget__)
					grid.__widget__.checkSize();
			}
			requestAnimationFrame(adjustHead)
		}
		requestAnimationFrame(adjustHead);
	});
	

	export class Grid extends Widget {

		private _width: number = null;
		private _height: number = null;
		
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
					}
				},
				"tree": {
					"set": (value: any) => {
						if (value instanceof ds.Tree ||
							value instanceof ds.RemoteTree)
							this._data["data"] = value;
						else if (value instanceof Array) {
							this._data["data"] = new ds.Tree(value);
						}
					}
				}
			});
		}

		protected init(): void {
			this._.innerHTML = "<div class='tui-grid-head'></div><div class='tui-content'></div>";
			var head = this._components["head"] = $(this._).children(".tui-grid-head")[0];
			var content = this._components["content"] = $(this._).children(".tui-content")[0];
			var hbar = <Scrollbar>tui.create("scrollbar", {direction: "horizontal"});
			this._components["hScroll"] = hbar.appendTo(this._, false)._;
			var vbar = <Scrollbar>tui.create("scrollbar");
			this._components["vScroll"] = vbar.appendTo(this._, false)._;
			
			this.on("resize", () => {
				this.get("data")
			});
		}
		
		
		checkSize() {
			if (this._.scrollWidth != this._width) {
				this._width = this._.scrollWidth;
				this.fire("resize");
			} else if (this._.scrollHeight != this._height) {
				this._height = this._.scrollHeight;
				this.fire("resize");
			}
		}
		
		render(): void {
			
		}
	}

	register(Grid);
}