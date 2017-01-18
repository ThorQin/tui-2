/// <reference path="selectBase.ts" />
/// <reference path="dialog.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <tui:select>
	 * Attributes: data, list, tree, multiSelect, checkKey, nameKey, canSearch, search 
	 * iconKey, valueKey
	 * Method: openSelect
	 * Events: change, click
	 */
	export class Select extends SelectPopupBase {

		private static LIST_LINE_HEIGHT = 28;
		
		protected initRestriction(): void {
			var list = create(List);
			list._set("noMouseWheel", true);
			list.set("lineHeight", Select.LIST_LINE_HEIGHT);
			this._components["list"] = list._;
			super.initRestriction();
			this.setRestrictions({
				"value": {
					"set":  (value: any) => {
						this._data["value"] = value;
						this.updateTextByValue(<List>list);
					}
				},
				"data": {
					"set": (value: any) => {
						list._set("data", value);
						this.updateTextByValue(<List>list);
					},
					"get": (): any => {
						return list.get("data");
					}
				},
				"list": {
					"set": (value: any) => {
						list._set("list", value);
						this.updateTextByValue(<List>list);
					},
					"get": (): any => {
						return list.get("list");
					}
				},
				"tree": {
					"set": (value: any) => {
						list._set("tree", value);
						this.updateTextByValue(<List>list);
					},
					"get": (): any => {
						return list.get("tree");
					}
				},
				"activeRow": {
					"set": (value: any) => {
						list.set("activeRow", value);
						this.updateTextByValue(<List>list);
					},
					"get": (): any => {
						return list.get("activeRow");
					}
				},
				"selection": {
					"set": (value: any) => {},
					"get": (): any => {
						return this.getSelection(<List>list);
					}
				},
				"activeRowData": {
					"set": (value: any) => {},
					"get": (): any => {
						return list.get("activeRowData");
					}
				},
				"multiSelect": {
					"set": (value: any) => {
						list._set("checkable", value);
					},
					"get": (): any => {
						return list.get("checkable");
					}
				},
				"checkKey": {
					"set": (value: any) => {
						list._set("checkKey", value);
					},
					"get": () => {
						return list.get("checkKey");
					}
				},
				"nameKey": {
					"set": (value: any) => {
						list._set("nameKey", value);
					},
					"get": () => {
						return list.get("nameKey");
					}
				},
				"iconKey": {
					"set": (value: any) => {
						list._set("iconKey", value);
					},
					"get": () => {
						return list.get("iconKey");
					}
				},
				"valueKey": {
					"set": (value: any) => {
						list._set("valueKey", value);
					},
					"get": () => {
						return list.get("valueKey");
					}
				},
				"showCount": {
					"get": () => {
						var count = this._data["showCount"];
						if (typeof count === "number" && !isNaN(count))
							return count;
						else
							return 8;
					}
				},
				"canSearch": {
					"get": () => {
						var value = this._data["canSearch"];
						if (typeof value === tui.UNDEFINED || value === null)
							return false;
						else
							return !!value;
					},
					"set": (value: any) => {
						this._data["canSearch"] = !!value;
					}
				}
			});
		}
		
		private changeSize() {
			var list = <List>get(this._components["list"]);
			var popup = <Popup>get(this._components["popup"]);
			var count = <number>list.get("data").length();
			if (count > <number>this.get("showCount"))
				count = <number>this.get("showCount");
			list._.style.height = count * Select.LIST_LINE_HEIGHT + "px";
			popup.render();
		};

		private getSelection(list: List): any {
			var textKey = this.get("textKey");
			if (textKey === null)
				textKey = this.get("nameKey");
			var valueKey = this.get("valueKey");
			var val = this.get("value");
			if (val === null)
				return null;
			if (!this.get("multiSelect")) {
				let selectedItem: any = null;
				list.iterate(function(item: any, path: number[], treeNode: boolean): boolean {
					let nodeValue = item[valueKey]; 
					if (nodeValue === val) {
						selectedItem = item;
						return false;
					}
					return true;
				});
				return selectedItem;
			} else {
				if (!(val instanceof Array))
					val = [val];
				let selectedItems: any[] = [];
				list.iterate(function(item: any, path: number[], treeNode: boolean): boolean {
					let nodeValue = item[valueKey]; 
					if (val.indexOf(nodeValue) >= 0) {
						selectedItems.push(item);
					}
					return true;
				});
				return selectedItems;
			}
		}
		
		private updateTextByValue(list: List) {
			var textKey = this.get("textKey");
			if (textKey === null)
				textKey = this.get("nameKey");
			var selected = this.getSelection(list);
			if (selected == null)
				this._set("text", null);
			else if (selected instanceof Array)
				this._set("text", selected.reduce(
					function(s: string, v: any, i: number){ 
						return i > 0 ? s + ", " + v[textKey] : v[textKey]; 
					}, "")
				);
			else
				this._set("text", selected[textKey]);
		}
		
		protected init(): void {
			super.init();
			this.setInit("iconRight", "fa-caret-down");
			var list = <List>get(this._components["list"]);
			
			var container = document.createElement("div"); 
			var searchbar = <HTMLElement>container.appendChild(document.createElement("div"));
			searchbar.className = "tui-select-searchbar";
			var searchBox = create(Input);
			searchBox._set("clearable", true);
			searchBox._set("iconLeft", "fa-search");
			searchbar.appendChild(searchBox._);
			container.appendChild(list._);
			var toolbar = <HTMLElement>container.appendChild(document.createElement("div"));
			toolbar.className = "tui-select-toolbar";
			
			var popup = <Popup>get(this._components["popup"]);
			popup._set("content", container);
			
			this._components["searchbar"] = <HTMLElement>searchbar;
			this._components["toolbar"] = <HTMLElement>toolbar;
			this._components["searchBox"] = searchBox._;
			list._.style.width = "inherit";
			list._.style.display = "block";
			list._.style.borderWidth = "0";
			list.on("expand collapse update", () => {
				this.changeSize();
			});
			list.on("rowclick keyselect", (e) => {
				var rowData = list.get("activeRowData");
				if (!this.get("multiSelect")) {
					var item: any;
					if (list.get("dataType") === "tree")
						item = rowData.item;
					else
						item = rowData;
					// this._set("text", item[list.get("nameKey")]);
					this.set("value", item[list.get("valueKey")]);
					this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
					if (e.event === "rowclick") {
						this.closeSelect();
						this._.focus();
						this.fire("click", {e:e, value: this.get("value"), text: this.get("text")});
					}
				}
			});
			searchBox.on("enter change", (e) => {
				let searchValue = searchBox.get("value");
				if (searchValue == null || searchValue.length == 0) {
					list.get("data").setFilter(null);
				} else {
					list.get("data").setFilter([{
						key: this.get("nameKey"),
						value: searchValue
					}]);
				}
				list._set("activeRow", null);
				list.scrollTo(0);
				if (!this.get("multiSelect") && this.get("value") !== null) {
					list.activeTo(this.get("valueKey"), this.get("value"));
				}
			});
			$(toolbar).click((e)=>{
				var obj = <HTMLElement>(e.target || e.srcElement);
				var name = obj.getAttribute("name");
				if (name === "selectAll") {
					list.selectAll();
				} else if (name === "deselectAll") {
					list.deselectAll();
				} else if (name === "ok") {
					this.set("value", list.get("checkedValues"));
					// this.set("text", list.get("checkedNames").join(", "));
					this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
					this.closeSelect();
					this._.focus();
					this.fire("click", {e:e, value: this.get("value"), text: this.get("text")});
				} else if (name === "clear") {
					// this._set("text", null);
					this.set("value", null);
					this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
					this.closeSelect();
					this._.focus();
					this.fire("click", {e:e, value: this.get("value"), text: this.get("text")});
				}
			});
			
		}
		
		openSelect() {
			var list = <List>get(this._components["list"]);
			var popup = <Popup>get(this._components["popup"]);
			var minWidth = this._.offsetWidth - 2;
			
			if (minWidth < 250)
				minWidth = 250
			popup._.style.minWidth = minWidth + "px";
			//popup._set("content", list._);
			var toolbar = this._components["toolbar"];
			var searchbar = this._components["searchbar"];
			var searchBox = get(this._components["searchBox"]);
			if (this.get("canSearch")) {
				searchbar.style.display = "block";
			} else
				searchbar.style.display = "none";
			var checkButtons = "<a name='selectAll'>" + tui.str("Select all") + "</a> | " +
				"<a name='deselectAll'>" + tui.str("Deselect all") + 
				"</a> | <a name='ok'><i class='fa fa-check'></i> " + tui.str("OK") + "</a>";
			var clearButton = "<a name='clear'><i class='fa fa-trash-o'></i> " + tui.str("Clear") + "</a>";
			var multiSelect = this.get("multiSelect");
			var clearable = !multiSelect && this.get("clearable");
			
			toolbar.style.display = "";
			if (multiSelect)
				toolbar.innerHTML = checkButtons;
			else if (clearable)
				toolbar.innerHTML = clearButton;
			else 
				toolbar.style.display = "none";
			
			popup.open(this._);
			
			setTimeout(() => {
				if (this.get("canSearch"))
					searchBox.render();
				list._.focus();
				list.render();
				if (tui.ieVer > 0 && tui.ieVer <= 9) {
					// FIX ie bug.
					setTimeout(()=>{
						list.render();
					});
				}
				if (!this.get("multiSelect")) {
					if (this.get("value") !== null) { 
						list.activeTo(this.get("valueKey"), this.get("value"));
					} else {
						list._set("activeRow", null);
						list.scrollTo(0);
					}
				} else {
					var value = this.get("value");
					list.set("checkedValues", value);
				}
				this.changeSize();
			});
			
		}
	}
	
	register(Select);

	export class DialogSelect extends SelectBase {
		private dialog: Dialog;
		private content: HTMLElement;
		openSelect(): void {
			this.fire("open", this.dialog);
			this.dialog.open("ok#tui-primary");
		} 
		protected initChildren(childNodes: Node[]) {
			super.initChildren(childNodes);
			this.dialog = <Dialog>create(Dialog);
			this.content = document.createElement("div");
			childNodes.forEach(n => {
				if (getFullName(n) !== "tui:verify")
					this.content.appendChild(n);
			});
			this.dialog.setContent(this.content);
			init(this.content);
		}

		protected createPopup(): any {
			this.dialog.on("btnclick", () => {
				this.fire("close");
				this.dialog.close();
			});
			return this.dialog;
		}
		protected init(): void {
			
			super.init();
			this.setInit("iconRight", "fa-pencil");
		}
	}
	register(DialogSelect);

}
