/// <reference path="../../dist/tui2.d.ts" />


module tui.widget.ext {
	"use strict";

	var _mapInit = false;
	var _mapLoaded = false;
	var _initFunctions: {context:any, func:Function}[] = [];


	export class Location extends Widget implements Validatable {

		private _geocoder: any;
		private _selectedAddress: string;
		private _map: any;

		static initApi() {
			_mapLoaded = true;
			for (let initDef of _initFunctions) {
				initDef.func.call(initDef.context);
			}
		}

		protected initRestriction(): void {
			super.initRestriction();
			this._selectedAddress = null;
			this._map = null;
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
				},
				"autoValidate": {
					"set": (value: any) => {
						input.set("autoValidate", value);
					},
					"get": (): any => {
						return input.get("autoValidate");
					}
				},
				"clearable": {
					"set": (value: any) => {
						input.set("clearable", value);
					},
					"get": (): any => {
						return input.get("clearable");
					}
				},
				"placeholder": {
					"set": (value: any) => {
						input.set("placeholder", value);
					},
					"get": (): any => {
						return input.get("placeholder");
					}
				},
				"text": {
					"set": (value: any) => {
						input.set("text", value);
					},
					"get": (): any => {
						return input.get("text");
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
			this._map = map;

			(<any>window).AMap.service('AMap.Geocoder',() => {
				this._geocoder = new (<any>window).AMap.Geocoder();
			});

			map.plugin('AMap.Geolocation', function () {
				var geolocation = new (<any>window).AMap.Geolocation({
					enableHighAccuracy: false,//是否使用高精度定位，默认:true
					timeout: 5000,           //超过10秒后停止定位，默认：无穷大
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
				(<any>window).AMap.event.addListener(geolocation, 'complete', (e:any) => {
					
				});//返回定位信息
				(<any>window).AMap.event.addListener(geolocation, 'error', (e:any) => {
					tui.errbox(tui.str("geo.location.failed"))
				});//返回定位出错信息
			});

			map.on('click', (e: any) => {
				$(address).text(tui.str("Locating..."));
				this._geocoder && this._geocoder.getAddress(e.lnglat, (status: any, result: any) => {
					if (status === 'complete' && result.info === 'OK') {
						$(address).text(result.regeocode.formattedAddress);
						this._selectedAddress = result.regeocode.formattedAddress;
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
			this.setInit("appKey", "e8f7d3075fc92aea2cb27947ce567763");
			if (!_mapInit) {
				_mapInit = true;
				let mapUrl = "https://webapi.amap.com/maps?v=1.3&key=" + this.get("appKey") + "&callback=tui_widget_ext_Location_initApi";
				$.getScript(mapUrl);
			}
			var dialogContent = this._components["content"] = elem("div");
			dialogContent.className = "tui-map-content";
			
			var address = this._components["address"] = elem("div");
			address.className = "tui-map-address";
			dialogContent.appendChild(address);

			var mapDiv = this._components["map"] = elem("div");
			mapDiv.className = "tui-map-container";
			dialogContent.appendChild(mapDiv);

			var input = <Input>get(this._components["input"]);
			input.set("iconRight", "fa-map-marker");
			input.appendTo(this._);

			if (_mapLoaded) {
				this.initMap();
			} else {
				_initFunctions.push({context:this, func:this.initMap});
			}
			
			input.on("change", (e) => {
				this.fire("change", e);
			});

			input.on("input", (e) => {
				this.fire("input", e);
			});

			input.on("enter", (e) => {
				this.fire("enter", e);
			});

			input.on("right-icon-mousedown", () => {
				var dlg = <Dialog>create("dialog");
				dlg._set("title", tui.str("address"));
				dlg.setContent(dialogContent);
				dlg.open("ok#tui-primary");

				var inputValue = input.get("value");
				if (inputValue) {
					if (inputValue != this._selectedAddress) {
						this._geocoder && this._geocoder.getLocation(inputValue, (status: any, result: any) => {
							if (status === 'complete' && result.info === 'OK') {
								$(address).text(inputValue);
								this._selectedAddress = inputValue;
								this._map.clearMap();
								new (<any>window).AMap.Marker({
									position : result.geocodes[0].location,
									map : this._map
								});
								this._map.setCenter(result.geocodes[0].location);
							} else{
								$(address).text(inputValue);
								this._selectedAddress = inputValue;
							}
						});
					}
				} else {
					this._map.clearMap();
					$(address).text("");
					this._selectedAddress = null;
				}

				dlg.on("btnclick", () => {
					if (this._selectedAddress) {
						input.reset();
						input.set("value", this._selectedAddress);
						this.fire("change");
						dlg.close();
					} else {
						tui.msgbox(tui.str("please.select.point"));
					}
				});
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

	interface AddressFormItem extends FormItem {
		validation?: {format: string, message: string}[];
		appKey?: string;
	}

	class FormAddress extends BasicFormControl<Location, AddressFormItem> {
		static icon = "fa-map-marker";
		static desc = "form.address";
		static order = 100;
		constructor(form: Form, define: AddressFormItem) {
			super(form, define, "location");
			this._widget.on("change", (e) => {
				this.define.value = this.getValue();
				form.fire("itemvaluechanged", {control: this});
			});
		}

		update() {
			super.update();
			this._widget._set("appKey", this.define.appKey);
			this._widget._set("clearable", true);
		}

		getProperties(): PropertyPage[] {
			return [{
				name: str("form.address"),
				properties: [
					{
						"type": "textbox",
						"key": "appKey",
						"label": str("form.app.key"),
						"value": this.define.appKey ? this.define.appKey + "" : null,
						"size": 2
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
									"*any", "*maxlen:<?>", "*minlen:<?>"
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
			this.define.appKey = values.appKey ? values.appKey : null;
			this.define.validation = values.validation;
		}
		onPropertyPageSwitch(pages: PropertyPage[], recentPage: number) {
			FormControl.detectRequiredByValidation(pages, recentPage);
		}
		validate(): boolean {
			return this._widget.validate();
		}
	}
	Form.register("address", FormAddress);
}

function tui_widget_ext_Location_initApi() {
	tui.widget.ext.Location.initApi();
}
