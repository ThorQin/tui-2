/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	export class Group extends Widget {
		
		setChildNodes(childNodes: Node[]) {
			for (let node of childNodes) {
				this.getComponent().appendChild(node);
			}
		}

		init(): void {
			widget.init(this.getComponent());
		}
		
		render(): void {
			var root = this.getComponent();
			var result = search(root);
			if (this.get("name")) {
				for (let child of result) {
					child.set({
						"group": this.get("name"),
					});
				}
			}
		}
	}
	
	export class ButtonGroup extends Group {}
	
	register(Group);
	register(ButtonGroup);
}