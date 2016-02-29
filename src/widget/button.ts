/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	/**
	 * Button
	 * Attributes: value, checkable, checked, radio, group, disabled
	 * Events: click, mousedown, mouseup, keydown, keyup
	 */
	export class Button extends Widget {

		setChildNodes(childNodes: Node[]) {
			if (childNodes && childNodes.length > 0)
				this.set("value", browser.toHTML(childNodes));
		}

		init(): void {
			var $root = $(this.getComponent());

			$root.attr({
                "unselectable": "on"
            });
			
			$root.mousedown((e) => {
				if (this.get("disabled"))
					return;
                $root.focus();
				this.fire("mousedown", e);
			});
			
			$root.mouseup((e) => {
                if (this.get("disabled"))
					return;
				this.fire("mouseup", e);
			});
			
			$root.keydown((e) => {
				if (this.get("disabled"))
					return;
				this.fire("keydown", e);
			});
			
			$root.keyup((e) => {
                if (this.get("disabled"))
					return;
				this.fire("keyup", e);
			});
			
			var onClick = (e: any) => {
				if (this.get("disabled"))
					return;
				if (this.get("checkable")) {
					this.set("checked", !!!this.get("checked"));
					let groupName = this.get("group");
					if (groupName && this.get("checked") && this.get("radio")) {
						let result = search( (elem: Widget) => {
							if (elem.get("group") === groupName
								&& elem.get("checkable")
								&& elem.get("radio")
								&& elem !== this)
								return true;
							else
								return false;
						})
						for (let elem of result) {
							elem.set("checked", false);
						}
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
			var $root = $(this.getComponent());
			if (this.get("checked")) {
				$root.addClass("tui-checked");
			} else {
				$root.removeClass("tui-checked");
			}
            if (this.get("disabled")) {
				$root.addClass("tui-disabled");
				$root.removeAttr("tabIndex");
			} else {
				$root.removeClass("tui-disabled");
				$root.attr("tabIndex", "1");
			}
			var value = this.get("value");
			if (typeof value !== "string")
				value = "";
			$root.html(value);
		}
	}

	register(Button);
}