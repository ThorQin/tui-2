/// <reference path="base.ts" />


module tui.widget {
	"use strict";

	export interface FormItem {
		type: string;
		label: string | null;
		key?: string | null;
		value?: any;
		condition?: string;
		size?: number;
		newline?: boolean;
		disable?: boolean;
		required?: boolean;
		emphasize?: boolean;
		description?: string;
		available?: boolean;
		[index: string]: any;
	}

	export interface FormControlConstructor {
		new (form: Form, define: FormItem): FormControl<FormItem>;
		icon: string;
		desc: string;
		order: number;
		init?: {[index:string]: any};
		translator?: (value: any, item: any, index: number) => Node;
	}

	var _controls: { [index: string]: FormControlConstructor } = {};

	interface ControlDesc {
		type: string;
		name: string;
		icon: string;
		order: number;
		init?: {[index:string]: any};
	}

	export class Form extends Widget {

		static ITEM_SIZE = 220;

		protected _definitionChanged: boolean;
		protected _valueChanged: boolean;
		protected _items: FormControl<FormItem>[];
		protected _valueCache: { [index: string]: any };
		protected _maxId: number;
		private _autoResizeTimer: number;
		private _parentWidth: number;

		public static register(type: string, controlType: FormControlConstructor): void {
			_controls[type] = controlType;
		}

		public static getType(type: string): FormControlConstructor {
			return _controls[type];
		}

		removeAll() {
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

		selectItem(target: FormControl<FormItem>) {
			for (let item of this._items) {
				if (item !== target)
					item.select(false);
				else
					item.select(true);
			}
		}

		getItem(index: number | string): FormControl<FormItem> {
			if (typeof index === "number") {
				if (index >= 0 && index < this._items.length)
					return this._items[index];
				else
					return null;
			} else if (typeof index === "string") {
				for (let item of this._items) {
					if (item.getKey() === index)
						return item;
				}
				return null;
			} else
				return null;
		}

		getSelectedItem(): FormControl<FormItem> {
			for (let item of this._items) {
				if (item.isSelect())
					return item;
			}
			return null;
		}

		addItem(type: string, label: string = null, pos: number = -1) {
			var c = _controls[type];
			if (label === null)
				label = str(c.desc);
			var define: FormItem = { type: type, label: label };
			var key = type + (++this._maxId);
			while (this.getItem(key)) {
				key = type + (++this._maxId);
			}
			define.key = key;
			if (c.init) {
				for (var k in c.init) {
					if (c.init.hasOwnProperty(k)) {
						define[k] = c.init[k];
					}
				}
			}
			var newItem = new c(this, define);
			newItem.update();
			if (pos < 0 || pos >= this._items.length) {
				this._items.push(newItem);
			} else
				this._items.splice(pos, 0, newItem);
			this.update();
			this.selectItem(newItem);
			this._valueChanged = true;
		}

		removeItem(target: FormControl<FormItem>) {
			var pos = this._items.indexOf(target);
			if (pos >= 0) {
				this._items.splice(pos, 1);
				target.hide();
				this._valueChanged = true;
				this.render();
			}
		}

		selectNext() {
			var found = false;
			for (let i = 0; i < this._items.length; i++) {
				if (this._items[i].isSelect()) {
					found = true;
					if (i < this._items.length - 1) {
						this._items[i].select(false);
						this._items[i + 1].select(true);
						return true;
					}
				}
			}
			if (!found && this._items.length > 0) {
				this._items[0].select(true);
				return true;
			}
			return false;
		}

		protected selectPrevious() {
			var found = false;
			for (let i = 0; i < this._items.length; i++) {
				if (this._items[i].isSelect()) {
					found = true;
					if (i > 0) {
						this._items[i].select(false);
						this._items[i - 1].select(true);
						return true;
					}
				}
			}
			if (!found && this._items.length > 0) {
				this._items[0].select(true);
				return true;
			}
			return false;
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
			this._autoResizeTimer = null;
			this._parentWidth = null;
			this.setRestrictions({
				"mode": {
					"set": (value: any) => {
						if (/^(design|init|input|view)$/.test(value)) {
							if (value != this.get("mode")) {
								this._data["mode"] = value;
								this._valueChanged = true;
								for (let item of this._items) {
									item.update();
								}
							}
						}
					},
					"get": (): any => {
						var v = this._data["mode"];
						return v || "input";
					}
				},
				"autoSize": {
					"set": (value: any) => {
						if (typeof value !== UNDEFINED) {
							this._data["autoSize"] = !!value;
							if (!!value) {
								this.computeSizeByParent();
							} else {
								this.removeClass("tui-size-1 tui-size-2 tui-size-3 tui-size-4 tui-size-5 tui-size-6");
							}
						}
					},
					"get": (): any => {
						return !!this._data["autoSize"];
					}
				},
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
								throw new Error("Invalid expression: Field \"" + key + "\" was not found in \"" + searchPath[searchPath.length - 1] + "\"'s condition expression.");
							}
							var exp = me._items[index[key]].define.condition;
							if (!exp) {
								me._valueCache[key] = me._items[index[key]].getValue({
									cache: me._valueCache,
									calc: computeValue,
									path: searchPath
								});
								me._items[index[key]].define.available = true;
							} else {
								if (searchPath.indexOf(key) >= 0)
									throw new Error("Invalid expression: Cycle reference was detected on field: \"" + key + "\"");
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
										searchPath.pop();
										me._valueCache[key] = me._items[index[key]].getValue({
											cache: me._valueCache,
											calc: computeValue,
											path: searchPath
										});
										me._items[index[key]].define.available = true;
									} else {
										searchPath.pop();
										me._valueCache[key] = null;
										me._items[index[key]].define.available = false;
									}
								} catch (e) {
									throw new Error(e.message + " (" + key + ")");
								}

							}
						} // end of computeValue

