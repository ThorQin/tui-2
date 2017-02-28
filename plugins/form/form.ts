/// <reference path="../../dist/tui2.d.ts" />


module tui.widget.ext {
	"use strict";

	export interface FormItem {
		type: string;
		label: string | null;
		key: string | null;
		value: any | null;
		must?: boolean;
		validate?: string;
		style?: string;
		disable?: boolean;
		setting?: {[index: string]: any};
	}

	export interface ControlHandler {
		(form: Form, itemContainer: HTMLDivElement, item: FormItem, init: boolean): void;
	}

	var _initProc: {[index: string]: ControlHandler} = {};

	export class Form extends Widget {

		private _definitionChanged: boolean;
		private _itemDivs: HTMLDivElement[];

		public static register(type: string, controlHandler: ControlHandler): void {
			_initProc[type] = controlHandler;
		}

		protected initRestriction(): void {
			super.initRestriction();
			this._definitionChanged = false;
			this._itemDivs = [];
			this.setRestrictions({
				"definition": {
					"set": (value: any) => {
						if (value instanceof Array || value === null) {
							this._data["definition"] = value;
							this._definitionChanged = true;
						}
					}
				},
				"value": {
					"set": (value: any) => {
						var d = <FormItem[]>this._data["definition"];
						if (d) {
							for (let item of d) {
								if (item.key) {
									if (value) {
										if (value.hasOwnProperty(item.key))
											item.value = value[item.key];
									} else if (value === null) {
										item.value = null;
									}
								}
							}
						}
					},
					"get": (): any => {
						var d = <FormItem[]>this._data["definition"];
						if (d) {
							var value = {};
							for (let item of d) {
								if (item.key) {
									value[item.key] = item.value;
								}
							}
							return value;
						} else
							return null;
					}
				}
			});
		}
		
		render() {
			var definition = <FormItem[]>this.get("definition");
			if (this._definitionChanged) {
				this._.innerHTML = "";
				this._itemDivs = [];
			}
			for (let i = 0; i < definition.length; i++) {
				let item = definition[i];
				let handler = _initProc[item.type];
				let div = i < this._itemDivs.length ? this._itemDivs[i] : null;
				if (div == null) {
					div = document.createElement("div");
					div.className = "tui-form-item-container";
					this._itemDivs.push(div);
					this._.appendChild(div);
				}
				if (handler) {
					handler(this, div, item, this._definitionChanged);
				}
			}
			if (this._definitionChanged) {
				this._definitionChanged = false;
			}
		}
	}

	register(Form, "form");

	function  basicHandler<T extends Widget>(type: string, itemContainer: HTMLDivElement, item: FormItem, init: boolean): {label: HTMLLabelElement, widget: T} {
		var label;
		var widget: T;
		if (init) {
			label = document.createElement("label");
			itemContainer.appendChild(label);
			widget = <T>create(type);
			widget.appendTo(itemContainer);
		}
		if (item.label) {
			$(label).text(item.label);
			$(label).css("display", "block");
		} else
			$(label).css("display", "none");
		if (item.validate)
			widget._set("validate", item.validate);
		else
			widget._set("validate", null);
		widget._set("value", item.value);
		widget._set("disable", !!item.disable);
		return {
			label: label,
			widget: widget
		}
	}

	Form.register("input", function(form: Form, itemContainer: HTMLDivElement, item: FormItem, init: boolean) {
		var {label, widget} = basicHandler<Input>("input", itemContainer, item, init);
		widget.on("change input", function(e){
			item.value = widget.get("value");
		});
	});

	Form.register("date-picker", function(form: Form, itemContainer: HTMLDivElement, item: FormItem, init: boolean) {
		var {label, widget} = basicHandler<DatePicker>("date-picker", itemContainer, item, init);
		widget.on("click", function(e){
			item.value = widget.get("text");
		});
	});

	Form.register("select", function(form: Form, itemContainer: HTMLDivElement, item: FormItem, init: boolean) {
		var {label, widget} = basicHandler<Select>("select", itemContainer, item, init);
		widget.on("change", function(e){
			item.value = widget.get("value");
		});
	});

}