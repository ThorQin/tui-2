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
                    var mapDiv = this._components["map"];
                    var map = new window.AMap.Map(mapDiv, {
                        zoom: 10,
                        center: [116.39, 39.9]
                    });
                };
                Location.prototype.init = function () {
                    if (!_mapInit) {
                        _mapInit = true;
                        var schema = "http";
                        if (/^https:\/\/.+/i.test(location.href))
                            schema = "https";
                        var mapUrl = schema + "://webapi.amap.com/maps?v=1.3&key=" + this.get("appKey");
                        $.getScript(mapUrl, function () {
                            _mapLoaded = true;
                            for (var _i = 0, _initFunctions_1 = _initFunctions; _i < _initFunctions_1.length; _i++) {
                                var initDef = _initFunctions_1[_i];
                                initDef.func.call(initDef.context);
                            }
                        });
                    }
                    var mapDiv = this._components["map"] = document.createElement("div");
                    mapDiv.className = "tui-map-container";
                    var input = widget.get(this._components["input"]);
                    input.appendTo(this._);
                    this.setInit("popup", true);
                    if (_mapLoaded) {
                        this.initMap();
                    }
                    else {
                        _initFunctions.push({ context: this, func: this.initMap });
                    }
                    input.on("right-icon-mousedown", function () {
                        var dlg = widget.create("dialog");
                        dlg.setContent(mapDiv);
                        dlg.open();
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
                Location.prototype.render = function () {
                    var input = widget.get(this._components["input"]);
                    if (this.get("popup")) {
                        input.set("iconRight", "fa-map-marker");
                    }
                    else {
                        input.set("iconRight", null);
                    }
                };
                return Location;
            }(widget.Widget));
            ext.Location = Location;
            widget.register(Location, "location");
        })(ext = widget.ext || (widget.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
