/// <reference path="selectBase.ts" />
module tui.widget {
	"use strict";
	
	export class Select extends SelectBase {
		
		protected initRestriction(): void {
			var list = create(List);
			this._components["list"] = list._;
			super.initRestriction();
			this.setRestrictions({
				"data": {
					"set": (value: any) => {
						list._set("data", value);
					},
					"get": (): any => {
						return list.get("data");
					}
				},
				"list": {
					"set": (value: any) => {
						list._set("list", value);
					},
					"get": (): any => {
						return list.get("list");
					}
				},
				"tree": {
					"set": (value: any) => {
						list._set("tree", value);
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
			});
		}
		
		private changeSize = () => {
			var list = <List>get(this._components["list"]);
			var count = <number>list.get("data").length();
			if (count > 8)
				count = 8;
			list._.style.height = count * 30 + "px";
		};
		
		protected init(): void {
			super.init();
			this.setInit("valueKey", "value");
			this.setInit("iconRight", "fa-caret-down");
			var list = <List>get(this._components["list"]);
			list._.style.width = "inherit";
			list._.style.display = "block";
			list._.style.borderWidth = "0";
			list.on("expand collapse", () => {
				this.changeSize();
			});
			list.on("rowclick", (e) => {
				var rowData = list.get("activeRowData");
				if (!this.get("multiSelect")) {
					var item: any;
					if (list.get("dataType") === "tree")
						item = rowData.item;
					else
						item = rowData;
					this.set("text", item[list.get("nameKey")]);
					this.set("value", item[this.get("valueKey")]);
					this.closeSelect();
					this._.focus();
				}
			});
		}
		
		openSelect() {
			var list = <List>get(this._components["list"]);
			var popup = <Popup>get(this._components["popup"]);
			var minWidth = this._.offsetWidth;
			this.changeSize();
			if (minWidth < 250)
				minWidth = 250
			popup._.style.minWidth = minWidth + "px"; 
			popup.set("content", list._);
			list.activeRowBy(this.get("valueKey"), this.get("value"));
			popup.open(this._);
			setTimeout(function () {
				list._.focus();
				list.render();
			});
			
		}
	}
	
	
	register(Select);
}