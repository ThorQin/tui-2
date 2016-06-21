/// <reference path="inputBase.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <input>
	 * Attributes: value, text, type, iconLeft, iconRight, autoValidate
	 * Events: input, change, left-icon-mousedown, right-icon-mousedown, left-icon-click, right-icon-click
	 */
	export class Textarea extends InputBase {
		
		protected _lastTextHeight: number;
		
		protected initRestriction(): void {
			super.initRestriction();
			var textbox = this._components["textbox"] = document.createElement("textarea");
			textbox.setAttribute("wrap", "physical");
			this.setRestrictions({
				"value": {
					"set": (value: any) => {
						textbox.value = value;
						this._isEmpty = (textbox.value === "");
					},
					"get": (): any => {
						return textbox.value;
					}
				},
				"text": {
					"set": (value: any) => {
						this._set("value", value);
					},
					"get": (): any => {
						return this.get("value");
					}
				}
			});
		}
		
		protected init(): void {
			var $root = $(this._);
			var placeholder = this._components["placeholder"] = document.createElement("span");
			var textbox = <HTMLTextAreaElement>this._components["textbox"];
			var iconInvalid = this._components["iconInvalid"] = document.createElement("i");
			iconInvalid.className = "tui-invalid-icon";
			placeholder.className = "tui-placeholder";
			placeholder.setAttribute("unselectable","on");
			this._.appendChild(placeholder);
			this._.appendChild(textbox);
			this._.appendChild(iconInvalid);
			
			$(textbox).focus(() => {
				$root.addClass("tui-active");
			});
			$(textbox).blur(() => {
				$root.removeClass("tui-active");
				if (this.get("disable"))
					return;
				if (this.get("autoValidate")) {
					this.validate();
				}
			});
			
			if (tui.ieVer > 0 && tui.ieVer < 9) {
				$(textbox).on("propertychange", (e: any) => {
					if (e.originalEvent.propertyName !== 'value')
						return;
					this.updateEmptyState(textbox.value === "");
					var oldHeight = browser.getCurrentStyle(textbox).height;
					textbox.style.height = "";
					if (this._valid && textbox.scrollHeight !== this._lastTextHeight)
						this.render();
					else
						textbox.style.height = oldHeight;
					this.reset();
					this.fire("input", e);
				});
			} else {
				$(textbox).on("input", (e) => {
					this.updateEmptyState(textbox.value === "");
					var oldHeight = browser.getCurrentStyle(textbox).height;
					textbox.style.height = "";
					if (this._valid && textbox.scrollHeight !== this._lastTextHeight)
						this.render();
					else
						textbox.style.height = oldHeight;
					this.reset();
					this.fire("input", e);
				});
			}
			$(textbox).on("change", (e) => {
				this.fire("change", e);
			});
			
			$root.mousedown((e)=>{
				if (this.get("disable"))
					return;
				var obj = e.target || e.srcElement;
				if (obj === textbox) {
					return;
				}
				setTimeout(() => {
					textbox.focus();
				}, 0);
			});
			$root.click((e)=>{
				if (this.get("disable"))
					return;
				var obj = e.target || e.srcElement;
				if (obj === textbox) {
					return;
				}
			});
			
			this.on("resize", () => {
				this.render();
			});
		}
		
		render(): void {
			this._.scrollLeft = 0;
			var $root = $(this._);
            
			var textbox = this._components["textbox"];
			var iconInvalid = this._components["iconInvalid"];
			var placeholder = this._components["placeholder"];
			if (this.get("disable")) {
				$root.addClass("tui-disable");
				textbox.setAttribute("readonly", "readonly"); 
			} else {
				$root.removeClass("tui-disable");
				textbox.removeAttribute("readonly");
			}
			var marginLeft = Input.PADDING;
			var marginRight = Input.PADDING;
			
			if (!this._valid) {
				$root.addClass("tui-invalid");
				iconInvalid.style.display = "";
				iconInvalid.style.right = "0px";
			} else {
				$root.removeClass("tui-invalid");
				iconInvalid.style.display = "none";
			}
			textbox.style.height = "";
			this._lastTextHeight = textbox.scrollHeight;
			textbox.style.height = textbox.scrollHeight + 2 + "px";
			this._.style.height = textbox.scrollHeight + 4 + "px";
			
			textbox.style.left = marginLeft + "px";
			textbox.style.width = this._.clientWidth - iconInvalid.offsetWidth - marginLeft - marginRight + "px";
			
			var phText = this.get("placeholder");
			var showPh = phText && !this.get("value"); 
			if (showPh) {
				placeholder.innerHTML = phText;
				placeholder.style.left = marginLeft + "px";
				placeholder.style.width = textbox.style.width;
				placeholder.style.display = "";
			} else {
				placeholder.style.display = "none";
			}
			
			if (!this._valid && this._invalidMessage) {
				this._set("follow-tooltip", this._invalidMessage);
			} else {
				this._set("follow-tooltip", null);
			}
		}
	}
	
	register(Textarea);
	registerResize(Textarea);
}
