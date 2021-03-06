﻿/// <reference path="base.ts" />
/// <reference path="form.ts" />
module tui.widget {
	"use strict";

	export var dialogStack: Dialog[] = [];

	var _mask = <HTMLDivElement>elem("div");
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
		private _calc: boolean;

		protected initRestriction(): void {
			super.initRestriction();
			this._calc = false;
			this.setRestrictions({
				"content": {
					"set":  (value: any) => {
						this._data["content"] = value;
						var contentDiv = this._components["content"];
						if (contentDiv) {
							this.setContent(value, false);
						}
					}
				}
			});
		}

		protected initChildren(childNodes: Node[]) {
			if (childNodes.length > 0) {
				var div = elem("div");
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
			if (typeof content === "object" && content && content.nodeName)
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
				if (this.get("mobileModel") && _mask.offsetWidth <= 580) {
					return;
				}
				var dialogX = this._.offsetLeft;
				var dialogY = this._.offsetTop;
				var beginX = e.clientX;
				var beginY = e.clientY;
				var winSize: {
					width: number;
					height: number;
				} = { width: _mask.offsetWidth, height: _mask.offsetHeight };
				tui.widget.openDragMask((e) => {
					var l = dialogX + e.clientX - beginX;
					var t = dialogY + e.clientY - beginY;
					if (l > winSize.width - this._.offsetWidth) l = winSize.width - this._.offsetWidth;
					if (l < 0) l = 0;
					if (t > winSize.height - this._.offsetHeight) t = winSize.height - this._.offsetHeight;
					if (t < 0) t = 0;
					this._.style.left = l + "px";
					this._.style.top = t + "px";
					this._moved = true;
				}, (e) => {
					this.render();
				});
			});
			root$.on(mousewheelevt, function (ev) {
				ev.stopPropagation();
			});
		}

		setContent(content: any, render = true) {
			var contentDiv = this._components["content"];
			while (contentDiv.childNodes.length > 0)
				contentDiv.removeChild(contentDiv.lastChild)
			if (typeof content === "object" && content.nodeName) {
				content.style.display = "block";
				contentDiv.appendChild(content);
			}
			else if (typeof content === "string") {
				contentDiv.innerHTML = content;
			}
			render && this._calc && this.render();
		}

		setButtons(buttonDef: string = null, render = true): void {
			var buttonBar = this._components["buttonBar"];
			buttonBar.innerHTML = "";
			if (typeof buttonDef === "string" && buttonDef.length > 0) {
				var names = buttonDef.split(",");
				for (let name of names) {
					let pair = name.split("#");
					let btn = create("button", { text:tui.str($.trim(pair[0])) })
					if (pair.length > 1 && $.trim(pair[1]).length > 0)
						btn._.className = pair[1];
					btn.on("click", (e) => {
						this.fire("btnclick", {e:e,  button: $.trim(pair[0])});
					});
					btn.appendTo(buttonBar);
				}
				buttonBar.style.display = "block";
			} else {
				buttonBar.style.display = "none";
			}
			if (render && this._calc)
				this.render();
		}

		open(buttonDef: string = null): Dialog {
			if (this.get("opened"))
				return;
			this._set("opened", true);
			this._calc = false;
			var contentDiv = this._components["content"];
			this._init = true;
			this._moved = false;

			$(this._).css({
				"top": "3000px",
				"left": "0",
				"right": "0",
				"display": "block",
				"position": "fixed"
			});

			push(this);
			var mobileModel = this.get("mobileModel");
			if (mobileModel) {
				$(this._).css({"top": _mask.offsetHeight + 1 + "px"});
			}
			this.setButtons(buttonDef, false);
			init(contentDiv);
			this._.focus();
			setTimeout(()=>{
				$(this._).css({
					"left": "",
					"right": ""
				});
				this.render();
				this._calc = true;
				this.fire("open");
				this._sizeTimer = setInterval( () => {
					if (this._contentSize == null)
						return;
					if (contentDiv.scrollHeight !== this._contentSize.height ||
						contentDiv.scrollWidth !== this._contentSize.width) {
						this.refresh();
					}
				}, 50);
			});
			return this;
		}

		close(): Dialog {
			if (!this.get("opened"))
				return;
			clearInterval(this._sizeTimer);
			this._sizeTimer = null;
			this._moved = false;
			this._contentSize = null;
			remove(this);
			this._set("opened", false);
			this.fire("close");
			return this;
		}

		render(): void {
			if (!this.get("opened"))
				return;

			var titleBar = this._components["titleBar"];
			var buttonBar = this._components["buttonBar"];
			var contentDiv = this._components["content"];
			var closeIcon = this._components["closeIcon"];

			var mobileModel = this.get("mobileModel");
			if (mobileModel) {
				this.addClass("tui-dialog-mobile-model");
			} else {
				this.removeClass("tui-dialog-mobile-model");
			}

			// Adjust title bar
			if (this.get("title") === null && !this.get("esc")) {
				titleBar.style.display = "none";
			} else {
				titleBar.style.display = "block";
				if (this.get("esc")) {
					closeIcon.style.display = "inline-block";
				} else
					closeIcon.style.display = "none";
				var titleText = $(titleBar).children(".tui-text")[0];
				titleText.innerHTML = this.get("title") !== null ? this.get("title") : "";
				if (tui.ieVer >= 7 && tui.ieVer < 9) { // IE8 fixed
					titleText.style.width = "";
					titleText.style.width = titleText.offsetWidth + "px";
				}
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
			if (mobileModel && winSize.width <= 580) {
				let mobileSize : any = {
					"width": winSize.width - 40 + "px",
					"height": winSize.height - titleBar.offsetHeight - buttonBar.offsetHeight - $(contentDiv).outerHeight() + $(contentDiv).height() + "px"
				};
				mobileSize.maxWidth = mobileSize.minWidth = mobileSize.width;
				mobileSize.maxHeight = mobileSize.minHeight = mobileSize.height;
				$(contentDiv).css(mobileSize);
			} else {
				$(contentDiv).css({
					//"maxWidth": winSize.width - $(contentDiv).outerWidth() + $(contentDiv).width() + "px",
					"width": "",
					"height": "",
					"maxWidth": winSize.width - 40 + "px",
					"maxHeight": winSize.height - 40 - titleBar.offsetHeight - buttonBar.offsetHeight - $(contentDiv).outerHeight() + $(contentDiv).height() + "px",
					"minWidth": winSize.width <= 580 ? winSize.width - 80 + "px" : "none",
					"minHeight": ""
				});
			}

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

	register(Dialog, "dialog");

	$(document).on("keydown", (e) => {
		var k = e.keyCode;
		if (dialogStack.length <= 0)
			return;
		var dlg = dialogStack[dialogStack.length - 1];
		if (k === browser.KeyCode.ESCAPE) {
			dlg.get("esc") && dlg.close();
		} else if (k === browser.KeyCode.TAB) {
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
}

module tui {
	"use strict";

	function makeContent(message: string) {
		// return text.format(
		// 	"<table align='center' class='tui-msg-container'><tr><td class='{1}'><span></span></td><td>{0}</td></tr></table>",
		// 	message, className);
		if (message) {
			return text.format(
				"<div class='tui-msg-container'><span></span><div name='dialogMsgDiv'>{0}</div></div>",
				browser.toSafeText(message));
		} else {
			return text.format(
				"<div class='tui-msg-container'><span></span></div>");
		}
	}

	function makeDialog(message: string, className: string, title?: string, btn: string = "ok#tui-primary",
		callback: (btnName:string) => void = null, esc: boolean = true): widget.Dialog {
		var dlg = <widget.Dialog>tui.widget.create("dialog", {
			"content": makeContent(message),
			"title": title,
			"esc": esc
		 });
		$(dlg._).addClass(className);
		dlg.on("btnclick", function (e: EventInfo) {
			dlg.close();
			if (callback)
				callback(e.data.button);
		});
		dlg.open(btn);
		return dlg;
	}

	export function msgbox(message: string, title: string = null): widget.Dialog {
		return makeDialog(message, "tui-msg-box", title);
	}
	export function infobox(message: string, title: string = tui.str("note")): widget.Dialog {
		var titleText = "<i class='tui-dialog-title-info'></i>";
		if (title)
			titleText += title;
		return makeDialog(message, "tui-info-box", titleText);
	}
	export function okbox(message: string, title: string = tui.str("success")): widget.Dialog {
		var titleText = "<i class='tui-dialog-title-ok'></i>";
		if (title)
			titleText += title;
		return makeDialog(message, "tui-ok-box", titleText);
	}
	export function errbox(message: string, title: string = tui.str("error")): widget.Dialog {
		var titleText = "<i class='tui-dialog-title-error'></i>";
		if (title)
			titleText += title;
		return makeDialog(message, "tui-err-box", titleText);
	}
	export function warnbox(message: string, title: string = tui.str("warning")): widget.Dialog {
		var titleText = "<i class='tui-dialog-title-warning'></i>";
		if (title)
			titleText += title;
		return makeDialog(message, "tui-warn-box", titleText);
	}
	export function askbox(message: string, title?: string, callback?: (result: boolean) => void): widget.Dialog {
		if (typeof title === "function") {
			callback = <(result:boolean)=>void><any>title;
			title = tui.str("confirm");
		} else if (title == null || typeof title === UNDEFINED) {
			title = tui.str("confirm")
		}
		var titleText = "<i class='tui-dialog-title-ask'></i>";
		titleText += title;
		return makeDialog(message, "tui-ask-box", titleText, "cancel,ok#tui-primary", function(buttonName: string){
			if (typeof callback === "function")
				callback(buttonName === "ok");
		});
	}

	var refCount = 0;
	var waitDlg: widget.Dialog = null;
	var waitMsg: string[] = null;
	export function waitbox(message: string): {close: () => void, setMessage: (message: string) => void} {
		if (waitDlg == null) {
			refCount = 0;
			waitMsg = [message];
			waitDlg = makeDialog(message, "tui-wait-box", null, null, null, false);
		} else {
			waitMsg.push(message);
			//waitDlg.setContent(makeContent(message));
			$(waitDlg.getComponent("content")).find("div[name='dialogMsgDiv']").text(message);
			setTimeout(function(){
				waitDlg && waitDlg.refresh();
			});
		}
		var index = waitMsg.length - 1;
		refCount++;
		var closed = false;
		return {
			close: function(){
				if (!closed) {
					refCount--;
					closed = true;
					waitMsg[index] = null;
					for (var i = index - 1; i >= 0; i--) {
						if (waitMsg[i] != null) {
							waitDlg.setContent(makeContent(waitMsg[i]));
							break;
						}
					}
					if (refCount === 0) {
						waitDlg.close();
						waitDlg = null;
						waitMsg = null;
					}
				}
			},
			setMessage: function(message: string) {
				if (!closed) {
					waitMsg[index] = message;
					if (index === waitMsg.length - 1)
						waitDlg.setContent(makeContent(message));
				}
			}
		};
	}
	export function progressbox(message: string, cancelProc: () => {} = null): widget.Dialog {
		// TODO: NOT FINISHED
		return null;
	}
}
