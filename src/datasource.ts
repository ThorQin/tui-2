/// <reference path="core.ts" />

module tui {
	"use strict";

	export interface DataSource {
		length(): number;
		get(index: number): any;
	}
	
	export interface TreeDataSource extends DataSource {
		expend(index: number): void;
		contract(index: number): void;
	}
	
	export class ListSource implements DataSource {
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
	
	class CachePage {
		page: number;
		data: any[];
	}
	
	interface QueryResult {
		length: number; // total length
		begin: number;
		data: any[];
	}
	
	/**
	 * RemoteListSource
	 * Method: getLength(), getItem(), reset(), update()
	 * Events: query, update
	 */
	export class RemoteListSource extends EventObject implements DataSource {
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
			this._length = result.length;
			if (this._fillCache === 1) {
				this._cache1 = {page: this.getIndexPage(result.begin), data: result.data};
			} else if (this._fillCache === 2) {
				this._cache2 = {page: this.getIndexPage(result.begin), data: result.data};
			}
			this.fire("update");
		}
		
		reset() {
			this._length = null;
			this._cache1 = this._cache2 = null;
			this._fillCache = 1;
		}
	} // End of RemoteListSource
	
	class TreeIndex {
		parent: number;
		hasChild: boolean;
		childLength: number;
		expand: boolean;
		item: any;
	}
	
	// TODO: Not finished.
	export abstract class TreeSourceBase extends EventObject implements TreeDataSource {
		private _index: TreeIndex[];
		length(): number {
			
			return 0;
		}
		get(index: number): any {
			
		}
		expend(index: number): void {
			
		}
		contract(index: number): void {
			
		}
	}
}

