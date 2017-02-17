/// <reference path="../../src/widget/base.ts" />

module tui.widget.ext {
	"use strict";

	export class Picture extends Widget {

		render() {
			this._.innerHTML = this.get("value");
		}

	}

	register(Picture, "picture");

}