/// <reference path="core.ts" />
module tui.browser {
    "use strict";
	export class BackupedScrollPosition {
		private backupInfo: {obj:HTMLElement; left: number; top:number; }[] = [];
		constructor(target: HTMLElement) {
			var obj = target;
			while (obj && obj !== document.body) {
				obj = <HTMLElement>obj.parentElement;
				if (obj)
					this.backupInfo.push({obj: obj, left: obj.scrollLeft, top: obj.scrollTop});
			}
		}
		restore() {
			for (var i = 0; i < this.backupInfo.length; i++) {
				var item = this.backupInfo[i];
				item.obj.scrollLeft = item.left;
				item.obj.scrollTop = item.top;
			}
		}
	}

	export function backupScrollPosition(target: HTMLElement): BackupedScrollPosition {
		return new BackupedScrollPosition(target);
	}
	
	export function focusWithoutScroll(target: HTMLElement) {
		setTimeout(function () {
			if (tui.ieVer > 0) {
				//if (tui.ieVer > 8)
				//	target.setActive();
				//else {
				//	if (target !== document.activeElement)
						target.setActive();
				//}
			} else if (tui.ffVer > 0)
				target.focus();
			else {
				var backup = tui.browser.backupScrollPosition(target);
				target.focus();
				backup.restore();
			}
		}, 0);
	}

	export function scrollToElement(elem: HTMLElement) {
		var obj = elem;
		while (obj) {
			var parent = obj.offsetParent;
			$(parent).animate({ scrollTop: $(obj).offset().top }, 200);
			obj = <HTMLElement>parent;
		}
	}

	export function toElement(html: string, withParent: boolean = false): Node {
		var div = document.createElement('div');
		div.innerHTML = $.trim(html);
		if (withParent)
			return div;
		var el = div.firstChild;
		return div.removeChild(el);
	}
	
	export function toHTML(node: NodeList): string;
	export function toHTML(node: Node[]): string;
	export function toHTML(node: Node): string;
	export function toHTML(node: any): string {
		var elem = document.createElement("span");
		if (typeof node.nodeName === "string") {
			elem.appendChild(node);
		} else if (typeof node.length === "number") {
			for (let i = 0; i < node.length; i++) {
				elem.appendChild(node[i]);
			}
		} 
		return elem.innerHTML;
	}

	export function removeNode(node: Node): void {
		node.parentNode && node.parentNode.removeChild(node);
	}
    
	/**
	 * Get or set a HTMLElement's text content, return Element's text content.
	 * @param elem {HTMLElement or ID of the element} Objective element
	 * @param text {string or boolean}
	 */
	function nodeText(elem: any, text?: any): string {
		if (typeof elem === "string")
			elem = document.getElementById(elem);
		if (elem) {
			if (typeof text === "string") {
				elem.innerHTML = "";
				elem.appendChild(document.createTextNode(text));
				return text;
			}
			if (typeof text !== "boolean")
				text = true;
			var buf: string = "";
			for (var i = 0; i < elem.childNodes.length; i++) {
				var c = elem.childNodes[i];
				if (c.nodeName.toLowerCase() === "#text") {
					buf += c.nodeValue;
				} else if (text)
					buf += nodeText(c);
			}
			return buf;
		} else
			return null;
	}
	
	export function getNodeText(elem: any): string {
		return nodeText(elem);
	}
	
	export function setNodeText(elem: any, text: string): void {
		nodeText(elem, text);
	}
	
	export function getNodeOwnText(elem: any): string {
		return nodeText(elem, false);
	}

	export interface Size {
		width: number;
		height: number;
	}

	export interface Position {
		left: number;
		top: number;
	}

	export interface Rect extends Position, Size { }
	
	export function getRectOfParent(elem: HTMLElement): Rect {
		if (elem === null)
			return null;
		return {
			left: elem.offsetLeft,
			top: elem.offsetTop,
			width: elem.offsetWidth,
			height: elem.offsetHeight
		};
	}

