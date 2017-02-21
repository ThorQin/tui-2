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
            var Picture = (function (_super) {
                __extends(Picture, _super);
                function Picture() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Picture.prototype.initRestriction = function () {
                    var _this = this;
                    _super.prototype.initRestriction.call(this);
                    this._uploader = tui.browser.createUploader(this._);
                    this.setRestrictions({
                        "action": {
                            "set": function (value) {
                                _this._uploader.getOptions().action = value;
                            },
                            "get": function () {
                                return _this._uploader.getOptions().action;
                            }
                        },
                        "accept": {
                            "set": function (value) {
                                _this._uploader.getOptions().accept = value;
                                if (_this._uploader.getInput()) {
                                    _this._uploader.deleteInput();
                                    _this._uploader.createInput();
                                }
                            },
                            "get": function () {
                                return _this._uploader.getOptions().accept;
                            }
                        },
                        "value": {
                            "set": function (value) {
                                _this._data["value"] = value;
                                if (value === null || typeof value === tui.UNDEFINED) {
                                    _this._set("url", "");
                                }
                            }
                        }
                    });
                };
                Picture.prototype.init = function () {
                    var _this = this;
                    var img = this._components["image"] = document.createElement("img");
                    this._.appendChild(img);
                    this._uploader.on("success", function (e) {
                        _this._set("value", e.data.response.fileId);
                        _this.set("url", e.data.response.url);
                    });
                    this._uploader.on("error", function (e) {
                        tui.errbox(e.data.response.error, tui.str("Error"));
                    });
                };
                Picture.prototype.render = function () {
                    var $root = $(this._);
                    if (this.get("disable")) {
                        this._uploader.deleteInput();
                        this._.setAttribute("tabIndex", "0");
                    }
                    else {
                        this._uploader.createInput();
                        this._.removeAttribute("tabIndex");
                    }
                    var url = this.get("url");
                    var img = this._components["image"];
                    if (url) {
                        img.setAttribute("src", url);
                        $root.removeClass("tui-picture-empty");
                    }
                    else {
                        $root.addClass("tui-picture-empty");
                    }
                };
                return Picture;
            }(widget.Widget));
            ext.Picture = Picture;
            widget.register(Picture, "picture");
        })(ext = widget.ext || (widget.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
