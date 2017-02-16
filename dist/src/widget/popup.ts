/// <reference path="base.ts" />
/// <reference path="../browser/keyboard.ts" />
module tui.widget {
	"use strict";
	
	export var popStack: Popup[] = [];
	
	function findPopupToClose(bindElem?: HTMLElement) {
		var index = 0;
		if (bindElem && bindElem.nodeName) {
			for (let i = 0; i < popStack.length; i++) {
				let item = popStack[i];
				if (browser.isAncestry(bindElem, item._)) {
					index = i + 1;
					break;
				}
			}
		}
		if (index < popStack.length)
			popStack[index].close();
	}
	
	setInterval( function () {
		findPopupToClose(<HTMLElement>document.activeElement);
	}, 50);

	// $(window).on("mousedown", function(){
	// 	popStack[0] && popStack[0].close();
	// });
	
	/**
	 * <popup>
	 * Attributes: content, direction, referPos, referElement, opened
	 * Method: open(), close()
	 * Events: open, close
	 */
	export class Popup extends Widget {
		
		private popIndex: number = null;
		private referRect: browser.Rect = null;
		private checkInterval: number = null;
		
		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"content": {
					"set": (value: any): void => {
						this._data["content"] = value;
						if (typeof value === "string")
							this._.innerHTML = value;
						else if (value && value.nodeName)
							this._.appendChild(value);
					}
				}
			});
		}
	
		protected initChildren(childNodes: Node[]) {
			if (childNodes.length > 0) {
				var div = document.createElement("div");
				for (let node of childNodes) {
					div.appendChild(node);
				}
				this._set("content", div);
			}
		}
	
		protected init(): void {
			var $root = $(this._);
			$root.attr("tabIndex", "-1");
			$root.css("display", "none");
			var content = this.get("content");
			if (typeof content === "string")
				$root.html(content);
			else if (content && content.nodeName)
				$root.append(content);
			widget.init(this._);
			browser.removeNode(this._);
			
			$root.keydown((e) => {
				var c = e.keyCode;
				if (c === browser.KeyCode.ESCAPE) {
					this.close();
					if (this.get("referElement")) {
						this.get("referElement").focus();
					}
				}	
			});

			$(this._).mousedown(function(e){
				e.stopImmediatePropagation();
			});
		}
		
		private refProc = () => {
			this.render();
		};
		
		open(refer: HTMLElement, direction?: string): void;
		open(refer: Position, direction?: string): void;
		open(refer: any, direction?: string): void {
			if (this.get("opened"))
				return;
			
			if (typeof refer === "string")
				refer = document.getElementById(refer);
			if (typeof direction === UNDEFINED)
				direction = "Lb";
			if (typeof direction !== "string" || !/^[lLrR][tTbB]$/.test(direction)) {
				throw new SyntaxError("Invalid popup direction value");
			}
			if (typeof refer === "object" && refer.nodeName) {
				this._set("referElement", refer);
				findPopupToClose(refer);
				this.referRect = browser.getRectOfScreen(refer);
				this.checkInterval = setInterval(() => {
					let newRect = browser.getRectOfScreen(refer);
					if (newRect.left !== this.referRect.left ||
						newRect.top !== this.referRect.top || 
						newRect.width !== this.referRect.width ||
						newRect.height !== this.referRect.height) {
						this.referRect = newRect;
						this.render();
					}
				}, 16);
				$(window).on("resize scroll", this.refProc);
			} else if (typeof refer === "object" && typeof refer.left === "number" && typeof refer.top === "number") {
				this._set("referPos", refer);
				findPopupToClose();
			} else
				throw new SyntaxError("Invalid popup refer value, must be an element or position");

			this.popIndex = popStack.push(this) - 1;
			this._set("direction", direction);
			this._set("opened", true);
			$(this._).css({
				"display": "block",
				"position": "fixed"
			});
			this.appendTo(document.body); // Will cause refresh
			widget.init(this._); // refresh children
			this.render(); // refresh self again
			this._.focus();
			this.fire("open");
		}
		
		private closeSelf(): void {
			browser.removeNode(this._);
			this._set("opened", false);
			if (this.checkInterval != null) {
				clearInterval(this.checkInterval);
				this.checkInterval = null;
			}
			$(window).off("resize scroll", this.refProc);
			this.fire("close");
		}
		
		close(): void {
			if (!this.get("opened"))
				return;
			for (let i = this.popIndex; i < popStack.length; i++) {
				let item = popStack[i];
				item.closeSelf();
			}
			popStack.splice(this.popIndex, popStack.length - this.popIndex + 1);
		}
		
		render(): void {
			if (!this.get("opened"))
				return;		
			var root = this._;
			
			var ww = $(window).width();
			var wh = $(window).height();
			root.style.left = "0px";
			root.style.top = "0px";
			root.style.width = "";
			root.style.width = root.clientWidth + 1 + "px";
			var ew = root.offsetWidth;
			var eh = root.offsetHeight;
			var box: browser.Rect = { left: 0, top: 0, width: 0, height: 0 };
			var pos: browser.Position = { left:0, top: 0};
			if (this.get("referPos")) {
				box = this.get("referPos");
				box.width = 0;
				box.height = 0;
			} else if (this.get("referElement")) {
				box = browser.getRectOfScreen(this.get("referElement"));
			}
			// lower case letter means 'next to', upper case letter means 'align to'
			var compute: {[index: string]: any} = {
				"l": function () {
					pos.left = box.left - ew;
					if (pos.left < 2)
						pos.left = box.left + box.width;
				}, 
				"r": function () {
					pos.left = box.left + box.width;
					if (pos.left + ew > ww - 2)
						pos.left = box.left - ew;
				}, 
				"t": function () {
					pos.top = box.top - eh;
					if (pos.top < 2)
						pos.top = box.top + box.height;
				}, 
				"b": function () {
					pos.top = box.top + box.height;
					if (pos.top + eh > wh - 2)
						pos.top = box.top - eh;
				}, 
				"L": function () {
					pos.left = box.left;
					if (pos.left + ew > ww - 2)
						pos.left = box.left + box.width - ew;
				}, 
				"R": function () {
					pos.left = box.left + box.width - ew;
					if (pos.left < 2)
						pos.left = box.left;
				}, 
				"T": function () {
					pos.top = box.top;
					if (pos.top + eh > wh - 2)
						pos.top = box.top + box.height - eh;
				}, 
				"B": function () {
					pos.top = box.top + box.height - eh;
					if (pos.top < 2)
						pos.top = box.top;
				}
			};
			let direction = this.get("direction");
			compute[direction.substring(0, 1)](); // parse left
			compute[direction.substring(1, 2)](); // parse top
			
			if (pos.left > ww - 2)
				pos.left = ww - 2;
			if (pos.left < 2)
				pos.left = 2;
			if (pos.top > wh - 2)
				pos.top = wh - 2;
			if (pos.top < 2)
				pos.top = 2;

			root.style.left = pos.left + "px";
			root.style.top = pos.top + "px";
		}
	}
	
	register(Popup, "popup");
	
}