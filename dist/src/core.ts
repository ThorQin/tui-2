/// <reference path="jquery.d.ts" />
/// <reference path="animation.ts" />
module tui {
	"use strict";
	export const UNDEFINED = ((undefined?: any): string => {
		return typeof undefined;
	})();

	export function elem(nodeName: string) {
		return document.createElement(nodeName);
	}

	// Used to decide which language should be used to display UI control
	export var lang = ((): string => {
		return (navigator.language || (<any>navigator).browserLanguage || (<any>navigator).userLanguage).toLowerCase();
	})();


	class Translator {
		dictionary: { [index: string]: string };
		constructor() {
			this.dictionary = {};
		}
		translate(str: string) {
			return (this.dictionary && this.dictionary[(str + "").toLowerCase()]) || str;
		}
	}

	var _dict: { [index: string]: Translator } = {};

	/**
	 * Register a translation dictionary.
	 */
	export function dict(lang: string, dictionary: { [index: string]: string }, replace: boolean = false): void {
		if (!lang)
			return;
		if (typeof lang === "string")
			lang = lang.toLowerCase();
		if (typeof dictionary === "object" && dictionary !== null) {
			var translator = _dict[lang];
			if (!translator) {
				translator = _dict[lang] = new Translator();
			}
			if (replace) {
				translator.dictionary = dictionary;
			} else {
				for (var k in dictionary) {
					if (dictionary.hasOwnProperty(k))
						translator.dictionary[k] = dictionary[k];
				}
			}
		}
	}

    /**
	 * Multi-language support, translate source text to specified language(default use tui.lang setting)
	 * @param s {string} source text
	 * @param lang {string} if specified then use this parameter as objective language otherwise use tui.lang as objective language
	 */
	export function str(s: string, lang?: string): string {
		if (!lang) {
			if (!tui.lang)
				lang = "en-us";
			else
				lang = tui.lang.toLowerCase();
		}
		var translator = _dict[lang];
		if (translator) {
			return translator.translate(s);
		} else {
			translator = _dict["en-us"];
			if (translator) {
				return translator.translate(s);
			} else {
				return s;
			}
		}
	}

	export function strp(s: string, ...params: any[]) {
		var s = str(s);
		return text.format(s, params);
	}

	export var tuid = (function () {
		var id = 0;
		return function () {
			return ('tuid-' + id++);
		};
	})();

	export interface EventInfo {
		event: string;
		data: any;
	}

	export interface EventHandler {
		(data: EventInfo): any;
		isOnce?: boolean;
	}

	/**
	 * Base object, all other control extended from this base class.
	 */
	export class EventObject {
		private _events: any = {};

        /**
		 * Register event handler.
		 * @param {string} eventName
		 * @param {EventHandler} handler Which handler to be registered
		 * @param {boolean} atFirst If true then handler will be triggered firstly
		 */
		bind(eventName: string, handler: EventHandler, atFirst: boolean): EventObject {
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
		}

        /**
		 * Unregister event handler.
		 * @param eventName
		 * @param handler Which handler to be unregistered if don't specified then unregister all handler
		 */
		unbind(eventName: string, handler?: EventHandler): EventObject {
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
			} else {
				handlers.length = 0;
			}
			return this;
		}

		/**
		 * Register event handler.
		 * @param {string} eventName
		 * @param {callback} callback Which handler to be registered
		 * @param {boolean} atFirst If true then handler will be triggered firstly
		 */
		on(eventName: string, callback: EventHandler, atFirst: boolean = false): EventObject {
			var envs = eventName.split(/\s+/);
			for (let i = 0; i < envs.length; i++) {
				let v = envs[i];
				this.bind(v, callback, atFirst);
			}
			return this;
		}

