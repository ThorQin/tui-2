/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <group>
	 * Attributes: name, type
	 * Events: 
	 */
	export class Group extends Widget {
		
		setChildNodes(childNodes: Node[]) {
			for (let node of childNodes) {
				this._.appendChild(node);
			}
		}

		init(): void {
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
	
	export class ButtonGroup extends Group {}
	
	register(Group);
	register(ButtonGroup);
}