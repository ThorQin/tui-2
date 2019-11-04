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
            function mergeArray(key, src, newValues) {
                var result = [];
                if (!(newValues instanceof Array))
                    return src;
                if (!(src instanceof Array) || src.length == 0)
                    return newValues;
                result.splice.apply(result, [0, 0].concat(src));
                for (var i = 0; i < newValues.length; i++) {
                    var k = newValues[i][key];
                    var exists = false;
                    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                        var item = result_1[_i];
                        if (item[key] == k) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        var obj = {};
                        obj[key] = k;
                        obj.name = newValues[i].name;
                        result.push(obj);
                    }
                }
                return result;
            }
            function createSelector(key, title, rowTooltip, rowType, invalidMessage, classType, handler) {
                var searchBox = widget.create("input");
                searchBox._set("iconRight", "fa-search");
                searchBox._set("clearable", true);
                searchBox._set("type", "search");
                searchBox._set("placeholder", tui.str("label.search"));
                var list = widget.create("list");
                list._set("rowTooltipKey", rowTooltip);
                list._set("nameKey", "displayName");
                var dialogDiv = tui.elem("form");
                dialogDiv.onsubmit = function () {
                    return false;
                };
                dialogDiv.setAttribute("action", "#");
                dialogDiv.className = "tui-dialog-select-div";
                dialogDiv.appendChild(searchBox._);
                dialogDiv.appendChild(list._);
                var dialog = widget.create("dialog");
                dialog._set("mobileModel", true);
                dialog.setContent(dialogDiv);
                dialog.set("title", title);
                var _topOrganId;
                var _withSubCompany;
                var _multiple;
                searchBox.on("enter clear right-icon-click", function () {
                    if (searchBox.get("value")) {
                        queryList();
                    }
                    else {
                        queryTree();
                    }
                });
                dialog.on("open", function () {
                    searchBox.set("value", "");
                    queryTree();
                });
                dialog.on("btnclick", function (e) {
                    if (typeof handler !== "function") {
                        return;
                    }
                    if (_multiple) {
                        var values = [];
                        var checkedItems = list.get("checkedItems");
                        for (var i = 0; i < checkedItems.length; i++) {
                            var obj = {};
                            obj[key] = checkedItems[i][key];
                            obj.name = checkedItems[i].name;
                            values.push(obj);
                        }
                        if (handler(values) !== false) {
                            dialog.close();
                        }
                    }
                    else {
                        var row = list.get("activeRowData");
                        if (row == null) {
                            tui.msgbox(invalidMessage);
                            return;
                        }
                        else if (!rowType.test(row.type)) {
                            tui.msgbox(invalidMessage);
                            return;
                        }
                        else {
                            var obj = {};
                            obj[key] = row[key];
                            obj.name = row.name;
                            if (handler(obj) !== false) {
                                dialog.close();
                            }
                        }
                    }
                });
                function queryTree() {
                    var datasource = new tui.ds.RemoteTree();
                    datasource.on("query", function (e) {
                        var parentId = (e.data.parent === null ? null : e.data.parent.item.id);
                        var topmost = false;
                        if (parentId === null && (typeof _topOrganId === "number" || _topOrganId)) {
                            parentId = _topOrganId;
                            topmost = true;
                        }
                        tui.ajax.post_(classType.listApi, {
                            organId: parentId,
                            withSubCompany: !!_withSubCompany,
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
                    list.set("activeRow", null);
                    list.set("tree", datasource);
                }
                function queryList() {
                    var query = {
                        keyword: searchBox.get("value"),
                        organId: (typeof _topOrganId === "number" || _topOrganId ? _topOrganId : null),
                        withSubCompany: !!_withSubCompany
                    };
                    tui.ajax.post(classType.queryApi, query).done(function (result) {
                        list.set("activeRow", null);
                        list.set("list", result);
                    }).fail(function () {
                        list.set("list", []);
                    });
                }
                return function (topOrgan, withSubCompany, multiple) {
                    _topOrganId = (topOrgan ? topOrgan.id : null);
                    _withSubCompany = withSubCompany;
                    _multiple = !!multiple;
                    list.set("checkable", !!multiple);
                    dialog.open("ok#tui-primary");
                };
            }
            var FormDialogSelect = (function (_super) {
                __extends(FormDialogSelect, _super);
                function FormDialogSelect(form, define) {
                    var _this = _super.call(this, form, define, "dialog-select") || this;
                    _this.init();
                    _this._widget.set("iconRight", _this._rightIcon);
                    var selector = createSelector(_this._key, _this._title, _this._rowTooltip, _this._rowType, _this._invalidSelectionMessage, _this._classType, function (result) {
                        if (_this.define.multiple) {
                            var values = mergeArray(_this._key, _this.define.value, result);
                            var text = "";
                            for (var i = 0; i < values.length; i++) {
                                if (i > 0)
                                    text += ", ";
                                text += values[i].name;
                            }
                            _this.define.value = values;
                            _this._widget.set("text", text);
                            form.fire("itemvaluechanged", { control: _this });
                        }
                        else {
                            _this.define.value = result;
                            _this._widget.set("text", result.name);
                            form.fire("itemvaluechanged", { control: _this });
                        }
                    });
                    _this._widget.on("open", function () {
                        selector(_this.define.organ, _this.define.withSubCompany, _this.define.multiple);
                        return false;
                    });
                    _this._widget.on("clear", function () {
                        if (_this.define.multiple)
                            _this.define.value = [];
                        else
                            _this.define.value = null;
                        form.fire("itemvaluechanged", { control: _this });
                    });
                    return _this;
                }
                FormDialogSelect.prototype.update = function () {
                    _super.prototype.update.call(this);
                    this._widget._set("clearable", true);
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
                                    if (items.length > 1)
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
                            "withSubCompany": true,
                            "size": 2,
                            "position": "newline"
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
                            "size": 2,
                            "position": "newline"
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
                            "size": 2
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
            function translateValue(value, item, index) {
                if (value instanceof Array) {
                    var s = "";
                    for (var _i = 0, value_2 = value; _i < value_2.length; _i++) {
                        var item_1 = value_2[_i];
                        if (item_1 && item_1.name) {
                            if (s.length > 0)
                                s += ", ";
                            s += item_1.name;
                        }
                    }
                    return document.createTextNode(s);
                }
                else if (value && value.name)
                    return document.createTextNode(value.name);
                else
                    return null;
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
                return FormUserSelect;
            }(FormDialogSelect));
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
                FormOrganSelect.icon = "fa-building-o";
                FormOrganSelect.desc = "label.organization";
                FormOrganSelect.order = 202;
                FormOrganSelect.queryApi = null;
                FormOrganSelect.listApi = null;
                FormOrganSelect.init = {
                    multiple: false,
                    withSubCompany: true
                };
                FormOrganSelect.translator = translateValue;
                return FormOrganSelect;
            }(FormDialogSelect));
            widget.Form.register("organ", FormOrganSelect);
            var FormUserList = (function (_super) {
                __extends(FormUserList, _super);
                function FormUserList(form, define) {
                    var _this = _super.call(this, form, define, "list") || this;
                    var selector = createSelector("account", tui.str("label.select.user"), "tooltip", /^user$/, tui.str("message.select.user"), FormUserSelect, function (result) {
                        var values = mergeArray("account", _this.define.value, result);
                        _this._notifyBar.innerHTML = "";
                        _this.setValue(values);
                    });
                    _this._widget._.style.margin = "2px";
                    _this._buttonBar = tui.elem("div");
                    _this.div.appendChild(_this._buttonBar);
                    _this._btnAdd = widget.create("button", { text: "<i class='fa fa-plus'></i>" });
                    _this._btnAdd.appendTo(_this._buttonBar);
                    _this._btnAdd.on("click", function () {
                        selector(_this.define.organ, _this.define.withSubCompany, true);
                    });
                    _this._btnDelete = widget.create("button", { text: "<i class='fa fa-minus'></i>" });
                    _this._btnDelete.appendTo(_this._buttonBar);
                    _this._btnDelete.on("click", function () {
                        var i = _this._widget.get("activeRow");
                        if (i === null)
                            return;
                        _this.define.value.splice(i, 1);
                        _this._notifyBar.innerHTML = "";
                        form.fire("itemvaluechanged", { control: _this });
                    });
                    _this._notifyBar = tui.elem("div");
                    _this._notifyBar.className = "tui-form-notify-bar";
                    _this.div.appendChild(_this._notifyBar);
                    return _this;
                }
                FormUserList.prototype.update = function () {
                    _super.prototype.update.call(this);
                    this._notifyBar.innerHTML = "";
                    var d = this.define;
                    if (!(d.value instanceof Array)) {
                        d.value = [];
                    }
                    this._widget._set("list", d.value);
                    if (this.define.disable) {
                        this._btnAdd.set("disable", true);
                        this._btnAdd._.style.display = "none";
                        this._btnDelete.set("disable", true);
                        this._btnDelete._.style.display = "none";
                        this._widget.set("disable", true);
                    }
                    else {
                        this._btnAdd.set("disable", false);
                        this._btnAdd._.style.display = "inline-block";
                        this._btnDelete.set("disable", false);
                        this._btnDelete._.style.display = "inline-block";
                        this._widget.set("disable", false);
                    }
                    this._widget.set("autoHeight", false);
                    if (typeof d.height === "number" && !isNaN(d.height) ||
                        typeof d.height === "string" && /^\d+$/.test(d.height)) {
                        this._widget._.style.height = d.height + "px";
                    }
                    else {
                        this._widget._.style.height = "";
                        d.height = undefined;
                    }
                };
                FormUserList.prototype.getProperties = function () {
                    return [{
                            name: tui.str("label.user.list"),
                            properties: [
                                {
                                    "type": "organ",
                                    "key": "organ",
                                    "label": tui.str("label.top.organ"),
                                    "value": this.define.organ,
                                    "withSubCompany": true,
                                    "size": 2,
                                    "position": "newline"
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
                                    "size": 2,
                                    "position": "newline"
                                }, {
                                    "type": "textbox",
                                    "inputType": "number",
                                    "key": "atLeast",
                                    "label": tui.str("form.at.least"),
                                    "value": /^\d+$/.test(this.define.atLeast + "") ? this.define.atLeast : "",
                                    "validation": [
                                        { "format": "*digital", "message": tui.str("message.invalid.value") }
                                    ]
                                }, {
                                    "type": "textbox",
                                    "inputType": "number",
                                    "key": "atMost",
                                    "label": tui.str("form.at.most"),
                                    "value": /^\d+$/.test(this.define.atMost + "") ? this.define.atMost : "",
                                    "validation": [
                                        { "format": "*digital", "message": tui.str("message.invalid.value") }
                                    ]
                                }, {
                                    "type": "textbox",
                                    "inputType": "number",
                                    "key": "height",
                                    "label": tui.str("form.height"),
                                    "value": /^\d+$/.test(this.define.height + "") ? this.define.height : null,
                                    "validation": [
                                        { "format": "*digital", "message": tui.str("message.invalid.value") }
                                    ]
                                }
                            ]
                        }];
                };
                FormUserList.prototype.onPropertyPageSwitch = function (pages, recentPage) {
                    widget.FormControl.detectRequired(pages, recentPage);
                };
                FormUserList.prototype.setProperties = function (properties) {
                    var values = properties[1];
                    this.define.height = /^\d+$/.test(values.height) ? values.height : undefined;
                    this.define.atLeast = values.atLeast ? parseInt(values.atLeast) : undefined;
                    this.define.atMost = values.atMost ? parseInt(values.atMost) : undefined;
                    this.define.withSubCompany = !!values.withSubCompany;
                    this.define.organ = values.organ;
                };
                FormUserList.prototype.getValue = function () {
                    return this.define.value || [];
                };
                FormUserList.prototype.setValue = function (value) {
                    if (value !== this.define.value) {
                        if (value instanceof Array) {
                            this.define.value = value;
                            this._widget._set("list", this.define.value);
                        }
                    }
                    this._widget.render();
                    this.form.fire("itemvaluechanged", { control: this });
                };
                FormUserList.prototype.validate = function () {
                    var d = this.define;
                    var data = this._widget.get("data");
                    if (d.atLeast && data.length() < d.atLeast) {
                        this._notifyBar.innerHTML = tui.browser.toSafeText(tui.strp("form.at.least.p", d.atLeast));
                        return false;
                    }
                    else if (d.atMost && data.length() > d.atMost) {
                        this._notifyBar.innerHTML = tui.browser.toSafeText(tui.strp("form.at.most.p", d.atMost));
                        return false;
                    }
                    else
                        return true;
                };
                FormUserList.icon = "fa-list";
                FormUserList.desc = "label.user.list";
                FormUserList.order = 201;
                FormUserList.init = {
                    withSubCompany: true,
                    position: "newline"
                };
                FormUserList.translator = function (value, item, index) {
                    if (value instanceof Array) {
                        return document.createTextNode(value.map(function (it) { return it.name; }).join(", "));
                    }
                    else if (value != null)
                        return document.createTextNode(value + "");
                    else
                        return null;
                };
                return FormUserList;
            }(widget.BasicFormControl));
            widget.Form.register("users", FormUserList);
            var QRCode = (function (_super) {
                __extends(QRCode, _super);
                function QRCode(form, define) {
                    var _this = _super.call(this, form, define, "dialog-select") || this;
                    _this._widget.set("iconRight", "fa-barcode");
                    _this._widget.on("open", function () {
                        form.fire("itemevent", { event: "getQRCode", control: _this, url: _this.define.url, callback: function (value) {
                                if (typeof value == "object" && value != null) {
                                    _this.setValue(value);
                                }
                            } });
                        return false;
                    });
                    _this._widget.on("clear", function () {
                        _this.define.value = null;
                        form.fire("itemvaluechanged", { control: _this });
                    });
                    return _this;
                }
                QRCode.prototype.setValueInternal = function () {
                    var v = this.define.value;
                    if (v) {
                        var text_1 = (typeof v.text != tui.UNDEFINED && v.text != null ? v.text : v.value);
                        this._widget._set("value", v.value);
                        this._widget.set("text", text_1);
                    }
                    else {
                        this._widget._set("value", null);
                        this._widget.set("text", "");
                    }
                };
                QRCode.prototype.update = function () {
                    _super.prototype.update.call(this);
                    this._widget._set("clearable", true);
                    this.setValueInternal();
                    if (this.define.required) {
                        this._widget._set("validate", [{ "format": "*any", "message": tui.str("message.cannot.be.empty") }]);
                    }
                    else {
                        this._widget._set("validate", []);
                    }
                };
                QRCode.prototype.getValue = function (cal) {
                    if (cal === void 0) { cal = null; }
                    return this.define.value;
                };
                QRCode.prototype.setValue = function (value) {
                    if (typeof value != "object") {
                        value = null;
                    }
                    this.define.value = value;
                    this.setValueInternal();
                    this.form.fire("itemvaluechanged", { control: this });
                };
                QRCode.prototype.getProperties = function () {
                    return [{
                            name: tui.str("label.qrcode"),
                            properties: [{
                                    "type": "textbox",
                                    "key": "url",
                                    "label": tui.str("label.resolve.address"),
                                    "size": 2,
                                    "value": this.define.url ? this.define.url + "" : null
                                }]
                        }];
                };
                QRCode.prototype.setProperties = function (properties) {
                    var values = properties[1];
                    this.define.url = values.url ? values.url + "" : null;
                };
                QRCode.prototype.validate = function () {
                    return this._widget.validate();
                };
                QRCode.icon = "fa-barcode";
                QRCode.desc = "label.qrcode";
                QRCode.order = 203;
                QRCode.init = {};
                return QRCode;
            }(widget.BasicFormControl));
            widget.Form.register("qrcode", QRCode);
            tui.dict("en-us", {
                "label.resolve.address": "Resolve Address",
                "label.qrcode": "QRCode",
                "label.user": "User",
                "label.user.list": "User List",
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
                "label.resolve.address": "解析地址",
                "label.qrcode": "二维码",
                "label.user": "用户",
                "label.user.list": "用户列表",
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
