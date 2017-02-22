/// <reference path="../core.ts" />
/// <reference path="browser.ts" />
module tui.browser {
	"use strict";

	function fileFromPath(file: string): string {
		return file.replace(/.*(\/|\\)/, "");
	}

	function getExt(file: string): string {
		return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
	}

	function preventDefault(e: JQueryEventObject) {
		return e.preventDefault();
	}

	export interface UploadOptions {
		// Location of the server-side upload script
		action: string;
		// File upload name
		name: string;
		// Select & upload multiple files at once FF3.6+, Chrome 4+
		multiple?: boolean;
		// Accept file type only worked with HTML5
		accept?: string;
		// Submit file as soon as it's selected
		autoSubmit?: boolean;
    }

	export class Uploader extends EventObject {
		private _settings: UploadOptions = {
			action: "upload",
			name: "file",
			multiple: false,
			autoSubmit: true
		};
        private _container: HTMLElement = null;       
		private _input: HTMLInputElement = null;

		constructor(container: HTMLElement, options?: UploadOptions) {
			super();
			this.setOptions(options);
			if (!container || container.nodeType !== 1) {
				throw new Error("Please make sure that you're passing a valid element");
			}
			if ((<string>container.nodeName).toLowerCase() === 'a') {
				// disable link
				$(container).on('click', function(e){e.preventDefault()});
			}
			// DOM element
			this._container = container;
			// DOM element                 
			this._input = null;
		}
		
		setOptions(options: UploadOptions) {
			if (options) {
				for (var i in options) {
					if (options.hasOwnProperty(i)) {
						(<any>this._settings)[i] = (<any>options)[i];
					}
				}
			}
		}
		
		getOptions(): UploadOptions {
			return this._settings;
		}

		private createIframe() {
			var id = tui.tuid();
			var iframe = <HTMLIFrameElement>browser.toElement('<iframe src="javascript:false;" name="' + id + '" />');
			iframe.setAttribute('id', id);
			iframe.style.display = 'none';
			document.body.appendChild(iframe);
			var doc = iframe.contentDocument ? iframe.contentDocument : (<any>window.frames)[iframe.id].document;
			try {
				doc.charset = "utf-8";
			} catch(e) {}
			return iframe;
		}

		private createForm(iframe: HTMLIFrameElement) {
			var settings = this._settings;                  
			var form = <HTMLFormElement>browser.toElement('<form method="post" enctype="multipart/form-data" accept-charset="UTF-8"></form>');
			form.setAttribute('accept-charset', 'UTF-8');
			if (settings.action)
				form.setAttribute('action', settings.action);
			form.setAttribute('target', iframe.name);
			form.style.display = 'none';
			document.body.appendChild(form);
			// Create hidden input element for each data key
			
			return form;
        }

		createInput() {
			if (this._input) {
				return;
			}
			var input = document.createElement("input");
			input.setAttribute('type', 'file');
			if (this._settings.accept)
				input.setAttribute('accept', this._settings.accept);
			input.setAttribute('name', this._settings.name);
			if (this._settings.multiple)
				input.setAttribute('multiple', 'multiple');
			if (tui.ieVer > 0)
				input.title = "";
			else
				input.title = " ";
			$(input).css({
				'position': 'absolute',
				'right': 0,
				'top': 0,
				'height': '1000px',
				'width': '2000px',
				'margin': 0,
				'padding': 0,
				'opacity': 0,
				'filter': 'alpha(opacity=0)',
				'fontSize': '10000px',
				'fontFamily': 'sans-serif',
				'cursor': 'pointer'
			});
			
			$(input).on('change', (e) => {
				if (!input || input.value === '') {
					return;
				}
				// Get filename from input, required                
				// as some browsers have path instead of it
				var file = fileFromPath(input.value);
				var fileExt = getExt(file);
				
				if (this.fire("change", {e:e, "file": file, "ext": fileExt }) === false) {
					this.clearInput();
					return;
				}
				// Submit form when value is changed
				if (this._settings.autoSubmit) {
					this.submit();
				}
			});
			var style = <CSSStyleDeclaration>browser.getCurrentStyle(this._container);
			if (style.position === "static") {
				this._container.style.position = "relative";
			}
			this._container.style.overflow = "hidden";
			this._container.appendChild(input);
			this._input = input;
			$(this._input).focus(()=>{
				this.fire("focus");
			});
			$(this._input).blur(()=>{
				this.fire("blur");
			});
		}

		deleteInput() {
			if (!this._input) {
				return;
			}
			browser.removeNode(this._input);
			this._input = null;
		}
		
		getInput() {
			return this._input;
		}

		private clearInput() {
			this.deleteInput();
			this.createInput();
		}

