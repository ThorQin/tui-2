/// <reference path="form.ts" />


module tui.widget {
	"use strict";

	const FULL = 6;

	export interface PropertyPage {
		name: string;
		properties: FormItem[];
		designMode?: boolean;
		form?: Form;
	}

	export interface Calculator {
		cache: {[index: string]: any};
		calc: (key: string, searchPath: string[]) => void;
		path: string[];
	}

	export abstract class FormControl<D extends FormItem> {
		mask: HTMLElement;
		div: HTMLElement;
		label: HTMLElement;
		define: D;
		toolbar: HTMLElement;
		btnEdit: Button;
		btnDelete: Button;
		btnAdd: Button;
		btnMoveUp: Button;
		btnMoveDown: Button;
		btnSize: Button;

		protected form: Form;
		protected selected: boolean;

		constructor(form: Form, define: D) {
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
			if (this.isResizable()) {
				this.btnSize.appendTo(this.toolbar);
			}
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
			
			this.label = elem("div");
			this.label.className = "tui-form-item-label";
			this.div.appendChild(this.label);
		
			$(this.mask).mousedown((e: JQueryEventObject) => {
				this.form.fire("itemmousedown", {e: e, control: this});
			});
			$(this.mask).mousemove((e: JQueryEventObject) => {
				this.form.fire("itemmousemove", {e: e, control: this});
			});
			$(this.mask).mouseup((e: JQueryEventObject) => {
				this.form.fire("itemmouseup", {e: e, control: this});
			});
			$(this.mask).dblclick(() => {
				this.showProperties();
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
					{type: "radio", text: "5x", group: "size", value: 5, checked: this.define.size === 5},
					{type: "radio", text: str("Fill"), group: "size", value: FULL, checked: this.define.size === FULL},
					{type: "line"},
					{type: "check", text: str("New Line"), value: "newline", checked: this.define.newline}
				]);
				menu.open(this.btnSize._);
			});
			menu.on("click", (e) => {
				var v = e.data.item.value;
				if (v >= 1 && v <= FULL)
					this.define.size = v;
				else if (v === "newline")
					this.define.newline = !this.define.newline;
				this.applySize();
				this.form.fire("itemresize", {e: e, control: this});
			});
			this.btnEdit.on("click", () => {
				this.showProperties();
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

		showProperties() {
			var properties: FormItem[] = [
				{
					"type": "textbox",
					"label": str("form.section"),
					"key": "label",
					"value": this.define.label
				}, {
					"type": "textbox",
					"label": str("form.field.name"),
					"key": "key",
					"value": this.define.key
				}, {
					"type": "options",
					"label": str("form.options"),
					"key": "options",
					"size": 1,
					"options": [
						{ "value": "required", "text": str("form.required") },
						{ "value": "disable", "text": str("form.disable") }
					],
					"newline": true,
					"value": [this.define.required ? "required" : null, this.define.disable ? "disable" : null]
				}, {
					"type": "textarea",
					"maxHeight": 200,
					"label": str("form.description"),
					"key": "description",
					"value": this.define.description,
					"size": FULL
				}, {
					"type": "textarea",
					"maxHeight": 200,
					"label": str("form.precondition"),
					"key": "condition",
					"value": this.define.condition,
					"size": FULL
				}
			];
			var pages: PropertyPage[] = [{name: str("form.common"), properties: properties}];
			var specificProperties = this.getProperties();
			if (specificProperties) {
				for (let p of specificProperties) {
					pages.push(p);
				}
			}
			var container = elem("div");
			var tab = create("button-group");
			tab._.className = "tui-tab tui-form-properties-tab";
			tab._set("type", "radio");
			container.appendChild(tab._);
			for (let i = 0; i < pages.length; i++) {
				let page = pages[i];
				let btn = create("radio");
				btn._set("text", page.name.toUpperCase());
				btn._set("value", i);
				if (i == 0)
					btn._set("checked", true);
				tab._.appendChild(btn._);
				let form = <Form>create("form");
				form._.className = "tui-form-property-form";
				if (i > 0)
					form._.style.display = "none";
				form.set("definition", page.properties);
				if (page.designMode)
					form.set("mode", "design");
				page.form = form;
				container.appendChild(form._);
			}
			tab.on("click", function() {
				var target: number = this.get("value");
				for (let i = 0; i < pages.length; i++) {
					if (i != target)
						pages[i].form._.style.display = "none";
				}
				for (let i = 0; i < pages.length; i++) {
					if (i == target)
						pages[i].form._.style.display = "block";
				}
			});
			var dialog = <Dialog>create("dialog");
			dialog.set("content", container);
			dialog.open("ok#tui-primary");
			dialog.on("btnclick", () => {
				var values: {[index: string]: any} = pages[0].form.get("value");
				var customValues: any[] = [];
				customValues.push(values);
				for (let i = 1; i < pages.length; i++) {
					if (pages[i].designMode) {
						customValues.push(pages[i].form.get("definition"));
					} else {
						if (!pages[i].form.validate()) {
							tab.set("value", i);
							tab.fire("click");
							return;
						}
						customValues.push(pages[i].form.get("value"));
					}
				}
				this.define.label = values.label;
				this.define.key = values.key;
				this.define.condition = values.condition;
				this.define.description = values.description;
				this.define.disable = (values.options.indexOf("disable") >= 0);
				this.define.required = (values.options.indexOf("required") >= 0);
				this.setProperties(customValues);
				this.update();
				this.form.fire("itemvaluechanged", {control: this});
				dialog.close();
				
			});
		}

		update() {
			var d = this.define;
			if (!d.label && !d.description) {
				browser.addClass(this.label, "tui-hidden");
			} else {
				browser.removeClass(this.label, "tui-hidden");
				if (!d.label)
					this.label.innerHTML = "&nbsp;";
				else
					this.label.innerHTML = browser.toSafeText(d.label);
				if (d.required) {
					browser.addClass(this.label,"tui-form-item-required");
				} else {
					browser.removeClass(this.label,"tui-form-item-required");
				}
				if (d.description) {
					var desc = elem("span");
					desc.setAttribute("tooltip", d.description);
					this.label.appendChild(desc);
				}
			}
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
			if (define.size > 1 && define.size < FULL) {
				define.size = Math.floor(define.size);
				browser.addClass(this.div, " tui-form-item-size-" + define.size);
			} else if (define.size >= FULL) {
				browser.addClass(this.div, "tui-form-item-size-full");
				define.size = FULL;
			} else
				define.size = 1;
			if (define.newline) {
				define.newline = true;
				browser.addClass(this.div, "tui-form-item-newline");
			} else {
				define.newline = false;
			}
		}

		abstract getValue(cal: Calculator): any;
		abstract setValue(value: any): void;
		abstract isResizable(): boolean;
		abstract render(designMode: boolean): void;
		abstract getProperties(): PropertyPage[];
		abstract setProperties(properties: any[]): void;
		abstract validate(): boolean;
	}

	export abstract class BasicFormControl<T extends Widget, D extends FormItem> extends FormControl<D> {
		protected _widget: T;
		protected _name: string;

		/**
		 * Base class constructor of the simple form control.
		 * @param form Which form will contain this control.
		 * @param define Form item definition.
		 * @param type The name of what your tui control will be used.
		 * @param name The human friendly name of the form control.
		 */
		constructor(form: Form, define: D, type: string) {
			super(form, define);
			this._name = name;
			this._widget = <T>create(type);
			this._widget.appendTo(this.div);
		}

		update() {
			super.update();
			this._widget._set("disable", !!this.define.disable);
			this._widget._set("value", typeof this.define.value === UNDEFINED ? null : this.define.value);
			if (this.define.validation instanceof Array) {
				this._widget._set("validate", this.define.validation);
			} else {
				this._widget._set("validate", []);
			}
		}

		isResizable(): boolean {
			return true;
		}

		getValue(cal: Calculator = null): any {
			return this._widget.get("value");
		}
		setValue(value: any): void {
			this._widget.set("value", value);
		}
		render(designMode: boolean): void {
			this._widget.render();
		}
	}





	// SECTION
	// ----------------------------------------------------------------------------------------------------------
	interface SectionFormItem extends FormItem {
		fontSize: number;
		align: string;
		hidden?: boolean;
	}
	class FormSection extends FormControl<SectionFormItem> {
		static icon = "fa-font";
		static desc = "form.section";
		static order = 0;
		
		private _hr: HTMLElement;
		constructor(form: Form, define: SectionFormItem) {
			super(form, define);
			this._hr = elem("hr")
			this.div.appendChild(this._hr);
			this.div.style.display = "block";
			this.div.style.width = "auto";
		}

		update() {
			super.update();
			var d = this.define;
			if (d.label) {
				this._hr.className = "tui-form-line-label";
				if (typeof d.fontSize === "number" && d.fontSize >= 12 && d.fontSize <= 48)
					this.label.style.fontSize = d.fontSize + "px";
				else
					this.label.style.fontSize = "";
				if (typeof d.align == "string" && d.align.match(/^(left|right|center)$/i))
					this.label.style.textAlign = d.align;
				else
					this.label.style.textAlign = "left";
			} else {
				this._hr.className = "";
			}
		}

		isResizable(): boolean {
			return false;
		}

		getValue(): any {
			return typeof this.define.value !== UNDEFINED ? this.define.value : null;
		}
		setValue(value: any): void {
			if (typeof value !== UNDEFINED)
				this.define.value = value;
		}

		render(designMode: boolean): void {
			if (this.define.hidden && !designMode) {
				browser.addClass(this.div, "tui-hidden");
			} else {
				browser.removeClass(this.div, "tui-hidden");
			}
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.section"),
				properties: [
					{
						"type": "textbox",
						"key": "fontSize",
						"label": str("form.font.size"),
						"value": this.define.fontSize,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.format") },
							{ "format": "*min:12", "message": str("message.invalid.value") },
							{ "format": "*max:48", "message": str("message.invalid.value") }
						]
					}, {
						"type": "textbox",
						"key": "value",
						"label": str("form.value"),
						"value": this.define.value
					}, {
						"type": "options",
						"key": "align",
						"label": str("form.text.align"),
						"atMost": 1,
						"options": [
							{value: "left", text: str("form.align.left")}, 
							{value: "center", text: str("form.align.center")}, 
							{value: "right", text: str("form.align.right")}
						],
						"size": 6,
						"value": this.define.align || "left"
					}, {
						"type": "options",
						"key": "hidden",
						"label": str("form.display"),
						"atMost": 1,
						"options": [
							{value: false, text: str("form.visible")}, 
							{value: true, text: str("form.invisible")}
						],
						"size": 6,
						"value": !!this.define.hidden
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values: {[index: string]: any} = properties[1];
			if (values.fontSize && /^\d+$/.test(values.fontSize))
				this.define.fontSize = parseInt(values.fontSize);
			else
				this.define.fontSize = null;
			if (values.align && /^(left|center|right)$/.test(values.align))
				this.define.align = values.align;
			else
				this.define.align = "left";
			this.define.value = values.value;
			this.define.hidden = text.parseBoolean(values.hidden);
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("section", FormSection);





	// TEXTBOX
	// ----------------------------------------------------------------------------------------------------------
	interface TextboxFormItem extends FormItem {
		validation?: {format: string, message: string}[];
		selection?: string[];
		inputType?: string;
	}

	class FormTextbox extends BasicFormControl<Input, TextboxFormItem> {
		static icon = "fa-pencil";
		static desc = "form.textbox";
		static order = 1;

		constructor(form: Form, define: FormItem) {
			super(form, define, "input");
			this._widget.on("change", (e) => {
				this.define.value = this.getValue();
				form.fire("itemvaluechanged", {control: this});
			});
			this._widget.on("right-icon-click", () => {
				if (!this.define.selection || !this.define.selection.length)
					return;
				var menu = <Menu>create("menu");
				var items = [];
				for (let s of this.define.selection) {
					items.push({
						text: s
					});
				}
				menu._set("items", items);
				menu.open(this._widget._, "Rb");
				menu.on("click", (e: any) => {
					this._widget.set("text", e.data.item.text);
					this.define.value = this.getValue();
					this._widget.reset();
					this._widget.focus();
					form.fire("itemvaluechanged", {control: this});
				});
			});
		}

		update() {
			super.update();
			if (/^(text|password|email|url|number)$/.test(this.define.inputType)) {
				this._widget._set("type", this.define.inputType);
			} else {
				this._widget._set("type", "text");
			}
			if (this.define.selection) {
				this._widget._set("iconRight", "fa-caret-down");
			} else {
				this._widget._set("iconRight", null);
			}
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.textbox"),
				properties: [
					{
						"type": "options",
						"key": "inputType",
						"label": str("form.input.type"),
						"options": [
							{"value": "text", "text": str("form.text") },
							{"value": "password", "text": str("form.password") },
							{"value": "email", "text": str("form.email") },
							{"value": "url", "text": str("form.url") },
							{"value": "number", "text": str("form.number") }
						],
						"atMost": 1,
						"value": this.define.inputType ? this.define.inputType : "text",
						"size": 2,
						"newline": true
					}, {
						"type": "textarea",
						"maxHeight": 300,
						"key": "selection",
						"label": str("form.options"),
						"description": str("form.textbox.selection.desc"),
						"value": this.define.selection ? this.define.selection.join("\n") : "",
						"size": 2
					}, {
						"type": "grid",
						"key": "validation",
						"label": str("form.validation"),
						"size": 2,
						"newline": true,
						"height": 150,
						"definitions": [
							{
								"type": "textbox",
								"key": "format",
								"required": true,
								"label": str("form.format"),
								"selection": [
									"*any", "*url", "*email", "*digital", "*integer", "*float", "*number", "*currency", "*date", "*key", "*max:<?>", "*min:<?>", "*maxlen:<?>", "*minlen:<?>"
								],
								"validation": [
									{ "format": "*any", "message": str("message.cannot.be.empty")},
									{ "format": "^(\\*(any|key|integer|number|digital|url|email|float|currency|date|max:\\d+|min:\\d+|maxlen:\\d+|minlen:\\d+)|[^\\*].*)$", "message": str("message.invalid.format")}
								],
								"size": 2
							}, {
								"type": "textarea",
								"key": "message",
								"maxHeight": 300,
								"required": true,
								"label": str("form.message"),
								"size": 2,
								"newline": true,
								"validation": [
									{ "format": "*any", "message": str("message.cannot.be.empty")}
								]
							}
						],
						"value": this.define.validation
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			var selection = [];
			if (values.selection) {
				var arr = (values.selection + "").split("\n");
				for (let i = 0; i < arr.length; i++) {
					let s = arr[i].trim();
					if (s)
						selection.push(s);
				}
			}
			this.define.selection = selection;
			this.define.inputType = values.inputType;
			this.define.validation = values.validation;
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("textbox", FormTextbox);



	// TEXTAREA
	// ----------------------------------------------------------------------------------------------------------
	interface TextareaFormItem extends FormItem {
		validation?: {format: string, message: string}[];
		maxHeight?: number;
	}
	class FormTextarea extends BasicFormControl<Textarea, TextareaFormItem> {
		static icon = "fa-edit";
		static desc = "form.textarea";
		static order = 2;
		static init = {
			maxHeight: 300
		};

		constructor(form: Form, define: TextareaFormItem) {
			super(form, define, "textarea");
			this._widget.on("change", (e) => {
				this.define.value = this.getValue();
				form.fire("itemvaluechanged", {control: this});
			});
		}
		getProperties(): PropertyPage[] {
			return [{
				name: str("form.textarea"),
				properties: [
					{
						"type": "textbox",
						"key": "maxHeight",
						"label": str("form.max.height"),
						"value": this.define.maxHeight,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.format") }
						],
						"size": 2,
						"newline": true
					}, {
						"type": "grid",
						"key": "validation",
						"label": str("form.validation"),
						"size": 2,
						"newline": true,
						"height": 150,
						"definitions": [
							{
								"type": "textbox",
								"key": "format",
								"required": true,
								"label": str("form.format"),
								"selection": [
									"*any", "*email", "*url", "*maxlen:<?>", "*minlen:<?>"
								],
								"validation": [
									{ "format": "*any", "message": str("message.cannot.be.empty")},
									{ "format": "^(\\*(any|url|email|maxlen:\\d+|minlen:\\d+)|[^\\*].*)$", "message": str("message.invalid.format")}
								],
								"size": 2
							}, {
								"type": "textarea",
								"key": "message",
								"maxHeight": 300,
								"required": true,
								"label": str("form.message"),
								"size": 2,
								"newline": true,
								"validation": [
									{ "format": "*any", "message": str("message.cannot.be.empty")}
								]
							}
						],
						"value": this.define.validation
					}
				]
			}];
		}
		update() {
			super.update();
			if (/\d+/.test((this.define.maxHeight + "").trim()))
				this._widget._.style.maxHeight = (this.define.maxHeight + "").trim() + "px";
			else
				this._widget._.style.maxHeight = "";
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.validation = values.validation;
			if (/\d+/.test(values.maxHeight + ""))
				this.define.maxHeight = values.maxHeight;
			else
				this.define.maxHeight = null;
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("textarea", FormTextarea);




	// OPTIONS
	// ----------------------------------------------------------------------------------------------------------
	interface OptionsFormItem extends FormItem {
		options: ({value: string, text: string} | string)[];
		atLeast?: number;
		atMost?: number;
		align?: string;
	}
	class FormOptions extends FormControl<OptionsFormItem> {
		static icon = "fa-check-square-o";
		static desc = "form.option.group";
		static order = 3;
		static init = { "options": [
			{"value": "1", "text": "A"},
			{"value": "2", "text": "B"},
			"C", "D"
		]};

		private _group: Group;
		private _notifyBar: HTMLElement;

		static optionsToText(options: ({value: string, text: string}|string)[]): string {
			var result = "";
			if (!options)
				return result;
			for (let o of options) {
				if (result.length > 0)
					result += "\n";
				if (typeof o === "string") {
					result += o;
				} else {
					if (o.value === o.text) {
						result += o;
					} else {
						result += o.value + ":" + o.text;
					}
				}
			}
			return result;
		}

		static textToOptions(options: string): ({value: string, text: string}|string)[] {
			var result:  ({value: string, text: string}|string)[] = [];
			if (!options)
				return result;
			var arr = options.split("\n");
			for (let s of arr) {
				if (s.trim().length > 0) {
					let pos = s.indexOf(":");
					if (pos > 0) {
						let v = s.substring(0, pos);
						let t = s.substring(pos + 1);
						if (v === t)
							result.push(v);
						else
							result.push({value: v, text: t});
					} else
						result.push(s);
				}
			}
			return result;
		}

		constructor(form: Form, define: OptionsFormItem) {
			super(form, define);
			this._group = <Group>create("button-group");
			this._group.on("click", (e) => {
				this.define.value = this.getValue();
				this._notifyBar.innerHTML = "";
				form.fire("itemvaluechanged", {control: this});
			});
			this._group.appendTo(this.div);
			this._notifyBar = elem("div");
			this._notifyBar.className = "tui-form-options-notify";
			this.div.appendChild(this._notifyBar);
		}

		isResizable(): boolean {
			return true;
		}

		update() {
			super.update();
			var define = this.define;
			if (define.align === "vertical") {
				browser.addClass(this._group._, " tui-form-group-align-vertical");
			} else {
				browser.removeClass(this._group._, " tui-form-group-align-vertical");
			}
			this._group._set("disable", !!define.disable);
			var optionType = define.atMost == 1 ? "radio" : "check";
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
			define.value = this._group.get("value");
			this._notifyBar.innerHTML = "";
		}

		getValue(): any {
			return this._group.get("value");
		}
		setValue(value: any): void {
			this._group.get("value", value);
		}
		render(designMode: boolean): void {
			this._group.render();
			if (this._notifyBar.innerHTML == "") {
				browser.addClass(this._notifyBar, "tui-hidden");
			} else {
				browser.removeClass(this._notifyBar, "tui-hidden");
			}
		}
		getProperties(): PropertyPage[] {
			return [{
				name: str("form.option.group"),
				properties: [
					{
						"type": "textbox",
						"key": "atLeast",
						"label": str("form.at.least"),
						"value": /^\d+$/.test(this.define.atLeast + "") ? this.define.atLeast: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}, {
						"type": "textbox",
						"key": "atMost",
						"label": str("form.at.most"),
						"value": /^\d+$/.test(this.define.atMost + "") ? this.define.atMost: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}, {
						"type": "options",
						"key": "align",
						"label": str("form.align"),
						"value": this.define.align === "vertical" ? "vertical" : "normal",
						"options": [
							{ "value": "normal", "text": str("normal") },
							{ "value": "vertical", "text": str("vertical") }
						],
						"atMost": 1,
						"newline": true
					}, {
						"type": "textarea",
						"maxHeight": 300,
						"key": "options",
						"label": str("form.options"),
						"description": str("form.option.group.desc"),
						"value": FormOptions.optionsToText(this.define.options),
						"validation": [
							{ "format": "*any", "message": str("message.cannot.be.empty") }
						],
						"size": 6
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.align = values.align;
			this.define.atLeast = values.atLeast ? parseInt(values.atLeast) : null;
			this.define.atMost = values.atMost ? parseInt(values.atMost) : null;
			this.define.options = FormOptions.textToOptions(values.options);
		}
		validate(): boolean {
			var count: number;
			if (this.define.value instanceof Array) {
				count = this.define.value.length;
			} else if (this.define.value) {
				count = 1;
			} else {
				count = 0;
			}
			if (this.define.atLeast) {
				var atLeast = parseInt(this.define.atLeast + "");
				if (count < atLeast) {
					this._notifyBar.innerHTML = browser.toSafeText(strp("form.at.least.p", atLeast));
					return false;
				}
			}
			if (this.define.atMost) {
				var atMost = parseInt(this.define.atMost + "");
				if (count > atMost) {
					this._notifyBar.innerHTML = browser.toSafeText(strp("form.at.most.p", atMost));
					return false;
				}
			}
			return true;
		}
	}
	Form.register("options", FormOptions);




	// SELECT
	// ----------------------------------------------------------------------------------------------------------
	interface ListNode {
		name: string;
		value: string;
		children?: ListNode[]
	}
	interface ListData {
		condition: string;
		data: ListNode[];
	}
	interface SelectFormItem extends FormItem {
		validation?: {format: string, message: string}[];
		selection?: ListData[];
		atLeast?: number;
		atMost?: number;
	}
	class FormSelect extends BasicFormControl<Select, SelectFormItem> {
		static icon = "fa-toggle-down";
		static desc = "form.selection";
		static order = 4;

		static selectionToText(selection: ListData[]): string {
			var result = "";
			if (!selection)
				return result;
			function addNodes(nodes: ListNode[], level: string = "") {
				if (nodes) {
					var padding = (level ? level + " " : "");
					for (let item of nodes) {
						if (item.value == item.name) {
							result += padding + item.value + "\n";
						} else {
							result += padding + item.value + ": " + item.name + "\n";
						}
						addNodes(item.children, level + ">");
					}
				}
			}
			for (let o of selection) {
				if (result.length > 0)
					result += "\n";
				if (o.condition) {
					result += "[" + o.condition + "]\n";
				}
				addNodes(o.data);
			}
			return result;
		}

		static textToSelection(selection: string): ListData[] {
			var result: ListData[] = [];
			if (!selection)
				return result;
			function getLeve(s: string): number {
				var count = 0;
				if (!s)
					return 0;
				for (let c of s) {
					if (c == '>')
						count++;
				}
				return count;
			}
			function getNode(s: string): ListNode {
				s = s.trim();
				var pos = s.indexOf(":");
				if (pos < 0) {
					return { value: s, name: s};
				} else {
					var value = s.substring(0, pos).trim();
					var name = s.substring(pos + 1).trim();
					return { value: value, name: name};
				}
			}
			function toTree(list: string[]) : ListNode[] {
				var result: ListNode[] = [];
				function getList(pos: number, nodes: ListNode[], level: number): number {
					for (var i = pos; i < list.length; i++) {
						let s = list[i];
						let lv = getLeve(s);
						if (lv == level) {
							nodes.push(getNode(s.substr(lv)));
						} else if (lv == level + 1 && nodes.length > 0) {
							let children: ListNode[] = [];
							nodes[nodes.length - 1].children = children;
							i = getList(i, children, level + 1);
						} else if (lv < level) {
							return i - 1;
						} else
							continue;
					}
					return i;
				}
				getList(0, result, 0);
				return result;
			}
			var tmp: {condition: string, list: string[]}[] = [];
			var arr = selection.split("\n");
			var condition: string = null;
			var nodeList: string[] = null;
			for (let s of arr) {
				if (s.trim().length > 0) {
					s = s.trim();
					if (s[0] === '[') {
						if (/^\[.+\]$/.test(s)) {
							if (nodeList) {
								let data = { "condition": condition, "list": nodeList };
								tmp.push(data);
							}
							condition = s.substr(1, s.length - 2);
							nodeList = null;
						}
					} else {
						if (nodeList == null)
							nodeList = [];
						nodeList.push(s);
					}
				}
			}
			if (nodeList) {
				let data = { "condition": condition, "list": nodeList };
				tmp.push(data);
			}
			for (let t of tmp) {
				result.push({ "condition": t.condition, "data": toTree(t.list) })
			}
			return result;
		}

		constructor(form: Form, define: SelectFormItem) {
			super(form, define, "select");
			this._widget.on("change", (e) => {
				form.fire("itemvaluechanged", {control: this});
			});
		}
		update() {
			super.update();
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.selection"),
				properties: [
					{
						"type": "textbox",
						"key": "atLeast",
						"label": str("form.at.least"),
						"value": /^\d+$/.test(this.define.atLeast + "") ? this.define.atLeast: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}, {
						"type": "textbox",
						"key": "atMost",
						"label": str("form.at.most"),
						"value": /^\d+$/.test(this.define.atMost + "") ? this.define.atMost: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}, {
						"type": "textarea",
						"key": "selection",
						"maxHeight": 400,
						"label": str("form.selection"),
						"description": str("form.selection.desc"),
						"value": FormSelect.selectionToText(this.define.selection),
						"validation": [
							{ "format": "*any", "message": str("message.cannot.be.empty") }
						],
						"size": 6
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.atLeast = values.atLeast  > 0 ? parseInt(values.atLeast) : null;
			this.define.atMost = values.atMost > 0 ? parseInt(values.atMost) : null;
			this.define.selection = FormSelect.textToSelection(values.selection);
		}

		getValue(cal: Calculator = null): any {
			if (!cal)
				return this._widget.get("value");

			var key = this.define.key;
			var data: ListNode[] = [];
			if (this.define.selection) {
				if (cal.path.indexOf(key) >= 0)
					throw new Error("Invalid expression of select control: Cycle reference detected on \"" + key + "\"");
				cal.path.push(key);				
				for (let d of this.define.selection) {
					if (d.condition) {
						if (text.exp.evaluate(d.condition, function (k: string) {
							if (cal.cache.hasOwnProperty(k))
								return cal.cache[k];
							else {
								cal.calc(k, cal.path);
								return cal.cache[k];
							}
						})) {
							data.splice(data.length, 0, ...d.data);
						}
					} else {
						data.splice(data.length, 0, ...d.data);
					}
				}
			}
			this._widget._set("tree", data);
			return this._widget.get("value");
		}

		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("select", FormSelect);



	// DATE PICKER
	// ----------------------------------------------------------------------------------------------------------
	interface DatePickerFormItem extends FormItem {

	}
	class FormDatePicker extends BasicFormControl<DatePicker, DatePickerFormItem> {
		static icon = "fa-calendar-o";
		static desc = "form.datepicker";
		static order = 5;

		constructor(form: Form, define: DatePickerFormItem) {
			super(form, define, "date-picker");
			this._widget.on("change", (e) => {
				form.fire("itemvaluechanged", {control: this});
			});
		}
		getProperties(): PropertyPage[] {
			throw new Error('Method not implemented.');
		}
		setProperties(properties: any[]) {
			
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("datepicker", FormDatePicker);




	// PICTURE
	// ----------------------------------------------------------------------------------------------------------
	interface PictureFormItem extends FormItem {

	}
	class FormPicture extends BasicFormControl<Picture, PictureFormItem> {
		static icon = "fa-file-image-o";
		static desc = "form.picture";
		static order = 6;

		constructor(form: Form, define: PictureFormItem) {
			super(form, define, "picture");
			this._widget.on("success", (e) => {
				form.fire("itemvaluechanged", {control: this});
			});
		}
		getProperties(): PropertyPage[] {
			throw new Error('Method not implemented.');
		}
		setProperties(properties: any[]) {
			
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("picture", FormPicture);



	// FILE
	// ----------------------------------------------------------------------------------------------------------
	interface FileFormItem extends FormItem {

	}
	class FormFile extends BasicFormControl<File, FileFormItem> {
		static icon = "fa-file-text-o";
		static desc = "form.file";
		static order = 7;

		constructor(form: Form, define: FileFormItem) {
			super(form, define, "file");
			this._widget.on("success", (e) => {
				form.fire("itemvaluechanged", {control: this});
			});
		}
		getProperties(): PropertyPage[] {
			throw new Error('Method not implemented.');
		}
		setProperties(properties: any[]) {
			
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("file", FormFile);




	// MULTIPLE FILES
	// ----------------------------------------------------------------------------------------------------------
	interface FilesFormItem extends FormItem {

	}
	class FormFiles extends BasicFormControl<Files, FilesFormItem> {
		static icon = "fa-copy";
		static desc = "form.files";
		static order = 8;

		constructor(form: Form, define: FilesFormItem) {
			super(form, define, "files", );
			this._widget.on("success", (e) => {
				form.fire("itemvaluechanged", {control: this});
			});
		}
		getProperties(): PropertyPage[] {
			throw new Error('Method not implemented.');
		}
		setProperties(properties: any[]) {
			
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("files", FormFiles);




	// GRID
	// ----------------------------------------------------------------------------------------------------------
	interface GridFormItem extends FormItem {
		definitions: FormItem[];
		items: any[];
		atLeast?: number;
		atMost?: number;
		height?: number;
	}
	class FormGrid extends BasicFormControl<Grid, GridFormItem> {
		static icon = "fa-table";
		static desc = "form.grid";
		static order = 9;

		private _values: any[];
		private _buttonBar: HTMLElement;
		private _btnAdd: Button;
		private _btnEdit: Button;
		private _btnDelete: Button;
		constructor(form: Form, define: GridFormItem) {
			super(form, define, "grid");
			this._widget._.style.margin = "2px";
			this._buttonBar = elem("div");
			this.div.appendChild(this._buttonBar);
			var gp = <ButtonGroup>create("button-group");
			this._btnAdd = <Button>create("button", {text: "<i class='fa fa-plus'></i>"});
			this._btnAdd.appendTo(gp._);
			this._btnAdd.on("click", () => {
				var dialog = <Dialog>create("dialog");
				var fm = <Form>create("form");
				fm.set("definition", this.define.definitions);
				dialog.set("content", fm._);
				dialog.open("ok#tui-primary");
				dialog.on("btnclick", () => {
					if (!fm.validate())
						return;
					var v = fm.get("value");
					this._values.push(v);
					dialog.close();
					form.fire("itemvaluechanged", {control: this});
				});
			});

			this._btnEdit = <Button>create("button", {text: "<i class='fa fa-pencil'></i>"});
			this._btnEdit.appendTo(gp._);
			this._btnEdit.on("click", () => {
				this.editRow();
			});
			this._widget.on("rowdblclick", () => {
				this.editRow();
			});

			gp.appendTo(this._buttonBar);

			this._btnDelete = <Button>create("button", {text: "<i class='fa fa-trash'></i>"});
			this._btnDelete.appendTo(this._buttonBar);
			this._btnDelete.on("click", () => {
				var i = this._widget.get("activeRow");
				if (i === null)
					return;
				this._values.splice(i, 1);
				form.fire("itemvaluechanged", {control: this});
			});
		}

		editRow() {
			var i = this._widget.get("activeRow");
			if (i === null)
				return;
			var dialog = <Dialog>create("dialog");
			var fm = <Form>create("form");
			fm.set("definition", this.define.definitions);
			dialog.set("content", fm._);
			dialog.open("ok#tui-primary");
			fm.set("value", this._values[i]);
			dialog.on("btnclick", () => {
				if (!fm.validate())
					return;
				var v = fm.get("value");
				this._values.splice(i, 1, v);
				dialog.close();
				this.form.fire("itemvaluechanged", {control: this});
			});
		}

		update() {
			super.update();
			var d = this.define;
			if (d.value instanceof Array) {
				this._values = d.value;
			} else {
				d.value = this._values = [];
			}
			this._widget._set("list", this._values);
			if (this.define.definitions) {
				var columns: ColumnInfo[] = [];
				for (let subDef of d.definitions) {
					if (!subDef.key)
						continue;
					var col = { name: subDef.label, key: subDef.key };
					columns.push(col);
				}
				this._widget._set("columns", columns);
			} else {
				this._widget._set("columns", []);
			}
			if (typeof d.height === "number" && !isNaN(d.height) || 
				typeof d.height === "string" && /^\d+$/.test(d.height)) {
				this._widget._.style.height = d.height + "px";
			} else {
				this._widget._.style.height = "";
				d.height = null;
			}
		}

		getProperties(): PropertyPage[] {
			throw new Error('Method not implemented.');
		}
		setProperties(properties: any[]) {
			
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
			var d = this.define;
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