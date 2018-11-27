/// <reference path="../../dist/tui2.d.ts" />

module tui.widget.ext {
	"use strict";

	interface ResultItem {
		name?: string;
		[index: string]: string;
	}

	function mergeArray(key:string, src: ResultItem[], newValues: ResultItem[]): ResultItem[] {
		var result: ResultItem[] = [];
		if (!(newValues instanceof Array))
			return src;
		if (!(src instanceof Array) || src.length == 0)
			return newValues;
		result.splice(0,0, ...src);
		for (let i = 0; i < newValues.length; i++) {
			let k = newValues[i][key];
			let exists = false;
			for (let item of result) {
				if (item[key] == k) {
					exists = true
					break;
				}
			}
			if (!exists) {
				let obj: ResultItem = {};
				obj[key] = k;
				obj.name = newValues[i].name;
				result.push(obj);
			}
		}
		return result;
	}

	function createSelector(key: string, title: string, rowTooltip: string, rowType: RegExp, invalidMessage: string, classType: any, handler: (result: ResultItem | ResultItem[]) => void | boolean) {
		let searchBox = <Input>create("input");
		searchBox._set("iconLeft", "fa-search");
		searchBox._set("clearable", true);
		searchBox._set("placeholder", str("label.search"));
		let list = <List>create("list");
		list._set("rowTooltipKey", rowTooltip);
		list._set("nameKey", "displayName");

		let dialogDiv = elem("div");
		dialogDiv.className = "tui-dialog-select-div";
		dialogDiv.appendChild(searchBox._);
		dialogDiv.appendChild(list._);
		let dialog = <Dialog>create("dialog");
		dialog._set("mobileModel", true);
		dialog.setContent(dialogDiv);
		dialog.set("title", title);


		let _topOrganId: number;
		let _withSubCompany: boolean;
		let _multiple: boolean;

		searchBox.on("enter clear", () => {
			if (searchBox.get("value")) {
				queryList();
			} else {
				queryTree();
			}
		});

		dialog.on("open", function() {
			searchBox.set("value", "");
			queryTree();
		});

		dialog.on("btnclick", (e) => {
			if (typeof handler !== "function") {
				return;
			}
			if (_multiple) {
				let values = [];
				let checkedItems: any[] = list.get("checkedItems");
				for (let i = 0; i < checkedItems.length; i++) {
					let obj:ResultItem = {};
					obj[key] = checkedItems[i][key];
					obj.name = checkedItems[i].name;
					values.push(obj);
				}
				if (handler(values) !== false) {
					dialog.close()
				}
			} else {
				let row = list.get("activeRowData");
				if (row == null) {
					tui.msgbox(invalidMessage);
					return;
				} else if (!rowType.test(row.type)) {
					tui.msgbox(invalidMessage);
					return;
				} else {
					let obj: ResultItem = {};
					obj[key] = row[key];
					obj.name = row.name;
					if (handler(obj) !== false) {
						dialog.close()
					}
				}
			}
		});

		function queryTree() {
			var datasource = new tui.ds.RemoteTree();
			datasource.on("query", (e) => {
				var parentId = (e.data.parent === null ? null: e.data.parent.item.id);
				var topmost = false;
				if (parentId === null && (typeof _topOrganId === "number" || _topOrganId)) {
					parentId = _topOrganId;
					topmost = true;
				}
				ajax.post_(classType.listApi, {
					organId: parentId,
					withSubCompany: !!_withSubCompany,
					topmost: topmost
				}).done(function(result){
					datasource.update({
						parent: e.data.parent,
						data: result
					});
				}).fail(function(status, message){
					datasource.update({
						parent: e.data.parent,
						data: []
					});
					tui.errbox(message);
				});
			});
			list.set("activeRow", null);
			list.set("tree", datasource);
		}

		function queryList() {
			var query = {
				keyword: searchBox.get("value"),
				organId: (typeof _topOrganId === "number" || _topOrganId ? _topOrganId : null),
				withSubCompany: !!_withSubCompany
			}
			ajax.post(classType.queryApi, query).done((result) => {
				list.set("activeRow", null);
				list.set("list", result);
			}).fail(() => {
				list.set("list", []);
			});
		}

		return function (topOrgan: any, withSubCompany: boolean, multiple: boolean) {
			_topOrganId = (topOrgan ? topOrgan.id: null);
			_withSubCompany = withSubCompany;
			_multiple = !!multiple;
			list.set("checkable", !!multiple);
			dialog.open("ok#tui-primary");
		}
	}

