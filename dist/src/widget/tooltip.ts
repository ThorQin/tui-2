/// <reference path="../core.ts" />
module tui.widget {
	"use strict";
	
	var _tooltip = <HTMLSpanElement>elem("span");
	_tooltip.className = "tui-tooltip";
	_tooltip.setAttribute("unselectable", "on");
	var _tooltipTarget: HTMLElement = null;
	
	export function showTooltip(target: HTMLElement, tooltip: string, pos: {x: number, y: number}, update: boolean) {
		function show() {
			if (pos.x + _tooltip.offsetWidth > $(window).width()) {
				pos.x = $(window).width() - _tooltip.offsetWidth;
			}
			_tooltip.style.left = pos.x + "px";
			_tooltip.style.top = pos.y + 25 + "px";
			
		}
		if (target === _tooltipTarget || target === _tooltip) {
			if (update) {
				show();
			}
			return;
		}
		_tooltip.style.width = "";
		_tooltip.style.whiteSpace = "nowrap";
		if (target.hasAttribute("html-tooltip"))
			_tooltip.innerHTML = tooltip;
		else
			$(_tooltip).text(tooltip);
		document.body.appendChild(_tooltip);
		_tooltipTarget = target;
		if (_tooltip.scrollWidth > _tooltip.clientWidth) {
			_tooltip.style.whiteSpace = "normal";
		} else
			_tooltip.style.whiteSpace = "nowrap";
		_tooltip.style.width = $(_tooltip).width() + "px";
		show();
	}

	export function closeTooltip() {
		if (_tooltip.parentNode)
			_tooltip.parentNode.removeChild(_tooltip);
		_tooltip.innerHTML = "";
		_tooltip.style.width = "";
		_tooltipTarget = null;
	}

	var _tooltipTimer: number = null;
	export function whetherShowTooltip(target: HTMLElement, e:JQueryMouseEventObject) {
		if (browser.isAncestry(target, _tooltip))
			return;
		var obj = target;
		while (obj) {
			if (!obj.getAttribute) {
				obj = null;
				break;
			}
			var tooltip = obj.getAttribute("follow-tooltip"); // high priority
			if (tooltip) {
				showTooltip(obj, tooltip, {x: e.clientX, y: e.clientY}, true);
				return;
			} else {
				tooltip = obj.getAttribute("tooltip");
				if (tooltip) {
					closeTooltip();
					_tooltipTimer = setTimeout(function() {
						showTooltip(obj, tooltip, {x: e.clientX, y: e.clientY}, false);
					}, 500);
					return;
				} else
					obj = obj.parentElement;
			}
		}
		if (!obj)
			closeTooltip();
	}

	export function whetherCloseTooltip(target: HTMLElement) {
		
		if (target !== _tooltipTarget && target !== _tooltip) {
			closeTooltip();
		}
	}
	
	var _hoverElement: any;
	$(window.document).mousemove(function (e: any) {
		clearTimeout(_tooltipTimer);
		_hoverElement = e.target || e.toElement;
		if (e.button === 0 && (e.which === 1 || e.which === 0)) {
			whetherShowTooltip(_hoverElement, e);
		}
	});
	$(window).scroll(() => { closeTooltip(); });
}