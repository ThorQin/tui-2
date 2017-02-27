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

		private _geocoder: any;

		static initApi() {
			_mapLoaded = true;
			for (let initDef of _initFunctions) {
				initDef.func.call(initDef.context);
			}
		}

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
			var address = this._components["address"];
			var map = new (<any>window).AMap.Map(mapDiv,{
				zoom: 10,
				center: [116.39,39.9]
			});

			(<any>window).AMap.service('AMap.Geocoder',() => {
				this._geocoder = new (<any>window).AMap.Geocoder();
			});

			map.plugin('AMap.Geolocation', function () {
				var geolocation = new (<any>window).AMap.Geolocation({
					enableHighAccuracy: false,//是否使用高精度定位，默认:true
					timeout: 5000,          //超过10秒后停止定位，默认：无穷大
					maximumAge: 0,           //定位结果缓存0毫秒，默认：0
					convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
					showButton: true,        //显示定位按钮，默认：true
					buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
					buttonOffset: new (<any>window).AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
					showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
					showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
					panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
					zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
				});
				map.addControl(geolocation);
				(<any>window).AMap.event.addListener(geolocation, 'complete', (e) => {
					
				});//返回定位信息
				(<any>window).AMap.event.addListener(geolocation, 'error', (e) => {
					tui.errbox(tui.str("geo.location.failed"))
				});//返回定位出错信息
			});

			map.on('click', (e) => {
				$(address).text(tui.str("Locating..."));
				this._geocoder && this._geocoder.getAddress(e.lnglat, function(status, result) {
					if (status === 'complete' && result.info === 'OK') {
						$(address).text(result.regeocode.formattedAddress);
						map.clearMap();
						new (<any>window).AMap.Marker({
							position : e.lnglat,
							map : map
						});
					} else{
						$(address).text(tui.str("error"));
					}
				});
			});
		}

		protected init() {
			if (!_mapInit) {
				_mapInit = true;
				let mapUrl = "https://webapi.amap.com/maps?v=1.3&key=" + this.get("appKey") + "&callback=tui_widget_ext_Location_initApi";
				$.getScript(mapUrl);
			}
			var dialogContent = this._components["content"] = document.createElement("div");
			dialogContent.className = "tui-map-content";
			
			var address = this._components["address"] = document.createElement("div");
			address.className = "tui-map-address";
			dialogContent.appendChild(address);

			var mapDiv = this._components["map"] = document.createElement("div");
			mapDiv.className = "tui-map-container";
			dialogContent.appendChild(mapDiv);

			var input = get(this._components["input"]);
			input.set("iconRight", "fa-map-marker");
			input.appendTo(this._);

			if (_mapLoaded) {
				this.initMap();
			} else {
				_initFunctions.push({context:this, func:this.initMap});
			}
			

			input.on("right-icon-mousedown", () => {
				var dlg = <Dialog>create("dialog");
				dlg._set("title", tui.str("address"));
				dlg.setContent(dialogContent);
				dlg.open("ok#tui-primary");
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

		render() {}

	}

	register(Location, "location");
}

function tui_widget_ext_Location_initApi() {
	tui.widget.ext.Location.initApi();
}
