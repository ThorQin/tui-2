/// <reference path="form.ts" />


module tui.widget {
	"use strict";

	export abstract class FormControl {
		mask: HTMLElement;
		div: HTMLElement;
		label: HTMLElement;
		define: FormItem;
		toolbar: HTMLElement;
		btnEdit: Button;
		btnDelete: Button;
		btnAdd: Button;
		btnMoveUp: Button;
		btnMoveDown: Button;
		btnSize: Button;

		protected form: Form;
		protected selected: boolean;

		constructor(form: Form, define: FormItem) {
			this.selected = false;
			this.form = form;
			this.define = define;
			this.div = elem("div");
			this.mask = elem("div");
			this.mask.setAttribute("unselectable", "on");
			this.mask.className = "tui-form-item-mask";
			this.mask.style.display = "none";
			
			this.toolbar = elem("div");
			this.toolbar.className = "tui-form-item-toolbar";

			this.btnAdd = <Button>create("button", {text: "<i class='fa fa-plus'></i>"});
			this.btnAdd.appendTo(this.toolbar);
			this.btnEdit = <Button>create("button", {text: "<i class='fa fa-pencil'></i>"});
			this.btnEdit.appendTo(this.toolbar);
			this.btnSize = <Button>create("button", {text: "<i class='fa fa-arrows-alt'></i>"});
			this.btnSize.appendTo(this.toolbar);
			this.toolbar.appendChild(elem("span"))
			this.btnMoveUp = <Button>create("button", {text: "<i class='fa fa-level-up'></i>"});
			this.btnMoveUp.appendTo(this.toolbar);
			this.btnMoveDown = <Button>create("button", {text: "<i class='fa fa-level-down'></i>"});
			this.btnMoveDown.appendTo(this.toolbar);
			this.toolbar.appendChild(elem("span"))
			this.btnDelete = <Button>create("button", {text: "<i class='fa fa-trash'></i>"});
			this.btnDelete.appendTo(this.toolbar);

			this.div.appendChild(this.mask);
			this.div.className = "tui-form-item-container";

			this.applySize();
			
			this.label = elem("label");
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
			this.btnDelete.on("click", () => {
				this.form.fire("itemremove", {control: this});
			});
			var menu = <Popup>create("menu");
			this.btnSize.on("click", () => {
				menu._set("items", [
					{type: "radio", text: "1x", group: "size", value: 1, checked: this.define.size === 1},
					{type: "radio", text: "2x", group: "size", value: 2, checked: this.define.size === 2},
					{type: "radio", text: "3x", group: "size", value: 3, checked: this.define.size === 3},
					{type: "radio", text: "4x", group: "size", value: 4, checked: this.define.size === 4},
					{type: "radio", text: str("Fill"), group: "size", value: 5, checked: this.define.size === 5},
					{type: "line"},
					{type: "check", text: str("New Line"), value: "newline", checked: this.define.newline}
				]);
				menu.open(this.btnSize._);
			});
			menu.on("click", (e) => {
				var v = e.data.item.value;
				if (v >= 1 && v <= 5)
					this.define.size = v;
				else if (v === "newline")
					this.define.newline = !this.define.newline;
				this.applySize();
				this.form.fire("itemresize", {e: e, control: this});
			});
			this.btnMoveUp.on("click", () => {
				this.form.fire("itemmoveup", {control: this});
			});
			this.btnMoveDown.on("click", () => {
				this.form.fire("itemmovedown", {control: this});
			});
			this.btnAdd.on("click", () => {
				this.form.fire("itemadd", {button: this.btnAdd, control: this});
			});
		}

		isPresent() {
			return this.div.parentElement === this.form._;
		}

