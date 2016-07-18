/// <reference path="inputBase.ts" />
module tui.widget {
	"use strict";

	export abstract class SelectBase extends InputBase {
		private static PADDING = 6;
		
		abstract openSelect(): void; 
		
		protected _inSelection: boolean = false;
		
		closeSelect() {
			var popup = <Popup>get(this._components["popup"]);
			popup.close();
		}
	
		protected init(): void {
			var $root = $(this._);
			var popup = <Popup>create(Popup);
			this._components["popup"] = popup._;
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
			$(this._).blur(() => {
				$root.removeClass("tui-active");
				if (this.get("disable"))
					return;
				if (this.get("autoValidate")) {
					if (!this._inSelection)
						this.validate();
				}
			});			
			
			$root.on("mousedown", (e)=>{
				if (this.get("disable"))
					return;
				this._.focus();
				this.reset();
				setTimeout(() => {
					this._inSelection = true;
					this.openSelect();
				}, 0);
			});
			$root.keypress((e)=> {
				if (this.get("disable"))
					return;
				if (e.charCode === KeyCode.SPACE) {
					this.reset();
					setTimeout(() => {
						this._inSelection = true;
						this.openSelect();
					}, 0);
				}
			});
			
			popup.on("close", () => {
				this._inSelection = false;
				if (this.get("autoValidate")) {
					setTimeout(() => {
						if (document.activeElement !== this._)
							this.validate();
					});
				}
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
			} else {
				$root.removeClass("tui-disable");
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
	
}