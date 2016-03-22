/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	/**
	 * <button>
	 * Attributes: value, text, type, checked, radio, group, disable
	 * Events: click, mousedown, mouseup, keydown, keyup
	 */
	export class Button extends Widget {

		setChildNodes(childNodes: Node[]) {
			if (childNodes && childNodes.length > 0)
				this.set("text", browser.toHTML(childNodes));
		}

		getPropertyControls(): { [index: string]: PropertyControl } {
			var props = super.getPropertyControls();
			props["type"] = {
				"get": (): any => {
					if (this._data["type"])
						return this._data["type"];
					let parent = this.get("parent");
					if (parent && parent instanceof Group && parent.get("type"))
						return parent.get("type");
					return null;
				}
			};
			props["value"] = {
				"get": (): any => {
					if (this._data["value"])
						return this._data["value"];
					return this.get("text");
				}
			};
			return props;
		}

		init(): void {
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
				$root.attr("tabIndex", "1");
			}
			var text = this.get("text");
			if (typeof text !== "string")
				text = "";
			$root.html(text);
		}
	}
	
	export class Check extends Button {
		init(): void {
			super.init();
			this.set("type", "toggle");
		}
	}
	export class Radio extends Button {
		init(): void {
			super.init();
			this.set("type", "radio");
		}
	}

	register(Button);
	register(Check);
	register(Radio);
}