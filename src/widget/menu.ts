/// <reference path="popup.ts" />
module tui.widget {
	"use strict";
	
	interface MenuItem {
		text: string;
		icon?: string;
		type?: string; // button(default), check, radio, menu, line
		group?: string;
		checked?: boolean;
		value?: any;
		children?: MenuItem[];
	}
	
	/**
	 * <menu>
	 * Attributes: content, direction, referPos, referElement, opened
	 * Method: open(), close()
	 * Events: open, close
	 */
	export class Menu extends Popup {
		private activeItem: number = null;
		setChildNodes(childNodes: Node[]) {
			var data: MenuItem[] = [];
			function hasChildItem(node: HTMLElement): boolean {
				for (var i =0; i < node.childNodes.length; i++) {
					var child = node.childNodes[i];
					if (getFullName(child) === "tui:item")
						return true;
				}
				return false;
			}
			function addChild(node: HTMLElement, items: MenuItem[]) {
				let item = new Item(node);
				let text = item.get("text");
				if (text === null)
					text = browser.getNodeOwnText(node);
				let menuItem: MenuItem = {
					"text": text
				};
				let type = item.get("type");
				if (type && /^(button|check|radio|menu|line)$/.test(type))
					menuItem.type = type;
				if (hasChildItem(node) && (typeof menuItem.type === UNDEFINED || menuItem.type === null))
					 menuItem.type = "menu";
				let icon = item.get("icon");	
				if (typeof icon === "string" && icon.trim().length > 0)
					menuItem.icon = icon;
				let checked = item.get("checked");	
				if (typeof checked === "boolean")
					menuItem.checked = checked;
				let group = item.get("group");	
				if (typeof group === "string" && group.length > 0)
					menuItem.group = group;
				let value = item.get("value");	
				if (value !== null && typeof value === UNDEFINED)
					menuItem.value = value;
				if (menuItem.type === "menu") {
					menuItem.children = [];
					addChildren(node.childNodes, menuItem.children);
				}
				items.push(menuItem);
			}
			function addChildren(childNodes: NodeList, items: MenuItem[]) {
				for (let i = 0; i < childNodes.length; i++) {
					let node = childNodes[i];
					if (getFullName(node) === "tui:item") {
						addChild(<HTMLElement>node, items);
					}
				}
			}
			addChildren(<NodeList><any>childNodes, data);
			if (data.length > 0)
				this.set("items", data);
		}
		
		open(refer: any, direction?: string): void {
			super.open(refer, direction);
			if (this.activeItem != null) {
				$(this._).children("div").removeClass("active");
				this.activeItem = null;
			}
		}
		
		init(): void {
			var $root = $(this._);
			$root.attr("tabIndex", "-1");
			$root.css("display", "none");
			browser.removeNode(this._);
			
			var data: MenuItem[] = this.get("items");
			if (data == null)
				data = [];
			for (let item of data) {
				let div = document.createElement("div");
				if (item.type !== "line") {
					$(div).attr({
						"tabIndex": "-1",
						"unselectable": "on" 
					});
					let icon = document.createElement("i");
					$(icon).addClass("icon");
					if (item.type === "check" || item.type === "radio") {
						if (item.checked)
							$(icon).addClass("fa-check");
					} else if (item.icon) {
						$(icon).addClass(item.icon);
					}
					let text = document.createTextNode(item.text);
					div.appendChild(icon);
					div.appendChild(text);
					if (item.type === "menu")
						$(div).addClass("menu");					
				} else
					$(div).addClass("line");
				this._.appendChild(div);
			}

			function findMenuItemDiv(elem: any): HTMLElement {
				var children = $root.children("div");
				for (let i = 0; i < children.length; i++) {
					let div = children[i];
					if ((typeof elem === "number" && elem === i) || 
						(typeof elem === "object" && browser.isAncestry(elem, div))) {
						return div;
					}
				}
				return null;
			};
			
			function findDivIndex(elem: HTMLElement) {
				var children = $root.children("div");
				for (let i = 0; i < children.length; i++) {
					let div = children[i];
					if (div === elem) {
						return i;
					}
				}
				return null;
			}
			
			$root.mousemove((e) => {
				var elem = e.target || e.srcElement;
				var div = findMenuItemDiv(elem);
				if (div !== null) {
					var found = findDivIndex(div);
					if (found !== this.activeItem) {
						var oldDiv = findMenuItemDiv(this.activeItem);
						$(oldDiv).removeClass("active");
						this.activeItem = found; 
						$(div).addClass("active");
						this._.focus();
						openSubMenu();
					}
				}
			});
			
			$root.mouseleave((e) => {
				if (this.activeItem != null) {
					var div = findMenuItemDiv(this.activeItem);
					$(div).removeClass("active");
					this.activeItem = null;
				}
			});
			
			var findItem = (from: number, step: number): number => {
				var data: MenuItem[] = this.get("items");
				for (var i = from; i < data.length && i >= 0; i = i + step) {
					if (data[i].type !== "line")
						return i;
				}
				return null;
			};
			
			
			$root.keydown((e) => {
				var c = e.keyCode;
				var data: MenuItem[] = this.get("items");
				e.stopPropagation();
				e.preventDefault();
				if (c === keyCode["ESCAPE"]) {
					this.close();
					if (this.get("referElement")) {
						this.get("referElement").focus();
					}					
				}
				if (data.length === 0) {
					this.activeItem = null;
					return;
				}
				if (c === keyCode["DOWN"] || c === keyCode["TAB"]) {
					if (this.activeItem === null) {
						this.activeItem = findItem(0, 1);
					} else {
						var oldDiv = findMenuItemDiv(this.activeItem);
						$(oldDiv).removeClass("active");
						this.activeItem = findItem(this.activeItem + 1, 1);
						if (this.activeItem === null)
							this.activeItem = 0;
					}
					let div = findMenuItemDiv(this.activeItem);
					div && $(div).addClass("active");
				} else if (c === keyCode["UP"]) {
					if (this.activeItem === null) {
						this.activeItem = findItem(data.length - 1, -1);
					} else {
						var oldDiv = findMenuItemDiv(this.activeItem);
						$(oldDiv).removeClass("active");
						this.activeItem = findItem(this.activeItem - 1, -1);
						if (this.activeItem === null)
							this.activeItem = data.length - 1;
					}
					let div = findMenuItemDiv(this.activeItem);
					div && $(div).addClass("active");
				} else if (c === keyCode["RIGHT"]) {
					openSubMenu();
				} else if (c === keyCode["ENTER"]) {
					if (this.activeItem !== null) {
						var item = data[this.activeItem];
						this.fire("click", item);
						this.close();
					}
				}
			});
		
			var openSubMenu = () => {
				var data: MenuItem[] = this.get("items");
				if (this.activeItem !== null) {
					var item = data[this.activeItem];
					if (item.type !== "menu")
						return;
					let childItems = item.children;
					let subMenu: Menu = <Menu>create(Menu, {"items": childItems});
					let div = findMenuItemDiv(this.activeItem);
					$(div).addClass("sub");
					subMenu.open(div, "rT");
					subMenu.on("close", function(){
						$(div).removeClass("sub");
					});
				}
			};
		}
	}
	
	register(Menu);
}