/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <input>
	 * Attributes: value, text, type, checked, radio, group, disable
	 * Events: click, mousedown, mouseup, keydown, keyup
	 */
	export class Input extends Widget {
		
		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"value": {
					"set": (value: any) => {
						var textbox = <HTMLInputElement>this._components["textbox"];
						if (textbox) {
							textbox.value = value;
						}
						this._data["value"] = value;
					},
					"get": (): any => {
						var textbox = <HTMLInputElement>this._components["textbox"];
						if (textbox) {
							return textbox.value;
						}
						return this._data["value"];
					}
				},
				"text": {
					"set": (value: any) => {
						this._set("value", value);
					},
					"get": (): any => {
						return this.get("value");
					}
				}
			});
		}
		
		protected init(): void {
			var $root = $(this._);
			var textbox = this._components["textbox"] = document.createElement("input");
			var value = this.get("value");
			this._.appendChild(textbox);
			textbox.value = (value !== null ? value : "");
		}
		
		render(): void {
			var $root = $(this._);
            if (this.get("disable")) {
				$root.addClass("tui-disable");
				$root.removeAttr("tabIndex");
			} else {
				$root.removeClass("tui-disable");
				$root.attr("tabIndex", "0");
			}
			var text = this.get("text");
			if (typeof text !== "string")
				text = "";
			$root.html(text);
		}
	}
}