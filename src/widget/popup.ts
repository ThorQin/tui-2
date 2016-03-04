/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	
	var stack: Popup[];
	
	function findPopupToClose(bindElem?: HTMLElement) {
		var index = 0;
		if (bindElem && bindElem.nodeName) {
			for (let i = 0; i < stack.length; i++) {
				let item = stack[i];
				if (browser.isAncestry(bindElem, item.getComponent())) {
					index = i + 1;
					break;
				}
			}
		}
		for (let i = index; i < stack.length; i++) {
			let item = stack[i];
			item.close();
		}
		stack.splice(index, stack.length - index + 1);
	}
	
	export class Popup extends Widget {
	
		setChildNodes(childNodes: Node[]) {
			var div = document.createElement("div");
			for (let node of childNodes) {
				div.appendChild(node);
			}
			this.set("content", div);
		}
	
		init(): void {
			var $root = $(this.getComponent());
			$root.attr("tabIndex", "-1");
			var content = this.get("content");
			if (typeof content === "string")
				$root.html(content);
			else	
				$root.append(content);
			widget.init(this.getComponent());
		}
		
		open(refer: any, direction?: string): void {
			if (this.get("opened"))
				return;
			if (typeof refer === "string")
				refer = document.getElementById(refer);
			if (typeof direction === UNDEFINED)
				direction = "LT";
			if (typeof direction !== "string" || !/^[lLrR][tTbB]$/.test(direction)) {
				throw new SyntaxError("Invalid popup direction value");
			}
			if (typeof refer === "object" && refer.nodeName) {
				this.set("referElement", refer);
				findPopupToClose(refer);
			} else if (typeof refer === "object" && typeof refer.x === "number" && typeof refer.y === "number") {
				this.set("referPos", refer);
				findPopupToClose();
			} else
				throw new SyntaxError("Invalid popup refer value, must be an element or position");
			this.set("direction", direction);
			
			var show = () => {
				this.set("opened", true);
				this.appendTo(document.body);
				this.getComponent().focus();
				this.render();
			}
			setTimeout(show, 0);
			return;
		}
		
		close(): void {
			// TODO: NOT FINISHED
			return;
		}
		
		render(): void {
			var root = this.getComponent();
			
			
			widget.init(this.getComponent()); // refresh children
		}
	}
	
	register(Popup);
	
}