	abstract class FormDialogSelect<D extends FormItem> extends BasicFormControl<DialogSelect, D> {
		// Following variables should be initialized by subclass
		protected _classType: any;
		protected _rightIcon: string;
		protected _title: string;
		protected _rowType: RegExp;
		protected _rowTooltip: string;
		protected _invalidSelectionMessage: string;
		protected _key: string;
		protected _allowMultiSelect: boolean;

		abstract init(): void;

		constructor(form: Form, define: D) {
			super(form, define, "dialog-select");
			this.init();
			this._widget.set("iconRight", this._rightIcon);
			var selector = createSelector(this._key, this._title, this._rowTooltip, this._rowType, this._invalidSelectionMessage, this._classType, (result) => {
				if (this.define.multiple) {
					let values = mergeArray(this._key, this.define.value, <ResultItem[]>result);
					var text = "";
					for (let i = 0; i < values.length; i++) {
						if (i > 0)
							text += ", ";
						text += values[i].name;
					}
					this.define.value = values;
					this._widget.set("text", text);
					form.fire("itemvaluechanged", {control: this});
				} else {
					this.define.value = result;
					this._widget.set("text", (<ResultItem>result).name);
					form.fire("itemvaluechanged", {control: this});
				}
			});
			this._widget.on("open", () => {
				selector(this.define.organ, this.define.withSubCompany, this.define.multiple)
				return false;
			});
			this._widget.on("clear", () => {
				if (this.define.multiple)
					this.define.value = [];
				else
					this.define.value = null;
				form.fire("itemvaluechanged", {control: this});
			});

		}

		update() {
			super.update();
			this._widget._set("clearable", true);
			this.setValueInternal(this.define.value);
			if (this.define.required) {
				this._widget._set("validate", [{ "format": "*any", "message": str("message.cannot.be.empty")}]);
			} else {
				this._widget._set("validate", []);
			}
		}

		getValue(cal: Calculator = null): any {
			if (typeof this.define.value === UNDEFINED) {
				if (this.define.multiple)
					return [];
				else
					return null;
			} else
				return this.define.value;
		}
		private setValueInternal(value: any): void {
			if (this.define.multiple) {
				if (value instanceof Array) {
					var items = [];
					var text = "";
					for (let item of value) {
						if (item && item[this._key] && item.name) {
							let obj:{[index: string]: string} = {};
							obj[this._key] = item[this._key];
							obj.name = item.name;
							items.push(obj);
							if (items.length > 1)
								text += ", ";
							text += item.name;
						}
					}
					this.define.value = items;
					this._widget.set("text", text);
				} else {
					this.define.value = [];
					this._widget.set("text", "");
				}
			} else {
				if (value && value[this._key] && value.name) {
					let obj:{[index: string]: string} = {};
					obj[this._key] = value[this._key];
					obj.name = value.name;
					this.define.value = obj;
					this._widget.set("text", value.name);
				} else {
					this.define.value = null;
					this._widget.set("text", "");
				}
			}
		}
		setValue(value: any): void {
			this.setValueInternal(value);
			this.form.fire("itemvaluechanged", {control: this});
		}

		getProperties(): PropertyPage[] {
			var properties: FormItem[] = [
				{
					"type": "organ",
					"key": "organ",
					"label": str("label.top.organ"),
					"value": this.define.organ,
					"withSubCompany": true,
					"size": 2,
					"position": "newline"
				},{
					"type": "options",
					"key": "withSubCompany",
					"label": str("label.with.sub.company"),
					"value": this.define.withSubCompany ? true : false,
					"options": [{"data": [
						{"value": true, "text": str("yes")},
						{"value": false, "text": str("no")}
					]}],
					"atMost": 1,
					"size": 2,
					"position": "newline"
				}
			];
			if (this._allowMultiSelect) {
				properties.push({
					"type": "options",
					"key": "multiple",
					"label": str("label.multiselect"),
					"value": this.define.multiple ? true : false,
					"options": [{"data": [
						{"value": true, "text": str("yes")},
						{"value": false, "text": str("no")}
					]}],
					"atMost": 1,
					"size": 2
				});
			}
			return [{
				name: str(this._classType.desc),
				properties: properties
			}];
		}

		setProperties(properties: any[]) {
			var values = properties[1];
			if (this.define.multiple != !!values.multiple) {
				this.define.multiple = !!values.multiple;
				this.setValue(null);
			}
			this.define.withSubCompany = !!values.withSubCompany;
			this.define.organ = values.organ;
		}

		validate(): boolean {
			return this._widget.validate();
		}
	}

