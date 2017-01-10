/// <reference path="../core.ts" />
/// <reference path="../text/text.ts" />
/// <reference path="../ajax/ajax.ts" />
/// <reference path="../service/service.ts" />
/// <reference path="mask.ts" />
module tui.widget {
	"use strict";

	function parseValue(value: string): any {
		if (value === null || value.length === 0)
			return null;
		if (/^\{(.|\r|\n)+\}$/m.test(value)) {
			value = value.substring(1, value.length - 1);
			try {
				return eval("(" + value + ")");
			} catch(e) {
				console && console.error("Bad attribute: " + e);
				return null;
			}
		} else
			return value;
	}
	
	export interface  PropertyControl {
		get?(): any;
		set?(value: any): void;
	}

	export abstract class WidgetBase extends EventObject {
		protected _data: { [index: string]: any } = undefined;
		protected _rs: { [index: string]: PropertyControl } = {};
		abstract getComponent(name?: string): HTMLElement;
		abstract render(): void;
		
		//restrict
		protected setRestriction(key: string, propCtrl: PropertyControl): void {
			if (propCtrl === null)
				delete this._rs[key];
			else
				this._rs[key] = propCtrl;
		}
		
		protected setRestrictions(restrictions: {[index:string]: PropertyControl}) {
			for (var key in restrictions) {
				this.setRestriction(key, restrictions[key]);
			}
		}
		
		refresh(): WidgetBase {
			if (this.get("autoRefresh") === true) {
				this.render();
			} 
			return this;
		}
		
		protected load() {
			if (typeof this._data !== UNDEFINED) {
				return;
			}
			this._data = {};
			var elem: HTMLElement = this.getComponent();
			if (elem != null) {
				var dataStr = elem.getAttribute("props");
				try {
					let tmpData = eval("(" + dataStr + ")"); 
					if (tmpData instanceof Object) {
						for (let key in tmpData) {
							if (tmpData.hasOwnProperty(key)) {
								this._set(key, tmpData[key]);
							}
						}
					}
				} catch (e) {
					console && console.error("Bad props: " + e);
				}
				var names: string[] = [];
				for (let i = 0; i < elem.attributes.length; i++) {
					let attr = elem.attributes[i];
					if (/^(style|class|tooltip|follow-tooltip|__widget__|jquery[\d]+)$/.test(attr.name.toLowerCase()))
						continue;
					let v = parseValue(attr.value);
					if (v !== null)
						this._set(text.toCamel(attr.name), v);
					if (!/^(id|name)$/i.test(attr.name.toLowerCase()))
						names.push(attr.name);
				}
				for (let name of names) {
					elem.attributes.removeNamedItem(name);
					if (/^(onclick|onmousedown|onmouseup|onmousemove|ondblclick|onkeydown|onkeyup|onkeypress)$/i.test(name))
						(<any>elem)[name.toLowerCase()] = null; 
				}
			}
		}

		get(key?: string, defaultValue?:any): any {
			var value: any; 
			if (typeof key === UNDEFINED || key === null) {
				value = this._data;
			} else if (typeof key === "string") {
				if (this._rs[key] && typeof this._rs[key].get === "function") {
					value = this._rs[key].get(); 
				} else {
					if (typeof this._data === "object")
						value = this._data[key];
					else
						value = null;
				}
			}
			if (typeof value === UNDEFINED)
				value = null;
			if (value === null && typeof defaultValue !== UNDEFINED)
				return defaultValue;
			else
				return value;
		}

		set(data: any): WidgetBase;
		set(key: string, value: any): WidgetBase;
		set(p1: any, p2?: any): WidgetBase {
			this._set(p1, p2);
			this.refresh();
			return this;
		}
		
		_set(data: any): WidgetBase;
		_set(key: string, value: any): WidgetBase;
		_set(p1: any, p2?: any): WidgetBase {
			if (typeof p2 === UNDEFINED && p1 instanceof Object) {
				for (let key in p1) {
					if (p1.hasOwnProperty(key))
						this._set(key, p1[key]);
				}
			} else if (typeof p1 === "string" && typeof p2 !== UNDEFINED) {
				if (this._rs[p1] && typeof this._rs[p1].set === "function") {
					this._rs[p1].set(p2);
				} else {
					if (p2 === null) {
						this._data && delete this._data[p1];
					} else { 
						if (typeof this._data === "object")
							this._data[p1] = p2;
					}
				}
			}
			return this;
		}
		
		/**
		 * Only non-existing property will be set, 
		 * this method usually be called in init() method and will not cause the object redraw.
		 */
		setInit(data: any): WidgetBase;
		setInit(key: string, value: any): WidgetBase;
		setInit(p1: any, p2?: any): WidgetBase {
			if (typeof p2 === UNDEFINED) {
				if (p1 instanceof Object) {
					for (let key in p1) {
						if (p1.hasOwnProperty(key) && this.get(key) === null)
							this._set(key, p1[key]);
					}
				}
			} else {
				if (this.get(p1) === null)
					this._set(p1, p2);
			}
			return this;
		}
	} // End of class WidgetBase
	
	var namedWidgets:{ [index: string]: Widget } = {};

	export abstract class Widget extends WidgetBase {

		private _lastWidth: number = null;
		private _lastHeight: number = null;
		protected _components: { [index: string]: HTMLElement } = {};
		_: HTMLElement;

		protected init(): void {};
		
		appendTo(parent: HTMLElement, refresh?: boolean): Widget
		appendTo(parent: any, refresh: boolean = true): Widget {
			if (typeof parent === "string") {
				parent = document.getElementById(parent);
			} 
			if (parent && typeof parent === "object" && parent.appendChild) {
				(<HTMLElement>parent).appendChild(this._);
				refresh && this.set("autoRefresh", true);				
			}
			return this;
		}
		
