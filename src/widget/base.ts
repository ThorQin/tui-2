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
	
	export interface  PropertyControl {
		get(data: { [index: string]: any }): any;
		set(data: { [index: string]: any }, value: any): void;
	}

	export abstract class WidgetBase extends EventObject  {
		private _data: { [index: string]: any } = undefined;
		abstract getComponent(name?: string): HTMLElement;
		abstract render(): void;
		
		/**
		 * If went to control properties set & get behavior then override this method
		 */
		getPropertyControls(): { [index: string]: PropertyControl } {
			return {};
		}
		
		refresh(): WidgetBase {
			this.get("autoRefresh") === true && this.render();
			return this;
		}

		private load() {
			if (typeof this._data !== UNDEFINED) {
				return;
			}
			var elem: HTMLElement = this.getComponent();
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
			} else if (typeof key === "string") {
				let propertyControls = this.getPropertyControls();
				if (propertyControls[key]) {
					return propertyControls[key].get(this._data);
				} else {
					var value = this._data[key];
					return (typeof value === UNDEFINED ? null : value);
				}
			}
		}

		set(data: any): WidgetBase;
		set(key: string, value: any): WidgetBase;
		set(p1: any, p2?: any): WidgetBase {
			this.load();
			if (typeof p2 === UNDEFINED && p1 instanceof Object) {
				let refreshValue = this.get("autoRefresh");
				this.set("autoRefresh", false);
				for (let key in p1) {
					if (p1.hasOwnProperty(key) && key !== "autoRefresh")
						this.set(key, p1[key]);
				}
				this.set("autoRefresh", refreshValue);
			} else if (typeof p1 === "string" && typeof p2 !== UNDEFINED) {
				let propertyControls = this.getPropertyControls();
				if (propertyControls[p1]) {
					propertyControls[p1].set(this._data, p2);
				} else {
					if (p2 === null)
						delete this._data[p1];
					else 
						this._data[p1] = p2;
				}
			}
			this.refresh();
			return this;
		}
		
		/**
		 * Only non-existing property will be set
		 */
		setInit(data: any): WidgetBase;
		setInit(key: string, value: any): WidgetBase;
		setInit(p1: any, p2?: any): WidgetBase {
			if (typeof p2 === UNDEFINED) {
				if (p1 instanceof Object) {
					let refreshValue = this.get("autoRefresh");
					this.set("autoRefresh", false);
					for (var key in p1) {
						if (p1.hasOwnProperty(key) && this.get(key) === null && key !== "autoRefresh")
							this.set(key, p1[key]);
					}
					this.set("autoRefresh", refreshValue);
					this.refresh();
				}
			} else {
				if (this.get(key) === null)
					this.set(p1, p2);
			}
			return this;
		}
	}

	export abstract class Widget extends WidgetBase {

		private _components: { [index: string]: HTMLElement } = {};
		
		abstract init(): void;
		
		appendTo(parent: HTMLElement): Widget
		appendTo(parent: any): Widget {
			if (typeof parent === "string") {
				parent = document.getElementById(parent);
			} 
			if (parent && typeof parent === "object" && typeof parent.appendChild === "function") {
				(<HTMLElement>parent).appendChild(this.getComponent());
				this.set("autoRefresh", true);				
			}
			return this;
		}
		
		setChildNodes(childNodes: Node[]): void {
			// Default do nothing ...
		}
		
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

		constructor(root: HTMLElement, initParam?: { [index: string]: any }) {
			super();
			
			if (getFullName(root) !== "tui:" + this.getNodeName()) {
				throw new TypeError("Node type unmatched!");
			}
			this._components[''] = root;
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
			this.setChildNodes(childNodes);
			if (typeof initParam !== UNDEFINED) {
				this.setInit(initParam);
			}
			this.init();
			if (script.length > 0) {
				var fn: Function = eval("(0,function(){\n" + script + "})");
				fn.call(this);
			}
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
	
	var widgetRegistration: { [index: string]: { new (elem: HTMLElement, initParam?: { [index: string]: any }): any; } } = {};

	export function register(constructor: { new (elem: HTMLElement, initParam?: { [index: string]: any }): any; }, type?: string) {
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

	export function create<T>(type: Function, initParam?: { [index: string]: any }): T;
	export function create<T>(type: string, initParam?: { [index: string]: any }): T;
	export function create<T>(type: any, initParam?: { [index: string]: any }): T {
		if (typeof type === "function") {
			type = text.toDashSplit(getClassName(type));
		} else if (typeof type !== "string")
			throw new TypeError("Invalid parameters.");
		var constructor = widgetRegistration["tui:" + type.toLowerCase()];
		if (typeof constructor !== "function")
			throw new Error("Undefined type: " + type);
		var element = document.createElement("tui:" + type);
		if (typeof initParam !== UNDEFINED)
			return new constructor(element, initParam);
		else 
			return new constructor(element);
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
	
	export function init(parent: HTMLElement, initFunc?: (widget: Widget) => boolean) {
		for (let i = 0; i < parent.childNodes.length; i++) {
			let node: Node = parent.childNodes[i];
			if (node.nodeType === 1) { // Element Node
				let elem = <HTMLElement>node;
				let constructor = widgetRegistration[getFullName(elem)];
				if (constructor) {
					if (!(<any>elem).__widget__) {
						let widget: Widget = new constructor(elem);
						if (typeof initFunc === "function") {
							if (initFunc(widget))
								widget.set("autoRefresh", true);	
						} else
							 widget.set("autoRefresh", true);
					}
				} else
					init(elem, initFunc);
			}
		}
	}
	
	export function search(filter: (elem: Widget) => boolean): Widget[];
	export function search(searchArea: HTMLElement): Widget[];
	export function search(searchArea: HTMLElement, filter: (elem: Widget) => boolean): Widget[];
	export function search(p1?: any, p2?: any): Widget[] {
		var searchArea: HTMLElement = null;
		var filter: (elem: Widget) => boolean = null;
		if (typeof p2 === UNDEFINED) {
			if (typeof p1 === "function")
				filter = p1;
			else if (typeof p1 === "object" && p1.nodeName)
				searchArea = p1;
		} else if (typeof p2 === "function") {
			searchArea = p1;
			filter = p2;
		}
		
		var result: Widget[] = [];
		if (searchArea === null) {
			searchArea = document.body;
		}
		function searchElem(parent: HTMLElement) {
			for (let i = 0; i < parent.childNodes.length; i++) {
				let node: Node = parent.childNodes[i];
				if (node.nodeType !== 1) { // Is not an element
					continue;
				}
				let widget = (<any>node).__widget__; 
				if (widget && (filter && filter(widget) || filter === null)) {
					result.push(widget);
				}
				searchElem(<HTMLElement>node);
			}
		}
		searchElem(searchArea);
		return result;
	}

	$(window.document).ready(function() {
		init(document.body);
		tui.event.fire("initialized");
	});
}