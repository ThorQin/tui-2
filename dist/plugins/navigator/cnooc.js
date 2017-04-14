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
            var UserSelect = (function (_super) {
                __extends(UserSelect, _super);
                function UserSelect(form, define) {
                    var _this = _super.call(this, form, define, "dialog-select") || this;
                    _this._searchBox = widget.create("input");
                    _this._list = widget.create("list");
                    _this._list._set("iconLeft", "fa-search");
                    _this._list._set("placeholder", "搜索用户");
                    _this._dialogDiv = tui.elem("div");
                    _this._dialogDiv.appendChild(_this._searchBox._);
                    _this._dialogDiv.appendChild(_this._list._);
                    _this._widget.on("change", function (e) {
                        _this.define.value = _this.getValue();
                        form.fire("itemvaluechanged", { control: _this });
                    });
                    _this._widget.on("right-icon-mousedown", function () {
                        var dlg = widget.create("dialog");
                        dlg._set("title", "选择用户");
                        dlg.setContent(_this._dialogDiv);
                        dlg.open("ok#tui-primary");
                        dlg.on("btnclick", function () {
                        });
                    });
                    return _this;
                }
                UserSelect.prototype.update = function () {
                    _super.prototype.update.call(this);
                    if (this.define.required)
                        this._widget._set("clearable", false);
                    else
                        this._widget._set("clearable", true);
                };
                UserSelect.prototype.getProperties = function () {
                    return [{
                            name: "用户",
                            properties: [
                                {
                                    "type": "options",
                                    "key": "multiple",
                                    "label": "多选",
                                    "value": this.define.multiple ? true : false,
                                    "options": [{ "data": [
                                                { "value": true, "text": "是" },
                                                { "value": false, "text": "否" }
                                            ] }],
                                    "size": 2
                                }
                            ]
                        }];
                };
                UserSelect.prototype.setProperties = function (properties) {
                    var values = properties[1];
                    this.define.multiple = !!values.multiple;
                };
                UserSelect.prototype.validate = function () {
                    return this._widget.validate();
                };
                return UserSelect;
            }(widget.BasicFormControl));
            UserSelect.icon = "fa-user-circle-o";
            UserSelect.desc = "用户";
            UserSelect.order = 110;
        })(ext = widget.ext || (widget.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
