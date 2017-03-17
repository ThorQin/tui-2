/// <reference path="base.ts" />


module tui.widget {
	"use strict";

	export interface FormItem {
		type: string;
		label: string | null;
		key?: string | null;
		value?: any;
		validate?: string[];
		condition?: string;
		size?: number;
		newline?: boolean;
		disable?: boolean;
		required?: boolean;
		description?: string;
		available?: boolean;
		[index: string]: any;
	}

	export interface FormControlConstructor {
		new (form: Form, define: FormItem): FormControl;
		icon: string;
		desc: string;
		order: number;
	}

	var _controls: { [index: string]: FormControlConstructor } = {};

	interface ControlDesc {
		type: string;
		name: string;
		icon: string;
		order: number;
	}

	export class Form extends Widget {
		protected _definitionChanged: boolean;
		protected _valueChanged: boolean;
		protected _items: FormControl[];
		protected _valueCache: { [index: string]: any };

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

		protected update() {
			this._.style.height = this._.offsetHeight + "px";
			this.hideAll();
			this.render();
			this._.style.height = null;
		}

		protected initRestriction(): void {
			super.initRestriction();
			this._items = [];
			this._valueCache = null;
			this.setRestrictions({
				"definition": {
					"set": (value: any) => {
						if (value instanceof Array) {
							this.removeAll();
							for (let define of <FormItem[]>value) {
								let cstor = _controls[define.type];
								if (cstor) {
									let item = new cstor(this, define);
									item.update();
									this._items.push(item);
								}
							}
						} else if (value === null) {
							this.removeAll();
						}
						this._valueChanged = true;
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
						this._valueChanged = true;
					},
					"get": (): any => {
						var index: { [index: string]: number };
						var me = this;
						function computeValue(key: string, searchPath: string[]) {
							if (!index.hasOwnProperty(key)) {
								throw new Error("Invalid expression: Field \"" + key + "\" not found in \"" + searchPath[searchPath.length - 1] + "\" condition.");
							}
							var exp = me._items[index[key]].define.condition;
							if (!exp) {
								me._valueCache[key] = me._items[index[key]].getValue();
								me._items[index[key]].define.available = true;
							} else {
								if (searchPath.indexOf(key) >= 0)
									throw new Error("Invalid expression: Cycle reference detected on \"" + key + "\"");
								searchPath.push(key);
								try {
									if (text.exp.evaluate(exp, function (k: string) {
										if (me._valueCache.hasOwnProperty(k))
											return me._valueCache[k];
										else {
											computeValue(k, searchPath);
											return me._valueCache[k];
										}
									})) {
										me._valueCache[key] = me._items[index[key]].getValue();
										me._items[index[key]].define.available = true;
									} else {
										me._valueCache[key] = null;
										me._items[index[key]].define.available = false;
									}
								} catch (e) {
									throw new Error(e.message + " (" + key + ")");
								}
								searchPath.pop();
							}
						}
						if (this._valueChanged || this._valueCache === null) {
							this._valueCache = {};
							index = {};
							for (let i = 0; i < this._items.length; i++) {
								let k = this._items[i].getKey();
								if (k) {
									index[k] = i;
								}
							}
							for (let k in index) {
								if (index.hasOwnProperty(k)) {
									computeValue(k, []);
								}
							}
							for (let i = 0; i < this._items.length; i++) {
								let item = this._items[i];
								let k = item.getKey();

								if (k === null) {
									if (item.define.condition) {
										if (text.exp.evaluate(item.define.condition, function (k: string) {
											if (me._valueCache.hasOwnProperty(k))
												return me._valueCache[k];
											else {
												throw new Error("Invalid expression: Field \"" + k + "\" not found in control[" + i + "] condition.");
											}
										})) {
											item.define.available = true;
										} else {
											item.define.available = false;
										}
									} else
										item.define.available = true;
								}
							}

							this._valueChanged = false;
							return this._valueCache;
						} else
							return this._valueCache;
					}
				}
			});
		}

