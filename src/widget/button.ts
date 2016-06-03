/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	/**
	 * <button>
	 * Attributes: value, text, type, checked, radio, group, disable
	 * Events: click, mousedown, mouseup, keydown, keyup
	 */
	export class Button extends Widget {

		protected initChildren(childNodes: Node[]) {
			if (childNodes && childNodes.length > 0)
				this._set("text", browser.toHTML(childNodes));
		}

		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"type": {
					"get": (): any => {
						if (this._data["type"])
							return this._data["type"];
						let parent = this.get("parent");
						if (parent && parent instanceof Group && parent.get("type"))
							return parent.get("type");
						return null;
					}
				},
				"value": {
					"get": (): any => {
						if (this._data["value"])
							return this._data["value"];
						return this.get("text");
					}
				},
				"checked": {
					"set": (value: any) => {
						this._data["checked"] = !!value;
						if (!value)
							this._data["tristate"] = false;
					}
				},
				"tristate": {
					"set": (value: any) => {
						this._data["tristate"] = !!value;
						if (value)
							this._data["checked"] = true;
					}
				}
			});
		}

		protected init(): void {
			var $root = $(this._);

			$root.attr({
                "unselectable": "on"
            });
			
			$root.mousedown((e) => {
				if (this.get("disable"))
					return;
                $root.focus();
				this.fire("mousedown", e);
			});
			
			$root.mouseup((e) => {
                if (this.get("disable"))
					return;
				this.fire("mouseup", e);
			});
			
			$root.keydown((e) => {
				if (this.get("disable"))
					return;
				this.fire("keydown", e);
			});
			
			$root.keyup((e) => {
                if (this.get("disable"))
					return;
				this.fire("keyup", e);
			});
			
			var onClick = (e: any) => {
				if (this.get("disable"))
					return;
				if (this.get("type") === "toggle" || this.get("type") === "toggle-radio") {
					this.set("checked", !this.get("checked"));
				} else if (this.get("type") === "radio")
					this.set("checked", true);
				
				let groupName = this.get("group");
				if (groupName && (this.get("type") === "radio" || 
					this.get("type") === "toggle-radio" && this.get("checked"))) {
					let result = search( (elem: Widget) => {
						if (elem.get("group") === groupName
							&& (elem.get("type") === "radio" || elem.get("type") === "toggle-radio")
							&& elem !== this)
							return true;
						else
							return false;
					})
					for (let elem of result) {
						elem.set("checked", false);
					}
				}
				var onclick = this.get("onclick");
				if (onclick) {
					eval.call(window, onclick);
				}
				this.fire("click", e);
			};

			$root.click(onClick);
			$root.keydown((e) => {
				if (e.keyCode === 13 || e.keyCode === 32) {
					e.preventDefault();
					onClick(e);
				}
			});
		}

		render(): void {
			var $root = $(this._);
			if (this.get("checked")) {
				$root.addClass("tui-checked");
			} else {
				$root.removeClass("tui-checked");
			}
            if (this.get("disable")) {
				$root.addClass("tui-disable");
				$root.removeAttr("tabIndex");
			} else {
				$root.removeClass("tui-disable");
				$root.attr("tabIndex", "0");
			}
			if (this.get("checked") && this.get("tristate")) {
				$root.addClass("tui-tristate");
			} else
				$root.removeClass("tui-tristate");
			var text = this.get("text");
			if (typeof text !== "string")
				text = "";
			$root.html(text);
		}
	}
	
	export class Check extends Button {
		init(): void {
			super.init();
			this._set("type", "toggle");
		}
	}
	export class Radio extends Button {
		init(): void {
			super.init();
			this._set("type", "radio");
		}
	}

	register(Button);
	register(Check);
	register(Radio);
}