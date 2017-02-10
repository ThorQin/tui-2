/// <reference path="inputBase.ts" />
/// <reference path="../browser/upload.ts" />
module tui.widget {
	"use strict";

	export class File extends InputBase {
		private static PADDING = 6;

		private _uploader: browser.Uploader;
		
		protected initRestriction(): void {
			super.initRestriction();
			this._uploader = browser.createUploader(this._);
			this.setRestrictions({
				"action": {
					"set":  (value: any) => {
						this._uploader.getOptions().action = value;
					}, 
					"get": (): any => {
						return this._uploader.getOptions().action;
					}
				},
				"accept": {
					"set":  (value: any) => {
						this._uploader.getOptions().accept = value;
						if (this._uploader.getInput()) {
							this._uploader.deleteInput();
							this._uploader.createInput();
						}
					}, 
					"get": (): any => {
						return this._uploader.getOptions().accept;
					}
				},
				"value": {
					"set": (value: any) => {
						this._data["value"] = value;
						if (value === null || typeof value === tui.UNDEFINED) {
							this._set("text", "");
						}
					}
				}
			});
		}

		protected init(): void {
			this.setInit("iconRight", "fa-file-o"); 
			var $root = $(this._);
			var label = this._components["label"] = document.createElement("span");
			var iconRight = this._components["iconRight"] = document.createElement("i");
			var iconInvalid = this._components["iconInvalid"] = document.createElement("i");
			
			iconInvalid.className = "tui-invalid-icon";
			label.className = "tui-input-label";
			label.setAttribute("unselectable","on");
			this._.appendChild(label);
			this._.appendChild(iconInvalid);
			this._.appendChild(iconRight);
			this._.setAttribute("tabIndex", "0");
			$(this._).focus(() => {
				$root.addClass("tui-active");
			});
			var onblur = () => {
				if (document.activeElement === this._ || document.activeElement === this._uploader.getInput() )
					return;
				$root.removeClass("tui-active");
				if (this.get("disable"))
					return;
				if (this.get("autoValidate")) {
					this.validate();
				}
			};
			$(this._).blur(() => {
				setTimeout(function(){
					onblur();
				});
			});
			this._uploader.on("focus", ()=>{
				$root.addClass("tui-active");
			});
			this._uploader.on("blur", ()=>{
				setTimeout(function(){
					onblur();
				});
			});
			this._uploader.on("change", (e) => {
				return this.fire("change", e);
			});
			this._uploader.on("success", (e) => {
				this._set("value", e.data.response.fileId);
				this.set("text", e.data.response.fileName);
			});
			this._uploader.on("error", (e) => {
				tui.errbox(e.data.response.error, tui.str("Error"));
			});
		}
		
		render(): void {
			this._.scrollLeft = 0;
			var $root = $(this._);
            
			var label = this._components["label"];
			var iconRight = this._components["iconRight"];
			var iconInvalid = this._components["iconInvalid"];
			if (this.get("disable")) {
				$root.addClass("tui-disable");
				this._uploader.deleteInput();
				this._.setAttribute("tabIndex", "0");
			} else {
				$root.removeClass("tui-disable");
				this._uploader.createInput();
				this._.removeAttribute("tabIndex");
			}
			
			var text = this.get("text");
			if (text === null || text === "") {
				text = this.get("placeholder");
				$(label).addClass("tui-placeholder");
			} else {
				$(label).removeClass("tui-placeholder");
			}
			if (text === null)
				text = "";
			$(label).text(text);
			iconRight.className = this.get("iconRight"); 
			iconRight.style.display = "";
			iconRight.style.right = "0";
			
			if (!this._valid) {
				$root.addClass("tui-invalid");
				iconInvalid.style.display = "";
				iconInvalid.style.right = iconRight.offsetWidth + "px";
			} else {
				$root.removeClass("tui-invalid");
				iconInvalid.style.display = "none";
			}
			
			if (!this._valid && this._invalidMessage) {
				this._set("follow-tooltip", this._invalidMessage);
			} else {
				this._set("follow-tooltip", null);
			}
		}
	}
	
	register(File, "file");
	
}