	interface UserSelectItem extends FormItem {
		multiple: boolean;
		organ: {id: number, name: string};
		withSubCompany: boolean;
	}

	function translateValue(value: any, item: any, index: number): Node {
		if (value instanceof Array) {
			let s = "";
			for (let item of value) {
				if (item && item.name) {
					if (s.length > 0)
						s += ", ";
					s += item.name
				}
			}
			return document.createTextNode(s);
		} else if (value && value.name)
			return value.name;
		else
			return null;
	}

	class FormUserSelect extends FormDialogSelect<UserSelectItem> {
		static icon = "fa-user-o";
		static desc = "label.user";
		static order = 200;
		static queryApi: string = null;
		static listApi: string = null;
		static init = {
			multiple: false,
			withSubCompany: true
		};
		static translator = translateValue;

		init() {
			this._classType = FormUserSelect;
			this._rightIcon = "fa-user-o";
			this._title = str("label.select.user");
			this._rowType = /^user$/;
			this._rowTooltip = "tooltip";
			this._invalidSelectionMessage = str("message.select.user");
			this._key = "account";
			this._allowMultiSelect = true;
		}

	}

	Form.register("user", FormUserSelect);



	// --------------------------------------------------------------------------------

	interface OrganSelectItem extends FormItem {
		organ: {id: number, name: string};
		withSubCompany: boolean;
	}

	class FormOrganSelect extends FormDialogSelect<OrganSelectItem> {
		static icon = "fa-building-o";
		static desc = "label.organization";
		static order = 202;
		static queryApi: string = null;
		static listApi: string = null;
		static init = {
			multiple: false,
			withSubCompany: true
		};
		static translator = translateValue;

		init() {
			this._classType = FormOrganSelect;
			this._rightIcon = "fa-building-o";
			this._title = str("label.select.organ");
			this._rowType = /^(company|department)$/;
			this._rowTooltip = "tooltip";
			this._invalidSelectionMessage = str("message.select.organ");
			this._key = "id";
			this._allowMultiSelect = false;
		}
	}
	Form.register("organ", FormOrganSelect);

	// --------------------------------------------------------------------------------

	interface UserListFormItem extends FormItem {
		organ: {id: number, name: string};
		withSubCompany: boolean;
		atLeast?: number;
		atMost?: number;
		height?: number;
	}
	class FormUserList extends BasicFormControl<List, UserListFormItem> {
		static icon = "fa-list";
		static desc = "label.user.list";
		static order = 201;
		static init = {
			withSubCompany: true,
			position: "newline"
		};

		// private _values: any[];
		private _buttonBar: HTMLElement;
		private _btnAdd: Button;
		private _btnDelete: Button;
		private _notifyBar: HTMLElement;

		constructor(form: Form, define: UserListFormItem) {
			super(form, define, "list");

			var selector = createSelector("account", str("label.select.user"), "tooltip", /^user$/, str("message.select.user"), FormUserSelect, (result) => {
				let values = mergeArray("account", this.define.value, <ResultItem[]>result);
				this._notifyBar.innerHTML = "";
				this.setValue(values);
			});

			this._widget._.style.margin = "2px";
			this._buttonBar = elem("div");
			this.div.appendChild(this._buttonBar);
			this._btnAdd = <Button>create("button", {text: "<i class='fa fa-plus'></i>"});
			this._btnAdd.appendTo(this._buttonBar);
			this._btnAdd.on("click", () => {
				selector(this.define.organ, this.define.withSubCompany, true);
			});

			this._btnDelete = <Button>create("button", {text: "<i class='fa fa-minus'></i>"});
			this._btnDelete.appendTo(this._buttonBar);
			this._btnDelete.on("click", () => {
				var i = this._widget.get("activeRow");
				if (i === null)
					return;
				this.define.value.splice(i, 1);
				this._notifyBar.innerHTML = "";
				form.fire("itemvaluechanged", {control: this});
			});

			this._notifyBar = elem("div");
			this._notifyBar.className = "tui-form-notify-bar";
			this.div.appendChild(this._notifyBar);
		}