		/**
		* Gets response from iframe and fires onComplete event when ready
		* @param iframe
		* @param file Filename to use in onComplete callback 
		*/
		private processResponse(iframe: HTMLIFrameElement, file: string) {
			// getting response
			var waitbox = tui.waitbox(tui.str("Uploading..."));
			var toDeleteFlag = false, settings = this._settings;
			$(iframe).on('load', () => {
				if (// For Safari 
					iframe.src === "javascript:'%3Chtml%3E%3C/html%3E';" ||
					// For FF, IE
					iframe.src === "javascript:'<html></html>';") {
					// First time around, do not delete.
					// We reload to blank page, so that reloading main page
					// does not re-submit the post.
					if (toDeleteFlag) {
						// Fix busy state in FF3
						setTimeout(() => {
							browser.removeNode(iframe);
						}, 0);
					}
					return;
				}

				var doc = iframe.contentDocument ? iframe.contentDocument : (<any>window.frames)[iframe.id].document;
				// fixing Opera 9.26,10.00
				if (doc.readyState && doc.readyState !== 'complete') {
					waitbox.close();
					return;
				}
				// fixing Opera 9.64
				if (doc.body && doc.body.innerHTML === "false") {
					waitbox.close();
					return;
				}
				waitbox.close();
				var response: string;
				if (doc.body) {
					// response is html document or plain text
					response = doc.body.innerHTML;
					try {
						if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() === 'PRE') {
							doc.normalize && doc.normalize();
							response = doc.body.firstChild.firstChild.nodeValue;
						}
						if (response) {
							var responseObj = eval("(" + response + ")");
							if (!responseObj) {
								this.fireError();
							} else if (responseObj.error) {
								this.fireError(responseObj.error);
							} else if (responseObj.fileId && responseObj.fileName)
								this.fire("success", { "file": file, "ext": getExt(file), "response": responseObj });
							else
								this.fireError();
						} else {
							this.fireError();
						}
					} catch (e) {
						this.fireError();
					}
				} else {
					this.fireError();
				}
				
				// Reload blank page, so that reloading main page
				// does not re-submit the post. Also, remember to
				// delete the frame
				toDeleteFlag = true;
				// Fix IE mixed content issue
				iframe.src = "javascript:'<html></html>';";
				browser.removeNode(iframe);
			});
        }
		
		private fireInvalidError() {
			this.fire("error", { "response": { error: tui.str("Upload failed: invalid response content!") } });
		}
		
		private fireError(errorMessage?: string) {
			this.fire("error", { "response": { 
				error: tui.str("Upload failed!") + (errorMessage ? errorMessage : "") 
			} });
		}

		uploadV5(file: string, fileObject: File, extraData?: {[index: string]: string}) {
			var waitbox = tui.waitbox(tui.str("Uploading..."));
			var fd = new FormData();
            fd.append(this._settings.name, fileObject);
			if (extraData) {
				for (let key in extraData) {
					if (extraData.hasOwnProperty(key)) {
						fd.append(key, extraData[key]);
					}
				}
			}
			
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (e: any) => {
				if (e.lengthComputable) {
					var percentComplete = Math.round(e.loaded * 100 / e.total);
					waitbox.setMessage(tui.str("Uploading... ") + percentComplete.toString() + '%');
				}
			}, false);
            xhr.addEventListener("load", (e: any) => {
				waitbox.close();
				if (e.target.status != 200) {
					this.fire("error", { "file": file, "ext": getExt(file), "response": { 
						error: tui.str(e.target.response || e.target.statusText || e.target.status) 
					} });
				} else {
					try {
						var result = JSON.parse(e.target.responseText)
						if (result.fileId && result.fileName)
							this.fire("success", { "file": file, "ext": getExt(file), "response": result });
						else
							this.fireError();
					} catch(e) {
						this.fireInvalidError();
					}
				}
			}, false);
            xhr.addEventListener("error", (e: any) => {
				waitbox.close();
				this.fireError();
			}, false);
            xhr.addEventListener("abort", (e: any) => {
				waitbox.close();
				this.fireError();
			}, false);
            xhr.open("POST", this._settings.action);
            xhr.send(fd);
		}
		
		private submitV5(file: string, extraData?: {[index: string]: string}) {
			if (this._input.files.length > 0) {
				var fileObject = this._input.files[0];
				this.uploadV5(file, fileObject, extraData);
			}
			this.clearInput();
		}
		
		private submitV4(file: string, extraData?: {[index: string]: string}) {
			// sending request    
			var iframe = this.createIframe();
			var form = this.createForm(iframe);
			// assuming following structure
			// div -> input type='file'
			form.appendChild(this._input);
			if (extraData) {
				for (var prop in extraData) {
					if (extraData.hasOwnProperty(prop)) {
						var el = document.createElement("input");
						el.setAttribute('type', 'hidden');
						el.setAttribute('name', prop);
						el.setAttribute('value', extraData[prop]);
						form.appendChild(el);
					}
				}
			}
			this.processResponse(iframe, file);
			form.submit();
			// request set, clean up
			browser.removeNode(form);
			form = null;
			this.clearInput();
		}

		submit(extraData?: {[index: string]: string}) {
			if (!this._input || this._input.value === '') {
				return;
			}
			var file = fileFromPath(this._input.value);
			// user returned false to cancel upload
			if (this.fire("submit", { "file": file, "ext": getExt(file) }) === false) {
				this.clearInput();
				this.fire("blur");
				return;
			}
			this.fire("blur");
			if (typeof FormData === "function") { // HTML5
				this.submitV5(file, extraData);
			} else
				this.submitV4(file, extraData);
		}
	}

	export function createUploader(container: HTMLElement, options?: UploadOptions): Uploader {
		return new Uploader(container, options);
	}
}