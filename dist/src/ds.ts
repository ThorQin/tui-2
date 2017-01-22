/// <reference path="core.ts" />

module tui.ds {
	"use strict";

	export interface Order {
		key: string;
		desc: boolean;
	}

	export interface Filter {
		key: string;
		value: string;
	}

	export interface DS {
		length(): number;
		get(index: number): any;
		setOrder(order: Order[]): void;
		getOrder(): Order[];
		setFilter(filter: Filter[]): void;
		getFilter(): Filter[];
	}
	
	export interface TreeDS extends DS {
		expand(index: number): void;
		collapse(index: number): void;
	}

	export abstract class DSBase extends EventObject {
		protected _finalData: any[] = null;
		protected _order: Order[] = null;
		protected _filter: Filter[] = null;

		setOrder(order: Order[]): void {
			this._order = order;
			this.build();
		}
		getOrder(): Order[] {
			return this._order;
		}
		setFilter(filter: Filter[]): void {
			this._filter = filter;
			this.build();
		}
		getFilter(): Filter[] {
			return this._filter;
		}
		protected abstract build(): void;
	}

	function filter(value: any, filter: Filter[]): boolean {
		if (filter) {
			for (let f of filter) {
				let v = value[f.key];
				if (v == null) {
					if (f.value == null)
						continue;
					else
						return false;
				}
				try {
					let regex = new RegExp(f.value);
					if (v.toString().match(regex) == null)
						return false;
				} catch (e) {
					if (v.indexOf(f.value) < 0)
						return false;
				}
			}
		} 
		return true;
	}

	function sort(data: any[], order: Order[], treeData: boolean) {
		if (order && order.length > 0) {
			data.sort((a: any, b: any): number => {
				for (let s of order) {
					let aVal = treeData ? a.item[s.key] : a[s.key];
					let bVal = treeData ? b.item[s.key] : b[s.key];
					if (aVal == bVal)
						continue;
					if (s.desc) {
						return aVal > bVal ? -1 : 1;
					} else
						return aVal < bVal ? -1 : 1;
				}
				return 0;
			});
		}
	}
	
	export class List extends DSBase implements DS {
		private _data: any[];

		constructor(data: any[], filter: Filter[] = null, order: Order[] = null) {
			super();
			this._data = data;
			this._filter = filter;
			this._order = order;
			this.build();
		}
		length(): number {
			if (this._finalData == null)
				return this._data.length;
			else
				return this._finalData.length;
		}
		get(index: number): any {
			if (this._finalData == null)
				return this._data[index];
			else
				return this._finalData[index];
		}
		
		protected build(): void {
			if (this._data == null) {
				this._finalData = null;
				return;
			}
			if ((this._filter == null || this._filter.length == 0) && 
				(this._order == null || this._order.length == 0))
				this._finalData = null;
			else {
				this._finalData = this._data.filter((value: any, index: number, array: any[]) => {
					return filter(value, this._filter);
				});
				sort(this._finalData, this._order, false);
			}
			this.fire("update", {"completely": true});
		}
	}
	
	interface CachePage {
		page: number;
		data: any[];
	}
	
	interface QueryResult {
		length: number; // total length
		begin: number;
		data: any[];
	}
	
	export class RemoteList extends DSBase implements DS {
		private _cache1: CachePage = null;
		private _cache2: CachePage = null;
		private _length: number = null;
		private _cacheSize: number;
		private _fillCache: number;
		
		constructor(cacheSize: number = 50, filter: Filter[] = null, order: Order[] = null) {
			super();
			this._cacheSize = cacheSize;
			this.reset();
			this._filter = filter;
			this._order = order;
		}

		length(): number {
			if (this._length === null) {
				this.fire("query", { 
					begin: 0, 
					size: this._cacheSize, 
					filter: this._filter, 
					order: this._order
				});
				return 0;
			} else
				return this._length;
		}
		
