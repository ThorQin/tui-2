/// <reference path="base.ts" />
/// <reference path="../browser/upload.ts" />

module tui.widget {
	"use strict";

	export class Picture extends Widget {
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
				}
			});
		}

		protected init(): void {
			var img = this._components["image"] = elem("img");
			var toolbar = this._components["toolbar"] = elem("div");
			this._.appendChild(img);
			this._.appendChild(toolbar);
			this._uploader.on("success", (e: any) => {
				this._set("value", e.data.response);
				this.fire("success", e);
			});
			this._uploader.on("error", (e: any) => {
				if (this.fire("error", e) === false)
					return;
				tui.errbox(e.data.response.error, tui.str("Error"));
			});

			this.setInit("accept", "image/png, image/jpeg, image/gif");
			var $root = $(this._);
			$root.on("dragenter", (e) => {
				e.preventDefault();
				e.stopPropagation();
				this._uploader.deleteInput();
				$root.addClass("tui-drag-enter");
			});

			$root.on("dragleave", (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (!this.get("disable")) {
					this._uploader.createInput();
				}
				$root.removeClass("tui-drag-enter");
			});

			$root.on("dragover",function(e){
				e.preventDefault();
			});

			$root.on("drop", (e) => {
				e.preventDefault();
				e.stopPropagation();
				var dts: DataTransfer = (<any>e.originalEvent).dataTransfer;
				if (dts && dts.files && dts.files.length > 0) {
					var fileName = dts.files[0].name;
					if (/\.(jpg|jpeg|png|gif)$/i.test(fileName))
						this._uploader.uploadV5(fileName, dts.files[0]);
					else
						tui.errbox(tui.str("invalid.file.type"))
				}
				if (!this.get("disable")) {
					this._uploader.createInput();
				}
				$root.removeClass("tui-drag-enter");
			});

			$root.on("mouseenter mouseover", () => {
				if (this.get("disable"))
					return;
				var v = this.get("value");
				if (v && v.url)
					browser.addClass(toolbar, "tui-toolbar-show");
			});
			$root.on("mouseleave mouseout", function(){
				browser.removeClass(toolbar, "tui-toolbar-show");
			});
			$(toolbar).click((e) => {
				if (this.get("disable"))
					return;
				this.set("value", null);
				browser.removeClass(toolbar, "tui-toolbar-show");
			});
		}

		render() {
			var $root = $(this._);
			if (this.get("disable")) {
				this._uploader.deleteInput();
				this._.setAttribute("tabIndex", "0");
			} else {
				this._uploader.createInput();
				this._.removeAttribute("tabIndex");
			}
			var v = this.get("value");
			var url = v && v.url;
			var img = this._components["image"]
			if (url) {
				$root.removeClass("tui-picture-empty");
				if (url !== img.getAttribute("src"))
					img.setAttribute("src", url);
			} else {
				$root.addClass("tui-picture-empty");
			}
		}

	}

	register(Picture, "picture");

}