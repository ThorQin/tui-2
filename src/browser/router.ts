/// <reference path="../core.ts" />
/// <reference path="browser.ts" />
module tui.browser {
	"use strict";

	export interface RouterHandler {
		(state: string, hash: string, url?: string): boolean;
	}

	export interface RouterRule {
		state: string;
		url?: string;
		handler?: RouterHandler;
	}

	var _rules: RouterRule[];
	var _handler: RouterHandler;

	function hashChange() {
		var hash = location.hash;
		var state: string = null;
		if (hash) {
			var p = hash.indexOf("?");
			if (p >= 0)
				state = hash.substring(1, p);
			else
				state = hash.substring(1);
		}
		if (_rules) {
			let matchRule: RouterRule = null;
			for (let r of _rules) {
				if (r.state === state) {
					matchRule = r;
					break;
				}
			}
			if (matchRule == null) {
				for (let r of _rules) {
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

	export function startRouter(rules: RouterRule[], handler: RouterHandler) {
		_rules = rules;
		_handler = handler;
		$(window).on("hashchange", hashChange);
		tui.event.on("initialized", function(){
			hashChange();
		});
		tui.service.register("router", function() {
			var stack: string[] = [];
			var this_ = this;
			this.push = function(state: string) {
				stack.push(state);
				location.href = "#" + state;
			};
			this.pop = function() {
				stack.pop();
				history.back();
			};
			this.goRoot = function(state: string) {
				var len = stack.length;
				stack.length = 0;
				history.go(-len);
				this_.push(state);
			};
			this.go = function(state: string) {
				location.replace("#" + state);
			};
		});
	}

	export function stopRouter() {
		$(window).off("hashchange", hashChange);
		tui.service.unregister("router");
	}
}