						if (this._valueChanged || this._valueCache === null) {
							this._valueCache = {};
							index = {};
							for (let i = 0; i < this._items.length; i++) {
								let k = this._items[i].getKey();
								if (k) {
									if (index.hasOwnProperty(k))
										throw new Error("Duplicate field name was found: \"" + k + "\".");
									index[k] = i;
								}
							}

							// Compute all items which has key defined.
							for (let k in index) {
								if (index.hasOwnProperty(k)) {
									computeValue(k, []);
								}
							}

							// Then compute all items which does not define the key.
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
											item.getValue({
												cache: me._valueCache,
												calc: computeValue,
												path: []
											});
										} else {
											item.define.available = false;
										}
									} else {
										item.define.available = true;
										item.getValue({
											cache: me._valueCache,
											calc: computeValue,
											path: []
										});
									}
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
			this._maxId = 0;
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

			$(this._).mousedown(() => {
				if (tui.ieVer > 0 && this.get("mode") === "design")
					browser.focusWithoutScroll(this._);
			});

			$(this._).on("keydown", (e) => {
				if (this.get("mode") !== "design")
					return;
				if (e.keyCode === 9) {
					if (e.shiftKey) {
						this.selectPrevious();
					} else {
						this.selectNext();
					}
					e.preventDefault();
				} else if (e.keyCode === browser.KeyCode.DELETE) {
					this.removeItem(this.getSelectedItem());
					e.preventDefault();
				}
			});

