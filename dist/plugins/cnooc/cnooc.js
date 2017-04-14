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
            function setUserSelectApiPath(queryUserApi, listUserApi) {
                UserSelect.queryUserApi = queryUserApi;
                UserSelect.listUserApi = listUserApi;
            }
            ext.setUserSelectApiPath = setUserSelectApiPath;
            var UserSelect = (function (_super) {
                __extends(UserSelect, _super);
                function UserSelect(form, define) {
                    var _this = _super.call(this, form, define, "dialog-select") || this;
                    _this._widget.set("iconRight", "fa-user");
                    _this._searchBox = widget.create("input");
                    _this._searchBox._set("iconLeft", "fa-search");
                    _this._searchBox._set("clearable", true);
                    _this._searchBox._set("placeholder", "搜索用户");
                    _this._list = widget.create("list");
                    _this._list._set("rowTooltipKey", "positions");
                    _this._list._set("nameKey", "displayName");
                    _this._dialogDiv = tui.elem("div");
                    _this._dialogDiv.className = "cnooc-user-select-div";
                    _this._dialogDiv.appendChild(_this._searchBox._);
                    _this._dialogDiv.appendChild(_this._list._);
                    _this._widget._set("title", "选择用户");
                    _this._widget._set("content", _this._dialogDiv);
                    _this._searchBox.on("enter clear", function () {
                        if (_this._searchBox.get("value")) {
                            _this.queryUser();
                        }
                        else {
                            _this.listTree();
                        }
                    });
                    _this._widget.on("open", function () {
                        _this._searchBox.set("value", "");
                        _this.listTree();
                    });
                    _this._widget.on("clear", function () {
                        if (_this.define.multiple)
                            _this.define.value = [];
                        else
                            _this.define.value = null;
                        form.fire("itemvaluechanged", { control: _this });
                    });
                    _this._widget.on("select", function () {
                        if (_this.define.multiple) {
                            var values = [];
                            var checkedItems = _this._list.get("checkedItems");
                            var text = "";
                            for (var i = 0; i < checkedItems.length; i++) {
                                values.push({ account: checkedItems[i].account, name: checkedItems[i].name });
                                if (i > 0)
                                    text += ", ";
                                text += checkedItems[i].name;
                            }
                            _this.define.value = values;
                            _this._widget.set("text", text);
                            form.fire("itemvaluechanged", { control: _this });
                        }
                        else {
                            var row = _this._list.get("activeRowData");
                            if (row == null) {
                                tui.msgbox("请选择一个用户！");
                                return false;
                            }
                            else if (row.type !== "user") {
                                tui.msgbox("请选择一个用户！");
                                return false;
                            }
                            else {
                                _this.define.value = { account: row.account, name: row.name };
                                _this._widget.set("text", row.name);
                                form.fire("itemvaluechanged", { control: _this });
                            }
                        }
                    });
                    return _this;
                }
                UserSelect.prototype.listTree = function () {
                    var _this = this;
                    var datasource = new tui.ds.RemoteTree();
                    datasource.on("query", function (e) {
                        var parentId = (e.data.parent === null ? null : e.data.parent.item.id);
                        if (parentId === null) {
                            parentId = _this.define.organId;
                        }
                        tui.ajax.post_(UserSelect.listUserApi, {
                            organId: parentId,
                            withSubCompany: !!_this.define.withSubCompany
                        }).done(function (result) {
                            datasource.update({
                                parent: e.data.parent,
                                data: result
                            });
                        }).fail(function (status, message) {
                            datasource.update({
                                parent: e.data.parent,
                                data: []
                            });
                            tui.errbox(message);
                        });
                    });
                    this._list.set("activeRow", null);
                    this._list.set("tree", datasource);
                };
                UserSelect.prototype.queryUser = function () {
                    var _this = this;
                    var query = {
                        keyword: this._searchBox.get("value"),
                        organId: this.define.organId,
                        withSubCompany: !!this.define.withSubCompany
                    };
                    tui.ajax.post(UserSelect.queryUserApi, query).done(function (result) {
                        _this._list.set("activeRow", null);
                        _this._list.set("list", result);
                    }).fail(function () {
                        _this._list.set("list", []);
                    });
                };
                UserSelect.prototype.update = function () {
                    _super.prototype.update.call(this);
                    this._widget._set("clearable", !this.define.required);
                    this._list._set("checkable", !!this.define.multiple);
                };
                UserSelect.prototype.getValue = function (cal) {
                    if (cal === void 0) { cal = null; }
                    if (typeof this.define.value === tui.UNDEFINED) {
                        if (this.define.multiple)
                            return [];
                        else
                            return null;
                    }
                    else
                        return this.define.value;
                };
                UserSelect.prototype.setValue = function (value) {
                    if (this.define.multiple) {
                        if (value instanceof Array) {
                            var items = [];
                            var text = "";
                            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                                var item = value_1[_i];
                                if (item && item.account && item.name) {
                                    items.push({ account: item.account, name: item.name });
                                    if (items.length > 0)
                                        text += ", ";
                                    text += item.name;
                                }
                            }
                            this.define.value = items;
                            this._widget.set("text", text);
                        }
                        else {
                            this.define.value = [];
                            this._widget.set("text", "");
                        }
                    }
                    else {
                        if (value && value.account && value.name) {
                            this.define.value = { account: value.account, name: value.name };
                            this._widget.set("text", value.name);
                        }
                        else {
                            this.define.value = null;
                            this._widget.set("text", "");
                        }
                    }
                    this.form.fire("itemvaluechanged", { control: this });
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
                                    "atMost": 1,
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
            UserSelect.queryUserApi = null;
            UserSelect.listUserApi = null;
            widget.Form.register("cnooc-user", UserSelect);
        })(ext = widget.ext || (widget.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
