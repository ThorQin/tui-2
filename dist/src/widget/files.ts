/// <reference path="base.ts" />
/// <reference path="../browser/upload.ts" />
module tui.widget {
	"use strict";

	interface FileItem {
		fileId: string;
		fileName: string;
		mimeType: string;
		url: string;
		length: number;
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
		if (!item) {
			return "file-type-unknow";
		} else if (IMAGE_EXT.test(item.fileName) || IMAGE_MIME.test(item.mimeType)) {
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
			this._uploadBox = <HTMLDivElement>elem("div");
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
				},
				"reorder": {
					"set": (value: any) => {
						if (typeof value != UNDEFINED)
							this._data["reorder"] = !!value;
					},
					"get": () : any => {
						return !!this._data["reorder"];
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
					length: e.data.response.length,
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

		private bindRemove(removeIcon: HTMLElement, fileIndex: number) {
			$(removeIcon).click((e: JQueryEventObject) => {
				this._values.splice(fileIndex, 1);
				this.render();
				this.fire("delete", e);
				e.preventDefault();
				e.stopPropagation();
			});
		}

		private bindDownload(item: HTMLElement, url: string) {
			$(item).click(function(e: JQueryEventObject){
				window.open(url);
				e.preventDefault();
				e.stopPropagation();
			});
		}

		private bindReorder(item: HTMLElement, fileItem: FileItem) {
			if (!this.get("reorder")) {
				return;
			}
			var firstPoint: { x: number, y: number} = null;
			var oldRect: browser.Rect = null;
			$(item).on("mousedown", (ev: JQueryEventObject) => {
				if (browser.isLButton(ev)) {
					firstPoint = { x: ev.clientX, y: ev.clientY};
				} else
					firstPoint = null;
			});
			$(item).on("mouseup", (e: any) => {
				firstPoint = null;
			});
			$(item).on("mousemove", (e: any) => {
				var ev = <JQueryEventObject>e;
				ev.preventDefault();
				if (!browser.isLButton(ev) || !firstPoint)
					return;
				if (browser.isPosterity(item, e.target) &&
					(Math.abs(ev.clientX - firstPoint.x) >= 5 ||
						Math.abs(ev.clientY - firstPoint.y) >= 5)) {

					var pos = (<any>item)._index;
					var placeholder = elem("div");
					placeholder.className = "tui-files-item";
					//placeholder.style.backgroundColor = "#ccc";
					placeholder.style.verticalAlign = "middle";

					var divStyle = browser.getCurrentStyle(item);
					placeholder.style.display = divStyle.display;
					// placeholder.style.width = item.offsetWidth + "px";
					// placeholder.style.height = item.offsetHeight + "px";

					oldRect = browser.getRectOfScreen(item);
					var curWidth = item.offsetWidth - parseFloat(divStyle.paddingLeft) - parseFloat(divStyle.paddingRight);
					item.style.position = "fixed";
					item.style.zIndex = "100";
					item.style.opacity = "0.8";
					item.style.filter = "alpha(opacity=80)";
					item.style.left = oldRect.left + "px";
					item.style.top = oldRect.top + "px";
					var savedWidth = item.style.width;
					item.style.width = curWidth + "px";
					browser.addClass(item, "tui-form-item-moving");

					this._.insertBefore(placeholder, item);
					var targetIndex: number = null;

					tui.widget.openDragMask((e: JQueryEventObject) => {
						item.style.left = oldRect.left + e.clientX - firstPoint.x + "px";
						item.style.top = oldRect.top + e.clientY - firstPoint.y + "px";
						for (var i = 0; i < this._.childNodes.length; i++) {
							var icon = <HTMLElement>this._.childNodes[i];
							if (icon !== item && typeof (<any>icon)._index === "number") {
								var testHeight = browser.getCurrentStyle(icon).display === "block" || placeholder.style.display === "block";
								var rc = browser.getRectOfScreen(icon);
								if (testHeight) {
									if (e.clientX > rc.left && e.clientX < rc.left + rc.width &&
										e.clientY > rc.top && e.clientY < rc.top + rc.height / 2) {
										this._.insertBefore(placeholder, icon);
										targetIndex = (<any>icon)._index;
										break;
									} else if (e.clientX > rc.left && e.clientX < rc.left + rc.width &&
										e.clientY > rc.top + rc.height / 2 && e.clientY < rc.top + rc.height) {
										this._.insertBefore(placeholder, icon.nextSibling);
										targetIndex = (<any>icon)._index + 1;
										break;
									}
								} else {
									if (e.clientX > rc.left && e.clientX < rc.left + rc.width / 2 &&
										e.clientY > rc.top && e.clientY < rc.top + rc.height) {
										this._.insertBefore(placeholder, icon);
										targetIndex = (<any>icon)._index;
										break;
									} else if (e.clientX > rc.left + rc.width / 2 && e.clientX < rc.left + rc.width &&
										e.clientY > rc.top && e.clientY < rc.top + rc.height) {
										this._.insertBefore(placeholder, icon.nextSibling);
										targetIndex = (<any>icon)._index + 1;
										break;
									}
								}
							}
						}
					}, (e: JQueryEventObject) => {
						firstPoint = null;
						item.style.position = "";
						item.style.zIndex = "";
						item.style.opacity = "";
						item.style.filter = "";
						item.style.left = "";
						item.style.top = "";
						item.style.width = savedWidth;
						browser.removeClass(item, "tui-form-item-moving");
						this._.removeChild(placeholder);
						if (targetIndex != null && targetIndex != pos) {
							this._values.splice(pos, 1);
							if (targetIndex < pos)
								this._values.splice(targetIndex, 0, fileItem);
							else
								this._values.splice(targetIndex - 1, 0, fileItem);
							this.render();
						}
					});
				}
			});
		}

		render(): void {
			browser.removeNode(this._uploadBox);
			this._.innerHTML = "";
			var readonly = !!this.get("readonly");
			var disable = !!this.get("disable");
			for (let i = 0; i < this._values.length; i++) {
				let fileItem = this._values[i];
				let item = elem("div");
				(<any>item)._index = i;
				item.className = "tui-files-item";
				let label = elem("div");
				item.appendChild(label);
				let nameText = fileItem ? browser.toSafeText(fileItem.fileName) : "NOT FOUND";
				item.setAttribute("tooltip", nameText)
				label.innerHTML = nameText;
				if (fileItem && fileItem.url && (IMAGE_EXT.test(fileItem.fileName) || IMAGE_MIME.test(fileItem.mimeType))) {
					let image = <HTMLImageElement>elem("img");
					image.src = fileItem.url;
					item.appendChild(image);
				} else {
					item.className += " " + getFileTypeIcon(fileItem);
				}

				if (!readonly && !disable) {
					let removeIcon = <HTMLElement>elem("span");
					removeIcon.className = "tui-files-remove-icon";
					item.appendChild(removeIcon);
					this.bindRemove(removeIcon, i);
					if (this.get("reorder")) {
						this.bindReorder(item, fileItem);
					}
				}

				if (!disable && fileItem && fileItem.url) {
					this.bindDownload(item, fileItem.url);
				}

				this._.appendChild(item);
			}
			if (!(readonly || disable || typeof this.get("max") === "number" && this._values.length >= this.get("max")))
				this._.appendChild(this._uploadBox);
				this._uploader.createInput();
		}
	}

	register(Files, "files");

}
