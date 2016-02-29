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
			
		}
	}
	
	register(Group);
}