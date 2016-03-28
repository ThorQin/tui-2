/// <reference path="base.ts" />

module tui.widget {
	"use strict";

	export class Grid extends Widget {
		
		protected init(): void {
			this._.innerHTML = "<div class='tui-grid-head'></div><div class='tui-content'></div>";
			var head = this._components["head"] = $(this._).children(".tui-grid-head")[0];
			var content = this._components["content"] = $(this._).children(".tui-content")[0];
			$(this._).scroll((e) => {
				head.style.top = this._.scrollTop + "px";
			});
		}
		
		render(): void {
			
		}
	}

	register(Grid);
}