/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	
    /**
	 * <tui:input-frame>
	 * Attributes: label, value, name
	 * Events: 
	 */
	export class InputFrame extends Widget {
		protected initChildren(childNodes: Node[]) {
			for (let node of childNodes) {
                if ((<any>node).__widget__) {
				    this._.appendChild(node);
                    break;
                }
			}
		}
		
		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"value": {
					"set": (value: any) => {
                        var result = search(this._);
						if (result.length > 0)
                            result[0].set("value", value);
					},
					"get": (): any => {
                        var result = search(this._);
						if (result.length > 0)
                            return result[0].get("value");
                        else
                            return null;
					}
				}
			});
		}

		protected init(): void {
			widget.init(this._);
		}
		
		render(): void {
			var root = this._;
			var result = search(root);
			for (let child of result) {
				child.render();
			}
		}
	}
}