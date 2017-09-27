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
            var Navigator = (function (_super) {
                __extends(Navigator, _super);
                function Navigator() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Navigator.prototype.initRestriction = function () {
                    var _this = this;
                    _super.prototype.initRestriction.call(this);
                    this.setRestrictions({
                        "items": {
                            "get": function () {
                                var items = _this._data["items"];
                                return items ? items : [];
                            }
                        },
                        "activeItem": {
                            "set": function (value) { },
                            "get": function () {
                                if (_this._activeItem != null) {
                                    return _this._activeItem.item;
                                }
                            }
                        }
                    });
                };
                Navigator.prototype.initChildren = function (childNodes) {
                    var data = [];
                    function addChild(node, items) {
                        var item = new widget.Item(node);
                        var text = item.get("text");
                        if (text === null)
                            text = $.trim(tui.browser.getNodeOwnText(node));
                        var naviItem = {
                            "text": text
                        };
                        naviItem.name = item.get("name");
                        naviItem.path = item.get("path");
                        naviItem.icon = item.get("icon");
                        naviItem.expand = item.get("expand");
                        var children = [];
                        addChildren(node.childNodes, children);
                        if (children.length > 0)
                            naviItem.children = children;
                        items.push(naviItem);
                    }
                    function addChildren(childNodes, data) {
                        for (var i = 0; i < childNodes.length; i++) {
                            var node = childNodes[i];
                            if (widget.getFullName(node) === "tui:item") {
                                addChild(node, data);
                            }
                        }
                    }
                    addChildren(childNodes, data);
                    if (data.length > 0)
                        this._set("items", data);
                };
                Navigator.prototype.checkScroll = function () {
                    var container = this._components["container"];
                    var up = this._components["up"];
                    var down = this._components["down"];
                    if (container.scrollTop == 0) {
                        up.style.display = "none";
                    }
                    else {
                        up.style.display = "block";
                    }
                    if (container.scrollTop == container.scrollHeight - container.clientHeight) {
                        down.style.display = "none";
                    }
                    else {
                        down.style.display = "block";
                    }
                };
                Navigator.prototype.init = function () {
                    var _this = this;
                    var container = this._components["container"] = tui.elem("div");
                    var up = this._components["up"] = tui.elem("div");
                    var down = this._components["down"] = tui.elem("div");
                    container.className = "tui-container";
                    up.className = "tui-up";
                    down.className = "tui-down";
                    this._.appendChild(container);
                    this._.appendChild(up);
                    this._.appendChild(down);
                    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                    $(this._).on(mousewheelevt, function (ev) {
                        var e = ev.originalEvent;
                        var delta = e.detail ? e.detail * (-1) : e.wheelDelta;
                        if (delta <= 0) {
                            if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
                                ev.preventDefault();
                            }
                        }
                        else {
                            if (container.scrollTop <= 0) {
                                ev.preventDefault();
                            }
                        }
                        ev.stopPropagation();
                        ev.stopImmediatePropagation();
                    });
                    this.on("resize", function () {
                        var scrollbarWidth = container.offsetWidth - container.clientWidth;
                        container.style.width = _this._.offsetWidth + scrollbarWidth + "px";
                        _this.checkScroll();
                    });
                    container.onscroll = function (e) {
                        _this.checkScroll();
                    };
                    function findLine(elem) {
                        if (!elem)
                            return null;
                        if ($(elem).hasClass("tui-line"))
                            return elem;
                        else
                            return findLine(elem.parentElement);
                    }
                    $(container).on("click keydown", function (e) {
                        var elem = e.target || e.srcElement;
                        elem = findLine(elem);
                        if (e.type === "keydown" && e.keyCode != tui.browser.KeyCode.ENTER)
                            return;
                        if (elem) {
                            var $elem = $(elem);
                            if ($elem.hasClass("tui-expand")) {
                                _this.collapse(elem);
                            }
                            else if ($elem.hasClass("tui-collapse")) {
                                _this.expand(elem);
                            }
                            else {
                                _this.active(elem);
                                if (_this.fire("select", elem.item) === false)
                                    return;
                                if (_this.get("openPath")) {
                                    var item = elem.item;
                                    if (item && item.path) {
                                        window.location.href = item.path;
                                    }
                                }
                            }
                        }
                    });
                };
                Navigator.prototype.collapse = function (elem) {
                    var _this = this;
                    var $elem = $(elem);
                    elem.item.expand = false;
                    if (!$elem.hasClass("tui-collapse")) {
                        $elem.removeClass("tui-expand");
                        $elem.addClass("tui-collapse");
                        $elem.next().animate({ height: "toggle" }, {
                            complete: function () {
                                _this.checkScroll();
                            }
                        });
                    }
                };
                Navigator.prototype.expand = function (elem) {
                    var _this = this;
                    var $elem = $(elem);
                    elem.item.expand = true;
                    if (!$elem.hasClass("tui-expand")) {
                        $elem.removeClass("tui-collapse");
                        $elem.addClass("tui-expand");
                        $elem.next().animate({ height: "toggle" }, {
                            complete: function () {
                                _this.checkScroll();
                            }
                        });
                    }
                };
                Navigator.prototype.active = function (elem) {
                    var container = this._components["container"];
                    var rc = tui.browser.getRectOfParent(elem);
                    if (rc.top >= container.scrollTop && rc.top + rc.height <= container.scrollTop + container.clientHeight) {
                    }
                    else if (rc.top < container.scrollTop) {
                        container.scrollTop = rc.top;
                    }
                    else if (rc.top + rc.height > container.scrollTop + container.clientHeight) {
                        container.scrollTop = (rc.top + rc.height - container.clientHeight);
                    }
                    if (this._activeItem)
                        $(this._activeItem).removeClass("tui-active");
                    if (this.get("selectable")) {
                        $(elem).addClass("tui-active");
                        this._activeItem = elem;
                    }
                };
                Navigator.prototype.drawItems = function (parent, items, level) {
                    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                        var item = items_1[_i];
                        var line = tui.elem("div");
                        line.item = item;
                        var $line = $(line);
                        $line.attr("unselectable", "on");
                        $line.attr("tabIndex", "0");
                        $line.addClass("tui-line");
                        $line.text(item.text);
                        if (level > 0)
                            $line.addClass("tui-child");
                        if (item.icon) {
                            var icon = tui.elem("i");
                            icon.className = item.icon;
                            line.insertBefore(icon, line.firstChild);
                        }
                        if (item.path)
                            line.setAttribute("path", item.path);
                        if (item.name)
                            line.setAttribute("name", item.name);
                        var space = tui.elem("span");
                        space.style.display = "inline-block";
                        space.style.width = 20 * level + "px";
                        line.insertBefore(space, line.firstChild);
                        parent.appendChild(line);
                        if (item.children && item.children.length > 0) {
                            var subArea = tui.elem("div");
                            subArea.className = "tui-sub";
                            if (item.expand) {
                                $line.addClass("tui-expand");
                                subArea.style.display = "block";
                            }
                            else {
                                $line.addClass("tui-collapse");
                                subArea.style.display = "none";
                            }
                            this.drawItems(subArea, item.children, level + 1);
                            parent.appendChild(subArea);
                        }
                    }
                };
                Navigator.prototype._activeBy = function (parent, key, value) {
                    for (var i = 0; i < parent.children.length; i++) {
                        var node = parent.children[i];
                        if ($(node).hasClass("tui-line")) {
                            if (node.item[key] === value) {
                                this.active(node);
                                return true;
                            }
                        }
                        else if ($(node).hasClass("tui-sub")) {
                            if (this._activeBy(node, key, value)) {
                                this.expand($(node).prev()[0]);
                                return true;
                            }
                        }
                    }
                    return false;
                };
                Navigator.prototype.activeBy = function (key, value) {
                    var container = this._components["container"];
                    this._activeBy(container, key, value);
                };
                Navigator.prototype.render = function () {
                    var items = this.get("items");
                    var container = this._components["container"];
                    container.innerHTML = "";
                    this.drawItems(container, items, 0);
                    this.checkScroll();
                };
                return Navigator;
            }(widget.Widget));
            ext.Navigator = Navigator;
            widget.register(Navigator, "navigator");
            widget.registerResize("navigator");
        })(ext = widget.ext || (widget.ext = {}));
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