		protected init(): void {
			this._.setAttribute("unselectable", "on");
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

			var errmsg = this._components["errmsg"] = elem("div");
			errmsg.className = "tui-form-error";

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
					this._valueChanged = true;
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
					this.update();
				}
			});
			this.on("itemmovedown", (e: any) => {
				var pos = this._items.indexOf(e.data.control);
				if (pos >= 0 && pos < this._items.length - 1) {
					var tmp = this._items[pos];
					this._items[pos] = this._items[pos + 1];
					this._items[pos + 1] = tmp;
					this.update();
				}
			});
			var firstPoint: { x: number, y: number, ctrl: FormControl } = null;
			var oldRect: browser.Rect = null;
			this.on("itemmousemove", (e: any) => {
				var ev = <JQueryEventObject>e.data.e;
				ev.preventDefault();
				if (!browser.isLButton(ev) || !firstPoint)
					return;
				if (e.data.control == firstPoint.ctrl &&
					(Math.abs(ev.clientX - firstPoint.x) >= 5 ||
						Math.abs(ev.clientY - firstPoint.y) >= 5)) {

					var ctrl: FormControl = e.data.control;
					var pos = this._items.indexOf(ctrl);
					var placeholder = elem("div");
					placeholder.className = "tui-form-item-placeholder";

					var divStyle = browser.getCurrentStyle(ctrl.div);
					placeholder.style.display = divStyle.display;
					placeholder.style.width = ctrl.div.offsetWidth + "px";
					placeholder.style.height = ctrl.div.offsetHeight + "px";

					oldRect = browser.getRectOfScreen(ctrl.div);
					var curWidth = ctrl.div.offsetWidth - parseFloat(divStyle.paddingLeft) - parseFloat(divStyle.paddingRight);
					ctrl.div.style.position = "fixed";
					ctrl.div.style.zIndex = "100";
					ctrl.div.style.opacity = "0.8";
					ctrl.div.style.filter = "alpha(opacity=80)";
					ctrl.div.style.left = oldRect.left + "px";
					ctrl.div.style.top = oldRect.top + "px";
					var savedWidth = ctrl.div.style.width;
					ctrl.div.style.width = curWidth + "px";
					browser.addClass(ctrl.div, "tui-form-item-moving");

					this._.insertBefore(placeholder, ctrl.div);
					var targetIndex: number = null;

					tui.widget.openDragMask((e: JQueryEventObject) => {
						ctrl.div.style.left = oldRect.left + e.clientX - firstPoint.x + "px";
						ctrl.div.style.top = oldRect.top + e.clientY - firstPoint.y + "px";
						for (var i = 0; i < this._items.length; i++) {
							var item = this._items[i];
							if (item !== ctrl) {
								var testHeight = browser.getCurrentStyle(item.div).display === "block" || placeholder.style.display === "block";
								var rc = browser.getRectOfScreen(item.div);
								if (testHeight) {
									if (e.clientX > rc.left && e.clientX < rc.left + rc.width &&
										e.clientY > rc.top && e.clientY < rc.top + rc.height / 2) {
										this._.insertBefore(placeholder, item.div);
										targetIndex = i;
										break;
									} else if (e.clientX > rc.left && e.clientX < rc.left + rc.width &&
										e.clientY > rc.top + rc.height / 2 && e.clientY < rc.top + rc.height) {
										this._.insertBefore(placeholder, item.div.nextSibling);
										targetIndex = i + 1;
										break;
									}
								} else {
									if (e.clientX > rc.left && e.clientX < rc.left + rc.width / 2 &&
										e.clientY > rc.top && e.clientY < rc.top + rc.height) {
										this._.insertBefore(placeholder, item.div);
										targetIndex = i;
										break;
									} else if (e.clientX > rc.left + rc.width / 2 && e.clientX < rc.left + rc.width &&
										e.clientY > rc.top && e.clientY < rc.top + rc.height) {
										this._.insertBefore(placeholder, item.div.nextSibling);
										targetIndex = i + 1;
										break;
									}
								}
							}
						}
					}, (e: JQueryEventObject) => {
						firstPoint = null;
						ctrl.div.style.position = "";
						ctrl.div.style.zIndex = "";
						ctrl.div.style.opacity = "";
						ctrl.div.style.filter = "";
						ctrl.div.style.left = "";
						ctrl.div.style.top = "";
						ctrl.div.style.width = savedWidth;
						browser.removeClass(ctrl.div, "tui-form-item-moving");
						this._.removeChild(placeholder);
						if (targetIndex != null && targetIndex != pos) {
							this._items.splice(pos, 1);
							if (targetIndex < pos)
								this._items.splice(targetIndex, 0, ctrl);
							else
								this._items.splice(targetIndex - 1, 0, ctrl);
							this.update();
						}
					});
				}
			});
			this.on("itemmousedown", (e: any) => {
				var ev = <JQueryEventObject>e.data.e;
				if (browser.isLButton(ev)) {
					firstPoint = { x: ev.clientX, y: ev.clientY, ctrl: e.data.control };
				} else
					firstPoint = null;
				this.selectItem(e.data.control);
			});
			this.on("itemmouseup", (e: any) => {
				firstPoint = null;
			});
			this.on("itemadd", (e: any) => {
				var pos = this._items.indexOf(e.data.control);
				if (pos >= 0) {
					this.addNewItem(e.data.button._, pos);
				}
			});
			this.on("itemvaluechanged", (e: any) => {
				this._valueChanged = true;
				this.render();
			});
			newItem.onclick = () => {
				this.addNewItem(newItem, this._items.length);
			};
		}

		private bindNewItemClick(popup: Popup, newItemDiv: HTMLElement, type: string, label: string, pos: number) {
			newItemDiv.onclick = () => {
				var newItem = new _controls[type](this, { type: type, label: label });
				newItem.update();
				this._items.splice(pos, 0, newItem);
				popup.close();
				this.update();
				this.selectItem(newItem);
				this._valueChanged = true;
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
			controls.sort(function (a: ControlDesc, b: ControlDesc) {
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
				label.innerHTML = browser.toSafeText(tui.str(c.name));
				div.appendChild(itemDiv);
				this.bindNewItemClick(popup, itemDiv, c.type, tui.str(c.name), pos);
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
			var newItem = this._components["newitem"];
			browser.removeNode(newItem);
			var errmsg = this._components["errmsg"];
			browser.removeNode(errmsg);
			var designMode = (this.get("mode") === "design");
			if (!designMode) {
				try {
					this.get("value");
				} catch (e) {
					this.hideAll();
					errmsg.innerHTML = browser.toSafeText(e.message + "");
					this._.appendChild(errmsg);
					return;
				}
			}
			for (let item of this._items) {
				if (!item.isPresent())
					item.show();
				item.setDesign(designMode);
				if (!designMode) {
					item.select(false);
					if (!item.define.available) {
						browser.addClass(item.div, "tui-form-item-unavailable");
					} else
						browser.removeClass(item.div, "tui-form-item-unavailable");
				} else {
					browser.removeClass(item.div, "tui-form-item-unavailable");
				}
				browser.removeClass(item.div, "tui-form-item-exceed");
				item.render();
			}
			var cfs = browser.getCurrentStyle(this._);
			if (cfs.display != "none") {
				this._.style.width = "2000px";
				this._.style.width = "";
				var pad = parseFloat(cfs.paddingLeft) + parseFloat(cfs.paddingRight);
				for (let item of this._items) {
					if (item.div.offsetWidth > this._.clientWidth - pad) {
						browser.addClass(item.div, "tui-form-item-exceed");
						item.render();
					}
				}
			}
			if (designMode) {
				this._.appendChild(newItem);
			}
		}
	}

	register(Form, "form");
	registerResize("form");



}