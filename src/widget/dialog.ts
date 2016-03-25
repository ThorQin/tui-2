/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	
	export var dialogStack: Dialog[] = [];
	
	var _mask: HTMLDivElement = document.createElement("div");
	_mask.className = "tui-dialog-mask";
	_mask.setAttribute("unselectable", "on");
	var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	$(_mask).on(mousewheelevt + " selectstart", function (ev) {
		ev.stopPropagation();
		ev.preventDefault();
	});

	function reorder() {
		browser.removeNode(_mask);
		if (dialogStack.length > 0) {
			document.body.insertBefore(_mask, dialogStack[dialogStack.length - 1]._);
		}
	}

	function push(dlg: Dialog) {
		dialogStack.push(dlg);
		document.body.appendChild(dlg._);
		reorder();
	}

	function remove(dlg: Dialog) {
		var index = dialogStack.indexOf(dlg);
		if (index >= 0) {
			dialogStack.splice(index, 1);
		}
		document.body.removeChild(dlg._);
		reorder();
	}

	function getParent(dlg: Dialog): Dialog {
		var index = dialogStack.indexOf(dlg);
		if (index > 0) {
			dialogStack[index - 1];
		} else
			return null;
	}

	function disableSelect() { 
		return false; 
	}

	export interface DialogButton {
		name: string;
		className?: string;
		click?: (e: EventInfo) => void;
	}

	/**
	 * <dialog>
	 * Attributes: content(element or html), opened(boolean), title, buttons(button array), esc(boolean)
	 * Method: open(buttonDef: string = null), close()
	 * Events: open, close, click-<button name>
	 */
	export class Dialog extends Widget {
		
		private _sizeTimer: number = null;
		private _contentSize: browser.Size = null;
		private _moved: boolean = false;
		private _init: boolean = true;

		protected initChildren(childNodes: Node[]) {
			if (childNodes.length > 0) {
				var div = document.createElement("div");
				for (let node of childNodes) {
					div.appendChild(node);
				}
				this._set("content", div);
			}
		}

		protected init(): void {
			var root$ = $(this._); 
			root$.attr("tabIndex", "-1");
			root$.html("<div class='tui-title-bar' unselectable='on'><span class='tui-text'></span><span class='tui-close'></span></div>" +
				"<div class='tui-content'></div><div class='tui-button-bar'></div>");
			
			var titleBar = this._components["titleBar"] = root$.children(".tui-title-bar")[0];
			var contentDiv = this._components["content"] = root$.children(".tui-content")[0];
			var buttonBar = this._components["buttonBar"] = root$.children(".tui-button-bar")[0];
			var closeIcon = this._components["closeIcon"] = $(titleBar).children(".tui-close")[0]; 
			titleBar.onselectstart = disableSelect;
			buttonBar.onselectstart = disableSelect;
			
			var content = this.get("content");
			if (typeof content === "object" && content.nodeName)
				contentDiv.appendChild(content);
			else if (typeof content === "string") {
				contentDiv.innerHTML = content;
			}
			this.setInit("esc", true);
			init(contentDiv); // Convert all child elements into tui controls
			closeIcon.onclick = () => {
				this.close();
			};
			browser.removeNode(this._);
			$(titleBar).on("mousedown", (e) => {
				var o = (e.target || e.srcElement);
				if (o  === closeIcon)
					return;
				var dialogX = this._.offsetLeft;
				var dialogY = this._.offsetTop;
				var beginX = e.clientX;
				var beginY = e.clientY;
				var winSize: {
					width: number;
					height: number;
				} = { width: _mask.offsetWidth, height: _mask.offsetHeight };
				var mask = tui.widget.openDragMask((e) => {
					var l = dialogX + e.clientX - beginX;
					var t = dialogY + e.clientY - beginY;
					if (l > winSize.width - this._.offsetWidth) l = winSize.width - this._.offsetWidth;
					if (l < 0) l = 0;
					if (t > winSize.height - this._.offsetHeight) t = winSize.height - this._.offsetHeight;
					if (t < 0) t = 0;
					this._.style.left = l + "px";
					this._.style.top = t + "px";
					this._moved = true;
				}, () => {
					this.render();
				});
			});
			root$.on(mousewheelevt, function (ev) {
				ev.stopPropagation();
			});
		}

		open(buttonDef: string = null): void {
			if (this.get("opened"))
				return;
			var contentDiv = this._components["content"];
			var buttonBar = this._components["buttonBar"];
			
			buttonBar.innerHTML = "";
			if (typeof buttonDef === "string" && buttonDef.length > 0) {
				var names = buttonDef.split(",");
				for (let name of names) {
					let pair = name.split("#");
					let btn = create(Button, { text:tui.str($.trim(pair[0])) })
					if (pair.length > 1 && $.trim(pair[1]).length > 0)
						btn._.className = pair[1];
					btn.on("click", (e) => {
						this.fire("btnclick", { button: name});
					});
					btn.appendTo(buttonBar);
				}
				buttonBar.style.display = "block";
			} else {
				buttonBar.style.display = "none";
			}
			this._init = true;
			this._moved = false;
			$(this._).css({
				"display": "block",
				"position": "fixed"
			});
			this._set("opened", true);
			push(this);
			this.render();
			this.fire("open");
			this._sizeTimer = setInterval( () => {
				if (this._contentSize == null)
					return;
				if (contentDiv.scrollHeight !== this._contentSize.height ||
					contentDiv.scrollWidth !== this._contentSize.width) {
					this.refresh();
				}
			}, 50);
		}

		close(): void {
			if (!this.get("opened"))
				return;
			clearInterval(this._sizeTimer);
			this._sizeTimer = null;
			this._moved = false;
			this._contentSize = null;
			remove(this);
			this._set("opened", false);
			this.fire("close");
		}

		render(): void {
			if (!this.get("opened"))
				return;

			var titleBar = this._components["titleBar"];
			var buttonBar = this._components["buttonBar"];
			var contentDiv = this._components["content"]; 
			var closeIcon = this._components["closeIcon"];
			// Adjust title bar
			if (this.get("esc")) {
				closeIcon.style.display = "inline-block";
			} else
				closeIcon.style.display = "none";
			var titleText = $(titleBar).children(".tui-text")[0];
			titleText.innerHTML = this.get("title");
			if (tui.ieVer >= 7 && tui.ieVer < 9) { // IE8 fixed
				titleText.style.width = "";
				titleText.style.width = titleText.offsetWidth + "px";
			}
			
			// Change position
			var winSize: browser.Size = {width: _mask.offsetWidth, height:_mask.offsetHeight };
			
			var root = this._;
			var root$ = $(root);
			// Limit content size
			contentDiv.style.maxHeight = "";
			root$.css({
				"maxWidth": winSize.width + "px",
				"maxHeight": winSize.height + "px"
			});
			$(contentDiv).css({
				"maxWidth": winSize.width - $(contentDiv).outerWidth() + $(contentDiv).width() + "px",
				"maxHeight": winSize.height - titleBar.offsetHeight - buttonBar.offsetHeight - $(contentDiv).outerHeight() + $(contentDiv).height() + "px"
			});
			
			var box: browser.Rect = {
				left: root.offsetLeft,
				top: root.offsetTop,
				width: root.offsetWidth,
				height: root.offsetHeight
			};
			if (this._init) {
				var parent = getParent(this);
				var centX: number, centY: number;
				if (parent) {
					var e = parent._;
					centX = e.offsetLeft + e.offsetWidth / 2;
					centY = e.offsetTop + e.offsetHeight / 2;
					this._moved = true;
				} else {
					centX = winSize.width / 2;
					centY = winSize.height / 2;
					this._moved = false;
				}
				box.left = centX - box.width / 2;
				box.top = centY - box.height / 2;
				this._init = false;
			} else {
				if (!this._moved) {
					box.left = (winSize.width - box.width) / 2;
					box.top = (winSize.height - box.height) / 2;
				}
			}
			if (box.left + box.width > winSize.width)
				box.left = winSize.width - box.width;
			if (box.top + box.height > winSize.height)
				box.top = winSize.height - box.height;
			if (box.left < 0)
				box.left = 0;
			if (box.top < 0)
				box.top = 0;
			this._.style.left = box.left + "px";
			this._.style.top = box.top + "px";

			this._contentSize = {width: contentDiv.scrollWidth, height: contentDiv.scrollHeight};
		}
		
	} // End of Dialog class
	
	register(Dialog);

	$(document).on("keydown", (e) => {
		var k = e.keyCode;
		if (dialogStack.length <= 0)
			return;
		var dlg = dialogStack[dialogStack.length - 1];
		if (k === KeyCode.ESCAPE) {
			dlg.get("esc") && dlg.close();
		} else if (k === KeyCode.TAB) {
			setTimeout(function () {
				if (!browser.isPosterity(dlg._, document.activeElement)) {
					dlg._.focus();
				}
			});
		}
	});

	$(window).resize(() => {
		for (var i = 0; i < dialogStack.length; i++) {
			dialogStack[i].refresh();
		}
	});
	
	/*
	
	function makeWarp(className, message) {
		var wrap = document.createElement("div");
		wrap.className = className;
		if (typeof message === null || message === undefined)
			message = "";
		else
			message += "";
		var testSpan = document.createElement("span");
		testSpan.style.position = "absolute";
		testSpan.style.visibility = "hidden";
		testSpan.style.display = "inline-block";
		testSpan.style.whiteSpace = "nowrap";
		testSpan.innerHTML = message;
		document.body.appendChild(testSpan);
		var realWidth = testSpan.offsetWidth;
		tui.removeNode(testSpan);
		if (realWidth < 400)
			wrap.innerHTML = message;
		else {
			var span = document.createElement("span");
			span.className = "tui-textarea tui-inline";
			var textarea = new tui.ctrl.TextArea(span);
			textarea.addClass("tui-dlg-long-msg");
			textarea.text(message);
			textarea.readonly(true);
			$(wrap).addClass("tui-dlg-long-warp");
			wrap.appendChild(textarea[0]);
		}
		return wrap;
	}

	export function msgbox(message: string, title?: string): ctrl.Dialog {
		var dlg = tui.ctrl.dialog();
		dlg.showElement(makeWarp("tui-dlg-msg", message), title);
		return dlg;
	}

	export function infobox(message: string, title?: string): ctrl.Dialog {
		var dlg = tui.ctrl.dialog();
		dlg.showElement(makeWarp("tui-dlg-warp tui-dlg-info", message), title);
		return dlg;
	}

	export function okbox(message: string, title?: string): ctrl.Dialog {
		var dlg = tui.ctrl.dialog();
		dlg.showElement(makeWarp("tui-dlg-warp tui-dlg-ok", message), title);
		return dlg;
	}

	export function errbox(message: string, title?: string): ctrl.Dialog {
		var dlg = tui.ctrl.dialog();
		dlg.showElement(makeWarp("tui-dlg-warp tui-dlg-err", message), title);
		return dlg;
	}

	export function warnbox(message: string, title?: string): ctrl.Dialog {
		var dlg = tui.ctrl.dialog();
		dlg.showElement(makeWarp("tui-dlg-warp tui-dlg-warn", message), title);
		return dlg;
	}

	export function askbox(message: string, title?: string, callback?: (result: boolean) => void): ctrl.Dialog {
		var dlg = tui.ctrl.dialog();
		var result = false;
		dlg.showElement(makeWarp("tui-dlg-warp tui-dlg-ask", message), title, [
			{
				name: str("Ok"), func: () => {
					result = true;
					dlg.close();
				}
			},{
				name: str("Cancel"), func: () => {
					dlg.close();
				}
			}
		]);
		dlg.on("close", () => {
			if (typeof callback === "function")
				callback(result);
		});
		return dlg;
	}

	export function waitbox(message: string, cancelProc: () => {} = null): ctrl.Dialog {
		var dlg = tui.ctrl.dialog();
		var wrap = document.createElement("div");
		wrap.className = "tui-dlg-warp tui-dlg-wait";
		wrap.innerHTML = message;
		if (typeof cancelProc === "function")
			dlg.showElement(wrap, null, [{
				name: str("Cancel"), func: function () {
					dlg.close();
					cancelProc();
				}
			}]);
		else {
			dlg.showElement(wrap, null, []);
		}
		dlg.useesc(false);
		return dlg;
	}
	
	export function progressbox(message: string, cancelProc: () => {} = null): ctrl.Dialog {
		var dlg = tui.ctrl.dialog();
		var outbox = document.createElement("div");
		var wrap = document.createElement("div");
		wrap.className = "tui-progress-title";
		wrap.innerHTML = message;
		outbox.appendChild(wrap);
		outbox.className = "tui-progress-wrap";
		var progressbar = document.createElement("div");
		progressbar.className = "tui-progress-bar";
		var progress = document.createElement("span");
		progress.className = "tui-progress";
		progressbar.appendChild(progress);
		var block = document.createElement("span");
		block.className = "tui-progress-block";
		progress.appendChild(block);
		var text = document.createElement("span");
		text.className = "tui-progress-text";
		text.innerHTML = "0%";
		progressbar.appendChild(text);
		outbox.appendChild(progressbar);
		if (typeof cancelProc === "function")
			dlg.showElement(outbox, null, [{
				name: str("Cancel"), func: function () {
					dlg.close();
					cancelProc();
				}
			}]);
		else {
			dlg.showElement(outbox, null, []);
		}
		dlg.useesc(false);
		dlg["text"] = function(value) {
			wrap.innerHTML = value;
		};
		dlg["progress"] = function(value: number) {
			if (typeof value !== "number" || isNaN(value))
				return;
			if (value < 0) value = 0;
			if (value > 100) value = 100;
			block.style.width = Math.floor(300 * (value / 100)) + "px";
			text.innerHTML = value + "%";
		};
		return dlg;
	}

	
	export function loadHTML(url: string, elem: HTMLElement, completeCallback?: (status: string, jqXHR: JQueryXHR) => any, async: boolean = true, method?: string, data?: any) {
		loadURL(url, function (status: string, jqXHR: JQueryXHR) {
			if (typeof completeCallback === "function" && completeCallback(status, jqXHR) === false) {
				return;
			}
			if (status === "success") {
				var matched = /<body[^>]*>((?:.|[\r\n])*)<\/body>/gim.exec(jqXHR.responseText);
				if (matched != null)
					elem.innerHTML = matched[1];
				else
					elem.innerHTML = jqXHR.responseText;
				tui.ctrl.initCtrls(elem);
			} else {
				tui.errbox(tui.str(status) + " (" + jqXHR.status + ")", tui.str("Failed"));
			}
		}, async, method, data);
	}
	*/
}

module tui {
	"use strict";
	
}