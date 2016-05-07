/// <reference path="inputBase.ts" />
module tui.widget {
	"use strict";
	
	/**
	 * <input>
	 * Attributes: value, text, type, iconLeft, iconRight, autoValidate
	 * Events: input, change, left-icon-mousedown, right-icon-mousedown, left-icon-click, right-icon-click
	 */
	export class Input extends InputBase {
		
		private static PADDING = 6;
		
		protected initRestriction(): void {
			super.initRestriction();
			this.setRestrictions({
				"value": {
					"set": (value: any) => {
						var textbox = <HTMLInputElement>this._components["textbox"];
						if (textbox) {
							textbox.value = value;
						}
						this._data["value"] = value;
					},
					"get": (): any => {
						var textbox = <HTMLInputElement>this._components["textbox"];
						if (textbox) {
							return textbox.value;
						}
						return this._data["value"];
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
				,
				"type": {
					"set": (value: any) => {
						value = value.toLowerCase();
						if (value !== "text" && value !== "password")
							return;
						var textbox = <HTMLInputElement>this._components["textbox"];
						if (textbox) {
							textbox.setAttribute("type", value);
						}
						this._data["type"] = value;
					},
					"get": (): any => {
						var textbox = <HTMLInputElement>this._components["textbox"];
						if (textbox) {
							return textbox.getAttribute("type");
						}
						var value = this._data["type"];
						return (value ? value : "text");
					}
				}
			});
		}
		
		protected init(): void {
			var $root = $(this._);
			var value = this.get("value");
			var type = this.get("type");
			var placeholder = this._components["placeholder"] = document.createElement("span");
			var textbox = this._components["textbox"] = document.createElement("input");
			var iconLeft = this._components["iconLeft"] = document.createElement("i");
			var iconRight = this._components["iconRight"] = document.createElement("i");
			var iconInvalid = this._components["iconInvalid"] = document.createElement("i");
			iconInvalid.className = "tui-invalid-icon";
			placeholder.className = "tui-placeholder";
			placeholder.setAttribute("unselectable","on");
			this._.appendChild(placeholder);
			this._.appendChild(iconLeft);
			this._.appendChild(textbox);
			this._.appendChild(iconInvalid);
			this._.appendChild(iconRight);
			textbox.value = (value !== null ? value : "");
			textbox.setAttribute("type", value);
			
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
					this.reset();
					this.fire("input", e);
				});
			} else {
				$(textbox).on("input", (e) => {
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
		
		render(): void {
			this._.scrollLeft = 0;
			var $root = $(this._);
            
			var textbox = this._components["textbox"];
			var iconLeft = this._components["iconLeft"];
			var iconRight = this._components["iconRight"];
			var iconInvalid = this._components["iconInvalid"];
			var placeholder = this._components["placeholder"];
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
			
			textbox.style.left = iconLeft.offsetWidth + marginLeft + "px";
			textbox.style.width = this._.clientWidth - iconLeft.offsetWidth - iconInvalid.offsetWidth - iconRight.offsetWidth - marginLeft - marginRight + "px";
			
			var phText = this.get("placeholder");
			var showPh = phText && !this.get("value"); 
			if (showPh) {
				placeholder.innerHTML = phText;
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
	
	register(Input);
	registerResize(Input);
}