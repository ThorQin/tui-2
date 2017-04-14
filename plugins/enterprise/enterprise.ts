/// <reference path="../../dist/tui2.d.ts" />

module tui.widget.ext {
	"use strict";

	interface UserSelectItem extends FormItem {
		multiple: boolean;
		organId: number;
		withSubCompany: boolean;
	}

	export function setUserSelectApiPath(queryUserApi: string, listUserApi: string) {
		UserSelect.queryUserApi = queryUserApi;
		UserSelect.listUserApi = listUserApi;
	}

	class UserSelect extends BasicFormControl<DialogSelect, UserSelectItem> {
		static icon = "fa-user-circle-o";
		static desc = "用户";
		static order = 110;
		static queryUserApi: string = null;
		static listUserApi: string = null;

		private _searchBox: Input;
		private _list: List;
		private _dialogDiv: HTMLElement;

		private listTree() {
			var datasource = new tui.ds.RemoteTree();
			datasource.on("query", (e) => {
				var parentId = (e.data.parent === null ? null: e.data.parent.item.id);
				if (parentId === null) {
					parentId = this.define.organId;
				}
				ajax.post_(UserSelect.listUserApi, {
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

		private queryUser() {
			var query = {
				keyword: this._searchBox.get("value"),
				organId: this.define.organId,
				withSubCompany: !!this.define.withSubCompany
			}
			ajax.post(UserSelect.queryUserApi, query).done((result) => {
				this._list.set("activeRow", null);
				this._list.set("list", result);
			}).fail(() => {
				this._list.set("list", []);
			});
		}

		constructor(form: Form, define: UserSelectItem) {
			super(form, define, "dialog-select");
			this._widget.set("iconRight", "fa-user");
			this._searchBox = <Input>create("input");
			this._searchBox._set("iconLeft", "fa-search");
			this._searchBox._set("clearable", true);
			this._searchBox._set("placeholder", "搜索用户");
			this._list = <List>create("list");
			this._list._set("rowTooltipKey", "positions");
			this._list._set("nameKey", "displayName");
			this._dialogDiv = elem("div");
			this._dialogDiv.className = "cnooc-user-select-div";
			this._dialogDiv.appendChild(this._searchBox._);
			this._dialogDiv.appendChild(this._list._);

			// this._widget.on("change", (e) => {
			// 	this.define.value = this.getValue();
			// 	form.fire("itemvaluechanged", {control: this});
			// });
			this._widget._set("title", "选择用户");
			this._widget._set("content", this._dialogDiv);
			this._searchBox.on("enter clear", () => {
				if (this._searchBox.get("value")) {
					this.queryUser();
				} else {
					this.listTree();
				}
			});
			this._widget.on("open", () => {
				this._searchBox.set("value", "");
				this.listTree();
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
						values.push({account: checkedItems[i].account, name: checkedItems[i].name});
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
						tui.msgbox("请选择一个用户！");
						return false;
					} else if (row.type !== "user") {
						tui.msgbox("请选择一个用户！");
						return false;
					} else {
						this.define.value = {account: row.account, name: row.name};
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
						if (item && item.account && item.name) {
							items.push({account: item.account, name: item.name});
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
				if (value && value.account && value.name) {
					this.define.value = {account: value.account, name: value.name};
					this._widget.set("text", value.name);
				} else {
					this.define.value = null;
					this._widget.set("text", "");
				}
			}
			this.form.fire("itemvaluechanged", {control: this});
		}

		getProperties(): PropertyPage[] {
			return [{
				name: "用户",
				properties: [
					{
						"type": "options",
						"key": "multiple",
						"label": "多选",
						"value": this.define.multiple ? true : false,
						"options": [{"data": [
							{"value": true, "text": "是"},
							{"value": false, "text": "否"}
						]}],
						"atMost": 1,
						"size": 2
					}
				]
			}];
		}
		
		setProperties(properties: any[]) {
			var values = properties[1];
			this.define.multiple = !!values.multiple;
		}

		validate(): boolean {
			return this._widget.validate();
		}
	}

	Form.register("cnooc-user", UserSelect);
}