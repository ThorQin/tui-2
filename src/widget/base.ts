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

	export interface Rect extends Position, Size {}
	
	export class Data {
		protected _data: { [index: string]: any } = undefined;
		private owner: WidgetBase;
		constructor(owner: WidgetBase) {
			this.owner = owner;
		}
		private load() {
			if (typeof this._data !== UNDEFINED) {
				return;
			}
			var elem: HTMLElement = this.owner.getRoot();
			if (elem != null) {
				var dataStr = elem.getAttribute("data");
				this._data = eval("(" + dataStr + ")");
			} else
				this._data = {};
		}
	
		get(key?: string): any {
			this.load();
			if (typeof key === UNDEFINED || key === null) {
				return this._data;
			} else {
				return this._data[key];
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
	
	export abstract class WidgetBase extends EventObject {
		
		public autoRefresh: boolean = false;
		public data: Data = new Data(this);
		
		private _root: HTMLElement;
		
		// Any widgets should implement following methods
		
		abstract getComponent(name: string): any;
		abstract getNodeName(): string;
		abstract render(): void;
		
		refresh(): WidgetBase {
			this.autoRefresh && this.render();
			return this;
		}
		
		constructor(root: HTMLElement) {
			super();
			this._root = root;
			this.autoRefresh = true;
		}
		
		getRoot(): HTMLElement {
			 return this._root;
		}
		
		getParent(): HTMLElement {
			return this.data.get("parent");
		}
		
		getRect(): Rect {
			var elem = this.getRoot();
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
			var elem = this.getRoot();
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
			var elem = this.getRoot();
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
	
	var widgetRegistration: { [index: string]: { new (elem?: HTMLElement): any; } }  = {};
	
	export function register(type: string, constructor: { new (elem?: HTMLElement): any; }) {
		widgetRegistration["tui:" + type.toLowerCase()] = constructor;
	}
	
	export function get(id: string): WidgetBase {
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
			if (node.nodeType === Node.ELEMENT_NODE) {
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
	
	$(window.document).ready(function () {
		init(document.body);
		tui.event.fire("initialized");
	});
}