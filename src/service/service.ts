/// <reference path="../core.ts" />
/// <reference path="../ajax/ajax.ts" />

module tui.service {
    "use strict";

	export function parseParameters(fn: Function, desc?: string) {
		var params = "";
		if (desc)
			params = desc + "";
		else {
			var matched = fn.toString().match(/^\s*function\s*[a-zA-Z0-9_]*\s*\(([\sa-zA-Z0-9,_\$]*)\)/);
			if (matched) {
				params = matched[1];
			} else {
				matched = fn.toString().match(/^\s*\(([\sa-zA-Z0-9,_\$]*)\)\s*=>/);
				if (matched)
					params = matched[1];
			}
		}
		return (params || "");
	}

	export class Service extends EventObject {
		_constructor: Function;

		use(fn: (...argv: any[]) => void, desc?: string): void {
			service.use.call(this, fn, desc);
		}
	}

	var _services: { [index: string]: Service} = {};
	var _serviceReady: boolean = true;
	var _readyCallbacks: Function[] = [];

	export function use(fn: (...argv: any[]) => void, desc?: string): void {
		if (typeof fn === "function") {
			var params = parseParameters(fn, desc);
			var argv = params.split(",").map((s) => {
				if (!s)
					return null;
				else if (s[0] === '$') {
					return tui.service.get(s.substr(1));
				} else {
					return null;
				}
			});
			fn.apply(this, argv);
		}
	}

	function getName(path: string): string {
		var begin = path.lastIndexOf("/");
		if (begin >= 0)
			path = path.substr(begin + 1);
		var end = path.lastIndexOf(".");
		if (end >= 0)
			path = path.substring(0, end);
		return text.toCamel(path.replace(/[\-\s\.\/]/g, "_"));
	}

	export function load(services: string[], names?: string[]): void {
		_serviceReady = false;
		var tasks: JQueryPromise<any>[] = [];
		for (var i = 0; i < services.length; i++) {
			var s = services[i];
			var name = names && names[i] || getName(s);
			tasks.push(ajax.getFunction(s, name));
		}
		$.when.apply(null, tasks).done(function(){
			for (var i = 0; i < arguments.length; i++) {
				var p: any = arguments[i];
				register(p[1], p[0]);
			}
			ready();
		}).fail(function(){
			_serviceReady = true;
		});
	}

	export function register(name: string, fn: Function): Service {
		var service = new Service();
		service._constructor = fn;
		_services[name] = service;
		return service;
	}

	export function unregister(name: string): void {
		delete _services[name];
	}

	export function ready() {
		for (let name in _services) {
			if (_services.hasOwnProperty(name)) {
				let service = _services[name];
				service._constructor.call(service);
			}
		}
		_serviceReady = true;
		for (let cb of _readyCallbacks) {
			cb();
		}
	}

	export function get(name: string): any {
		return _services[name];
	}

	export function onReady(fn: Function) {
		if (_serviceReady) {
			fn();
		} else {
			_readyCallbacks.push(fn);
		}
	}
}