		detach() {
			browser.removeNode(this._);
		}
		
		protected initChildren(childNodes: Node[]): void {
			// Default do nothing ...
		}
		
		protected initRestriction(): void {
			this.setRestrictions({
				"id": {
					"set": (value: any) => {
						var oldId = this._.getAttribute("id");
						if (oldId) {
							delete namedWidgets[oldId];
						}
						if (typeof value === "string" && value.length > 0) {
							namedWidgets[value] = this;
							this._.setAttribute("id", value);
						} else
							this._.removeAttribute("id");
					}, 
					"get": () => {
						return this._.getAttribute("id");
					}	
				},
				"name": {
					"set": (value: any) => {
						if (typeof value === "string" && value.length > 0) {
							this._.setAttribute("name", value);
						} else
							this._.removeAttribute("name");
					}, 
					"get": () => {
						return this._.getAttribute("name");
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
				"disable": {
					"get": (): any => {
						let v = this._data["disable"];
						if (v === null || typeof v === tui.UNDEFINED) {
							let parent = this.get("parent");
							if (parent)
								v = parent.get("disable");
							return v === null ? false : !!v; 
						} else
							return v;
					}
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
				},
				"tooltip": {
					"set": (value: any) => {
						if (value)
							this._.setAttribute("tooltip", value);
						else
							this._.removeAttribute("tooltip");
					},
					"get": (): any => {
						return this._.getAttribute("tooltip");
					}
				},
				"follow-tooltip": {
					"set": (value: any) => {
						if (value)
							this._.setAttribute("follow-tooltip", value);
						else
							this._.removeAttribute("follow-tooltip");
					},
					"get": (): any => {
						return this._.getAttribute("follow-tooltip");
					}
				}
			});
		}
		
		testResize() {
			if (!browser.isInDoc(this._))
				return;
			if (this._.offsetWidth != this._lastWidth) {
				this._lastWidth = this._.offsetWidth;
				this.fire("resize");
			} else if (this._.offsetHeight != this._lastHeight) {
				this._lastHeight = this._.offsetHeight;
				this.fire("resize");
			}
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

		focus() {
			this._.focus();
		}

		constructor(root: HTMLElement, initParam?: { [index: string]: any }) {
			super();

			if (getFullName(root) !== "tui:" + this.getNodeName()) {
				throw new TypeError("Node type unmatched!");
			}
			this._components[''] = root;
			this._ = root;
			(<any>root).__widget__ = this;
			
			this.initRestriction(); // install restrictor
			this.load(); // load initial properties
			
			// Obtain all child nodes
			var childNodes: Node[] = [];
			for (let i = 0; i < root.childNodes.length; i++) {
				let node = root.childNodes[i];
				childNodes.push(node);
			}
			for (let removeNode of childNodes) {
				browser.removeNode(removeNode);
			}
			this.initChildren(childNodes);
			if (typeof initParam !== UNDEFINED) {
				this._set(initParam);
			}
			this.init();
			// Any widget which has ID property will be registered in namedWidgets
			let id = this.get("id"); 
			if (typeof id === "string" && id.length > 0)
				namedWidgets[id] = this;
		}

	} // End of class Widget
	
	
	/**
	 * Any config element can extends from this class.
	 */
	export class Item extends WidgetBase {
		_: HTMLElement;
		constructor(root: HTMLElement) {
			super();
			this._ = root;
			this.load();
		}
		getComponent(name?: string): HTMLElement {
			if (arguments.length > 0) {
				return null;
			} else {
				return this._;
			}
		}
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

	export function get(id: any): Widget {
		if (typeof id === "object" && id.nodeName) {
			if (id.__widget__)
				return id.__widget__;
			else
				return null;
		}
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
	
	(<any>window)["$$"] = get;

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
	
	(<any>window)["$new"] = create;

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
			// try {
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
			// } catch (e) {
			// 	if (console) console.error(e.message);
			// }
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

	// Detecting which widgets was resied.
	var resizeRegistration: string[] = [];

	export function registerResize(constructor: { new (elem: HTMLElement, initParam?: { [index: string]: any }): any; }) {
		resizeRegistration.push("tui:" + text.toDashSplit(getClassName(constructor)));
	}
	
	var detectResize: () => void;
	$(window.document).ready(function() {
		service.ready(function(){
			init(document.body);
			tui.event.fire("initialized");
		});
		if (typeof (<any>document.body).scopeName === "string") {
			detectResize = function(){
				for (var i = 0; i < resizeRegistration.length; i++) {
					let nodes = document.getElementsByTagName(resizeRegistration[i].substr(4));
					for (let j = 0; j < nodes.length; j++) {
						var node: any = nodes[j];
						if (node.scopeName.toUpperCase() === "TUI" && node.__widget__) {
							(<Widget>node.__widget__).testResize();
						}
					}
				}
				requestAnimationFrame(detectResize);
			};
		} else {
			detectResize = function(){
				for (var i = 0; i < resizeRegistration.length; i++) {
					let nodes = document.getElementsByTagName(resizeRegistration[i]);
					for (let j = 0; j < nodes.length; j++) {
						var node: any = nodes[j];
						if (node.__widget__) {
							(<Widget>node.__widget__).testResize();
						}
					}
				}
				requestAnimationFrame(detectResize);
			};
		}
		requestAnimationFrame(detectResize);
	});
}

module tui {
	export var get = tui.widget.get;
	export var create = tui.widget.create;
	export var search = tui.widget.search;
}
