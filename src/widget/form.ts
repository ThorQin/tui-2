/// <reference path="base.ts" />


module tui.widget {
	"use strict";

	export interface FormItem {
		type: string;
		label: string | null;
		key: string | null;
		value: any | null;
		validate?: string[];
		size?: number;
		newline?: boolean;
		disable?: boolean;
		important?: boolean;
	}

	export interface FormControlConstructor {
		new (form: Form, define: FormItem): FormControl;
	}

	var _controls: {[index: string]: FormControlConstructor} = {};

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
			var toolbar = this._components["toolbar"] = document.createElement("div");
			toolbar.className = "tui-form-toolbar";
			var title = document.createElement("div");
			title.className = "tui-form-title";
			var buttons = document.createElement("div");
			buttons.className = "tui-form-buttons";
			var btnPrint = document.createElement("span");
			btnPrint.className = "tui-form-btn tui-form-btn-print";
			buttons.appendChild(btnPrint);
			toolbar.appendChild(title);
			toolbar.appendChild(buttons);
			this._.appendChild(toolbar);
			this.on("resize", () => {
				this.render();
			});
			this.on("itemmousedown", (e: any) => {
				
			});
			this.on("itemmouseup", (e: any) => {
				for (let item of this._items) {
					if (item !== e.data.control)
						item.select(false);
					else
						item.select(true);
				}
			});
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
		}
	}

	register(Form, "form");
	registerResize("form");


	export abstract class FormControl {
		mask: HTMLDivElement;
		div: HTMLDivElement;
		label: HTMLLabelElement;
		define: FormItem;
		toolbar: HTMLDivElement;
		btnEdit: Button;
		btnDelete: Button;
		btnAdd: Button;
		btnMoveUp: Button;
		btnMoveDown: Button;

		protected form: Form;
		protected selected: boolean;

		constructor(form: Form, define: FormItem) {
			this.selected = false;
			this.form = form;
			this.define = define;
			this.div = document.createElement("div");
			this.mask = document.createElement("div");
			this.mask.setAttribute("unselectable", "on");
			this.mask.className = "tui-form-item-mask";
			this.mask.style.display = "none";
			
			var g1 = <ButtonGroup>create("button-group");
			this.btnAdd = <Button>create("button", {text: "<i class='fa fa-plus'></i>"});
			this.btnEdit = <Button>create("button", {text: "<i class='fa fa-pencil'></i>"});
			this.btnAdd.appendTo(g1._);
			this.btnEdit.appendTo(g1._);
			
			this.btnDelete = <Button>create("button", {text: "<i class='fa fa-trash'></i>"});

			var g2 = <ButtonGroup>create("button-group");
			this.btnMoveUp = <Button>create("button", {text: "<i class='fa fa-level-up'></i>"});
			this.btnMoveDown = <Button>create("button", {text: "<i class='fa fa-level-down'></i>"});
			this.btnMoveUp.appendTo(g2._);
			this.btnMoveDown.appendTo(g2._);

			this.toolbar = document.createElement("div");
			this.toolbar.className = "tui-form-item-toolbar";
			g1.appendTo(this.toolbar);
			g2.appendTo(this.toolbar);
			this.btnDelete.appendTo(this.toolbar);

			this.div.appendChild(this.mask);
			this.div.className = "tui-form-item-container";

			if (define.size > 1 && define.size < 5)
				this.div.className += " tui-form-item-size-" + Math.floor(define.size);
			else if (define.size >= 5) {
				this.div.className += " tui-form-item-size-full";
			} 
			if (define.newline) {
				this.div.className += " tui-form-item-newline";
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
			$(this.mask).mousedown((e: JQueryEventObject) => {
				this.form.fire("itemmousedown", {e: e, control: this});
			});
			$(this.mask).mouseup((e: JQueryEventObject) => {
				this.form.fire("itemmouseup", {e: e, control: this});
			});
		}

		isPresent() {
			return this.div.parentElement === this.form._;
		}

		hide() {
			this.form._.removeChild(this.div);
		}

		show() {
			this.form._.appendChild(this.div);
		}

		setDesign(value: boolean) {
			if (value) {
				browser.addClass(this.div, "tui-form-in-design");
			} else {
				browser.removeClass(this.div, "tui-form-in-design");
			}
		}

		select(value: boolean) {
			this.selected = !!value;
			if (this.selected) {
				browser.addClass(this.div, "tui-form-item-selected");
				this.toolbar.style.opacity = "0";
				this.div.appendChild(this.toolbar);
				setTimeout(() => {
					if (this.selected)
						this.toolbar.style.opacity = "1";
				},16);
			} else {
				browser.removeClass(this.div, "tui-form-item-selected");
				this.toolbar.style.opacity = "0";
				setTimeout(() => {
					if (!this.selected)
						browser.removeNode(this.toolbar);
				}, 500);
				
			}
		}
		isSelect(): boolean {
			return this.selected;
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
			this._widget._set("disable", define.disable);
			this._widget._set("value", define.value);
			if (this.define.validate instanceof Array) {
				this._widget._set("validate", this.define.validate);
				this._widget._set("autoValidate", true);
			}
		}

		getName(): string {
			return this._name;
		}
		getValue(): any {
			return this._widget.get("value");
		}
		setValue(value: any): void {
			this._widget.set("value", value);
		}
		render(): void {
			this._widget.render();
		}
	}

	class FormTextbox extends BasicFormControl<Input> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "input", tui.str("form.textbox"));
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
			super(form, define, "textarea", tui.str("form.textarea"));
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
			super(form, define, "date-picker", tui.str("form.datepicker"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("datepicker", FormDatePicker);

	
	class FormSelect extends BasicFormControl<Select> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "select", tui.str("form.select"));
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
			super(form, define, "picture", tui.str("form.picture"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("picture", FormPicture);

	class FormFile extends BasicFormControl<File> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "file", tui.str("form.file"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("file", FormFile);

	class FormFiles extends BasicFormControl<Files> {
		constructor(form: Form, define: FormItem) {
			super(form, define, "files", tui.str("form.files"));
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("files", FormFiles);


	interface SectionFormItem extends FormItem {
		fontSize: number;
		align: string;
	}
	class FormSection extends FormControl {
		private _hr: HTMLHRElement;
		constructor(form: Form, define: SectionFormItem) {
			super(form, define);
			this._hr = document.createElement("hr")
			this.div.appendChild(this._hr);
			this.div.style.display = "block";
			this.div.style.width = "initial";
			if (define.label) {
				this._hr.className = "tui-form-line-label";
				if (typeof define.fontSize === "number" && define.fontSize >= 12 && define.fontSize < 48)
					this.label.style.fontSize = define.fontSize + "px";
				if (typeof define.align == "string" && define.align.match(/^(left|right|center)$/i))
					this.label.style.textAlign = define.align;
				else
					this.label.style.textAlign = "left";
			} else {
				this._hr.className = "";
			}
		}

		getName(): string {
			return tui.str("form.section");
		}
		getValue(): any {
			return null;
		}
		setValue(value: any): void {}
		render(): void {}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("section", FormSection);


	interface GroupFormItem extends FormItem {
		options: {value: string, text: string}[] | string[];
		atLeast?: number;
		atMost?: number;
		align?: string;
	}

	class FormOptions extends FormControl {

		private _group: Group;

		constructor(form: Form, define: GroupFormItem) {
			super(form, define);
			this._group = <Group>create("button-group");
			if (define.align === "vertical") {
				this._group._.className += " tui-form-group-align-vertical";
			}
			this._group._set("disable", define.disable);
			var optionType = define.atMost === 1 ? "radio" : "check";
			this._group._set("type", optionType);
			for (let i = 0; i < define.options.length; i++) {
				let option = define.options[i];
				if (!option)
					continue;
				let o = create(optionType);
				if (typeof option === "string") {
					o._set("value", option);
					o._set("text", option);
				} else {
					o._set("value", option.value);
					o._set("text", option.text);
				}
				this._group._.appendChild(o._);
			}
			this._group._set("value", define.value);
			this._group.appendTo(this.div);
		}

		getName(): string {
			return tui.str("form.options");
		}
		getValue(): any {
			return this._group.get("value");
		}
		setValue(value: any): void {
			this._group.get("value", value);
		}
		render(): void {
			this._group.render();
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("options", FormOptions);


	interface GroupFormItem extends FormItem {
		definitions: FormItem[];
		items: any[];
		atLeast?: number;
		atMost?: number;
	}
	class FormGrid extends BasicFormControl<Grid> {
		private _values: any[];
		private _buttonBar: HTMLDivElement;
		private _btnAdd: Button;
		private _btnEdit: Button;
		private _btnDelete: Button;
		constructor(form: Form, define: GroupFormItem) {
			super(form, define, "grid", tui.str("form.grid"));
			if (define.value instanceof Array) {
				this._values = define.value;
			} else {
				this._values = [];
			}
			this._widget._set("list", this._values);
			if (define.definitions) {
				var columns: ColumnInfo[] = [];
				for (let subDef of define.definitions) {
					var col = { name: subDef.label, key: subDef.key };
					columns.push(col);
				}
				this._widget._set("columns", columns);
			}
			this._buttonBar = document.createElement("div");
			this.div.appendChild(this._buttonBar);

			var gp = <ButtonGroup>create("button-group");

			this._btnAdd = <Button>create("button", {text: "<i class='fa fa-plus'></i>"});
			this._btnAdd.appendTo(gp._);

			this._btnEdit = <Button>create("button", {text: "<i class='fa fa-pencil'></i>"});
			this._btnEdit.appendTo(gp._);

			gp.appendTo(this._buttonBar);

			this._btnDelete = <Button>create("button", {text: "<i class='fa fa-trash'></i>"});
			this._btnDelete.appendTo(this._buttonBar);

			this._widget._.style.margin = "2px";
			
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		getValue(): any {
			return this._values;
		}
		setValue(value: any): void {
			if (value instanceof Array) {
				this._values.length = 0;
				this._values = this._values.concat(value);
			}
			this._widget.render();
		}
		validate(): boolean {
			var d = <GroupFormItem>this.define;
			var data = this._widget.get("data");
			if (data.length() < d.atLeast)
				return false;
			else if (data.length() > d.atMost)
				return false;
			else
				return true;
		}
	}
	Form.register("grid", FormGrid);
}