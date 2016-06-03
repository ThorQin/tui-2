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
		disable?: boolean;
		shortcut?: string;
		children?: MenuItem[];
	}
	
	/**
	 * <menu>
	 * Attributes: content, direction, referPos, referElement, opened
	 * Method: open(), close()
	 * Events: open, close, click
	 */
	export class Menu extends Popup {
		private activeItem: number = null;
		protected initChildren(childNodes: Node[]) {
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
				let shortcut = item.get("shortcut");	
				if (typeof shortcut === "string" && shortcut.trim().length > 0)
					menuItem.shortcut = shortcut;
				let checked = item.get("checked");
				if (typeof checked === "boolean")
					menuItem.checked = checked;
				let disable = item.get("disable");	
				if (typeof disable === "boolean")
					menuItem.disable = disable;
				if (menuItem.type === "radio") {
					let group = item.get("group");
					if (typeof group === "string" && group.length > 0)
						menuItem.group = group;
					else
						menuItem.group = "";
				} 
				let value = item.get("value");	
				if (value !== null && typeof value !== UNDEFINED)
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
				this._set("items", data);
		}
		
		open(refer: any, direction?: string): void {
			var data: MenuItem[] = this.get("items");
			if (data == null)
				data = [];
			this._.innerHTML = "";
			for (let item of data) {
				let div: Node;
				if (item.type !== "line") {
					div = browser.toElement("<div tabIndex='-1' unselectable='on'><span class='tui-icon'></span>" +
						"<span class='tui-arrow'></span><span class='tui-label'></span><span class='tui-shortcut'></span></div>");
					if (item.disable) {
						$(div).addClass("tui-disabled");
					}
					if (item.type === "check" || item.type === "radio") {
						if (item.checked) {
							$(div).children(".tui-icon").addClass("fa-check");
						}
					} else if (item.icon) {
						$(div).children(".tui-icon").addClass(item.icon);
					}
					$(div).children(".tui-label").html(item.text);
					if (typeof item.shortcut === "string")
						$(div).children(".tui-shortcut").html(item.shortcut);
					if (item.type === "menu")
						$(div).children(".tui-arrow").addClass("fa-caret-right");
					if (item.disable)
						$(div).addClass("tui-disabled");
				} else
					div = browser.toElement("<div class='tui-line'></div>");
				this._.appendChild(div);
			}
			super.open(refer, direction);
			if (this.activeItem != null) {
				$(this._).children("div").removeClass("tui-active");
				this.activeItem = null;
			}
		}
		
		protected init(): void {
			var $root = $(this._);
			$root.attr("tabIndex", "-1");
			$root.css("display", "none");
			browser.removeNode(this._);

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
			
			function findDivIndex (elem: HTMLElement) {
				var children = $root.children("div");
				for (let i = 0; i < children.length; i++) {
					let div = children[i];
					if (div === elem) {
						return i;
					}
				}
				return null;
			};
			
			var ie8hack = (div: HTMLElement, index:number) => {
				if (tui.ieVer >= 7 && tui.ieVer < 9) {
					var data: MenuItem[] = this.get("items");
					var item = data[index];
					var icon = $(div).children(".tui-icon")[0];
					if (item.type === "check" || item.type === "radio") {
						if (item.checked) {
							$(icon).removeClass("fa-check");
							setTimeout(function(){
								$(icon).addClass("fa-check");
							});
						}
					} else if (item.icon) {
						$(icon).removeClass(item.icon);
						setTimeout(function(){
							$(icon).addClass(item.icon);
						});
					}
					if (item.type === "menu") {
						var arrow = $(div).children(".tui-arrow")[0];
						$(arrow).removeClass("fa-caret-right");
						setTimeout(function(){
							$(arrow).addClass("fa-caret-right");
						});
					}
				}
			};
			
			function activeLine(index: number) {
				var div = findMenuItemDiv(index);
				$(div).addClass("tui-actived");
				ie8hack(div, index);
			};
			
			function deactiveLine(index: number) {
				var div = findMenuItemDiv(index);
				$(div).removeClass("tui-actived");
				ie8hack(div, index);
			};
			
			$root.mousemove((e) => {
				var elem = e.target || e.srcElement;
				var div = findMenuItemDiv(elem);
				if (div !== null) {
					var found = findDivIndex(div);
					if (found !== this.activeItem) {
						if (this.activeItem !== null) {
							deactiveLine(this.activeItem);
						}
						if ($(div).hasClass("tui-disabled")) {
							clearTimeout(openSubMenuTimer);
							this.activeItem = null;
							this._.focus();
							return;
						}
						this.activeItem = found; 
						activeLine(this.activeItem);
						if (!$(div).hasClass("tui-sub")) {
							this._.focus();
							openSubMenu();
						}
					}
				}
			});
			
			$root.on("touchstart", (e) => {
				var elem = e.target || e.srcElement;
				var div = findMenuItemDiv(elem);
				if (div !== null) {
					var found = findDivIndex(div);
					if (found !== this.activeItem) {
						if (this.activeItem !== null) {
							deactiveLine(this.activeItem);
						}
						if ($(div).hasClass("tui-disabled")) {
							clearTimeout(openSubMenuTimer);
							this.activeItem = null;
							this._.focus();
							return;
						}
						this.activeItem = found; 
						activeLine(this.activeItem);
						if (this.activeItem !== null) {
							var data: MenuItem[] = this.get("items");
							var item = data[this.activeItem];
							if (item.children && item.children.length > 0) {
								this._.focus();
								openSubMenu();
								e.preventDefault();
							}
						}
					}
				}
			});
			
			$root.mouseleave((e) => {
				if (this.activeItem != null) {
					deactiveLine(this.activeItem);
					this.activeItem = null;
				}
				clearTimeout(openSubMenuTimer);
			});
			
			$root.click((e) => {
				if (this.activeItem != null) {
					var data: MenuItem[] = this.get("items");
					var item = data[this.activeItem];
					if (item.type === "check") {
						item.checked = !item.checked;
					} else if (item.type === "radio") {
						if (typeof item.group === "string") {
							for (let it of data) {
								if (it.type === "radio" && it.group == item.group) {
									it.checked = false;
								}
							}
						}
						item.checked = true;
					}
					this.fire("click", {e:e, item:item});
					this.close();
				}
			});
			
			var findItem = (from: number, step: number): number => {
				var data: MenuItem[] = this.get("items");
				for (var i = from; i < data.length && i >= 0; i = i + step) {
					if (data[i].type !== "line" && !data[i].disable)
						return i;
				}
				return null;
			};
			
			
			$root.keydown((e) => {
				var c = e.keyCode;
				var data: MenuItem[] = this.get("items");
				function stopEvent() {
					e.stopPropagation();
					e.preventDefault();					
				}
				if (c === KeyCode.ESCAPE) {
					stopEvent();
					this.close();
					if (this.get("referElement")) {
						this.get("referElement").focus();
					}					
				} else if (c === KeyCode.LEFT) {
					stopEvent();
					if (popStack.length < 2 || !(popStack[popStack.length - 2] instanceof Menu))
						return;
					popStack[popStack.length - 2]._.focus();
				}
				if (data.length === 0) {
					this.activeItem = null;
					return;
				}
				if (c === KeyCode.DOWN || c === KeyCode.TAB) {
					stopEvent();
					if (this.activeItem === null) {
						this.activeItem = findItem(0, 1);
					} else {
						deactiveLine(this.activeItem);
						this.activeItem = findItem(this.activeItem + 1, 1);
						if (this.activeItem === null)
							this.activeItem = 0;
					}
					activeLine(this.activeItem);
				} else if (c === KeyCode.UP) {
					stopEvent();
					if (this.activeItem === null) {
						this.activeItem = findItem(data.length - 1, -1);
					} else {
						deactiveLine(this.activeItem);
						this.activeItem = findItem(this.activeItem - 1, -1);
						if (this.activeItem === null)
							this.activeItem = data.length - 1;
					}
					activeLine(this.activeItem);
				} else if (c === KeyCode.RIGHT) {
					stopEvent();
					openSubMenu();
				} else if (c === KeyCode.ENTER) {
					stopEvent();
					if (this.activeItem !== null) {
						var item = data[this.activeItem];
						this.fire("click", {e:e, item:item});
						this.close();
					}
				}
			});
			var openSubMenuTimer: number = null;
			var openSubMenu = () => {
				var data: MenuItem[] = this.get("items");
				if (this.activeItem !== null) {
					clearTimeout(openSubMenuTimer);
					
					var item = data[this.activeItem];
					if (item.type !== "menu")
						return;
					let div = findMenuItemDiv(this.activeItem);
					if ($(div).hasClass("tui-sub"))
						return;
					let itemIndex = this.activeItem;
					openSubMenuTimer = setTimeout(() => {
						let childItems = item.children;
						let subMenu: Menu = <Menu>create(Menu, {"items": childItems});
						if ($(this._).hasClass("tui-big"))
							$(subMenu._).addClass("tui-big");
						$(div).addClass("tui-sub");
						ie8hack(div, itemIndex);
						subMenu.open(div, "rT");
						subMenu.on("close", function(){
							$(div).removeClass("tui-sub");
							ie8hack(div, itemIndex);
						});
						subMenu.on("click", (e) => {
							this.fire("click", e.data);
							this.close();
						});
					}, 200);
				}
			};
		}
	}
	
	register(Menu);
}