			this.on("resize", () => {
				this.render();
			});
			this.on("parentresize", (e) => {
				if ((e.data.type & 1) === 1) {
					this.computeSizeByParent();
				}
			});
			this.on("itemremove", (e: any) => {
				this.removeItem(e.data.control);
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
			var firstPoint: { x: number, y: number, ctrl: FormControl<FormItem> } = null;
			var oldRect: browser.Rect = null;
			this.on("itemmousemove", (e: any) => {
				var ev = <JQueryEventObject>e.data.e;
				ev.preventDefault();
				if (!browser.isLButton(ev) || !firstPoint)
					return;
				if (e.data.control == firstPoint.ctrl &&
					(Math.abs(ev.clientX - firstPoint.x) >= 5 ||
						Math.abs(ev.clientY - firstPoint.y) >= 5)) {

					var ctrl: FormControl<FormItem> = e.data.control;
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
			this.computeSizeByParent();
		}

		computeSizeByParent() {
			if (!this.get("autoSize"))
				return;
			this.removeClass("tui-size-1 tui-size-2 tui-size-3 tui-size-4 tui-size-5 tui-size-6");
			var pw = $(this._.parentElement).width() - $(this._).outerWidth(true) + $(this._).width();
			var s = Form.ITEM_SIZE;
			var i = Math.floor(pw / s);
			if (i < 1) i = 1;
			if (i > 6) i = 6;
			var c = "tui-size-" + i;
			this.addClass(c);
		}

		private bindNewItemClick(popup: Popup, newItemDiv: HTMLElement, type: string, pos: number) {
			newItemDiv.onclick = () => {
				this.addItem(type, null, pos);
				popup.close();
			};
		}

		private addNewItem(button: HTMLElement, pos: number) {
			var div = elem("div");
			div.setAttribute("unselectable", "on");
			div.className = "tui-form-new-item-menu";
			var controls: ControlDesc[] = [];
			for (let type in _controls) {
				if (_controls.hasOwnProperty(type)) {
					controls.push({
						type: type,
						name: _controls[type].desc,
						icon: _controls[type].icon,
						order: _controls[type].order,
					})
				}
			}
			controls.sort(function (a: ControlDesc, b: ControlDesc) {
				return a.order - b.order
			});
			var popup = <Popup>create("popup");
			var usePlugins = false;
			for (let c of controls) {
				if (!usePlugins && c.order >= 100) {
					usePlugins = true;
					let hr = elem("hr");
					div.appendChild(hr);
				}
				let itemDiv = elem("div");
				let itemIcon = elem("span");
				let label = elem("div");
				itemDiv.appendChild(itemIcon);
				itemDiv.appendChild(label);
				itemIcon.className = "fa " + c.icon;
				label.innerHTML = browser.toSafeText(tui.str(c.name));
				div.appendChild(itemDiv);
				this.bindNewItemClick(popup, itemDiv, c.type, pos);
			}
			popup._set("content", div);
			popup.open(button);
		}

		validate(): boolean {
			var result = true;
			for (let item of this._items) {
				if (item.define.available && !item.validate())
					result = false;
			}
			this.render();
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
				item.render(designMode);
			}
			var cfs = browser.getCurrentStyle(this._);
			if (cfs.display != "none") {
				this._.style.width = "2000px";
				this._.style.width = "";
				var pad = parseFloat(cfs.paddingLeft) + parseFloat(cfs.paddingRight);
				for (let item of this._items) {
					if (item.div.offsetWidth > this._.clientWidth - pad) {
						browser.addClass(item.div, "tui-form-item-exceed");
						item.render(designMode);
					}
				}
			}
			if (designMode) {
				this._.appendChild(newItem);
				this._.setAttribute("tabIndex", "0");
				browser.addClass(this._, "tui-form-design-mode");
			} else {
				this._.removeAttribute("tabIndex");
				browser.removeClass(this._, "tui-form-design-mode");
			}
		}
	}

	register(Form, "form");
	registerResize("form");
	registerParentResize("form");
}

module tui {
	"use strict";
	export function inputbox(define: widget.FormItem, title?: string, callback?: (value: any) => JQueryPromise<any> | boolean): widget.Dialog {
		var container = elem("div");
		let form = <widget.Form>create("form");
		form.set("definition", define);
		container.appendChild(form._);
		var dialog = <widget.Dialog>create("dialog");
		dialog._set("content", container);
		title && dialog._set("title", title);
		dialog.open("ok#tui-primary,cancel");
		dialog.on("btnclick", (e) => {
			if (e.data.button === "ok") {
				if (form.validate()) {
					if (typeof callback === "function") {
						var result = callback(form.get("value"));
						if (result == false) {
							return;
						}
						if (typeof result === "object" && typeof result.done === "function" ) {
							result.then(function() {
								dialog.close();
							});
							return;
						}
					}
					dialog.close();
				}
			} else if (e.data.button === "cancel") {
				dialog.close();
			}
		});
		return dialog;
	}
}
