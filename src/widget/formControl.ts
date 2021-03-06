/// <reference path="form.ts" />

module tui.widget {
	"use strict";

	const MAX = 6;

	function itemFunc(id: exp.Identifier, cal: Calculator) {
		if (id.args.length != 1) {
			throw new Error("Invalid parameter for function 'item()'");
		}
		let key = id.args[0];
		if (typeof key != 'string') {
			throw new Error("Invalid parameter for function 'item()'");
		}
		if (cal.cache.hasOwnProperty(key))
			return cal.cache[key];
		else {
			cal.calc(key, cal.path);
			return cal.cache[key];
		}
	}

	function itemValueFunc(id: exp.Identifier, values: {[index: string]: any}) {
		if (id.args.length != 1) {
			throw new Error("Invalid parameter for function 'item()'");
		}
		let key = id.args[0];
		if (typeof key != 'string') {
			throw new Error("Invalid parameter for function 'item()'");
		}
		return values[key];
	}

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

	function optionsToText(options: OptionGroup[], multiOption: boolean): string {
		var result = "";
		if (!options)
			return result;
		function addNodes(nodes: Option[], level: string = "") {
			if (nodes) {
				var padding = (level ? level + " " : "");
				for (let item of nodes) {
					var flag = multiOption ? (typeof item.check !== 'boolean' ? '#' :'') : '';
					if (/^#/.test(item.value)) {
						flag += '!';
					}
					if (item.value == item.text) {
						result += padding + flag + item.value + "\n";
					} else {
						result += padding + flag + item.value + ": " + item.text + "\n";
					}
					addNodes(item.children, level + "~");
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

	function textToOptions(text: string, multiOption: boolean): OptionGroup[] {
		var result: OptionGroup[] = [];
		if (!text)
			return result;
		function getLeve(s: string): number {
			var count = 0;
			if (!s)
				return 0;
			for (let c of s) {
				if (c == '~')
					count++;
			}
			return count;
		}
		function getNode(s: string): Option {
			s = s.trim();
			var canCheck = false;
			if (/^!.+/.test(s)) {
				s = s.substring(1);
			} else if (/^#.+/.test(s)) {
				s = s.substring(1);
				canCheck = undefined;
			}
			var pos = s.indexOf(":");
			if (pos < 0) {
				return { value: s, text: s, check: (multiOption ? canCheck : undefined)};
			} else {
				var value = s.substring(0, pos).trim();
				var text = s.substring(pos + 1).trim();
				return { value: value, text: text, check: (multiOption ? canCheck : undefined)};
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
		var condition: string = undefined;
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
		btnSize: Button;
		btnPosition: Button;
		available: boolean;

		private _sizeSplitter: HTMLElement;
		private _posSplitter: HTMLElement;

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
			this.mask.appendChild(elem("span"));

			this.toolbar = elem("div");
			this.toolbar.className = "tui-form-item-toolbar";

			this.btnAdd = <Button>create("button", {text: "<i class='fa fa-plus'></i>"});
			this.btnAdd.appendTo(this.toolbar);
			this.btnEdit = <Button>create("button", {text: "<i class='fa fa-pencil'></i>"});
			this.btnEdit.appendTo(this.toolbar);
			this.toolbar.appendChild(elem("span"))
			this.btnSize = <Button>create("button", {text: "1x"});
			this.btnPosition = <Button>create("button", {text: "N"});
			this._sizeSplitter = elem("span");
			this._posSplitter = elem("span");
			this.btnSize.appendTo(this.toolbar);
			this.toolbar.appendChild(this._sizeSplitter)
			this.btnPosition.appendTo(this.toolbar);
			this.toolbar.appendChild(this._posSplitter)
			this.btnDelete = <Button>create("button", {text: "<i class='fa fa-trash'></i>"});
			this.btnDelete.appendTo(this.toolbar);

			this.div.appendChild(this.mask);
			this.div.className = "tui-form-item-container";

			this.applySize();

			this.label = elem("div");
			this.label.className = "tui-form-item-label";
			this.div.appendChild(this.label);

			$(this.mask).mousedown((e: JQueryEventObject) => {
				e.stopPropagation();
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
			var menuSize = <Popup>create("menu");
			this.btnSize.on("click", () => {
				menuSize._set("items", [
					{type: "radio", text: "1x", group: "size", value: 1, checked: (this.define.size === 1 || !this.define.size)},
					{type: "radio", text: "2x", group: "size", value: 2, checked: this.define.size === 2},
					{type: "radio", text: "3x", group: "size", value: 3, checked: this.define.size === 3},
					{type: "radio", text: "4x", group: "size", value: 4, checked: this.define.size === 4},
					{type: "radio", text: "5x", group: "size", value: 5, checked: this.define.size === 5},
					{type: "radio", text: "MAX", group: "size", value: MAX, checked: this.define.size === MAX}
				]);
				menuSize.open(this.btnSize._);
			});
			menuSize.on("click", (e) => {
				var v = e.data.item.value;
				if (v >= 1 && v <= MAX)
					this.define.size = v;
				this.applySize();
				this.form.fire("itemresize", {e: e, control: this});
			});

			var menuPos = <Popup>create("menu");
			this.btnPosition.on("click", () => {
				menuPos._set("items", [
					{type: "radio", text: "Normal", group: "pos", value: "normal", checked: (!/^(left|right|newline)$/.test(this.define.position))},
					{type: "radio", text: "Left", group: "pos", value: "left", checked: this.define.position === "left"},
					{type: "radio", text: "Right", group: "pos", value: "right", checked: this.define.position === "right"},
					{type: "radio", text: "Newline", group: "pos", value: "newline", checked: this.define.position === "newline"}
				]);
				menuPos.open(this.btnPosition._);
			});
			menuPos.on("click", (e) => {
				var v = e.data.item.value;
				this.define.position = v;
				this.applySize();
				this.form.fire("itemresize", {e: e, control: this});
			});

			this.btnEdit.on("click", () => {
				this.showProperties();
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
					"position": "newline",
					"value": [this.define.required ? "required" : null, this.define.disable ? "disable" : null, this.define.emphasize ? "emphasize" : null]
				}, {
					"type": "textarea",
					"maxHeight": 200,
					"label": str("form.description"),
					"key": "description",
					"value": this.define.description,
					"size": MAX
				}, {
					"type": "textarea",
					"maxHeight": 200,
					"label": str("form.precondition"),
					"key": "condition",
					"value": this.define.condition,
					"size": MAX
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
			dialog.set("mobileModel", true);
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
				this.define.label = values.label ? values.label : undefined;
				this.define.key = values.key ? values.key : undefined;
				this.define.condition = values.condition ? values.condition : undefined;
				this.define.description = values.description ? values.description : undefined;
				this.define.disable = (values.options.indexOf("disable") >= 0 ? true : undefined);
				this.define.required = (values.options.indexOf("required") >= 0 ? true : undefined);
				this.define.emphasize = (values.options.indexOf("emphasize") >= 0 ? true : undefined);
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

		updateIndex(index: number) {
			((<HTMLElement>this.mask.childNodes[0]).innerHTML = index + "");
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

		applySize() {
			var define = this.define;
			browser.removeClass(this.div, "tui-form-item-size-2 tui-form-item-size-3 tui-form-item-size-4 tui-form-item-size-5 tui-form-item-size-full tui-form-item-newline tui-form-item-pull-left tui-form-item-pull-right");
			if (define.size > 1 && define.size < MAX) {
				define.size = Math.floor(define.size);
				browser.addClass(this.div, " tui-form-item-size-" + define.size);
			} else if (define.size >= MAX) {
				browser.addClass(this.div, "tui-form-item-size-full");
				define.size = MAX;
			} else
				delete define.size;
			if (define.position === "newline") {
				browser.addClass(this.div, "tui-form-item-newline");
			} else if (define.position === "left") {
				browser.addClass(this.div, "tui-form-item-pull-left");
			} else if (define.position === "right") {
				browser.addClass(this.div, "tui-form-item-pull-right");
			} else {
				delete define.position;
			}
			if (this.define.position == "left") {
				this.btnPosition.set("text", "L")
			} else if (this.define.position == "right") {
				this.btnPosition.set("text", "R")
			} else if (this.define.position == "newline") {
				this.btnPosition.set("text", "NL")
			} else {
				this.btnPosition.set("text", "N")
			}
			if (typeof this.define.size != "number" || isNaN(this.define.size) || this.define.size < 1 && this.define.size > MAX ) {
				this.btnSize.set("text", "1x");
			} else if (this.define.size == MAX) {
				this.btnSize.set("text", "MAX");
			} else {
				this.btnSize.set("text", this.define.size + "x");
			}
			if (!this.isResizable()) {
				this.btnSize.addClass("tui-hidden");
				this.btnPosition.addClass("tui-hidden");
				browser.addClass(this._sizeSplitter, "tui-hidden");
				browser.addClass(this._posSplitter, "tui-hidden");
			} else {
				this.btnSize.removeClass("tui-hidden");
				this.btnPosition.removeClass("tui-hidden");
				browser.removeClass(this._sizeSplitter, "tui-hidden");
				browser.removeClass(this._posSplitter, "tui-hidden");
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
			let oldValue = this.define.value;
			this.define.value = value;
			if (oldValue != value) {
				this.form.fire("itemvaluechanged", {control: this});
			}
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
		folded?: boolean;
	}
	class FormSection extends FormControl<SectionFormItem> {
		static icon = "fa-header";
		static desc = "form.section";
		static order = 0;

		private _hr: HTMLElement;
		constructor(form: Form, define: SectionFormItem) {
			super(form, define);
			this._hr = elem("hr")
			this.label.className = "tui-form-item-label tui-form-section-label";
			this._hr.className = "tui-form-line-label";
			this.div.appendChild(this._hr);
			this.div.style.display = "block";
			this.div.style.clear = "both";
			this.div.style.width = "auto";
			this.label.onmousedown = () => {
				if (this.define.display != "folder") {
					return;
				}
				this.define.folded = !this.define.folded;
				this.form.render();
			}

			this.label.onclick = () => {
				if (this.define.display != "link" || this.define.disable) {
					return;
				}
				if (form.fire("link", {control: this, name: this.define.label, url: this.getValue()}) != false) {
					window.open(this.getValue(), this.define.label);
				}
			}
		}

		update() {
			super.update();
			if (!/^(visible|folder|invisible|newline|link)$/.test(this.define.display))
				this.define.display = "visible";


			this.applySize();
		}

		isResizable(): boolean {
			return false;
		}

		getValue(): any {
			var v = typeof this.define.value !== UNDEFINED ? this.define.value : null;
			return v;
		}
		setValue(value: any): void {
			if (typeof value !== UNDEFINED) {
				let oldValue = this.define.value;
				this.define.value = value;
				if (oldValue != value) {
					this.form.fire("itemvaluechanged", {control: this});
				}
			}
		}

		render(designMode: boolean): void {
			var d = this.define;
			var l;
			if (d.value != "" && d.value != null && typeof d.value != UNDEFINED && d.valueAsLabel && d.display != "link")
				l = d.value + "";
			else
				l = d.label;
			if (!l)
				this.label.innerHTML = "&nbsp;";
			else
				this.label.innerHTML = browser.toSafeText(l);
			if (d.description) {
				var desc = elem("span");
				desc.setAttribute("tooltip", d.description);
				this.label.appendChild(desc);
			}
			if (l || this.define.display == "folder") {
				if (typeof d.fontSize !== "number") {
					d.fontSize = 22;
				}
				if (d.fontSize < 12)
					d.fontSize = 12;
				if (d.fontSize > 48)
					d.fontSize = 48;
				this.label.style.fontSize = d.fontSize + "px";
				this.label.style.lineHeight = d.fontSize + 4 + "px";

				if (d.display == "visible" && /^(left|right|center)$/.test(d.align))
					this.label.style.textAlign = d.align;
				else
					this.label.style.textAlign = "left";
			}
			if (d.display == "link") {
				browser.addClass(this._hr, "tui-hidden");
				browser.addClass(this.label,"tui-form-item-link");
				if (this.define.disable) {
					browser.addClass(this.label,"tui-disable");
				} else {
					browser.removeClass(this.label,"tui-disable");
				}
			} else {
				browser.removeClass(this._hr, "tui-hidden");
				browser.removeClass(this.label,"tui-form-item-link");
				browser.removeClass(this.label,"tui-disable");
			}
			if (d.display == "folder" || d.display == "link") {
				d.required = undefined;
				browser.removeClass(this.label,"tui-form-item-required");
			}
			if (!this.define.label && !this.define.description && this.define.display != "folder") {
				browser.addClass(this.label, "tui-hidden");
			} else {
				browser.removeClass(this.label, "tui-hidden");
			}
			if (designMode) {
				browser.removeClass(this.div, "tui-hidden");
				browser.removeClass(this._hr, "tui-hidden");
				browser.removeClass(this.div, "tui-form-section-newline");
				browser.removeClass(this.div, "tui-form-section-folder");
				browser.removeClass(this.div, "tui-folded");
				if (this.define.display === "folder") {
					browser.addClass(this.div, "tui-form-section-folder");
					if (!!this.define.folded) {
						browser.addClass(this.div, "tui-folded");
					}
				}
			} else {
				browser.removeClass(this.div, "tui-form-section-newline");
				browser.removeClass(this.div, "tui-form-section-folder");
				browser.removeClass(this.div, "tui-folded");
				browser.removeClass(this.div, "tui-hidden");
				if (this.define.display === "invisible") {
					browser.addClass(this.div, "tui-hidden");
				} else {
					if (this.define.display === "newline") {
						browser.addClass(this.div, "tui-form-section-newline");
					} else if (this.define.display === "folder") {
						browser.addClass(this.div, "tui-form-section-folder");
						if (!!this.define.folded) {
							browser.addClass(this.div, "tui-folded");
						}
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
						"key": "display",
						"label": str("form.display"),
						"atMost": 1,
						"options": [{"data":[
							{value: "visible", text: str("form.section")},
							{value: "folder", text: str("form.foldable")},
							{value: "invisible", text: str("form.invisible")},
							{value: "newline", text: str("form.newline")},
							{value: "link", text: str("form.link")}
						]}],
						"size": 6,
						"value": /^(visible|folder|invisible|newline|link)$/.test(this.define.display) ? this.define.display : "visible"
					}, {
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
						"value": this.define.align || "left",
						"condition": "display = \"visible\""
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
						"value": this.define.valueAsLabel ? "enable" : "disable",
						"condition": "display != \"link\""
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values: {[index: string]: any} = properties[1];
			if (values.fontSize && /^\d+$/.test(values.fontSize))
				this.define.fontSize = parseInt(values.fontSize);
			else
				this.define.fontSize = undefined;
			if (values.display == "visible" && /^(left|center|right)$/.test(values.align))
				this.define.align = values.align == "left" ? undefined : values.align;
			else
				this.define.align = undefined;
			if (values.display == "folder" || this.define.display == "link") {
				this.define.required = undefined;
			}
			this.define.value = values.value;
			this.define.display = values.display;
			if (values.valueAsLabel == "enable" && this.define.display != "link") {
				this.define.valueAsLabel = true;
			} else {
				this.define.valueAsLabel = undefined;
			}
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("section", FormSection);


	// TEXTVIEW
	// ----------------------------------------------------------------------------------------------------------
	interface TextViewFormItem extends FormItem {
		style: string;
		fontSize: number;
		align: string;
		color?: string;
	}
	class FormTextView extends FormControl<TextViewFormItem> {
		static icon = "fa-align-left";
		static desc = "form.textview";
		static order = 1;
		static init = {
			value: str("form.text.content")
		};

		private _textDiv: HTMLElement;
		constructor(form: Form, define: TextViewFormItem) {
			super(form, define);
			this._textDiv = elem("div")
			this._textDiv.className = "tui-form-text-view-content";
			this.div.appendChild(this._textDiv);
		}

		update() {
			super.update();
			if (!/^(normal|inline)$/.test(this.define.style))
				this.define.style = "normal";
			if (this.define.style == "inline") {
				this.define.size = MAX;
			}
			this.applySize();
		}

		isResizable(): boolean {
			return this.define.style != "inline";
		}

		getValue(): any {
			var v = typeof this.define.value !== UNDEFINED ? this.define.value : null;
			return v;
		}
		setValue(value: any): void {
			if (typeof value !== UNDEFINED) {
				let oldValue = this.define.value;
				this.define.value = value;
				if (oldValue != value) {
					this.form.fire("itemvaluechanged", {control: this});
				}
			}
		}

		render(designMode: boolean): void {
			var d = this.define;
			var l = d.label;
			if (!l)
				this.label.innerHTML = "&nbsp;";
			else
				this.label.innerHTML = browser.toSafeText(l);
			if (d.description) {
				if (d.style == "inline") {
					this.label.setAttribute("tooltip", d.description);
				} else {
					var desc = elem("span");
					desc.setAttribute("tooltip", d.description);
					this.label.appendChild(desc);
				}
			}

			if (typeof d.fontSize == "number") {
				if (d.fontSize < 12)
					d.fontSize = 12;
				if (d.fontSize > 40)
					d.fontSize = 40;
				this._textDiv.style.fontSize = d.fontSize + "px";
				this._textDiv.style.lineHeight = d.fontSize + 4 + "px";
			} else {
				this._textDiv.style.fontSize = "";
				this._textDiv.style.lineHeight = "";
			}
			if (!/^(left|right|center)$/.test(d.align)) {
				d.align = "left";
			}
			this._textDiv.style.textAlign = d.align;
			if (!/^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})$/i.test(d.color)) {
				d.color = "#555";
			}
			this._textDiv.style.color = d.color;

			if (d.style == "inline") {
				browser.addClass(this.div, "tui-text-view-inline");
			} else {
				browser.removeClass(this.div, "tui-text-view-inline");
			}
			if (!this.define.label && !this.define.description) {
				browser.addClass(this.label, "tui-hidden");
			} else {
				browser.removeClass(this.label, "tui-hidden");
			}
			let t = d.value ? browser.toSafeText(d.value) : "&nbsp;";
			this._textDiv.innerHTML = t;
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.textview"),
				properties: [
					{
						"type": "textarea",
						"key": "value",
						"label": str("form.value"),
						"value": this.define.value,
						"size": 6
					}, {
						"type": "textbox",
						"key": "fontSize",
						"inputType": "number",
						"label": str("form.font.size"),
						"value": this.define.fontSize,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.format") },
							{ "format": "*min:12", "message": str("message.invalid.value") },
							{ "format": "*max:40", "message": str("message.invalid.value") }
						],
						"description": "12 ~ 40"
					}, {
						"type": "textbox",
						"key": "color",
						"label": str("form.text.color"),
						"value": this.define.color,
						"validation": [
							{ "format": "#[0-9a-zA-Z]{3}|#[0-9a-zA-Z]{6}", "message": str("message.invalid.format") },
						],
					}, {
						"type": "options",
						"key": "style",
						"label": str("form.text.view.style"),
						"atMost": 1,
						"options": [{"data":[
							{value: "normal", text: str("form.style.normal")},
							{value: "inline", text: str("form.style.inline")},
						]}],
						"value": this.define.style || "normal",
					}, {
						"type": "options",
						"key": "align",
						"label": str("form.text.align"),
						"atMost": 1,
						"options": [{"data":[
							{value: "left", text: str("form.align.left")},
							{value: "center", text: str("form.align.center")},
							{value: "right", text: str("form.align.right")}
						]}],
						"value": this.define.align || "left",
					},
				]
			}];
		}
		setProperties(properties: any[]) {
			var values: {[index: string]: any} = properties[1];
			if (values.fontSize && /^\d+$/.test(values.fontSize))
				this.define.fontSize = parseInt(values.fontSize);
			else
				this.define.fontSize = undefined;
			if (/^(center|right)$/.test(values.align))
				this.define.align = values.align;
			else
				this.define.align = undefined;
			this.define.value = values.value;
			this.define.color = values.color;
			if (/^(inline)$/.test(values.style))
				this.define.style = values.style;
			else
				this.define.style = undefined;
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("textview", FormTextView);


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
		static order = 2;

		constructor(form: Form, define: FormItem) {
			super(form, define, "input");
			this._widget.on("checkexp", (e) => {
				try {
					return tui.exp.evaluate(e.data.exp, (id) => {
						if (id.type == 'function') {
							if (id.name == 'item') {
								let v = this.form.get("value");
								return itemValueFunc(id, v);
							} else {
								return tui.exp.processStandardFunc(id);
							}
						}
						let v = this.form.get("value");
						return v[id.name];
					});
				} catch(e) {
					return false;
				}
			});
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
						"position": "newline"
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
						"features": ['append', 'delete', 'edit'],
						"label": str("form.validation"),
						"size": 2,
						"position": "newline",
						"height": 120,
						"definitions": [
							{
								"type": "textbox",
								"key": "format",
								"required": true,
								"label": str("form.format"),
								"selection": [
									"*any", "*url", "*email", "*digital", "*integer", "*float", "*number", "*currency", "*date", "*key", "*max:<?>", "*min:<?>", "*maxlen:<?>", "*minlen:<?>", "*exp:<?>"
								],
								"validation": [
									{ "format": "*any", "message": str("message.cannot.be.empty")},
									{ "format": "^(\\*(any|key|integer|number|digital|url|email|float|currency|date|max:\\d+|min:\\d+|maxlen:\\d+|minlen:\\d+|exp:.+)|[^\\*].*)$", "message": str("message.invalid.format")}
								],
								"size": 2
							}, {
								"type": "textarea",
								"key": "message",
								"maxHeight": 300,
								"required": true,
								"label": str("form.message"),
								"size": 2,
								"position": "newline",
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
			this.define.selection = selection.length > 0 ? selection : undefined;
			this.define.inputType = values.inputType != "text" ? values.inputType : undefined;
			this.define.validation = (values.validation && values.validation.length) > 0 ? values.validation : undefined;
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
		minHeight?: number;
		maxHeight?: number;
	}
	class FormTextarea extends BasicFormControl<Textarea, TextareaFormItem> {
		static icon = "fa-edit";
		static desc = "form.textarea";
		static order = 3;
		static init = {
			maxHeight: 300,
			size: 2,
			position: "newline"
		};

		constructor(form: Form, define: TextareaFormItem) {
			super(form, define, "textarea");
			this._widget.on("change", (e) => {
				this.define.value = this.getValue();
				form.fire("itemvaluechanged", {control: this});
			});
			this._widget.on("checkexp", (e) => {
				try {
					return tui.exp.evaluate(e.data.exp, (id) => {
						if (id.type == 'function') {
							if (id.name == 'item') {
								let v = this.form.get("value");
								return itemValueFunc(id, v);
							} else {
								return tui.exp.processStandardFunc(id);
							}
						}
						let v = this.form.get("value");
						return v[id.name];
					});
				} catch(e) {
					return false;
				}
			});
		}
		getProperties(): PropertyPage[] {
			return [{
				name: str("form.textarea"),
				properties: [
					{
						"type": "textbox",
						"key": "minHeight",
						"inputType": "number",
						"label": str("form.min.height"),
						"value": this.define.minHeight,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.format") }
						]
					}, {
						"type": "textbox",
						"key": "maxHeight",
						"inputType": "number",
						"label": str("form.max.height"),
						"value": this.define.maxHeight,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.format") }
						]
					}, {
						"type": "grid",
						"key": "validation",
						"features": ['append', 'delete', 'edit'],
						"label": str("form.validation"),
						"size": 2,
						"position": "newline",
						"height": 150,
						"definitions": [
							{
								"type": "textbox",
								"key": "format",
								"required": true,
								"label": str("form.format"),
								"selection": [
									"*any", "*email", "*url", "*maxlen:<?>", "*minlen:<?>", "*exp:<?>"
								],
								"validation": [
									{ "format": "*any", "message": str("message.cannot.be.empty")},
									{ "format": "^(\\*(any|url|email|maxlen:\\d+|minlen:\\d+|exp:.+)|[^\\*].*)$", "message": str("message.invalid.format")}
								],
								"size": 2
							}, {
								"type": "textarea",
								"key": "message",
								"maxHeight": 300,
								"required": true,
								"label": str("form.message"),
								"size": 2,
								"position": "newline",
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
			var box = this._widget.getComponent("textbox");
			if (/\d+/.test((this.define.minHeight + "").trim()))
				box.style.minHeight = (this.define.minHeight + "").trim() + "px";
			else
				box.style.minHeight = "";
			if (/\d+/.test((this.define.maxHeight + "").trim()))
				this._widget._.style.maxHeight = (this.define.maxHeight + "").trim() + "px";
			else
				this._widget._.style.maxHeight = "";
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.validation = (values.validation && values.validation.length) > 0 ? values.validation : undefined;
			if (/\d+/.test(values.minHeight + ""))
				this.define.minHeight = values.minHeight;
			else
				this.define.minHeight = null;
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
		features: string[];
	}
	class FormOptions extends FormControl<OptionsFormItem> {
		static icon = "fa-check-square-o";
		static desc = "form.option.group";
		static order = 4;
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
		private _allBtn: Check;

		constructor(form: Form, define: OptionsFormItem) {
			super(form, define);
			this._group = <Group>create("button-group");
			this._allBtn = <Check>create("check");
			this._allBtn._set("text", "<span>" + str("all") + "</span>");
			this._allBtn._set("value", null);
			this._group.on("click", (e) => {
				if (e.data.button === this._allBtn) {
					var isCheck = !!this._allBtn.get("checked");
					tui.search(this._group._, function(elem: Widget): boolean {
						if (elem instanceof Button) {
							elem.set("checked", isCheck);
						}
						return true;
					});
				} else {
					this.syncSelectState();
				}
				this.define.value = this.getValue();
				this._notifyBar.innerHTML = "";
				form.fire("itemvaluechanged", {control: this});
			});
			this._group.appendTo(this.div);
			this._notifyBar = elem("div");
			this._notifyBar.className = "tui-form-notify-bar";
			this.div.appendChild(this._notifyBar);
		}

		private syncSelectState() {
			var selectCount = 0;
			var totalCount = 0;
			tui.search(this._group._, (elem: Widget): boolean => {
				if (elem === this._allBtn) {
					return false;
				}
				if (elem instanceof Button) {
					totalCount++;
					if (elem.get("checked"))
					selectCount++;
				}
				return true;
			});
			if (selectCount == 0) {
				this._allBtn._set("checked", false);
			} else if (selectCount == totalCount) {
				this._allBtn._set("checked", true);
				this._allBtn._set("tristate", false);
			} else {
				this._allBtn._set("tristate", true);
			}
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
			browser.removeNode(this._allBtn._);
			this._group._.innerHTML = "";

			var key = define.key;
			var data: Option[] = [];
			if (define.options && define.options.length > 0) {
				if (cal.path.indexOf(key) >= 0)
					throw new Error("Invalid expression of select control: Cycle reference detected on \"" + key + "\"");
				cal.path.push(key);
				for (let d of this.define.options) {
					if (d.condition) {
						if (tui.exp.evaluate(d.condition, function (id) {
							if (id.type == 'function') {
								if (id.name == 'item') {
									return itemFunc(id, cal);
								} else {
									return tui.exp.processStandardFunc(id);
								}
							}
							if (cal.cache.hasOwnProperty(id.name))
								return cal.cache[id.name];
							else {
								cal.calc(id.name, cal.path);
								return cal.cache[id.name];
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
				if (optionType == "check" && exist(this.define.features, "selectAll")) {
					this._group._.appendChild(this._allBtn._);
				}
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
			var tmpValue = this._group.get("value");
			if (data.length > 0 && optionType == "check" && exist(this.define.features, "selectAll") && this._allBtn.get("checked")) {
				tmpValue.splice(0, 1);
			}
			define.value = tmpValue;
			define.text = this._group.get("text");
			return define.value;
		}
		setValue(value: any): void {
			this._group.set("value", value);
			let oldValue = this.define.value;
			this.define.value = value;
			if (oldValue !== value) {
				this.form.fire("itemvaluechanged", {control: this});
			}
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
			browser.removeNode(this._allBtn._);
			this._group._.innerHTML = "";
			if (data.length > 0) {
				if (optionType == "check" && exist(this.define.features, "selectAll")) {
					this._group._.appendChild(this._allBtn._);
				}
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
			this.syncSelectState();
		}
		render(designMode: boolean): void {
			if (designMode)
				this.renderDesign();
			else
				this.syncSelectState();
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
						"value": optionsToText(this.define.options, false),
						"validation": [
							{ "format": "*any", "message": str("message.cannot.be.empty") }
						],
						"size": 6
					}, {
						"type": "options",
						"key": "align",
						"label": str("form.arrange"),
						"value": this.define.align === "vertical" ? "vertical" : "normal",
						"options": [{"data":[
							{ "value": "normal", "text": str("normal") },
							{ "value": "vertical", "text": str("vertical") }
						]}],
						"atMost": 1,
						"size": 1
					}, {
						"type": "options",
						"key": "features",
						"label": str("form.grid.features"),
						"value": this.define.features,
						"options": [{"data":[
							{ "value": "selectAll", "text": str("support.select.all") }
						]}],
						"size": 1,
						"condition": "atMost > 1 or atMost = ''"
					}, {
						"type": "section",
						"key": null,
						"label": null,
						"display": "newline"
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
			this.define.align = values.align != "normal" ? values.align : undefined;
			this.define.atLeast = values.atLeast ? parseInt(values.atLeast) : undefined;
			this.define.atMost = values.atMost ? parseInt(values.atMost) : undefined;
			if (typeof this.define.atMost != "number" || this.define.atMost > 1) {
				this.define.features = values.features;
			} else {
				this.define.features = [];
			}
			this.define.options = textToOptions(values.options, false);
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
		static order = 5;
		static init = {
			"atMost": 1,
			"selection": [{
				"data": [
					{"value":"A"},
					{"value":"B"},
					{"value":"C"}
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
				this.define.value = this._widget.get("value");
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
						"value": optionsToText(this.define.selection, this.define.atMost != 1),
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
						"position": "newline"
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
			this.define.atLeast = values.atLeast  > 0 ? parseInt(values.atLeast) : undefined;
			this.define.atMost = values.atMost > 0 ? parseInt(values.atMost) : undefined;
			this.define.selection = textToOptions(values.selection, this.define.atMost != 1);
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
						if (tui.exp.evaluate(d.condition, function (id) {
							if (id.type == 'function') {
								if (id.name == 'item') {
									return itemFunc(id, cal);
								} else {
									return tui.exp.processStandardFunc(id);
								}
							}
							if (cal.cache.hasOwnProperty(id.name))
								return cal.cache[id.name];
							else {
								cal.calc(id.name, cal.path);
								return cal.cache[id.name];
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
			this._widget.set("value", this.define.value);
			this.define.value = this._widget.get("value");
			this.define.text = this._widget.get("text");
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
		min: string;
		max: string;
	}
	class FormDatePicker extends BasicFormControl<DatePicker, DatePickerFormItem> {
		static icon = "fa-calendar-o";
		static desc = "form.datepicker";
		static order = 6;

		constructor(form: Form, define: DatePickerFormItem) {
			super(form, define, "date-picker");
			this._widget.on("change", (e) => {
				this.define.value = this.getValue();
				form.fire("itemvaluechanged", {control: this});
			});
		}
		update() {
			this._widget._set("mode", /^(date|date-time|time|month)$/.test(this.define.mode) ? this.define.mode : null);
			super.update();
			this._widget._set("format", this.define.format || null);
			if (!/^(utc|locale|none)$/.test(this.define.timezone))
			this.define.timezone = "none";
			this._widget._set("timezone", this.define.timezone);
			this._widget._set("min", this.define.min || null);
			this._widget._set("max", this.define.max || null);
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
						"position": "newline"
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
						"position": "newline"
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
						"position": "newline"
					}, {
						"type": "datepicker",
						"key": "min",
						"mode": "date-time",
						"label": str("form.min.value"),
						"value": this.define.min || null,
						"size": 1
					}, {
						"type": "datepicker",
						"key": "max",
						"mode": "date-time",
						"label": str("form.max.value"),
						"value": this.define.max || null,
						"size": 1
					}, {
						"type": "textbox",
						"key": "format",
						"label": str("form.custom.format"),
						"description": str("form.date.desc"),
						"value": this.define.format ? this.define.format : null,
						"position": "newline",
						"size": 2
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.format = values.format ? values.format : undefined;
			this.define.mode = values.mode;
			this.define.min = values.min;
			this.define.max = values.max;
			if (this.define.required) {
				this.define.validation = [{ "format": "*any", "message": str("message.cannot.be.empty")}];
			} else
				this.define.validation = undefined;
			this.define.timezone = values.timezone;
			this.define.autoInit = values.autoInit ? true : undefined;
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("datepicker", FormDatePicker);


	// CALENDAR
	// ----------------------------------------------------------------------------------------------------------
	interface CalendarFormItem extends FormItem {
		mode: string;
		min: string;
		max: string;
	}
	class FormCalendar extends BasicFormControl<Calendar, CalendarFormItem> {
		static icon = "fa-calendar";
		static desc = "form.calendar";
		static order = 7;
		static init = {
			size: 1,
			position: "newline"
		};

		constructor(form: Form, define: CalendarFormItem) {
			super(form, define, "calendar");
			this._widget.on("change", (e) => {
				this.define.value = this.getValue();
				form.fire("itemvaluechanged", {control: this});
			});
		}
		update() {
			super.update();
			this._widget._set("min", this.define.min || null);
			this._widget._set("max", this.define.max || null);
			this._widget._set("mode", /^(date|month)$/.test(this.define.mode) ? this.define.mode : null);
			if (this.define.value == null) {
				this._widget._set("value", time.now());
				this.define.value = this._widget.get("value");
			}
		}
		getProperties(): PropertyPage[] {
			return [{
				name: str("form.calendar"),
				properties: [
					{
						"type": "options",
						"key": "mode",
						"label": str("form.format"),
						"options": [{"data":[
							{"value": "date", "text": str("form.date") },
							{"value": "month", "text": str("form.month") }
						]}],
						"atMost": 1,
						"value": /^(date|month)$/.test(this.define.mode) ? this.define.mode : "date",
						"size": 2,
						"position": "newline"
					}, {
						"type": "datepicker",
						"key": "min",
						"mode": "date-time",
						"label": str("form.min.value"),
						"value": this.define.min || null,
						"size": 1
					}, {
						"type": "datepicker",
						"key": "max",
						"mode": "date-time",
						"label": str("form.max.value"),
						"value": this.define.max || null,
						"size": 1
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.mode = values.mode;
			this.define.min = values.min;
			this.define.max = values.max;
		}
		validate(): boolean {
			return true;
		}
	}
	Form.register("calendar", FormCalendar);


	// PICTURE
	// ----------------------------------------------------------------------------------------------------------
	interface PictureFormItem extends FormItem {
		action: string;
		accept: string;
	}
	class FormPicture extends BasicFormControl<Picture, PictureFormItem> {
		static icon = "fa-file-image-o";
		static desc = "form.picture";
		static order = 8;
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
						"position": "newline"
					}, {
						"type": "textbox",
						"key": "accept",
						"label": str("form.file.type"),
						"value": this.define.accept,
						"validation": [{ "format": FormPicture.MIME, "message": str("message.must.be.image")}],
						"size": 2,
						"position": "newline"
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
		static order = 9;
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
						"position": "newline"
					}, {
						"type": "textbox",
						"key": "accept",
						"label": str("form.file.type"),
						"value": this.define.accept,
						"size": 2,
						"position": "newline"
					}
				]
			}];
		}
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.accept = values.accept ? values.accept : undefined;
			this.define.action = values.action;
			if (this.define.required) {
				this.define.validation = [{ "format": "*any", "message": str("message.cannot.be.empty")}];
			} else
				this.define.validation = undefined;
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
		static order = 10;
		static init = {
			size: 2,
			position: "newline"
		};
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
			this._widget.on("download", (e) => {
				return form.fire("download", {control: this, url: e.data.url, fileName: e.data.fileName, mimeType: e.data.mimeType});
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
						"position": "newline"
					}, {
						"type": "textbox",
						"key": "accept",
						"label": str("form.file.type"),
						"value": this.define.accept,
						"size": 2,
						"position": "newline"
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
			this.define.accept = values.accept ? values.accept : undefined;
			this.define.action = values.action;
			this.define.atLeast = values.atLeast ? parseInt(values.atLeast) : undefined;
			this.define.atMost = values.atMost ? parseInt(values.atMost) : undefined;
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
	//	items: any[];
		features: string[];
		atLeast?: number;
		atMost?: number;
		height?: number;
	}
	class FormGrid extends BasicFormControl<Grid, GridFormItem> {
		static icon = "fa-table";
		static desc = "form.grid";
		static order = 11;
		static init = {
			size: 6,
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
				this.showSubForm(-1);
			});

			this._btnDelete = <Button>create("button", {text: "<i class='fa fa-minus'></i>"});
			this._btnDelete.appendTo(this._buttonBar);
			this._btnDelete.on("click", () => {
				var i = this._widget.get("activeRow");
				if (i === null)
					return;
				this._values.splice(i, 1);
				this._notifyBar.innerHTML = "";
				this.updateButtonState();
				form.fire("itemvaluechanged", {control: this});
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

			this._notifyBar = elem("div");
			this._notifyBar.className = "tui-form-notify-bar";
			this.div.appendChild(this._notifyBar);
		}

		private showSubForm(editIndex) {
			var dialog = <Dialog>create("dialog");
			var fm = <Form>create("form");
			fm._.className = "tui-form-property-form";
			fm.set("definition", tui.clone(this.define.definitions));
			dialog.set("content", fm._);
			dialog.set("mobileModel", true);
			dialog.open("ok#tui-primary");
			if (editIndex >= 0) {
				fm.set("value", this._values[editIndex]);
			}
			this.form._set("subform", fm);
			this.form.fire("subformopened", {key: this.define.key, form: fm});
			dialog.on("close", () => {
				this.form._set("subform", null);
				this.form.fire("subformclosed", {key: this.define.key, form: fm});
			});
			dialog.on("btnclick", () => {
				if (!fm.validate())
					return;
				try {
					var v = fm.get("value");
					if (editIndex >= 0) {
						this._values.splice(editIndex, 1, v);
					} else {
						this._values.push(v);
					}
					dialog.close();
					this._notifyBar.innerHTML = "";
					this.updateButtonState();
					this.form.fire("itemvaluechanged", {control: this});
				} catch (e) {}
			});
			fm.on("download", (e) => {
				var stack = [{
					key: this.define.key,
					form: fm
				}];
				if (e.data.stack) {
					stack = stack.concat(e.data.stack)
				}
				return this.form.fire("download", {stack: stack, control: e.data.control, url: e.data.url, fileName: e.data.fileName, mimeType: e.data.mimeType});
			});
			fm.on("link", (e) => {
				var stack = [{
					key: this.define.key,
					form: fm
				}];
				if (e.data.stack) {
					stack = stack.concat(e.data.stack)
				}
				return this.form.fire("link", {stack: stack, control: e.data.control, url: e.data.url});
			});
			fm.on("itemvaluechanged", (e) => {
				var stack = [{
					key: this.define.key,
					form: fm
				}];
				if (e.data.stack) {
					stack = stack.concat(e.data.stack)
				}
				this.form.fire("itemvaluechanged", {stack: stack, control: e.data.control});
			});
			fm.on("subformopened", (e) => {
				var stack = [{
					key: this.define.key,
					form: fm
				}];
				if (e.data.stack) {
					stack = stack.concat(e.data.stack)
				}
				this.form.fire("subformopened", {stack: stack, key: e.data.key, form: e.data.form});
			});
			fm.on("subformclosed", (e) => {
				var stack = [{
					key: this.define.key,
					form: fm
				}];
				if (e.data.stack) {
					stack = stack.concat(e.data.stack)
				}
				this.form.fire("subformclosed", {stack: stack, key: e.data.key, form: e.data.form});
			});
		}

		editRow() {
			var i = this._widget.get("activeRow");
			if (i === null)
				return;
				this.showSubForm(i);
		}

		updateButtonState() {
			var d = this.define;
			this._btnAdd._.style.display = exist(this.define.features, "append") ? (
				(d.atMost && this._values.length >= d.atMost) ? "none": "inline-block"
			) : "none";
			this._btnEdit._.style.display = exist(this.define.features, "edit") ? "inline-block" : "none";
			this._btnDelete._.style.display = exist(this.define.features, "delete") ? (
				(d.atLeast && this._values.length <= d.atLeast || this._values.length === 0) ? "none" : "inline-block"
			) : "none";
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
			this.updateButtonState();

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
					d.height = undefined;
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
						"position": "newline"
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
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "height",
						"label": str("form.height"),
						"value": /^\d+$/.test(this.define.height + "")? this.define.height : null,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						],
						"condition": "features !~ 'autoHeight'"
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
			this.define.height = /^\d+$/.test(values.height) ? values.height: undefined;
			this.define.atLeast = values.atLeast ? parseInt(values.atLeast) : undefined;
			this.define.atMost = values.atMost ? parseInt(values.atMost) : undefined;
			this.define.definitions = properties[2];
			this.define.features = values.features;
		}
		getValue(): any {
			return this._values;
		}
		setValue(value: any): void {
			if (value !== this._values) {
				if (value instanceof Array) {
					this._values = value;
					this.define.value = value;
					this._widget._set("list", this._values);
				}
				this._widget.render();
				this.updateButtonState();
				this.form.fire("itemvaluechanged", {control: this});
			} else {
				this._widget.render();
			}
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
