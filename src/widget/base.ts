/// <reference path="../core.ts" />
module tui.widget {
	"use strict";

	export interface Size {
		width: number;
		height: number;
	}

	export interface Position {
		left: number;
		top: number;
	}

	export interface Rect extends Position, Size { }

	function parseValue(value: string): any {
		if (value === null || value.length === 0)
			return null;
		if (/^\{.+\}$/.test(value)) {
			value = value.substring(1, value.length - 1);
			return eval("(" + value + ")");
		} else
			return value;
	}

	export class Data {
		protected _data: { [index: string]: any } = undefined;
		private owner: Widget;
		constructor(owner: Widget) {
			this.owner = owner;
		}
		private load() {
			if (typeof this._data !== UNDEFINED) {
				return;
			}
			var elem: HTMLElement = this.owner.getComponent();
			if (elem != null) {
				var dataStr = elem.getAttribute("data");
				this._data = eval("(" + dataStr + ")");
				if (!(this._data instanceof Object))
					this._data = {};
				for (let i = 0; i < elem.attributes.length; i++) {
					let attr = elem.attributes[i];
					let v = parseValue(attr.value);
					if (v !== null)
						this._data[attr.name] = v;
				}
			} else
				this._data = {};
		}

		get(key?: string): any {
			this.load();
			if (typeof key === UNDEFINED || key === null) {
				return this._data;
			} else {
				var value = this._data[key];
				return (typeof value === UNDEFINED ? null : value);
			}
		}

		set(data: any): Data;
		set(key: string, value: any): Data;
		set(p1: any, p2?: any): Data {
			this.load();
			if (typeof p2 === UNDEFINED) {
				if (p1 instanceof Object) {
					for (let key in p1) {
						if (p1.hasOwnProperty(key))
							this._data[key] = p1[key];
					}
				}
			} else {
				this._data[p1] = p2;
			}
			this.owner.refresh();
			return this;
		}

		setForce(data: any): Data;
		setForce(key: string, value: any): Data;
		setForce(p1: any, p2?: any): Data {
			let refresh = this.owner.autoRefresh;
			this.owner.autoRefresh = false;
			this.clear();
			this.owner.autoRefresh = refresh;
			return this.set(p1, p2);
		}
		
		/**
		 * Only non-existing property will be set
		 */
		init(data: any): Data;
		init(key: string, value: any): Data;
		init(p1: any, p2?: any): Data {
			if (typeof p2 === UNDEFINED) {
				this.load();
				if (p1 instanceof Object) {
					for (var key in p1) {
						if (p1.hasOwnProperty(key) && !this._data.hasOwnProperty(key))
							this._data[key] = p1[key];
					}
				}
			} else {
				if (!this.has(key))
					this._data[p1] = p2;
			}
			this.owner.refresh();
			return this;
		}

		remove(key: string): Data {
			if (this.has(key))
				delete this._data[key];
			this.owner.refresh();
			return this;
		}

		clear(): Data {
			this._data = {};
			this.owner.refresh();
			return this;
		}

		has(key: string): boolean {
			this.load();
			return this._data.hasOwnProperty(key);
		}
	}

	export abstract class Widget extends EventObject {

		public autoRefresh: boolean = false;
		public data: Data = new Data(this);

		private _components: { [index: string]: HTMLElement } = {};
		
		// Any widgets should implement following methods
		
		abstract init(): void;
		abstract render(): void;

		setChildNodes(childNodes: Node[]): void { }

		getComponent(name?: string): HTMLElement {
			if (arguments.length > 0) {
				return this._components[name];
			} else {
				return this._components[''];
			}
		}
		
		getNodeName(): string {
			return text.toDashSplit(getClassName(this.constructor));
		}

		refresh(): Widget {
			this.autoRefresh && this.render();
			return this;
		}

		constructor(root?: HTMLElement) {
			super();
			if (root !== null && typeof root === "object" && root.nodeName)
				this._components[''] = root;
			else {
				root = document.createElement(this.getNodeName());
				this._components[''] = root;
			}
			(<any>root).__widget__ = this;
			
			// Obtain all child nodes
			var childNodes: Node[] = [];
			var script: string = "";
			var removed: Node[] = [];
			for (let i = 0; i < root.childNodes.length; i++) {
				let node = root.childNodes[i];
				removed.push(node);
				if (getFullName(node) === "tui:script") {
					script += (browser.getNodeText(node) + "\n");
				} else
					childNodes.push(node);
			}
			for (let removeNode of removed) {
				browser.removeNode(removeNode);
			}
			this.init();
			this.setChildNodes(childNodes);
			if (script.length > 0) {
				var fn: Function = eval("(0,function(){\n" + script + "})");
				fn.call(this);
			}
			this.render();
			this.autoRefresh = true;
		}

		getRectOffset(): Rect {
			var elem = this.getComponent();
			if (elem === null)
				return null;
			return {
				left: elem.offsetLeft,
				top: elem.offsetTop,
				width: elem.offsetWidth,
				height: elem.offsetHeight
			};
		}

		getRectOfPage(): Rect {
			var elem = this.getComponent();
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

		getRectOfScreen(): Rect {
			var elem = this.getComponent();
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


	} // End of class WidgetBase
	
	var widgetRegistration: { [index: string]: { new (elem?: HTMLElement): any; } } = {};

	export function register(constructor: { new (elem?: HTMLElement): any; }, type?: string) {
		if (typeof type === "string")
			widgetRegistration["tui:" + type.toLowerCase()] = constructor;
		else {
			widgetRegistration["tui:" + text.toDashSplit(getClassName(constructor))] = constructor;
		}
	}

	export function get(id: string): Widget {
		var elem: any = document.getElementById(id);
		if (elem === null)
			return null;
		if (elem.__widget__)
			return elem.__widget__;
		else
			return null;
	}

	export function create<T>(type: string): T {
		return new widgetRegistration["tui:" + type.toLowerCase()]();
	}

	export function getClassName(func: Function): string {
		var results = /function\s+([^\s]+)\s*\(/.exec(func.toString());
		return (results && results.length > 1) ? results[1] : "";
	}

	function getFullName(targetElem: any): string {
		if (targetElem.scopeName && targetElem.scopeName.toLowerCase() === "tui") {
			return targetElem.scopeName + ":" + targetElem.nodeName.toLowerCase();
		} else {
			return targetElem.nodeName.toLowerCase();
		}
	}

	export function init(parent: HTMLElement) {
		for (let i = 0; i < parent.childNodes.length; i++) {
			let node: Node = parent.childNodes[i];
			if (node.nodeType === 1) { // Element Node
				let elem = <HTMLElement>node;
				let constructor = widgetRegistration[getFullName(elem)];
				if (constructor) {
					if (!(<any>elem).__widget__) {
						new constructor(elem);
					}
				} else
					init(elem);
			}
		}
	}

	$(window.document).ready(function() {
		init(document.body);
		tui.event.fire("initialized");
	});
}