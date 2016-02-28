/// <reference path="base.ts" />
module tui.widget {
	/**
	 * Button
	 * Events: click
	 */
	export class Button extends Widget {

		setChildNodes(childNodes: Node[]) {
			this.data.set("value", browser.toHTML(childNodes));
		}

		init(): void {
			var root = this.getComponent();

			$(root).attr({
                "unselectable": "on"
            });
			
			$(root).mousedown((e) => {
                if (!this.data.get("disabled"))
					root.focus();
			});

			$(root).click((e) => {
                if (!this.data.get("disabled"))
					this.fire("click", e);
			});
		}

		render(): void {
			var root = this.getComponent();
			if (this.data.get("checked")) {
				$(root).addClass("tui-checked");
			} else {
				$(root).removeClass("tui-checked");
			}
            if (this.data.get("disabled")) {
				$(root).addClass("tui-disabled");
				$(root).removeAttr("tabIndex");
			} else {
				$(root).removeClass("tui-disabled");
				$(root).attr("tabIndex", "1");
			}
			var value = this.data.get("value");
			if (typeof value !== "string")
				value = "";
			$(root).html(value);
		}
	}

	register(Button);
}