		update() {
			super.update();
			this._notifyBar.innerHTML = "";
			var d = this.define;
			if (!(d.value instanceof Array)) {
				d.value = [];
			}
			this._widget._set("list", d.value);

			if (this.define.disable) {
				this._btnAdd.set("disable", true);
				this._btnAdd._.style.display = "none";
				this._btnDelete.set("disable", true);
				this._btnDelete._.style.display = "none";
				this._widget.set("disable", true);
			} else {
				this._btnAdd.set("disable", false);
				this._btnAdd._.style.display = "inline-block";
				this._btnDelete.set("disable", false);
				this._btnDelete._.style.display = "inline-block";
				this._widget.set("disable", false);
			}
			this._widget.set("autoHeight", false);
			if (typeof d.height === "number" && !isNaN(d.height) ||
				typeof d.height === "string" && /^\d+$/.test(d.height)) {
				this._widget._.style.height = d.height + "px";
			} else {
				this._widget._.style.height = "";
				d.height = undefined;
			}
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("label.user.list"),
				properties: [
					{
						"type": "organ",
						"key": "organ",
						"label": str("label.top.organ"),
						"value": this.define.organ,
						"withSubCompany": true,
						"size": 2,
						"position": "newline"
					}, {
						"type": "options",
						"key": "withSubCompany",
						"label": str("label.with.sub.company"),
						"value": this.define.withSubCompany ? true : false,
						"options": [{"data": [
							{"value": true, "text": str("yes")},
							{"value": false, "text": str("no")}
						]}],
						"atMost": 1,
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
					}, {
						"type": "textbox",
						"inputType": "number",
						"key": "height",
						"label": str("form.height"),
						"value": /^\d+$/.test(this.define.height + "")? this.define.height : null,
						"validation": [
							{ "format": "*digital", "message": str("message.invalid.value") }
						]
					}
				]
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
			this.define.withSubCompany = !!values.withSubCompany;
			this.define.organ = values.organ;
		}
		getValue(): any {
			return this.define.value || [];
		}
		setValue(value: any): void {
			if (value !== this.define.value) {
				if (value instanceof Array) {
					this.define.value = value;
					this._widget._set("list", this.define.value);
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
	Form.register("users", FormUserList);

	interface QRCodeFormItem extends FormItem {

	}

	class QRCode extends BasicFormControl<DialogSelect, QRCodeFormItem> {
		static icon = "fa-barcode";
		static desc = "label.qrcode";
		static order = 203;
		static init = {};

		constructor(form: Form, define: QRCodeFormItem) {
			super(form, define, "dialog-select");
			this._widget.set("iconRight", "fa-barcode");
			this._widget.on("open", () => {
				form.fire("itemevent", {event: "getQRCode", control: this, callback: (qrCode: string) => {
					if (typeof qrCode != tui.UNDEFINED && qrCode != null) {
						this.setValue(qrCode + "");
					}
				}});
				return false;
			});
			this._widget.on("clear", () => {
				this.define.value = null;
				form.fire("itemvaluechanged", {control: this});
			});

		}

		update() {
			super.update();
			this._widget._set("clearable", true);
			this._widget._set("value", this.define.value);
			if (this.define.required) {
				this._widget._set("validate", [{ "format": "*any", "message": str("message.cannot.be.empty")}]);
			} else {
				this._widget._set("validate", []);
			}
		}

		getValue(cal: Calculator = null): any {
			return this.define.value;
		}
		setValue(value: any): void {
			this._widget.set("text", value);
			this.define.value = value;
			this.form.fire("itemvaluechanged", {control: this});
		}

		getProperties(): PropertyPage[] {
			return [];
		}

		setProperties(properties: any[]) {}

		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("qrcode", QRCode);



	tui.dict("en-us", {
		"label.qrcode": "QRCode",
		"label.user": "User",
		"label.user.list": "User List",
		"label.multiselect": "Multi-Select",
		"label.search": "Search",
		"label.select.user": "Select User",
		"label.select.organ": "Select Organization",
		"label.organization": "Organiztion",
		"label.top.organ": "Top Organization",
		"label.with.sub.company": "Include Sub Company",
		"message.select.organ": "Please select an organization!",
		"message.select.user": "Please select an user!"
	});
	tui.dict("zh-cn", {
		"label.qrcode": "二维码",
		"label.user": "用户",
		"label.user.list": "用户列表",
		"label.multiselect": "多选",
		"label.search": "搜索",
		"label.select.user": "选择用户",
		"label.select.organ": "选择机构",
		"label.organization": "组织机构",
		"label.top.organ": "顶层机构",
		"label.with.sub.company": "包括子公司",
		"message.select.organ": "请选择一个机构！",
		"message.select.user": "请选择一个用户！"
	});


	export function setUserSelectApiPath(queryApi: string, listApi: string) {
		FormUserSelect.queryApi = queryApi;
		FormUserSelect.listApi = listApi;
	}

	export function setOrganSelectApiPath(queryApi: string, listApi: string) {
		FormOrganSelect.queryApi = queryApi;
		FormOrganSelect.listApi = listApi;
	}

}
