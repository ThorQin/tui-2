/// <reference path="core.ts" />

module tui.ds {
	"use strict";

	export interface DS {
		length(): number;
		get(index: number): any;
	}
	
	export interface TreeDS extends DS {
		expand(index: number): void;
		contract(index: number): void;
	}
	
	export class List implements DS {
		private _data: any[];
		constructor(data: any[]) {
			this._data = data;
		}
		length(): number {
			return this._data.length;
		}
		get(index: number): any {
			return this._data[index];
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
	
	export class RemoteList extends EventObject implements DS {
		private _cache1: CachePage = null;
		private _cache2: CachePage = null;
		private _length: number = null;
		private _cacheSize: number;
		private _fillCache: number;
		
		constructor(cacheSize: number = 50) {
			super();
			this._cacheSize = cacheSize;
			this.reset();
		}

		length(): number {
			if (this._length === null) {
				this.fire("query", { begin: 0, size: this._cacheSize});
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
					this.fire("query", { begin: page * this._cacheSize, size: this._cacheSize});
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
	} // End of RemoteListSource
	
	interface TreeNode {
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
	
	abstract class TreeBase extends EventObject  implements TreeDS {
		protected _config: TreeConfig;
		protected _index: TreeNode[] = null;

		length(): number {
			if (this._index)
				return this._index.length;
			else
				return 0;
		}
		
		get(index: number): TreeNode {
			if (index >= 0 && index < this.length()) {
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
			for (var item of items) {
				var children = item[this._config.children];
				var expand: boolean;
				if (init) {
					expand = false;
					item[this._config.expand] = false;
				} else
					expand = item[this._config.expand] && children && children.length > 0;
				var hasChild: boolean;
				if (children && children.length > 0)
					hasChild = true;
				else
					hasChild = !!item[this._config.hasChild];
				var node: TreeNode = {
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
				if ( node.hasChild && !node.item[this._config.expand]) {
					node.item[this._config.expand] = true;
					var appendNodes: TreeNode[] = [];
					this.expandItems(node, node.item[this._config.children], appendNodes, node.level + 1);
					this._index.splice(index + 1, 0, ...appendNodes);
				}
			}
		}
		
		contract(index: number): void {
			if (index >= 0 && index < this._index.length) {
				var node = this._index[index];
				if ( node.hasChild && node.item[this._config.expand]) {
					node.item[this._config.expand] = false;
					var delCount = this.getExpandCount(node.item[this._config.children]);
					this._index.splice(index + 1, delCount);
				}
			}
		}
	}
	
	export class Tree extends TreeBase {
		constructor(data: any[], config: TreeConfig = {children: "children", expand: "expand"}) {
			super();
			this._config = config;
			this.update(data);
		}
		
		update(data: any[]) {
			var config = this._config;
			this._index = [];
			this.expandItems(null, data, this._index, 0);
		}
	}
	
	interface TreeQueryResult {
		parent: TreeNode;
		data: any[];
	}
	
	export class RemoteTree extends TreeBase  {
		
		constructor(config: TreeConfig = {children: "children", expand: "expand", hasChild: "hasChild"}) {
			super();
			this._config = config;
		}
		
		length(): number {
			if (this._index)
				return this._index.length;
			else {
				this.fire("query", {parent: null});
				return 0;
			}
		}
 		
		expand(index: number): void {
			if (index >= 0 && index < this._index.length) {
				var node = this._index[index];
				if ( node.hasChild && !node.item[this._config.expand]) {
					node.item[this._config.expand] = true;
					if (node.item[this._config.children] !== null) {
						var appendNodes: TreeNode[] = [];
						this.expandItems(node, node.item[this._config.children], appendNodes, node.level + 1);
						this._index.splice(index + 1, 0, ...appendNodes);
					} else {
						this.fire("query", {parent: node});
					}
				}
			}
		}
		
		update(result: TreeQueryResult) {
			if (result.parent === null) {
				this._index = [];
				this.expandItems(null, result.data, this._index, 0, true);
			} else {
				var index = this.findNodeIndex(result.parent);
				if (index >= 0) {
					this.contract(index);
				}
				result.parent.item[this._config.children] = result.data;
				if (index >= 0) {
					this.expand(index);
				}
			}
			this.fire("update", {"completely": true});
		}
	}
}

