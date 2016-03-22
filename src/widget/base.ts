/// <reference path="../core.ts" />
module tui.widget {
	"use strict";

	

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
		get?(): any;
		set?(value: any): void;
	}

	export abstract class WidgetBase extends EventObject {
		protected _data: { [index: string]: any } = undefined;
		abstract getComponent(name?: string): HTMLElement;
		abstract render(): void;
		
		/**
		 * If went to control properties set & get behavior then override this method
		 */
		getPropertyControls(): { [index: string]: PropertyControl } {
			return {};
		}
		
		refresh(): WidgetBase {
			if (this.get("autoRefresh") === true) {
				this.render();
			} 
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
				if (propertyControls[key] && typeof propertyControls[key].get === "function") {
					return propertyControls[key].get();
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
				if (propertyControls[p1] && typeof propertyControls[p1].set === "function") {
					propertyControls[p1].set(p2);
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
	} // End of class WidgetBase
	
	var namedWidgets:{ [index: string]: Widget } = {};

	export abstract class Widget extends WidgetBase {

		private _components: { [index: string]: HTMLElement } = {};
		_: HTMLElement;
		
		abstract init(): void;
		
		appendTo(parent: HTMLElement): Widget
		appendTo(parent: any): Widget {
			if (typeof parent === "string") {
				parent = document.getElementById(parent);
			} 
			if (parent && typeof parent === "object" && parent.appendChild) {
				(<HTMLElement>parent).appendChild(this._);
				this.set("autoRefresh", true);				
			}
			return this;
		}
		
		detach() {
			browser.removeNode(this._);
		}
		
		setChildNodes(childNodes: Node[]): void {
			// Default do nothing ...
		}
		
		getPropertyControls(): { [index: string]: PropertyControl } {
			return {
				"id": {
					"set": (value: any) => {
						if (this._data["id"]) {
							delete namedWidgets[this._data["id"]];
						}
						if (typeof value === "string" && value.length > 0) {
							namedWidgets[value] = this;
							this._data["id"] = value;
						} else
							delete this._data["id"];
					}	
				},
				"parent": {
					"get": (): any => {
						let elem = this._.parentNode;
						while (elem) {
							if ((<any>elem).__widget__) {
								return (<any>elem).__widget__;
							} else {
								elem = elem.parentNode;
							}
						}
						return null;
					},
					"set": (value: any) => {}
				}, 
				"group": {
					"get": (): any => {
						if (this.get("inner") === true) // inner component cannot belong to a group
							return null;
						if (this._data["group"])
							return this._data["group"];
						let parent = this.get("parent");
						if (parent && parent instanceof Group && parent.get("name"))
							return parent.get("name");
						return null;
					}
				}
			};
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
			this._ = root;
			(<any>root).__widget__ = this;
			
			// Obtain all child nodes
			var childNodes: Node[] = [];
			var script: string = "";
			var removed: Node[] = [];
			for (let i = 0; i < root.childNodes.length; i++) {
				let node = root.childNodes[i];
				removed.push(node);
				if (getFullName(node) === "tui:init") {
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
				// Will not cause refresh, because initialization is not finished yet.
				var fn: Function = eval("(0,function(){\n" + script + "})");
				fn.call(this);
			}
			// Any widget which has ID property will be registered in namedWidgets
			let id = this.get("id"); 
			if (typeof id === "string" && id.length > 0)
				namedWidgets[id] = this;
		}

	} // End of class Widget
	
	
	/**
	 * Any config element can extends from this class.
	 */
	export class Item extends Widget {
		setChildNodes(childNodes: Node[]): void {
			for (let node of childNodes)
				this._.appendChild(node);
		}
		init(): void {}
		render(): void {}
	}  // End of ConfigNode
	
	
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
	
	(<any>window)["get$"] = get;

	export function create(type: Function, initParam?: { [index: string]: any }): Widget;
	export function create(type: string, initParam?: { [index: string]: any }): Widget;
	export function create(type: any, initParam?: { [index: string]: any }): Widget {
		if (typeof type === "function") {
			type = text.toDashSplit(getClassName(type));
		} else if (typeof type !== "string")
			throw new TypeError("Invalid parameters.");
		var constructor = widgetRegistration["tui:" + type.toLowerCase()];
		if (typeof constructor !== "function")
			throw new Error("Undefined type: " + type);
		var element = document.createElement("tui:" + type);
		var obj: Widget;
		if (typeof initParam !== UNDEFINED)
			obj = new constructor(element, initParam);
		else 
			obj = new constructor(element);
		obj.set("autoRefresh", true);
		return obj;
	}
	
	(<any>window)["new$"] = create;

	export function getClassName(func: Function): string {
		var results = /function\s+([^\s]+)\s*\(/.exec(func.toString());
		return (results && results.length > 1) ? results[1] : "";
	}

	export function getFullName(targetElem: any): string {
		if (targetElem.scopeName && targetElem.scopeName.toLowerCase() === "tui") {
			if (targetElem.nodeName.toLowerCase().match("^" + targetElem.scopeName + ":") !== null)
				return targetElem.nodeName.toLowerCase();
			else
				return targetElem.scopeName + ":" + targetElem.nodeName.toLowerCase();
		} else {
			return targetElem.nodeName.toLowerCase();
		}
	}
	
	export function init(parent: HTMLElement, initFunc?: (widget: Widget) => boolean) {
		var initSet: any[][] = [];
		function searchInitCtrls(parent: HTMLElement) {
			for (let i = 0; i < parent.childNodes.length; i++) {
				let node: Node = parent.childNodes[i];
				if (node.nodeType === 1) { // Element Node
					let elem = <HTMLElement>node;
					let constructor = widgetRegistration[getFullName(elem)];
					if (constructor) {
						let item = [elem, constructor];
						initSet.push(item);
					} else
						searchInitCtrls(elem);
				}
			}
		}
		searchInitCtrls(parent);
		for (let item of initSet) {
			let elem = item[0];
			let constructor = item[1];
			try {
				if (!(<any>elem).__widget__) {
					let widget: Widget = new constructor(elem);
					if (typeof initFunc === "function") {
						if (initFunc(widget))
							widget.set("autoRefresh", true);
					} else
						widget.set("autoRefresh", true);
				} else {
					let widget: Widget = (<any>elem).__widget__;
					widget.refresh();
				}
			} catch (e) {
				if (console) console.error(e.message);
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
				} else
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