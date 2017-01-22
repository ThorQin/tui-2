var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
// Embedded JSON2
var JSON;
if (!JSON) {
    var JSON = {};
}
(function () {
    "use strict";
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ?
                this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z' : null;
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        "\"": "\\\"",
        "\\": "\\\\"
    }, rep;
    function quote(str) {
        escapable.lastIndex = 0;
        return escapable.test(str) ? '"' + str.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + str + '"';
    }
    function str(key, holder) {
        var i, // The loop counter.
        k, // The member key.
        v, // The member value.
        length, mind = gap, partial, value = holder[key];
        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' : gap ?
                        '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                        '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' : gap ?
                    '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                    '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            }
            else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', { '': value });
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            }
                            else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ?
                    walk({ '': j }, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
}());
// End of JSON2 
/// <reference path="jquery.d.ts" />
/// <reference path="json.ts" />
/// <reference path="animation.ts" />
var tui;
(function (tui) {
    "use strict";
    tui.UNDEFINED = (function (undefined) {
        return typeof undefined;
    })();
    // Used to decide which language should be used to display UI control
    tui.lang = (function () {
        return (navigator.language || navigator.browserLanguage || navigator.userLanguage).toLowerCase();
    })();
    var _dict = {};
    function dict(lang, translator) {
        if (typeof translator === "function")
            _dict[lang] = translator;
        else if (typeof translator === "object" && translator !== null) {
            _dict[lang] = function (str) {
                return translator[(str + "").toLowerCase()] || str;
            };
        }
    }
    tui.dict = dict;
    /**
     * Multi-language support, translate source text to specified language(default use tui.lang setting)
     * @param str {string} source text
     * @param lang {string} if specified then use this parameter as objective language otherwise use tui.lang as objective language
     */
    function str(str, lang) {
        if (!lang) {
            if (!tui.lang)
                lang = "en-us";
            else
                lang = tui.lang.toLowerCase();
        }
        var func = _dict[lang];
        if (typeof func === "function") {
            return func(str);
        }
        else {
            func = _dict["en-us"];
            if (typeof func === "function")
                return func(str);
            else
                return str;
        }
    }
    tui.str = str;
    tui.tuid = (function () {
        var id = 0;
        return function () {
            return ('tuid-' + id++);
        };
    })();
    /**
     * Base object, all other control extended from this base class.
     */
    var EventObject = (function () {
        function EventObject() {
            this._events = {};
        }
        /**
         * Register event handler.
         * @param {string} eventName
         * @param {EventHandler} handler Which handler to be registered
         * @param {boolean} atFirst If true then handler will be triggered firstly
         */
        EventObject.prototype.bind = function (eventName, handler, atFirst) {
            if (!eventName)
                return this;
            if (!this._events[eventName]) {
                this._events[eventName] = [];
            }
            var handlers = this._events[eventName];
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i] === handler)
                    return this;
            }
            if (atFirst)
                handlers.splice(0, 0, handler);
            else
                handlers.push(handler);
            return this;
        };
        /**
         * Unregister event handler.
         * @param eventName
         * @param handler Which handler to be unregistered if don't specified then unregister all handler
         */
        EventObject.prototype.unbind = function (eventName, handler) {
            if (!eventName)
                return this;
            var handlers = this._events[eventName];
            if (handler) {
                for (var i = 0; i < handlers.length; i++) {
                    if (handler === handlers[i]) {
                        handlers.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                handlers.length = 0;
            }
            return this;
        };
        /**
         * Register event handler.
         * @param {string} eventName
         * @param {callback} callback Which handler to be registered
         * @param {boolean} atFirst If true then handler will be triggered firstly
         */
        EventObject.prototype.on = function (eventName, callback, atFirst) {
            if (atFirst === void 0) { atFirst = false; }
            var envs = eventName.split(/\s+/);
            for (var i = 0; i < envs.length; i++) {
                var v = envs[i];
                this.bind(v, callback, atFirst);
            }
            return this;
        };
        /**
         * Register event handler.
         * @param eventName
         * @param callback Which handler to be registered but event only can be trigered once
         * @param atFirst If true then handler will be triggered firstly
         */
        EventObject.prototype.once = function (eventName, callback, atFirst) {
            if (atFirst === void 0) { atFirst = false; }
            callback.isOnce = true;
            return this.on(eventName, callback, atFirst);
        };
        /**
         * Unregister event handler.
         * @param eventName
         * @param callback Which handler to be unregistered if don't specified then unregister all handler
         */
        EventObject.prototype.off = function (eventName, callback) {
            var envs = eventName.split(/\s+/);
            for (var i = 0; i < envs.length; i++) {
                var v = envs[i];
                this.unbind(v, callback);
            }
            return this;
        };
        EventObject.prototype.offAll = function () {
            for (var key in this._events) {
                this.off(key);
            }
        };
        /**
         * Fire event. If some handler process return false then cancel the event channe and return false either
         * @param {string} eventName
         * @param {any[]} param
         * @return {boolean} If any handler return false then stop other processing and return false either, otherwise return true
         */
        EventObject.prototype.fire = function (eventName, data) {
            var handlers = this._events[eventName];
            if (!(handlers instanceof Array)) {
                handlers = [];
            }
            var wildcardHandlers = this._events['*'];
            if (wildcardHandlers instanceof Array)
                handlers = handlers.concat(wildcardHandlers);
            if (handlers.length === 0)
                return true;
            var eventInfo = {
                "event": eventName,
                "data": data
            };
            var removeArray = [];
            for (var i = 0; i < handlers.length; i++) {
                var handler = handlers[i];
                if (handler.isOnce)
                    removeArray.push(handler);
                var val = handler.call(this, eventInfo);
                if (typeof val === "boolean" && !val)
                    return false;
            }
            for (var i = 0; i < removeArray.length; i++) {
                this.off(eventName, removeArray[i]);
            }
            return true;
        };
        return EventObject;
    }());
    tui.EventObject = EventObject;
    tui.event = new EventObject();
    function cloneInternal(obj, excludeProperties) {
        if (obj === null)
            return null;
        else if (typeof obj === tui.UNDEFINED)
            return undefined;
        else if (obj instanceof Array) {
            var newArray = [];
            for (var idx in obj) {
                if (obj.hasOwnProperty(idx) && excludeProperties.indexOf(idx) < 0) {
                    newArray.push(cloneInternal(obj[idx], excludeProperties));
                }
            }
            return newArray;
        }
        else if (typeof obj === "number")
            return obj;
        else if (typeof obj === "string")
            return obj;
        else if (typeof obj === "boolean")
            return obj;
        else if (typeof obj === "function")
            return obj;
        else {
            var newObj = {};
            for (var idx in obj) {
                if (obj.hasOwnProperty(idx) && excludeProperties.indexOf(idx) < 0) {
                    newObj[idx] = cloneInternal(obj[idx], excludeProperties);
                }
            }
            return newObj;
        }
    }
    /**
     * Deeply copy an object to an other object, but only contain properties without methods
     */
    function clone(obj, excludeProperties) {
        if (typeof excludeProperties === "string" && $.trim(excludeProperties).length > 0) {
            return cloneInternal(obj, [excludeProperties]);
        }
        else if (excludeProperties instanceof Array) {
            return cloneInternal(obj, excludeProperties);
        }
        else
            return JSON.parse(JSON.stringify(obj));
    }
    tui.clone = clone;
    /**
     * Get IE version
     * @return {Number}
     */
    tui.ieVer = (function () {
        var rv = -1; // Return value assumes failure.
        if (navigator.appName === "Microsoft Internet Explorer" ||
            navigator.appName === "Netscape") {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) !== null)
                rv = parseFloat(RegExp.$1);
        }
        if (rv === -1 && navigator.appName === "Netscape") {
            var ua = navigator.userAgent;
            var re = new RegExp("Trident/([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) !== null)
                rv = parseFloat(RegExp.$1);
            if (rv >= 7.0)
                rv = 11.0;
        }
        return rv;
    })();
    /**
     * Get Firefox version
     * @return {Number}
     */
    tui.ffVer = (function () {
        var rv = -1; // Return value assumes failure.
        if (navigator.appName === "Netscape") {
            var ua = navigator.userAgent;
            var re = new RegExp("Firefox/([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) !== null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    })();
})(tui || (tui = {}));
/// <reference path="core.ts" />
tui.dict("en-us", {
    "success": "Success",
    "notmodified": "Request's content has not been modified!",
    "error": "Error",
    "timeout": "Request timeout!",
    "abort": "Operating has been aborted!",
    "parsererror": "Server response invalid content!",
    "ok": "OK",
    "close": "Close",
    "cancel": "Cancel",
    "accept": "Accept",
    "agree": "Agree",
    "reject": "Reject",
    "yes": "Yes",
    "no": "No"
});
/// <reference path="../core.ts" />
var tui;
(function (tui) {
    var text;
    (function (text) {
        "use strict";
        /**
         * Convert anything to boolean
         */
        function parseBoolean(value) {
            if (typeof value === tui.UNDEFINED)
                return false;
            if (typeof value === "number")
                return isNaN(value) && value != 0;
            switch (String(tui.str).toLowerCase()) {
                case "true":
                case "1":
                case "yes":
                case "y":
                    return true;
                default:
                    return false;
            }
        }
        text.parseBoolean = parseBoolean;
        /**
         * Format a string use a set of parameters
         */
        function format(token) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var formatrg = /\{(\d+)\}/g;
            token && (typeof token === "string") && params.length && (token = token.replace(formatrg, function (str, i) {
                return params[i] === null ? "" : params[i];
            }));
            return token ? token : "";
        }
        text.format = format;
        /**
         * Convert 'aaaBbbCcc' to 'aaa-bbb-ccc'
         */
        function toDashSplit(word) {
            var buffer = '';
            for (var i = 0; i < word.length; i++) {
                var c = word.charAt(i);
                var code = c.charCodeAt(0);
                if (code >= 65 && code <= 90) {
                    if (i > 0)
                        buffer += '-';
                    buffer += c.toLowerCase();
                }
                else
                    buffer += c;
            }
            return buffer;
        }
        text.toDashSplit = toDashSplit;
        /**
         * Convert 'aaa-bbb-ccc' or 'aaa_bbb_ccc' to 'aaaBbbCcc'
         */
        function toCamel(word, strict) {
            if (strict === void 0) { strict = false; }
            var buffer = '';
            if (strict)
                word = word.toLowerCase();
            var upperFlag = false;
            for (var i = 0; i < word.length; i++) {
                var c = word.charAt(i);
                if (c === '-' || c === '_') {
                    upperFlag = true;
                }
                else {
                    buffer += upperFlag ? c.toUpperCase() : c;
                    upperFlag = false;
                }
            }
            return buffer;
        }
        text.toCamel = toCamel;
        /**
         * Format a number that padding it with '0'
         */
        function paddingNumber(v, min, max, alignLeft) {
            if (alignLeft === void 0) { alignLeft = false; }
            var result = Math.abs(v) + "";
            while (result.length < min) {
                result = "0" + result;
            }
            if (typeof max === "number" && result.length > max) {
                if (alignLeft)
                    result = result.substr(0, max);
                else
                    result = result.substr(result.length - max, max);
            }
            if (v < 0)
                result = "-" + result;
            return result;
        }
        text.paddingNumber = paddingNumber;
        /**
         * Get the parameter of the URL query string.
         * @param {String} url
         * @param {String} key Parameter name
         */
        function getUrlParam(url, key) {
            key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"), results = regex.exec(url);
            return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        text.getUrlParam = getUrlParam;
        /**
         * Get the anchor of the URL query string.
         * @param {String} url
         */
        function getUrlAnchor(url) {
            var anchor = url.match("(#.+)(?:\\?.*)?");
            if (anchor)
                anchor = anchor[1];
            return anchor;
        }
        text.getUrlAnchor = getUrlAnchor;
        function isAbsUrl(url) {
            if (!url)
                return false;
            return !!url.match(/^(([a-z0-9]+:)?\/\/|\/)/i);
        }
        text.isAbsUrl = isAbsUrl;
        function getBaseUrl(url) {
            var matcher = url.match(/^(?:[a-z0-9]+:)?\/\//i);
            var prefix = "";
            if (matcher) {
                prefix = matcher[0];
                url = url.substr(matcher[0].length);
            }
            var pos = url.indexOf("#");
            if (pos >= 0) {
                url = url.substring(0, pos);
            }
            var pos = url.lastIndexOf("/");
            if (pos >= 0) {
                url = url.substring(0, pos + 1);
            }
            return prefix + url;
        }
        text.getBaseUrl = getBaseUrl;
        function joinUrl() {
            var urls = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                urls[_i - 0] = arguments[_i];
            }
            var result = null;
            for (var _a = 0, urls_1 = urls; _a < urls_1.length; _a++) {
                var u = urls_1[_a];
                if (!result)
                    result = u;
                else {
                    if (u[0] == "/")
                        u = u.substr(1);
                    if (result[result.length - 1] == "/") {
                        result += u;
                    }
                    else
                        result += "/" + u;
                }
            }
            return result;
        }
        text.joinUrl = joinUrl;
    })(text = tui.text || (tui.text = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
/// <reference path="../ajax/ajax.ts" />
var tui;
(function (tui) {
    var service;
    (function (service_1) {
        "use strict";
        function parseParameters(fn, desc) {
            var params = "";
            if (desc)
                params = desc + "";
            else {
                var matched = fn.toString().match(/^\s*function\s*[a-zA-Z0-9_]*\s*\(([\sa-zA-Z0-9,_\$]*)\)/);
                if (matched) {
                    params = matched[1];
                }
                else {
                    matched = fn.toString().match(/^\s*\(([\sa-zA-Z0-9,_\$]*)\)\s*=>/);
                    if (matched)
                        params = matched[1];
                }
            }
            return (params || "");
        }
        service_1.parseParameters = parseParameters;
        var Service = (function (_super) {
            __extends(Service, _super);
            function Service() {
                _super.apply(this, arguments);
            }
            Service.prototype.use = function (fn, desc) {
                service.use.call(this, fn, desc);
            };
            return Service;
        }(tui.EventObject));
        var _services = {};
        var _serviceReady = true;
        var _readyCallbacks = [];
        function use(fn, desc) {
            if (typeof fn === "function") {
                var params = parseParameters(fn, desc);
                var argv = params.split(",").map(function (s) {
                    if (!s)
                        return null;
                    else if (s[0] === '$') {
                        return tui.service.get(s.substr(1));
                    }
                    else {
                        return null;
                    }
                });
                fn.apply(this, argv);
            }
        }
        service_1.use = use;
        function getName(path) {
            var begin = path.lastIndexOf("/");
            if (begin >= 0)
                path = path.substr(begin + 1);
            var end = path.lastIndexOf(".");
            if (end >= 0)
                path = path.substring(0, end);
            return tui.text.toCamel(path.replace(/[\-\s\.\/]/g, "_"));
        }
        function load(services, names) {
            _serviceReady = false;
            var tasks = [];
            for (var i = 0; i < services.length; i++) {
                var s = services[i];
                var name = names && names[i] || getName(s);
                tasks.push(tui.ajax.getFunction(s, name));
            }
            $.when.apply(null, tasks).done(function () {
                for (var i = 0; i < arguments.length; i++) {
                    var p = arguments[i];
                    register(p[1], p[0]);
                }
                ready();
            }).fail(function () {
                _serviceReady = true;
            });
        }
        service_1.load = load;
        function register(name, fn) {
            var service = new Service();
            service._constructor = fn;
            _services[name] = service;
        }
        service_1.register = register;
        function ready() {
            for (var name_1 in _services) {
                if (_services.hasOwnProperty(name_1)) {
                    var service_2 = _services[name_1];
                    service_2._constructor.call(service_2);
                }
            }
            _serviceReady = true;
            for (var _i = 0, _readyCallbacks_1 = _readyCallbacks; _i < _readyCallbacks_1.length; _i++) {
                var cb = _readyCallbacks_1[_i];
                cb();
            }
        }
        service_1.ready = ready;
        function get(name) {
            return _services[name];
        }
        service_1.get = get;
        function onReady(fn) {
            if (_serviceReady) {
                fn();
            }
            else {
                _readyCallbacks.push(fn);
            }
        }
        service_1.onReady = onReady;
    })(service = tui.service || (tui.service = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        var _maskOpened = false;
        var _mask = document.createElement("div");
        _mask.setAttribute("unselectable", "on");
        _mask.onselectstart = function () { return false; };
        var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        $(_mask).on(mousewheelevt, function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        });
        function getEventPosition(e) {
            var positions = [];
            var event = e.originalEvent || e;
            if (event.changedTouches) {
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    positions.push({ x: touch.clientX, y: touch.clientY });
                }
            }
            else {
                positions.push({ x: event.clientX, y: event.clientY });
            }
            return positions;
        }
        widget.getEventPosition = getEventPosition;
        /**
         * Show a mask layer to prevent user drag or select document elements which don't want to be affected.
         * It's very useful when user perform a dragging operation.
         */
        function openDragMask(onMove, onClose) {
            if (onClose === void 0) { onClose = null; }
            if (_maskOpened)
                return null;
            _mask.innerHTML = "";
            _mask.className = "tui-mask";
            _mask.style.cursor = "";
            _mask.removeAttribute("tabIndex");
            _mask.removeAttribute("tooltip");
            _mask.removeAttribute("fixed-tooltip");
            document.body.appendChild(_mask);
            // _dragMoveFunc = onMove;
            function closeDragMask(e) {
                _maskOpened = false;
                if (_mask.setCapture)
                    $(_mask).off();
                else {
                    $(document).off("mousemove touchmove", onMove);
                    $(document).off("mouseup touchend", closeDragMask);
                }
                tui.browser.removeNode(_mask);
                if (typeof onClose === "function") {
                    onClose(e);
                }
                e.preventDefault();
            }
            if (_mask.setCapture) {
                _mask.setCapture();
                $(_mask).on("mousemove touchmove", onMove);
                $(_mask).on("mouseup touchend", closeDragMask);
            }
            else {
                $(document).on("mousemove touchmove", onMove);
                $(document).on("mouseup touchend", closeDragMask);
            }
            _maskOpened = true;
            return _mask;
        }
        widget.openDragMask = openDragMask;
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
/// <reference path="../text/text.ts" />
/// <reference path="../ajax/ajax.ts" />
/// <reference path="../service/service.ts" />
/// <reference path="mask.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget_1) {
        "use strict";
        function parseValue(value) {
            if (value === null || value.length === 0)
                return null;
            if (/^\{(.|\r|\n)+\}$/m.test(value)) {
                value = value.substring(1, value.length - 1);
                try {
                    return eval("(" + value + ")");
                }
                catch (e) {
                    console && console.error("Bad attribute: " + e);
                    return null;
                }
            }
            else
                return value;
        }
        var WidgetBase = (function (_super) {
            __extends(WidgetBase, _super);
            function WidgetBase() {
                _super.apply(this, arguments);
                this._data = undefined;
                this._rs = {};
            }
            //restrict
            WidgetBase.prototype.setRestriction = function (key, propCtrl) {
                if (propCtrl === null)
                    delete this._rs[key];
                else
                    this._rs[key] = propCtrl;
            };
            WidgetBase.prototype.setRestrictions = function (restrictions) {
                for (var key in restrictions) {
                    this.setRestriction(key, restrictions[key]);
                }
            };
            WidgetBase.prototype.refresh = function () {
                if (this.get("autoRefresh") === true) {
                    this.render();
                }
                return this;
            };
            WidgetBase.prototype.load = function () {
                if (typeof this._data !== tui.UNDEFINED) {
                    return;
                }
                this._data = {};
                var elem = this.getComponent();
                if (elem != null) {
                    var dataStr = elem.getAttribute("props");
                    try {
                        var tmpData = eval("(" + dataStr + ")");
                        if (tmpData instanceof Object) {
                            for (var key in tmpData) {
                                if (tmpData.hasOwnProperty(key)) {
                                    this._set(key, tmpData[key]);
                                }
                            }
                        }
                    }
                    catch (e) {
                        console && console.error("Bad props: " + e);
                    }
                    var names = [];
                    for (var i = 0; i < elem.attributes.length; i++) {
                        var attr = elem.attributes[i];
                        if (/^(style|class|tooltip|follow-tooltip|__widget__|jquery[\d]+)$/.test(attr.name.toLowerCase()))
                            continue;
                        var v = parseValue(attr.value);
                        if (v !== null)
                            this._set(tui.text.toCamel(attr.name), v);
                        if (!/^(id|name)$/i.test(attr.name.toLowerCase()))
                            names.push(attr.name);
                    }
                    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                        var name_2 = names_1[_i];
                        elem.attributes.removeNamedItem(name_2);
                        if (/^(onclick|onmousedown|onmouseup|onmousemove|ondblclick|onkeydown|onkeyup|onkeypress)$/i.test(name_2))
                            elem[name_2.toLowerCase()] = null;
                    }
                }
            };
            WidgetBase.prototype.get = function (key, defaultValue) {
                var value;
                if (typeof key === tui.UNDEFINED || key === null) {
                    value = this._data;
                }
                else if (typeof key === "string") {
                    if (this._rs[key] && typeof this._rs[key].get === "function") {
                        value = this._rs[key].get();
                    }
                    else {
                        if (typeof this._data === "object")
                            value = this._data[key];
                        else
                            value = null;
                    }
                }
                if (typeof value === tui.UNDEFINED)
                    value = null;
                if (value === null && typeof defaultValue !== tui.UNDEFINED)
                    return defaultValue;
                else
                    return value;
            };
            WidgetBase.prototype.set = function (p1, p2) {
                this._set(p1, p2);
                this.refresh();
                return this;
            };
            WidgetBase.prototype._set = function (p1, p2) {
                if (typeof p2 === tui.UNDEFINED && p1 instanceof Object) {
                    for (var key in p1) {
                        if (p1.hasOwnProperty(key))
                            this._set(key, p1[key]);
                    }
                }
                else if (typeof p1 === "string" && typeof p2 !== tui.UNDEFINED) {
                    if (this._rs[p1] && typeof this._rs[p1].set === "function") {
                        this._rs[p1].set(p2);
                    }
                    else {
                        if (p2 === null) {
                            this._data && delete this._data[p1];
                        }
                        else {
                            if (typeof this._data === "object")
                                this._data[p1] = p2;
                        }
                    }
                }
                return this;
            };
            WidgetBase.prototype.setInit = function (p1, p2) {
                if (typeof p2 === tui.UNDEFINED) {
                    if (p1 instanceof Object) {
                        for (var key in p1) {
                            if (p1.hasOwnProperty(key) && this.get(key) === null)
                                this._set(key, p1[key]);
                        }
                    }
                }
                else {
                    if (this.get(p1) === null)
                        this._set(p1, p2);
                }
                return this;
            };
            return WidgetBase;
        }(tui.EventObject));
        widget_1.WidgetBase = WidgetBase; // End of class WidgetBase
        var namedWidgets = {};
        var Widget = (function (_super) {
            __extends(Widget, _super);
            function Widget(root, initParam) {
                _super.call(this);
                this._lastWidth = null;
                this._lastHeight = null;
                this._components = {};
                if (getFullName(root) !== "tui:" + this.getNodeName()) {
                    throw new TypeError("Node type unmatched!");
                }
                this._components[''] = root;
                this._ = root;
                root.__widget__ = this;
                this.initRestriction(); // install restrictor
                this.load(); // load initial properties
                // Obtain all child nodes
                var childNodes = [];
                for (var i = 0; i < root.childNodes.length; i++) {
                    var node = root.childNodes[i];
                    childNodes.push(node);
                }
                for (var _i = 0, childNodes_1 = childNodes; _i < childNodes_1.length; _i++) {
                    var removeNode = childNodes_1[_i];
                    tui.browser.removeNode(removeNode);
                }
                this.initChildren(childNodes);
                if (typeof initParam !== tui.UNDEFINED) {
                    this._set(initParam);
                }
                this.init();
                // Any widget which has ID property will be registered in namedWidgets
                var id = this.get("id");
                if (typeof id === "string" && id.length > 0)
                    namedWidgets[id] = this;
            }
            Widget.prototype.init = function () { };
            ;
            Widget.prototype.appendTo = function (parent, refresh) {
                if (refresh === void 0) { refresh = true; }
                if (typeof parent === "string") {
                    parent = document.getElementById(parent);
                }
                if (parent && typeof parent === "object" && parent.appendChild) {
                    parent.appendChild(this._);
                    refresh && this.set("autoRefresh", true);
                }
                return this;
            };
            Widget.prototype.detach = function () {
                tui.browser.removeNode(this._);
            };
            Widget.prototype.initChildren = function (childNodes) {
                // Default do nothing ...
            };
            Widget.prototype.initRestriction = function () {
                var _this = this;
                this.setRestrictions({
                    "id": {
                        "set": function (value) {
                            var oldId = _this._.getAttribute("id");
                            if (oldId) {
                                delete namedWidgets[oldId];
                            }
                            if (typeof value === "string" && value.length > 0) {
                                namedWidgets[value] = _this;
                                _this._.setAttribute("id", value);
                            }
                            else
                                _this._.removeAttribute("id");
                        },
                        "get": function () {
                            return _this._.getAttribute("id");
                        }
                    },
                    "name": {
                        "set": function (value) {
                            if (typeof value === "string" && value.length > 0) {
                                _this._.setAttribute("name", value);
                            }
                            else
                                _this._.removeAttribute("name");
                        },
                        "get": function () {
                            return _this._.getAttribute("name");
                        }
                    },
                    "parent": {
                        "get": function () {
                            var elem = _this._.parentNode;
                            while (elem) {
                                if (elem.__widget__) {
                                    return elem.__widget__;
                                }
                                else {
                                    elem = elem.parentNode;
                                }
                            }
                            return null;
                        },
                        "set": function (value) { }
                    },
                    "disable": {
                        "get": function () {
                            var v = _this._data["disable"];
                            if (v === null || typeof v === tui.UNDEFINED) {
                                var parent_1 = _this.get("parent");
                                if (parent_1)
                                    v = parent_1.get("disable");
                                return v === null ? false : !!v;
                            }
                            else
                                return v;
                        }
                    },
                    "group": {
                        "get": function () {
                            if (_this.get("inner") === true)
                                return null;
                            if (_this._data["group"])
                                return _this._data["group"];
                            var parent = _this.get("parent");
                            if (parent && parent instanceof widget_1.Group && parent.get("name"))
                                return parent.get("name");
                            return null;
                        }
                    },
                    "tooltip": {
                        "set": function (value) {
                            if (value)
                                _this._.setAttribute("tooltip", value);
                            else
                                _this._.removeAttribute("tooltip");
                        },
                        "get": function () {
                            return _this._.getAttribute("tooltip");
                        }
                    },
                    "follow-tooltip": {
                        "set": function (value) {
                            if (value)
                                _this._.setAttribute("follow-tooltip", value);
                            else
                                _this._.removeAttribute("follow-tooltip");
                        },
                        "get": function () {
                            return _this._.getAttribute("follow-tooltip");
                        }
                    }
                });
            };
            Widget.prototype.testResize = function () {
                if (!tui.browser.isInDoc(this._))
                    return;
                if (this._.offsetWidth != this._lastWidth) {
                    this._lastWidth = this._.offsetWidth;
                    this.fire("resize");
                }
                else if (this._.offsetHeight != this._lastHeight) {
                    this._lastHeight = this._.offsetHeight;
                    this.fire("resize");
                }
            };
            Widget.prototype.getComponent = function (name) {
                if (arguments.length > 0) {
                    return this._components[name];
                }
                else {
                    return this._components[''];
                }
            };
            Widget.prototype.getNodeName = function () {
                return tui.text.toDashSplit(getClassName(this.constructor));
            };
            Widget.prototype.focus = function () {
                this._.focus();
            };
            return Widget;
        }(WidgetBase));
        widget_1.Widget = Widget; // End of class Widget
        /**
         * Any config element can extends from this class.
         */
        var Item = (function (_super) {
            __extends(Item, _super);
            function Item(root) {
                _super.call(this);
                this._ = root;
                this.load();
            }
            Item.prototype.getComponent = function (name) {
                if (arguments.length > 0) {
                    return null;
                }
                else {
                    return this._;
                }
            };
            Item.prototype.render = function () { };
            return Item;
        }(WidgetBase));
        widget_1.Item = Item; // End of ConfigNode
        var widgetRegistration = {};
        function register(constructor, type) {
            if (typeof type === "string")
                widgetRegistration["tui:" + type.toLowerCase()] = constructor;
            else {
                widgetRegistration["tui:" + tui.text.toDashSplit(getClassName(constructor))] = constructor;
            }
        }
        widget_1.register = register;
        function get(id) {
            if (typeof id === "object" && id.nodeName) {
                if (id.__widget__)
                    return id.__widget__;
                else
                    return null;
            }
            var elem = document.getElementById(id);
            if (elem === null) {
                if (namedWidgets[id])
                    return namedWidgets[id];
                else
                    return null;
            }
            if (elem.__widget__)
                return elem.__widget__;
            else
                return null;
        }
        widget_1.get = get;
        window["$$"] = get;
        function create(type, initParam) {
            if (typeof type === "function") {
                type = tui.text.toDashSplit(getClassName(type));
            }
            else if (typeof type !== "string")
                throw new TypeError("Invalid parameters.");
            var constructor = widgetRegistration["tui:" + type.toLowerCase()];
            if (typeof constructor !== "function")
                throw new Error("Undefined type: " + type);
            var element = document.createElement("tui:" + type);
            var obj;
            if (typeof initParam !== tui.UNDEFINED)
                obj = new constructor(element, initParam);
            else
                obj = new constructor(element);
            obj.set("autoRefresh", true);
            return obj;
        }
        widget_1.create = create;
        window["$new"] = create;
        function getClassName(func) {
            var results = /function\s+([^\s]+)\s*\(/.exec(func.toString());
            return (results && results.length > 1) ? results[1] : "";
        }
        widget_1.getClassName = getClassName;
        function getFullName(targetElem) {
            if (targetElem.scopeName && targetElem.scopeName.toLowerCase() === "tui") {
                if (targetElem.nodeName.toLowerCase().match("^" + targetElem.scopeName + ":") !== null)
                    return targetElem.nodeName.toLowerCase();
                else
                    return targetElem.scopeName + ":" + targetElem.nodeName.toLowerCase();
            }
            else {
                return targetElem.nodeName.toLowerCase();
            }
        }
        widget_1.getFullName = getFullName;
        function init(parent, initFunc) {
            var initSet = [];
            function searchInitCtrls(parent) {
                for (var i = 0; i < parent.childNodes.length; i++) {
                    var node = parent.childNodes[i];
                    if (node.nodeType === 1) {
                        var elem = node;
                        var constructor = widgetRegistration[getFullName(elem)];
                        if (constructor) {
                            var item = [elem, constructor];
                            initSet.push(item);
                        }
                        else
                            searchInitCtrls(elem);
                    }
                }
            }
            searchInitCtrls(parent);
            for (var _i = 0, initSet_1 = initSet; _i < initSet_1.length; _i++) {
                var item = initSet_1[_i];
                var elem = item[0];
                var constructor = item[1];
                // try {
                if (!elem.__widget__) {
                    var widget_2 = new constructor(elem);
                    if (typeof initFunc === "function") {
                        if (initFunc(widget_2))
                            widget_2.set("autoRefresh", true);
                    }
                    else
                        widget_2.set("autoRefresh", true);
                }
                else {
                    var widget_3 = elem.__widget__;
                    widget_3.refresh();
                }
            }
        }
        widget_1.init = init;
        function search(p1, p2) {
            var searchArea = null;
            var filter = null;
            if (typeof p2 === tui.UNDEFINED) {
                if (typeof p1 === "function")
                    filter = p1;
                else if (typeof p1 === "object" && p1.nodeName)
                    searchArea = p1;
            }
            else if (typeof p2 === "function") {
                searchArea = p1;
                filter = p2;
            }
            var result = [];
            if (searchArea === null) {
                searchArea = document.body;
            }
            function searchElem(parent) {
                for (var i = 0; i < parent.childNodes.length; i++) {
                    var node = parent.childNodes[i];
                    if (node.nodeType !== 1) {
                        continue;
                    }
                    var widget_4 = node.__widget__;
                    if (widget_4 && (filter && filter(widget_4) || filter === null)) {
                        result.push(widget_4);
                    }
                    else
                        searchElem(node);
                }
            }
            searchElem(searchArea);
            return result;
        }
        widget_1.search = search;
        // Detecting which widgets was resied.
        var resizeRegistration = [];
        function registerResize(constructor) {
            resizeRegistration.push("tui:" + tui.text.toDashSplit(getClassName(constructor)));
        }
        widget_1.registerResize = registerResize;
        var detectResize;
        $(window.document).ready(function () {
            tui.service.onReady(function () {
                init(document.body);
                tui.event.fire("initialized");
            });
            if (typeof document.body.scopeName === "string" && tui.ieVer < 9) {
                detectResize = function () {
                    for (var i = 0; i < resizeRegistration.length; i++) {
                        var nodes = document.getElementsByTagName(resizeRegistration[i].substr(4));
                        for (var j = 0; j < nodes.length; j++) {
                            var node = nodes[j];
                            if (node.scopeName.toUpperCase() === "TUI" && node.__widget__) {
                                node.__widget__.testResize();
                            }
                        }
                    }
                    requestAnimationFrame(detectResize);
                };
            }
            else {
                detectResize = function () {
                    for (var i = 0; i < resizeRegistration.length; i++) {
                        var nodes = document.getElementsByTagName(resizeRegistration[i]);
                        for (var j = 0; j < nodes.length; j++) {
                            var node = nodes[j];
                            if (node.__widget__) {
                                node.__widget__.testResize();
                            }
                        }
                    }
                    requestAnimationFrame(detectResize);
                };
            }
            requestAnimationFrame(detectResize);
        });
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
var tui;
(function (tui) {
    tui.get = tui.widget.get;
    tui.create = tui.widget.create;
    tui.search = tui.widget.search;
})(tui || (tui = {}));
/// <reference path="base.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        widget.dialogStack = [];
        var _mask = document.createElement("div");
        _mask.className = "tui-dialog-mask";
        _mask.setAttribute("unselectable", "on");
        var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        $(_mask).on(mousewheelevt + " selectstart", function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        });
        function reorder() {
            tui.browser.removeNode(_mask);
            if (widget.dialogStack.length > 0) {
                document.body.insertBefore(_mask, widget.dialogStack[widget.dialogStack.length - 1]._);
            }
        }
        function push(dlg) {
            widget.dialogStack.push(dlg);
            document.body.appendChild(dlg._);
            reorder();
        }
        function remove(dlg) {
            var index = widget.dialogStack.indexOf(dlg);
            if (index >= 0) {
                widget.dialogStack.splice(index, 1);
            }
            document.body.removeChild(dlg._);
            reorder();
        }
        function getParent(dlg) {
            var index = widget.dialogStack.indexOf(dlg);
            if (index > 0) {
                widget.dialogStack[index - 1];
            }
            else
                return null;
        }
        function disableSelect() {
            return false;
        }
        /**
         * <dialog>
         * Attributes: content(element or html), opened(boolean), title, buttons(button array), esc(boolean)
         * Method: open(buttonDef: string = null), close()
         * Events: open, close, click-<button name>
         */
        var Dialog = (function (_super) {
            __extends(Dialog, _super);
            function Dialog() {
                _super.apply(this, arguments);
                this._sizeTimer = null;
                this._contentSize = null;
                this._moved = false;
                this._init = true;
            }
            Dialog.prototype.initChildren = function (childNodes) {
                if (childNodes.length > 0) {
                    var div = document.createElement("div");
                    for (var _i = 0, childNodes_2 = childNodes; _i < childNodes_2.length; _i++) {
                        var node = childNodes_2[_i];
                        div.appendChild(node);
                    }
                    this._set("content", div);
                }
            };
            Dialog.prototype.init = function () {
                var _this = this;
                var root$ = $(this._);
                root$.attr("tabIndex", "-1");
                root$.html("<div class='tui-title-bar' unselectable='on'><span class='tui-text'></span><span class='tui-close'></span></div>" +
                    "<div class='tui-content'></div><div class='tui-button-bar'></div>");
                var titleBar = this._components["titleBar"] = root$.children(".tui-title-bar")[0];
                var contentDiv = this._components["content"] = root$.children(".tui-content")[0];
                var buttonBar = this._components["buttonBar"] = root$.children(".tui-button-bar")[0];
                var closeIcon = this._components["closeIcon"] = $(titleBar).children(".tui-close")[0];
                titleBar.onselectstart = disableSelect;
                buttonBar.onselectstart = disableSelect;
                var content = this.get("content");
                if (typeof content === "object" && content && content.nodeName)
                    contentDiv.appendChild(content);
                else if (typeof content === "string") {
                    contentDiv.innerHTML = content;
                }
                this.setInit("esc", true);
                widget.init(contentDiv); // Convert all child elements into tui controls
                closeIcon.onclick = function () {
                    _this.close();
                };
                tui.browser.removeNode(this._);
                $(titleBar).on("mousedown", function (e) {
                    var o = (e.target || e.srcElement);
                    if (o === closeIcon)
                        return;
                    var dialogX = _this._.offsetLeft;
                    var dialogY = _this._.offsetTop;
                    var beginX = e.clientX;
                    var beginY = e.clientY;
                    var winSize = { width: _mask.offsetWidth, height: _mask.offsetHeight };
                    var mask = tui.widget.openDragMask(function (e) {
                        var l = dialogX + e.clientX - beginX;
                        var t = dialogY + e.clientY - beginY;
                        if (l > winSize.width - _this._.offsetWidth)
                            l = winSize.width - _this._.offsetWidth;
                        if (l < 0)
                            l = 0;
                        if (t > winSize.height - _this._.offsetHeight)
                            t = winSize.height - _this._.offsetHeight;
                        if (t < 0)
                            t = 0;
                        _this._.style.left = l + "px";
                        _this._.style.top = t + "px";
                        _this._moved = true;
                    }, function (e) {
                        _this.render();
                    });
                });
                root$.on(mousewheelevt, function (ev) {
                    ev.stopPropagation();
                });
            };
            Dialog.prototype.setContent = function (content) {
                var contentDiv = this._components["content"];
                contentDiv.innerHTML = "";
                if (typeof content === "object" && content.nodeName) {
                    content.style.display = "block";
                    contentDiv.appendChild(content);
                }
                else if (typeof content === "string") {
                    contentDiv.innerHTML = content;
                }
                this.render();
            };
            Dialog.prototype.setButtons = function (buttonDef) {
                var _this = this;
                if (buttonDef === void 0) { buttonDef = null; }
                var buttonBar = this._components["buttonBar"];
                buttonBar.innerHTML = "";
                if (typeof buttonDef === "string" && buttonDef.length > 0) {
                    var names = buttonDef.split(",");
                    var _loop_1 = function(name_3) {
                        var pair = name_3.split("#");
                        var btn = widget.create(widget.Button, { text: tui.str($.trim(pair[0])) });
                        if (pair.length > 1 && $.trim(pair[1]).length > 0)
                            btn._.className = pair[1];
                        btn.on("click", function (e) {
                            _this.fire("btnclick", { e: e, button: $.trim(pair[0]) });
                        });
                        btn.appendTo(buttonBar);
                    };
                    for (var _i = 0, names_2 = names; _i < names_2.length; _i++) {
                        var name_3 = names_2[_i];
                        _loop_1(name_3);
                    }
                    buttonBar.style.display = "block";
                }
                else {
                    buttonBar.style.display = "none";
                }
                this.render();
            };
            Dialog.prototype.open = function (buttonDef) {
                var _this = this;
                if (buttonDef === void 0) { buttonDef = null; }
                if (this.get("opened"))
                    return;
                var contentDiv = this._components["content"];
                widget.init(contentDiv);
                this._init = true;
                this._moved = false;
                $(this._).css({
                    "display": "block",
                    "position": "fixed"
                });
                this._set("opened", true);
                push(this);
                this.setButtons(buttonDef);
                this._.focus();
                this.fire("open");
                this._sizeTimer = setInterval(function () {
                    if (_this._contentSize == null)
                        return;
                    if (contentDiv.scrollHeight !== _this._contentSize.height ||
                        contentDiv.scrollWidth !== _this._contentSize.width) {
                        _this.refresh();
                    }
                }, 50);
            };
            Dialog.prototype.close = function () {
                if (!this.get("opened"))
                    return;
                clearInterval(this._sizeTimer);
                this._sizeTimer = null;
                this._moved = false;
                this._contentSize = null;
                remove(this);
                this._set("opened", false);
                this.fire("close");
            };
            Dialog.prototype.render = function () {
                if (!this.get("opened"))
                    return;
                var titleBar = this._components["titleBar"];
                var buttonBar = this._components["buttonBar"];
                var contentDiv = this._components["content"];
                var closeIcon = this._components["closeIcon"];
                // Adjust title bar
                if (this.get("title") === null && !this.get("esc")) {
                    titleBar.style.display = "none";
                }
                else {
                    titleBar.style.display = "block";
                    if (this.get("esc")) {
                        closeIcon.style.display = "inline-block";
                    }
                    else
                        closeIcon.style.display = "none";
                    var titleText = $(titleBar).children(".tui-text")[0];
                    titleText.innerHTML = this.get("title") !== null ? this.get("title") : "";
                    if (tui.ieVer >= 7 && tui.ieVer < 9) {
                        titleText.style.width = "";
                        titleText.style.width = titleText.offsetWidth + "px";
                    }
                }
                // Change position
                var winSize = { width: _mask.offsetWidth, height: _mask.offsetHeight };
                var root = this._;
                var root$ = $(root);
                // Limit content size
                contentDiv.style.maxHeight = "";
                root$.css({
                    "maxWidth": winSize.width + "px",
                    "maxHeight": winSize.height + "px"
                });
                $(contentDiv).css({
                    "maxWidth": winSize.width - $(contentDiv).outerWidth() + $(contentDiv).width() + "px",
                    "maxHeight": winSize.height - titleBar.offsetHeight - buttonBar.offsetHeight - $(contentDiv).outerHeight() + $(contentDiv).height() + "px"
                });
                var box = {
                    left: root.offsetLeft,
                    top: root.offsetTop,
                    width: root.offsetWidth,
                    height: root.offsetHeight
                };
                if (this._init) {
                    var parent = getParent(this);
                    var centX, centY;
                    if (parent) {
                        var e = parent._;
                        centX = e.offsetLeft + e.offsetWidth / 2;
                        centY = e.offsetTop + e.offsetHeight / 2;
                        this._moved = true;
                    }
                    else {
                        centX = winSize.width / 2;
                        centY = winSize.height / 2;
                        this._moved = false;
                    }
                    box.left = centX - box.width / 2;
                    box.top = centY - box.height / 2;
                    this._init = false;
                }
                else {
                    if (!this._moved) {
                        box.left = (winSize.width - box.width) / 2;
                        box.top = (winSize.height - box.height) / 2;
                    }
                }
                if (box.left + box.width > winSize.width)
                    box.left = winSize.width - box.width;
                if (box.top + box.height > winSize.height)
                    box.top = winSize.height - box.height;
                if (box.left < 0)
                    box.left = 0;
                if (box.top < 0)
                    box.top = 0;
                this._.style.left = box.left + "px";
                this._.style.top = box.top + "px";
                this._contentSize = { width: contentDiv.scrollWidth, height: contentDiv.scrollHeight };
            };
            return Dialog;
        }(widget.Widget));
        widget.Dialog = Dialog; // End of Dialog class
        widget.register(Dialog);
        $(document).on("keydown", function (e) {
            var k = e.keyCode;
            if (widget.dialogStack.length <= 0)
                return;
            var dlg = widget.dialogStack[widget.dialogStack.length - 1];
            if (k === tui.browser.KeyCode.ESCAPE) {
                dlg.get("esc") && dlg.close();
            }
            else if (k === tui.browser.KeyCode.TAB) {
                setTimeout(function () {
                    if (!tui.browser.isPosterity(dlg._, document.activeElement)) {
                        dlg._.focus();
                    }
                });
            }
        });
        $(window).resize(function () {
            for (var i = 0; i < widget.dialogStack.length; i++) {
                widget.dialogStack[i].refresh();
            }
        });
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
var tui;
(function (tui) {
    "use strict";
    function makeContent(message, className) {
        return tui.text.format("<table align='center' class='tui-msg-container'><tr><td class='{1}'><span></span></td><td>{0}</td></tr></table>", message, className);
    }
    function makeDialog(message, className, title, btn, callback, esc) {
        if (btn === void 0) { btn = "ok#tui-primary"; }
        if (callback === void 0) { callback = null; }
        if (esc === void 0) { esc = true; }
        var dlg = tui.widget.create("dialog", {
            "content": makeContent(message, className),
            "title": title,
            "esc": esc
        });
        dlg.on("btnclick", function (e) {
            dlg.close();
            if (callback)
                callback(e.data.button);
        });
        dlg.open(btn);
        return dlg;
    }
    function msgbox(message, title) {
        return makeDialog(message, "tui-msg-box", title);
    }
    tui.msgbox = msgbox;
    function infobox(message, title) {
        return makeDialog(message, "tui-info-box", title);
    }
    tui.infobox = infobox;
    function okbox(message, title) {
        return makeDialog(message, "tui-ok-box", title);
    }
    tui.okbox = okbox;
    function errbox(message, title) {
        return makeDialog(message, "tui-err-box", title);
    }
    tui.errbox = errbox;
    function warnbox(message, title) {
        return makeDialog(message, "tui-warn-box", title);
    }
    tui.warnbox = warnbox;
    function askbox(message, title, callback) {
        if (typeof title === "function")
            callback = title;
        return makeDialog(message, "tui-ask-box", title, "ok#tui-primary,cancel", function (buttonName) {
            if (typeof callback === "function")
                callback(buttonName === "ok");
        });
    }
    tui.askbox = askbox;
    var refCount = 0;
    var waitDlg = null;
    var waitMsg = null;
    function waitbox(message) {
        if (waitDlg == null) {
            refCount = 0;
            waitMsg = [message];
            waitDlg = makeDialog(message, "tui-wait-box", null, null, null, false);
        }
        else {
            waitMsg.push(message);
            waitDlg.setContent(makeContent(message, "tui-wait-box"));
        }
        var index = waitMsg.length - 1;
        refCount++;
        var closed = false;
        return {
            close: function () {
                if (!closed) {
                    refCount--;
                    closed = true;
                    waitMsg[index] = null;
                    for (var i = index - 1; i >= 0; i--) {
                        if (waitMsg[i] != null) {
                            waitDlg.setContent(makeContent(waitMsg[i], "tui-wait-box"));
                            break;
                        }
                    }
                    if (refCount === 0) {
                        waitDlg.close();
                        waitDlg = null;
                        waitMsg = null;
                    }
                }
            },
            setMessage: function (message) {
                if (!closed) {
                    waitMsg[index] = message;
                    if (index === waitMsg.length - 1)
                        waitDlg.setContent(makeContent(message, "tui-wait-box"));
                }
            }
        };
    }
    tui.waitbox = waitbox;
    function progressbox(message, cancelProc) {
        if (cancelProc === void 0) { cancelProc = null; }
        // TODO: NOT FINISHED
        return null;
    }
    tui.progressbox = progressbox;
})(tui || (tui = {}));
/// <reference path="../core.ts" />
/// <reference path="../widget/dialog.ts" />
var tui;
(function (tui) {
    var ajax;
    (function (ajax) {
        $.ajaxSetup({
            "timeout": 30000,
            "xhrFields": {
                'withCredentials': true
            }
        });
        function send(url, method, data, options) {
            var deffered = $.Deferred();
            var waitbox = null;
            if (!options || !options["silent"])
                waitbox = tui.waitbox(tui.str("Processing..."));
            var ajaxData = {
                "type": method.toUpperCase(),
                "url": url,
                "contentType": "application/json",
                "data": (method.toUpperCase() === "GET" ? data : JSON.stringify(data)),
                "complete": function (jqXHR, status) {
                    waitbox && waitbox.close();
                    if (status === "success") {
                        var respJson = /^\s*application\/json\s*(;.+)?/i.test(jqXHR.getResponseHeader("content-type"));
                        var respVal = (respJson ? jqXHR.responseJSON : jqXHR.responseText);
                        deffered.resolve(respVal, jqXHR);
                    }
                    else {
                        var plainType = /^\s*text\/plain\s*(;.+)?/i.test(jqXHR.getResponseHeader("content-type"));
                        var respText;
                        if (plainType && jqXHR.responseText)
                            respText = tui.str(jqXHR.responseText);
                        else {
                            if (jqXHR.status != 0)
                                respText = tui.str(status) + " (" + jqXHR.status + ")";
                            else
                                respText = "Operation was canceled!";
                        }
                        if ((!options || !options["silent"]) && jqXHR.status != 0)
                            tui.errbox(respText);
                        deffered.reject(jqXHR.status, respText, jqXHR);
                    }
                },
                "processData": false
            };
            if (options) {
                for (var k in options) {
                    if (options.hasOwnProperty(k)) {
                        ajaxData[k] = options[k];
                    }
                }
            }
            $.ajax(ajaxData);
            return deffered;
        }
        ajax.send = send;
        function post(url, data, options) {
            return send(url, "post", data, options);
        }
        ajax.post = post;
        function post_(url, data, options) {
            if (!options)
                options = { "silent": true };
            else
                options["silent"] = true;
            return send(url, "post", data, options);
        }
        ajax.post_ = post_;
        function get(url, options) {
            return send(url, "get", null, options);
        }
        ajax.get = get;
        function get_(url, options) {
            if (!options)
                options = { "silent": true };
            else
                options["silent"] = true;
            return send(url, "get", null, options);
        }
        ajax.get_ = get_;
        function getScript(url) {
            var deffered = $.Deferred();
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200)
                        deffered.resolve(xhr.responseText, xhr);
                    else
                        deffered.reject(xhr.status, xhr.responseText, xhr);
                }
            };
            xhr.open("GET", url, true);
            xhr.send(null);
            return deffered;
        }
        ajax.getScript = getScript;
        var TAG = /<(\/?[a-z0-9_\-:]+)(\s+[a-z0-9_\-]+(\s*=('[^']*'|"[^"]*"|[^\s>]+)))*\/?>/img;
        var SCRIPT_END = /<\/\s*script(\s+[a-z0-9_\-]+(\s*=('[^']*'|"[^"]*"|[^\s>]+)))*>/img;
        function getHtmlBody(result) {
            // To compatible IE 8~9 I must parse html by myself!
            if (result == null || result.length == 0)
                return document.createElement("body");
            TAG.lastIndex = 0;
            var len = result.length;
            var m;
            var bodyStart = null;
            var bodyEnd = null;
            while ((m = TAG.exec(result)) != null) {
                var tag = m[1].toLowerCase();
                if (tag === "script") {
                    SCRIPT_END.lastIndex = TAG.lastIndex;
                    var scriptEnd = SCRIPT_END.exec(result);
                    if (scriptEnd == null)
                        break;
                    TAG.lastIndex = SCRIPT_END.lastIndex;
                }
                else if (tag === "body") {
                    bodyStart = TAG.lastIndex;
                }
                else if (tag === "/body") {
                    bodyEnd = m.index;
                }
                else if (tag === "/html") {
                    if (bodyEnd == null)
                        bodyEnd = m.index;
                }
            }
            if (bodyStart != null) {
                if (bodyEnd != null && bodyEnd >= bodyStart) {
                    result = result.substring(bodyStart, bodyEnd);
                }
                else {
                    result = result.substring(bodyStart);
                }
            }
            var body = document.createElement("body");
            body.innerHTML = result;
            return body;
        }
        function getBody(url) {
            var deffered = $.Deferred();
            getScript(url).done(function (result) {
                deffered.resolve(getHtmlBody(result).innerHTML);
            }).fail(function (status, responseText, xhr) {
                deffered.reject(status, responseText, xhr);
            });
            return deffered;
        }
        ajax.getBody = getBody;
        function getComponent(url) {
            var deffered = $.Deferred();
            getScript(url).done(function (result) {
                var body = getHtmlBody(result);
                for (var i = 0; i < body.children.length; i++) {
                    var child = body.children[i];
                    if (tui.widget.getFullName(child) === "tui:component") {
                        var handler = child.getAttribute("handler");
                        if (handler && handler.trim()) {
                            if (!tui.text.isAbsUrl(handler)) {
                                handler = tui.text.joinUrl(tui.text.getBaseUrl(url), handler);
                            }
                        }
                        deffered.resolve(child.innerHTML, handler ? handler : null);
                        return;
                    }
                }
                deffered.resolve(body.innerHTML);
            }).fail(function (status, responseText, xhr) {
                deffered.reject(status, responseText, xhr);
            });
            return deffered;
        }
        ajax.getComponent = getComponent;
        function getFunction(url, param) {
            var deffered = $.Deferred();
            getScript(url).done(function (result) {
                var fn = eval("(0,function(){\n" + result + "})"
                    + "\n//# sourceURL=" + url);
                deffered.resolve(fn, param);
            }).fail(function (status, responseText, xhr) {
                deffered.reject(status, responseText, xhr);
            });
            return deffered;
        }
        ajax.getFunction = getFunction;
        window.$ajax = send;
        window.$post = post;
        window.$post_ = post_; // silent mode
        window.$get = get;
        window.$get_ = get_; // silent mode
    })(ajax = tui.ajax || (tui.ajax = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
var tui;
(function (tui) {
    var browser;
    (function (browser) {
        "use strict";
        var BackupedScrollPosition = (function () {
            function BackupedScrollPosition(target) {
                this.backupInfo = [];
                var obj = target;
                while (obj && obj !== document.body) {
                    obj = obj.parentElement;
                    if (obj)
                        this.backupInfo.push({ obj: obj, left: obj.scrollLeft, top: obj.scrollTop });
                }
            }
            BackupedScrollPosition.prototype.restore = function () {
                for (var i = 0; i < this.backupInfo.length; i++) {
                    var item = this.backupInfo[i];
                    item.obj.scrollLeft = item.left;
                    item.obj.scrollTop = item.top;
                }
            };
            return BackupedScrollPosition;
        }());
        browser.BackupedScrollPosition = BackupedScrollPosition;
        function backupScrollPosition(target) {
            return new BackupedScrollPosition(target);
        }
        browser.backupScrollPosition = backupScrollPosition;
        function focusWithoutScroll(target) {
            setTimeout(function () {
                if (tui.ieVer > 0) {
                    target.setActive();
                }
                else if (tui.ffVer > 0)
                    target.focus();
                else {
                    var backup = tui.browser.backupScrollPosition(target);
                    target.focus();
                    backup.restore();
                }
            }, 0);
        }
        browser.focusWithoutScroll = focusWithoutScroll;
        function scrollToElement(elem, p1, p2) {
            var distance = 0;
            if (typeof p1 === "number")
                distance = p1;
            var cb = null;
            if (typeof p1 === "function" && typeof p2 === tui.UNDEFINED)
                cb = p1;
            if (typeof p2 === "function")
                cb = p2;
            $(getWindowScrollElement()).animate({ scrollTop: $(elem).offset().top - distance }, 200, cb);
        }
        browser.scrollToElement = scrollToElement;
        function toElement(html, withParentDiv) {
            if (withParentDiv === void 0) { withParentDiv = false; }
            var div = document.createElement("div");
            div.innerHTML = $.trim(html);
            if (withParentDiv)
                return div;
            var el = div.firstChild;
            return div.removeChild(el);
        }
        browser.toElement = toElement;
        function toHTML(node) {
            var elem = document.createElement("span");
            if (typeof node.nodeName === "string") {
                elem.appendChild(node);
            }
            else if (typeof node.length === "number") {
                for (var i = 0; i < node.length; i++) {
                    elem.appendChild(node[i]);
                }
            }
            return elem.innerHTML;
        }
        browser.toHTML = toHTML;
        function removeNode(node) {
            node.parentNode && node.parentNode.removeChild(node);
        }
        browser.removeNode = removeNode;
        function toSafeText(text) {
            return text.replace(/<|>|&/g, function (str) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (str === "<")
                    return "&lt;";
                else if (str === "<")
                    return "&gt;";
                else if (str === "&")
                    return "&amp;";
                else
                    return str;
            });
        }
        browser.toSafeText = toSafeText;
        /**
         * Get or set a HTMLElement's text content, return Element's text content.
         * @param elem {HTMLElement or ID of the element} Objective element
         * @param text {string or boolean}
         */
        function nodeText(elem, text) {
            if (typeof elem === "string")
                elem = document.getElementById(elem);
            if (elem) {
                if (typeof text === "string") {
                    elem.innerHTML = "";
                    elem.appendChild(document.createTextNode(text));
                    return text;
                }
                if (typeof text !== "boolean")
                    text = true;
                var buf = "";
                for (var i = 0; i < elem.childNodes.length; i++) {
                    var c = elem.childNodes[i];
                    if (c.nodeName.toLowerCase() === "#text") {
                        buf += c.nodeValue;
                    }
                    else if (text)
                        buf += nodeText(c);
                }
                return buf;
            }
            else
                return null;
        }
        function getNodeText(elem) {
            return nodeText(elem);
        }
        browser.getNodeText = getNodeText;
        function setNodeText(elem, text) {
            nodeText(elem, text);
        }
        browser.setNodeText = setNodeText;
        function getNodeOwnText(elem) {
            return nodeText(elem, false);
        }
        browser.getNodeOwnText = getNodeOwnText;
        function getRectOfParent(elem) {
            if (elem === null)
                return null;
            return {
                left: elem.offsetLeft,
                top: elem.offsetTop,
                width: elem.offsetWidth,
                height: elem.offsetHeight
            };
        }
        browser.getRectOfParent = getRectOfParent;
        function getRectOfPage(elem) {
            if (elem === null)
                return null;
            var offset = $(elem).offset();
            return {
                left: offset.left,
                top: offset.top,
                width: elem.offsetWidth,
                height: elem.offsetHeight
            };
        }
        browser.getRectOfPage = getRectOfPage;
        function getRectOfScreen(elem) {
            if (elem === null)
                return null;
            var offset = $(elem).offset();
            var $doc = $(document);
            return {
                left: offset.left - $doc.scrollLeft(),
                top: offset.top - $doc.scrollTop(),
                width: elem.offsetWidth,
                height: elem.offsetHeight
            };
        }
        browser.getRectOfScreen = getRectOfScreen;
        /**
         * Get top window's body element
         */
        function getTopBody() {
            return top.document.body || top.document.getElementsByTagName("BODY")[0];
        }
        browser.getTopBody = getTopBody;
        /**
         * Get element's owner window
         */
        function getWindow(elem) {
            return elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow;
        }
        browser.getWindow = getWindow;
        function getWindowScrollElement() {
            if (tui.ieVer > 0 || tui.ffVer > 0) {
                return window.document.documentElement;
            }
            else {
                return window.document.body;
            }
        }
        browser.getWindowScrollElement = getWindowScrollElement;
        var keepTopList = [];
        function keepTopProc() {
            var scrollWindow = browser.getWindowScrollElement();
            for (var _i = 0, keepTopList_1 = keepTopList; _i < keepTopList_1.length; _i++) {
                var item = keepTopList_1[_i];
                var rect = browser.getRectOfScreen(item.elem);
                if (rect.top < item.top) {
                    item.oldPosition = item.elem.style.position;
                    item.oldTop = item.elem.style.top;
                    item.oldLeft = item.elem.style.left;
                    item.oldWidth = item.elem.style.width;
                    item.oldZIndex = item.elem.style.zIndex;
                    item.scrollTop = scrollWindow.scrollTop;
                    item.scrollLeft = scrollWindow.scrollLeft;
                    item.elem.style.zIndex = "1000";
                    item.elem.style.width = item.elem.clientWidth + "px";
                    item.elem.style.position = "fixed";
                    item.elem.style.top = item.top + "px";
                    item.elem.style.left = rect.left + "px";
                    item.itemLeft = rect.left;
                    item.keepTop = true;
                }
                else if (scrollWindow.scrollTop < item.scrollTop) {
                    item.elem.style.position = item.oldPosition;
                    item.elem.style.top = item.oldTop;
                    item.elem.style.left = item.oldLeft;
                    item.elem.style.width = item.oldWidth;
                    item.keepTop = false;
                }
                else if (item.keepTop) {
                    item.elem.style.left = (item.itemLeft - scrollWindow.scrollLeft + item.scrollLeft) + "px";
                }
            }
        }
        $(window).scroll(keepTopProc);
        function keepToTop(elem, top) {
            if (top === void 0) { top = 0; }
            keepTopList.push({ keepTop: false, elem: elem, top: top });
        }
        browser.keepToTop = keepToTop;
        function cancelKeepToTop(elem) {
            var newList = [];
            for (var _i = 0, keepTopList_2 = keepTopList; _i < keepTopList_2.length; _i++) {
                var item = keepTopList_2[_i];
                if (item.elem !== elem) {
                    newList.push(item);
                }
                else {
                    item.elem.style.position = item.oldPosition;
                    item.elem.style.top = item.oldTop;
                    item.elem.style.left = item.oldLeft;
                    item.elem.style.width = item.oldWidth;
                    item.keepTop = false;
                }
            }
            keepTopList = newList;
        }
        browser.cancelKeepToTop = cancelKeepToTop;
        function getCurrentStyle(elem) {
            if (elem.currentStyle)
                return elem.currentStyle;
            else if (window.getComputedStyle) {
                return window.getComputedStyle(elem);
            }
            else
                return elem.style;
        }
        browser.getCurrentStyle = getCurrentStyle;
        /**
         * Test whether the button code is indecated that the event is triggered by a left mouse button.
         */
        function isLButton(e) {
            var button = (typeof e.which !== "undefined") ? e.which : e.button;
            if (button == 1) {
                return true;
            }
            else
                return false;
        }
        browser.isLButton = isLButton;
        /**
         * Prevent user press backspace key to go back to previous page
         */
        function banBackspace() {
            function ban(e) {
                var ev = e || window.event;
                var obj = ev.target || ev.srcElement;
                var t = obj.type || obj.getAttribute('type');
                var vReadOnly = obj.readOnly;
                var vDisabled = obj.disabled;
                vReadOnly = (typeof vReadOnly === tui.UNDEFINED) ? false : vReadOnly;
                vDisabled = (typeof vDisabled === tui.UNDEFINED) ? true : vDisabled;
                var flag1 = ev.keyCode === 8 && (t === "password" || t === "text" || t === "textarea") && (vReadOnly || vDisabled);
                var flag2 = ev.keyCode === 8 && t !== "password" && t !== "text" && t !== "textarea";
                if (flag2 || flag1)
                    return false;
            }
            $(document).bind("keypress", ban);
            $(document).bind("keydown", ban);
        }
        browser.banBackspace = banBackspace;
        function cancelDefault(event) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            else {
                event.returnValue = false;
            }
            return false;
        }
        browser.cancelDefault = cancelDefault;
        function cancelBubble(event) {
            if (event && event.stopPropagation)
                event.stopPropagation();
            else
                window.event.cancelBubble = true;
            return false;
        }
        browser.cancelBubble = cancelBubble;
        /**
         * Detect whether the given parent element is the real ancestry element
         * @param elem
         * @param parent
         */
        function isAncestry(elem, parent) {
            while (elem) {
                if (elem === parent)
                    return true;
                else
                    elem = elem.parentNode;
            }
            return false;
        }
        browser.isAncestry = isAncestry;
        /**
         * Detect whether the given child element is the real posterity element
         * @param elem
         * @param child
         */
        function isPosterity(elem, child) {
            return isAncestry(child, elem);
        }
        browser.isPosterity = isPosterity;
        function isFireInside(elem, event) {
            var target = event.target || event.srcElement;
            return isPosterity(elem, target);
        }
        browser.isFireInside = isFireInside;
        /**
         * Detect whether the element is inside the document
         * @param {type} elem
         */
        function isInDoc(elem) {
            var obj = elem;
            while (obj) {
                if (obj.nodeName.toUpperCase() === "HTML")
                    return true;
                obj = obj.parentElement;
            }
            return false;
        }
        browser.isInDoc = isInDoc;
        /**
         * Set cookie value
         * @param name
         * @param value
         * @param expires valid days
         */
        function saveCookie(name, value, expires, path, domain, secure) {
            if (secure === void 0) { secure = false; }
            // set time, it's in milliseconds
            var today = new Date();
            today.setTime(today.getTime());
            /*
            if the expires variable is set, make the correct
            expires time, the current script below will set
            it for x number of days, to make it for hours,
            delete * 24, for minutes, delete * 60 * 24
            */
            if (expires) {
                expires = expires * 1000 * 60 * 60 * 24;
            }
            var expires_date = new Date(today.getTime() + (expires));
            document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) +
                ((expires) ? ";expires=" + expires_date.toUTCString() : "") +
                ((path) ? ";path=" + path : "") +
                ((domain) ? ";domain=" + domain : "") +
                ((secure) ? ";secure" : "");
        }
        browser.saveCookie = saveCookie;
        /**
         * Get cookie value
         * @param name
         */
        function loadCookie(name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr !== null)
                return JSON.parse(decodeURIComponent(arr[2]));
            else
                return null;
        }
        browser.loadCookie = loadCookie;
        /**
         * Delete cookie
         * @param name
         */
        function deleteCookie(name, path, domain) {
            if (loadCookie(name))
                document.cookie = name + "=" +
                    ((path) ? ";path=" + path : "") +
                    ((domain) ? ";domain=" + domain : "") +
                    ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
        }
        browser.deleteCookie = deleteCookie;
        /**
         * Save key value into local storage, if local storage doesn't usable then use local cookie instead.
         * @param {String} key
         * @param {String} value
         * @param {Boolean} sessionOnly If true data only be keeped in this session
         */
        function saveData(key, value, sessionOnly) {
            if (sessionOnly === void 0) { sessionOnly = false; }
            try {
                var storage = (sessionOnly === true ? window.sessionStorage : window.localStorage);
                if (storage) {
                    storage.setItem(key, JSON.stringify(value));
                }
                else
                    saveCookie(key, value, 365);
            }
            catch (e) {
            }
        }
        browser.saveData = saveData;
        /**
         * Load value from local storage, if local storage doesn't usable then use local cookie instead.
         * @param {String} key
         * @param {Boolean} sessionOnly If true data only be keeped in this session
         */
        function loadData(key, sessionOnly) {
            if (sessionOnly === void 0) { sessionOnly = false; }
            try {
                var storage = (sessionOnly === true ? window.sessionStorage : window.localStorage);
                if (storage)
                    return JSON.parse(storage.getItem(key));
                else
                    return loadCookie(key);
            }
            catch (e) {
                return null;
            }
        }
        browser.loadData = loadData;
        /**
         * Remove value from local storage, if local storage doesn't usable then use local cookie instead.
         * @param key
         * @param {Boolean} sessionOnly If true data only be keeped in this session
         */
        function deleteData(key, sessionOnly) {
            if (sessionOnly === void 0) { sessionOnly = false; }
            try {
                var storage = (sessionOnly === true ? window.sessionStorage : window.localStorage);
                if (storage)
                    storage.removeItem(key);
                else
                    deleteCookie(key);
            }
            catch (e) {
            }
        }
        browser.deleteData = deleteData;
        var _accMap = {};
        function accelerate(e) {
            var k = browser.KeyCode[e.keyCode];
            if (!k) {
                return;
            }
            k = k.toUpperCase();
            var key = (e.ctrlKey ? "CTRL" : "");
            if (e.altKey) {
                if (key.length > 0)
                    key += "+";
                key += "ALT";
            }
            if (e.shiftKey) {
                if (key.length > 0)
                    key += "+";
                key += "SHIFT";
            }
            if (e.metaKey) {
                if (key.length > 0)
                    key += "+";
                key += "META";
            }
            if (key.length > 0)
                key += "+";
            key += k;
            var l = _accMap[key];
            if (l) {
                for (var i = 0; i < l.length; i++) {
                    if (tui.event.fire("accelerate", { name: l[i], event: e }) === false)
                        return;
                }
            }
        }
        function addAccelerate(key, actionId) {
            key = key.toUpperCase();
            var l = null;
            if (_accMap.hasOwnProperty(key))
                l = _accMap[key];
            else {
                l = [];
                _accMap[key] = l;
            }
            if (l.indexOf(actionId) < 0)
                l.push(actionId);
        }
        browser.addAccelerate = addAccelerate;
        function deleteAccelerate(key, actionId) {
            key = key.toUpperCase();
            if (!_accMap.hasOwnProperty(key))
                return;
            var l = _accMap[key];
            var pos = l.indexOf(actionId);
            if (pos >= 0) {
                l.splice(pos, 1);
                if (l.length <= 0)
                    delete _accMap[key];
            }
        }
        browser.deleteAccelerate = deleteAccelerate;
        $(document).keydown(accelerate);
        function getUrlParam(key) {
            var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return decodeURIComponent(r[2]);
            return null;
        }
        browser.getUrlParam = getUrlParam;
        function getEventPosition(e, allFingers) {
            if (allFingers === void 0) { allFingers = false; }
            var positions = [];
            var event = e.originalEvent || e;
            if (event.touches) {
                var touchList = (allFingers ? event.touches : event.changedTouches);
                for (var i = 0; i < touchList.length; i++) {
                    var touch = touchList[i];
                    positions.push({ x: touch.clientX, y: touch.clientY, id: touch.identifier });
                }
            }
            else {
                positions.push({ x: event.clientX, y: event.clientY });
            }
            return positions;
        }
        browser.getEventPosition = getEventPosition;
        function setInnerHtml(elem, content) {
            if (tui.ieVer > 0 && tui.ieVer < 9) {
                elem.innerHTML = "";
                var d = document.createElement("div");
                d.innerHTML = content;
                while (d.children.length > 0)
                    elem.appendChild(d.children[0]);
            }
            else {
                elem && (elem.innerHTML = content);
            }
        }
        browser.setInnerHtml = setInnerHtml;
        window.$text = toSafeText;
    })(browser = tui.browser || (tui.browser = {}));
})(tui || (tui = {}));
var tui;
(function (tui) {
    var browser;
    (function (browser) {
        "use strict";
        (function (KeyCode) {
            KeyCode[KeyCode["BACK"] = 8] = "BACK";
            KeyCode[KeyCode["TAB"] = 9] = "TAB";
            KeyCode[KeyCode["ENTER"] = 13] = "ENTER";
            KeyCode[KeyCode["SHIFT"] = 16] = "SHIFT";
            KeyCode[KeyCode["CTRL"] = 17] = "CTRL";
            KeyCode[KeyCode["ALT"] = 18] = "ALT";
            KeyCode[KeyCode["PAUSE"] = 19] = "PAUSE";
            KeyCode[KeyCode["CAPS"] = 20] = "CAPS";
            KeyCode[KeyCode["ESCAPE"] = 27] = "ESCAPE";
            KeyCode[KeyCode["SPACE"] = 32] = "SPACE";
            KeyCode[KeyCode["PRIOR"] = 33] = "PRIOR";
            KeyCode[KeyCode["NEXT"] = 34] = "NEXT";
            KeyCode[KeyCode["END"] = 35] = "END";
            KeyCode[KeyCode["HOME"] = 36] = "HOME";
            KeyCode[KeyCode["LEFT"] = 37] = "LEFT";
            KeyCode[KeyCode["UP"] = 38] = "UP";
            KeyCode[KeyCode["RIGHT"] = 39] = "RIGHT";
            KeyCode[KeyCode["DOWN"] = 40] = "DOWN";
            KeyCode[KeyCode["PRINT"] = 44] = "PRINT";
            KeyCode[KeyCode["INSERT"] = 45] = "INSERT";
            KeyCode[KeyCode["DELETE"] = 46] = "DELETE";
            KeyCode[KeyCode["KEY_0"] = 48] = "KEY_0";
            KeyCode[KeyCode["KEY_1"] = 49] = "KEY_1";
            KeyCode[KeyCode["KEY_2"] = 50] = "KEY_2";
            KeyCode[KeyCode["KEY_3"] = 51] = "KEY_3";
            KeyCode[KeyCode["KEY_4"] = 52] = "KEY_4";
            KeyCode[KeyCode["KEY_5"] = 53] = "KEY_5";
            KeyCode[KeyCode["KEY_6"] = 54] = "KEY_6";
            KeyCode[KeyCode["KEY_7"] = 55] = "KEY_7";
            KeyCode[KeyCode["KEY_8"] = 56] = "KEY_8";
            KeyCode[KeyCode["KEY_9"] = 57] = "KEY_9";
            KeyCode[KeyCode["SEMICOLON"] = 59] = "SEMICOLON";
            KeyCode[KeyCode["EQUALS"] = 61] = "EQUALS";
            KeyCode[KeyCode["A"] = 65] = "A";
            KeyCode[KeyCode["B"] = 66] = "B";
            KeyCode[KeyCode["C"] = 67] = "C";
            KeyCode[KeyCode["D"] = 68] = "D";
            KeyCode[KeyCode["E"] = 69] = "E";
            KeyCode[KeyCode["F"] = 70] = "F";
            KeyCode[KeyCode["G"] = 71] = "G";
            KeyCode[KeyCode["H"] = 72] = "H";
            KeyCode[KeyCode["I"] = 73] = "I";
            KeyCode[KeyCode["J"] = 74] = "J";
            KeyCode[KeyCode["K"] = 75] = "K";
            KeyCode[KeyCode["L"] = 76] = "L";
            KeyCode[KeyCode["M"] = 77] = "M";
            KeyCode[KeyCode["N"] = 78] = "N";
            KeyCode[KeyCode["O"] = 79] = "O";
            KeyCode[KeyCode["P"] = 80] = "P";
            KeyCode[KeyCode["Q"] = 81] = "Q";
            KeyCode[KeyCode["R"] = 82] = "R";
            KeyCode[KeyCode["S"] = 83] = "S";
            KeyCode[KeyCode["T"] = 84] = "T";
            KeyCode[KeyCode["U"] = 85] = "U";
            KeyCode[KeyCode["V"] = 86] = "V";
            KeyCode[KeyCode["W"] = 87] = "W";
            KeyCode[KeyCode["X"] = 88] = "X";
            KeyCode[KeyCode["Y"] = 89] = "Y";
            KeyCode[KeyCode["Z"] = 90] = "Z";
            KeyCode[KeyCode["WINDOWS"] = 91] = "WINDOWS";
            KeyCode[KeyCode["NUM_0"] = 96] = "NUM_0";
            KeyCode[KeyCode["NUM_1"] = 97] = "NUM_1";
            KeyCode[KeyCode["NUM_2"] = 98] = "NUM_2";
            KeyCode[KeyCode["NUM_3"] = 99] = "NUM_3";
            KeyCode[KeyCode["NUM_4"] = 100] = "NUM_4";
            KeyCode[KeyCode["NUM_5"] = 101] = "NUM_5";
            KeyCode[KeyCode["NUM_6"] = 102] = "NUM_6";
            KeyCode[KeyCode["NUM_7"] = 103] = "NUM_7";
            KeyCode[KeyCode["NUM_8"] = 104] = "NUM_8";
            KeyCode[KeyCode["NUM_9"] = 105] = "NUM_9";
            KeyCode[KeyCode["NUM_MUL"] = 106] = "NUM_MUL";
            KeyCode[KeyCode["NUM_PLUS"] = 107] = "NUM_PLUS";
            KeyCode[KeyCode["NUM_MINUS"] = 109] = "NUM_MINUS";
            KeyCode[KeyCode["NUM_DOT"] = 110] = "NUM_DOT";
            KeyCode[KeyCode["NUM_DIV"] = 111] = "NUM_DIV";
            KeyCode[KeyCode["F1"] = 112] = "F1";
            KeyCode[KeyCode["F2"] = 113] = "F2";
            KeyCode[KeyCode["F3"] = 114] = "F3";
            KeyCode[KeyCode["F4"] = 115] = "F4";
            KeyCode[KeyCode["F5"] = 116] = "F5";
            KeyCode[KeyCode["F6"] = 117] = "F6";
            KeyCode[KeyCode["F7"] = 118] = "F7";
            KeyCode[KeyCode["F8"] = 119] = "F8";
            KeyCode[KeyCode["F9"] = 120] = "F9";
            KeyCode[KeyCode["F10"] = 121] = "F10";
            KeyCode[KeyCode["F11"] = 122] = "F11";
            KeyCode[KeyCode["F12"] = 123] = "F12";
            KeyCode[KeyCode["DASH"] = 173] = "DASH";
            KeyCode[KeyCode["COMMA"] = 188] = "COMMA";
            KeyCode[KeyCode["PERIOD"] = 190] = "PERIOD";
            KeyCode[KeyCode["SLASH"] = 191] = "SLASH";
            KeyCode[KeyCode["GRAVE"] = 192] = "GRAVE";
            KeyCode[KeyCode["LEFT_BRACKET"] = 219] = "LEFT_BRACKET";
            KeyCode[KeyCode["BACKSLASH"] = 220] = "BACKSLASH";
            KeyCode[KeyCode["RIGHT_BRACKET"] = 221] = "RIGHT_BRACKET";
            KeyCode[KeyCode["QUOTE"] = 222] = "QUOTE";
        })(browser.KeyCode || (browser.KeyCode = {}));
        var KeyCode = browser.KeyCode;
    })(browser = tui.browser || (tui.browser = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
/// <reference path="browser.ts" />
var tui;
(function (tui) {
    var browser;
    (function (browser) {
        "use strict";
        var _rules;
        var _handler;
        function hashChange() {
            var hash = location.hash;
            var state = null;
            if (hash) {
                var p = hash.indexOf("?");
                if (p >= 0)
                    state = hash.substring(1, p);
                else
                    state = hash.substring(1);
            }
            if (_rules) {
                var matchRule = null;
                for (var _i = 0, _rules_1 = _rules; _i < _rules_1.length; _i++) {
                    var r = _rules_1[_i];
                    if (r.state === state) {
                        matchRule = r;
                        break;
                    }
                }
                if (matchRule == null) {
                    for (var _a = 0, _rules_2 = _rules; _a < _rules_2.length; _a++) {
                        var r = _rules_2[_a];
                        if (r.state === "/") {
                            matchRule = r;
                            break;
                        }
                    }
                }
                if (matchRule) {
                    if (matchRule.handler && matchRule.handler(matchRule.state, hash, matchRule.url) === false) {
                        return;
                    }
                    _handler && _handler(matchRule.state, hash, matchRule.url);
                }
            }
        }
        function startRouter(rules, handler) {
            _rules = rules;
            _handler = handler;
            $(window).on("hashchange", hashChange);
            tui.event.on("initialized", function () {
                hashChange();
            });
        }
        browser.startRouter = startRouter;
        function stopRouter() {
            $(window).off("hashchange", hashChange);
        }
        browser.stopRouter = stopRouter;
    })(browser = tui.browser || (tui.browser = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
/// <reference path="browser.ts" />
var tui;
(function (tui) {
    var browser;
    (function (browser) {
        "use strict";
        function fileFromPath(file) {
            return file.replace(/.*(\/|\\)/, "");
        }
        function getExt(file) {
            return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
        }
        function preventDefault(e) {
            return e.preventDefault();
        }
        var Uploader = (function (_super) {
            __extends(Uploader, _super);
            function Uploader(container, options) {
                _super.call(this);
                this._settings = {
                    action: "upload",
                    name: "file",
                    multiple: false,
                    autoSubmit: true
                };
                this._container = null;
                this._input = null;
                this.setOptions(options);
                if (!container || container.nodeType !== 1) {
                    throw new Error("Please make sure that you're passing a valid element");
                }
                if (container.nodeName.toLowerCase() === 'a') {
                    // disable link
                    $(container).on('click', function (e) { e.preventDefault(); });
                }
                // DOM element
                this._container = container;
                // DOM element                 
                this._input = null;
            }
            Uploader.prototype.setOptions = function (options) {
                if (options) {
                    for (var i in options) {
                        if (options.hasOwnProperty(i)) {
                            this._settings[i] = options[i];
                        }
                    }
                }
            };
            Uploader.prototype.getOptions = function () {
                return this._settings;
            };
            Uploader.prototype.createIframe = function () {
                var id = tui.tuid();
                var iframe = browser.toElement('<iframe src="javascript:false;" name="' + id + '" />');
                iframe.setAttribute('id', id);
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                var doc = iframe.contentDocument ? iframe.contentDocument : window.frames[iframe.id].document;
                try {
                    doc.charset = "utf-8";
                }
                catch (e) { }
                return iframe;
            };
            Uploader.prototype.createForm = function (iframe) {
                var settings = this._settings;
                var form = browser.toElement('<form method="post" enctype="multipart/form-data" accept-charset="UTF-8"></form>');
                form.setAttribute('accept-charset', 'UTF-8');
                if (settings.action)
                    form.setAttribute('action', settings.action);
                form.setAttribute('target', iframe.name);
                form.style.display = 'none';
                document.body.appendChild(form);
                // Create hidden input element for each data key
                return form;
            };
            Uploader.prototype.createInput = function () {
                var _this = this;
                if (this._input) {
                    return;
                }
                var input = document.createElement("input");
                input.setAttribute('type', 'file');
                if (this._settings.accept)
                    input.setAttribute('accept', this._settings.accept);
                input.setAttribute('name', this._settings.name);
                if (this._settings.multiple)
                    input.setAttribute('multiple', 'multiple');
                if (tui.ieVer > 0)
                    input.title = "";
                else
                    input.title = " ";
                $(input).css({
                    'position': 'absolute',
                    'right': 0,
                    'top': 0,
                    'height': '1000px',
                    'width': '2000px',
                    'margin': 0,
                    'padding': 0,
                    'opacity': 0,
                    'filter': 'alpha(opacity=0)',
                    'fontSize': '10000px',
                    'fontFamily': 'sans-serif',
                    'cursor': 'pointer'
                });
                $(input).on('change', function (e) {
                    if (!input || input.value === '') {
                        return;
                    }
                    // Get filename from input, required                
                    // as some browsers have path instead of it
                    var file = fileFromPath(input.value);
                    var fileExt = getExt(file);
                    if (_this.fire("change", { e: e, "file": file, "ext": fileExt }) === false) {
                        _this.clearInput();
                        return;
                    }
                    // Submit form when value is changed
                    if (_this._settings.autoSubmit) {
                        _this.submit();
                    }
                });
                var style = browser.getCurrentStyle(this._container);
                if (style.position === "static") {
                    this._container.style.position = "relative";
                }
                this._container.style.overflow = "hidden";
                this._container.appendChild(input);
                this._input = input;
                $(this._input).focus(function () {
                    _this.fire("focus");
                });
                $(this._input).blur(function () {
                    _this.fire("blur");
                });
            };
            Uploader.prototype.deleteInput = function () {
                if (!this._input) {
                    return;
                }
                browser.removeNode(this._input);
                this._input = null;
            };
            Uploader.prototype.getInput = function () {
                return this._input;
            };
            Uploader.prototype.clearInput = function () {
                this.deleteInput();
                this.createInput();
            };
            /**
            * Gets response from iframe and fires onComplete event when ready
            * @param iframe
            * @param file Filename to use in onComplete callback
            */
            Uploader.prototype.processResponse = function (iframe, file) {
                var _this = this;
                // getting response
                var waitbox = tui.waitbox(tui.str("Uploading..."));
                var toDeleteFlag = false, settings = this._settings;
                $(iframe).on('load', function () {
                    if (iframe.src === "javascript:'%3Chtml%3E%3C/html%3E';" ||
                        // For FF, IE
                        iframe.src === "javascript:'<html></html>';") {
                        // First time around, do not delete.
                        // We reload to blank page, so that reloading main page
                        // does not re-submit the post.
                        if (toDeleteFlag) {
                            // Fix busy state in FF3
                            setTimeout(function () {
                                browser.removeNode(iframe);
                            }, 0);
                        }
                        return;
                    }
                    var doc = iframe.contentDocument ? iframe.contentDocument : window.frames[iframe.id].document;
                    // fixing Opera 9.26,10.00
                    if (doc.readyState && doc.readyState !== 'complete') {
                        waitbox.close();
                        return;
                    }
                    // fixing Opera 9.64
                    if (doc.body && doc.body.innerHTML === "false") {
                        waitbox.close();
                        return;
                    }
                    waitbox.close();
                    var response;
                    if (doc.body) {
                        // response is html document or plain text
                        response = doc.body.innerHTML;
                        try {
                            if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() === 'PRE') {
                                doc.normalize && doc.normalize();
                                response = doc.body.firstChild.firstChild.nodeValue;
                            }
                            if (response) {
                                var responseObj = eval("(" + response + ")");
                                if (!responseObj) {
                                    _this.fireError();
                                }
                                else if (responseObj.error) {
                                    _this.fireError(responseObj.error);
                                }
                                else if (responseObj.fileId && responseObj.fileName)
                                    _this.fire("success", { "file": file, "ext": getExt(file), "response": responseObj });
                                else
                                    _this.fireError();
                            }
                            else {
                                _this.fireError();
                            }
                        }
                        catch (e) {
                            _this.fireError();
                        }
                    }
                    else {
                        _this.fireError();
                    }
                    // Reload blank page, so that reloading main page
                    // does not re-submit the post. Also, remember to
                    // delete the frame
                    toDeleteFlag = true;
                    // Fix IE mixed content issue
                    iframe.src = "javascript:'<html></html>';";
                    browser.removeNode(iframe);
                });
            };
            Uploader.prototype.fireInvalidError = function () {
                this.fire("error", { "response": { error: tui.str("Upload failed: invalid response content!") } });
            };
            Uploader.prototype.fireError = function (errorMessage) {
                this.fire("error", { "response": {
                        error: tui.str("Upload failed!") + (errorMessage ? errorMessage : "")
                    } });
            };
            Uploader.prototype.submitV5 = function (file, extraData) {
                var _this = this;
                var waitbox = tui.waitbox(tui.str("Uploading..."));
                var fd = new FormData();
                for (var i = 0; i < this._input.files.length; i++)
                    fd.append(this._settings.name, this._input.files[i]);
                var xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (e) {
                    if (e.lengthComputable) {
                        var percentComplete = Math.round(e.loaded * 100 / e.total);
                        waitbox.setMessage(tui.str("Uploading... ") + percentComplete.toString() + '%');
                    }
                }, false);
                xhr.addEventListener("load", function (e) {
                    waitbox.close();
                    if (e.target.status != 200) {
                        _this.fire("error", { "file": file, "ext": getExt(file), "response": {
                                error: tui.str(e.target.response || e.target.statusText || e.target.status)
                            } });
                    }
                    else {
                        try {
                            var result = JSON.parse(e.target.responseText);
                            if (result.fileId && result.fileName)
                                _this.fire("success", { "file": file, "ext": getExt(file), "response": result });
                            else
                                _this.fireError();
                        }
                        catch (e) {
                            _this.fireInvalidError();
                        }
                    }
                }, false);
                xhr.addEventListener("error", function (e) {
                    waitbox.close();
                    _this.fireError();
                }, false);
                xhr.addEventListener("abort", function (e) {
                    waitbox.close();
                    _this.fireError();
                }, false);
                xhr.open("POST", this._settings.action);
                xhr.send(fd);
                this.clearInput();
            };
            Uploader.prototype.submitV4 = function (file, extraData) {
                // sending request    
                var iframe = this.createIframe();
                var form = this.createForm(iframe);
                // assuming following structure
                // div -> input type='file'
                form.appendChild(this._input);
                if (extraData) {
                    for (var prop in extraData) {
                        if (extraData.hasOwnProperty(prop)) {
                            var el = document.createElement("input");
                            el.setAttribute('type', 'hidden');
                            el.setAttribute('name', prop);
                            el.setAttribute('value', extraData[prop]);
                            form.appendChild(el);
                        }
                    }
                }
                this.processResponse(iframe, file);
                form.submit();
                // request set, clean up
                browser.removeNode(form);
                form = null;
                this.clearInput();
            };
            Uploader.prototype.submit = function (extraData) {
                if (!this._input || this._input.value === '') {
                    return;
                }
                var file = fileFromPath(this._input.value);
                // user returned false to cancel upload
                if (this.fire("submit", { "file": file, "ext": getExt(file) }) === false) {
                    this.clearInput();
                    this.fire("blur");
                    return;
                }
                this.fire("blur");
                if (typeof FormData === "function") {
                    this.submitV5(file, extraData);
                }
                else
                    this.submitV4(file, extraData);
            };
            return Uploader;
        }(tui.EventObject));
        browser.Uploader = Uploader;
        function createUploader(container, options) {
            return new Uploader(container, options);
        }
        browser.createUploader = createUploader;
    })(browser = tui.browser || (tui.browser = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
var tui;
(function (tui) {
    var ds;
    (function (ds) {
        "use strict";
        var DSBase = (function (_super) {
            __extends(DSBase, _super);
            function DSBase() {
                _super.apply(this, arguments);
                this._finalData = null;
                this._order = null;
                this._filter = null;
            }
            DSBase.prototype.setOrder = function (order) {
                this._order = order;
                this.build();
            };
            DSBase.prototype.getOrder = function () {
                return this._order;
            };
            DSBase.prototype.setFilter = function (filter) {
                this._filter = filter;
                this.build();
            };
            DSBase.prototype.getFilter = function () {
                return this._filter;
            };
            return DSBase;
        }(tui.EventObject));
        ds.DSBase = DSBase;
        function filter(value, filter) {
            if (filter) {
                for (var _i = 0, filter_1 = filter; _i < filter_1.length; _i++) {
                    var f = filter_1[_i];
                    var v = value[f.key];
                    if (v == null) {
                        if (f.value == null)
                            continue;
                        else
                            return false;
                    }
                    try {
                        var regex = new RegExp(f.value);
                        if (v.toString().match(regex) == null)
                            return false;
                    }
                    catch (e) {
                        if (v.indexOf(f.value) < 0)
                            return false;
                    }
                }
            }
            return true;
        }
        function sort(data, order, treeData) {
            if (order && order.length > 0) {
                data.sort(function (a, b) {
                    for (var _i = 0, order_1 = order; _i < order_1.length; _i++) {
                        var s = order_1[_i];
                        var aVal = treeData ? a.item[s.key] : a[s.key];
                        var bVal = treeData ? b.item[s.key] : b[s.key];
                        if (aVal == bVal)
                            continue;
                        if (s.desc) {
                            return aVal > bVal ? -1 : 1;
                        }
                        else
                            return aVal < bVal ? -1 : 1;
                    }
                    return 0;
                });
            }
        }
        var List = (function (_super) {
            __extends(List, _super);
            function List(data, filter, order) {
                if (filter === void 0) { filter = null; }
                if (order === void 0) { order = null; }
                _super.call(this);
                this._data = data;
                this._filter = filter;
                this._order = order;
                this.build();
            }
            List.prototype.length = function () {
                if (this._finalData == null)
                    return this._data.length;
                else
                    return this._finalData.length;
            };
            List.prototype.get = function (index) {
                if (this._finalData == null)
                    return this._data[index];
                else
                    return this._finalData[index];
            };
            List.prototype.build = function () {
                var _this = this;
                if (this._data == null) {
                    this._finalData = null;
                    return;
                }
                if ((this._filter == null || this._filter.length == 0) &&
                    (this._order == null || this._order.length == 0))
                    this._finalData = null;
                else {
                    this._finalData = this._data.filter(function (value, index, array) {
                        return filter(value, _this._filter);
                    });
                    sort(this._finalData, this._order, false);
                }
                this.fire("update", { "completely": true });
            };
            return List;
        }(DSBase));
        ds.List = List;
        var RemoteList = (function (_super) {
            __extends(RemoteList, _super);
            function RemoteList(cacheSize, filter, order) {
                if (cacheSize === void 0) { cacheSize = 50; }
                if (filter === void 0) { filter = null; }
                if (order === void 0) { order = null; }
                _super.call(this);
                this._cache1 = null;
                this._cache2 = null;
                this._length = null;
                this._cacheSize = cacheSize;
                this.reset();
                this._filter = filter;
                this._order = order;
            }
            RemoteList.prototype.length = function () {
                if (this._length === null) {
                    this.fire("query", {
                        begin: 0,
                        size: this._cacheSize,
                        filter: this._filter,
                        order: this._order
                    });
                    return 0;
                }
                else
                    return this._length;
            };
            RemoteList.prototype.get = function (index) {
                if (index >= 0 && index < this.length()) {
                    var item = this.getFromCache(index, this._cache1);
                    if (item === null)
                        item = this.getFromCache(index, this._cache2);
                    if (item === null) {
                        var page = this.getIndexPage(index);
                        if (this._cache1 === null) {
                            this._fillCache = 1;
                        }
                        else if (this._cache2 === null)
                            this._fillCache = 2;
                        else {
                            this._fillCache = Math.abs(page - this._cache1.page) > Math.abs(page - this._cache2.page) ? 1 : 2;
                        }
                        this.fire("query", {
                            begin: page * this._cacheSize,
                            size: this._cacheSize,
                            filter: this._filter,
                            rder: this._order
                        });
                    }
                }
                else
                    return null;
            };
            RemoteList.prototype.getIndexPage = function (index) {
                return Math.ceil((index + 1) / this._cacheSize - 1);
            };
            RemoteList.prototype.getFromCache = function (index, cache) {
                if (cache === null)
                    return null;
                var begin = cache.page * this._cacheSize;
                var end = begin + cache.data.length;
                if (index >= begin && index < end)
                    return cache.data[index - begin];
                else
                    return null;
            };
            RemoteList.prototype.update = function (result) {
                var completely = this._length != result.length;
                this._length = result.length;
                if (this._fillCache === 1) {
                    this._cache1 = { page: this.getIndexPage(result.begin), data: result.data };
                }
                else if (this._fillCache === 2) {
                    this._cache2 = { page: this.getIndexPage(result.begin), data: result.data };
                }
                this.fire("update", { "completely": completely });
            };
            RemoteList.prototype.reset = function () {
                this._length = null;
                this._cache1 = this._cache2 = null;
                this._fillCache = 1;
            };
            RemoteList.prototype.build = function () {
                this.reset();
                this.fire("query", {
                    begin: 0,
                    size: this._cacheSize,
                    filter: this._filter,
                    order: this._order
                });
            };
            return RemoteList;
        }(DSBase));
        ds.RemoteList = RemoteList; // End of RemoteListSource
        var TreeBase = (function (_super) {
            __extends(TreeBase, _super);
            function TreeBase() {
                _super.apply(this, arguments);
                this._index = null;
                this._rawData = null;
            }
            TreeBase.prototype.getConfig = function () {
                return this._config;
            };
            TreeBase.prototype.length = function () {
                if (this._finalData)
                    return this._finalData.length;
                else if (this._index)
                    return this._index.length;
                else
                    return 0;
            };
            TreeBase.prototype.getRawData = function () {
                return this._rawData;
            };
            TreeBase.prototype.get = function (index) {
                if (this._finalData) {
                    if (index >= 0 && index < this._finalData.length)
                        return this._finalData[index];
                    else
                        return null;
                }
                else if (index >= 0 && index < this.length()) {
                    return this._index[index];
                }
                else
                    return null;
            };
            TreeBase.prototype.findNodeIndex = function (node) {
                for (var i = 0; i < this._index.length; i++) {
                    if (this._index[i] === node)
                        return i;
                }
                return -1;
            };
            TreeBase.prototype.expandItems = function (parent, items, index, level, init) {
                if (init === void 0) { init = false; }
                if (typeof items === tui.UNDEFINED || items === null)
                    items = [];
                for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                    var item = items_1[_i];
                    var children = item[this._config.children];
                    var expand = void 0;
                    if (init) {
                        expand = false;
                        item[this._config.expand] = false;
                    }
                    else
                        expand = item[this._config.expand] && children && children.length > 0;
                    var hasChild = void 0;
                    if (children && children.length > 0)
                        hasChild = true;
                    else
                        hasChild = !!item[this._config.hasChild];
                    var node = {
                        parent: parent,
                        hasChild: hasChild,
                        item: item,
                        level: level,
                        expand: expand
                    };
                    index && index.push(node);
                    if (expand) {
                        this.expandItems(node, children, index, level + 1);
                    }
                }
            };
            TreeBase.prototype.getExpandCount = function (children) {
                if (!children)
                    return 0;
                var delCount = children.length;
                for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                    var child = children_1[_i];
                    if (child.children && child.children.length > 0 && child[this._config.expand]) {
                        delCount += this.getExpandCount(child.children);
                    }
                }
                return delCount;
            };
            TreeBase.prototype.expand = function (index) {
                if (index >= 0 && index < this._index.length) {
                    var node = this._index[index];
                    if (node.hasChild && !node.expand) {
                        node.expand = true;
                        node.item[this._config.expand] = true;
                        var appendNodes = [];
                        this.expandItems(node, node.item[this._config.children], appendNodes, node.level + 1);
                        (_a = this._index).splice.apply(_a, [index + 1, 0].concat(appendNodes));
                    }
                }
                var _a;
            };
            TreeBase.prototype.collapse = function (index) {
                if (index >= 0 && index < this._index.length) {
                    var node = this._index[index];
                    if (node.hasChild && node.expand) {
                        node.expand = false;
                        node.item[this._config.expand] = false;
                        var delCount = this.getExpandCount(node.item[this._config.children]);
                        this._index.splice(index + 1, delCount);
                    }
                }
            };
            return TreeBase;
        }(DSBase));
        ds.TreeBase = TreeBase;
        var Tree = (function (_super) {
            __extends(Tree, _super);
            function Tree(data, config, filter, order) {
                if (config === void 0) { config = { children: "children", expand: "expand" }; }
                if (filter === void 0) { filter = null; }
                if (order === void 0) { order = null; }
                _super.call(this);
                this._config = config;
                this._filter = filter;
                this._order = order;
                this.update(data);
            }
            Tree.prototype.update = function (data) {
                var config = this._config;
                this._index = [];
                this._rawData = data;
                this.expandItems(null, data, this._index, 0);
                this.build();
            };
            Tree.prototype.build = function () {
                var _this = this;
                if (this._rawData == null) {
                    this._finalData = null;
                    return;
                }
                if ((this._filter == null || this._filter.length == 0) &&
                    (this._order == null || this._order.length == 0))
                    this._finalData = null;
                else {
                    this._finalData = [];
                    var iterate_1 = function (items) {
                        if (typeof items === tui.UNDEFINED || items === null)
                            items = [];
                        for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                            var item = items_2[_i];
                            if (filter(item, _this._filter)) {
                                var node = {
                                    parent: null,
                                    hasChild: false,
                                    item: item,
                                    level: 0,
                                    expand: false
                                };
                                _this._finalData.push(node);
                            }
                            var children = item[_this._config.children];
                            children && iterate_1(children);
                        }
                    };
                    iterate_1(this._rawData);
                    sort(this._finalData, this._order, true);
                }
                this.fire("update", { "completely": true });
            };
            return Tree;
        }(TreeBase));
        ds.Tree = Tree;
        var RemoteTree = (function (_super) {
            __extends(RemoteTree, _super);
            function RemoteTree(config, filter, order) {
                if (config === void 0) { config = { children: "children", expand: "expand", hasChild: "hasChild" }; }
                if (filter === void 0) { filter = null; }
                if (order === void 0) { order = null; }
                _super.call(this);
                this._querying = false;
                this._config = config;
                this._filter = filter;
                this._order = order;
            }
            RemoteTree.prototype.length = function () {
                if (this._index)
                    return this._index.length;
                else {
                    if (!this._querying) {
                        this._querying = true;
                        this.fire("query", { parent: null, filter: this._filter, order: this._order });
                    }
                    return 0;
                }
            };
            RemoteTree.prototype.expand = function (index) {
                if (index >= 0 && index < this._index.length) {
                    var node = this._index[index];
                    if (node.hasChild && !node.expand) {
                        node.expand = true;
                        node.item[this._config.expand] = true;
                        var children = node.item[this._config.children];
                        if (children) {
                            var appendNodes = [];
                            this.expandItems(node, children, appendNodes, node.level + 1);
                            (_a = this._index).splice.apply(_a, [index + 1, 0].concat(appendNodes));
                        }
                        else {
                            this.fire("query", { parent: node, filter: this._filter, order: this._order });
                            this._querying = true;
                        }
                    }
                }
                var _a;
            };
            RemoteTree.prototype.update = function (result) {
                this._querying = false;
                if (result.parent === null) {
                    this._index = [];
                    this._rawData = result.data;
                    this.expandItems(null, result.data, this._index, 0, true);
                }
                else {
                    var index = this.findNodeIndex(result.parent);
                    if (index >= 0) {
                        this.collapse(index);
                    }
                    result.parent.item[this._config.children] = result.data;
                    if (index >= 0) {
                        this.expand(index);
                    }
                }
                this.fire("update", { "completely": true });
            };
            RemoteTree.prototype.build = function () {
                this._index = null;
                this._rawData = null;
                this._finalData = null;
                this.fire("query", { parent: null, filter: this._filter, order: this._order });
            };
            return RemoteTree;
        }(TreeBase));
        ds.RemoteTree = RemoteTree;
    })(ds = tui.ds || (tui.ds = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
/// <reference path="../text/text.ts" />
var tui;
(function (tui) {
    var time;
    (function (time) {
        time.shortWeeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        time.weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        time.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        time.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        /**
         * Get today
         */
        function now() {
            return new Date();
        }
        time.now = now;
        /**
         * Input seconds and get a time description
         * @param seconds Tims distance of seconds
         * @param lang Display language
         */
        function timespan(seconds, lang) {
            var desc = ["day", "hour", "minute", "second"];
            var val = [];
            var beg = "", end = "";
            var d = Math.floor(seconds / 86400);
            val.push(d);
            seconds = seconds % 86400;
            var h = Math.floor(seconds / 3600);
            val.push(h);
            seconds = seconds % 3600;
            var m = Math.floor(seconds / 60);
            val.push(m);
            val.push(seconds % 60);
            var i = 0, j = 3;
            while (i < 4) {
                if (val[i] > 0) {
                    beg.length && (beg += " ");
                    beg += val[i] + " " + tui.str(val[i] > 1 ? desc[i] + "s" : desc[i], lang);
                    break;
                }
                i++;
            }
            while (i < j) {
                if (val[j] > 0) {
                    end.length && (end += " ");
                    end += val[j] + " " + tui.str(val[j] > 1 ? desc[j] + "s" : desc[j], lang);
                    break;
                }
                j--;
            }
            i++;
            while (i < j) {
                beg.length && (beg += " ");
                beg += val[i] + " " + tui.str(val[i] > 1 ? desc[i] + "s" : desc[i], lang);
                i++;
            }
            return beg + (beg.length ? " " : "") + end;
        }
        time.timespan = timespan;
        /**
         * Get the distance of dt2 compare to dt1 (dt2 - dt1) return in specified unit (d: day, h: hours, m: minutes, s: seconds, ms: milliseconds)
         * @param dt1
         * @param dt2
         * @param unit "d", "h", "m", "s" or "ms"
         */
        function dateDiff(dt1, dt2, unit) {
            if (unit === void 0) { unit = "d"; }
            var d1 = dt1.getTime();
            var d2 = dt2.getTime();
            var diff = d2 - d1;
            var symbol = diff < 0 ? -1 : 1;
            diff = Math.abs(diff);
            unit = unit.toLocaleLowerCase();
            if (unit === "d") {
                return Math.floor(diff / 86400000) * symbol;
            }
            else if (unit === "h") {
                return Math.floor(diff / 3600000) * symbol;
            }
            else if (unit === "m") {
                return Math.floor(diff / 60000) * symbol;
            }
            else if (unit === "s") {
                return Math.floor(diff / 1000) * symbol;
            }
            else if (unit === "ms") {
                return diff * symbol;
            }
            else
                return NaN;
        }
        time.dateDiff = dateDiff;
        /**
         * Get new date of dt add specified unit of values.
         * @param dt The day of the target
         * @param val Increased value
         * @param unit "y", "M", "d", "h", "m", "s" or "ms"
         */
        function dateAdd(dt, val, unit) {
            if (unit === void 0) { unit = "d"; }
            var tm = dt.getTime();
            if (unit === "y") {
                var y = dt.getFullYear(), m = dt.getMonth(), d = dt.getDate();
                var h = dt.getHours(), mi = dt.getMinutes(), s = dt.getSeconds(), ms = dt.getMilliseconds();
                var totalMonth = y * 12 + m + (val * 12);
                y = Math.floor(totalMonth / 12);
                m = totalMonth % 12;
                var newDate = new Date(y, m, 1);
                if (d > totalDaysOfMonth(newDate))
                    d = totalDaysOfMonth(newDate);
                return new Date(y, m, d, h, mi, s, ms);
            }
            else if (unit === "M") {
                var y = dt.getFullYear(), m = dt.getMonth(), d = dt.getDate();
                var h = dt.getHours(), mi = dt.getMinutes(), s = dt.getSeconds(), ms = dt.getMilliseconds();
                var totalMonth = y * 12 + m + val;
                y = Math.floor(totalMonth / 12);
                m = totalMonth % 12;
                var newDate = new Date(y, m, 1);
                if (d > totalDaysOfMonth(newDate))
                    d = totalDaysOfMonth(newDate);
                return new Date(y, m, d, h, mi, s, ms);
            }
            else if (unit === "d") {
                return new Date(tm + val * 86400000);
            }
            else if (unit === "h") {
                return new Date(tm + val * 3600000);
            }
            else if (unit === "m") {
                return new Date(tm + val * 60000);
            }
            else if (unit === "s") {
                return new Date(tm + val * 1000);
            }
            else if (unit === "ms") {
                return new Date(tm + val);
            }
            else
                return null;
        }
        time.dateAdd = dateAdd;
        /**
         * Get day in year
         * @param dt The day of the target
         */
        function dayOfYear(dt) {
            var y = dt.getFullYear();
            var d1 = new Date(y, 0, 1);
            return dateDiff(d1, dt, "d");
        }
        time.dayOfYear = dayOfYear;
        /**
         * Get total days of month
         * @param dt The day of the target
         */
        function totalDaysOfMonth(dt) {
            var y = dt.getFullYear();
            var m = dt.getMonth();
            var d1 = new Date(y, m, 1);
            if (m === 11) {
                y++;
                m = 0;
            }
            else {
                m++;
            }
            var d2 = new Date(y, m, 1);
            return dateDiff(d1, d2, "d");
        }
        time.totalDaysOfMonth = totalDaysOfMonth;
        function parseDateInternal(dtStr, format) {
            if (!dtStr || !format)
                return null;
            var mapping = {};
            var gcount = 0;
            var isUTC = false;
            var values = {};
            function matchEnum(v, key, enumArray) {
                var m = dtStr.match(new RegExp("^" + enumArray.join("|"), "i"));
                if (m === null)
                    return false;
                v = m[0].toLowerCase();
                v = v.substr(0, 1).toUpperCase() + v.substr(1);
                values[key] = enumArray.indexOf(v);
                dtStr = dtStr.substr(v.length);
                return true;
            }
            function matchNumber(v, key, min, max) {
                var len = v.length;
                var m = dtStr.match("^[0-9]{1," + len + "}");
                if (m === null)
                    return false;
                v = m[0];
                var num = parseInt(v);
                if (num < min || num > max)
                    return false;
                key && (values[key] = num);
                dtStr = dtStr.substr(v.length);
                return true;
            }
            var rule = {
                "y+": function (v) {
                    if (!matchNumber(v, "year"))
                        return false;
                    if (values["year"] < 100)
                        values["year"] += 1900;
                    return true;
                },
                "M+": function (v) {
                    var len = v.length;
                    if (len < 3) {
                        if (!matchNumber(v, "month", 1, 12))
                            return false;
                        values["month"] -= 1;
                        return true;
                    }
                    else if (len === 3) {
                        return matchEnum(v, "month", time.shortMonths);
                    }
                    else {
                        return matchEnum(v, "month", time.months);
                    }
                },
                "d+": function (v) {
                    return matchNumber(v, "date", 1, 31);
                },
                "D+": matchNumber,
                "h+": function (v) {
                    return matchNumber(v, "12hour", 1, 12);
                },
                "H+": function (v) {
                    return matchNumber(v, "hour", 0, 24);
                },
                "m+": function (v) {
                    return matchNumber(v, "minute", 0, 59);
                },
                "s+": function (v) {
                    return matchNumber(v, "second", 0, 59);
                },
                "[qQ]+": function (v) {
                    return matchNumber(v, null, 1, 4);
                },
                "S+": function (v) {
                    return matchNumber(v, "millisecond", 0, 999);
                },
                "E+": function (v) {
                    var len = v.length;
                    if (len < 3) {
                        if (!matchNumber(v, null, 0, 6))
                            return false;
                        return true;
                    }
                    else if (len === 3) {
                        return matchEnum(v, null, time.shortWeeks);
                    }
                    else {
                        return matchEnum(v, null, time.weeks);
                    }
                },
                "a|A": function matchNumber(v) {
                    var len = v.length;
                    var m = dtStr.match(/^(am|pm)/i);
                    if (m === null)
                        return false;
                    v = m[0];
                    values["ampm"] = v.toLowerCase();
                    dtStr = dtStr.substr(v.length);
                    return true;
                },
                "z+": function (v) {
                    var len = v.length;
                    var m;
                    if (len <= 2)
                        m = dtStr.match(/^([\-+][0-9]{2})/i);
                    else if (len === 3)
                        m = dtStr.match(/^([\-+][0-9]{2})([0-9]{2})/i);
                    else
                        m = dtStr.match(/^([\-+][0-9]{2}):([0-9]{2})/i);
                    if (m === null)
                        return false;
                    v = m[0];
                    var tz = parseInt(m[1]);
                    if (Math.abs(tz) < -11 || Math.abs(tz) > 11)
                        return false;
                    tz *= 60;
                    if (typeof m[2] !== tui.UNDEFINED) {
                        if (tz > 0)
                            tz += parseInt(m[2]);
                        else
                            tz -= parseInt(m[2]);
                    }
                    values["tz"] = -tz;
                    dtStr = dtStr.substr(v.length);
                    return true;
                },
                "Z": function (v) {
                    if (dtStr.substr(0, 1) !== "Z")
                        return false;
                    isUTC = true;
                    dtStr = dtStr.substr(1);
                    return true;
                },
                "\"[^\"]*\"|'[^']*'": function (v) {
                    v = v.substr(1, v.length - 2);
                    if (dtStr.substr(0, v.length).toLowerCase() !== v.toLowerCase())
                        return false;
                    dtStr = dtStr.substr(v.length);
                    return true;
                },
                "[^yMmdDhHsSqEaAzZ'\"]+": function (v) {
                    v = v.replace(/(.)/g, '\\$1');
                    var m = dtStr.match(new RegExp("^" + v));
                    if (m === null)
                        return false;
                    v = m[0];
                    dtStr = dtStr.substr(v.length);
                    return true;
                }
            };
            var regex = "";
            for (var k in rule) {
                if (!rule.hasOwnProperty(k))
                    continue;
                if (regex.length > 0)
                    regex += "|";
                regex += "(^" + k + ")";
                mapping[k] = ++gcount;
            }
            var result;
            while ((result = format.match(regex)) !== null) {
                for (var k in mapping) {
                    var v = result[mapping[k]];
                    if (typeof v !== tui.UNDEFINED) {
                        if (rule[k](v) === false)
                            return null;
                        break;
                    }
                }
                format = format.substr(result[0].length);
            }
            if (format.length > 0 || dtStr.length > 0)
                return null;
            var parseCount = 0;
            for (var k in values) {
                if (!values.hasOwnProperty(k))
                    continue;
                parseCount++;
            }
            if (parseCount <= 0)
                return null;
            var now = new Date();
            var year = values.hasOwnProperty("year") ? values["year"] : (isUTC ? now.getUTCFullYear() : now.getFullYear());
            var month = values.hasOwnProperty("month") ? values["month"] : (isUTC ? now.getUTCMonth() : now.getMonth());
            var date = values.hasOwnProperty("date") ? values["date"] : (isUTC ? now.getUTCDate() : now.getDate());
            var ampm = values.hasOwnProperty("ampm") ? values["ampm"] : "am";
            var hour;
            if (values.hasOwnProperty("hour"))
                hour = values["hour"];
            else if (values.hasOwnProperty("12hour")) {
                var h12 = values["12hour"];
                if (ampm === "am") {
                    if (h12 >= 1 && h12 <= 11) {
                        hour = h12;
                    }
                    else if (h12 === 12) {
                        hour = h12 - 12;
                    }
                    else
                        return null;
                }
                else {
                    if (h12 === 12)
                        hour = h12;
                    else if (h12 >= 1 && h12 <= 11)
                        hour = h12 + 12;
                    else
                        return null;
                }
            }
            else
                hour = 0;
            var minute = values.hasOwnProperty("minute") ? values["minute"] : 0;
            var second = values.hasOwnProperty("second") ? values["second"] : 0;
            var millisecond = values.hasOwnProperty("millisecond") ? values["millisecond"] : 0;
            var tz = values.hasOwnProperty("tz") ? values["tz"] : now.getTimezoneOffset();
            now.setUTCFullYear(year);
            now.setUTCMonth(month);
            now.setUTCDate(date);
            now.setUTCHours(hour);
            now.setUTCMinutes(minute);
            now.setUTCSeconds(second);
            now.setUTCMilliseconds(millisecond);
            if (!isUTC) {
                now.setTime(now.getTime() + tz * 60 * 1000);
            }
            return now;
        }
        /**
         * Parse string get date instance (
         * try to parse format:
         *		yyyy-MM-dd HH:mm:ss，
         *		yyyy-MM-dd,
         *		dd MMM yyyy,
         *		MMM dd, yyyy,
         *		ISO8601 format)
         * @param {String} dtStr Data string
         */
        function parseDate(dtStr, format) {
            if (typeof format === "string")
                return parseDateInternal(dtStr, format);
            else if (typeof format === tui.UNDEFINED) {
                var dt = new Date(dtStr);
                if (!isNaN(dt.getTime()))
                    return dt;
                dt = parseDateInternal(dtStr, "yyyy-MM-dd");
                if (dt !== null)
                    return dt;
                dt = parseDateInternal(dtStr, "yyyy-MM-dd HH:mm:ss");
                if (dt !== null)
                    return dt;
                dt = parseDateInternal(dtStr, "MMM dd, yyyy HH:mm:ss");
                if (dt !== null)
                    return dt;
                dt = parseDateInternal(dtStr, "MMM dd, yyyy");
                if (dt !== null)
                    return dt;
                dt = parseDateInternal(dtStr, "dd MMM yyyy HH:mm:ss");
                if (dt !== null)
                    return dt;
                dt = parseDateInternal(dtStr, "dd MMM yyyy");
                if (dt !== null)
                    return dt;
            }
            return null;
        }
        time.parseDate = parseDate;
        /**
         * Convert date to string and output can be formated to ISO8601, RFC2822, RFC3339 or other customized format
         * @param dt {Date} Date object to be convert
         * @param dateFmt {String} which format should be apply, default use ISO8601 standard format
         */
        function formatDate(dt, dateFmt) {
            if (dateFmt === void 0) { dateFmt = "yyyy-MM-ddTHH:mm:sszzz"; }
            var isUTC = (dateFmt.indexOf("Z") >= 0 ? true : false);
            var fullYear = isUTC ? dt.getUTCFullYear() : dt.getFullYear();
            var month = isUTC ? dt.getUTCMonth() : dt.getMonth();
            var date = isUTC ? dt.getUTCDate() : dt.getDate();
            var hours = isUTC ? dt.getUTCHours() : dt.getHours();
            var minutes = isUTC ? dt.getUTCMinutes() : dt.getMinutes();
            var seconds = isUTC ? dt.getUTCSeconds() : dt.getSeconds();
            var milliseconds = isUTC ? dt.getUTCMilliseconds() : dt.getMilliseconds();
            var day = isUTC ? dt.getUTCDay() : dt.getDay();
            var rule = {
                "y+": fullYear,
                "M+": month + 1,
                "d+": date,
                "D+": dayOfYear(dt) + 1,
                "h+": (function (h) {
                    if (h === 0)
                        return h + 12;
                    else if (h >= 1 && h <= 12)
                        return h;
                    else if (h >= 13 && h <= 23)
                        return h - 12;
                })(hours),
                "H+": hours,
                "m+": minutes,
                "s+": seconds,
                "q+": Math.floor((month + 3) / 3),
                "S+": milliseconds,
                "E+": day,
                "a": (function (h) {
                    if (h >= 0 && h <= 11)
                        return "am";
                    else
                        return "pm";
                })(isUTC ? dt.getUTCHours() : dt.getHours()),
                "A": (function (h) {
                    if (h >= 0 && h <= 11)
                        return "AM";
                    else
                        return "PM";
                })(hours),
                "z+": dt.getTimezoneOffset()
            };
            var regex = "";
            for (var k in rule) {
                if (!rule.hasOwnProperty(k))
                    continue;
                if (regex.length > 0)
                    regex += "|";
                regex += k;
            }
            var regexp = new RegExp(regex, "g");
            return dateFmt.replace(regexp, function (str, pos, source) {
                for (var k in rule) {
                    if (str.match(k) !== null) {
                        if (k === "y+") {
                            return tui.text.paddingNumber(rule[k], str.length, str.length);
                        }
                        else if (k === "a" || k === "A") {
                            return rule[k];
                        }
                        else if (k === "z+") {
                            var z = "";
                            if (rule[k] >= 0) {
                                z += "-";
                            }
                            else {
                                z += "+";
                            }
                            if (str.length < 2)
                                z += Math.abs(Math.floor(rule[k] / 60));
                            else
                                z += tui.text.paddingNumber(Math.abs(Math.floor(rule[k] / 60)), 2);
                            if (str.length === 3)
                                z += tui.text.paddingNumber(Math.abs(Math.floor(rule[k] % 60)), 2);
                            else if (str.length > 3)
                                z += (":" + tui.text.paddingNumber(Math.abs(Math.floor(rule[k] % 60)), 2));
                            return z;
                        }
                        else if (k === "E+") {
                            if (str.length < 3)
                                return tui.text.paddingNumber(rule[k], str.length);
                            else if (str.length === 3)
                                return time.shortWeeks[rule[k]];
                            else
                                return time.weeks[rule[k]];
                        }
                        else if (k === "M+") {
                            if (str.length < 3)
                                return tui.text.paddingNumber(rule[k], str.length);
                            else if (str.length === 3)
                                return time.shortMonths[rule[k] - 1];
                            else
                                return time.months[rule[k] - 1];
                        }
                        else if (k === "S+") {
                            return tui.text.paddingNumber(rule[k], str.length, str.length, true);
                        }
                        else {
                            return tui.text.paddingNumber(rule[k], str.length);
                        }
                    }
                }
                return str;
            });
        }
        time.formatDate = formatDate;
    })(time = tui.time || (tui.time = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        /**
         * <button>
         * Attributes: value, text, type, checked, group, disable
         * Events: click, mousedown, mouseup, keydown, keyup
         */
        var Button = (function (_super) {
            __extends(Button, _super);
            function Button() {
                _super.apply(this, arguments);
            }
            Button.prototype.initChildren = function (childNodes) {
                if (childNodes && childNodes.length > 0)
                    this._set("text", tui.browser.toHTML(childNodes));
            };
            Button.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "type": {
                        "get": function () {
                            if (_this._data["type"])
                                return _this._data["type"];
                            var parent = _this.get("parent");
                            if (parent && parent instanceof widget.Group && parent.get("type"))
                                return parent.get("type");
                            return null;
                        }
                    },
                    "value": {
                        "get": function () {
                            if (_this._data["value"])
                                return _this._data["value"];
                            return _this.get("text");
                        }
                    },
                    "checked": {
                        "set": function (value) {
                            _this._data["checked"] = !!value;
                            if (!value)
                                _this._data["tristate"] = false;
                        }
                    },
                    "tristate": {
                        "set": function (value) {
                            _this._data["tristate"] = !!value;
                            if (value)
                                _this._data["checked"] = true;
                        }
                    }
                });
            };
            Button.prototype.init = function () {
                var _this = this;
                var $root = $(this._);
                $root.attr({
                    "unselectable": "on"
                });
                $root.mousedown(function (e) {
                    if (_this.get("disable"))
                        return;
                    $root.focus();
                    _this.fire("mousedown", e);
                });
                $root.mouseup(function (e) {
                    if (_this.get("disable"))
                        return;
                    _this.fire("mouseup", e);
                });
                $root.keydown(function (e) {
                    if (_this.get("disable"))
                        return;
                    _this.fire("keydown", e);
                });
                $root.keyup(function (e) {
                    if (_this.get("disable"))
                        return;
                    _this.fire("keyup", e);
                });
                var onClick = function (e) {
                    if (_this.get("disable"))
                        return;
                    if (_this.get("type") === "toggle" || _this.get("type") === "toggle-radio") {
                        _this.set("checked", !_this.get("checked"));
                    }
                    else if (_this.get("type") === "radio")
                        _this.set("checked", true);
                    var parent = _this.get("parent");
                    var groupName = _this.get("group");
                    if (_this.get("type") === "radio" ||
                        _this.get("type") === "toggle-radio" && _this.get("checked")) {
                        var result = void 0;
                        if (parent && parent instanceof widget.Group) {
                            result = widget.search(parent._, function (elem) {
                                if ((elem.get("type") === "radio" || elem.get("type") === "toggle-radio")
                                    && elem !== _this)
                                    return true;
                                else
                                    return false;
                            });
                        }
                        else {
                            result = widget.search(function (elem) {
                                if (groupName && elem.get("group") === groupName
                                    && (elem.get("type") === "radio" || elem.get("type") === "toggle-radio")
                                    && elem !== _this)
                                    return true;
                                else
                                    return false;
                            });
                        }
                        for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                            var elem = result_1[_i];
                            elem.set("checked", false);
                        }
                    }
                    var onclick = _this.get("onclick");
                    if (onclick) {
                        eval.call(window, onclick);
                    }
                    _this.fire("click", e);
                    if (parent && parent instanceof widget.Group)
                        parent.fire("click", { e: e, button: _this });
                };
                $root.click(onClick);
                $root.keydown(function (e) {
                    if (e.keyCode === 13 || e.keyCode === 32) {
                        e.preventDefault();
                        onClick(e);
                    }
                });
            };
            Button.prototype.render = function () {
                var $root = $(this._);
                if (this.get("checked")) {
                    $root.addClass("tui-checked");
                }
                else {
                    $root.removeClass("tui-checked");
                }
                if (this.get("disable")) {
                    $root.addClass("tui-disable");
                    $root.removeAttr("tabIndex");
                }
                else {
                    $root.removeClass("tui-disable");
                    $root.attr("tabIndex", "0");
                }
                if (this.get("checked") && this.get("tristate")) {
                    $root.addClass("tui-tristate");
                }
                else
                    $root.removeClass("tui-tristate");
                var text = this.get("text");
                if (typeof text !== "string")
                    text = "";
                $root.html(text);
            };
            return Button;
        }(widget.Widget));
        widget.Button = Button;
        var Check = (function (_super) {
            __extends(Check, _super);
            function Check() {
                _super.apply(this, arguments);
            }
            Check.prototype.init = function () {
                _super.prototype.init.call(this);
                this._set("type", "toggle");
            };
            return Check;
        }(Button));
        widget.Check = Check;
        var Radio = (function (_super) {
            __extends(Radio, _super);
            function Radio() {
                _super.apply(this, arguments);
            }
            Radio.prototype.init = function () {
                _super.prototype.init.call(this);
                this._set("type", "radio");
            };
            return Radio;
        }(Button));
        widget.Radio = Radio;
        widget.register(Button);
        widget.register(Check);
        widget.register(Radio);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
/// <reference path="../time/time.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        function formatNumber(v, maxValue) {
            if (v < 0)
                v = 0;
            if (v > maxValue)
                v = maxValue;
            if (v < 10)
                return "0" + v;
            else
                return v + "";
        }
        function setText(tb, line, column, content) {
            var cell = (tb.rows[line].cells[column]);
            if (tui.ieVer > 0 && tui.ieVer < 9) {
                cell.innerText = content;
            }
            else
                cell.innerHTML = content;
        }
        var Calendar = (function (_super) {
            __extends(Calendar, _super);
            function Calendar() {
                _super.apply(this, arguments);
            }
            Calendar.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "time": {
                        "set": function (value) {
                            if (value instanceof Date)
                                _this._data["time"] = value;
                            else if (typeof value === "string") {
                                value = tui.time.parseDate(value);
                                _this._data["time"] = value;
                            }
                        },
                        "get": function () {
                            var tm = _this._data["time"];
                            if (typeof tm === tui.UNDEFINED || tm === null) {
                                return _this._data["time"] = tui.time.now();
                            }
                            else
                                return tm;
                        }
                    },
                    "value": {
                        "set": function (value) {
                            _this._set("time", value);
                        },
                        "get": function () {
                            return _this.get("time");
                        }
                    },
                    "year": {
                        "set": function (value) {
                            if (typeof value === "number" && !isNaN(value))
                                _this.get("time").setFullYear(value);
                        },
                        "get": function () {
                            return _this.get("time").getFullYear();
                        }
                    },
                    "month": {
                        "set": function (value) {
                            if (typeof value === "number" && !isNaN(value))
                                _this.get("time").setMonth(value - 1);
                        },
                        "get": function () {
                            return _this.get("time").getMonth() + 1;
                        }
                    },
                    "day": {
                        "set": function (value) {
                            if (typeof value === "number" && !isNaN(value))
                                _this.get("time").setDate(value);
                        },
                        "get": function () {
                            return _this.get("time").getDate();
                        }
                    },
                    "hour": {
                        "set": function (value) {
                            if (typeof value === "number" && !isNaN(value))
                                _this.get("time").setHours(value);
                        },
                        "get": function () {
                            return _this.get("time").getHours();
                        }
                    },
                    "minute": {
                        "set": function (value) {
                            if (typeof value === "number" && !isNaN(value))
                                _this.get("time").setMinutes(value);
                        },
                        "get": function () {
                            return _this.get("time").getMinutes();
                        }
                    },
                    "second": {
                        "set": function (value) {
                            if (typeof value === "number" && !isNaN(value))
                                _this.get("time").setSeconds(value);
                        },
                        "get": function () {
                            return _this.get("time").getSeconds();
                        }
                    }
                });
            };
            Calendar.prototype.init = function () {
                var _this = this;
                $(this._).attr({ "tabIndex": "0", "unselectable": "on" });
                var tb = this._components["table"] = tui.browser.toElement("<table cellPadding='0' cellspacing='0' border='0'>" +
                    "<tr class='tui-yearbar'><td class='tui-pm'></td><td class='tui-py'>" +
                    "</td><td colspan='3' class='tui-ym'></td>" +
                    "<td class='tui-ny'></td><td class='tui-nm'></td></tr></table>");
                var yearLine = tb.rows[0];
                for (var i = 0; i < 7; i++) {
                    var line = tb.insertRow(-1);
                    for (var j = 0; j < 7; j++) {
                        var cell = line.insertCell(-1);
                        if (j === 0 || j === 6)
                            cell.className = "tui-week-end";
                        if (i === 0) {
                            cell.className = "tui-week";
                            setText(tb, i + 1, j, tui.str(tui.time.shortWeeks[j]));
                        }
                    }
                }
                this._.appendChild(tb);
                var timebar = this._components["timeBar"] = tui.browser.toElement("<div>" + tui.str("Choose Time") + ":<input name='hours' maxLength='2'>:<input name='minutes' maxLength='2'>:<input name='seconds' maxLength='2'>" +
                    "<a class='tui-update'></a></div>");
                this._.appendChild(timebar);
                function getMaxValue(name) {
                    if (name === "hours")
                        return 23;
                    else
                        return 59;
                }
                var getInputTime = function () {
                    function getInput(index) {
                        return $(timebar).children("input")[index];
                    }
                    var tm = _this.get("time");
                    tm.setHours(parseInt(getInput(0).value));
                    tm.setMinutes(parseInt(getInput(1).value));
                    tm.setSeconds(parseInt(getInput(2).value));
                    _this.set("time", tm);
                };
                var timebar$ = $(timebar);
                timebar$.keydown(function (e) {
                    var o = (e.srcElement || e.target);
                    var o$ = $(o);
                    var k = e.keyCode;
                    if (o.nodeName.toUpperCase() === "INPUT") {
                        if (k === tui.browser.KeyCode.TAB)
                            return;
                        e.preventDefault();
                        tui.browser.cancelBubble(e);
                        var input = o;
                        if (k === tui.browser.KeyCode.LEFT) {
                            if (o$.attr("name") === "seconds")
                                timebar$.children("input[name=minutes]").focus();
                            else if (o$.attr("name") === "minutes")
                                timebar$.children("input[name=hours]").focus();
                        }
                        else if (k === tui.browser.KeyCode.RIGHT) {
                            if (o$.attr("name") === "hours")
                                timebar$.children("input[name=minutes]").focus();
                            else if (o$.attr("name") === "minutes")
                                timebar$.children("input[name=seconds]").focus();
                        }
                        else if (k === tui.browser.KeyCode.UP) {
                            var max = getMaxValue(o$.attr("name"));
                            var v = parseInt(input.value) + 1;
                            if (v > max)
                                v = 0;
                            input.value = formatNumber(v, max);
                            getInputTime();
                            input.select();
                        }
                        else if (k === tui.browser.KeyCode.DOWN) {
                            var max = getMaxValue(o$.attr("name"));
                            var v = parseInt(input.value) - 1;
                            if (v < 0)
                                v = max;
                            input.value = formatNumber(v, max);
                            getInputTime();
                            input.select();
                        }
                        else if (k >= tui.browser.KeyCode.KEY_0 && k <= tui.browser.KeyCode.KEY_9) {
                            var max = getMaxValue(o$.attr("name"));
                            var v = k - tui.browser.KeyCode.KEY_0;
                            var now = tui.time.now().getTime();
                            if (o._lastInputTime && (now - o._lastInputTime) < 1000)
                                o.value = formatNumber(parseInt(o.value.substr(1, 1)) * 10 + v, max);
                            else
                                o.value = formatNumber(v, max);
                            o._lastInputTime = now;
                            getInputTime();
                            o.select();
                        }
                        else if (k == 13)
                            _this.fire("click", { e: e, "time": _this.get("time"), "type": "pick" });
                    }
                });
                timebar$.children("input").on("focus mousedown mouseup", function (e) {
                    var o = (e.srcElement || e.target);
                    setTimeout(function () {
                        o.select();
                    }, 0);
                }).on("contextmenu", tui.browser.cancelDefault);
                timebar$.children("a").mousedown(function (e) {
                    var now = tui.time.now();
                    var newTime = new Date(_this.get("year"), _this.get("month") - 1, _this.get("day"), now.getHours(), now.getMinutes(), now.getSeconds());
                    _this.set("time", newTime);
                    setTimeout(function () { _this._.focus(); });
                    return tui.browser.cancelBubble(e);
                }).click(function (e) {
                    _this.fire("click", { e: e, "time": _this.get("time"), "type": "refresh" });
                });
                $(tb).mousedown(function (e) {
                    if (tui.ffVer > 0) {
                        setTimeout(function () { _this._.focus(); });
                    }
                    var cell = (e.target || e.srcElement);
                    if (cell.nodeName.toLowerCase() !== "td")
                        return;
                    if ($(cell).hasClass("tui-pm")) {
                        _this.prevMonth();
                    }
                    else if ($(cell).hasClass("tui-py")) {
                        _this.prevYear();
                    }
                    else if ($(cell).hasClass("tui-ny")) {
                        _this.nextYear();
                    }
                    else if ($(cell).hasClass("tui-nm")) {
                        _this.nextMonth();
                    }
                    else if (typeof cell["offsetMonth"] === "number") {
                        var d = parseInt(cell.innerHTML, 10);
                        var y = _this.get("year"), m = _this.get("month");
                        var offset = cell["offsetMonth"];
                        if (offset < 0) {
                            if (m === 1) {
                                y--;
                                m = 12;
                            }
                            else {
                                m--;
                            }
                            _this.onPicked(y, m, d);
                        }
                        else if (offset > 0) {
                            if (m === 12) {
                                y++;
                                m = 1;
                            }
                            else {
                                m++;
                            }
                            _this.onPicked(y, m, d);
                        }
                        else if (offset === 0) {
                            _this.onPicked(y, m, d);
                        }
                    }
                }).click(function (e) {
                    var cell = (e.target || e.srcElement);
                    if (cell.nodeName.toLowerCase() !== "td")
                        return;
                    if (typeof cell["offsetMonth"] === "number")
                        _this.fire("click", { e: e, "time": _this.get("time"), "type": "pick" });
                    else if (/^(tui-pm|tui-py|tui-nm|tui-ny)$/.test(cell.className))
                        _this.fire("click", { e: e, "time": _this.get("time"), "type": "change" });
                }).dblclick(function (e) {
                    var cell = (e.target || e.srcElement);
                    if (cell.nodeName.toLowerCase() !== "td")
                        return;
                    if (typeof cell["offsetMonth"] === "number")
                        _this.fire("dblclick", { e: e, "time": _this.get("time") });
                });
                $(this._).keydown(function (e) {
                    var k = e.keyCode;
                    if ([13, 33, 34, 37, 38, 39, 40].indexOf(k) >= 0) {
                        if (k === 37) {
                            var tm = tui.time.dateAdd(_this.get("time"), -1);
                            _this.set("time", tm);
                        }
                        else if (k === 38) {
                            var tm = tui.time.dateAdd(_this.get("time"), -7);
                            _this.set("time", tm);
                        }
                        else if (k === 39) {
                            var tm = tui.time.dateAdd(_this.get("time"), 1);
                            _this.set("time", tm);
                        }
                        else if (k === 40) {
                            var tm = tui.time.dateAdd(_this.get("time"), 7);
                            _this.set("time", tm);
                        }
                        else if (k === 33) {
                            _this.prevMonth();
                        }
                        else if (k === 34) {
                            _this.nextMonth();
                        }
                        else if (k === 13) {
                            _this.fire("click", { e: e, "time": _this.get("time"), "type": "pick" });
                        }
                        return e.preventDefault();
                    }
                });
            };
            Calendar.prototype.onPicked = function (y, m, d) {
                var oldTime = this.get("time");
                var newTime = new Date(y, m - 1, d, oldTime.getHours(), oldTime.getMinutes(), oldTime.getSeconds());
                this.set("time", newTime);
            };
            Calendar.prototype.makeTime = function (proc) {
                var t = { y: this.get("year"), m: this.get("month"), d: this.get("day") };
                proc(t);
                var newDate = new Date(t.y, t.m - 1, 1);
                if (t.d > tui.time.totalDaysOfMonth(newDate))
                    t.d = tui.time.totalDaysOfMonth(newDate);
                this.onPicked(t.y, t.m, t.d);
            };
            Calendar.prototype.prevMonth = function () {
                this.makeTime(function (t) {
                    if (t.m === 1) {
                        t.y--;
                        t.m = 12;
                    }
                    else {
                        t.m--;
                    }
                });
            };
            Calendar.prototype.nextMonth = function () {
                this.makeTime(function (t) {
                    if (t.m === 12) {
                        t.y++;
                        t.m = 1;
                    }
                    else {
                        t.m++;
                    }
                });
            };
            Calendar.prototype.prevYear = function () {
                this.makeTime(function (t) {
                    t.y--;
                });
            };
            Calendar.prototype.nextYear = function () {
                this.makeTime(function (t) {
                    t.y++;
                });
            };
            Calendar.prototype.render = function () {
                function firstDay(date) {
                    var y = date.getFullYear();
                    var m = date.getMonth();
                    return new Date(y, m, 1);
                }
                var tb = this._components["table"];
                var tm = this.get("time");
                var today = tui.time.now();
                var firstWeek = firstDay(tm).getDay();
                var daysOfMonth = tui.time.totalDaysOfMonth(tm);
                var day = 0;
                tb.rows[0].cells[2].innerHTML = tm.getFullYear() + " - " + this.get("month");
                for (var i = 0; i < 6; i++) {
                    for (var j = 0; j < 7; j++) {
                        var cell = tb.rows[i + 2].cells[j];
                        cell.className = "";
                        if (day === 0) {
                            if (j === firstWeek) {
                                day = 1;
                                cell.innerHTML = day + "";
                                cell.offsetMonth = 0;
                            }
                            else {
                                var preMonthDay = new Date(firstDay(tm).valueOf() - ((firstWeek - j) * 1000 * 24 * 60 * 60));
                                cell.innerHTML = preMonthDay.getDate() + "";
                                cell.offsetMonth = -1;
                                $(cell).addClass("tui-before");
                            }
                        }
                        else {
                            day++;
                            if (day <= daysOfMonth) {
                                cell.innerHTML = day + "";
                                cell.offsetMonth = 0;
                            }
                            else {
                                cell.innerHTML = (day - daysOfMonth) + "";
                                cell.offsetMonth = 1;
                                $(cell).addClass("tui-after");
                            }
                        }
                        if (day === this.get("day"))
                            $(cell).addClass("tui-actived");
                        if (j === 0 || j === 6)
                            $(cell).addClass("tui-weekend");
                        if (this.get("year") === today.getFullYear() && this.get("month") === (today.getMonth() + 1) && day === today.getDate()) {
                            $(cell).addClass("tui-today");
                        }
                    }
                }
                var timebar = this._components["timeBar"];
                if (this.get("timeBar")) {
                    timebar.style.display = "";
                    $(timebar).children("input[name=hours]").val(formatNumber(tm.getHours(), 23));
                    $(timebar).children("input[name=minutes]").val(formatNumber(tm.getMinutes(), 59));
                    $(timebar).children("input[name=seconds]").val(formatNumber(tm.getSeconds(), 59));
                }
                else {
                    timebar.style.display = "none";
                }
            };
            return Calendar;
        }(widget.Widget));
        widget.Calendar = Calendar;
        widget.register(Calendar);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        /**
         * <group>
         * Attributes: name, type(check,radio,toggle)
         * Events:
         */
        var Group = (function (_super) {
            __extends(Group, _super);
            function Group() {
                _super.apply(this, arguments);
            }
            Group.prototype.initChildren = function (childNodes) {
                for (var _i = 0, childNodes_3 = childNodes; _i < childNodes_3.length; _i++) {
                    var node = childNodes_3[_i];
                    this._.appendChild(node);
                }
            };
            Group.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "value": {
                        "set": function (value) {
                            if (typeof value === "object" && value !== null) {
                                var children = widget.search(_this._);
                                for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
                                    var item = children_2[_i];
                                    var key = item.get("name");
                                    if (key !== null) {
                                        item.set("value", value[key]);
                                    }
                                }
                            }
                        },
                        "get": function () {
                            var value = {};
                            var children = widget.search(_this._);
                            for (var _i = 0, children_3 = children; _i < children_3.length; _i++) {
                                var item = children_3[_i];
                                var key = item.get("name");
                                if (key !== null) {
                                    value[key] = item.get("value");
                                }
                            }
                            return value;
                        }
                    }
                });
            };
            Group.prototype.init = function () {
                widget.init(this._);
            };
            Group.prototype.render = function () {
                var root = this._;
                var result = widget.search(root);
                for (var _i = 0, result_2 = result; _i < result_2.length; _i++) {
                    var child = result_2[_i];
                    child.render();
                }
            };
            return Group;
        }(widget.Widget));
        widget.Group = Group;
        var ButtonGroup = (function (_super) {
            __extends(ButtonGroup, _super);
            function ButtonGroup() {
                _super.apply(this, arguments);
            }
            ButtonGroup.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "value": {
                        "set": function (value) {
                            var children = widget.search(_this._, function (elem) {
                                if (elem.get("parent") === _this && elem instanceof widget.Button)
                                    return true;
                                else
                                    return false;
                            });
                            function check(v) {
                                if (value instanceof Array) {
                                    return value.indexOf(v) >= 0;
                                }
                                else {
                                    return value === v;
                                }
                            }
                            for (var _i = 0, children_4 = children; _i < children_4.length; _i++) {
                                var button = children_4[_i];
                                if (check(button.get("value"))) {
                                    button.set("checked", true);
                                }
                                else
                                    button.set("checked", false);
                            }
                        },
                        "get": function () {
                            var values = [];
                            var children = widget.search(_this._, function (elem) {
                                if (elem.get("parent") === _this && elem instanceof widget.Button)
                                    return true;
                                else
                                    return false;
                            });
                            for (var _i = 0, children_5 = children; _i < children_5.length; _i++) {
                                var button = children_5[_i];
                                if (button.get("checked"))
                                    values.push(button.get("value"));
                            }
                            if (_this.get("type") === "radio" || _this.get("type") === "toggle-radio") {
                                if (values.length > 0)
                                    return values[0];
                                else
                                    return null;
                            }
                            else
                                return values;
                        }
                    },
                    "text": {
                        "get": function () {
                            var values = [];
                            var children = widget.search(_this._, function (elem) {
                                if (elem.get("parent") === _this && elem instanceof widget.Button)
                                    return true;
                                else
                                    return false;
                            });
                            for (var _i = 0, children_6 = children; _i < children_6.length; _i++) {
                                var button = children_6[_i];
                                if (button.get("checked"))
                                    values.push(button.get("text"));
                            }
                            return values.join(",");
                        }
                    }
                });
            };
            return ButtonGroup;
        }(Group));
        widget.ButtonGroup = ButtonGroup;
        widget.register(Group);
        widget.register(ButtonGroup);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
/// <reference path="group.ts" />
/// <reference path="../ajax/ajax.ts" />
/// <reference path="../service/service.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget_5) {
        "use strict";
        var Component = (function (_super) {
            __extends(Component, _super);
            function Component() {
                _super.apply(this, arguments);
            }
            Component.prototype.checkReady = function () {
                var hasHandler = !!this.get("handler");
                var hasSrc = !!this.get("src");
                if ((!hasHandler || hasHandler && this._scriptReady)
                    && (!hasSrc || hasSrc && this._htmlReady)
                    && this._changed
                    && this._childrenInit
                    && this._noReadyCount <= 0) {
                    this._changed = false;
                    if (this._fn) {
                        try {
                            this._fn.call(this);
                        }
                        finally {
                            this._fn = null;
                        }
                    }
                    this.fire("load");
                    var parent = this.get("parent");
                    parent && parent.fire("componentReady", { name: this.get("name") });
                }
            };
            Component.prototype.initRestriction = function () {
                var _this = this;
                this._fn = null;
                this._changed = true;
                this._noReadyCount = 0;
                this._childrenInit = false;
                this._scriptReady = false;
                this._htmlReady = false;
                this.on("componentReady", function (e) {
                    _this._noReadyCount--;
                    _this.checkReady();
                });
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "handler": {
                        "set": function (value) {
                            var oldValue = _this._data["handler"];
                            if (value && (value + "").trim().length > 0) {
                                value = (value + "").trim();
                                if (oldValue != value)
                                    _this._changed = true;
                                _this._data["handler"] = value;
                                _this._fn = null;
                                _this._scriptReady = false;
                                tui.ajax.getFunction(value).done(function (result) {
                                    _this._fn = result;
                                    _this._scriptReady = true;
                                    _this.checkReady();
                                }).fail(function () {
                                    _this._scriptReady = true;
                                    _this.checkReady();
                                });
                            }
                            else {
                                if (oldValue)
                                    _this._changed = true;
                                delete _this._data["handler"];
                                _this._scriptReady = true;
                                _this._fn = null;
                                _this.checkReady();
                            }
                        }
                    }, "src": {
                        "set": function (value) {
                            var oldValue = _this._data["src"];
                            if (value == oldValue)
                                return;
                            if (value && (value + "").trim().length > 0) {
                                value = (value + "").trim();
                                _this._data["src"] = value;
                                _this._htmlReady = false;
                                _this._childrenInit = false;
                                tui.ajax.getComponent(_this.get("url")).done(function (result, handler) {
                                    _this._htmlReady = true;
                                    tui.browser.setInnerHtml(_this._, result);
                                    _this.loadComponents();
                                    handler && _this.set("handler", handler);
                                    _this.render();
                                    _this.checkReady();
                                }).fail(function () {
                                    _this._htmlReady = true;
                                    _this.checkReady();
                                });
                            }
                            else {
                                if (oldValue) {
                                    _this._changed = true;
                                    _this._.innerHTML = "";
                                }
                                delete _this._data["src"];
                                _this._htmlReady = true;
                                _this.checkReady();
                            }
                        }
                    }, "url": {
                        "get": function () {
                            var parentUrl = _this.getParentUrl();
                            var path = _this.get("src");
                            if (!path)
                                return parentUrl;
                            else {
                                if (tui.text.isAbsUrl(path))
                                    return path;
                                else
                                    return tui.text.joinUrl(tui.text.getBaseUrl(parentUrl), path);
                            }
                        }
                    }
                });
            };
            Component.prototype.getParentUrl = function () {
                var elem = this._.parentNode;
                while (elem) {
                    if (elem.__widget__ && elem.__widget__.getNodeName() === "component") {
                        return elem.__widget__.get("url");
                    }
                    else {
                        elem = elem.parentNode;
                    }
                }
                return location.href;
            };
            Component.prototype.loadComponents = function () {
                var _this = this;
                var searchElem = function (parent) {
                    for (var i = 0; i < parent.childNodes.length; i++) {
                        var node = parent.childNodes[i];
                        if (node.nodeType !== 1) {
                            continue;
                        }
                        var elem = node;
                        var widget_6 = elem.__widget__;
                        var name_4 = void 0;
                        var fullName = widget_5.getFullName(elem);
                        if (fullName === "tui:component")
                            _this._noReadyCount++;
                        if (widget_6) {
                            name_4 = tui.get(elem).get("name");
                            if (typeof name_4 === "string" && name_4.trim().length > 0)
                                _this._components[name_4] = elem;
                        }
                        else {
                            name_4 = elem.getAttribute("name");
                            if (typeof name_4 === "string" && name_4.trim().length > 0)
                                _this._components[name_4] = elem;
                            if (!fullName.match(/^tui:/i) || fullName.match(/^tui:(dialog-select|input-group|group|button-group)$/))
                                searchElem(node);
                        }
                    }
                };
                this._components = { '': this._ };
                this._noReadyCount = 0;
                searchElem(this._);
                this._childrenInit = true;
            };
            Component.prototype.initChildren = function (childNodes) {
                var _this = this;
                if (this.get("src") == null) {
                    childNodes.forEach(function (n) { return _this._.appendChild(n); });
                    this.loadComponents();
                    this.checkReady();
                }
            };
            Component.prototype.use = function (fn, desc) {
                var _this = this;
                if (typeof fn === "function") {
                    var params = tui.service.parseParameters(fn, desc);
                    var argv = params.split(",").map(function (s) {
                        if (!s)
                            return null;
                        else if (s[0] === '$') {
                            return tui.service.get(s.substr(1));
                        }
                        else {
                            var c = _this.getComponent(s.trim());
                            if (c && c.__widget__)
                                c = c.__widget__;
                            return c;
                        }
                    });
                    fn.apply(this, argv);
                }
            };
            Component.prototype.render = function () {
                widget_5.init(this._);
            };
            return Component;
        }(widget_5.Group));
        widget_5.Component = Component;
        widget_5.register(Component);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        var VALIDATORS = {
            "*email": "^(\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*)?$",
            "*chinese": "^[\\u4e00-\\u9fa5]*$",
            "*url": "^(https?://([\\w-_]+:[^@/]+@)?[\\w-]+(\\.[\\w-]+)*(:[0-9]+)?(/[\\w-./?%&=]*)?)?$",
            "*digital": "^\\d*$",
            "*integer": "^([+\\-]?\\d+)?$",
            "*float": "^([+\\-]?\\d*\\.\\d+)?$",
            "*number": "^([+\\-]?\\d+|(\\d*\\.\\d+))?$",
            "*currency": "^(-?\\d{1,3}(,\\d{3})*\\.\\d{2,3})?$",
            "*date": "^([0-9]{4}-1[0-2]|0?[1-9]-0?[1-9]|[12][0-9]|3[01])?$",
            "*key": "^([_a-zA-Z][a-zA-Z0-9_]*)?$",
            "*any": "\\S+"
        };
        var InputBase = (function (_super) {
            __extends(InputBase, _super);
            function InputBase() {
                _super.apply(this, arguments);
                this._valid = true;
                this._invalidMessage = null;
            }
            InputBase.prototype.initChildren = function (childNodes) {
                var validators = [];
                for (var _i = 0, childNodes_4 = childNodes; _i < childNodes_4.length; _i++) {
                    var node = childNodes_4[_i];
                    if (widget.getFullName(node) === "tui:verify") {
                        var format = node.getAttribute("format");
                        if (format) {
                            var validator = { format: format, message: node.innerHTML };
                            validators.push(validator);
                        }
                    }
                }
                this._set("validate", validators);
            };
            InputBase.prototype.reset = function () {
                if (this._valid !== true) {
                    this._valid = true;
                    this._invalidMessage = null;
                    this.render();
                }
            };
            InputBase.prototype.updateEmptyState = function (empty) {
                if (this._isEmpty !== empty) {
                    this._isEmpty = empty;
                    if (this._valid === true)
                        this.render();
                }
            };
            InputBase.prototype.validate = function (e) {
                var text = this.get("text");
                if (text === null)
                    text = "";
                this._valid = true;
                var validator = this.get("validate");
                if (text === "" && this.get("allowEmpty")) {
                    return true;
                }
                if (!(validator instanceof Array))
                    return true;
                for (var _i = 0, validator_1 = validator; _i < validator_1.length; _i++) {
                    var item = validator_1[_i];
                    var k = item.format;
                    if (k === "*password") {
                        if (!/[a-z]/.test(text) ||
                            !/[A-Z]/.test(text) ||
                            !/[0-9]/.test(text) ||
                            !/[\~\`\!\@\#\$\%\^\&\*\(\)\_\-\+\=\\\]\[\{\}\:\;\"\'\/\?\,\.\<\>\|]/.test(text) ||
                            text.length < 6) {
                            this._valid = false;
                        }
                    }
                    else if (k.substr(0, 8) === "*maxlen:") {
                        var imaxLen = parseFloat(k.substr(8));
                        if (isNaN(imaxLen))
                            throw new Error("Invalid validator: '*maxlen:...' must follow a number");
                        var ival = text.length;
                        if (ival > imaxLen) {
                            this._valid = false;
                        }
                    }
                    else if (k.substr(0, 8) === "*minlen:") {
                        var iminLen = parseFloat(k.substr(8));
                        if (isNaN(iminLen))
                            throw new Error("Invalid validator: '*minLen:...' must follow a number");
                        var ival = text.length;
                        if (ival < iminLen) {
                            this._valid = false;
                        }
                    }
                    else if (k.substr(0, 5) === "*max:") {
                        var imax = parseFloat(k.substr(5));
                        if (isNaN(imax))
                            throw new Error("Invalid validator: '*max:...' must follow a number");
                        var ival = parseFloat(text);
                        if (isNaN(ival) || ival > imax) {
                            this._valid = false;
                        }
                    }
                    else if (k.substr(0, 5) === "*min:") {
                        var imin = parseFloat(k.substr(5));
                        if (isNaN(imin))
                            throw new Error("Invalid validator: '*min:...' must follow a number");
                        var ival = parseFloat(text);
                        if (isNaN(ival) || ival < imin) {
                            this._valid = false;
                        }
                    }
                    else if (k.substr(0, 6) === "*same:") {
                        var other = k.substr(6);
                        var o = widget.get(other);
                        if (o) {
                            var otherText = o.get("text");
                            if (otherText === null)
                                otherText = "";
                            if (text !== otherText)
                                this._valid = false;
                        }
                        else {
                            this._valid = false;
                        }
                    }
                    else {
                        var regexp;
                        if (k.substr(0, 1) === "*") {
                            var v = VALIDATORS[k];
                            if (v)
                                regexp = new RegExp(v);
                            else
                                throw new Error("Invalid validator: " + k + " is not a valid validator");
                        }
                        else {
                            regexp = new RegExp(k);
                        }
                        this._valid = regexp.test(text);
                    }
                    if (!this._valid) {
                        this._invalidMessage = item.message;
                        break;
                    }
                }
                if (!this._valid && !this._invalidMessage) {
                    this._invalidMessage = tui.str("Invalid input.");
                }
                this.render();
                if (e)
                    this.fire("validate", { e: e, valid: this._valid, message: this._invalidMessage });
                return this._valid;
            };
            return InputBase;
        }(widget.Widget));
        widget.InputBase = InputBase;
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="inputBase.ts" />
/// <reference path="../browser/keyboard.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        var SelectBase = (function (_super) {
            __extends(SelectBase, _super);
            function SelectBase() {
                _super.apply(this, arguments);
                this._inSelection = false;
            }
            SelectBase.prototype.closeSelect = function () {
                var popup = widget.get(this._components["popup"]);
                popup && popup.close();
            };
            SelectBase.prototype.init = function () {
                var _this = this;
                var $root = $(this._);
                var popup = this.createPopup();
                this._components["popup"] = popup._;
                var label = this._components["label"] = document.createElement("span");
                var iconRight = this._components["iconRight"] = document.createElement("i");
                var iconInvalid = this._components["iconInvalid"] = document.createElement("i");
                var clearButton = this._components["clearButton"] = document.createElement("i");
                clearButton.className = "tui-input-clear-button";
                iconInvalid.className = "tui-invalid-icon";
                label.className = "tui-input-label";
                label.setAttribute("unselectable", "on");
                this._.appendChild(label);
                this._.appendChild(iconInvalid);
                this._.appendChild(iconRight);
                this._.appendChild(clearButton);
                this._.setAttribute("tabIndex", "0");
                $(this._).focus(function () {
                    $root.addClass("tui-active");
                });
                $(this._).blur(function () {
                    $root.removeClass("tui-active");
                    if (_this.get("disable"))
                        return;
                    if (_this.get("autoValidate")) {
                        if (!_this._inSelection)
                            _this.validate();
                    }
                });
                $root.on("mousedown", function (e) {
                    if (_this.get("disable"))
                        return;
                    _this._.focus();
                    _this.reset();
                    setTimeout(function () {
                        _this._inSelection = true;
                        _this.openSelect();
                    }, 0);
                });
                $root.keypress(function (e) {
                    if (_this.get("disable"))
                        return;
                    if (e.charCode === tui.browser.KeyCode.SPACE) {
                        e.preventDefault();
                        _this.reset();
                        setTimeout(function () {
                            _this._inSelection = true;
                            _this.openSelect();
                        }, 0);
                    }
                });
                $(clearButton).on("mousedown", function (e) {
                    _this.set("value", null);
                    _this.set("text", "");
                    _this.reset();
                    _this.fire("change", e);
                    e.stopPropagation();
                });
                popup.on("close", function () {
                    _this._inSelection = false;
                    if (_this.get("autoValidate")) {
                        setTimeout(function () {
                            if (document.activeElement !== _this._)
                                _this.validate();
                        });
                    }
                });
            };
            SelectBase.prototype.render = function () {
                this._.scrollLeft = 0;
                var $root = $(this._);
                var label = this._components["label"];
                var iconRight = this._components["iconRight"];
                var iconInvalid = this._components["iconInvalid"];
                var clearButton = this._components["clearButton"];
                if (this.get("disable")) {
                    $root.addClass("tui-disable");
                }
                else {
                    $root.removeClass("tui-disable");
                }
                var text = this.get("text");
                var noValue = false;
                if (text === null || text === "") {
                    noValue = true;
                    text = this.get("placeholder");
                    $(label).addClass("tui-placeholder");
                }
                else {
                    $(label).removeClass("tui-placeholder");
                }
                if (text === null)
                    text = "";
                $(label).text(text);
                iconRight.className = this.get("iconRight");
                iconRight.style.display = "";
                iconRight.style.right = "0";
                if (!this._valid) {
                    $root.addClass("tui-invalid");
                    iconInvalid.style.display = "";
                    iconInvalid.style.right = iconRight.offsetWidth + "px";
                }
                else {
                    $root.removeClass("tui-invalid");
                    iconInvalid.style.display = "none";
                }
                if (this.get("clearable") && (!noValue)) {
                    clearButton.style.display = "";
                    clearButton.style.right = iconRight.offsetWidth + iconInvalid.offsetWidth + "px";
                }
                else {
                    clearButton.style.display = "none";
                }
                if (!this._valid && this._invalidMessage) {
                    this._set("follow-tooltip", this._invalidMessage);
                }
                else {
                    this._set("follow-tooltip", null);
                }
            };
            SelectBase.PADDING = 6;
            return SelectBase;
        }(widget.InputBase));
        widget.SelectBase = SelectBase;
        var SelectPopupBase = (function (_super) {
            __extends(SelectPopupBase, _super);
            function SelectPopupBase() {
                _super.apply(this, arguments);
            }
            SelectPopupBase.prototype.createPopup = function () {
                return widget.create(widget.Popup);
            };
            return SelectPopupBase;
        }(SelectBase));
        widget.SelectPopupBase = SelectPopupBase;
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="selectBase.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        /**
         * <tui:date-picker>
         * Attributes: value, text(value to string), format, timeBar
         * Method: openSelect
         * Events: change
         */
        var DatePicker = (function (_super) {
            __extends(DatePicker, _super);
            function DatePicker() {
                _super.apply(this, arguments);
            }
            DatePicker.prototype.initRestriction = function () {
                var _this = this;
                var calendar = widget.create(widget.Calendar);
                this._components["calendar"] = calendar._;
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "timeBar": {
                        "set": function (value) {
                            calendar._set("timeBar", !!value);
                        },
                        "get": function () {
                            return !!calendar.get("timeBar");
                        }
                    },
                    "text": {
                        "set": function (value) { },
                        "get": function () {
                            var value = _this.get("value");
                            if (value === null)
                                return "";
                            return tui.time.formatDate(value, _this.get("format"));
                        }
                    }
                });
            };
            DatePicker.prototype.init = function () {
                var _this = this;
                _super.prototype.init.call(this);
                this.setInit("format", "yyyy-MM-dd");
                this.setInit("iconRight", "fa-calendar");
                var calendar = widget.get(this._components["calendar"]);
                var container = document.createElement("div");
                var toolbar = container.appendChild(document.createElement("div"));
                toolbar.className = "tui-select-toolbar";
                container.insertBefore(calendar._, container.firstChild);
                var popup = widget.get(this._components["popup"]);
                popup._set("content", container);
                this._components["toolbar"] = toolbar;
                calendar._.style.display = "block";
                calendar._.style.borderWidth = "0";
                calendar.on("click", function (e) {
                    _this.set("value", calendar.get("value"));
                    _this.fire("change", { e: e, value: _this.get("value"), text: _this.get("text") });
                    if (e.data.type === "pick") {
                        _this.closeSelect();
                        _this._.focus();
                    }
                });
                $(toolbar).click(function (e) {
                    var obj = (e.target || e.srcElement);
                    var name = obj.getAttribute("name");
                    if (name === "today") {
                        _this.set("value", tui.time.now());
                        _this.fire("change", { e: e, value: _this.get("value"), text: _this.get("text") });
                        _this.closeSelect();
                        _this._.focus();
                    }
                    else if (name === "clear") {
                        _this.set("value", null);
                        _this.fire("change", { e: e, value: _this.get("value"), text: _this.get("text") });
                        _this.closeSelect();
                        _this._.focus();
                    }
                });
            };
            DatePicker.prototype.openSelect = function () {
                var _this = this;
                var calendar = widget.get(this._components["calendar"]);
                var popup = widget.get(this._components["popup"]);
                //popup._set("content", list._);
                var toolbar = this._components["toolbar"];
                var todayButton = "<a name='today'>" + tui.str("Today") + "</a>";
                var clearButton = " | <a name='clear'><i class='fa fa-trash-o'></i> " + tui.str("Clear") + "</a>";
                var clearable = this.get("clearable");
                calendar._.style.outline = "none";
                toolbar.style.display = "";
                if (clearable)
                    toolbar.innerHTML = todayButton + clearButton;
                else
                    toolbar.innerHTML = todayButton;
                popup.open(this._, "Lb");
                setTimeout(function () {
                    calendar._.focus();
                    calendar.set("value", _this.get("value"));
                });
            };
            return DatePicker;
        }(widget.SelectPopupBase));
        widget.DatePicker = DatePicker;
        widget.register(DatePicker);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="inputBase.ts" />
/// <reference path="../browser/upload.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        var File = (function (_super) {
            __extends(File, _super);
            function File() {
                _super.apply(this, arguments);
            }
            File.prototype.initRestriction = function () {
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
                                _this._set("text", "");
                            }
                        }
                    }
                });
            };
            File.prototype.init = function () {
                var _this = this;
                this.setInit("iconRight", "fa-file-text-o");
                var $root = $(this._);
                var label = this._components["label"] = document.createElement("span");
                var iconRight = this._components["iconRight"] = document.createElement("i");
                var iconInvalid = this._components["iconInvalid"] = document.createElement("i");
                iconInvalid.className = "tui-invalid-icon";
                label.className = "tui-input-label";
                label.setAttribute("unselectable", "on");
                this._.appendChild(label);
                this._.appendChild(iconInvalid);
                this._.appendChild(iconRight);
                this._.setAttribute("tabIndex", "0");
                $(this._).focus(function () {
                    $root.addClass("tui-active");
                });
                var onblur = function () {
                    if (document.activeElement === _this._ || document.activeElement === _this._uploader.getInput())
                        return;
                    $root.removeClass("tui-active");
                    if (_this.get("disable"))
                        return;
                    if (_this.get("autoValidate")) {
                        _this.validate();
                    }
                };
                $(this._).blur(function () {
                    setTimeout(function () {
                        onblur();
                    });
                });
                this._uploader.on("focus", function () {
                    $root.addClass("tui-active");
                });
                this._uploader.on("blur", function () {
                    setTimeout(function () {
                        onblur();
                    });
                });
                this._uploader.on("change", function (e) {
                    return _this.fire("change", e);
                });
                this._uploader.on("success", function (e) {
                    _this._set("value", e.data.response.fileId);
                    _this.set("text", e.data.response.fileName);
                });
                this._uploader.on("error", function (e) {
                    tui.errbox(e.data.response.error, tui.str("Error"));
                });
            };
            File.prototype.render = function () {
                this._.scrollLeft = 0;
                var $root = $(this._);
                var label = this._components["label"];
                var iconRight = this._components["iconRight"];
                var iconInvalid = this._components["iconInvalid"];
                if (this.get("disable")) {
                    $root.addClass("tui-disable");
                    this._uploader.deleteInput();
                    this._.setAttribute("tabIndex", "0");
                }
                else {
                    $root.removeClass("tui-disable");
                    this._uploader.createInput();
                    this._.removeAttribute("tabIndex");
                }
                var text = this.get("text");
                if (text === null || text === "") {
                    text = this.get("placeholder");
                    $(label).addClass("tui-placeholder");
                }
                else {
                    $(label).removeClass("tui-placeholder");
                }
                if (text === null)
                    text = "";
                $(label).text(text);
                iconRight.className = this.get("iconRight");
                iconRight.style.display = "";
                iconRight.style.right = "0";
                if (!this._valid) {
                    $root.addClass("tui-invalid");
                    iconInvalid.style.display = "";
                    iconInvalid.style.right = iconRight.offsetWidth + "px";
                }
                else {
                    $root.removeClass("tui-invalid");
                    iconInvalid.style.display = "none";
                }
                if (!this._valid && this._invalidMessage) {
                    this._set("follow-tooltip", this._invalidMessage);
                }
                else {
                    this._set("follow-tooltip", null);
                }
            };
            File.PADDING = 6;
            return File;
        }(widget.InputBase));
        widget.File = File;
        widget.register(File);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        var Frame = (function (_super) {
            __extends(Frame, _super);
            function Frame() {
                _super.apply(this, arguments);
            }
            Frame.prototype.initRestriction = function () {
                var _this = this;
                this._cache = {};
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "src": {
                        "set": function (value) {
                            _this._go(value);
                        }
                    }
                });
            };
            Frame.prototype._go = function (src, cache, name) {
                var _this = this;
                if (cache === void 0) { cache = true; }
                this._data["src"] = src;
                if (typeof name === tui.UNDEFINED || name == null) {
                    name = "";
                }
                var key = name + ":" + src;
                if (cache && this._cache.hasOwnProperty(key)) {
                    if (tui.ieVer > 0)
                        while (this._.children.length > 0) {
                            this._.removeChild(this._.children[0]);
                        }
                    else
                        this._.innerHTML = "";
                    var page = this._cache[key];
                    this._.appendChild(page);
                }
                else {
                    tui.ajax.getBody(src).done(function (content) {
                        var page = tui.browser.toElement(content, true);
                        if (tui.ieVer > 0)
                            while (_this._.children.length > 0) {
                                _this._.removeChild(_this._.children[0]);
                            }
                        else
                            _this._.innerHTML = "";
                        _this._.appendChild(page);
                        if (cache) {
                            _this._cache[key] = page;
                        }
                        _this.render();
                    });
                }
            };
            Frame.prototype.go = function (src, cache, name) {
                if (cache === void 0) { cache = true; }
                this._go(src, cache, name);
                this.render();
            };
            Frame.prototype.render = function () {
                widget.init(this._);
            };
            return Frame;
        }(widget.Widget));
        widget.Frame = Frame;
        widget.register(Frame);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
/// <reference path="../browser/keyboard.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        function vval(v) {
            if (isNaN(v))
                return 0;
            else
                return v;
        }
        /**
         * <tui:gird>
         * Attributes: data, list(array type data), tree(tree type data),
         * columns, sortColumn, sortType, scrollTop, scrollLeft, activeRow,
         * activeColumn
         * Method: scrollTo, setSortFlag
         * Events: sort, rowclick, rowdblclick, rowcheck, keyselect
         */
        var Grid = (function (_super) {
            __extends(Grid, _super);
            function Grid() {
                _super.apply(this, arguments);
                this._setupHeadMoveListener = false;
                this._columnWidths = [];
                this._vLines = [];
                this._handlers = [];
            }
            Grid.prototype.initRestriction = function () {
                var _this = this;
                // Register update callback routine
                var updateCallback = (function () {
                    var me = _this;
                    return function (data) {
                        if (data.data["completely"]) {
                            me.render();
                            me.fire("update");
                        }
                        else {
                            me.drawContent();
                            me.fire("update");
                        }
                    };
                })();
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "selectable": {
                        "get": function () {
                            var val = _this._data["selectable"];
                            if (typeof val === tui.UNDEFINED || val === null)
                                return true;
                            else
                                return !!val;
                        }
                    },
                    "lineHeight": {
                        "get": function () {
                            var val = _this._data["lineHeight"];
                            if (typeof val !== "number" || isNaN(val))
                                return Grid.LINE_HEIGHT;
                            else
                                return val;
                        }
                    },
                    "dataType": {
                        "set": function (value) { }
                    },
                    "data": {
                        "set": function (value) {
                            if (_this._data["data"] && typeof _this._data["data"].off === "function") {
                                _this._data["data"].off("update", updateCallback);
                            }
                            if (value instanceof tui.ds.List ||
                                value instanceof tui.ds.RemoteList) {
                                _this._data["data"] = value;
                                _this._data["dataType"] = "list";
                            }
                            else if (value instanceof tui.ds.Tree ||
                                value instanceof tui.ds.RemoteTree) {
                                _this._data["data"] = value;
                                _this._data["dataType"] = "tree";
                            }
                            else if (value instanceof Array) {
                                _this._data["data"] = new tui.ds.List(value);
                            }
                            else if (value === null) {
                                _this._data["data"] = new tui.ds.List([]);
                            }
                            if (_this._data["data"] && typeof _this._data["data"].on === "function") {
                                _this._data["data"].on("update", updateCallback);
                            }
                            _this._vbar && _this._vbar._set("value", 0);
                            _this._vbar && _this._hbar._set("value", 0);
                            _this._set("activeRow", null);
                        },
                        "get": function () {
                            var data = _this._data["data"];
                            if (data)
                                return data;
                            else
                                return new tui.ds.List([]);
                        }
                    },
                    "list": {
                        "set": function (value) {
                            if (value instanceof tui.ds.List ||
                                value instanceof tui.ds.RemoteList)
                                _this._set("data", value);
                            else if (value instanceof Array) {
                                _this._set("data", new tui.ds.List(value));
                            }
                            else if (value === null) {
                                _this._set("data", null);
                            }
                        },
                        "get": function () { }
                    },
                    "tree": {
                        "set": function (value) {
                            if (value instanceof tui.ds.Tree ||
                                value instanceof tui.ds.RemoteTree)
                                _this._set("data", value);
                            else if (value instanceof Array) {
                                _this._set("data", new tui.ds.Tree(value));
                            }
                            else if (value === null) {
                                _this._set("data", null);
                            }
                        },
                        "get": function () { }
                    },
                    "columns": {
                        "set": function (value) {
                            if (value instanceof Array) {
                                _this._data["columns"] = value;
                                _this.clearBuffer();
                                _this._columnWidths = [];
                            }
                        },
                        "get": function () {
                            if (_this._data["columns"])
                                return _this._data["columns"];
                            else
                                return [];
                        }
                    },
                    "scrollTop": {
                        "set": function (value) {
                            _this._vbar._set("value", value);
                        },
                        "get": function () {
                            return _this._vbar.get("value");
                        }
                    },
                    "scrollLeft": {
                        "set": function (value) {
                            _this._hbar._set("value", value);
                        },
                        "get": function () {
                            return _this._hbar.get("value");
                        }
                    },
                    "activeRow": {
                        "set": function (value) {
                            if (typeof value === "number" && !isNaN(value) || value === null) {
                                if (value < 0)
                                    value = 0;
                                if (value > _this.get("data").length() - 1)
                                    value = _this.get("data").length() - 1;
                                if (_this._data["activeRow"] != null && _this._buffer)
                                    $(_this._buffer.lines[_this._data["activeRow"] - _this._buffer.begin]).removeClass("tui-actived");
                                _this._data["activeRow"] = value;
                                if (value != null && _this._buffer)
                                    $(_this._buffer.lines[value - _this._buffer.begin]).addClass("tui-actived");
                            }
                        },
                        "get": function () {
                            var row = _this._data["activeRow"];
                            if (row === null)
                                return null;
                            if (row >= 0 && row < _this.get("data").length())
                                return row;
                            else
                                return null;
                        }
                    },
                    "activeRowData": {
                        "set": function (value) { },
                        "get": function () {
                            var r = _this.get("activeRow");
                            if (r != null) {
                                return _this.get("data").get(r);
                            }
                            else
                                return r;
                        }
                    }
                });
            };
            Grid.prototype.init = function () {
                var _this = this;
                this._tuid = tui.tuid();
                $(this._).attr({ "tabIndex": 0, "unselectable": "on" });
                tui.browser.setInnerHtml(this._, "<div class='tui-grid-head'></div><div class='tui-content'></div>");
                var head = this._components["head"] = $(this._).children(".tui-grid-head")[0];
                var content = this._components["content"] = $(this._).children(".tui-content")[0];
                this._hbar = tui.create("scrollbar", { direction: "horizontal" });
                this._components["hScroll"] = this._hbar.appendTo(this._, false)._;
                this._vbar = tui.create("scrollbar");
                this._components["vScroll"] = this._vbar.appendTo(this._, false)._;
                //this._lineHeight = Grid.LINE_HEIGHT;
                if (document.createStyleSheet) {
                    this._gridStyle = document.createStyleSheet();
                }
                else {
                    this._gridStyle = document.createElement("style");
                    document.head.appendChild(this._gridStyle);
                }
                this._buffer = { begin: 0, end: 0, lines: [] };
                this.setInit("header", true);
                this.on("resize", function () {
                    _this.render();
                });
                this._vbar.on("scroll", function () {
                    _this.drawContent();
                });
                this._hbar.on("scroll", function () {
                    //this.drawContent();
                    _this.computeHOffset();
                });
                var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                $(this._).on(mousewheelevt, function (ev) {
                    if (_this.get("autoHeight"))
                        return;
                    var e = ev.originalEvent;
                    var delta = e.detail ? e.detail * (-1) : e.wheelDelta;
                    var step = _this.get("lineHeight");
                    //delta returns +120 when wheel is scrolled up, -120 when scrolled down
                    var scrollSize = step > 1 ? step : 1;
                    if (delta <= 0) {
                        // console.log(this._vbar.get("value") + " : " + this._vbar.get("totle"));
                        if (_this._vbar.get("value") < _this._vbar.get("total")) {
                            ev.stopPropagation();
                            ev.preventDefault();
                            _this._vbar.set("value", _this._vbar.get("value") + scrollSize);
                            _this.drawContent();
                        }
                        else if (_this.get("noMouseWheel")) {
                            ev.stopPropagation();
                            ev.preventDefault();
                        }
                    }
                    else {
                        if (_this._vbar.get("value") > 0) {
                            ev.stopPropagation();
                            ev.preventDefault();
                            _this._vbar.set("value", _this._vbar.get("value") - scrollSize);
                            _this.drawContent();
                        }
                        else if (_this.get("noMouseWheel")) {
                            ev.stopPropagation();
                            ev.preventDefault();
                        }
                    }
                });
                var scrollX = function (distance) {
                    var oldValue = _this._hbar.get("value");
                    _this._hbar.set("value", oldValue - distance);
                    _this.drawContent();
                    _this.computeHOffset();
                    if (_this._hbar.get("value") !== oldValue && Math.abs(lastSpeed) > 0.02) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };
                var scrollY = function (distance) {
                    var oldValue = _this._vbar.get("value");
                    _this._vbar.set("value", oldValue - distance);
                    _this.drawContent();
                    if (_this._vbar.get("value") !== oldValue && Math.abs(lastSpeed) > 0.02) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };
                var inTouched = false;
                var lastSpeed = 0;
                var lastPos;
                var lastTime;
                var direction = null;
                $(this._).on("touchstart", function (ev) {
                    if (inTouched)
                        return;
                    var obj = (ev.target || ev.srcElement);
                    if ($(obj).hasClass("tui-grid-handler")) {
                        return;
                    }
                    direction = null;
                    inTouched = true;
                    lastSpeed = 0;
                    var e = ev.originalEvent;
                    if (e.targetTouches.length != 1)
                        return;
                    var touch = e.targetTouches[0];
                    lastPos = { x: touch.pageX, y: touch.pageY };
                    lastTime = new Date().getMilliseconds();
                });
                $(this._).on("touchmove", function (ev) {
                    clearTimeout(hittestTimer);
                    if (!inTouched)
                        return;
                    var e = ev.originalEvent;
                    var touch = e.targetTouches[0];
                    var movePos = { x: touch.pageX, y: touch.pageY };
                    var moveX = movePos.x - lastPos.x;
                    var moveY = movePos.y - lastPos.y;
                    var currentTime = new Date().getMilliseconds();
                    var spanTime = currentTime - lastTime;
                    if (spanTime <= 0)
                        return;
                    lastPos = movePos;
                    lastTime = currentTime;
                    if (direction == null) {
                        if (Math.abs(moveX) > 0 && Math.abs(moveY) > 0)
                            direction = Math.abs(moveX) > Math.abs(moveY) ? "x" : "y";
                        else if (Math.abs(moveX) > 0)
                            direction = "x";
                        else if (Math.abs(moveY) > 0)
                            direction = "y";
                    }
                    if (direction === "x") {
                        lastSpeed = moveX / spanTime;
                        if (scrollX(moveX)) {
                            ev.stopPropagation();
                            ev.preventDefault();
                        }
                    }
                    else if (direction === "y") {
                        lastSpeed = moveY / spanTime;
                        if (scrollY(moveY)) {
                            ev.stopPropagation();
                            ev.preventDefault();
                        }
                    }
                });
                $(this._).on("touchend", function (ev) {
                    clearTimeout(hittestTimer);
                    requestAnimationFrame(function keepMove(timestamp) {
                        if (Math.abs(lastSpeed) > 0.1) {
                            if (direction === "x") {
                                if (scrollX(lastSpeed * 20)) {
                                    lastSpeed *= 0.95;
                                    requestAnimationFrame(keepMove);
                                }
                            }
                            else if (direction === "y") {
                                if (scrollY(lastSpeed * 20)) {
                                    lastSpeed *= 0.95;
                                    requestAnimationFrame(keepMove);
                                }
                            }
                            else {
                                lastSpeed = 0;
                            }
                        }
                    });
                    inTouched = false;
                    lastTime = null;
                });
                $(this._).on("mousedown touchstart", function (ev) {
                    var obj = (ev.target || ev.srcElement);
                    if ($(obj).hasClass("tui-grid-handler")) {
                        ev.stopPropagation();
                        ev.preventDefault();
                        var idx = _this._handlers.indexOf(obj);
                        var columns = _this.get("columns");
                        var l = obj.offsetLeft;
                        var positions = tui.browser.getEventPosition(ev);
                        var srcX = positions[0].x;
                        obj.style.height = _this._.clientHeight + "px";
                        $(obj).addClass("tui-handler-move");
                        var mask = widget.openDragMask(function (e) {
                            var positions = tui.browser.getEventPosition(e);
                            obj.style.left = l + positions[0].x - srcX + "px";
                        }, function (e) {
                            var positions = tui.browser.getEventPosition(e);
                            obj.style.height = "";
                            $(obj).removeClass("tui-handler-move");
                            columns[idx].width = columns[idx].width + positions[0].x - srcX;
                            _this._columnWidths = [];
                            _this.initColumnWidth();
                            _this.computeScroll();
                            _this.computeColumnWidth();
                            _this.drawHeader();
                            _this.computeHOffset();
                        });
                        mask.style.cursor = "col-resize";
                    }
                });
                var hittest = function (obj) {
                    var line = null;
                    var col = null;
                    var srcObj = obj;
                    while (obj) {
                        var parent = obj.parentNode;
                        if (parent && $(parent).hasClass("tui-grid-line")) {
                            line = _this._buffer.begin + _this._buffer.lines.indexOf(parent);
                            if (_this.get("selectable") === true) {
                                col = obj.col;
                                _this._set("activeRow", line);
                                _this._set("activeColumn", col);
                            }
                            break;
                        }
                        obj = parent;
                    }
                    return { line: line, col: col };
                };
                var hittestTimer = null;
                var testLine = function (ev) {
                    var obj = (ev.target || ev.srcElement);
                    var target = hittest(obj);
                    if (target.line === null)
                        return;
                    var data = _this.get("data");
                    if ($(obj).hasClass("tui-arrow-expand")) {
                        data.collapse(target.line);
                        _this.render();
                        ev.preventDefault();
                        _this.fire("collapse", { e: ev, line: target.line });
                    }
                    else if ($(obj).hasClass("tui-arrow-collapse")) {
                        data.expand(target.line);
                        _this.render();
                        ev.preventDefault();
                        _this.fire("expand", { e: ev, line: target.line });
                    }
                    else if ($(obj).hasClass("tui-grid-check")) {
                        var column = _this.get("columns")[target.col];
                        var checkKey = column.checkKey ? column.checkKey : "checked";
                        var checked;
                        if (_this.get("dataType") === "tree") {
                            checked = data.get(target.line).item[checkKey] = !data.get(target.line).item[checkKey];
                        }
                        else {
                            checked = data.get(target.line)[checkKey] = !data.get(target.line)[checkKey];
                        }
                        _this.drawLine(_this._buffer.lines[target.line - _this._buffer.begin], target.line, _this.get("lineHeight"), _this.get("columns"), data.get(target.line));
                        ev.preventDefault();
                        _this.fire("rowcheck", { e: ev, row: target.line, col: target.col, checked: checked });
                    }
                    else {
                        _this.fire("rowmousedown", { e: ev, row: target.line, col: target.col });
                    }
                };
                $(this._).on("mousedown", function (ev) {
                    testLine(ev);
                });
                $(this._).on("mouseup", function (ev) {
                    var obj = (ev.target || ev.srcElement);
                    var target = hittest(obj);
                    if (target.line != null)
                        _this.fire("rowmouseup", { e: ev, row: target.line, col: target.col });
                });
                $(content).click(function (ev) {
                    var obj = (ev.target || ev.srcElement);
                    if ($(obj).hasClass("tui-arrow-expand")) {
                        return;
                    }
                    else if ($(obj).hasClass("tui-arrow-collapse")) {
                        return;
                    }
                    else if ($(obj).hasClass("tui-grid-check")) {
                        return;
                    }
                    var target = hittest(obj);
                    if (target.line != null)
                        _this.fire("rowclick", { e: ev, row: target.line, col: target.col });
                });
                $(content).dblclick(function (ev) {
                    var obj = (ev.target || ev.srcElement);
                    if ($(obj).hasClass("tui-arrow-expand")) {
                        return;
                    }
                    else if ($(obj).hasClass("tui-arrow-collapse")) {
                        return;
                    }
                    else if ($(obj).hasClass("tui-grid-check")) {
                        return;
                    }
                    var target = hittest(obj);
                    if (target.line != null)
                        _this.fire("rowdblclick", { e: ev, row: target.line, col: target.col });
                });
                $(this._).keyup(function (e) {
                    var activeRow = _this.get("activeRow");
                    _this.fire("keyup", { e: e, row: activeRow });
                });
                $(this._).keydown(function (e) {
                    var k = e.keyCode;
                    var activeRow = _this.get("activeRow");
                    _this.fire("keydown", { e: e, row: activeRow });
                    if (k >= 33 && k <= 40 || k == tui.browser.KeyCode.ENTER) {
                        if (k === tui.browser.KeyCode.LEFT) {
                            if (_this.get("dataType") === "tree") {
                                if (activeRow !== null) {
                                    var node = _this.get("data").get(activeRow);
                                    if (node.hasChild && node.expand) {
                                        _this.get("data").collapse(activeRow);
                                        _this.render();
                                        _this.fire("collapse", { e: e, line: activeRow });
                                        return;
                                    }
                                }
                            }
                            if (!_this.get("autoWidth")) {
                                _this._hbar.set("value", _this._hbar.get("value") - 30);
                                _this.computeHOffset();
                            }
                        }
                        else if (k === tui.browser.KeyCode.UP) {
                            if (!_this.get("selectable")) {
                                var t = _this.get("scrollTop");
                                _this._vbar.set("value", t - 10);
                                _this.drawContent();
                            }
                            else {
                                if (_this.get("activeRow") === null) {
                                    _this._set("activeRow", 0);
                                }
                                else {
                                    _this._set("activeRow", _this.get("activeRow") - 1);
                                }
                                _this.scrollTo(_this.get("activeRow"));
                                _this.fire("keyselect", { e: e, row: _this.get("activeRow") });
                            }
                        }
                        else if (k === tui.browser.KeyCode.RIGHT) {
                            if (_this.get("dataType") === "tree") {
                                if (activeRow !== null) {
                                    var node = _this.get("data").get(activeRow);
                                    if (node.hasChild && !node.expand) {
                                        _this.get("data").expand(activeRow);
                                        _this.render();
                                        _this.fire("collapse", { e: e, line: activeRow });
                                        return;
                                    }
                                }
                            }
                            if (!_this.get("autoWidth")) {
                                _this._hbar.set("value", _this._hbar.get("value") + 30);
                                _this.computeHOffset();
                            }
                        }
                        else if (k === tui.browser.KeyCode.DOWN) {
                            if (!_this.get("selectable")) {
                                var t = _this.get("scrollTop");
                                _this._vbar.set("value", t + 10);
                                _this.drawContent();
                            }
                            else {
                                if (_this.get("activeRow") === null) {
                                    _this._set("activeRow", 0);
                                }
                                else {
                                    _this._set("activeRow", _this.get("activeRow") + 1);
                                }
                                _this.scrollTo(_this.get("activeRow"));
                                _this.fire("keyselect", { e: e, row: _this.get("activeRow") });
                            }
                        }
                        else if (k === tui.browser.KeyCode.PRIOR) {
                            if (!_this.get("selectable")) {
                                var t = _this.get("scrollTop");
                                _this._vbar.set("value", t - _this._vbar.get("page"));
                                _this.drawContent();
                            }
                            else {
                                if (_this.get("activeRow") === null) {
                                    _this._set("activeRow", 0);
                                }
                                else {
                                    _this._set("activeRow", _this.get("activeRow") - _this._dispLines + 1);
                                }
                                _this.scrollTo(_this.get("activeRow"));
                                _this.fire("keyselect", { e: e, row: _this.get("activeRow") });
                            }
                        }
                        else if (k === tui.browser.KeyCode.NEXT) {
                            if (!_this.get("selectable")) {
                                var t = _this.get("scrollTop");
                                _this._vbar.set("value", t + _this._vbar.get("page"));
                                _this.drawContent();
                            }
                            else {
                                if (_this.get("activeRow") === null) {
                                    _this._set("activeRow", 0);
                                }
                                else {
                                    _this._set("activeRow", _this.get("activeRow") + _this._dispLines - 1);
                                }
                                _this.scrollTo(_this.get("activeRow"));
                                _this.fire("keyselect", { e: e, row: _this.get("activeRow") });
                            }
                        }
                        else if (k === tui.browser.KeyCode.HOME) {
                            if (!_this.get("selectable")) {
                                _this._vbar.set("value", 0);
                                _this.drawContent();
                            }
                            else {
                                _this._set("activeRow", 0);
                                _this.scrollTo(_this.get("activeRow"));
                                _this.fire("keyselect", { e: e, row: _this.get("activeRow") });
                            }
                        }
                        else if (k === tui.browser.KeyCode.END) {
                            if (!_this.get("selectable")) {
                                _this._vbar.set("value", _this._vbar.get("total"));
                                _this.drawContent();
                            }
                            else {
                                var data = _this.get("data");
                                _this._set("activeRow", data.length() - 1);
                                _this.scrollTo(_this.get("activeRow"));
                                _this.fire("keyselect", { e: e, row: _this.get("activeRow") });
                            }
                        }
                        else if (k === tui.browser.KeyCode.ENTER) {
                            if (_this.get("selectable")) {
                                if (_this.get("activeRow") != null) {
                                    _this.fire("rowclick", { e: e, row: _this.get("activeRow"), col: _this.get("activeColumn") });
                                }
                            }
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                $(head).click(function (ev) {
                    var obj = (ev.target || ev.srcElement);
                    var columns = _this.get("columns");
                    while (obj) {
                        if (obj.parentNode === head) {
                            var col = obj.col;
                            if (columns[col].sortable) {
                                var sortType = "asc";
                                if (_this.get("sortColumn") == col) {
                                    if (_this.get("sortType") === "asc")
                                        sortType = "desc";
                                    else {
                                        sortType = null;
                                        col = null;
                                    }
                                }
                                if (_this.fire("sort", { e: ev, column: col === null ? null : columns[col], type: sortType }))
                                    _this.setSortFlag(col, sortType);
                                _this.drawHeader();
                            }
                            return;
                        }
                        else
                            obj = obj.parentNode;
                    }
                });
            };
            Grid.prototype.setSortFlag = function (col, type) {
                this._set("sortColumn", col);
                this._set("sortType", type);
                var columns = this.get("columns");
                var column = columns[col];
                var ds = this.get("data");
                if (col === null || type === null)
                    ds.setOrder(null);
                else {
                    ds.setOrder([
                        {
                            key: column.key,
                            desc: (type === "desc")
                        }
                    ]);
                }
            };
            Grid.prototype.scrollTo = function (index) {
                if (typeof index !== "number" || isNaN(index) || index < 0 || index >= this.get("data").length())
                    return;
                var v = this._vbar.get("value");
                var lineHeight = this.get("lineHeight");
                if (v > index * lineHeight) {
                    this._vbar.set("value", index * lineHeight);
                    this.drawContent();
                }
                else {
                    var h = (index - this._dispLines + 1) * lineHeight;
                    var diff = (this._.clientHeight - this.getComponent("head").offsetHeight
                        - this._hbar._.offsetHeight - this._dispLines * lineHeight);
                    if (v < h - diff) {
                        this._vbar.set("value", h - diff);
                        this.drawContent();
                    }
                }
            };
            Grid.prototype.iterate = function (func) {
                var data = this.get("data");
                var dataType = this.get("dataType");
                function iterateItem(treeItem, path) {
                    if (func(treeItem, path, true) === false)
                        return false;
                    var children = treeItem[childrenKey];
                    if (children) {
                        for (var i = 0; i < children.length; i++) {
                            if (iterateItem(children[i], path.concat(i)) === false)
                                return false;
                        }
                    }
                }
                if (dataType === "tree" && data._finalData == null) {
                    var tree = data;
                    var childrenKey = tree.getConfig().children;
                    var rawData = tree.getRawData();
                    if (!rawData)
                        return;
                    for (var i = 0; i < rawData.length; i++) {
                        if (iterateItem(rawData[i], [i]) === false)
                            break;
                    }
                }
                else {
                    var list = data;
                    for (var i = 0; i < list.length(); i++) {
                        var listItem = dataType === "tree" ? list.get(i).item : list.get(i);
                        if (func(listItem, [i], dataType === "tree") === false)
                            break;
                    }
                }
            };
            /**
             * Search a row by condition, get field value by 'dataKey' and compare to value, if match then active it.
             * Should only used in local data type, e.g. List or Tree, if used in RemoteList or RemoteTree may not work correctly.
             */
            Grid.prototype.activeTo = function (dataKey, value) {
                var data = this.get("data");
                var dataType = this.get("dataType");
                var path = [];
                var childrenKey;
                // If is a subset return 1, if equals return 2, otherwise return 0
                function matchPath(p1, p2) {
                    for (var i = 0; i < p1.length; i++) {
                        if (i >= p2.length)
                            return 0;
                        else if (p1[i] !== p2[i])
                            return 0;
                    }
                    return p1.length === p2.length ? 2 : 1;
                }
                if (dataType === "tree" && data._finalData == null) {
                    var tree = data;
                    this.iterate(function (item, p, treeNode) {
                        if (item[dataKey] === value) {
                            path = p;
                            return false;
                        }
                    });
                    if (path && path.length > 0) {
                        var searchPath = [];
                        var searchLevel = -1;
                        var found = false;
                        for (var i = 0; i < tree.length(); i++) {
                            var node = tree.get(i);
                            if (node.level === searchLevel) {
                                searchPath[searchLevel]++;
                            }
                            else if (node.level < searchLevel) {
                                for (var j = node.level; j < searchLevel; j++)
                                    searchPath.pop();
                                searchLevel = node.level;
                                searchPath[searchLevel]++;
                            }
                            else {
                                searchPath.push(0);
                                searchLevel++;
                            }
                            var state = matchPath(searchPath, path);
                            if (state === 2) {
                                found = true;
                                break;
                            }
                            else if (state === 1) {
                                tree.expand(i);
                            }
                        }
                        if (found) {
                            this._set("activeRow", i);
                            this.computeScroll();
                            this.scrollTo(i);
                        }
                    }
                }
                else if (dataType === "tree" && data._finalData) {
                    var list = data;
                    for (var i_1 = 0; i_1 < list.length(); i_1++) {
                        if (list.get(i_1).item[dataKey] === value) {
                            this._set("activeRow", i_1);
                            this.scrollTo(i_1);
                            break;
                        }
                    }
                }
                else {
                    var list = data;
                    for (var i_2 = 0; i_2 < list.length(); i_2++) {
                        if (list.get(i_2)[dataKey] === value) {
                            this._set("activeRow", i_2);
                            this.scrollTo(i_2);
                            break;
                        }
                    }
                }
            };
            Grid.prototype.computeWidth = function () {
                if (this.get("autoWidth")) {
                    return this._.clientWidth;
                }
                else {
                    var contentWidth = 0;
                    for (var i = 0; i < this._columnWidths.length; i++) {
                        contentWidth += this._columnWidths[i] + Grid.CELL_SPACE * 2;
                    }
                    return contentWidth;
                }
            };
            Grid.prototype.computeScroll = function () {
                var _this = this;
                var vScroll = this._vbar;
                $(vScroll._).addClass("tui-hidden");
                var vEnable = false;
                var hScroll = this._hbar;
                $(hScroll._).addClass("tui-hidden");
                var hEnable = false;
                var clientWidth = this._.clientWidth;
                var clientHeight = this._.clientHeight;
                var data = this.get("data");
                var lineHeight = this.get("lineHeight");
                this._contentHeight = (data.length() + (this.get("header") ? 1 : 0)) * lineHeight;
                this._contentWidth = this.computeWidth();
                var head = this._components["head"];
                var content = this._components["content"];
                var computeV = function (first) {
                    var realClientHeight = clientHeight - (hEnable ? hScroll._.offsetHeight : 0);
                    var shouldEnable = (_this.get("autoHeight") ? false : _this._contentHeight > realClientHeight);
                    if (shouldEnable) {
                        $(vScroll._).removeClass("tui-hidden");
                        vScroll._.style.height = realClientHeight + "px";
                        vScroll._set("total", _this._contentHeight - realClientHeight);
                        if (_this._contentHeight > 0) {
                            vScroll.set("page", realClientHeight / _this._contentHeight * (_this._contentHeight - realClientHeight));
                        }
                        else
                            vScroll.set("page", 1);
                    }
                    else if (_this.get("autoHeight")) {
                        vScroll._set("value", 0);
                        vScroll._set("total", 0);
                        content.style.height = _this._contentHeight + "px";
                        if (hEnable) {
                            _this._.style.height = _this._contentHeight + hScroll._.offsetHeight + "px";
                        }
                        else {
                            _this._.style.height = _this._contentHeight + "px";
                        }
                        clientHeight = _this._.clientHeight;
                    }
                    else {
                        vScroll._set("value", 0);
                        vScroll._set("total", 0);
                    }
                    if (vEnable !== shouldEnable) {
                        vEnable = shouldEnable;
                        if (!first)
                            computeH();
                    }
                };
                var computeH = function () {
                    var realClientWidth = clientWidth - (vEnable ? vScroll._.offsetWidth : 0);
                    var shouldEnable = (_this.get("autoWidth") ? false : _this._contentWidth > realClientWidth);
                    if (shouldEnable) {
                        $(hScroll._).removeClass("tui-hidden");
                        hScroll._.style.width = realClientWidth + "px";
                        hScroll._set("total", _this._contentWidth - realClientWidth);
                        if (_this._contentWidth > 0)
                            hScroll.set("page", realClientWidth / _this._contentWidth * (_this._contentWidth - realClientWidth));
                        else
                            hScroll.set("page", 1);
                    }
                    else {
                        hScroll._set("total", 0);
                        hScroll.set("value", 0);
                    }
                    if (hEnable !== shouldEnable) {
                        hEnable = shouldEnable;
                        computeV(false);
                    }
                };
                computeV(true);
                computeH();
                if (this.get("header")) {
                    head.style.display = "block";
                    var width = (vEnable ? clientWidth - vScroll._.offsetWidth : clientWidth);
                    width = (width >= 0 ? width : 0);
                    head.style.width = width + "px";
                }
                else {
                    head.style.display = "none";
                }
                var width = (vEnable ? clientWidth - vScroll._.offsetWidth : clientWidth);
                width = (width >= 0 ? width : 0);
                content.style.width = width + "px";
                var dispHeight = (hEnable ? clientHeight - hScroll._.offsetHeight : clientHeight);
                dispHeight = (dispHeight >= 0 ? dispHeight : 0);
                content.style.height = dispHeight + "px";
                this._dispLines = Math.ceil((dispHeight - (this.get("header") ? lineHeight : 0)) / lineHeight);
            };
            Grid.prototype.drawLine = function (line, index, lineHeight, columns, lineData) {
                var isTree = this.get("dataType") === "tree";
                var item = isTree ? lineData.item : lineData;
                var tipKey = this.get("rowTooltipKey");
                if (item[tipKey]) {
                    line.setAttribute("tooltip", item[tipKey]);
                }
                line.style.height = lineHeight + "px";
                line.style.lineHeight = lineHeight + "px";
                if (line.childNodes.length != columns.length) {
                    line.innerHTML = "";
                    for (var i = 0; i < columns.length; i++) {
                        var span = document.createElement("span");
                        span.className = "tui-grid-" + this._tuid + "-" + i;
                        span.setAttribute("unselectable", "on");
                        span.col = i;
                        line.appendChild(span);
                    }
                }
                for (var i = 0; i < columns.length; i++) {
                    var col = columns[i];
                    var prefix = "";
                    if (col.arrow === true && isTree) {
                        for (var j = 0; j < lineData.level; j++) {
                            prefix += "<i class='tui-space'></i>";
                        }
                        if (lineData.hasChild) {
                            if (lineData.expand)
                                prefix += "<i class='tui-arrow-expand'></i>";
                            else
                                prefix += "<i class='tui-arrow-collapse'></i>";
                        }
                        else {
                            prefix += "<i class='tui-arrow'></i>";
                        }
                    }
                    if (col.type === "check") {
                        var k = (col.checkKey ? col.checkKey : "checked");
                        if (item[k] === true)
                            prefix += "<i class='fa fa-check-square tui-grid-check'></i>";
                        else if (item[k] === false)
                            prefix += "<i class='fa fa-square-o tui-grid-check'></i>";
                        else
                            prefix += "<i class='tui-grid-no-check'></i>";
                    }
                    else if (col.type === "tristate") {
                        var k = (col.checkKey ? col.checkKey : "checked");
                        if (item[k] === true)
                            prefix += "<i class='fa-check-square tui-grid-check'></i>";
                        else if (item[k] === false)
                            prefix += "<i class='fa-square-o tui-grid-check'></i>";
                        else if (item[k] === "tristate")
                            prefix += "<i class='fa-check-square tui-grid-check'></i>";
                        else
                            prefix += "<i class='tui-grid-no-check'></i>";
                    }
                    else if (col.type === "select") {
                        prefix += "<i class='fa fa-caret-down tui-grid-select'></i>";
                    }
                    else if (col.type === "edit") {
                        prefix += "<i class='fa fa-edit tui-grid-edit'></i>";
                    }
                    if (col.iconKey && item[col.iconKey]) {
                        prefix += "<i class='fa " + item[col.iconKey] + " tui-grid-icon'></i>";
                    }
                    var cell = line.childNodes[i];
                    cell.style.height = lineHeight + "px";
                    cell.style.lineHeight = lineHeight + "px";
                    tui.browser.setInnerHtml(cell, prefix);
                    var prefixContent = columns[i].prefixKey !== null ? item[columns[i].prefixKey] : null;
                    if (prefixContent) {
                        var prefixSpan = document.createElement("span");
                        tui.browser.setInnerHtml(prefixSpan, prefixContent);
                        cell.appendChild(prefixSpan);
                    }
                    cell.appendChild(document.createTextNode(item[columns[i].key]));
                    var suffixContent = columns[i].suffixKey !== null ? item[columns[i].suffixKey] : null;
                    if (suffixContent) {
                        var suffixSpan = document.createElement("span");
                        tui.browser.setInnerHtml(suffixSpan, suffixContent);
                        cell.appendChild(suffixSpan);
                    }
                }
            };
            Grid.prototype.moveLine = function (line, index, base, lineHeight) {
                line.style.top = (base + index * lineHeight) + "px";
                line.style.width = this._contentWidth + "px";
            };
            Grid.prototype.createLine = function (parent) {
                var columns = this.get("columns");
                var line = document.createElement("div");
                line.className = "tui-grid-line";
                line.setAttribute("unselectable", "on");
                return parent.appendChild(line);
            };
            Grid.prototype.clearBuffer = function () {
                if (!this._buffer) {
                    return;
                }
                var content = this._components["content"];
                for (var i = 0; i < this._buffer.lines.length; i++) {
                    content.removeChild(this._buffer.lines[i]);
                }
                this._buffer.begin = 0;
                this._buffer.end = 0;
                this._buffer.lines = [];
            };
            Grid.prototype.drawHeader = function () {
                if (!this.get("header"))
                    return;
                var head = this._components["head"];
                head.innerHTML = "";
                var columns = this.get("columns");
                for (var i = 0; i < columns.length; i++) {
                    var prefix = "<i class='tui-grid-no-sort'></i>";
                    if (columns[i].sortable && this.get("sortColumn") == i) {
                        if (this.get("sortType") === "desc") {
                            prefix = "<i class='tui-grid-desc'></i>";
                        }
                        else {
                            prefix = "<i class='tui-grid-asc'></i>";
                        }
                    }
                    var sortClass = "";
                    if (columns[i].sortable)
                        sortClass = "tui-sortable";
                    var span = document.createElement("span");
                    span.setAttribute("unselectable", "on");
                    span.className = "tui-grid-" + this._tuid + "-" + i + " " + sortClass;
                    span.col = i;
                    head.appendChild(span);
                    tui.browser.setInnerHtml(span, prefix);
                    span.appendChild(document.createTextNode(columns[i].name));
                }
            };
            Grid.prototype.drawContent = function () {
                var _this = this;
                var vbar = widget.get(this._components["vScroll"]);
                var content = this._components["content"];
                var lineHeight = this.get("lineHeight");
                var base = (this.get("header") ? lineHeight : 0) - vbar.get("value") % lineHeight;
                var begin = Math.floor(vbar.get("value") / lineHeight);
                var end = begin + this._dispLines + 1;
                var data = this.get("data");
                var columns = this.get("columns");
                var length = data.length();
                var newBuffer = [];
                var reusable = [];
                for (var i = this._buffer.begin; i < this._buffer.end; i++) {
                    if (i < begin || i >= end || i >= length) {
                        reusable.push(this._buffer.lines[i - this._buffer.begin]);
                    }
                }
                for (var i = begin; i < end && i < length; i++) {
                    var line;
                    if (i >= this._buffer.begin && i < this._buffer.end) {
                        line = this._buffer.lines[i - this._buffer.begin];
                    }
                    else {
                        if (reusable.length > 0) {
                            line = reusable.pop();
                            line.innerHTML = "";
                            line.removeAttribute("tooltip");
                        }
                        else {
                            line = this.createLine(content);
                        }
                        if (i === this.get("activeRow")) {
                            $(line).addClass("tui-actived");
                        }
                        else {
                            $(line).removeClass("tui-actived");
                        }
                    }
                    this.moveLine(line, i - begin, base, lineHeight);
                    newBuffer.push(line);
                }
                clearTimeout(this._drawTimer);
                this._drawTimer = setTimeout(function () {
                    var begin = Math.floor(vbar.get("value") / lineHeight);
                    var end = begin + _this._dispLines + 1;
                    for (var i = _this._buffer.begin; i < _this._buffer.end; i++) {
                        if (i >= begin && i < end)
                            _this.drawLine(_this._buffer.lines[i - _this._buffer.begin], i, _this.get("lineHeight"), columns, data.get(i));
                    }
                }, 32);
                for (var i = 0; i < reusable.length; i++) {
                    content.removeChild(reusable[i]);
                }
                this._buffer.lines = newBuffer;
                this._buffer.begin = begin;
                this._buffer.end = this._buffer.begin + this._buffer.lines.length;
            };
            Grid.prototype.initColumnWidth = function () {
                var columns = this.get("columns");
                for (var i = 0; i < columns.length; i++) {
                    if (typeof this._columnWidths[i] !== "number" || isNaN(this._columnWidths[i])) {
                        if (typeof columns[i].width === "number" && !isNaN(columns[i].width))
                            this._columnWidths[i] = columns[i].width;
                        else
                            this._columnWidths[i] = 150;
                    }
                    if (this._columnWidths[i] < 0)
                        this._columnWidths[i] = 0;
                }
            };
            Grid.prototype.computeHOffset = function () {
                //var widths: number[] = [];
                var head = this._components["head"];
                var content = this._components["content"];
                var scrollLeft = this._hbar.get("value");
                var columns = this.get("columns");
                head.scrollLeft = scrollLeft;
                content.scrollLeft = scrollLeft;
                var used = 0;
                for (var i = 0; i < columns.length; i++) {
                    this._vLines[i].style.left = used + vval(columns[i].width) +
                        (Grid.CELL_SPACE * 2) - scrollLeft + "px";
                    used += vval(columns[i].width) + (Grid.CELL_SPACE * 2);
                }
                if (this.get("header")) {
                    used = 0;
                    for (var i = 0; i < columns.length; i++) {
                        this._handlers[i].style.left = used + vval(columns[i].width) +
                            (Grid.CELL_SPACE) - this._hbar.get("value") + "px";
                        used += vval(columns[i].width) + (Grid.CELL_SPACE * 2);
                    }
                }
            };
            Grid.prototype.computeColumnWidth = function () {
                //var widths: number[] = [];
                var columns = this.get("columns");
                if (this.get("autoWidth")) {
                    var total = this._contentWidth;
                    var totalNoBorder = total - (Grid.CELL_SPACE * 2) * columns.length;
                    var totalNoFixed = totalNoBorder;
                    var totalCompute = 0;
                    // Exclude all fixed columns
                    for (var i = 0; i < columns.length; i++) {
                        if (columns[i].fixed) {
                            totalNoFixed -= this._columnWidths[i];
                        }
                        else {
                            totalCompute += this._columnWidths[i];
                        }
                    }
                    for (var i = 0; i < columns.length; i++) {
                        if (!columns[i].fixed) {
                            if (totalCompute <= 0)
                                this._columnWidths[i] = NaN;
                            else
                                this._columnWidths[i] = (this._columnWidths[i] * 1.0) / totalCompute * totalNoFixed;
                        }
                    }
                }
                for (var i = 0; i < this._columnWidths.length; i++) {
                    var val = Math.round(this._columnWidths[i]);
                    //widths.push(val);
                    columns[i].width = val;
                }
                // Add V lines
                for (var i = 0; i < this._vLines.length; i++) {
                    if (this._vLines[i].parentNode)
                        this._.removeChild(this._vLines[i]);
                }
                var used = 0;
                for (var i = 0; i < columns.length; i++) {
                    if (i >= this._vLines.length) {
                        this._vLines[i] = document.createElement("div");
                        this._vLines[i].className = "tui-grid-vline";
                    }
                    this._vLines[i].style.left = used + vval(columns[i].width) + (Grid.CELL_SPACE * 2) - this._hbar.get("value") + "px";
                    used += vval(columns[i].width) + (Grid.CELL_SPACE * 2);
                    this._vLines[i].style.height = Math.min(this._contentHeight, this._.clientHeight) + "px";
                    this._.appendChild(this._vLines[i]);
                }
                // Add Handlers
                for (var i = 0; i < this._handlers.length; i++) {
                    if (this._handlers[i].parentNode)
                        this._.removeChild(this._handlers[i]);
                }
                if (this.get("header")) {
                    used = 0;
                    for (var i = 0; i < columns.length; i++) {
                        if (i >= this._handlers.length) {
                            this._handlers[i] = document.createElement("div");
                            this._handlers[i].className = "tui-grid-handler";
                        }
                        this._handlers[i].style.left = used + vval(columns[i].width) + (Grid.CELL_SPACE) - this._hbar.get("value") + "px";
                        used += vval(columns[i].width) + (Grid.CELL_SPACE * 2);
                        this._.appendChild(this._handlers[i]);
                    }
                }
                var cssText = "";
                for (var i_3 = 0; i_3 < columns.length; i_3++) {
                    cssText += (".tui-grid-" + this._tuid + "-" + i_3 + "{width:" + vval(columns[i_3].width) + "px;}");
                }
                if (document.createStyleSheet)
                    this._gridStyle.cssText = cssText;
                else
                    this._gridStyle.innerHTML = cssText;
                for (var i_4 = 0; i_4 < this._buffer.lines.length; i_4++) {
                    var line = this._buffer.lines[i_4];
                    line.style.width = this._contentWidth + "px";
                }
            };
            Grid.prototype.render = function () {
                this.initColumnWidth();
                this.computeScroll();
                this.computeColumnWidth();
                this.drawHeader();
                this.drawContent();
                this.computeHOffset();
            };
            Grid.CELL_SPACE = 4;
            Grid.LINE_HEIGHT = 31;
            return Grid;
        }(widget.Widget));
        widget.Grid = Grid;
        widget.register(Grid);
        widget.registerResize(Grid);
        /**
         * <tui:list>
         */
        var List = (function (_super) {
            __extends(List, _super);
            function List() {
                _super.apply(this, arguments);
            }
            List.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                this._column = {
                    name: "",
                    key: "name",
                    checkKey: "check",
                    iconKey: "icon",
                    prefixKey: "prefix",
                    suffixKey: "suffix",
                    arrow: true
                };
                this.setRestrictions({
                    "lineHeight": {
                        "get": function () {
                            var val = _this._data["lineHeight"];
                            if (typeof val !== "number" || isNaN(val))
                                return List.LINE_HEIGHT;
                            else
                                return val;
                        }
                    },
                    "columns": {
                        "set": function (value) { },
                        "get": function () {
                            return [_this._column];
                        }
                    },
                    "checkKey": {
                        "set": function (value) {
                            _this._column.checkKey = value;
                            _this.clearBuffer();
                        },
                        "get": function () {
                            return _this._column.checkKey;
                        }
                    },
                    "nameKey": {
                        "set": function (value) {
                            _this._column.key = value;
                            _this.clearBuffer();
                        },
                        "get": function () {
                            return _this._column.key;
                        }
                    },
                    "iconKey": {
                        "set": function (value) {
                            _this._column.iconKey = value;
                            _this.clearBuffer();
                        },
                        "get": function () {
                            return _this._column.iconKey;
                        }
                    },
                    "prefixKey": {
                        "set": function (value) {
                            _this._column.prefixKey = value;
                            _this.clearBuffer();
                        },
                        "get": function () {
                            return _this._column.prefixKey;
                        }
                    },
                    "suffixKey": {
                        "set": function (value) {
                            _this._column.suffixKey = value;
                            _this.clearBuffer();
                        },
                        "get": function () {
                            return _this._column.suffixKey;
                        }
                    },
                    "checkable": {
                        "set": function (value) {
                            _this._column.type = value ? "check" : null;
                            _this.clearBuffer();
                        },
                        "get": function () {
                            return _this._column.type === "check";
                        }
                    },
                    "checkedValues": {
                        "set": function (value) {
                            var valueKey = _this.get("valueKey");
                            var checkKey = _this.get("checkKey");
                            if (value === null)
                                value = [];
                            if (!(value instanceof Array))
                                value = [value];
                            _this.iterate(function (item, path, treeNode) {
                                if (typeof item[checkKey] === "boolean") {
                                    if (value.indexOf(item[valueKey]) >= 0)
                                        item[checkKey] = true;
                                    else
                                        item[checkKey] = false;
                                }
                                return true;
                            });
                        },
                        "get": function () {
                            var value = [];
                            var valueKey = _this.get("valueKey");
                            var checkKey = _this.get("checkKey");
                            _this.iterate(function (item, path) {
                                if (item[checkKey] === true)
                                    value.push(item[valueKey]);
                                return true;
                            });
                            return value;
                        }
                    },
                    "checkedNames": {
                        "set": function (value) { },
                        "get": function () {
                            var names = [];
                            var nameKey = _this.get("nameKey");
                            var checkKey = _this.get("checkKey");
                            _this.iterate(function (item, path) {
                                if (item[checkKey] === true)
                                    names.push(item[nameKey]);
                                return true;
                            });
                            return names;
                        }
                    }
                });
            };
            List.prototype.init = function () {
                _super.prototype.init.call(this);
                this._set("header", false);
                this.setInit("autoWidth", true);
                this.setInit("valueKey", "value");
            };
            List.prototype.selectAll = function () {
                var checkKey = this.get("checkKey");
                this.iterate(function (item, path) {
                    if (typeof item[checkKey] === "boolean") {
                        item[checkKey] = true;
                    }
                    return true;
                });
                this.render();
            };
            List.prototype.deselectAll = function () {
                var checkKey = this.get("checkKey");
                this.iterate(function (item, path) {
                    if (typeof item[checkKey] === "boolean") {
                        item[checkKey] = false;
                    }
                    return true;
                });
                this.render();
            };
            List.LINE_HEIGHT = 30;
            return List;
        }(Grid));
        widget.List = List;
        widget.register(List);
        widget.registerResize(List);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="inputBase.ts" />
/// <reference path="../browser/keyboard.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        /**
         * <input>
         * Attributes: value, text, type, iconLeft, iconRight, autoValidate
         * Events: input, change, left-icon-mousedown, right-icon-mousedown, left-icon-click, right-icon-click
         */
        var Input = (function (_super) {
            __extends(Input, _super);
            function Input() {
                _super.apply(this, arguments);
            }
            Input.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                var textbox = this._components["textbox"] = document.createElement("input");
                this.setRestrictions({
                    "value": {
                        "set": function (value) {
                            textbox.value = value;
                            _this._isEmpty = (textbox.value === "");
                        },
                        "get": function () {
                            return textbox.value;
                        }
                    },
                    "text": {
                        "set": function (value) {
                            _this._set("value", value);
                        },
                        "get": function () {
                            return _this.get("value");
                        }
                    },
                    "type": {
                        "set": function (value) {
                            value = value.toLowerCase();
                            if (["text", "password", "email", "url", "number"].indexOf(value) < 0)
                                return;
                            textbox.setAttribute("type", value);
                        },
                        "get": function () {
                            return textbox.getAttribute("type");
                        }
                    }
                });
            };
            Input.prototype.onInput = function (textbox, e) {
                this.updateEmptyState(textbox.value === "");
                this.reset();
                this.fire("input", e);
            };
            Input.prototype.init = function () {
                var _this = this;
                var $root = $(this._);
                var placeholder = this._components["placeholder"] = document.createElement("span");
                var textbox = this._components["textbox"];
                var iconLeft = this._components["iconLeft"] = document.createElement("i");
                var iconRight = this._components["iconRight"] = document.createElement("i");
                var iconInvalid = this._components["iconInvalid"] = document.createElement("i");
                var clearButton = this._components["clearButton"] = document.createElement("i");
                iconInvalid.className = "tui-invalid-icon";
                clearButton.className = "tui-input-clear-button";
                placeholder.className = "tui-placeholder";
                placeholder.setAttribute("unselectable", "on");
                this._.appendChild(placeholder);
                this._.appendChild(iconLeft);
                this._.appendChild(textbox);
                this._.appendChild(iconInvalid);
                this._.appendChild(iconRight);
                this._.appendChild(clearButton);
                $(textbox).focus(function () {
                    $root.addClass("tui-active");
                });
                $(textbox).blur(function () {
                    $root.removeClass("tui-active");
                    if (_this.get("disable"))
                        return;
                    if (_this.get("autoValidate")) {
                        _this.validate();
                    }
                });
                if (tui.ieVer > 0 && tui.ieVer < 9) {
                    $(textbox).on("propertychange", function (e) {
                        if (e.originalEvent.propertyName !== 'value')
                            return;
                        _this.onInput(textbox, e);
                    });
                }
                else {
                    if (tui.ieVer === 9) {
                        $(textbox).on("keyup", function (e) {
                            if (e.keyCode = tui.browser.KeyCode.BACK)
                                _this.onInput(textbox, e);
                        });
                    }
                    $(textbox).on("input", function (e) {
                        _this.onInput(textbox, e);
                    });
                }
                $(textbox).on("keydown", function (e) {
                    if (e.keyCode === tui.browser.KeyCode.ENTER) {
                        _this.fire("enter", e);
                    }
                });
                $(textbox).on("change", function (e) {
                    _this.fire("change", e);
                });
                $(clearButton).on("mousedown", function (e) {
                    _this.set("value", "");
                    _this.reset();
                    _this.fire("change", e);
                    e.stopPropagation();
                });
                $root.mousedown(function (e) {
                    if (_this.get("disable"))
                        return;
                    var obj = e.target || e.srcElement;
                    if (obj === textbox) {
                        return;
                    }
                    setTimeout(function () {
                        textbox.focus();
                        if (obj === iconLeft) {
                            _this.fire("left-icon-mousedown", e);
                        }
                        if (obj === iconRight) {
                            _this.fire("right-icon-mousedown", e);
                        }
                    }, 0);
                });
                $root.click(function (e) {
                    if (_this.get("disable"))
                        return;
                    var obj = e.target || e.srcElement;
                    if (obj === textbox) {
                        return;
                    }
                    if (obj === iconLeft) {
                        _this.fire("left-icon-click", e);
                    }
                    if (obj === iconRight) {
                        _this.fire("right-icon-click", e);
                    }
                });
                this.on("resize", function () {
                    _this.render();
                });
            };
            Input.prototype.focus = function () {
                var textbox = this._components["textbox"];
                textbox.focus();
            };
            Input.prototype.render = function () {
                this._.scrollLeft = 0;
                var $root = $(this._);
                var textbox = this._components["textbox"];
                var iconLeft = this._components["iconLeft"];
                var iconRight = this._components["iconRight"];
                var iconInvalid = this._components["iconInvalid"];
                var placeholder = this._components["placeholder"];
                var clearButton = this._components["clearButton"];
                if (this.get("disable")) {
                    $root.addClass("tui-disable");
                    textbox.setAttribute("readonly", "readonly");
                }
                else {
                    $root.removeClass("tui-disable");
                    textbox.removeAttribute("readonly");
                }
                var marginLeft = 0;
                if (this.get("iconLeft")) {
                    iconLeft.className = this.get("iconLeft");
                    iconLeft.style.display = "";
                    iconLeft.style.left = "0";
                }
                else {
                    iconLeft.className = "";
                    iconLeft.style.display = "none";
                    marginLeft = Input.PADDING;
                }
                var marginRight = 0;
                if (this.get("iconRight")) {
                    iconRight.className = this.get("iconRight");
                    iconRight.style.display = "";
                    iconRight.style.right = "0";
                }
                else {
                    iconRight.className = "";
                    iconRight.style.display = "none";
                    marginRight = Input.PADDING;
                }
                if (!this._valid) {
                    $root.addClass("tui-invalid");
                    iconInvalid.style.display = "";
                    iconInvalid.style.right = iconRight.offsetWidth + "px";
                }
                else {
                    $root.removeClass("tui-invalid");
                    iconInvalid.style.display = "none";
                    if (marginRight === 0)
                        marginRight = Input.PADDING;
                }
                if (this.get("clearable") && this.get("value").length > 0) {
                    clearButton.style.display = "";
                    clearButton.style.right = iconRight.offsetWidth + iconInvalid.offsetWidth + "px";
                }
                else {
                    clearButton.style.display = "none";
                }
                textbox.style.left = iconLeft.offsetWidth + marginLeft + "px";
                var width = this._.clientWidth -
                    iconLeft.offsetWidth -
                    iconInvalid.offsetWidth -
                    iconRight.offsetWidth -
                    clearButton.offsetWidth -
                    marginLeft - marginRight;
                if (width < 0)
                    width = 0;
                textbox.style.width = width + "px";
                var phText = this.get("placeholder");
                var showPh = phText && !this.get("value");
                if (showPh) {
                    $(placeholder).text(phText);
                    placeholder.style.left = iconLeft.offsetWidth + marginLeft + "px";
                    placeholder.style.width = textbox.style.width;
                    placeholder.style.display = "";
                }
                else {
                    placeholder.style.display = "none";
                }
                if (!this._valid && this._invalidMessage) {
                    this._set("follow-tooltip", this._invalidMessage);
                }
                else {
                    this._set("follow-tooltip", null);
                }
            };
            Input.PADDING = 6;
            return Input;
        }(widget.InputBase));
        widget.Input = Input;
        widget.register(Input);
        widget.registerResize(Input);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
/// <reference path="../browser/keyboard.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        widget.popStack = [];
        function findPopupToClose(bindElem) {
            var index = 0;
            if (bindElem && bindElem.nodeName) {
                for (var i = 0; i < widget.popStack.length; i++) {
                    var item = widget.popStack[i];
                    if (tui.browser.isAncestry(bindElem, item._)) {
                        index = i + 1;
                        break;
                    }
                }
            }
            if (index < widget.popStack.length)
                widget.popStack[index].close();
        }
        setInterval(function () {
            findPopupToClose(document.activeElement);
        }, 50);
        /**
         * <popup>
         * Attributes: content, direction, referPos, referElement, opened
         * Method: open(), close()
         * Events: open, close
         */
        var Popup = (function (_super) {
            __extends(Popup, _super);
            function Popup() {
                var _this = this;
                _super.apply(this, arguments);
                this.popIndex = null;
                this.referRect = null;
                this.checkInterval = null;
                this.refProc = function () {
                    _this.render();
                };
            }
            Popup.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "content": {
                        "set": function (value) {
                            _this._data["content"] = value;
                            if (typeof value === "string")
                                _this._.innerHTML = value;
                            else if (value && value.nodeName)
                                _this._.appendChild(value);
                        }
                    }
                });
            };
            Popup.prototype.initChildren = function (childNodes) {
                if (childNodes.length > 0) {
                    var div = document.createElement("div");
                    for (var _i = 0, childNodes_5 = childNodes; _i < childNodes_5.length; _i++) {
                        var node = childNodes_5[_i];
                        div.appendChild(node);
                    }
                    this._set("content", div);
                }
            };
            Popup.prototype.init = function () {
                var _this = this;
                var $root = $(this._);
                $root.attr("tabIndex", "-1");
                $root.css("display", "none");
                var content = this.get("content");
                if (typeof content === "string")
                    $root.html(content);
                else if (content && content.nodeName)
                    $root.append(content);
                widget.init(this._);
                tui.browser.removeNode(this._);
                $root.keydown(function (e) {
                    var c = e.keyCode;
                    if (c === tui.browser.KeyCode.ESCAPE) {
                        _this.close();
                        if (_this.get("referElement")) {
                            _this.get("referElement").focus();
                        }
                    }
                });
            };
            Popup.prototype.open = function (refer, direction) {
                var _this = this;
                if (this.get("opened"))
                    return;
                if (typeof refer === "string")
                    refer = document.getElementById(refer);
                if (typeof direction === tui.UNDEFINED)
                    direction = "Lb";
                if (typeof direction !== "string" || !/^[lLrR][tTbB]$/.test(direction)) {
                    throw new SyntaxError("Invalid popup direction value");
                }
                if (typeof refer === "object" && refer.nodeName) {
                    this._set("referElement", refer);
                    findPopupToClose(refer);
                    this.referRect = tui.browser.getRectOfScreen(refer);
                    this.checkInterval = setInterval(function () {
                        var newRect = tui.browser.getRectOfScreen(refer);
                        if (newRect.left !== _this.referRect.left ||
                            newRect.top !== _this.referRect.top ||
                            newRect.width !== _this.referRect.width ||
                            newRect.height !== _this.referRect.height) {
                            _this.referRect = newRect;
                            _this.render();
                        }
                    }, 16);
                    $(window).on("resize scroll", this.refProc);
                }
                else if (typeof refer === "object" && typeof refer.left === "number" && typeof refer.top === "number") {
                    this._set("referPos", refer);
                    findPopupToClose();
                }
                else
                    throw new SyntaxError("Invalid popup refer value, must be an element or position");
                this.popIndex = widget.popStack.push(this) - 1;
                this._set("direction", direction);
                this._set("opened", true);
                $(this._).css({
                    "display": "block",
                    "position": "fixed"
                });
                this.appendTo(document.body); // Will cause refresh
                widget.init(this._); // refresh children
                this.render(); // refresh self again
                this._.focus();
                this.fire("open");
            };
            Popup.prototype.closeSelf = function () {
                tui.browser.removeNode(this._);
                this._set("opened", false);
                if (this.checkInterval != null) {
                    clearInterval(this.checkInterval);
                    this.checkInterval = null;
                }
                $(window).off("resize scroll", this.refProc);
                this.fire("close");
            };
            Popup.prototype.close = function () {
                if (!this.get("opened"))
                    return;
                for (var i = this.popIndex; i < widget.popStack.length; i++) {
                    var item = widget.popStack[i];
                    item.closeSelf();
                }
                widget.popStack.splice(this.popIndex, widget.popStack.length - this.popIndex + 1);
            };
            Popup.prototype.render = function () {
                if (!this.get("opened"))
                    return;
                var root = this._;
                var ww = $(window).width();
                var wh = $(window).height();
                root.style.left = "0px";
                root.style.top = "0px";
                root.style.width = "";
                //root.style.width = browser.getCurrentStyle(root).width;
                var ew = root.offsetWidth;
                var eh = root.offsetHeight;
                var box = { left: 0, top: 0, width: 0, height: 0 };
                var pos = { left: 0, top: 0 };
                if (this.get("referPos")) {
                    box = this.get("referPos");
                    box.width = 0;
                    box.height = 0;
                }
                else if (this.get("referElement")) {
                    box = tui.browser.getRectOfScreen(this.get("referElement"));
                }
                // lower case letter means 'next to', upper case letter means 'align to'
                var compute = {
                    "l": function () {
                        pos.left = box.left - ew;
                        if (pos.left < 2)
                            pos.left = box.left + box.width;
                    },
                    "r": function () {
                        pos.left = box.left + box.width;
                        if (pos.left + ew > ww - 2)
                            pos.left = box.left - ew;
                    },
                    "t": function () {
                        pos.top = box.top - eh;
                        if (pos.top < 2)
                            pos.top = box.top + box.height;
                    },
                    "b": function () {
                        pos.top = box.top + box.height;
                        if (pos.top + eh > wh - 2)
                            pos.top = box.top - eh;
                    },
                    "L": function () {
                        pos.left = box.left;
                        if (pos.left + ew > ww - 2)
                            pos.left = box.left + box.width - ew;
                    },
                    "R": function () {
                        pos.left = box.left + box.width - ew;
                        if (pos.left < 2)
                            pos.left = box.left;
                    },
                    "T": function () {
                        pos.top = box.top;
                        if (pos.top + eh > wh - 2)
                            pos.top = box.top + box.height - eh;
                    },
                    "B": function () {
                        pos.top = box.top + box.height - eh;
                        if (pos.top < 2)
                            pos.top = box.top;
                    }
                };
                var direction = this.get("direction");
                compute[direction.substring(0, 1)](); // parse left
                compute[direction.substring(1, 2)](); // parse top
                if (pos.left > ww - 2)
                    pos.left = ww - 2;
                if (pos.left < 2)
                    pos.left = 2;
                if (pos.top > wh - 2)
                    pos.top = wh - 2;
                if (pos.top < 2)
                    pos.top = 2;
                root.style.left = pos.left + "px";
                root.style.top = pos.top + "px";
            };
            return Popup;
        }(widget.Widget));
        widget.Popup = Popup;
        widget.register(Popup);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="popup.ts" />
/// <reference path="../browser/keyboard.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        /**
         * <menu>
         * Attributes: content, direction, referPos, referElement, opened
         * Method: open(), close()
         * Events: open, close, click
         */
        var Menu = (function (_super) {
            __extends(Menu, _super);
            function Menu() {
                _super.apply(this, arguments);
                this.activeItem = null;
            }
            Menu.prototype.initChildren = function (childNodes) {
                var data = [];
                function hasChildItem(node) {
                    for (var i = 0; i < node.childNodes.length; i++) {
                        var child = node.childNodes[i];
                        if (widget.getFullName(child) === "tui:item")
                            return true;
                    }
                    return false;
                }
                function addChild(node, items) {
                    var item = new widget.Item(node);
                    var text = item.get("text");
                    if (text === null)
                        text = $.trim(tui.browser.getNodeOwnText(node));
                    var menuItem = {
                        "text": text
                    };
                    var type = item.get("type");
                    if (type && /^(button|check|radio|menu|line)$/.test(type))
                        menuItem.type = type;
                    if (hasChildItem(node) && (typeof menuItem.type === tui.UNDEFINED || menuItem.type === null))
                        menuItem.type = "menu";
                    var icon = item.get("icon");
                    if (typeof icon === "string" && icon.trim().length > 0)
                        menuItem.icon = icon;
                    var shortcut = item.get("shortcut");
                    if (typeof shortcut === "string" && shortcut.trim().length > 0)
                        menuItem.shortcut = shortcut;
                    var checked = item.get("checked");
                    if (typeof checked === "boolean")
                        menuItem.checked = checked;
                    var disable = item.get("disable");
                    if (typeof disable === "boolean")
                        menuItem.disable = disable;
                    if (menuItem.type === "radio") {
                        var group = item.get("group");
                        if (typeof group === "string" && group.length > 0)
                            menuItem.group = group;
                        else
                            menuItem.group = "";
                    }
                    var value = item.get("value");
                    if (value !== null && typeof value !== tui.UNDEFINED)
                        menuItem.value = value;
                    if (menuItem.type === "menu") {
                        menuItem.children = [];
                        addChildren(node.childNodes, menuItem.children);
                    }
                    items.push(menuItem);
                }
                function addChildren(childNodes, items) {
                    for (var i = 0; i < childNodes.length; i++) {
                        var node = childNodes[i];
                        if (widget.getFullName(node) === "tui:item") {
                            addChild(node, items);
                        }
                    }
                }
                addChildren(childNodes, data);
                if (data.length > 0)
                    this._set("items", data);
            };
            Menu.prototype.open = function (refer, direction) {
                var data = this.get("items");
                if (data == null)
                    data = [];
                this._.innerHTML = "";
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var item = data_1[_i];
                    var div = void 0;
                    if (item.type !== "line") {
                        div = tui.browser.toElement("<div tabIndex='-1' unselectable='on'><span class='tui-icon'></span>" +
                            "<span class='tui-arrow'></span><span class='tui-label'></span><span class='tui-shortcut'></span></div>");
                        if (item.disable) {
                            $(div).addClass("tui-disabled");
                        }
                        if (item.type === "check" || item.type === "radio") {
                            if (item.checked) {
                                $(div).children(".tui-icon").addClass("fa-check");
                            }
                        }
                        else if (item.icon) {
                            $(div).children(".tui-icon").addClass(item.icon);
                        }
                        $(div).children(".tui-label").html(item.text);
                        if (typeof item.shortcut === "string")
                            $(div).children(".tui-shortcut").html(item.shortcut);
                        if (item.type === "menu")
                            $(div).children(".tui-arrow").addClass("fa-caret-right");
                        if (item.disable)
                            $(div).addClass("tui-disabled");
                    }
                    else
                        div = tui.browser.toElement("<div class='tui-line'></div>");
                    this._.appendChild(div);
                }
                _super.prototype.open.call(this, refer, direction);
                if (this.activeItem != null) {
                    $(this._).children("div").removeClass("tui-active");
                    this.activeItem = null;
                }
            };
            Menu.prototype.init = function () {
                var _this = this;
                var $root = $(this._);
                $root.attr("tabIndex", "-1");
                $root.css("display", "none");
                tui.browser.removeNode(this._);
                function findMenuItemDiv(elem) {
                    var children = $root.children("div");
                    for (var i = 0; i < children.length; i++) {
                        var div = children[i];
                        if ((typeof elem === "number" && elem === i) ||
                            (typeof elem === "object" && tui.browser.isAncestry(elem, div))) {
                            return div;
                        }
                    }
                    return null;
                }
                ;
                function findDivIndex(elem) {
                    var children = $root.children("div");
                    for (var i = 0; i < children.length; i++) {
                        var div = children[i];
                        if (div === elem) {
                            return i;
                        }
                    }
                    return null;
                }
                ;
                var ie8hack = function (div, index) {
                    if (tui.ieVer >= 7 && tui.ieVer < 9) {
                        var data = _this.get("items");
                        var item = data[index];
                        var icon = $(div).children(".tui-icon")[0];
                        if (item.type === "check" || item.type === "radio") {
                            if (item.checked) {
                                $(icon).removeClass("fa-check");
                                setTimeout(function () {
                                    $(icon).addClass("fa-check");
                                });
                            }
                        }
                        else if (item.icon) {
                            $(icon).removeClass(item.icon);
                            setTimeout(function () {
                                $(icon).addClass(item.icon);
                            });
                        }
                        if (item.type === "menu") {
                            var arrow = $(div).children(".tui-arrow")[0];
                            $(arrow).removeClass("fa-caret-right");
                            setTimeout(function () {
                                $(arrow).addClass("fa-caret-right");
                            });
                        }
                    }
                };
                function activeLine(index) {
                    var div = findMenuItemDiv(index);
                    $(div).addClass("tui-actived");
                    ie8hack(div, index);
                }
                ;
                function deactiveLine(index) {
                    var div = findMenuItemDiv(index);
                    $(div).removeClass("tui-actived");
                    ie8hack(div, index);
                }
                ;
                $root.mousemove(function (e) {
                    var elem = e.target || e.srcElement;
                    var div = findMenuItemDiv(elem);
                    if (div !== null) {
                        var found = findDivIndex(div);
                        if (found !== _this.activeItem) {
                            if (_this.activeItem !== null) {
                                deactiveLine(_this.activeItem);
                            }
                            if ($(div).hasClass("tui-disabled")) {
                                clearTimeout(openSubMenuTimer);
                                _this.activeItem = null;
                                _this._.focus();
                                return;
                            }
                            _this.activeItem = found;
                            activeLine(_this.activeItem);
                            if (!$(div).hasClass("tui-sub")) {
                                _this._.focus();
                                openSubMenu();
                            }
                        }
                    }
                });
                $root.on("touchstart", function (e) {
                    var elem = e.target || e.srcElement;
                    var div = findMenuItemDiv(elem);
                    if (div !== null) {
                        var found = findDivIndex(div);
                        if (found !== _this.activeItem) {
                            if (_this.activeItem !== null) {
                                deactiveLine(_this.activeItem);
                            }
                            if ($(div).hasClass("tui-disabled")) {
                                clearTimeout(openSubMenuTimer);
                                _this.activeItem = null;
                                _this._.focus();
                                return;
                            }
                            _this.activeItem = found;
                            activeLine(_this.activeItem);
                            if (_this.activeItem !== null) {
                                var data = _this.get("items");
                                var item = data[_this.activeItem];
                                if (item.children && item.children.length > 0) {
                                    _this._.focus();
                                    openSubMenu();
                                    e.preventDefault();
                                }
                            }
                        }
                    }
                });
                $root.mouseleave(function (e) {
                    if (_this.activeItem != null) {
                        deactiveLine(_this.activeItem);
                        _this.activeItem = null;
                    }
                    clearTimeout(openSubMenuTimer);
                });
                $root.click(function (e) {
                    if (_this.activeItem != null) {
                        var data = _this.get("items");
                        var item = data[_this.activeItem];
                        if (item.type === "check") {
                            item.checked = !item.checked;
                        }
                        else if (item.type === "radio") {
                            if (typeof item.group === "string") {
                                for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                                    var it = data_2[_i];
                                    if (it.type === "radio" && it.group == item.group) {
                                        it.checked = false;
                                    }
                                }
                            }
                            item.checked = true;
                        }
                        _this.fire("click", { e: e, item: item });
                        _this.close();
                    }
                });
                var findItem = function (from, step) {
                    var data = _this.get("items");
                    for (var i = from; i < data.length && i >= 0; i = i + step) {
                        if (data[i].type !== "line" && !data[i].disable)
                            return i;
                    }
                    return null;
                };
                $root.keydown(function (e) {
                    var c = e.keyCode;
                    var data = _this.get("items");
                    function stopEvent() {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    if (c === tui.browser.KeyCode.ESCAPE) {
                        stopEvent();
                        _this.close();
                        if (_this.get("referElement")) {
                            _this.get("referElement").focus();
                        }
                    }
                    else if (c === tui.browser.KeyCode.LEFT) {
                        stopEvent();
                        if (widget.popStack.length < 2 || !(widget.popStack[widget.popStack.length - 2] instanceof Menu))
                            return;
                        widget.popStack[widget.popStack.length - 2]._.focus();
                    }
                    if (data.length === 0) {
                        _this.activeItem = null;
                        return;
                    }
                    if (c === tui.browser.KeyCode.DOWN || c === tui.browser.KeyCode.TAB) {
                        stopEvent();
                        if (_this.activeItem === null) {
                            _this.activeItem = findItem(0, 1);
                        }
                        else {
                            deactiveLine(_this.activeItem);
                            _this.activeItem = findItem(_this.activeItem + 1, 1);
                            if (_this.activeItem === null)
                                _this.activeItem = 0;
                        }
                        activeLine(_this.activeItem);
                    }
                    else if (c === tui.browser.KeyCode.UP) {
                        stopEvent();
                        if (_this.activeItem === null) {
                            _this.activeItem = findItem(data.length - 1, -1);
                        }
                        else {
                            deactiveLine(_this.activeItem);
                            _this.activeItem = findItem(_this.activeItem - 1, -1);
                            if (_this.activeItem === null)
                                _this.activeItem = data.length - 1;
                        }
                        activeLine(_this.activeItem);
                    }
                    else if (c === tui.browser.KeyCode.RIGHT) {
                        stopEvent();
                        openSubMenu();
                    }
                    else if (c === tui.browser.KeyCode.ENTER) {
                        stopEvent();
                        if (_this.activeItem !== null) {
                            var item = data[_this.activeItem];
                            _this.fire("click", { e: e, item: item });
                            _this.close();
                        }
                    }
                });
                var openSubMenuTimer = null;
                var openSubMenu = function () {
                    var data = _this.get("items");
                    if (_this.activeItem !== null) {
                        clearTimeout(openSubMenuTimer);
                        var item = data[_this.activeItem];
                        if (item.type !== "menu")
                            return;
                        var div_1 = findMenuItemDiv(_this.activeItem);
                        if ($(div_1).hasClass("tui-sub"))
                            return;
                        var itemIndex_1 = _this.activeItem;
                        openSubMenuTimer = setTimeout(function () {
                            var childItems = item.children;
                            var subMenu = widget.create(Menu, { "items": childItems });
                            if ($(_this._).hasClass("tui-big"))
                                $(subMenu._).addClass("tui-big");
                            $(div_1).addClass("tui-sub");
                            ie8hack(div_1, itemIndex_1);
                            subMenu.open(div_1, "rT");
                            subMenu.on("close", function () {
                                $(div_1).removeClass("tui-sub");
                                ie8hack(div_1, itemIndex_1);
                            });
                            subMenu.on("click", function (e) {
                                _this.fire("click", e.data);
                                _this.close();
                            });
                        }, 200);
                    }
                };
            };
            return Menu;
        }(widget.Popup));
        widget.Menu = Menu;
        widget.register(Menu);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        var Navigator = (function (_super) {
            __extends(Navigator, _super);
            function Navigator() {
                _super.apply(this, arguments);
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
                var container = this._components["container"] = document.createElement("div");
                var up = this._components["up"] = document.createElement("div");
                var down = this._components["down"] = document.createElement("div");
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
                $(container).on("mousedown keydown", function (e) {
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
                    $elem.next().animate({ height: "toggle" }, function () {
                        _this.checkScroll();
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
                    $elem.next().animate({ height: "toggle" }, function () {
                        _this.checkScroll();
                    });
                }
            };
            Navigator.prototype.active = function (elem) {
                elem.focus();
                if (this._activeItem)
                    $(this._activeItem).removeClass("tui-active");
                if (this.get("selectable")) {
                    $(elem).addClass("tui-active");
                    this._activeItem = elem;
                }
            };
            Navigator.prototype.drawItems = function (parent, items, level) {
                for (var _i = 0, items_3 = items; _i < items_3.length; _i++) {
                    var item = items_3[_i];
                    var line = document.createElement("div");
                    line.item = item;
                    var $line = $(line);
                    $line.attr("unselectable", "on");
                    $line.attr("tabIndex", "0");
                    $line.addClass("tui-line");
                    $line.text(item.text);
                    if (level > 0)
                        $line.addClass("tui-child");
                    if (item.icon) {
                        var icon = document.createElement("i");
                        icon.className = item.icon;
                        line.insertBefore(icon, line.firstChild);
                    }
                    if (item.path)
                        line.setAttribute("path", item.path);
                    if (item.name)
                        line.setAttribute("name", item.name);
                    var space = document.createElement("span");
                    space.style.display = "inline-block";
                    space.style.width = 20 * level + "px";
                    line.insertBefore(space, line.firstChild);
                    parent.appendChild(line);
                    if (item.children && item.children.length > 0) {
                        var subArea = document.createElement("div");
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
        widget.Navigator = Navigator;
        widget.register(Navigator);
        widget.registerResize(Navigator);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="base.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        var Scrollbar = (function (_super) {
            __extends(Scrollbar, _super);
            function Scrollbar() {
                _super.apply(this, arguments);
            }
            Scrollbar.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "total": {
                        "get": function () {
                            var value = _this._data["total"];
                            if (typeof value !== "number" || isNaN(value) || value < 0)
                                return 0;
                            else
                                return value;
                        },
                        "set": function (value) {
                            if (typeof value !== "number" || isNaN(value))
                                value = 0;
                            if (value < 0)
                                value = 0;
                            value = Math.round(value);
                            _this._data["total"] = value;
                            if (_this.get("value") > value)
                                _this._set("value", value);
                            if (_this.get("page") > value)
                                _this._set("page", value);
                        }
                    },
                    "page": {
                        "get": function () {
                            var value = _this._data["page"];
                            if (typeof value !== "number" || isNaN(value) || value < 1)
                                return 1;
                            else
                                return value;
                        },
                        "set": function (value) {
                            if (typeof value !== "number" || isNaN(value))
                                value = 1;
                            value = Math.round(value);
                            if (value < 1)
                                value = 1;
                            if (value > _this.get("total"))
                                value = _this.get("total");
                            _this._data["page"] = value;
                        }
                    },
                    "value": {
                        "get": function () {
                            var value = _this._data["value"];
                            if (typeof value !== "number" || isNaN(value) || value < 0)
                                return 0;
                            else
                                return value;
                        },
                        "set": function (value) {
                            if (typeof value !== "number" || isNaN(value))
                                value = 0;
                            value = Math.round(value);
                            if (value < 0)
                                value = 0;
                            if (value > _this.get("total"))
                                value = _this.get("total");
                            _this._data["value"] = value;
                        }
                    },
                    "direction": {
                        "get": function () {
                            var dir = _this._data["direction"];
                            if (dir !== "vertical" && dir !== "horizontal")
                                return "vertical";
                            else
                                return dir;
                        },
                        "set": function (value) {
                            if (value !== "vertical" && value !== "horizontal")
                                return;
                            _this._data["direction"] = value;
                        }
                    }
                });
            };
            Scrollbar.prototype.init = function () {
                var _this = this;
                var root$ = $(this._);
                this._.innerHTML = "<span class='tui-scroll-thumb'></span>";
                var btnThumb = this._components["thumb"] = root$.children(".tui-scroll-thumb")[0];
                root$.attr("unselectable", "on");
                $(this._).mousedown(function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var obj = e.target || e.srcElement;
                    if (obj !== _this._) {
                        return;
                    }
                    if (_this.get("total") <= 0)
                        return;
                    var dir = _this.get("direction");
                    var pos, thumbLen;
                    if (dir === "vertical") {
                        pos = (typeof e.offsetY === "number" ? e.offsetY : e["originalEvent"].layerY);
                        thumbLen = btnThumb.offsetHeight;
                    }
                    else {
                        pos = (typeof e.offsetX === "number" ? e.offsetX : e["originalEvent"].layerX);
                        thumbLen = btnThumb.offsetWidth;
                    }
                    var v = _this.posToValue(pos - thumbLen / 2);
                    _this.set("value", v);
                    _this.fire("scroll", { e: e, value: _this.get("value"), type: "mousedown" });
                    return false;
                });
                var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                $(this._).on(mousewheelevt, function (e) {
                    var ev = e.originalEvent;
                    var delta = ev.detail ? ev.detail * (-1) : ev.wheelDelta;
                    var page = _this.get("page");
                    //delta returns +120 when wheel is scrolled up, -120 when scrolled down
                    var scrollSize = (Math.round(page / 2) > 1 ? Math.round(page / 2) : 1);
                    var oldValue = _this.get("value");
                    if (delta <= -0) {
                        _this.set("value", oldValue + scrollSize);
                    }
                    else {
                        _this.set("value", oldValue - scrollSize);
                    }
                    if (oldValue !== _this.get("value"))
                        _this.fire("scroll", { e: e, value: _this.get("value"), type: "mousewheel" });
                    e.stopPropagation();
                    e.preventDefault();
                });
                var beginX = 0, beginY = 0, beginLeft = 0, beginTop = 0;
                var dragThumb = function (e) {
                    var diff = 0;
                    var oldValue = _this.get("value");
                    var pos;
                    var positions = tui.browser.getEventPosition(e);
                    if (_this.get("direction") === "vertical") {
                        diff = positions[0].y - beginY;
                        pos = beginTop + diff;
                    }
                    else {
                        diff = positions[0].x - beginX;
                        pos = beginLeft + diff;
                    }
                    _this.set("value", _this.posToValue(pos));
                    if (oldValue !== _this.get("value")) {
                        _this.fire("scroll", { e: e, value: _this.get("value"), type: "drag" });
                    }
                };
                var dragEnd = function (e) {
                    $(_this._).removeClass("tui-actived");
                    _this.fire("dragend", { e: e, value: _this.get("value") });
                };
                $(btnThumb).on("mousedown touchstart", function (e) {
                    if (e.which !== 1 && e.type !== "touchstart")
                        return;
                    var positions = tui.browser.getEventPosition(e);
                    if (positions.length > 1)
                        return;
                    e.preventDefault();
                    beginX = positions[0].x;
                    beginY = positions[0].y;
                    beginLeft = btnThumb.offsetLeft;
                    beginTop = btnThumb.offsetTop;
                    $(_this._).addClass("tui-actived");
                    widget.openDragMask(dragThumb, dragEnd);
                    _this.fire("dragstart", { e: e, value: _this.get("value") });
                });
                this.on("resize", function () {
                    _this.render();
                });
                this.refresh();
            };
            Scrollbar.prototype.posToValue = function (pos) {
                var btnThumb = this._components["thumb"];
                var total = this.get("total");
                if (total <= 0) {
                    return 0;
                }
                var len = 0;
                var val = 0;
                if (this.get("direction") === "vertical") {
                    len = this._.clientHeight - btnThumb.offsetHeight;
                    if (len <= 0)
                        val = 0;
                    else
                        val = pos / len * total;
                }
                else {
                    len = this._.clientWidth - btnThumb.offsetWidth;
                    if (len <= 0)
                        val = 0;
                    else
                        val = pos / len * total;
                }
                val = Math.round(val);
                return val;
            };
            Scrollbar.prototype.valueToPos = function (value) {
                var minSize = 20;
                var total = this.get("total");
                var page = this.get("page");
                var vertical = (this.get("direction") === "vertical");
                if (total <= 0) {
                    return { pos: 0, thumbLen: 0 };
                }
                var len = (vertical ? this._.clientHeight : this._.clientWidth);
                var thumbLen = Math.round(page / total * len);
                if (thumbLen < minSize)
                    thumbLen = minSize;
                if (thumbLen > len - 10)
                    thumbLen = len - 10;
                var scale = (value / total);
                if (scale < 0)
                    scale = 0;
                if (scale > 1)
                    scale = 1;
                var pos = Math.round(scale * (len - thumbLen));
                return {
                    "pos": pos, "thumbLen": thumbLen
                };
            };
            Scrollbar.prototype.render = function () {
                var pos = this.valueToPos(this.get("value"));
                var vertical = (this.get("direction") === "vertical");
                var btnThumb = this._components["thumb"];
                if (vertical) {
                    $(this._).removeClass("tui-horizontal");
                    $(this._).addClass("tui-vertical");
                    btnThumb.style.height = (pos.thumbLen > 0 ? pos.thumbLen : 0) + "px";
                    btnThumb.style.top = pos.pos + "px";
                    btnThumb.style.left = "";
                    btnThumb.style.width = "";
                }
                else {
                    $(this._).addClass("tui-horizontal");
                    $(this._).removeClass("tui-vertical");
                    btnThumb.style.width = (pos.thumbLen > 0 ? pos.thumbLen : 0) + "px";
                    btnThumb.style.left = pos.pos + "px";
                    btnThumb.style.top = "";
                    btnThumb.style.height = "";
                }
            };
            return Scrollbar;
        }(widget.Widget));
        widget.Scrollbar = Scrollbar;
        widget.register(Scrollbar);
        widget.registerResize(Scrollbar);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="selectBase.ts" />
/// <reference path="dialog.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        /**
         * <tui:select>
         * Attributes: data, list, tree, multiSelect, checkKey, nameKey, canSearch, search
         * iconKey, valueKey
         * Method: openSelect
         * Events: change, click
         */
        var Select = (function (_super) {
            __extends(Select, _super);
            function Select() {
                _super.apply(this, arguments);
            }
            Select.prototype.initRestriction = function () {
                var _this = this;
                var list = widget.create(widget.List);
                list._set("noMouseWheel", true);
                list.set("lineHeight", Select.LIST_LINE_HEIGHT);
                this._components["list"] = list._;
                _super.prototype.initRestriction.call(this);
                this.setRestrictions({
                    "value": {
                        "set": function (value) {
                            _this._data["value"] = value;
                            _this.updateTextByValue(list);
                        }
                    },
                    "data": {
                        "set": function (value) {
                            list._set("data", value);
                            _this.updateTextByValue(list);
                        },
                        "get": function () {
                            return list.get("data");
                        }
                    },
                    "list": {
                        "set": function (value) {
                            list._set("list", value);
                            _this.updateTextByValue(list);
                        },
                        "get": function () {
                            return list.get("list");
                        }
                    },
                    "tree": {
                        "set": function (value) {
                            list._set("tree", value);
                            _this.updateTextByValue(list);
                        },
                        "get": function () {
                            return list.get("tree");
                        }
                    },
                    "activeRow": {
                        "set": function (value) {
                            list.set("activeRow", value);
                            _this.updateTextByValue(list);
                        },
                        "get": function () {
                            return list.get("activeRow");
                        }
                    },
                    "selection": {
                        "set": function (value) { },
                        "get": function () {
                            return _this.getSelection(list);
                        }
                    },
                    "activeRowData": {
                        "set": function (value) { },
                        "get": function () {
                            return list.get("activeRowData");
                        }
                    },
                    "multiSelect": {
                        "set": function (value) {
                            list._set("checkable", value);
                        },
                        "get": function () {
                            return list.get("checkable");
                        }
                    },
                    "checkKey": {
                        "set": function (value) {
                            list._set("checkKey", value);
                        },
                        "get": function () {
                            return list.get("checkKey");
                        }
                    },
                    "nameKey": {
                        "set": function (value) {
                            list._set("nameKey", value);
                        },
                        "get": function () {
                            return list.get("nameKey");
                        }
                    },
                    "iconKey": {
                        "set": function (value) {
                            list._set("iconKey", value);
                        },
                        "get": function () {
                            return list.get("iconKey");
                        }
                    },
                    "valueKey": {
                        "set": function (value) {
                            list._set("valueKey", value);
                        },
                        "get": function () {
                            return list.get("valueKey");
                        }
                    },
                    "showCount": {
                        "get": function () {
                            var count = _this._data["showCount"];
                            if (typeof count === "number" && !isNaN(count))
                                return count;
                            else
                                return 8;
                        }
                    },
                    "canSearch": {
                        "get": function () {
                            var value = _this._data["canSearch"];
                            if (typeof value === tui.UNDEFINED || value === null)
                                return false;
                            else
                                return !!value;
                        },
                        "set": function (value) {
                            _this._data["canSearch"] = !!value;
                        }
                    }
                });
            };
            Select.prototype.changeSize = function () {
                var list = widget.get(this._components["list"]);
                var popup = widget.get(this._components["popup"]);
                var count = list.get("data").length();
                if (count > this.get("showCount"))
                    count = this.get("showCount");
                list._.style.height = count * Select.LIST_LINE_HEIGHT + "px";
                popup.render();
            };
            ;
            Select.prototype.getSelection = function (list) {
                var textKey = this.get("textKey");
                if (textKey === null)
                    textKey = this.get("nameKey");
                var valueKey = this.get("valueKey");
                var val = this.get("value");
                if (val === null)
                    return null;
                if (!this.get("multiSelect")) {
                    var selectedItem_1 = null;
                    list.iterate(function (item, path, treeNode) {
                        var nodeValue = item[valueKey];
                        if (nodeValue === val) {
                            selectedItem_1 = item;
                            return false;
                        }
                        return true;
                    });
                    return selectedItem_1;
                }
                else {
                    if (!(val instanceof Array))
                        val = [val];
                    var selectedItems_1 = [];
                    list.iterate(function (item, path, treeNode) {
                        var nodeValue = item[valueKey];
                        if (val.indexOf(nodeValue) >= 0) {
                            selectedItems_1.push(item);
                        }
                        return true;
                    });
                    return selectedItems_1;
                }
            };
            Select.prototype.updateTextByValue = function (list) {
                var textKey = this.get("textKey");
                if (textKey === null)
                    textKey = this.get("nameKey");
                var selected = this.getSelection(list);
                if (selected == null)
                    this._set("text", null);
                else if (selected instanceof Array)
                    this._set("text", selected.reduce(function (s, v, i) {
                        return i > 0 ? s + ", " + v[textKey] : v[textKey];
                    }, ""));
                else
                    this._set("text", selected[textKey]);
            };
            Select.prototype.init = function () {
                var _this = this;
                _super.prototype.init.call(this);
                this.setInit("iconRight", "fa-caret-down");
                var list = widget.get(this._components["list"]);
                var container = document.createElement("div");
                var searchbar = container.appendChild(document.createElement("div"));
                searchbar.className = "tui-select-searchbar";
                var searchBox = widget.create(widget.Input);
                searchBox._set("clearable", true);
                searchBox._set("iconLeft", "fa-search");
                searchbar.appendChild(searchBox._);
                container.appendChild(list._);
                var toolbar = container.appendChild(document.createElement("div"));
                toolbar.className = "tui-select-toolbar";
                var popup = widget.get(this._components["popup"]);
                popup._set("content", container);
                this._components["searchbar"] = searchbar;
                this._components["toolbar"] = toolbar;
                this._components["searchBox"] = searchBox._;
                list._.style.width = "inherit";
                list._.style.display = "block";
                list._.style.borderWidth = "0";
                list.on("expand collapse update", function () {
                    _this.changeSize();
                });
                list.on("rowclick keyselect", function (e) {
                    var rowData = list.get("activeRowData");
                    if (!_this.get("multiSelect")) {
                        var item;
                        if (list.get("dataType") === "tree")
                            item = rowData.item;
                        else
                            item = rowData;
                        // this._set("text", item[list.get("nameKey")]);
                        _this.set("value", item[list.get("valueKey")]);
                        _this.fire("change", { e: e, value: _this.get("value"), text: _this.get("text") });
                        if (e.event === "rowclick") {
                            _this.closeSelect();
                            _this._.focus();
                            _this.fire("click", { e: e, value: _this.get("value"), text: _this.get("text") });
                        }
                    }
                });
                searchBox.on("enter change", function (e) {
                    var searchValue = searchBox.get("value");
                    if (searchValue == null || searchValue.length == 0) {
                        list.get("data").setFilter(null);
                    }
                    else {
                        list.get("data").setFilter([{
                                key: _this.get("nameKey"),
                                value: searchValue
                            }]);
                    }
                    list._set("activeRow", null);
                    list.scrollTo(0);
                    if (!_this.get("multiSelect") && _this.get("value") !== null) {
                        list.activeTo(_this.get("valueKey"), _this.get("value"));
                    }
                });
                $(toolbar).click(function (e) {
                    var obj = (e.target || e.srcElement);
                    var name = obj.getAttribute("name");
                    if (name === "selectAll") {
                        list.selectAll();
                    }
                    else if (name === "deselectAll") {
                        list.deselectAll();
                    }
                    else if (name === "ok") {
                        _this.set("value", list.get("checkedValues"));
                        // this.set("text", list.get("checkedNames").join(", "));
                        _this.fire("change", { e: e, value: _this.get("value"), text: _this.get("text") });
                        _this.closeSelect();
                        _this._.focus();
                        _this.fire("click", { e: e, value: _this.get("value"), text: _this.get("text") });
                    }
                    else if (name === "clear") {
                        // this._set("text", null);
                        _this.set("value", null);
                        _this.fire("change", { e: e, value: _this.get("value"), text: _this.get("text") });
                        _this.closeSelect();
                        _this._.focus();
                        _this.fire("click", { e: e, value: _this.get("value"), text: _this.get("text") });
                    }
                });
            };
            Select.prototype.openSelect = function () {
                var _this = this;
                var list = widget.get(this._components["list"]);
                var popup = widget.get(this._components["popup"]);
                var minWidth = this._.offsetWidth - 2;
                if (minWidth < 250)
                    minWidth = 250;
                popup._.style.minWidth = minWidth + "px";
                //popup._set("content", list._);
                var toolbar = this._components["toolbar"];
                var searchbar = this._components["searchbar"];
                var searchBox = widget.get(this._components["searchBox"]);
                if (this.get("canSearch")) {
                    searchbar.style.display = "block";
                }
                else
                    searchbar.style.display = "none";
                var checkButtons = "<a name='selectAll'>" + tui.str("Select all") + "</a> | " +
                    "<a name='deselectAll'>" + tui.str("Deselect all") +
                    "</a> | <a name='ok'><i class='fa fa-check'></i> " + tui.str("OK") + "</a>";
                var clearButton = "<a name='clear'><i class='fa fa-trash-o'></i> " + tui.str("Clear") + "</a>";
                var multiSelect = this.get("multiSelect");
                var clearable = !multiSelect && this.get("clearable");
                toolbar.style.display = "";
                if (multiSelect)
                    toolbar.innerHTML = checkButtons;
                else if (clearable)
                    toolbar.innerHTML = clearButton;
                else
                    toolbar.style.display = "none";
                popup.open(this._);
                setTimeout(function () {
                    if (_this.get("canSearch"))
                        searchBox.render();
                    list._.focus();
                    list.render();
                    if (tui.ieVer > 0 && tui.ieVer <= 9) {
                        // FIX ie bug.
                        setTimeout(function () {
                            list.render();
                        });
                    }
                    if (!_this.get("multiSelect")) {
                        if (_this.get("value") !== null) {
                            list.activeTo(_this.get("valueKey"), _this.get("value"));
                        }
                        else {
                            list._set("activeRow", null);
                            list.scrollTo(0);
                        }
                    }
                    else {
                        var value = _this.get("value");
                        list.set("checkedValues", value);
                    }
                    _this.changeSize();
                });
            };
            Select.LIST_LINE_HEIGHT = 28;
            return Select;
        }(widget.SelectPopupBase));
        widget.Select = Select;
        widget.register(Select);
        var DialogSelect = (function (_super) {
            __extends(DialogSelect, _super);
            function DialogSelect() {
                _super.apply(this, arguments);
            }
            DialogSelect.prototype.openSelect = function () {
                this.fire("open", this.dialog);
                this.dialog.set("title", this.get("title"));
                this.dialog.open("ok#tui-primary");
            };
            DialogSelect.prototype.initChildren = function (childNodes) {
                var _this = this;
                _super.prototype.initChildren.call(this, childNodes);
                this.dialog = widget.create(widget.Dialog);
                this.content = document.createElement("div");
                childNodes.forEach(function (n) {
                    if (widget.getFullName(n) !== "tui:verify")
                        _this.content.appendChild(n);
                });
                this.dialog.setContent(this.content);
                widget.init(this.content);
            };
            DialogSelect.prototype.createPopup = function () {
                var _this = this;
                this.dialog.on("btnclick", function () {
                    _this.fire("close");
                    _this.dialog.close();
                });
                return this.dialog;
            };
            DialogSelect.prototype.init = function () {
                _super.prototype.init.call(this);
                this.setInit("iconRight", "fa-pencil");
            };
            return DialogSelect;
        }(widget.SelectBase));
        widget.DialogSelect = DialogSelect;
        widget.register(DialogSelect);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="inputBase.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        /**
         * <input>
         * Attributes: value, text, type, iconLeft, iconRight, autoValidate
         * Events: input, change, left-icon-mousedown, right-icon-mousedown, left-icon-click, right-icon-click
         */
        var Textarea = (function (_super) {
            __extends(Textarea, _super);
            function Textarea() {
                _super.apply(this, arguments);
            }
            Textarea.prototype.initRestriction = function () {
                var _this = this;
                _super.prototype.initRestriction.call(this);
                var textbox = this._components["textbox"] = document.createElement("textarea");
                textbox.setAttribute("wrap", "physical");
                this.setRestrictions({
                    "value": {
                        "set": function (value) {
                            textbox.value = value;
                            _this._isEmpty = (textbox.value === "");
                        },
                        "get": function () {
                            return textbox.value;
                        }
                    },
                    "text": {
                        "set": function (value) {
                            _this._set("value", value);
                        },
                        "get": function () {
                            return _this.get("value");
                        }
                    }
                });
            };
            Textarea.prototype.onInput = function (textbox, e) {
                this.updateEmptyState(textbox.value === "");
                var oldHeight = tui.browser.getCurrentStyle(textbox).height;
                textbox.style.height = "";
                if (this._valid && textbox.scrollHeight !== this._lastTextHeight)
                    this.render();
                else
                    textbox.style.height = oldHeight;
                this.reset();
                this.fire("input", e);
            };
            Textarea.prototype.init = function () {
                var _this = this;
                var $root = $(this._);
                var placeholder = this._components["placeholder"] = document.createElement("span");
                var textbox = this._components["textbox"];
                var iconInvalid = this._components["iconInvalid"] = document.createElement("i");
                iconInvalid.className = "tui-invalid-icon";
                placeholder.className = "tui-placeholder";
                placeholder.setAttribute("unselectable", "on");
                this._.appendChild(placeholder);
                this._.appendChild(textbox);
                this._.appendChild(iconInvalid);
                $(textbox).focus(function () {
                    $root.addClass("tui-active");
                });
                $(textbox).blur(function () {
                    $root.removeClass("tui-active");
                    if (_this.get("disable"))
                        return;
                    if (_this.get("autoValidate")) {
                        _this.validate();
                    }
                });
                if (tui.ieVer > 0 && tui.ieVer < 9) {
                    $(textbox).on("propertychange", function (e) {
                        if (e.originalEvent.propertyName !== 'value')
                            return;
                        _this.onInput(textbox, e);
                    });
                }
                else {
                    if (tui.ieVer === 9) {
                        $(textbox).on("keyup", function (e) {
                            if (e.keyCode = tui.browser.KeyCode.BACK)
                                _this.onInput(textbox, e);
                        });
                    }
                    $(textbox).on("input", function (e) {
                        _this.onInput(textbox, e);
                    });
                }
                $(textbox).on("change", function (e) {
                    _this.fire("change", e);
                });
                $root.mousedown(function (e) {
                    if (_this.get("disable"))
                        return;
                    var obj = e.target || e.srcElement;
                    if (obj === textbox) {
                        return;
                    }
                    setTimeout(function () {
                        textbox.focus();
                    }, 0);
                });
                $root.click(function (e) {
                    if (_this.get("disable"))
                        return;
                    var obj = e.target || e.srcElement;
                    if (obj === textbox) {
                        return;
                    }
                });
                this.on("resize", function () {
                    _this.render();
                });
            };
            Textarea.prototype.focus = function () {
                var textbox = this._components["textbox"];
                textbox.focus();
            };
            Textarea.prototype.render = function () {
                this._.scrollLeft = 0;
                var $root = $(this._);
                var textbox = this._components["textbox"];
                var iconInvalid = this._components["iconInvalid"];
                var placeholder = this._components["placeholder"];
                if (this.get("disable")) {
                    $root.addClass("tui-disable");
                    textbox.setAttribute("readonly", "readonly");
                }
                else {
                    $root.removeClass("tui-disable");
                    textbox.removeAttribute("readonly");
                }
                var marginLeft = widget.Input.PADDING;
                var marginRight = widget.Input.PADDING;
                if (!this._valid) {
                    $root.addClass("tui-invalid");
                    iconInvalid.style.display = "";
                    iconInvalid.style.right = "0px";
                }
                else {
                    $root.removeClass("tui-invalid");
                    iconInvalid.style.display = "none";
                }
                textbox.style.height = "";
                this._lastTextHeight = textbox.scrollHeight;
                if (this._lastTextHeight < 46)
                    this._lastTextHeight = 46;
                textbox.style.height = this._lastTextHeight + 2 + "px";
                this._.style.height = this._lastTextHeight + 4 + "px";
                textbox.style.left = marginLeft + "px";
                var width = this._.clientWidth - iconInvalid.offsetWidth - marginLeft - marginRight;
                if (width < 0)
                    width = 0;
                textbox.style.width = width + "px";
                var phText = this.get("placeholder");
                var showPh = phText && !this.get("value");
                if (showPh) {
                    $(placeholder).text(phText);
                    placeholder.style.left = marginLeft + "px";
                    placeholder.style.width = textbox.style.width;
                    placeholder.style.display = "";
                }
                else {
                    placeholder.style.display = "none";
                }
                if (!this._valid && this._invalidMessage) {
                    this._set("follow-tooltip", this._invalidMessage);
                }
                else {
                    this._set("follow-tooltip", null);
                }
            };
            return Textarea;
        }(widget.InputBase));
        widget.Textarea = Textarea;
        widget.register(Textarea);
        widget.registerResize(Textarea);
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));
/// <reference path="../core.ts" />
var tui;
(function (tui) {
    var widget;
    (function (widget) {
        "use strict";
        var _tooltip = document.createElement("span");
        _tooltip.className = "tui-tooltip";
        _tooltip.setAttribute("unselectable", "on");
        var _tooltipTarget = null;
        function showTooltip(target, tooltip, pos, update) {
            function show() {
                if (pos.x + _tooltip.offsetWidth > $(window).width()) {
                    pos.x = $(window).width() - _tooltip.offsetWidth;
                }
                _tooltip.style.left = pos.x + "px";
                _tooltip.style.top = pos.y + 25 + "px";
            }
            if (target === _tooltipTarget || target === _tooltip) {
                if (update) {
                    show();
                }
                return;
            }
            _tooltip.style.width = "";
            _tooltip.style.whiteSpace = "nowrap";
            if (target.hasAttribute("html-tooltip"))
                _tooltip.innerHTML = tooltip;
            else
                $(_tooltip).text(tooltip);
            document.body.appendChild(_tooltip);
            _tooltipTarget = target;
            if (_tooltip.scrollWidth > _tooltip.clientWidth) {
                _tooltip.style.whiteSpace = "normal";
            }
            else
                _tooltip.style.whiteSpace = "nowrap";
            _tooltip.style.width = $(_tooltip).width() + "px";
            show();
        }
        widget.showTooltip = showTooltip;
        function closeTooltip() {
            if (_tooltip.parentNode)
                _tooltip.parentNode.removeChild(_tooltip);
            _tooltip.innerHTML = "";
            _tooltip.style.width = "";
            _tooltipTarget = null;
        }
        widget.closeTooltip = closeTooltip;
        var _tooltipTimer = null;
        function whetherShowTooltip(target, e) {
            if (tui.browser.isAncestry(target, _tooltip))
                return;
            var obj = target;
            while (obj) {
                if (!obj.getAttribute) {
                    obj = null;
                    break;
                }
                var tooltip = obj.getAttribute("follow-tooltip"); // high priority
                if (tooltip) {
                    showTooltip(obj, tooltip, { x: e.clientX, y: e.clientY }, true);
                    return;
                }
                else {
                    tooltip = obj.getAttribute("tooltip");
                    if (tooltip) {
                        closeTooltip();
                        _tooltipTimer = setTimeout(function () {
                            showTooltip(obj, tooltip, { x: e.clientX, y: e.clientY }, false);
                        }, 500);
                        return;
                    }
                    else
                        obj = obj.parentElement;
                }
            }
            if (!obj)
                closeTooltip();
        }
        widget.whetherShowTooltip = whetherShowTooltip;
        function whetherCloseTooltip(target) {
            if (target !== _tooltipTarget && target !== _tooltip) {
                closeTooltip();
            }
        }
        widget.whetherCloseTooltip = whetherCloseTooltip;
        var _hoverElement;
        $(window.document).mousemove(function (e) {
            clearTimeout(_tooltipTimer);
            _hoverElement = e.target || e.toElement;
            if (e.button === 0 && (e.which === 1 || e.which === 0)) {
                whetherShowTooltip(_hoverElement, e);
            }
        });
        $(window).scroll(function () { closeTooltip(); });
    })(widget = tui.widget || (tui.widget = {}));
})(tui || (tui = {}));

//# sourceMappingURL=tui2.js.map