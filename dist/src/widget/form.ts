/// <reference path="base.ts" />


module tui.widget {
	"use strict";

	export interface FormItem {
		type: string;
		label: string | null;
		key?: string | null;
		value?: any;
		validate?: string[];
		size?: number;
		newline?: boolean;
		disable?: boolean;
		important?: boolean;
	}

	export interface FormControlConstructor {
		new (form: Form, define: FormItem): FormControl;
		icon: string;
		desc: string;
		order: number;
	}

	var _controls: {[index: string]: FormControlConstructor} = {};

	interface ControlDesc {
		type: string;
		name: string;
		icon: string;
		order: number;
	}

	export class Form extends Widget {
		protected _definitionChanged: boolean;
		protected _items: FormControl[];

		public static register(type: string, controlType: FormControlConstructor): void {
			_controls[type] = controlType;
		}

		protected removeAll() {
			for (let item of this._items) {
				item.hide();
			}
			this._items = [];
		}

		protected hideAll() {
			for (let item of this._items) {
				item.hide();
			}
		}

		protected selectItem(target: FormControl) {
			for (let item of this._items) {
				if (item !== target)
					item.select(false);
				else
					item.select(true);
			}
		}

		protected initRestriction(): void {
			super.initRestriction();
			this._items = [];
			this.setRestrictions({
				"definition": {
					"set": (value: any) => {
						if (value instanceof Array) {
							this.removeAll();
							for (let define of <FormItem[]>value) {
								let cstor = _controls[define.type];
								if (cstor) {
									this._items.push(new cstor(this, define));
								}
							}
						} else if (value === null) {
							this.removeAll();
						}
					},
					"get": (): any => {
						var result: FormItem[] = [];
						for (let item of this._items) {
							result.push(item.define);
						}
						return result;
					}
				},
				"value": {
					"set": (value: any) => {
						if (value === null) {
							for (let item of this._items) {
								item.setValue(null);
							}
						} else if (typeof value === "object") {
							for (let item of this._items) {
								let k = item.getKey();
								if (k && value.hasOwnProperty(k)) {
									item.setValue(value[k]);
								}
							}
						}
					},
					"get": (): any => {
						var value: {[index: string]: any} = {};
						for (let item of this._items) {
							let k = item.getKey();
							if (k) {
								value[k] = item.getValue();
							}
						}
						return value;
					}
				}
			});
		}

		protected init(): void {
			var toolbar = this._components["toolbar"] = elem("div");
			toolbar.className = "tui-form-toolbar";
			var title = elem("div");
			title.className = "tui-form-title";
			var buttons = elem("div");
			buttons.className = "tui-form-buttons";
			var btnPrint = elem("span");
			btnPrint.className = "tui-form-btn tui-form-btn-print";

			var newItem = this._components["newitem"] = elem("div");
			newItem.className = "tui-form-new-item-box";

			buttons.appendChild(btnPrint);
			toolbar.appendChild(title);
			toolbar.appendChild(buttons);
			this._.appendChild(toolbar);
			this.on("resize", () => {
				this.render();
			});
			this.on("itemremove", (e: any) => {
				var pos = this._items.indexOf(e.data.control);
				if (pos >= 0) {
					this._items.splice(pos, 1);
					e.data.control.hide();
					this.render();
				}
			});
			this.on("itemresize", (e: any) => {
				this.render();
			});
			this.on("itemmoveup", (e: any) => {
				var pos = this._items.indexOf(e.data.control);
				if (pos > 0) {
					var tmp = this._items[pos];
					this._items[pos] = this._items[pos - 1];
					this._items[pos - 1] = tmp;
					this.hideAll();
					this.render();
				}
			});
			this.on("itemmovedown", (e: any) => {
				var pos = this._items.indexOf(e.data.control);
				if (pos >= 0 && pos < this._items.length - 1) {
					var tmp = this._items[pos];
					this._items[pos] = this._items[pos + 1];
					this._items[pos + 1] = tmp;
					this.hideAll();
					this.render();
				}
			});
			var firstPoint: {x: number, y: number, ctrl: FormControl} = null;
			var oldRect: browser.Rect = null;
			this.on("itemmousemove", (e: any) => {
				var ev = <JQueryEventObject>e.data.e;
				if (browser.isLButton(e) && e.data.control == firstPoint.ctrl && 
						(Math.abs(ev.clientX -  firstPoint.x) >= 5 || 
						Math.abs(ev.clientY -  firstPoint.y) >= 5)) {
					firstPoint = null;
					var ctrl: FormControl = e.data.control;
					oldRect = browser.getRectOfScreen(ctrl.div);
					ctrl.div.style.position = "fixed";
					ctrl.div.style.left = oldRect.left + "px";
					ctrl.div.style.top = oldRect.top + "px";
					tui.widget.openDragMask((e: JQueryEventObject) => {
						ctrl.div.style.left = oldRect.left + e.clientX - firstPoint.x + "px";
						ctrl.div.style.top = oldRect.top + e.clientY - firstPoint.y + "px";
					}, (e: JQueryEventObject) => {
						
					});
				}
			});
			this.on("itemmousedown", (e: any) => {
				var ev = <JQueryEventObject>e.data.e;
				if (browser.isLButton(ev)) {
					firstPoint = {x: ev.clientX, y: ev.clientY, ctrl: e.data.control};
				} else
					firstPoint = null;
			});
			this.on("itemmouseup", (e: any) => {
				firstPoint = null;
				this.selectItem(e.data.control);
			});
			this.on("itemadd", (e: any) => {
				var pos = this._items.indexOf(e.data.control);
				if (pos >= 0) {
					this.addNewItem(e.data.button._, pos);
				}
			});
			newItem.onclick = () => {
				this.addNewItem(newItem, this._items.length);
			};
		}