		hide() {
			browser.removeNode(this.div);
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

		protected applySize() {
			var define = this.define;
			browser.removeClass(this.div, "tui-form-item-size-2 tui-form-item-size-3 tui-form-item-size-4 tui-form-item-size-full tui-form-item-newline");
			if (define.size > 1 && define.size < 5) {
				define.size = Math.floor(define.size);
				browser.addClass(this.div, " tui-form-item-size-" + define.size);
			} else if (define.size >= 5) {
				browser.addClass(this.div, "tui-form-item-size-full");
				define.size = 5;
			} else
				define.size = 1;
			if (define.newline) {
				define.newline = true;
				browser.addClass(this.div, "tui-form-item-newline");
			} else {
				define.newline = false;
			}
		}

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
		constructor(form: Form, define: FormItem, type: string) {
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


	interface SectionFormItem extends FormItem {
		fontSize: number;
		align: string;
	}
	class FormSection extends FormControl {
		static icon = "fa-font";
		static desc = tui.str("form.section");
		static order = 0;
		
		private _hr: HTMLElement;
		constructor(form: Form, define: SectionFormItem) {
			super(form, define);
			this._hr = elem("hr")
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

	class FormTextbox extends BasicFormControl<Input> {
		static icon = "fa-pencil";
		static desc = tui.str("form.textbox");
		static order = 1;

		constructor(form: Form, define: FormItem) {
			super(form, define, "input");
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
		static icon = "fa-edit";
		static desc = tui.str("form.textarea");
		static order = 2;

		constructor(form: Form, define: FormItem) {
			super(form, define, "textarea");
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("textarea", FormTextarea);


	interface GroupFormItem extends FormItem {
		options: {value: string, text: string}[] | string[];
		atLeast?: number;
		atMost?: number;
		align?: string;
	}
	class FormOptions extends FormControl {
		static icon = "fa-check-square-o";
		static desc = tui.str("form.options");
		static order = 3;

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
			this._group._.innerHTML = "";
			if (define.options) {
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
			}
			if (!define.options || define.options.length == 0) {
				var padding = elem("div");
				padding.style.padding = "10px";
				padding.innerHTML = "Empty";
				this._group._.appendChild(padding);
			}
			this._group._set("value", define.value);
			this._group.appendTo(this.div);
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

	
	class FormSelect extends BasicFormControl<Select> {
		static icon = "fa-toggle-down";
		static desc = tui.str("form.select");
		static order = 4;

		constructor(form: Form, define: FormItem) {
			super(form, define, "select");
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("select", FormSelect);

	class FormDatePicker extends BasicFormControl<DatePicker> {
		static icon = "fa-calendar-o";
		static desc = tui.str("form.datepicker");
		static order = 5;

		constructor(form: Form, define: FormItem) {
			super(form, define, "date-picker");
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("datepicker", FormDatePicker);


	class FormPicture extends BasicFormControl<Picture> {
		static icon = "fa-file-image-o";
		static desc = tui.str("form.picture");
		static order = 6;

		constructor(form: Form, define: FormItem) {
			super(form, define, "picture");
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
		static icon = "fa-file-text-o";
		static desc = tui.str("form.file");
		static order = 7;

		constructor(form: Form, define: FormItem) {
			super(form, define, "file");
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
		static icon = "fa-copy";
		static desc = tui.str("form.files");
		static order = 8;

		constructor(form: Form, define: FormItem) {
			super(form, define, "files", );
		}
		showProperty(): void {
			throw new Error('Method not implemented.');
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("files", FormFiles);

	interface GridFormItem extends FormItem {
		definitions: FormItem[];
		items: any[];
		atLeast?: number;
		atMost?: number;
	}
	class FormGrid extends BasicFormControl<Grid> {
		static icon = "fa-table";
		static desc = tui.str("form.grid");
		static order = 9;

		private _values: any[];
		private _buttonBar: HTMLElement;
		private _btnAdd: Button;
		private _btnEdit: Button;
		private _btnDelete: Button;
		constructor(form: Form, define: GridFormItem) {
			super(form, define, "grid");
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
			this._buttonBar = elem("div");
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