		get(index: number): any {
			if (index >= 0 && index < this.length()) {
				var item = this.getFromCache(index, this._cache1);
				if (item === null)
					item = this.getFromCache(index, this._cache2);
				if (item === null) { // Data does not in cache pages, then pick a farest page to update new data.
					var page = this.getIndexPage(index);
					if (this._cache1 === null) {
						this._fillCache = 1;
					} else if (this._cache2 === null)
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
			} else
				return null;
		}
		
		private getIndexPage(index: number): number {
			return Math.ceil((index + 1) / this._cacheSize - 1);
		}
		
		private getFromCache(index: number, cache: CachePage): any {
			if (cache === null) return null;
			var begin = cache.page * this._cacheSize;
			var end = begin + cache.data.length;
			if (index >= begin && index < end)
				return cache.data[index - begin];
			else
				return null;
		}
		
		update(result: QueryResult) {
			var completely = this._length != result.length;
			this._length = result.length;
			if (this._fillCache === 1) {
				this._cache1 = {page: this.getIndexPage(result.begin), data: result.data};
			} else if (this._fillCache === 2) {
				this._cache2 = {page: this.getIndexPage(result.begin), data: result.data};
			}
			this.fire("update", {"completely": completely});
		}
		
		reset() {
			this._length = null;
			this._cache1 = this._cache2 = null;
			this._fillCache = 1;
		}

		protected build(): void {
			this.reset();
			this.fire("query", { 
				begin: 0, 
				size: this._cacheSize, 
				filter: this._filter, 
				order: this._order
			});
		}
	} // End of RemoteListSource
	
	export interface TreeNode {
		parent: TreeNode;
		hasChild: boolean; // whether has child nodes
		item: any;
		level: number;
		expand: boolean;
	}
	
	export interface TreeConfig {
		children: string;
		expand: string;
		hasChild?: string;
	}
	
	export abstract class TreeBase extends DSBase implements TreeDS {
		protected _config: TreeConfig;
		protected _index: TreeNode[] = null;
		protected _rawData: any[] = null;
		
		getConfig() {
			return this._config;
		}

		length(): number {
			if (this._finalData)
				return this._finalData.length;
			else if (this._index)
				return this._index.length;
			else
				return 0;
		}
		
		getRawData(): any[] {
			return this._rawData;
		}
		
		get(index: number): TreeNode {
			if (this._finalData) {
				if (index >= 0 && index < this._finalData.length)
					return this._finalData[index];
				else
					return null;
			} else if (index >= 0 && index < this.length()) {
				return this._index[index];
			} else
				return null;
		}
		
		protected findNodeIndex(node: TreeNode): number {
			for (var i = 0; i < this._index.length; i++) {
				if (this._index[i] === node)
					return i;
			}
			return -1;
		}
		
		protected expandItems(parent: TreeNode, items: any[], index: TreeNode[], level: number, init: boolean = false) {
			if (typeof items === tui.UNDEFINED || items === null)
				items = [];
			for (let item of items) {
				let children = item[this._config.children];
				let expand: boolean;
				if (init) {
					expand = false;
					item[this._config.expand] = false;
				} else
					expand = item[this._config.expand] && children && children.length > 0;
				let hasChild: boolean;
				if (children && children.length > 0)
					hasChild = true;
				else
					hasChild = !!item[this._config.hasChild];
				let node: TreeNode = {
					parent: parent,
					hasChild: hasChild,
					item: item,
					level: level,
					expand: expand
				}
				index && index.push(node);
				if (expand) {
					this.expandItems(node, children, index, level + 1);
				}
			}
		}
		
		protected getExpandCount(children: any[]): number {
			if (!children)
				return 0;
			var delCount = children.length;
			for (var child of children) {
				if (child.children && child.children.length > 0 && child[this._config.expand]) {
					delCount += this.getExpandCount(child.children);
				}
			}
			return delCount;
		}
 		
