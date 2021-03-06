/// <reference path="base.ts" />
/// <reference path="../exp/expression.ts" />

module tui.widget {
	"use strict";

	const MAX = 6;

	export interface FormItem {
		type: string;
		label?: string | null;
		key?: string | null;
		value?: any;
		condition?: string;
		size?: number;
		position?: string;
		disable?: boolean;
		required?: boolean;
		emphasize?: boolean;
		description?: string;
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

	var namePattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

	function makeHandler(item: FormControl<FormItem>): Object {
		let itemHandler = {
			getValue: function() {
				if (item && item.available)
					return item.getValue(null);
				else
					return null;
			},
			setValue: function(v: any) {
				return item.setValue(v);
			},
			getLabel: function() {
				return item.define.label;
			},
			setLabel: function(label: string) {
				item.define.label = label;
				item.update();
			},
			getKey: function() {
				return item.define.key;
			},
			getDefinition: function() {
				if (item) {
					return tui.clone(item.define, "value");
					//return tui.clone(item.define, "value");
				} else
					return null;
			},
			setDefinition: function(definition: {[index: string]: any}) {
				if (item && typeof definition === "object") {
					for (let k in definition) {
						if (definition.hasOwnProperty(k) && !/^type|key|value$/.test(k)) {
							item.define[k] = definition[k];
						}
					}
					item.update();
					item.applySize();
				}
			}
		};
		if (typeof Object.defineProperty === "function" && (tui.ieVer === -1 || tui.ieVer >= 9)) {
			Object.defineProperty(itemHandler, "value", {
				get: function() {
					return this.getValue();
				},
				set: function(v) {
					this.setValue(v);
				}
			});
			Object.defineProperty(itemHandler, "label", {
				get: function() {
					return this.getLabel();
				},
				set: function(v) {
					this.setLabel(v);
				}
			});
			Object.defineProperty(itemHandler, "key", {
				get: function() {
					return this.getKey();
				}
			});
		}
		return itemHandler;
	}

	interface ControlDesc {
		type: string;
		name: string;
		icon: string;
		order: number;
		init?: {[index:string]: any};
	}

	export class Form extends Widget {

		static ITEM_SIZE = 260;

		protected _definitionChanged: boolean;
		protected _valueChanged: boolean;
		protected _items: FormControl<FormItem>[];
		protected _scripts: {[index: string]: string};
		protected _valueCache: { [index: string]: any };
		protected _maxId: number;
		private _autoResizeTimer: number;
		private _parentWidth: number;
		private _formulaContext = {
			callStacks: 0,
			cacheValue: <string>null
		};

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
			this._scripts = {};
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

		setScript(key: string, formula: string) {
			if (key) {
				if (typeof formula == "string" && formula)
					this._scripts[key] = formula;
				else
					delete this._scripts[key];
				this._valueChanged = true;
				this.render();
			}
		}

		removeScript(key: string) {
			delete this._scripts[key];
			this.render();
		}

		getScript(key: string): string {
			return this._scripts[key];
		}

