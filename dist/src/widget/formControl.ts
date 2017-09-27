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

	interface Option {
		text: string;
		value: string;
		check?: boolean;
		children?: Option[]
	}
	interface OptionGroup {
		condition: string;
		data: Option[];
	}

	function optionsToText(options: OptionGroup[]): string {
		var result = "";
		if (!options)
			return result;
		function addNodes(nodes: Option[], level: string = "") {
			if (nodes) {
				var padding = (level ? level + " " : "");
				for (let item of nodes) {
					if (item.value == item.text) {
						result += padding + item.value + "\n";
					} else {
						result += padding + item.value + ": " + item.text + "\n";
					}
					addNodes(item.children, level + ">");
				}
			}
		}
		for (let o of options) {
			if (result.length > 0)
				result += "\n";
			if (o.condition) {
				result += "[" + o.condition + "]\n";
			}
			addNodes(o.data);
		}
		return result;
	}

	function textToOptions(text: string): OptionGroup[] {
		var result: OptionGroup[] = [];
		if (!text)
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
		function getNode(s: string): Option {
			s = s.trim();
			var pos = s.indexOf(":");
			if (pos < 0) {
				return { value: s, text: s, check: false};
			} else {
				var value = s.substring(0, pos).trim();
				var text = s.substring(pos + 1).trim();
				return { value: value, text: text, check: false};
			}
		}
		function toTree(list: string[]) : Option[] {
			var result: Option[] = [];
			function getList(pos: number, nodes: Option[], level: number): number {
				for (var i = pos; i < list.length; i++) {
					let s = list[i];
					let lv = getLeve(s);
					if (lv == level) {
						nodes.push(getNode(s.substr(lv)));
					} else if (lv == level + 1 && nodes.length > 0) {
						let children: Option[] = [];
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
		var arr = text.split("\n");
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

	function exist(arr: string[]| null, option: string): boolean {
		if (arr instanceof Array && arr.indexOf(option) >= 0) {
			return true;
		} else {
			return false;
		}
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


		static detectRequired(pages: PropertyPage[], recentPage: number) {
			var options = pages[0].form.get("value").options;
			let atLeast = pages[1].form.getItem("atLeast").getValue(null);
			if (recentPage == 0) {
				if (options.indexOf("required") >= 0) {
					if (!atLeast || atLeast <= 0)
						pages[1].form.getItem("atLeast").setValue(1);
				} else {
					pages[1].form.getItem("atLeast").setValue(null);
				}
			} else if (recentPage == 1) {
				if (atLeast && atLeast > 0)
					text.arrayAdd(options, "required");
				else
					text.arrayRemove(options, "required");
				pages[0].form.getItem("options").setValue(options);
			}
		}

		static detectRequiredByValidation(pages: PropertyPage[], recentPage: number) {
			var options = pages[0].form.get("value").options;
			var vdef = pages[1].form.getItem("validation");
			let validation = vdef && vdef.getValue(null) || null;
			var hasAny = false;
			if (validation) {
				for (let v of validation) {
					if (v.format.trim() === "*any") {
						hasAny = true;
						break;
					}
				}
			} else
				validation = [];
			if (recentPage == 0) {
				if (options.indexOf("required") >= 0) {
					if (!hasAny) {
						validation.push({"format": "*any", "message": str("message.cannot.be.empty")});
					}
				} else {
					if (hasAny) {
						var i = 0;
						while (i < validation.length) {
							if (validation[i].format.trim() === "*any") {
								validation.splice(i, 1);
							} else
								i++;
						}
					}
				}
				pages[1].form.getItem("validation").setValue(validation);
			} else if (recentPage == 1) {
				if (hasAny)
					text.arrayAdd(options, "required");
				else
					text.arrayRemove(options, "required");
				pages[0].form.getItem("options").setValue(options);
			}
		}


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

		protected onPropertyPageSwitch(propertyPages: PropertyPage[], recentPage: number): void {
			// Sub class should override this method to implement properties comovement.
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
					"size": 2,
					"options": [{"data":[
						{ "value": "required", "text": str("form.required") },
						{ "value": "disable", "text": str("form.disable") },
						{ "value": "emphasize", "text": str("form.emphasize") }
					]}],
					"newline": true,
					"value": [this.define.required ? "required" : null, this.define.disable ? "disable" : null, this.define.emphasize ? "emphasize" : null]
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
			var recentPage = 0;
			tab.on("click", () => {
				var target: number = tab.get("value");
				for (let i = 0; i < pages.length; i++) {
					if (i != target)
						pages[i].form._.style.display = "none";
				}
				for (let i = 0; i < pages.length; i++) {
					if (i == target)
						pages[i].form._.style.display = "block";
				}
				if (recentPage != target) {
					if (typeof this.onPropertyPageSwitch === "function") {
						this.onPropertyPageSwitch(pages, recentPage);
					}
					recentPage = target;
				}
			});
			var dialog = <Dialog>create("dialog");
			dialog.set("content", container);
			dialog.open("ok#tui-primary");
			dialog.on("btnclick", () => {
				if (typeof this.onPropertyPageSwitch === "function") {
					this.onPropertyPageSwitch(pages, recentPage);
				}
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
				this.define.emphasize = (values.options.indexOf("emphasize") >= 0);
				this.setProperties(customValues);
				this.update();
				this.form.fire("itemvaluechanged", {control: this});
				dialog.close();

			});
		}

		update() {
			var d = this.define;
			if (!d.label && !d.description && !d.required) {
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
				if (d.emphasize) {
					browser.addClass(this.label,"tui-form-item-emphasize");
				} else
					browser.removeClass(this.label,"tui-form-item-emphasize");
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
				if (tui.ieVer < 9 && tui.ieVer > 0) {
					browser.removeNode(this.toolbar);
				} else {
					setTimeout(() => {
						if (!this.selected)
							browser.removeNode(this.toolbar);
					}, 500);
				}
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
			browser.removeClass(this.div, "tui-form-item-size-2 tui-form-item-size-3 tui-form-item-size-4 tui-form-item-size-5 tui-form-item-size-full tui-form-item-newline");
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
			if (this.define.required) {
				this._widget._set("clearable", false);
			} else
				this._widget._set("clearable", true);
		}

		isResizable(): boolean {
			return true;
		}

		getValue(cal: Calculator = null): any {
			return this._widget.get("value");
		}
		setValue(value: any): void {
			this._widget.set("value", value);
			this.define.value = value;
			this.form.fire("itemvaluechanged", {control: this});
		}
		render(designMode: boolean): void {
			if (designMode && typeof (<any>this._widget).reset === "function") {
				 (<any>this._widget).reset();
			}
			this._widget.render();
		}
	}





	// SECTION
	// ----------------------------------------------------------------------------------------------------------
	interface SectionFormItem extends FormItem {
		fontSize: number;
		align: string;
		display?: string;
		valueAsLabel?: boolean;
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
			if (!/^(visible|invisible|newline)$/.test(this.define.display))
				this.define.display = "visible";
			var l;
			if (d.value != "" && d.value != null && typeof d.value != UNDEFINED && d.valueAsLabel)
				l = d.value + "";
			else
				l = d.label;
			if (!l)
				this.label.innerHTML = "&nbsp;";
			else
				this.label.innerHTML = browser.toSafeText(l);
			if (l) {
				this._hr.className = "tui-form-line-label";
				if (typeof d.fontSize === "number" && d.fontSize >= 12 && d.fontSize <= 48) {
					this.label.style.fontSize = d.fontSize + "px";
					this.label.style.lineHeight = d.fontSize + 4 + "px";
				} else {
					this.label.style.fontSize = "";
					this.label.style.lineHeight = "";
				}
				if (/^(left|right|center)$/.test(d.align))
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
			var v = typeof this.define.value !== UNDEFINED ? this.define.value : null;
			return v;
		}
		setValue(value: any): void {
			if (typeof value !== UNDEFINED)
				this.define.value = value;
			this.form.fire("itemvaluechanged", {control: this});
		}

		render(designMode: boolean): void {
			if (designMode) {
				browser.removeClass(this.div, "tui-hidden");
				browser.removeClass(this._hr, "tui-hidden");
				browser.removeClass(this.div, "tui-form-section-newline");
				if (!this.define.label && !this.define.description) {
					browser.addClass(this.label, "tui-hidden");
				} else
					browser.removeClass(this.label, "tui-hidden");
			} else {
				if (this.define.display === "invisible") {
					browser.addClass(this.div, "tui-hidden");
				} else {
					browser.removeClass(this.div, "tui-hidden");
					if (this.define.display === "newline") {
						browser.addClass(this.div, "tui-form-section-newline");
					} else {
						browser.removeClass(this.div, "tui-form-section-newline");
					}
				}
			}
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.section"),
				properties: [
					{
						"type": "textbox",
						"key": "fontSize",
						"inputType": "number",
						"label": str("form.font.size"),
						"value": this.define.fontSize,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.format") },
							{ "format": "*min:12", "message": str("message.invalid.value") },
							{ "format": "*max:48", "message": str("message.invalid.value") }
						],
						"description": "12 ~ 48"
					}, {
						"type": "textbox",
						"key": "value",
						"label": str("form.value"),
						"value": this.define.value
					}, {
						"type": "options",
						"key": "valueAsLabel",
						"label": str("form.value.as.label"),
						"atMost": 1,
						"options": [{"data":[
							{value: "enable", text: str("form.enable")},
							{value: "disable", text: str("form.disable")}
						]}],
						"size": 6,
						"value": this.define.valueAsLabel ? "enable" : "disable"
					},{
						"type": "options",
						"key": "align",
						"label": str("form.text.align"),
						"atMost": 1,
						"options": [{"data":[
							{value: "left", text: str("form.align.left")},
							{value: "center", text: str("form.align.center")},
							{value: "right", text: str("form.align.right")}
						]}],
						"size": 6,
						"value": this.define.align || "left"
					}, {
						"type": "options",
						"key": "display",
						"label": str("form.display"),
						"atMost": 1,
						"options": [{"data":[
							{value: "visible", text: str("form.visible")},
							{value: "invisible", text: str("form.invisible")},
							{value: "newline", text: str("form.newline")}
						]}],
						"size": 6,
						"value": /^(visible|invisible|newline)$/.test(this.define.display) ? this.define.display : "visible"
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
			this.define.display = values.display;
			if (values.valueAsLabel == "enable") {
				this.define.valueAsLabel = true;
			} else {
				this.define.valueAsLabel = false;
			}
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
			this._widget.on("right-icon-mousedown", (e) => {
				if (!this.define.selection || !this.define.selection.length)
					return;
				return false;
			});
			this._widget.on("right-icon-mouseup", (e) => {
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
				e.data.preventDefault();
				menu.on("click", (e: any) => {
					this._widget.set("text", e.data.item.text);
					this.define.value = this.getValue();
					this._widget.reset();
					this._widget.focus();
					form.fire("itemvaluechanged", {control: this});
				});
				menu.open(this._widget._, "Rb");
				return false;
			});
		}

		update() {
			super.update();
			if (/^(text|password|email|url|number)$/.test(this.define.inputType)) {
				this._widget._set("type", this.define.inputType);
			} else {
				this._widget._set("type", "text");
			}
			if (this.define.selection instanceof Array && this.define.selection.length > 0) {
				this._widget._set("iconRight", "fa-caret-down");
			} else {
				this._widget._set("iconRight", null);
			}
			this._widget._set("clearable", true);
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.textbox"),
				properties: [
					{
						"type": "options",
						"key": "inputType",
						"label": str("form.input.type"),
						"options": [{"data":[
							{"value": "text", "text": str("form.text") },
							{"value": "password", "text": str("form.password") },
							{"value": "email", "text": str("form.email") },
							{"value": "url", "text": str("form.url") },
							{"value": "number", "text": str("form.number") }
						]}],
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
						"height": 120,
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
						"value": tui.clone(this.define.validation)
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
		onPropertyPageSwitch(pages: PropertyPage[], recentPage: number) {
			FormControl.detectRequiredByValidation(pages, recentPage);
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
						"inputType": "number",
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
						"value": tui.clone(this.define.validation)
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
		onPropertyPageSwitch(pages: PropertyPage[], recentPage: number) {
			FormControl.detectRequiredByValidation(pages, recentPage);
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("textarea", FormTextarea);




	// OPTIONS
	// ----------------------------------------------------------------------------------------------------------
	interface OptionsFormItem extends FormItem {
		options: OptionGroup[];
		atLeast?: number;
		atMost?: number;
		align?: string;
	}
	class FormOptions extends FormControl<OptionsFormItem> {
		static icon = "fa-check-square-o";
		static desc = "form.option.group";
		static order = 3;
		static init = {
			"options": [{
				"data": [
					{"value": "A"},
					{"value": "B"},
					{"value": "C"},
					{"value": "D"}
				]
			}
		]};
		static translator = function (value: any, item: any, index: number): Node {
			if (value instanceof Array) {
				return document.createTextNode(value.join(", "));
			} else if (value != null)
				return document.createTextNode(value + "");
			else
				return null;
		};

		private _group: Group;
		private _notifyBar: HTMLElement;

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
			this._notifyBar.className = "tui-form-notify-bar";
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
			this._notifyBar.innerHTML = "";
			this.renderDesign();
		}

		getValue(cal: Calculator = null): any {
			if (!cal)
				return this._group.get("value");

			var define = this.define;
			var optionType = define.atMost == 1 ? "radio" : "check";
			this._group._set("type", optionType);
			this._group._.innerHTML = "";

			var key = define.key;
			var data: Option[] = [];
			if (define.options && define.options.length > 0) {
				if (cal.path.indexOf(key) >= 0)
					throw new Error("Invalid expression of select control: Cycle reference detected on \"" + key + "\"");
				cal.path.push(key);
				for (let d of this.define.options) {
					if (d.condition) {
						if (text.exp.evaluate(d.condition, function (k: string) {
							if (cal.cache.hasOwnProperty(k))
								return cal.cache[k];
							else {
								cal.calc(k, cal.path);
								return cal.cache[k];
							}
						})) {
							if (d.data && d.data.length > 0)
								data.splice(data.length, 0, ...d.data);
						}
					} else {
						if (d.data && d.data.length > 0)
							data.splice(data.length, 0, ...d.data);
					}
				}
			}
			if (data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					let option = data[i];
					let o = create(optionType);
					o._set("value", option.value);
					o._set("text", "<span>" + browser.toSafeText(option.text) + "</span>");
					this._group._.appendChild(o._);
				}
			} else {
				var padding = elem("div");
				padding.style.padding = "10px";
				padding.innerHTML = str("message.not.available");
				this._group._.appendChild(padding);
			}
			this._group._set("value", define.value);
			define.value = this._group.get("value");
			return this._group.get("value");
		}
		setValue(value: any): void {
			this._group.set("value", value);
			this.define.value = value;
			this.form.fire("itemvaluechanged", {control: this});
		}
		renderDesign() {
			var define = this.define;
			var data: Option[] = [];
			if (define.options && define.options.length > 0) {
				for (let d of this.define.options) {
					if (d.data && d.data.length > 0) {
						for (let i = 0; i < d.data.length; i++) {
							let o = d.data[i];
							if (o.value === null || typeof o.value === UNDEFINED)
								o.value = o.text;
							if (o.text === null || typeof o.text === UNDEFINED)
								o.text = o.value;
							if (o.value === null || typeof o.value === UNDEFINED) {
								d.data.splice(i--, 1);
							}
						}
						data.splice(data.length, 0, ...d.data);
					}
				}
			}
			var optionType = define.atMost == 1 ? "radio" : "check";
			this._group._set("type", optionType);
			this._group._.innerHTML = "";
			if (data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					let option = data[i];
					let o = create(optionType);
					o._set("value", option.value);
					o._set("text", "<span>" + browser.toSafeText(option.text) + "</span>");
					this._group._.appendChild(o._);
				}
			} else {
				var padding = elem("div");
				padding.style.padding = "10px";
				padding.innerHTML = str("message.not.available");
				this._group._.appendChild(padding);
			}
			this._group._set("value", define.value);
		}
		render(designMode: boolean): void {
			if (designMode)
				this.renderDesign();
			var g = this._group;
			g.render();
			for (let i = 0; i < g._.children.length; i++) {
				let btn = g._.children[i];
				if (btn.children.length > 0 && btn.clientWidth - 30 >= 0) {
					(<HTMLElement>btn.children[0]).style.width = btn.clientWidth - 30 + "px";
				}
			}
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
						"type": "textarea",
						"maxHeight": 300,
						"key": "options",
						"label": str("form.options"),
						"description": str("form.option.group.desc"),
						"value": optionsToText(this.define.options),
						"validation": [
							{ "format": "*any", "message": str("message.cannot.be.empty") }
						],
						"size": 6
					}, {
						"type": "options",
						"key": "align",
						"label": str("form.align"),
						"value": this.define.align === "vertical" ? "vertical" : "normal",
						"options": [{"data":[
							{ "value": "normal", "text": str("normal") },
							{ "value": "vertical", "text": str("vertical") }
						]}],
						"atMost": 1,
						"size": 2,
						"newline": true
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "atLeast",
						"label": str("form.at.least"),
						"value": /^\d+$/.test(this.define.atLeast + "") ? this.define.atLeast: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "atMost",
						"label": str("form.at.most"),
						"value": /^\d+$/.test(this.define.atMost + "") ? this.define.atMost: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.align = values.align;
			this.define.atLeast = values.atLeast ? parseInt(values.atLeast) : null;
			this.define.atMost = values.atMost ? parseInt(values.atMost) : null;
			this.define.options = textToOptions(values.options);
		}
		onPropertyPageSwitch(pages: PropertyPage[], recentPage: number) {
			FormControl.detectRequired(pages, recentPage);
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

	interface SelectFormItem extends FormItem {
		validation?: {format: string, message: string}[];
		selection?: OptionGroup[];
		canSearch?: boolean;
		atLeast?: number;
		atMost?: number;
	}
	class FormSelect extends BasicFormControl<Select, SelectFormItem> {
		static icon = "fa-toggle-down";
		static desc = "form.selection";
		static order = 4;
		static init = {
			"atMost": 1,
			"selection": [{
				"condition":<string>null,
				"data": [
					{"value":"A", "check": false},
					{"value":"B", "check": false},
					{"value":"C", "check": false}
				]
			}]
		};
		static translator = function (value: any, item: any, index: number): Node {
			if (value instanceof Array) {
				return document.createTextNode(value.join(", "));
			} else if (value != null)
				return document.createTextNode(value + "");
			else
				return null;
		};



		private _notifyBar: HTMLElement;

		constructor(form: Form, define: SelectFormItem) {
			super(form, define, "select");
			this._widget._set("nameKey", "text");
			this._widget.on("change", (e) => {
				this._notifyBar.innerHTML = "";
				form.fire("itemvaluechanged", {control: this});
			});
			this._notifyBar = elem("div");
			this._notifyBar.className = "tui-form-notify-bar";
			this.div.appendChild(this._notifyBar);
		}
		update() {
			super.update();
			this._widget._set("multiSelect", this.define.atMost != 1);
			this._widget._set("clearable", !this.define.atLeast || parseInt(this.define.atLeast + "") <= 0);
			this._widget._set("canSearch", !!this.define.canSearch);
			this._notifyBar.innerHTML = "";
			if (this.define.selection && this.define.selection.length > 0) {
				for (let d of this.define.selection) {
					if (d.data && d.data.length > 0) {
						for (let i = 0; i < d.data.length; i++) {
							let o = d.data[i];
							if (o.value === null || typeof o.value === UNDEFINED)
								o.value = o.text;
							if (o.text === null || typeof o.text === UNDEFINED)
								o.text = o.value;
							if (o.value === null || typeof o.value === UNDEFINED) {
								d.data.splice(i--, 1);
							}
						}
					}
				}
			}
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.selection"),
				properties: [
					{
						"type": "textarea",
						"key": "selection",
						"maxHeight": 400,
						"label": str("form.options"),
						"description": str("form.selection.desc"),
						"value": optionsToText(this.define.selection),
						"validation": [
							{ "format": "*any", "message": str("message.cannot.be.empty") }
						],
						"size": 6
					}, {
						"type": "options",
						"key": "canSearch",
						"label": str("form.use.search"),
						"value": this.define.canSearch ? "true" : "false",
						"options": [{"data":[
							{ "value": "true", "text": str("form.enable") },
							{ "value": "false", "text": str("form.disable") }
						]}],
						"size": 2,
						"atMost": 1,
						"newline": true
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "atLeast",
						"label": str("form.at.least"),
						"value": /^\d+$/.test(this.define.atLeast + "") ? this.define.atLeast: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "atMost",
						"label": str("form.at.most"),
						"value": /^\d+$/.test(this.define.atMost + "") ? this.define.atMost: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.atLeast = values.atLeast  > 0 ? parseInt(values.atLeast) : null;
			this.define.atMost = values.atMost > 0 ? parseInt(values.atMost) : null;
			this.define.selection = textToOptions(values.selection);
			this.define.canSearch = text.parseBoolean(values.canSearch);
		}
		onPropertyPageSwitch(pages: PropertyPage[], recentPage: number) {
			FormControl.detectRequired(pages, recentPage);
		}
		getValue(cal: Calculator = null): any {
			if (!cal)
				return this._widget.get("value");

			var key = this.define.key;
			var data: Option[] = [];
			if (this.define.selection && this.define.selection.length > 0) {
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
							if (d.data && d.data.length > 0)
								data.splice(data.length, 0, ...d.data);
						}
					} else {
						if (d.data && d.data.length > 0)
							data.splice(data.length, 0, ...d.data);
					}
				}
			}
			this._widget._set("tree", data);
			this.define.value = this._widget.get("value");
			return this.define.value;
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
	Form.register("select", FormSelect);



	// DATE PICKER
	// ----------------------------------------------------------------------------------------------------------
	interface DatePickerFormItem extends FormItem {
		mode: string;
		format: string;
		timezone: string;
		autoInit: boolean;
	}
	class FormDatePicker extends BasicFormControl<DatePicker, DatePickerFormItem> {
		static icon = "fa-calendar-o";
		static desc = "form.datepicker";
		static order = 5;

		constructor(form: Form, define: DatePickerFormItem) {
			super(form, define, "date-picker");
			this._widget.on("change", (e) => {
				this.define.value = this.getValue();
				form.fire("itemvaluechanged", {control: this});
			});
		}
		update() {
			super.update();
			this._widget._set("format", this.define.format || null);
			this._widget._set("mode", /^(date|date-time|time|month)$/.test(this.define.mode) ? this.define.mode : null);
			if (!/^(utc|locale|none)$/.test(this.define.timezone))
				this.define.timezone = "none";
			this._widget._set("timezone", this.define.timezone);
			if (this.form.get("mode") === "input" && this.define.autoInit && this._widget.get("value") == null && this.define.value == null) {
				this._widget._set("value", time.now());
				this.define.value = this._widget.get("value");
			}
		}
		getProperties(): PropertyPage[] {
			return [{
				name: str("form.datepicker"),
				properties: [
					{
						"type": "options",
						"key": "mode",
						"label": str("form.format"),
						"options": [{"data":[
							{"value": "date", "text": str("form.date") },
							{"value": "time", "text": str("form.time") },
							{"value": "date-time", "text": str("form.date.time") },
							{"value": "month", "text": str("form.month") }
						]}],
						"atMost": 1,
						"value": /^(date|date-time|time|month)$/.test(this.define.mode) ? this.define.mode : "date",
						"size": 2,
						"newline": true
					}, {
						"type": "options",
						"key": "timezone",
						"label": str("form.timezone"),
						"options": [{"data":[
							{"value": "utc", "text": str("form.tz.utc") },
							{"value": "locale", "text": str("form.tz.locale") },
							{"value": "none", "text": str("form.tz.none") }
						]}],
						"atMost": 1,
						"value": /^(utc|locale|none)$/.test(this.define.timezone) ? this.define.timezone : "utc",
						"size": 2,
						"newline": true
					}, {
						"type": "options",
						"key": "autoInit",
						"label": str("form.init.by.current.time"),
						"options": [{"data":[
							{"value": true, "text": str("yes") },
							{"value": false, "text": str("no") }
						]}],
						"atMost": 1,
						"value": !!this.define.autoInit,
						"size": 2,
						"newline": true
					}, {
						"type": "textbox",
						"key": "format",
						"label": str("form.custom.format"),
						"description": str("form.date.desc"),
						"value": this.define.format ? this.define.format : null,
						"size": 2
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.format = values.format ? values.format : null;
			this.define.mode = values.mode;
			if (this.define.required) {
				this.define.validation = [{ "format": "*any", "message": str("message.cannot.be.empty")}];
			} else
				this.define.validation = null;
			this.define.timezone = values.timezone;
			this.define.autoInit = !!values.autoInit;
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("datepicker", FormDatePicker);




	// PICTURE
	// ----------------------------------------------------------------------------------------------------------
	interface PictureFormItem extends FormItem {
		action: string;
		accept: string;
	}
	class FormPicture extends BasicFormControl<Picture, PictureFormItem> {
		static icon = "fa-file-image-o";
		static desc = "form.picture";
		static order = 6;
		static translator = function (value: any, item: any, index: number): Node {
			if (value != null) {
				if (value.fileName)
					return document.createTextNode(value.fileName);
				else
					return document.createTextNode("[ " + str("form.picture") + " ]");
			} else
				return null;
		};

		static MIME = "^image/(png|jpeg|gif)(\\s*,\\s*image/(png|jpeg|gif))*$";
		private _notifyBar: HTMLElement;

		constructor(form: Form, define: PictureFormItem) {
			super(form, define, "picture");
			this._widget.on("success", (e) => {
				this._notifyBar.innerHTML = "";
				this.define.value = this._widget.get("value");
				form.fire("itemvaluechanged", {control: this});
			});
			this._notifyBar = elem("div");
			this._notifyBar.className = "tui-form-notify-bar";
			this.div.appendChild(this._notifyBar);
		}
		update() {
			super.update();
			this._notifyBar.innerHTML = "";
			var rx = new RegExp(FormPicture.MIME);
			if (rx.test(this.define.accept)) {
				this._widget._set("accept", this.define.accept);
			} else {
				this.define.accept = this._widget.get("accept");
			}
			if (this.define.action) {
				this._widget._set("action", this.define.action);
			} else {
				this.define.action = this._widget.get("action");
			}
		}
		getProperties(): PropertyPage[] {
			return [{
				name: str("form.picture"),
				properties: [
					{
						"type": "textbox",
						"key": "action",
						"label": str("form.upload.url"),
						"value": this.define.action,
						"validation": [{ "format": "*any", "message": str("message.cannot.be.empty")}],
						"size": 2,
						"newline": true
					}, {
						"type": "textbox",
						"key": "accept",
						"label": str("form.file.type"),
						"value": this.define.accept,
						"validation": [{ "format": FormPicture.MIME, "message": str("message.must.be.image")}],
						"size": 2,
						"newline": true
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.accept = values.accept;
			this.define.action = values.action;
		}
		validate(): boolean {
			if (this.define.required && this.getValue() === null) {
				this._notifyBar.innerHTML = browser.toSafeText(str("message.cannot.be.empty"));
				return false;
			} else {
				this._notifyBar.innerHTML = "";
				return true;
			}
		}
	}
	Form.register("picture", FormPicture);



	// FILE
	// ----------------------------------------------------------------------------------------------------------
	interface FileFormItem extends FormItem {
		action: string;
		accept: string;
	}
	class FormFile extends BasicFormControl<File, FileFormItem> {
		static icon = "fa-file-text-o";
		static desc = "form.file";
		static order = 7;
		static translator = function (value: any, item: any, index: number): Node {
			if (value != null) {
				if (value.fileName)
					return document.createTextNode(value.fileName);
				else
					return document.createTextNode("[ " + str("form.file") + " ]");
			} else
				return null;
		};

		constructor(form: Form, define: FileFormItem) {
			super(form, define, "file");
			this._widget.on("success", (e) => {
				this.define.value = this._widget.get("value");
				form.fire("itemvaluechanged", {control: this});
			});
		}

		update() {
			super.update();
			this._widget._set("accept", this.define.accept);
			if (this.define.action) {
				this._widget._set("action", this.define.action);
			} else {
				this.define.action = this._widget.get("action");
			}
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.file"),
				properties: [
					{
						"type": "textbox",
						"key": "action",
						"label": str("form.upload.url"),
						"value": this.define.action,
						"validation": [{ "format": "*any", "message": str("message.cannot.be.empty")}],
						"size": 2,
						"newline": true
					}, {
						"type": "textbox",
						"key": "accept",
						"label": str("form.file.type"),
						"value": this.define.accept,
						"size": 2,
						"newline": true
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.accept = values.accept;
			this.define.action = values.action;
			if (this.define.required) {
				this.define.validation = [{ "format": "*any", "message": str("message.cannot.be.empty")}];
			} else
				this.define.validation = null;
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("file", FormFile);




	// MULTIPLE FILES
	// ----------------------------------------------------------------------------------------------------------
	interface FilesFormItem extends FormItem {
		action: string;
		accept: string;
		atLeast?: number;
		atMost?: number;
	}
	class FormFiles extends BasicFormControl<Files, FilesFormItem> {
		static icon = "fa-copy";
		static desc = "form.files";
		static order = 8;
		static translator = function (value: any, item: any, index: number): Node {
			if (value instanceof Array) {
				return document.createTextNode("[ " + strp("file.count.p", value.length) + " ]");
			} else
				return null;
		};

		private _notifyBar: HTMLElement;

		constructor(form: Form, define: FilesFormItem) {
			super(form, define, "files", );
			this._widget.on("success delete", (e) => {
				this._notifyBar.innerHTML = "";
				this.define.value = this._widget.get("value");
				form.fire("itemvaluechanged", {control: this});
			});
			this._notifyBar = elem("div");
			this._notifyBar.className = "tui-form-notify-bar";
			this.div.appendChild(this._notifyBar);
		}

		update() {
			super.update();
			this._notifyBar.innerHTML = "";
			this._widget._set("accept", this.define.accept);
			if (this.define.action) {
				this._widget._set("action", this.define.action);
			} else {
				this.define.action = this._widget.get("action");
			}
			if (typeof this.define.atMost === "number" && this.define.atMost > 0) {
				this._widget._set("max", this.define.atMost);
			} else
				this._widget._set("max", null);
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.files"),
				properties: [
					{
						"type": "textbox",
						"key": "action",
						"label": str("form.upload.url"),
						"value": this.define.action,
						"validation": [{ "format": "*any", "message": str("message.cannot.be.empty")}],
						"size": 2,
						"newline": true
					}, {
						"type": "textbox",
						"key": "accept",
						"label": str("form.file.type"),
						"value": this.define.accept,
						"size": 2,
						"newline": true
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "atLeast",
						"label": str("form.at.least"),
						"value": /^\d+$/.test(this.define.atLeast + "") ? this.define.atLeast: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "atMost",
						"label": str("form.at.most"),
						"value": /^\d+$/.test(this.define.atMost + "") ? this.define.atMost: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.accept = values.accept;
			this.define.action = values.action;
			this.define.atLeast = values.atLeast ? parseInt(values.atLeast) : null;
			this.define.atMost = values.atMost ? parseInt(values.atMost) : null;
		}
		onPropertyPageSwitch(pages: PropertyPage[], recentPage: number) {
			FormControl.detectRequired(pages, recentPage);
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
	Form.register("files", FormFiles);




	// GRID
	// ----------------------------------------------------------------------------------------------------------
	interface GridFormItem extends FormItem {
		definitions: FormItem[];
		items: any[];
		features: string[];
		atLeast?: number;
		atMost?: number;
		height?: number;
	}
	class FormGrid extends BasicFormControl<Grid, GridFormItem> {
		static icon = "fa-table";
		static desc = "form.grid";
		static order = 9;
		static init = {
			features: ['append', 'delete', 'edit']
		};
		static translator = function (value: any, item: any, index: number): Node {
			if (value instanceof Array) {
				return document.createTextNode("[ " + strp("item.count.p", value.length) + " ]");
			} else
				return null;
		};

		private _values: any[];
		private _buttonBar: HTMLElement;
		private _btnAdd: Button;
		private _btnEdit: Button;
		private _btnDelete: Button;
		private _notifyBar: HTMLElement;

		constructor(form: Form, define: GridFormItem) {
			super(form, define, "grid");
			this._widget._.style.margin = "2px";
			this._buttonBar = elem("div");
			this.div.appendChild(this._buttonBar);
			//var gp = <ButtonGroup>create("button-group");
			this._btnAdd = <Button>create("button", {text: "<i class='fa fa-plus'></i>"});
			this._btnAdd.appendTo(this._buttonBar);
			this._btnAdd.on("click", () => {
				var dialog = <Dialog>create("dialog");
				var fm = <Form>create("form");
				fm.set("definition", tui.clone(this.define.definitions));
				dialog.set("content", fm._);
				dialog.open("ok#tui-primary");
				dialog.on("btnclick", () => {
					if (!fm.validate())
						return;
					try {
						var v = fm.get("value");
						this._values.push(v);
						dialog.close();
						this._notifyBar.innerHTML = "";
						form.fire("itemvaluechanged", {control: this});
					} catch (e) {}
				});
			});

			this._btnEdit = <Button>create("button", {text: "<i class='fa fa-pencil'></i>"});
			this._btnEdit.appendTo(this._buttonBar);
			this._btnEdit.on("click", () => {
				this.editRow();
			});
			this._widget.on("rowdblclick", () => {
				if (exist(this.define.features, "edit"))
					this.editRow();
			});

			//gp.appendTo(this._buttonBar);

			this._btnDelete = <Button>create("button", {text: "<i class='fa fa-trash'></i>"});
			this._btnDelete.appendTo(this._buttonBar);
			this._btnDelete.on("click", () => {
				var i = this._widget.get("activeRow");
				if (i === null)
					return;
				this._values.splice(i, 1);
				this._notifyBar.innerHTML = "";
				form.fire("itemvaluechanged", {control: this});
			});

			this._notifyBar = elem("div");
			this._notifyBar.className = "tui-form-notify-bar";
			this.div.appendChild(this._notifyBar);
		}

		editRow() {
			var i = this._widget.get("activeRow");
			if (i === null)
				return;
			var dialog = <Dialog>create("dialog");
			var fm = <Form>create("form");
			fm.set("definition", tui.clone(this.define.definitions));
			dialog.set("content", fm._);
			dialog.open("ok#tui-primary");
			fm.set("value", this._values[i]);
			dialog.on("btnclick", () => {
				if (!fm.validate())
					return;
				var v = fm.get("value");
				this._values.splice(i, 1, v);
				dialog.close();
				this._notifyBar.innerHTML = "";
				this.form.fire("itemvaluechanged", {control: this});
			});
		}

		update() {
			super.update();
			this._notifyBar.innerHTML = "";
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
					let type = Form.getType( subDef.type);
					if (!type || type == FormSection)
						continue;
					let col = { name: subDef.label, key: subDef.key, translator: type.translator };
					columns.push(col);
				}
				this._widget._set("columns", columns);
			} else {
				this._widget._set("columns", []);
			}

			if (this.define.disable) {
				this._btnAdd.set("disable", true);
				this._btnEdit.set("disable", true);
				this._btnDelete.set("disable", true);
				this._widget.set("disable", true);
			} else {
				this._btnAdd.set("disable", false);
				this._btnEdit.set("disable", false);
				this._btnDelete.set("disable", false);
				this._widget.set("disable", false);
			}

			this._btnAdd._.style.display = exist(this.define.features, "append") ? "inline-block" : "none";
			this._btnEdit._.style.display = exist(this.define.features, "edit") ? "inline-block" : "none";
			this._btnDelete._.style.display = exist(this.define.features, "delete") ? "inline-block" : "none";
			if (exist(this.define.features, "autoHeight")) {
				this._widget._.style.height = "";
				this._widget.set("autoHeight", true);
			} else {
				this._widget.set("autoHeight", false);
				if (typeof d.height === "number" && !isNaN(d.height) ||
					typeof d.height === "string" && /^\d+$/.test(d.height)) {
					this._widget._.style.height = d.height + "px";
				} else {
					this._widget._.style.height = "";
					d.height = null;
				}
			}
			this._widget.set("autoWidth", exist(this.define.features, "autoColumnWidth"));
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.grid"),
				properties: [
					{
						"type": "options",
						"key": "features",
						"label": str("form.grid.features"),
						"value": this.define.features,
						"options": [{"data":[
							{ "value": "append", "text": str("allow.append") },
							{ "value": "delete", "text": str("allow.delete") },
							{ "value": "edit", "text": str("allow.edit") },
							{ "value": "autoHeight", "text": str("auto.height") },
							{ "value": "autoColumnWidth", "text": str("auto.column.width") }
						]}],
						"size": 6,
						"newline": true
					},{
						"type": "textbox",
						"inputType": "number",
						"key": "height",
						"label": str("form.height"),
						"value": /^\d+$/.test(this.define.height + "")? this.define.height : null,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						],
						"condition": "features !~ 'autoHeight'"
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "atLeast",
						"label": str("form.at.least"),
						"value": /^\d+$/.test(this.define.atLeast + "") ? this.define.atLeast: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "atMost",
						"label": str("form.at.most"),
						"value": /^\d+$/.test(this.define.atMost + "") ? this.define.atMost: "",
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}
				]
			}, {
				name: str("form.design"),
				designMode: true,
				properties: this.define.definitions
			}];
		}

		onPropertyPageSwitch(pages: PropertyPage[], recentPage: number) {
			FormControl.detectRequired(pages, recentPage);
		}

		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.height = /^\d+$/.test(values.height) ? values.height: null;
			this.define.atLeast = values.atLeast ? parseInt(values.atLeast) : null;
			this.define.atMost = values.atMost ? parseInt(values.atMost) : null;
			this.define.definitions = properties[2];
			this.define.features = values.features;
		}
		getValue(): any {
			return this._values;
		}
		setValue(value: any): void {
			if (value !== this._values) {
				if (value instanceof Array) {
					this._values.length = 0;
					this._values = this._values.concat(value);
				}
			}
			this._widget.render();
			this.form.fire("itemvaluechanged", {control: this});
		}
		validate(): boolean {
			var d = this.define;
			var data = this._widget.get("data");
			if (d.atLeast && data.length() < d.atLeast) {
				this._notifyBar.innerHTML = browser.toSafeText(strp("form.at.least.p", d.atLeast));
				return false;
			} else if (d.atMost && data.length() > d.atMost) {
				this._notifyBar.innerHTML = browser.toSafeText(strp("form.at.most.p", d.atMost));
				return false;
			} else
				return true;
		}
	}
	Form.register("grid", FormGrid);
}
