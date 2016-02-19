/// <reference path="base.ts" />
module tui.widget {
	/**
	 * Button
	 * Events: click
	 */
	export class Button extends Widget {
		init(): void {
			var root = this.getComponent();
			$(root).click((e) => {
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
		}
	}
	
	register(Button);
}