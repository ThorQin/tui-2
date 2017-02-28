var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../dist/tui2.d.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget_1) {
        var ext;
        (function (ext) {
            "use strict";
            var _initProc = {};
            var Form = (function (_super) {
                __extends(Form, _super);
                function Form() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Form.register = function (type, controlHandler) {
                    _initProc[type] = controlHandler;
                };
                Form.prototype.initRestriction = function () {
                    var _this = this;
                    _super.prototype.initRestriction.call(this);
                    this._definitionChanged = false;
                    this._itemDivs = [];
                    this.setRestrictions({
                        "definition": {
                            "set": function (value) {
                                if (value instanceof Array || value === null) {
                                    _this._data["definition"] = value;
                                    _this._definitionChanged = true;
                                }
                            }
                        },
                        "value": {
                            "set": function (value) {
                                var d = _this._data["definition"];
                                if (d) {
                                    for (var _i = 0, d_1 = d; _i < d_1.length; _i++) {
                                        var item = d_1[_i];
                                        if (item.key) {
                                            if (value) {
                                                if (value.hasOwnProperty(item.key))
                                                    item.value = value[item.key];
                                            }
                                            else if (value === null) {
                                                item.value = null;
                                            }
                                        }
                                    }
                                }
                            },
                            "get": function () {
                                var d = _this._data["definition"];
                                if (d) {
                                    var value = {};
                                    for (var _i = 0, d_2 = d; _i < d_2.length; _i++) {
                                        var item = d_2[_i];
                                        if (item.key) {
                                            value[item.key] = item.value;
                                        }
                                    }
                                    return value;
                                }
                                else
                                    return null;
                            }
                        }
                    });
                };
                Form.prototype.render = function () {
                    var definition = this.get("definition");
                    if (this._definitionChanged) {
                        this._.innerHTML = "";
                        this._itemDivs = [];
                    }
                    for (var i = 0; i < definition.length; i++) {
                        var item = definition[i];
                        var handler = _initProc[item.type];
                        var div = i < this._itemDivs.length ? this._itemDivs[i] : null;
                        if (div == null) {
                            div = document.createElement("div");
                            div.className = "tui-form-item-container";
                            this._itemDivs.push(div);
                            this._.appendChild(div);
                        }
                        if (handler) {
                            handler(this, div, item, this._definitionChanged);
                        }
                    }
                    if (this._definitionChanged) {
                        this._definitionChanged = false;
                    }
                };
                return Form;
            }(widget_1.Widget));
            ext.Form = Form;
            widget_1.register(Form, "form");
            function basicHandler(type, itemContainer, item, init) {
                var label;
                var widget;
                if (init) {
                    label = document.createElement("label");
                    itemContainer.appendChild(label);
                    widget = widget_1.create(type);
                    widget.appendTo(itemContainer);
                }
                if (item.label) {
                    $(label).text(item.label);
                    $(label).css("display", "block");
                }
                else
                    $(label).css("display", "none");
                if (item.validate)
                    widget._set("validate", item.validate);
                else
                    widget._set("validate", null);
                widget._set("value", item.value);
                widget._set("disable", !!item.disable);
                return {
                    label: label,
                    widget: widget
                };
            }
            Form.register("input", function (form, itemContainer, item, init) {
                var _a = basicHandler("input", itemContainer, item, init), label = _a.label, widget = _a.widget;
                widget.on("change input", function (e) {
                    item.value = widget.get("value");
                });
            });
            Form.register("date-picker", function (form, itemContainer, item, init) {
                var _a = basicHandler("date-picker", itemContainer, item, init), label = _a.label, widget = _a.widget;
                widget.on("click", function (e) {
                    item.value = widget.get("text");
                });
            });
            Form.register("select", function (form, itemContainer, item, init) {
                var _a = basicHandler("select", itemContainer, item, init), label = _a.label, widget = _a.widget;
                widget.on("change", function (e) {
                    item.value = widget.get("value");
                });
            });
        })(ext = widget_1.ext || (widget_1.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
