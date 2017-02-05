module tui.widget {
	"use strict";
	
	interface NaviItem {
		text: string;
		name?: string;
		path?: string;
		icon?: string;
		expand?: boolean;
		children?: NaviItem[];
	}

	export class Navigator extends Widget {

		private _activeItem: HTMLElement;

		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"items": {
					"get": (): any => {
						var items = this._data["items"];
						return items ? items : [];							
					}
				},
				"activeItem": {
					"set": (value: any) => {},
					"get": (): any => {
						if (this._activeItem != null) {
							return (<any>this._activeItem).item;
						}
					}
				}
			});
		}

		protected initChildren(childNodes: Node[]) {
			var data: NaviItem[] = [];
			function addChild(node: HTMLElement, items: NaviItem[]) {
				let item = new Item(node);
				let text = item.get("text");
				if (text === null)
					text = $.trim(browser.getNodeOwnText(node));
				let naviItem: NaviItem = {
					"text": text
				};
				naviItem.name = item.get("name");
				naviItem.path = item.get("path");
				naviItem.icon = item.get("icon");
				naviItem.expand = item.get("expand");
				let children: NaviItem[] = [];
				addChildren(node.childNodes, children);
				if (children.length > 0)
					naviItem.children = children;
				items.push(naviItem);
			}
			function addChildren(childNodes: NodeList, data: NaviItem[]) {
				for (let i = 0; i < childNodes.length; i++) {
					let node = childNodes[i];
					if (getFullName(node) === "tui:item") {
						addChild(<HTMLElement>node, data);
					}
				}
				
			}
			addChildren(<NodeList><any>childNodes, data);
			if (data.length > 0)
				this._set("items", data);
		}

		private checkScroll() {
			var container = this._components["container"];
			var up = this._components["up"];
			var down = this._components["down"]
			if (container.scrollTop == 0) {
				up.style.display = "none";
			} else {
				up.style.display = "block";
			}
			if (container.scrollTop == container.scrollHeight - container.clientHeight) {
				down.style.display = "none";
			} else {
				down.style.display = "block";
			}
		}

		protected init(): void {
			var container = this._components["container"] = document.createElement("div");
			var up = this._components["up"] = document.createElement("div");
			var down = this._components["down"] = document.createElement("div");
			container.className = "tui-container";
			up.className = "tui-up";
			down.className = "tui-down";
			this._.appendChild(container);
			this._.appendChild(up);
			this._.appendChild(down);
			var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
			$(this._).on(mousewheelevt, (ev) => {
				var e = <any>ev.originalEvent;
				var delta = e.detail ? e.detail * (-1) : e.wheelDelta;
				if (delta <= 0) {
					if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
						ev.preventDefault();
					}
				} else {
					if (container.scrollTop <= 0) {
						ev.preventDefault();
					}
				}
				ev.stopPropagation();
				ev.stopImmediatePropagation();
			});
			this.on("resize", () => {
				var scrollbarWidth = container.offsetWidth - container.clientWidth;
				container.style.width = this._.offsetWidth + scrollbarWidth + "px";
				this.checkScroll();
			});
			container.onscroll = (e) => {
				this.checkScroll();
			};
			function findLine(elem: HTMLElement): HTMLElement {
				if (!elem)
					return null;
				if ($(elem).hasClass("tui-line"))
					return elem;
				else
					return findLine(elem.parentElement);
			}
			$(container).on("click keydown", (e) => {
				var elem: HTMLElement = <any>e.target || e.srcElement;
				elem = findLine(elem);
				if (e.type === "keydown" && e.keyCode != browser.KeyCode.ENTER)
					return;
				if (elem) {
					var $elem = $(elem);
					if ($elem.hasClass("tui-expand")) {
						this.collapse(elem);
					} else if ($elem.hasClass("tui-collapse")) {
						this.expand(elem);
					} else {
						this.active(elem);
						if (this.fire("select", (<any>elem).item) === false)
							return;
						if (this.get("openPath")) {
							let item: NaviItem = (<any>elem).item;
							if (item && item.path) {
								window.location.href = item.path;
							}
						}
					}
				}
			});
		}

		private collapse(elem: HTMLElement) {
			var $elem = $(elem);
			(<any>elem).item.expand = false;
			if (!$elem.hasClass("tui-collapse")) {
				$elem.removeClass("tui-expand");
				$elem.addClass("tui-collapse");
				$elem.next().animate({height: "toggle"}, () => {
					this.checkScroll();
				});
			}
		}

		private expand(elem: HTMLElement) {
			var $elem = $(elem);
			(<any>elem).item.expand = true;
			if (!$elem.hasClass("tui-expand")) {
				$elem.removeClass("tui-collapse");
				$elem.addClass("tui-expand");
				$elem.next().animate({height: "toggle"}, () => {
					this.checkScroll();
				});
			}
		}

		private active(elem: HTMLElement) {
			var container = this._components["container"];
			var rc = tui.browser.getRectOfParent(elem);
			if (rc.top >= container.scrollTop && rc.top + rc.height <= container.scrollTop + container.clientHeight) {
				// It's in visible.
			} else if (rc.top < container.scrollTop) {
				container.scrollTop = rc.top;
			} else if (rc.top + rc.height > container.scrollTop + container.clientHeight) {
				container.scrollTop = (rc.top + rc.height - container.clientHeight);
			}
			if (this._activeItem)
				$(this._activeItem).removeClass("tui-active");
			if (this.get("selectable")) {
				$(elem).addClass("tui-active");
				this._activeItem = elem;
			}
		}

		private drawItems(parent: HTMLElement, items: NaviItem[], level: number) {
			for (var item of items) {
				var line = document.createElement("div");
				(<any>line).item = item;
				var $line = $(line);
				$line.attr("unselectable", "on");
				$line.attr("tabIndex", "0");
				$line.addClass("tui-line");
				$line.text(item.text);
				if (level > 0)
					$line.addClass("tui-child");
				if (item.icon) {
					var icon = document.createElement("i");
					icon.className = item.icon;
					line.insertBefore(icon, line.firstChild);
				}
				if (item.path)
					line.setAttribute("path", item.path);
				if (item.name)
					line.setAttribute("name", item.name);
				var space = document.createElement("span");
				space.style.display = "inline-block";
				space.style.width = 20 * level + "px";
				line.insertBefore(space, line.firstChild);
				parent.appendChild(line);
				if (item.children && item.children.length > 0) {
					var subArea = document.createElement("div");
					subArea.className = "tui-sub";
					if (item.expand) {
						$line.addClass("tui-expand");
						subArea.style.display = "block";
					} else {
						$line.addClass("tui-collapse");
						subArea.style.display = "none";
					}
					this.drawItems(subArea, item.children, level+1);
					parent.appendChild(subArea);
				}
			}
		}

		private _activeBy(parent: HTMLElement, key: string, value: string): boolean {
			for (var i = 0; i < parent.children.length; i++) {
				var node = parent.children[i];
				if ($(node).hasClass("tui-line")) {
					if ((<any>node).item[key] === value) {
						this.active(<HTMLElement>node);
						return true;
					}
				} else if ($(node).hasClass("tui-sub")) {
					if (this._activeBy(<HTMLElement>node, key, value)) {
						this.expand($(node).prev()[0]);
						return true;
					}
				}
			}
			return false;
		}

		activeBy(key: string, value: string) {
			var container = this._components["container"];
			this._activeBy(container, key, value);
		}

		render(): void {
			var items: NaviItem[] = this.get("items");
			var container = this._components["container"];
			container.innerHTML = "";
			this.drawItems(container, items, 0);
			this.checkScroll();
		}
	}

	register(Navigator, "navigator");
	registerResize("navigator");
}