		private bindNewItemClick(popup: Popup, newItemDiv: HTMLElement, type: string, label: string, pos: number) {
			newItemDiv.onclick = () => {
				var newItem = new _controls[type](this, {type: type, label: label});
				this._items.splice(pos, 0, newItem);
				popup.close();
				this._.style.height = this._.offsetHeight + "px";
				this.hideAll();
				this.render();
				this._.style.height = "";
				this.selectItem(newItem);
			};
		}

		private addNewItem(button: HTMLElement, pos: number) {
			var div = elem("div");
			div.className = "tui-form-new-item-menu";
			var controls: ControlDesc[] = [];
			for (let type in _controls) {
				if (_controls.hasOwnProperty(type)) {
					controls.push({
						type: type,
						name: _controls[type].desc,
						icon: _controls[type].icon,
						order: _controls[type].order
					})
				}
			}
			controls.sort(function(a: ControlDesc, b: ControlDesc) {
				return a.order - b.order
			});
			var popup = <Popup>create("popup");
			for (let c of controls) {
				let itemDiv = elem("div");
				let itemIcon = elem("span");
				let label = elem("div");
				itemDiv.appendChild(itemIcon);
				itemDiv.appendChild(label);
				itemIcon.className = "fa " + c.icon;
				label.innerHTML = browser.toSafeText(c.name);
				div.appendChild(itemDiv);
				this.bindNewItemClick(popup, itemDiv, c.type, c.name, pos);
			}
			popup._set("content", div);
			popup.open(button);
		}

		validate(): boolean {
			var result = true;
			for (let item of this._items) {
				if (!item.validate())
					result = false;
			}
			return result;
		}
		
		render() {
			var toolbar = this._components["toolbar"];
			var titleText = this.get("title");
			if (titleText || this.get("toolbar")) {
				if (!titleText)
					titleText = "";
				toolbar.children[0].innerHTML = browser.toSafeText(titleText);
				if (this.get("toolbar")) {
					(<HTMLElement>toolbar.children[1]).style.display = "block";
				} else
					(<HTMLElement>toolbar.children[1]).style.display = "none";
				toolbar.style.display = "block";
				$(this._).addClass("tui-form-show-toolbar");
			} else {
				toolbar.style.display = "none";
				$(this._).removeClass("tui-form-show-toolbar");
			}
			var designMode = (this.get("mode") === "design");
			for (let item of this._items) {
				if (!item.isPresent())
					item.show();
				item.setDesign(designMode);
				if (!designMode)
					item.select(false);
				item.render();
				item.div.className = item.div.className.replace(/tui-form-item-exceed/g, "");
				if (item.div.offsetWidth > this._.clientWidth - 20) {
					item.div.className += " tui-form-item-exceed";
				}
			}
			var newItem = this._components["newitem"];
			browser.removeNode(newItem);
			if (designMode) {
				this._.appendChild(newItem);
			}
		}
	}

	register(Form, "form");
	registerResize("form");



}