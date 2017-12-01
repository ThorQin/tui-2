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
			var textbox = this._components["textbox"] = <HTMLTextAreaElement>elem("textarea");
			textbox.setAttribute("wrap", "physical");
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
				}
			});
		}

		private onInput(textbox: HTMLTextAreaElement, e: JQueryEventObject) {
			this.updateEmptyState(textbox.value === "");
			var oldHeight = browser.getCurrentStyle(textbox).height;
			textbox.style.height = "";
			if (this._valid && textbox.scrollHeight !== this._lastTextHeight)
				this.render();
			else
				textbox.style.height = oldHeight;
			this.reset();
			this.fire("input", e);
		}

		protected init(): void {
			var $root = $(this._);
			var placeholder = this._components["placeholder"] = elem("span");
			var textbox = <HTMLTextAreaElement>this._components["textbox"];
			var iconInvalid = this._components["iconInvalid"] = elem("i");
			iconInvalid.className = "tui-invalid-icon";
			placeholder.className = "tui-placeholder";
			placeholder.setAttribute("unselectable","on");
			this._.appendChild(placeholder);
			this._.appendChild(textbox);
			this._.appendChild(iconInvalid);

			$(textbox).focus(() => {
				$root.addClass("tui-active");
				//this.render();
			});
			$(textbox).blur(() => {
				$root.removeClass("tui-active");
				//this.render();
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
			$(textbox).on("change", (e) => {
				this.fire("change", e);
			});

			// $root.mousedown((e)=>{
				// if (this.get("disable"))
				// 	return;
				// var obj = e.target || e.srcElement;
				// if (obj === textbox) {
				// 	e.stopImmediatePropagation();
				// 	e.stopPropagation();
				// 	return;
				// }
				// setTimeout(() => {
				// 	textbox.focus();
				// }, 0);
			// });
			// $root.click((e)=>{
			// 	if (this.get("disable"))
			// 		return;
			// 	var obj = e.target || e.srcElement;
			// 	if (obj === textbox) {
			// 		return;
			// 	}
			// });

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
			if (this._lastTextHeight < 66)
				this._lastTextHeight = 66;
			textbox.style.height = this._lastTextHeight + 2 + "px";
			this._.style.height = this._lastTextHeight + 4 + "px";

			textbox.style.left = marginLeft + "px";
			var width = this._.clientWidth - iconInvalid.offsetWidth - marginLeft - marginRight;
			if (width < 0)
				width = 0;
			textbox.style.width = width + "px";

			var phText = this.get("placeholder");
			var showPh = phText && !this.get("value");
			if (showPh) {
				$(placeholder).text(phText);
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

	register(Textarea, "textarea");
	registerResize("textarea");
}
