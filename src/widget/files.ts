/// <reference path="base.ts" />
/// <reference path="../browser/upload.ts" />
module tui.widget {
	"use strict";

	interface FileItem {
		fileId: string;
		fileName: string;
		mimeType: string;
		url: string;
	}

	var IMAGE_EXT = /\.(png|jpg|jpeg|gif)$/i;
	var IMAGE_MIME = /^image\/(png|jpeg|gif)$/i;
	var WORD_EXT = /\.(doc|docx|rft|docm)$/i;
	var WORD_MIME = /^application\/(rtf|vnd\.ms-word(\.document\.macroEnabled\.12)?|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/i;
	var EXCEL_EXT = /\.(xls|xlsx|xlsm|csv)$/i;
	var EXCEL_MIME = /^text\/csv|application\/(vnd\.ms-excel(\.sheet\.macroEnabled\.12)?|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/i;
	var PPT_EXT = /\.(ppt|pptx|ppat)$/i;
	var PPT_MIME = /^application\/(vnd\.ms-powerpoint(\.presentation\.macroEnabled\.12)?|vnd\.openxmlformats-officedocument\.presentationml\.presentation)$/i;
	var TXT_EXT = /\.(txt|log)$/i;
	var TXT_MIME = /^text\/plain$/i;
	var PDF_EXT = /\.pdf$/i;
	var PDF_MIME = /^application\/pdf$/i;

	function getFileTypeIcon(item: FileItem): string {
		if (IMAGE_EXT.test(item.fileName) || IMAGE_MIME.test(item.mimeType)) {
			return "file-type-image";
		} else if (WORD_EXT.test(item.fileName) || WORD_MIME.test(item.mimeType)) {
			return "file-type-word";
		} else if (EXCEL_EXT.test(item.fileName) || EXCEL_MIME.test(item.mimeType)) {
			return "file-type-excel";
		} else if (PPT_EXT.test(item.fileName) || PPT_MIME.test(item.mimeType)) {
			return "file-type-ppt";
		} else if (TXT_EXT.test(item.fileName) || TXT_MIME.test(item.mimeType)) {
			return "file-type-txt";
		} else if (PDF_EXT.test(item.fileName) || PDF_MIME.test(item.mimeType)) {
			return "file-type-pdf";
		} else
			return "file-type-unknow";
	}

	export class Files extends Widget {

		private _uploader: browser.Uploader;
		private _uploadBox: HTMLDivElement;
		private _values: FileItem[];
		
		protected initRestriction(): void {
			super.initRestriction();
			this._uploadBox = document.createElement("div");
			this._uploader = browser.createUploader(this._uploadBox);
			this._values = [];
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
						if (value instanceof Array) {
							this._values = value;
						} else if (value === null)
							this._values.length = 0;
					},
					"get": () : any => {
						return this._values;
					}
				}
			});
		}

		protected init(): void {
			this._uploadBox.className = "tui-files-upload-box";
			var onblur = () => {
				if (document.activeElement === this._ || document.activeElement === this._uploader.getInput() )
					return;
				$(this._uploadBox).removeClass("tui-active");
				if (this.get("disable"))
					return;
			};
			$(this._).blur(() => {
				setTimeout(function(){
					onblur();
				});
			});
			this._uploader.on("focus", () => {
				$(this._uploadBox).addClass("tui-active");
			});
			this._uploader.on("blur", ()=>{
				setTimeout(function(){
					onblur();
				});
			});
			this._uploader.on("change", (e: any) => {
				return this.fire("change", e);
			});
			this._uploader.on("success", (e: any) => {
				var newItem = {
					fileId: e.data.response.fileId,
					fileName: e.data.response.fileName,
					mimeType: e.data.response.mimeType,
					url: e.data.response.url
				}
				this._values.push(newItem);
				this.render();
				this.fire("success", e);
			});
			this._uploader.on("error", (e: any) => {
				if (this.fire("error", e) === false)
					return;
				tui.errbox(e.data.response.error, tui.str("Error"));
			});
		}
		
		render(): void {
			browser.removeNode(this._uploadBox);
			this._.innerHTML = "";
			for (let i = 0; i < this._values.length; i++) {
				var fileItem = this._values[i];
				var item = document.createElement("div");
				item.className = "tui-files-item";
				var label = document.createElement("div");
				item.appendChild(label);
				var nameText = browser.toSafeText(fileItem.fileName);
				item.setAttribute("tooltip", nameText)
				label.innerHTML = nameText;
				if (fileItem.url && (IMAGE_EXT.test(fileItem.fileName) || IMAGE_MIME.test(fileItem.mimeType))) {
					var image = <HTMLImageElement>document.createElement("img");
					image.src = fileItem.url;
					item.appendChild(image);
				} else {
					item.className += " " + getFileTypeIcon(fileItem);
				}
				this._.appendChild(item);
			}
			if (!(this.get("disable") || typeof this.get("max") === "number" && this._values.length >= this.get("max")))
				this._.appendChild(this._uploadBox);
		}
	}
	
	register(Files, "files");
	
}