		expand(index: number): void {
			if (index >= 0 && index < this._index.length) {
				var node = this._index[index];
				if ( node.hasChild && !node.expand) {
					node.expand = true;
					node.item[this._config.expand] = true;
					var appendNodes: TreeNode[] = [];
					this.expandItems(node, node.item[this._config.children], appendNodes, node.level + 1);
					this._index.splice(index + 1, 0, ...appendNodes);
				}
			}
		}
		
		collapse(index: number): void {
			if (index >= 0 && index < this._index.length) {
				var node = this._index[index];
				if ( node.hasChild && node.expand) {
					node.expand = false;
					node.item[this._config.expand] = false;
					var delCount = this.getExpandCount(node.item[this._config.children]);
					this._index.splice(index + 1, delCount);
				}
			}
		}
	}
	
	export class Tree extends TreeBase {
		constructor(data: any[], 
			config: TreeConfig = {children: "children", expand: "expand"},
			filter: Filter[] = null, order: Order[] = null) {
			super();
			this._config = config;
			this._filter = filter;
			this._order = order;
			this.update(data);
		}
		
		update(data: any[]) {
			var config = this._config;
			this._index = [];
			this._rawData = data;
			this.expandItems(null, data, this._index, 0);
			this.build();
		}

		protected build(): void {
			if (this._rawData == null) {
				this._finalData = null;
				return;
			}
			if ((this._filter == null || this._filter.length == 0) && 
				(this._order == null || this._order.length == 0))
				this._finalData = null;
			else {
				this._finalData = [];
				let iterate = (items: any[]) => {
					if (typeof items === tui.UNDEFINED || items === null)
						items = [];
					for (let item of items) {
						if (filter(item, this._filter)) {
							let node: TreeNode = {
								parent: null,
								hasChild: false,
								item: item,
								level: 0,
								expand: false
							}
							this._finalData.push(node);
						}
						let children = item[this._config.children];
						children && iterate(children);
					}
				};
				iterate(this._rawData);
				sort(this._finalData, this._order, true);
			}
			this.fire("update", {"completely": true});
		}
	}
	
	interface TreeQueryResult {
		parent: TreeNode;
		data: any[];
	}
	
	export class RemoteTree extends TreeBase  {
		
		private _querying: boolean = false;
		
		constructor(config: TreeConfig = {children: "children", expand: "expand", hasChild: "hasChild"},
			filter: Filter[] = null, order: Order[] = null) {
			super();
			this._config = config;
			this._filter = filter;
			this._order = order;
		}
		
		length(): number {
			if (this._index)
				return this._index.length;
			else {
				if (!this._querying) {
					this._querying = true;
					this.fire("query", {parent: null, filter: this._filter, order: this._order});
				}
				return 0;
			}
		}
 		
		expand(index: number): void {
			if (index >= 0 && index < this._index.length) {
				var node = this._index[index];
				if ( node.hasChild && !node.expand) {
					node.expand = true;
					node.item[this._config.expand] = true;
					var children = node.item[this._config.children];
					if (children) {
						var appendNodes: TreeNode[] = [];
						this.expandItems(node, children, appendNodes, node.level + 1);
						this._index.splice(index + 1, 0, ...appendNodes);
					} else {
						this.fire("query", {parent: node, filter: this._filter, order: this._order});
						this._querying = true;
					}
				}
			}
		}
		
		update(result: TreeQueryResult) {
			this._querying = false;
			if (result.parent === null) {
				this._index = [];
				this._rawData = result.data;
				this.expandItems(null, result.data, this._index, 0, true);
			} else {
				var index = this.findNodeIndex(result.parent);
				if (index >= 0) {
					this.collapse(index);
				}
				result.parent.item[this._config.children] = result.data;
				if (index >= 0) {
					this.expand(index);
				}
			}
			this.fire("update", {"completely": true});
		}

		protected build(): void {
			this._index = null;
			this._rawData = null;
			this._finalData = null;
			this.fire("query", {parent: null, filter: this._filter, order: this._order});
		}
	}
}

