/// <reference path="../core.ts" />
module tui.widget {
	"use strict";
	
	var _maskOpened: boolean = false;
	var _mask: HTMLDivElement = document.createElement("div");
	_mask.setAttribute("unselectable", "on");
	_mask.onselectstart = function(){return false;};
	var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	$(_mask).on(mousewheelevt, function (ev) {
		ev.stopPropagation();
		ev.preventDefault();
	});
	/**
	 * Show a mask layer to prevent user drag or select document elements which don't want to be affected.
	 * It's very useful when user perform a dragging operation.
	 */
	export function openDragMask(onMove: (e: JQueryEventObject) => void, onClose: (e: JQueryEventObject) => void = null) {
		if (_maskOpened)
			return null;
		_mask.innerHTML = "";
		_mask.className = "tui-mask";
		_mask.style.cursor = "";
		_mask.removeAttribute("tabIndex");
		_mask.removeAttribute("tooltip");
		_mask.removeAttribute("fixed-tooltip");
		document.body.appendChild(_mask);
		// _dragMoveFunc = onMove;
		function closeDragMask(e: JQueryEventObject) {
			_maskOpened = false;
			if ((<any>_mask).setCapture)
				$(_mask).off();
			else {
				$(document).off("mousemove", onMove);
				$(document).off("mouseup", closeDragMask);
			}
			browser.removeNode(_mask);
			if (typeof onClose === "function") {
				onClose(e);
			}
		}
		if ((<any>_mask).setCapture) {
			(<any>_mask).setCapture();
			$(_mask).on("mousemove", onMove);
			$(_mask).on("mouseup", closeDragMask);
		} else {
			$(document).on("mousemove", onMove);
			$(document).on("mouseup", closeDragMask);
		}
		_maskOpened = true;
		return _mask;
	}
}