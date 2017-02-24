/// <reference path="../../dist/tui2.d.ts" />

module tui.widget.ext {
	"use strict";

	var _mapInit = false;
	var _mapLoaded = false;
	var _initFunctions: {context:any, func:Function}[] = [];

	/**
	 * 
	 */
	export class Location extends Widget implements Validatable {

		//e8f7d3075fc92aea2cb27947ce567763
		protected initRestriction(): void {
			super.initRestriction();
			var input = create("input");
			this._components["input"] = input._;
			this.setRestrictions({
				"value": {
					"set": (value: any) => {
						input.set("value", value);
					},
					"get": (): any => {
						return input.get("value");
					}
				},
				"validate": {
					"set": (value: any) => {
						input.set("validate", value);
					},
					"get": (): any => {
						return input.get("validate");
					}
				}
			});
		}


		protected initChildren(childNodes: Node[]) {
			var input = get(this._components["input"]);
			input._set("validate", InputBase.parseValidators(childNodes));
		}

		private initMap() {
			var mapDiv = this._components["map"];
			var map = new (<any>window).AMap.Map(mapDiv,{
				zoom: 10,
				center: [116.39,39.9]
			});
		}

		protected init() {
			if (!_mapInit) {
				_mapInit = true;
				let schema = "http";
				if (/^https:\/\/.+/i.test(location.href))
					schema = "https";
				let mapUrl = schema + "://webapi.amap.com/maps?v=1.3&key=" + this.get("appKey");
				$.getScript(mapUrl, () => {
					_mapLoaded = true;
					for (let initDef of _initFunctions) {
						initDef.func.call(initDef.context);
					}
				});
			}
			var mapDiv = this._components["map"] = document.createElement("div");
			mapDiv.className = "tui-map-container";
			var input = get(this._components["input"]);
			input.appendTo(this._);
			this.setInit("popup", true);

			if (_mapLoaded) {
				this.initMap();
			} else {
				_initFunctions.push({context:this, func:this.initMap});
			}
			

			input.on("right-icon-mousedown", () => {
				var dlg = <Dialog>create("dialog");
				dlg.setContent(mapDiv);
				dlg.open();
			});
		}

		reset(): void {
			var input = <Input>get(this._components["input"]);
			input.reset();
		}
		updateEmptyState(empty: boolean): void {
			var input = <Input>get(this._components["input"]);
			input.updateEmptyState(empty);
		}
		validate(e?: JQueryEventObject): boolean {
			var input = <Input>get(this._components["input"]);
			return input.validate(e);
		}

		render() {
			var input = get(this._components["input"]);
			if (this.get("popup")) {
				input.set("iconRight", "fa-map-marker");
			} else {
				input.set("iconRight", null);
			}

		}

	}

	register(Location, "location");
}