/// <reference path="base.ts" />


module tui.widget {
	"use strict";

	export enum ItemSize {
		NORMAL,
		BIG,
		BLOCK
	}

	export interface FormItem {
		type: string;
		label: string | null;
		key: string | null;
		value: any | null;
		validate?: string[];
		size?: ItemSize;
		inline?: boolean;
		disable?: boolean;
		important?: boolean;
	}

	export interface FormControlConstructor {
		new (form: Form, define: FormItem): FormControl;
	}

	export abstract class FormControl {
		div: HTMLDivElement;
		label: HTMLLabelElement;
		define: FormItem;
		protected form: Form;

		constructor(form: Form, define: FormItem) {
			this.form = form;
			this.define = define;
			this.div = document.createElement("div");
			this.div.className = "tui-form-item-container";
			if (define.size === ItemSize.BIG) {
				this.div.className += " tui-form-item-big-size"
			} else if (define.size === ItemSize.BLOCK) {
				this.div.className += " tui-form-item-full-size"
			} 
			if (define.inline) {
				this.div.className += " tui-form-item-inline";
			}
			
			this.label = document.createElement("label");
			this.label.className = "tui-form-item-label";
			this.div.appendChild(this.label);
			if (!define.label)
				this.label.style.display = "none";
			else {
				this.label.innerHTML = browser.toSafeText(define.label);
				if (define.important) {
					this.label.className = "tui-form-item-important";
				}
			}
		}

		isPresent() {
			return this.div.parentElement === this.form._;
		}

		gone() {
			this.form._.removeChild(this.div);
		}

		present() {
			this.form._.appendChild(this.div);
		}

		getKey(): string {
			return this.define.key || null;
		}

		abstract getName(): string;
		abstract getValue(): any;
		abstract setValue(value: any): void;

		abstract render(): void;
		abstract showProperty(): void;
		abstract validate(): boolean;
	}

	var _controls: {[index: string]: FormControlConstructor} = {};

	export class Form extends Widget {

		private _definitionChanged: boolean;
		private _items: FormControl[];

		public static register(type: string, controlType: FormControlConstructor): void {
			_controls[type] = controlType;
		}

		private removeAll() {
			for (let item of this._items) {
				item.gone();
			}
			this._items = [];
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
			var title = this._components["title"] = document.createElement("h1");
			title.className = "tui-form-title";
			this._.appendChild(title);
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
			var title = this._components["title"];
			var titleText = this.get("title");
			if (titleText) {
				title.innerHTML = browser.toSafeText(titleText);
				title.style.display = "block";
			} else
				title.style.display = "none";
			for (let item of this._items) {
				if (!item.isPresent())
					item.present();
				item.render();
			}
		}
	}

	register(Form, "form");

	export abstract class BasicFormControl<T extends Widget> extends FormControl {
		protected _widget: T;
		protected _name: string;

		/**
		 * Base class constructor of the simple form control.
		 * @param form Which form will contain this control.
		 * @param define Form item definition.
		 * @param type The name of what your tui control will be used.
		 * @param name The human friendly name of the form control.
		 */
		constructor(form: Form, define: FormItem, type: string, name: string) {
			super(form, define);
			this._name = name;
			this._widget = <T>create(type);
			this._widget.appendTo(this.div);
		}

		getName(): string {
			return this._name;
		}
		getValue() {
			return this._widget.get("value");
		}
		setValue(value: any): void {
			this._widget.set("value", value);
		}
		render(): void {
			if (this.define.validate instanceof Array) {
				this._widget._set("validate", this.define.validate);
				this._widget._set("autoValidate", true);
			}
			this._widget.render();
		}
	}

	class FormTextbox extends BasicFormControl<Input> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "input", tui.str("textbox"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("textbox", FormTextbox);

	class FormTextarea extends BasicFormControl<Textarea> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "textarea", tui.str("textarea"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("textarea", FormTextarea);


	class FormDatePicker extends BasicFormControl<DatePicker> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "date-picker", tui.str("datepicker"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("datepicker", FormDatePicker);

	class FormFile extends BasicFormControl<File> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "file", tui.str("file.upload"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("file", FormFile);


	class FormSelect extends BasicFormControl<Select> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "select", tui.str("file.upload"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("select", FormSelect);


	class FormPicture extends BasicFormControl<Picture> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "picture", tui.str("picture"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("picture", FormPicture);
}