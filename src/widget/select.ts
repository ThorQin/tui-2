/// <reference path="selectBase.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <tui:select>
	 * Attributes: data, list, tree, multiSelect, checkKey, nameKey, 
	 * iconKey, valueKey
	 * Method: openSelect
	 * Events: change
	 */
	export class Select extends SelectBase {
		
		protected initRestriction(): void {
			var list = create(List);
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
				}
			});
		}
		
		private changeSize() {
			var list = <List>get(this._components["list"]);
			var count = <number>list.get("data").length();
			if (count > 8)
				count = 8;
			list._.style.height = count * 30 + "px";
		};
		
		private updateTextByValue(list: List) {
			var nameKey = this.get("nameKey");
			var valueKey = this.get("valueKey");
			var val = this.get("value");
			if (val === null)
				this._set("text", null);
			if (!this.get("multiSelect")) {
				let text: string = null;
				list.iterate(function(item: any, path: number[]): boolean {
					if (item[valueKey] === val) {
						text = item[nameKey];
						return false;
					}
					return true;
				});
				this._set("text", text);
			} else {
				if (!(val instanceof Array))
					val = [val];
				let text: string[] = [];
				list.iterate(function(item: any, path: number[]): boolean {
					if (val.indexOf(item[valueKey]) >= 0) {
						text.push(item[nameKey]);
					}
					return true;
				});
				this._set("text", text.join(", "));
			}
		}
		
		protected init(): void {
			super.init();
			this.setInit("iconRight", "fa-caret-down");
			var list = <List>get(this._components["list"]);
			
			var container = document.createElement("div"); 
			var toolbar = <HTMLElement>container.appendChild(document.createElement("div"));
			toolbar.className = "tui-select-toolbar";
			container.insertBefore(list._, container.firstChild);
			
			
			var popup = <Popup>get(this._components["popup"]);
			popup._set("content", container);
			
			this._components["toolbar"] = <HTMLElement>toolbar;
			list._.style.width = "inherit";
			list._.style.display = "block";
			list._.style.borderWidth = "0";
			list.on("expand collapse", () => {
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
					}
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
				} else if (name === "clear") {
					// this._set("text", null);
					this.set("value", null);
					this.fire("change", {e:e, value: this.get("value"), text: this.get("text")});
					this.closeSelect();
					this._.focus();
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
				list._.focus();
				list.render();
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
}