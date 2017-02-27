var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../dist/tui2.d.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        var ext;
        (function (ext) {
            "use strict";
            var _mapInit = false;
            var _mapLoaded = false;
            var _initFunctions = [];
            /**
             *
             */
            var Location = (function (_super) {
                __extends(Location, _super);
                function Location() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Location.initApi = function () {
                    _mapLoaded = true;
                    for (var _i = 0, _initFunctions_1 = _initFunctions; _i < _initFunctions_1.length; _i++) {
                        var initDef = _initFunctions_1[_i];
                        initDef.func.call(initDef.context);
                    }
                };
                //e8f7d3075fc92aea2cb27947ce567763
                Location.prototype.initRestriction = function () {
                    _super.prototype.initRestriction.call(this);
                    var input = widget.create("input");
                    this._components["input"] = input._;
                    this.setRestrictions({
                        "value": {
                            "set": function (value) {
                                input.set("value", value);
                            },
                            "get": function () {
                                return input.get("value");
                            }
                        },
                        "validate": {
                            "set": function (value) {
                                input.set("validate", value);
                            },
                            "get": function () {
                                return input.get("validate");
                            }
                        }
                    });
                };
                Location.prototype.initChildren = function (childNodes) {
                    var input = widget.get(this._components["input"]);
                    input._set("validate", widget.InputBase.parseValidators(childNodes));
                };
                Location.prototype.initMap = function () {
                    var _this = this;
                    var mapDiv = this._components["map"];
                    var address = this._components["address"];
                    var map = new window.AMap.Map(mapDiv, {
                        zoom: 10,
                        center: [116.39, 39.9]
                    });
                    window.AMap.service('AMap.Geocoder', function () {
                        _this._geocoder = new window.AMap.Geocoder();
                    });
                    map.plugin('AMap.Geolocation', function () {
                        var geolocation = new window.AMap.Geolocation({
                            enableHighAccuracy: false,
                            timeout: 5000,
                            maximumAge: 0,
                            convert: true,
                            showButton: true,
                            buttonPosition: 'LB',
                            buttonOffset: new window.AMap.Pixel(10, 20),
                            showMarker: true,
                            showCircle: true,
                            panToLocation: true,
                            zoomToAccuracy: true //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                        });
                        map.addControl(geolocation);
                        window.AMap.event.addListener(geolocation, 'complete', function (e) {
                        }); //返回定位信息
                        window.AMap.event.addListener(geolocation, 'error', function (e) {
                            tui.errbox("Get current location failed, please make sure your browser has permission to use geo-location service.");
                        }); //返回定位出错信息
                    });
                    map.on('click', function (e) {
                        $(address).text(tui.str("Locating..."));
                        _this._geocoder && _this._geocoder.getAddress(e.lnglat, function (status, result) {
                            if (status === 'complete' && result.info === 'OK') {
                                $(address).text(result.regeocode.formattedAddress);
                                map.clearMap();
                                new window.AMap.Marker({
                                    position: e.lnglat,
                                    map: map
                                });
                            }
                            else {
                                $(address).text(tui.str("error"));
                            }
                        });
                    });
                };
                Location.prototype.init = function () {
                    if (!_mapInit) {
                        _mapInit = true;
                        var mapUrl = "https://webapi.amap.com/maps?v=1.3&key=" + this.get("appKey") + "&callback=tui_widget_ext_Location_initApi";
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
                    var input = widget.get(this._components["input"]);
                    input.set("iconRight", "fa-map-marker");
                    input.appendTo(this._);
                    if (_mapLoaded) {
                        this.initMap();
                    }
                    else {
                        _initFunctions.push({ context: this, func: this.initMap });
                    }
                    input.on("right-icon-mousedown", function () {
                        var dlg = widget.create("dialog");
                        dlg._set("title", tui.str("address"));
                        dlg.setContent(dialogContent);
                        dlg.open("ok#tui-primary");
                    });
                };
                Location.prototype.reset = function () {
                    var input = widget.get(this._components["input"]);
                    input.reset();
                };
                Location.prototype.updateEmptyState = function (empty) {
                    var input = widget.get(this._components["input"]);
                    input.updateEmptyState(empty);
                };
                Location.prototype.validate = function (e) {
                    var input = widget.get(this._components["input"]);
                    return input.validate(e);
                };
                Location.prototype.render = function () { };
                return Location;
            }(widget.Widget));
            ext.Location = Location;
            widget.register(Location, "location");
        })(ext = widget.ext || (widget.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
function tui_widget_ext_Location_initApi() {
    tui.widget.ext.Location.initApi();
}
