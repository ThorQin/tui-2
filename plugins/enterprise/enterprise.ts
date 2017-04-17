/// <reference path="../../dist/tui2.d.ts" />

module tui.widget.ext {
	"use strict";

	abstract class FormDialogSelect<D extends FormItem> extends BasicFormControl<DialogSelect, D> {
		protected _searchBox: Input;
		protected _list: List;
		protected _dialogDiv: HTMLElement;
		// Following variables should be initialized by subclass
		protected _classType: any;
		protected _rightIcon: string;
		protected _title: string;
		protected _rowType: string;
		protected _invalidSelectionMessage: string;
		protected _key: string;
		protected _allowMultiSelect: boolean;

		abstract init(): void;

		protected queryTree() {
			var datasource = new tui.ds.RemoteTree();
			datasource.on("query", (e) => {
				var parentId = (e.data.parent === null ? null: e.data.parent.item.id);
				if (parentId === null && this.define.organ && typeof this.define.organ.id === "number") {
					parentId = this.define.organ.id;
				}
				ajax.post_(this._classType.listApi, {
					organId: parentId, 
					withSubCompany: !!this.define.withSubCompany
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
			this._list.set("activeRow", null);
			this._list.set("tree", datasource);
		}

		protected queryList() {
			var query = {
				keyword: this._searchBox.get("value"),
				organId: (this.define.organ && typeof this.define.organ.id === "number" ? this.define.organ.id : null),
				withSubCompany: !!this.define.withSubCompany
			}
			ajax.post(this._classType.queryApi, query).done((result) => {
				this._list.set("activeRow", null);
				this._list.set("list", result);
			}).fail(() => {
				this._list.set("list", []);
			});
		}

		constructor(form: Form, define: D) {
			super(form, define, "dialog-select");
			this.init();
			this._widget.set("iconRight", this._rightIcon);
			this._searchBox = <Input>create("input");
			this._searchBox._set("iconLeft", "fa-search");
			this._searchBox._set("clearable", true);
			this._searchBox._set("placeholder", str("label.search"));
			this._list = <List>create("list");
			this._list._set("rowTooltipKey", "positions");
			this._list._set("nameKey", "displayName");
			this._dialogDiv = elem("div");
			this._dialogDiv.className = "tui-dialog-select-div";
			this._dialogDiv.appendChild(this._searchBox._);
			this._dialogDiv.appendChild(this._list._);
			this._widget._set("title", this._title);
			this._widget._set("content", this._dialogDiv);
			this._searchBox.on("enter clear", () => {
				if (this._searchBox.get("value")) {
					this.queryList();
				} else {
					this.queryTree();
				}
			});
			this._widget.on("open", () => {
				this._searchBox.set("value", "");
				this.queryTree();
			});
			this._widget.on("clear", () => {
				if (this.define.multiple)
					this.define.value = [];
				else
					this.define.value = null;
				form.fire("itemvaluechanged", {control: this});
			});
			this._widget.on("select", () => {
				if (this.define.multiple) {
					var values = [];
					var checkedItems: any[] = this._list.get("checkedItems");
					var text = "";
					for (let i = 0; i < checkedItems.length; i++) {
						let obj:{[index: string]: string} = {};
						obj[this._key] = checkedItems[i][this._key];
						obj.name = checkedItems[i].name;
						values.push(obj);
						if (i > 0)
							text += ", ";
						text += checkedItems[i].name;
					}
					this.define.value = values;
					this._widget.set("text", text);
					form.fire("itemvaluechanged", {control: this});
				} else {
					var row = this._list.get("activeRowData");
					if (row == null) {
						tui.msgbox(this._invalidSelectionMessage);
						return false;
					} else if (row.type !== this._rowType) {
						tui.msgbox(this._invalidSelectionMessage);
						return false;
					} else {
						let obj:{[index: string]: string} = {};
						obj[this._key] = row[this._key];
						obj.name = row.name;
						this.define.value = obj;
						this._widget.set("text", row.name);
						form.fire("itemvaluechanged", {control: this});
					}
				}
			});
		}

		update() {
			super.update();
			this._widget._set("clearable", !this.define.required);
			this._list._set("checkable", !!this.define.multiple);
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
		setValue(value: any): void {
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
							if (items.length > 0)
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
			this.form.fire("itemvaluechanged", {control: this});
		}

		getProperties(): PropertyPage[] {
			var properties: FormItem[] = [
				{
					"type": "organ",
					"key": "organ",
					"label": str("label.top.organ"),
					"value": this.define.organ,
					"size": 2,
					"newline": true
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
					"size": 1,
					"newline": true,
					"condition": "organ != null"
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
					"size": 1
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

	class FormUserSelect extends FormDialogSelect<UserSelectItem> {
		static icon = "fa-user-o";
		static desc = "label.user";
		static order = 200;
		static queryApi: string = null;
		static listApi: string = null;
		static init = {
			multiple: false
		};

		init() {
			this._classType = FormUserSelect;
			this._rightIcon = "fa-user-o";
			this._title = str("label.select.user");
			this._rowType = "user";
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
		static order = 201;
		static queryApi: string = null;
		static listApi: string = null;
		static init = {
			multiple: false
		};

		init() {
			this._classType = FormOrganSelect;
			this._rightIcon = "fa-building-o";
			this._title = str("label.select.organ");
			this._rowType = "organ";
			this._invalidSelectionMessage = str("message.select.organ");
			this._key = "id";
			this._allowMultiSelect = false;
		}
	}
	Form.register("organ", FormOrganSelect);


	tui.dict("en-us", {
		"label.user": "User",
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
		"label.user": "用户",
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