		/**
		 * Register event handler.
		 * @param eventName
		 * @param callback Which handler to be registered but event only can be trigered once
		 * @param atFirst If true then handler will be triggered firstly
		 */
		once(eventName: string, callback: EventHandler, atFirst: boolean = false): EventObject {
			callback.isOnce = true;
			return this.on(eventName, callback, atFirst);
		}

		/**
		 * Unregister event handler.
		 * @param eventName
		 * @param callback Which handler to be unregistered if don't specified then unregister all handler
		 */
		off(eventName: string, callback?: EventHandler): EventObject {
			var envs = eventName.split(/\s+/);
			for (let i = 0; i < envs.length; i++) {
				let v = envs[i];
				this.unbind(v, callback);
			}
			return this;
		}

		offAll() {
			for (var key in this._events) {
				this.off(key);
			}
		}

		/**
		 * Fire event. If some handler process return false then cancel the event channe and return false either
		 * @param {string} eventName
		 * @param {any[]} param
		 * @return {boolean} If any handler return false then stop other processing and return false either, otherwise return true
		 */
		fire(eventName: string, data?: any): boolean {
			var handlers: EventHandler[] = this._events[eventName];
			if (!(handlers instanceof Array)) {
				handlers = [];
			}
			var wildcardHandlers: EventHandler[] = this._events['*'];
			if (wildcardHandlers instanceof Array)
				handlers = handlers.concat(wildcardHandlers);
			if (handlers.length === 0)
				return true;
			var eventInfo: EventInfo = {
				"event": eventName,
				"data": data
			};
			var removeArray: EventHandler[] = [];
			for (let i = 0; i < handlers.length; i++) {
				let handler = handlers[i];
				if (handler.isOnce)
					removeArray.push(handler);
				let val = handler.call(this, eventInfo);
				if (typeof val === "boolean" && !val)
					return false;
			}
			for (let i = 0; i < removeArray.length; i++) {
				this.off(eventName, removeArray[i]);
			}
			return true;
		}
	}

	export const event: EventObject = new EventObject();


	function cloneInternal(obj: any, excludeProperties: any) {
		if (obj === null)
			return null;
		else if (typeof obj === UNDEFINED)
			return undefined;
		else if (obj instanceof Array) {
			let newArray: any[] = [];
			for (let idx in obj) {
				if (obj.hasOwnProperty(idx) && excludeProperties.indexOf(idx) < 0) {
					newArray.push(cloneInternal(obj[idx], excludeProperties));
				}
			}
			return newArray;
		} else if (typeof obj === "number")
			return obj;
		else if (typeof obj === "string")
			return obj;
		else if (typeof obj === "boolean")
			return obj;
		else if (typeof obj === "function")
			return obj;
		else {
			let newObj: any = {};
			for (let idx in obj) {
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
	export function clone(obj: any, excludeProperties?: any) {
		if (typeof excludeProperties === "string" && $.trim(excludeProperties).length > 0) {
			return cloneInternal(obj, [excludeProperties]);
		} else if (excludeProperties instanceof Array) {
			return cloneInternal(obj, excludeProperties);
		} else
			return JSON.parse(JSON.stringify(obj));
	}

	/**
	 * Get IE version
	 * @return {Number}
	 */
	export var ieVer = (() => {
		var rv = -1; // Return value assumes failure.
		if (navigator.appName === "Microsoft Internet Explorer" ||
			navigator.appName === "Netscape") {
			let ua = navigator.userAgent;
			let re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) !== null)
				rv = parseFloat(RegExp.$1);
		}
		if (rv === -1 && navigator.appName === "Netscape") {
			let ua = navigator.userAgent;
			let re = new RegExp("Trident/([0-9]{1,}[\.0-9]{0,})");
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
	export var ffVer = (() => {
		var rv = -1; // Return value assumes failure.
		if (navigator.appName === "Netscape") {
			let ua = navigator.userAgent;
			let re = new RegExp("Firefox/([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) !== null)
				rv = parseFloat(RegExp.$1);
		}
		return rv;
	})();


}
