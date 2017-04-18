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
            var FormDialogSelect = (function (_super) {
                __extends(FormDialogSelect, _super);
                function FormDialogSelect(form, define) {
                    var _this = _super.call(this, form, define, "dialog-select") || this;
                    _this.init();
                    _this._widget.set("iconRight", _this._rightIcon);
                    _this._searchBox = widget.create("input");
                    _this._searchBox._set("iconLeft", "fa-search");
                    _this._searchBox._set("clearable", true);
                    _this._searchBox._set("placeholder", tui.str("label.search"));
                    _this._list = widget.create("list");
                    _this._list._set("rowTooltipKey", _this._rowTooltip);
                    _this._list._set("nameKey", "displayName");
                    _this._dialogDiv = tui.elem("div");
                    _this._dialogDiv.className = "tui-dialog-select-div";
                    _this._dialogDiv.appendChild(_this._searchBox._);
                    _this._dialogDiv.appendChild(_this._list._);
                    _this._widget._set("title", _this._title);
                    _this._widget._set("content", _this._dialogDiv);
                    _this._searchBox.on("enter clear", function () {
                        if (_this._searchBox.get("value")) {
                            _this.queryList();
                        }
                        else {
                            _this.queryTree();
                        }
                    });
                    _this._widget.on("open", function () {
                        _this._searchBox.set("value", "");
                        _this.queryTree();
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
                                var obj = {};
                                obj[_this._key] = checkedItems[i][_this._key];
                                obj.name = checkedItems[i].name;
                                values.push(obj);
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
                                tui.msgbox(_this._invalidSelectionMessage);
                                return false;
                            }
                            else if (!_this._rowType.test(row.type)) {
                                tui.msgbox(_this._invalidSelectionMessage);
                                return false;
                            }
                            else {
                                var obj = {};
                                obj[_this._key] = row[_this._key];
                                obj.name = row.name;
                                _this.define.value = obj;
                                _this._widget.set("text", row.name);
                                form.fire("itemvaluechanged", { control: _this });
                            }
                        }
                    });
                    return _this;
                }
                FormDialogSelect.prototype.queryTree = function () {
                    var _this = this;
                    var datasource = new tui.ds.RemoteTree();
                    datasource.on("query", function (e) {
                        var parentId = (e.data.parent === null ? null : e.data.parent.item.id);
                        var topmost = false;
                        if (parentId === null && _this.define.organ && typeof _this.define.organ.id === "number") {
                            parentId = _this.define.organ.id;
                            topmost = true;
                        }
                        tui.ajax.post_(_this._classType.listApi, {
                            organId: parentId,
                            withSubCompany: !!_this.define.withSubCompany,
                            topmost: topmost
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
                FormDialogSelect.prototype.queryList = function () {
                    var _this = this;
                    var query = {
                        keyword: this._searchBox.get("value"),
                        organId: (this.define.organ && typeof this.define.organ.id === "number" ? this.define.organ.id : null),
                        withSubCompany: !!this.define.withSubCompany
                    };
                    tui.ajax.post(this._classType.queryApi, query).done(function (result) {
                        _this._list.set("activeRow", null);
                        _this._list.set("list", result);
                    }).fail(function () {
                        _this._list.set("list", []);
                    });
                };
                FormDialogSelect.prototype.update = function () {
                    _super.prototype.update.call(this);
                    this._widget._set("clearable", !this.define.required);
                    this._list._set("checkable", !!this.define.multiple);
                    this.setValueInternal(this.define.value);
                    if (this.define.required) {
                        this._widget._set("validate", [{ "format": "*any", "message": tui.str("message.cannot.be.empty") }]);
                    }
                    else {
                        this._widget._set("validate", []);
                    }
                };
                FormDialogSelect.prototype.getValue = function (cal) {
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
                FormDialogSelect.prototype.setValueInternal = function (value) {
                    if (this.define.multiple) {
                        if (value instanceof Array) {
                            var items = [];
                            var text = "";
                            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                                var item = value_1[_i];
                                if (item && item[this._key] && item.name) {
                                    var obj = {};
                                    obj[this._key] = item[this._key];
                                    obj.name = item.name;
                                    items.push(obj);
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
                        if (value && value[this._key] && value.name) {
                            var obj = {};
                            obj[this._key] = value[this._key];
                            obj.name = value.name;
                            this.define.value = obj;
                            this._widget.set("text", value.name);
                        }
                        else {
                            this.define.value = null;
                            this._widget.set("text", "");
                        }
                    }
                };
                FormDialogSelect.prototype.setValue = function (value) {
                    this.setValueInternal(value);
                    this.form.fire("itemvaluechanged", { control: this });
                };
                FormDialogSelect.prototype.getProperties = function () {
                    var properties = [
                        {
                            "type": "organ",
                            "key": "organ",
                            "label": tui.str("label.top.organ"),
                            "value": this.define.organ,
                            "size": 2,
                            "newline": true
                        }, {
                            "type": "options",
                            "key": "withSubCompany",
                            "label": tui.str("label.with.sub.company"),
                            "value": this.define.withSubCompany ? true : false,
                            "options": [{ "data": [
                                        { "value": true, "text": tui.str("yes") },
                                        { "value": false, "text": tui.str("no") }
                                    ] }],
                            "atMost": 1,
                            "size": 1,
                            "newline": true
                        }
                    ];
                    if (this._allowMultiSelect) {
                        properties.push({
                            "type": "options",
                            "key": "multiple",
                            "label": tui.str("label.multiselect"),
                            "value": this.define.multiple ? true : false,
                            "options": [{ "data": [
                                        { "value": true, "text": tui.str("yes") },
                                        { "value": false, "text": tui.str("no") }
                                    ] }],
                            "atMost": 1,
                            "size": 1
                        });
                    }
                    return [{
                            name: tui.str(this._classType.desc),
                            properties: properties
                        }];
                };
                FormDialogSelect.prototype.setProperties = function (properties) {
                    var values = properties[1];
                    if (this.define.multiple != !!values.multiple) {
                        this.define.multiple = !!values.multiple;
                        this.setValue(null);
                    }
                    this.define.withSubCompany = !!values.withSubCompany;
                    this.define.organ = values.organ;
                };
                FormDialogSelect.prototype.validate = function () {
                    return this._widget.validate();
                };
                return FormDialogSelect;
            }(widget.BasicFormControl));
            function translateValue(value) {
                if (value instanceof Array) {
                    var s = "";
                    for (var _i = 0, value_2 = value; _i < value_2.length; _i++) {
                        var item = value_2[_i];
                        if (item && item.name) {
                            if (s.length > 0)
                                s += ", ";
                            s += item.name;
                        }
                    }
                    return s;
                }
                else if (value && value.name)
                    return value.name;
                else
                    return "";
            }
            var FormUserSelect = (function (_super) {
                __extends(FormUserSelect, _super);
                function FormUserSelect() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                FormUserSelect.prototype.init = function () {
                    this._classType = FormUserSelect;
                    this._rightIcon = "fa-user-o";
                    this._title = tui.str("label.select.user");
                    this._rowType = /^user$/;
                    this._rowTooltip = "tooltip";
                    this._invalidSelectionMessage = tui.str("message.select.user");
                    this._key = "account";
                    this._allowMultiSelect = true;
                };
                return FormUserSelect;
            }(FormDialogSelect));
            FormUserSelect.icon = "fa-user-o";
            FormUserSelect.desc = "label.user";
            FormUserSelect.order = 200;
            FormUserSelect.queryApi = null;
            FormUserSelect.listApi = null;
            FormUserSelect.init = {
                multiple: false,
                withSubCompany: true
            };
            FormUserSelect.translator = translateValue;
            widget.Form.register("user", FormUserSelect);
            var FormOrganSelect = (function (_super) {
                __extends(FormOrganSelect, _super);
                function FormOrganSelect() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                FormOrganSelect.prototype.init = function () {
                    this._classType = FormOrganSelect;
                    this._rightIcon = "fa-building-o";
                    this._title = tui.str("label.select.organ");
                    this._rowType = /^(company|department)$/;
                    this._rowTooltip = "tooltip";
                    this._invalidSelectionMessage = tui.str("message.select.organ");
                    this._key = "id";
                    this._allowMultiSelect = false;
                };
                return FormOrganSelect;
            }(FormDialogSelect));
            FormOrganSelect.icon = "fa-building-o";
            FormOrganSelect.desc = "label.organization";
            FormOrganSelect.order = 201;
            FormOrganSelect.queryApi = null;
            FormOrganSelect.listApi = null;
            FormOrganSelect.init = {
                multiple: false,
                withSubCompany: true
            };
            FormOrganSelect.translator = translateValue;
            widget.Form.register("organ", FormOrganSelect);
            tui.dict("en-us", {
                "label.user": "User",
                "label.multiselect": "Multi-Select",
                "label.search": "Search",
                "label.select.user": "Select User",
                "label.select.organ": "Select Organization",
                "label.organization": "Organiztion",
                "label.top.organ": "Top Organization",
                "label.with.sub.company": "Include Sub Company",
                "message.select.organ": "Please select an organization!",
                "message.select.user": "Please select an user!"
            });
            tui.dict("zh-cn", {
                "label.user": "用户",
                "label.multiselect": "多选",
                "label.search": "搜索",
                "label.select.user": "选择用户",
                "label.select.organ": "选择机构",
                "label.organization": "组织机构",
                "label.top.organ": "顶层机构",
                "label.with.sub.company": "包括子公司",
                "message.select.organ": "请选择一个机构！",
                "message.select.user": "请选择一个用户！"
            });
            function setUserSelectApiPath(queryApi, listApi) {
                FormUserSelect.queryApi = queryApi;
                FormUserSelect.listApi = listApi;
            }
            ext.setUserSelectApiPath = setUserSelectApiPath;
            function setOrganSelectApiPath(queryApi, listApi) {
                FormOrganSelect.queryApi = queryApi;
                FormOrganSelect.listApi = listApi;
            }
            ext.setOrganSelectApiPath = setOrganSelectApiPath;
        })(ext = widget.ext || (widget.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
