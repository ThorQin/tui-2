/// <reference path="base.ts" />
module tui.widget {
	export abstract class Container extends Widget {
		protected _children: HTMLElement[];
		
		addChild(child: HTMLElement, index?: number): Container {
			if (typeof index === "number" && index >= 0 && index < this._children.length) {
				this._children.splice(index, 0, child);
			} else
				this._children.push(child);
			this.refresh();
			return this;
		}
		
		removeChild(child: HTMLElement): Container {
			let pos = this._children.indexOf(child);
			if (pos >= 0) {
				this._children.splice(pos, 1);
				this.refresh();
			}
			return this;
		}
		
		getChild(index: number): HTMLElement {
			return this._children[index];
		}
		
		getChildCount(): number {
			return this._children.length;
		}
	}
	
}