		addItem(type: string, label: string = null, pos: number = -1) {
			var c = _controls[type];
			if (label === null || label === undefined)
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

		getItemIndex(target: FormControl<FormItem>) {
			return this._items.indexOf(target);
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

		selectPrevious() {
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
			this._scripts = {};
			this._valueCache = null;
			this._autoResizeTimer = null;
			this._parentWidth = null;
			this.setRestrictions({
				"mode": {
					"set": (value: any) => {
						if (/^(design|input|view)$/.test(value)) {
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
				"definition": {
					"set": (value: any) => {
						if (value instanceof Array) {
							this.removeAll();
							for (let define of <FormItem[]>value) {
								if (define.type === "script" && define.key && define.value) {
									var v = this._scripts[define.key];
									if (v) {
										this._scripts[define.key] = v + "\n" + define.value;
									} else
										this._scripts[define.key] =  define.value;
								} else {
									let cstor = _controls[define.type];
									if (cstor) {
										let item = new cstor(this, define);
										item.update();
										this._items.push(item);
									}
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
						for (let k in this._scripts) {
							if (this._scripts.hasOwnProperty(k)) {
								var v = this._scripts[k];
								result.push({type: "script", key: k, value: v, label: null});
							}
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
						function itemFunc(id, searchPath) {
							if (id.args.length != 1) {
								throw new Error("Invalid parameter for function 'item()'");
							}
							let key = id.args[0];
							if (typeof key != 'string') {
								throw new Error("Invalid parameter for function 'item()'");
							}
							if (me._valueCache.hasOwnProperty(key))
								return me._valueCache[key];
							else {
								if (typeof searchPath == 'number') {
									throw new Error("Invalid expression: Field \"" + key + "\" not found in control[" + searchPath + "] condition.");
								} else {
									computeValue(key, searchPath);
									return me._valueCache[key];
								}
							}
						}
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
								me._items[index[key]].available = true;
							} else {
								if (searchPath.indexOf(key) >= 0)
									throw new Error("Invalid expression: Cycle reference was detected on field: \"" + key + "\"");
								searchPath.push(key);
								try {
									if (tui.exp.evaluate(exp, function (id) {
										if (id.type == 'function') {
											if (id.name == 'item') {
												return itemFunc(id, searchPath);
											} else {
												return tui.exp.processStandardFunc(id);
											}
										}
										if (me._valueCache.hasOwnProperty(id.name))
											return me._valueCache[id.name];
										else {
											computeValue(id.name, searchPath);
											return me._valueCache[id.name];
										}
									})) {
										searchPath.pop();
										me._valueCache[key] = me._items[index[key]].getValue({
											cache: me._valueCache,
											calc: computeValue,
											path: searchPath
										});
										me._items[index[key]].available = true;
									} else {
										searchPath.pop();
										me._valueCache[key] = null;
										me._items[index[key]].available = false;
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
										if (tui.exp.evaluate(item.define.condition, function (id) {
											if (id.type == 'function') {
												if (id.name == 'item') {
													return itemFunc(id, i);
												} else {
													return tui.exp.processStandardFunc(id);
												}
											}
											if (me._valueCache.hasOwnProperty(id.name))
												return me._valueCache[id.name];
											else {
												throw new Error("Invalid expression: Field \"" + id.name + "\" not found in control[" + i + "] condition.");
											}
										})) {
											item.available = true;
											item.getValue({
												cache: me._valueCache,
												calc: computeValue,
												path: []
											});
										} else {
											item.available = false;
										}
									} else {
										item.available = true;
										item.getValue({
											cache: me._valueCache,
											calc: computeValue,
											path: []
										});
									}
								}
							}

							// Then compute formulas
							var f = this._scripts["formula"];
							if (f) {
								if (this._formulaContext.callStacks > 30) {
									throw new Error("Invalid formula: call stacks should not exceed 30!");
								}
								// Save all value to handler cache.
								let formulaValueCache = [];
								for (let i = 0; i < this._items.length; i++) {
									if (this._items[i].available)
										formulaValueCache.push(this._items[i].define.value);
								}
								var cacheStr = tui.stringify(formulaValueCache);
								if (this._formulaContext.cacheValue != cacheStr) {
									this._formulaContext.callStacks++;
									this._formulaContext.cacheValue = cacheStr;
									try {
										var cells: any = {};
										var params: {[key: string]: any} = { cells: cells };
										for (let i = 0; i < this._items.length; i++) {
											cells[i] = makeHandler(this._items[i]);
											let k = this._items[i].getKey();
											if (k != null) {
												cells[k] = cells[i];
												if (namePattern.test(k)) {
													params[k] = cells[i];
												}
											}
										}
										browser.safeExec(f, params);
									} catch (e) {
										throw new Error("Invalid formula: " + e);
									} finally {
										this._formulaContext.callStacks--;
										if (this._formulaContext.callStacks == 0) {
											this._formulaContext.cacheValue = null;
										}
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

			var newItem = this._components["newitem"] = elem("div");
			newItem.className = "tui-form-new-item-box";

			var errmsg = this._components["errmsg"] = elem("div");
			errmsg.className = "tui-form-error";

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
				this.computeSize();
				this.render();
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
					placeholder.style.clear = divStyle.clear;
					if (browser.hasClass(ctrl.div, "tui-form-item-newline")) {
						browser.addClass(placeholder, "tui-form-item-newline");
					}
					if (browser.hasClass(ctrl.div, "tui-form-item-pull-left")) {
						browser.addClass(placeholder, "tui-form-item-pull-left");
						placeholder.style.display = "inline-block";
					}
					if (browser.hasClass(ctrl.div, "tui-form-item-pull-right")) {
						browser.addClass(placeholder, "tui-form-item-pull-right");
						placeholder.style.display = "inline-block";
					}
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
				if (e.data && e.data.stack) {
					return;
				}
				this._valueChanged = true;
				this.render();
			});
			newItem.onclick = () => {
				this.addNewItem(newItem, this._items.length);
			};
			this.computeSize();
		}

		private computeSize() {
			this.removeClass("tui-size-1 tui-size-2 tui-size-3 tui-size-4 tui-size-5 tui-size-6");
			var pw = $(this._).width();
			var s = Form.ITEM_SIZE;
			var i = Math.floor(pw / s);
			if (i < 1) i = 1;
			if (i > MAX) i = MAX;
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
				if (item.available && !item.validate())
					result = false;
			}
			this.render();
			return result;
		}

		render() {
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
			var folded = false;
			for (let item of this._items) {
				if (!item.isPresent())
					item.show();
				item.setDesign(designMode);
				if (!designMode) {
					item.select(false);
					if (!item.available) {
						browser.addClass(item.div, "tui-form-item-unavailable");
					} else
						browser.removeClass(item.div, "tui-form-item-unavailable");
				} else {
					browser.removeClass(item.div, "tui-form-item-unavailable");
				}
				browser.removeClass(item.div, "tui-form-item-exceed");
				if (!designMode) {
					if (item.define.type != "section") {
						if (folded) {
							browser.addClass(item.div, "tui-hidden");
						} else {
							browser.removeClass(item.div, "tui-hidden");
							item.render(designMode);
						}
					} else {
						if (item.define.display == "folder" && item.define.folded) {
							folded = true;
						} else {
							folded = false;
						}
						item.render(designMode);
					}
				} else {
					browser.removeClass(item.div, "tui-hidden");
					item.updateIndex(this.getItemIndex(item));
					item.render(designMode);
				}
			}
			var cfs = browser.getCurrentStyle(this._);
			if (cfs.display != "none") {
				// this._.style.width = "2000px";
				// this._.style.width = "";
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
	//registerParentResize("form");
}

module tui {
	"use strict";
	export function inputbox(define: widget.FormItem[], title?: string, initValue?: any, callback?: (value: any) => JQueryPromise<any> | boolean, maxWidth?: number): widget.Dialog {
		var container = elem("div");
		let form = <widget.Form>create("form");
		if (typeof maxWidth === "number" && maxWidth >= 1 && maxWidth <= 5) {
			form._.className = "tui-form-max-" + maxWidth;
		} else {
			form._.className = "tui-form-property-form";
		}
		form.set("definition", define);
		if (initValue && typeof initValue != "function") {
			form.set("value", initValue);
		}
		container.appendChild(form._);
		var dialog = <widget.Dialog>create("dialog");
		dialog._set("content", container);
		title && dialog._set("title", title);
		dialog.open("ok#tui-primary");
		dialog.on("btnclick", (e) => {
			if (e.data.button === "ok") {
				if (form.validate()) {
					if (typeof initValue === "function") {
						callback = initValue;
					}
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
		(<any>dialog).form = form;
		return dialog;
	}
}
