/// <reference path="base.ts" />
module tui.widget {
	/**
	 * Button
	 * Events: click
	 */
	export class Button extends Widget {
        
		init(): void {
			var root = this.getComponent();
			
			$(root).attr({
                "unselectable": "on"
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
		}
	}
	
	register(Button);
}