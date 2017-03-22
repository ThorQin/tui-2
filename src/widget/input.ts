/// <reference path="inputBase.ts" />
/// <reference path="../browser/keyboard.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <input>
	 * Attributes: value, text, type, iconLeft, iconRight, autoValidate
	 * Events: input, change, left-icon-mousedown, right-icon-mousedown, left-icon-click, right-icon-click
	 */
	export class Input extends InputBase {
		
		static PADDING = 6;
		
		protected initRestriction(): void {
			super.initRestriction();
			var textbox = this._components["textbox"] = <HTMLInputElement>elem("input");
			this.setRestrictions({
				"value": {
					"set": (value: any) => {
						textbox.value = (value != null ? value : "");
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
				},
				"type": {
					"set": (value: any) => {
						value = value.toLowerCase();						
						if (["text", "password", "email", "url", "number"].indexOf(value) < 0)
							return;
						textbox.setAttribute("type", value);
					},
					"get": (): any => {
						return textbox.getAttribute("type");
					}
				}
			});
		}

		private onInput(textbox: HTMLInputElement, e: JQueryEventObject) {
			this.updateEmptyState(textbox.value === "");
			this.reset();
			this.fire("input", e);
		}
		
		protected init(): void {
			var $root = $(this._);
			var placeholder = this._components["placeholder"] = elem("span");
			var textbox = <HTMLInputElement>this._components["textbox"];
			var iconLeft = this._components["iconLeft"] = elem("i");
			var iconRight = this._components["iconRight"] = elem("i");
			var iconInvalid = this._components["iconInvalid"] = elem("i");
			var clearButton = this._components["clearButton"] = elem("i");
			iconInvalid.className = "tui-invalid-icon";
			clearButton.className = "tui-input-clear-button";
			placeholder.className = "tui-placeholder";
			placeholder.setAttribute("unselectable","on");
			this._.appendChild(placeholder);
			this._.appendChild(iconLeft);
			this._.appendChild(textbox);
			this._.appendChild(iconInvalid);
			this._.appendChild(iconRight);
			this._.appendChild(clearButton);
			
			$(textbox).focus(() => {
				$root.addClass("tui-active");
				this.render();
			});
			$(textbox).blur(() => {
				$root.removeClass("tui-active");
				this.render();
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
					this.onInput(textbox, e);
				});
			} else {
				if (tui.ieVer === 9) {
					$(textbox).on("keyup", (e) => {
						if (e.keyCode = browser.KeyCode.BACK)
							this.onInput(textbox, e);
					});
				}
				$(textbox).on("input", (e) => {
					this.onInput(textbox, e);
				});
			}
			$(textbox).on("keydown", (e) => {
				if (e.keyCode === browser.KeyCode.ENTER) {
					this.fire("enter", e);
				}
			});
			$(textbox).on("change", (e) => {
				this.fire("change", e);
			});
			$(clearButton).on("mousedown", (e) => {
				this.set("value", "");
				this.reset();
				this.fire("change", e);
				e.stopPropagation();
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
					if (obj === iconLeft) {
						this.fire("left-icon-mousedown", e);
					}
					if (obj === iconRight) {
						this.fire("right-icon-mousedown", e);
					}
				}, 0);
			});
			$root.click((e)=>{
				if (this.get("disable"))
					return;
				var obj = e.target || e.srcElement;
				if (obj === textbox) {
					return;
				}
				if (obj === iconLeft) {
					this.fire("left-icon-click", e);
				}
				if (obj === iconRight) {
					this.fire("right-icon-click", e);
				}
			});
			
			this.on("resize", () => {
				this.render();
			});
		}

		focus() {
			var textbox = this._components["textbox"];
			textbox.focus();
		}
		
		render(): void {
			this._.scrollLeft = 0;
			var $root = $(this._);
            
			var textbox = this._components["textbox"];
			var iconLeft = this._components["iconLeft"];
			var iconRight = this._components["iconRight"];
			var iconInvalid = this._components["iconInvalid"];
			var placeholder = this._components["placeholder"];
			var clearButton = this._components["clearButton"];
			if (this.get("disable")) {
				$root.addClass("tui-disable");
				textbox.setAttribute("readonly", "readonly"); 
			} else {
				$root.removeClass("tui-disable");
				textbox.removeAttribute("readonly");
			}
			var marginLeft = 0;
			if (this.get("iconLeft")) {
				iconLeft.className = this.get("iconLeft"); 
				iconLeft.style.display = "";
				iconLeft.style.left = "0";
			} else {
				iconLeft.className = "";
				iconLeft.style.display = "none";
				marginLeft = Input.PADDING;
			}
			
			var marginRight = 0;
			if (this.get("iconRight")) {
				iconRight.className = this.get("iconRight"); 
				iconRight.style.display = "";
				iconRight.style.right = "0";
			} else {
				iconRight.className = "";
				iconRight.style.display = "none";
				marginRight = Input.PADDING;
			}
			
			if (!this._valid) {
				$root.addClass("tui-invalid");
				iconInvalid.style.display = "";
				iconInvalid.style.right = iconRight.offsetWidth + "px";
			} else {
				$root.removeClass("tui-invalid");
				iconInvalid.style.display = "none";
				if (marginRight === 0)
					marginRight = Input.PADDING;
			}

			if (this.get("clearable") && this.get("value").length > 0 && $root.hasClass("tui-active") && !this.get("disable") ) {
				clearButton.style.display = "";
				clearButton.style.right = iconRight.offsetWidth + iconInvalid.offsetWidth + "px";  
			} else {
				clearButton.style.display = "none";
			}
			
			textbox.style.left = iconLeft.offsetWidth + marginLeft + "px";
			var width = this._.clientWidth - 
				iconLeft.offsetWidth - 
				iconInvalid.offsetWidth - 
				iconRight.offsetWidth - 
				clearButton.offsetWidth -
				marginLeft - marginRight;
			if (width < 0)
				width = 0;
			textbox.style.width = width + "px";
			
			var phText = this.get("placeholder");
			var showPh = phText && !this.get("value"); 
			if (showPh) {
				$(placeholder).text(phText);
				placeholder.style.left = iconLeft.offsetWidth + marginLeft + "px";
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
	
	register(Input, "input");
	registerResize("input");
}
