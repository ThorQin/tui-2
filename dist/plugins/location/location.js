var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
                Location.prototype.initRestriction = function () {
                    _super.prototype.initRestriction.call(this);
                    this._selectedAddress = null;
                    this._map = null;
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
                        },
                        "autoValidate": {
                            "set": function (value) {
                                input.set("autoValidate", value);
                            },
                            "get": function () {
                                return input.get("autoValidate");
                            }
                        },
                        "clearable": {
                            "set": function (value) {
                                input.set("clearable", value);
                            },
                            "get": function () {
                                return input.get("clearable");
                            }
                        },
                        "placeholder": {
                            "set": function (value) {
                                input.set("placeholder", value);
                            },
                            "get": function () {
                                return input.get("placeholder");
                            }
                        },
                        "text": {
                            "set": function (value) {
                                input.set("text", value);
                            },
                            "get": function () {
                                return input.get("text");
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
                    this._map = map;
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
                            zoomToAccuracy: true
                        });
                        map.addControl(geolocation);
                        window.AMap.event.addListener(geolocation, 'complete', function (e) {
                        });
                        window.AMap.event.addListener(geolocation, 'error', function (e) {
                            tui.errbox(tui.str("geo.location.failed"));
                        });
                    });
                    map.on('click', function (e) {
                        $(address).text(tui.str("Locating..."));
                        _this._geocoder && _this._geocoder.getAddress(e.lnglat, function (status, result) {
                            if (status === 'complete' && result.info === 'OK') {
                                $(address).text(result.regeocode.formattedAddress);
                                _this._selectedAddress = result.regeocode.formattedAddress;
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
                    var _this = this;
                    this.setInit("appKey", "e8f7d3075fc92aea2cb27947ce567763");
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
                        var inputValue = input.get("value");
                        if (inputValue) {
                            if (inputValue != _this._selectedAddress) {
                                _this._geocoder && _this._geocoder.getLocation(inputValue, function (status, result) {
                                    if (status === 'complete' && result.info === 'OK') {
                                        $(address).text(inputValue);
                                        _this._selectedAddress = inputValue;
                                        _this._map.clearMap();
                                        new window.AMap.Marker({
                                            position: result.geocodes[0].location,
                                            map: _this._map
                                        });
                                        _this._map.setCenter(result.geocodes[0].location);
                                    }
                                    else {
                                        $(address).text(inputValue);
                                        _this._selectedAddress = inputValue;
                                    }
                                });
                            }
                        }
                        else {
                            _this._map.clearMap();
                            $(address).text("");
                            _this._selectedAddress = null;
                        }
                        dlg.on("btnclick", function () {
                            if (_this._selectedAddress) {
                                input.set("value", _this._selectedAddress);
                                _this.fire("change", { value: _this._selectedAddress });
                                dlg.close();
                            }
                            else {
                                tui.msgbox(tui.str("please.select.point"));
                            }
                        });
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
            var FormAddress = (function (_super) {
                __extends(FormAddress, _super);
                function FormAddress(form, define) {
                    return _super.call(this, form, define, "location", tui.str("picture")) || this;
                }
                FormAddress.prototype.showProperty = function () {
                    throw new Error('Method not implemented.');
                };
                FormAddress.prototype.validate = function () {
                    return true;
                };
                return FormAddress;
            }(widget.BasicFormControl));
            widget.Form.register("address", FormAddress);
        })(ext = widget.ext || (widget.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
function tui_widget_ext_Location_initApi() {
    tui.widget.ext.Location.initApi();
}