	export function getRectOfPage(elem: HTMLElement): Rect {
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

	export function getRectOfScreen(elem: HTMLElement): Rect {
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
	
	/**
	 * Get top window's body element
	 */
	export function getTopBody () {
		return top.document.body || top.document.getElementsByTagName("BODY")[0];
	}

	/**
	 * Get element's owner window
	 */
	export function getWindow(elem: HTMLElement): any {
		return elem.ownerDocument.defaultView || (<any>elem.ownerDocument).parentWindow; 
	}
	
	export function getWindowScrollElement(): HTMLElement {
		if (tui.ieVer > 0 || tui.ffVer > 0) {
			return window.document.documentElement;
		} else {
			return window.document.body;
		}
	}

	
	/**
	 * Test whether the button code is indecated that the event is triggered by a left mouse button.
	 */
	export function isLButton(e: any): boolean {
		var button = (typeof e.which !== "undefined") ? e.which : e.button;
		if (button == 1) {
			return true;
		} else
			return false;
	}

	/**
	 * Prevent user press backspace key to go back to previous page
	 */
	export function banBackspace() : void {
		function ban(e: any) {
			var ev = e || window.event;
			var obj = ev.target || ev.srcElement;
			var t = obj.type || obj.getAttribute('type');
			var vReadOnly = obj.readOnly;
			var vDisabled = obj.disabled;
			vReadOnly = (typeof vReadOnly === UNDEFINED) ? false : vReadOnly;
			vDisabled = (typeof vDisabled === UNDEFINED) ? true : vDisabled;
			var flag1 = ev.keyCode === 8 && (t === "password" || t === "text" || t === "textarea") && (vReadOnly || vDisabled);
			var flag2 = ev.keyCode === 8 && t !== "password" && t !== "text" && t !== "textarea";
			if (flag2 || flag1)
				return false;
		}
		$(document).bind("keypress", ban);
		$(document).bind("keydown", ban);
	}

	export function cancelDefault(event: any): boolean {
		if(event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
		return false;
	}
	
	export function cancelBubble(event: any): boolean {
		if (event && event.stopPropagation)
			event.stopPropagation(); 
		else
			window.event.cancelBubble = true;
		return false;
	}
	
	/**
	 * Detect whether the given parent element is the real ancestry element
	 * @param elem
	 * @param parent
	 */
	export function isAncestry(elem: Node, parent: Node): boolean {
		while (elem) {
			if (elem === parent)
				return true;
			else
				elem = elem.parentNode;
		}
		return false;
	}

	/**
	 * Detect whether the given child element is the real posterity element
	 * @param elem
	 * @param child
	 */
	export function isPosterity(elem: Node, child: Node): boolean {
		return isAncestry(child, elem);
	}

	export function isFireInside(elem: Node, event: any): boolean {
		var target = event.target || event.srcElement;
		return isPosterity(elem, target);
	}

	/**
	 * Detect whether the element is inside the document
	 * @param {type} elem
	 */
	export function isInDoc(elem: HTMLElement): boolean {
		var obj: HTMLElement = elem;
		while (obj) {
			if (obj.nodeName.toUpperCase() === "HTML")
				return true;
			obj = obj.parentElement;
		}
		return false;
	}
	
	
	/**
	 * Set cookie value
	 * @param name
	 * @param value
	 * @param days valid days
	 */
	export function saveCookie (name: string, value: any, expires?: number, path?: string, domain?: string, secure: boolean = false) {
		// set time, it's in milliseconds
		var today = new Date();
		today.setTime(today.getTime());
		/*
		if the expires variable is set, make the correct
		expires time, the current script below will set
		it for x number of days, to make it for hours,
		delete * 24, for minutes, delete * 60 * 24
		*/
		if (expires) {
			expires = expires * 1000 * 60 * 60 * 24;
		}
		var expires_date = new Date(today.getTime() + (expires));
		document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) +
		((expires) ? ";expires=" + expires_date.toUTCString() : "") +
		((path) ? ";path=" + path : "") +
		((domain) ? ";domain=" + domain : "") +
		((secure) ? ";secure" : "");
	}


	/**
	 * Get cookie value
	 * @param name
	 */
	export function loadCookie (name: string) {
		var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (arr !== null)
			return JSON.parse(decodeURIComponent(arr[2]));
		else
			return null;
	}

	/**
	 * Delete cookie
	 * @param name
	 */
	export function deleteCookie (name: string, path?: string, domain?: string) {
		if (loadCookie(name)) document.cookie = name + "=" +
			((path) ? ";path=" + path : "") +
			((domain) ? ";domain=" + domain : "") +
			";expires=Thu, 01-Jan-1970 00:00:01 GMT";
	}

	/**
	 * Save key value into local storage, if local storage doesn't usable then use local cookie instead.
	 * @param {String} key
	 * @param {String} value
	 * @param {Boolean} sessionOnly If true data only be keeped in this session
	 */
	export function saveData (key: string, value: any, sessionOnly: boolean = false): void {
		try {
			var storage = (sessionOnly === true ? window.sessionStorage : window.localStorage);
			if (storage) {
				storage.setItem(key, JSON.stringify(value));
			} else
				saveCookie(key, value, 365);
		} catch(e) {
		}
	}

	/**
	 * Load value from local storage, if local storage doesn't usable then use local cookie instead.
	 * @param {String} key
	 * @param {Boolean} sessionOnly If true data only be keeped in this session
	 */
	export function loadData (key: string, sessionOnly: boolean = false): any {
		try {
			var storage = (sessionOnly === true ? window.sessionStorage : window.localStorage);
			if (storage)
				return JSON.parse(storage.getItem(key));
			else
				return loadCookie(key);
		} catch (e) {
			return null;
		}
	}

	/**
	 * Remove value from local storage, if local storage doesn't usable then use local cookie instead.
	 * @param key
	 * @param {Boolean} sessionOnly If true data only be keeped in this session
	 */
	export function deleteData (key: string, sessionOnly: boolean = false) {
		try {
			var storage = (sessionOnly === true ? window.sessionStorage : window.localStorage);
			if (storage)
				storage.removeItem(key);
			else
				deleteCookie(key);
		} catch (e) {
		}
	}
	
	var _accMap: any = {};
	function accelerate(e: JQueryKeyEventObject) {
		var k = keyName[e.keyCode];
		if (!k) {
			return;
		}
		k = k.toUpperCase();
		var key: string = (e.ctrlKey ? "CTRL" : "");
		if (e.altKey) {
			if (key.length > 0)
				key += "+";
			key += "ALT";
		}
		if (e.shiftKey) {
			if (key.length > 0)
				key += "+";
			key += "SHIFT";
		}
		if (e.metaKey) {
			if (key.length > 0)
				key += "+";
			key += "META";
		}
		if (key.length > 0)
			key += "+";
		key += k;
		var l = _accMap[key];
		if (l) {
			for (var i = 0; i < l.length; i++) {
				if (tui.event.fire("accelerate", { name: l[i], event: e }) === false)
					return;
			}
		}
	}
	export function addAccelerate(key: string, actionId: string) {
		key = key.toUpperCase();
		var l: string[] = null;
		if (_accMap.hasOwnProperty(key))
			l = _accMap[key];
		else {
			l = [];
			_accMap[key] = l;
		}
		if (l.indexOf(actionId) < 0)
			l.push(actionId);
	}
	export function deleteAccelerate(key: string, actionId: string) {
		key = key.toUpperCase();
		if (!_accMap.hasOwnProperty(key))
			return;
		var l: string[] = _accMap[key];
		var pos = l.indexOf(actionId);
		if (pos >= 0) {
			l.splice(pos, 1);
			if (l.length <= 0)
				delete _accMap[key];
		}
	}
	$(document).keydown(accelerate);
}