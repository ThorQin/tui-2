/// <reference path="base.ts" />
module tui.widget {
	"use strict";
	var VALIDATORS: { [index: string]: string } = {
		"*email": "^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$",
		"*chinese": "^[\\u4e00-\\u9fa5]+$",
		"*url": "^http://([\\w-]+\\.)+[\\w-]+(/[\\w-./?%&=]*)?$",
		"*digital": "^\\d+$",
		"*integer": "^[+\\-]?\\d+$",
		"*float": "^[+\\-]?\\d*\\.\\d+$",
		"*number": "^[+\\-]?\\d+|(\\d*\\.\\d+)$",
		"*currency": "^-?\\d{1,3}(,\\d{3})*\\.\\d{2,3}$",
		"*date": "^[0-9]{4}-1[0-2]|0?[1-9]-0?[1-9]|[12][0-9]|3[01]$",
		"*key": "^[_a-zA-Z][a-zA-Z0-9_]*$",
		"*any": "\\S+"
	};
	
	export class Verify extends Item {}
	
	export abstract class InputBase extends Widget {
		protected _valid: boolean = true;
		protected _invalidMessage: string = null;
		
		protected initChildren(childNodes: Node[]) {
			var validators: any[] = [];
			for (let node of childNodes) {
				if (getFullName(node) === "tui:verify") {
					let format = (<HTMLElement>node).getAttribute("format");
					if (format) {
						let validator = {format: format, message: (<HTMLElement>node).innerHTML};
						validators.push(validator);
					}
				}
			}
			this._set("validate", validators);
		}
		
		validate(e?: JQueryEventObject): boolean {
			var text = this.get("text");
			if (text === null)
				text = "";
			this._valid = true;
			var validator = this.get("validate");
			
			if (!(validator instanceof Array))
				return true;
				
			for (let item of validator) {
				let k: string = item.format;
				if (k === "*password") {
					if (!/[a-z]/.test(text) ||
						!/[A-Z]/.test(text) ||
						!/[0-9]/.test(text) ||
						!/[\~\`\!\@\#\$\%\^\&\*\(\)\_\-\+\=\\\]\[\{\}\:\;\"\'\/\?\,\.\<\>\|]/.test(text) ||
						text.length < 6) {
						this._valid = false;
					}
				} else if (k.substr(0, 8) === "*maxlen:") {
					let imaxLen = parseFloat(k.substr(8));
					if (isNaN(imaxLen))
						throw new Error("Invalid validator: '*maxlen:...' must follow a number");
					let ival = text.length;
					if (ival > imaxLen) {
						this._valid = false;
					}
				} else if (k.substr(0, 8) === "*minlen:") {
					let iminLen = parseFloat(k.substr(8));
					if (isNaN(iminLen))
						throw new Error("Invalid validator: '*iminLen:...' must follow a number");
					let ival = text.length;
					if (ival < iminLen) {
						this._valid = false;
					}
				} else if (k.substr(0,5) === "*max:") {
					let imax = parseFloat(k.substr(5));
					if (isNaN(imax))
						throw new Error("Invalid validator: '*max:...' must follow a number");
					let ival = parseFloat(text);
					if (isNaN(ival) || ival > imax) {
						this._valid = false;
					}
				} else if (k.substr(0, 5) === "*min:") {
					let imin = parseFloat(k.substr(5));
					if (isNaN(imin))
						throw new Error("Invalid validator: '*min:...' must follow a number");
					let ival = parseFloat(text);
					if (isNaN(ival) || ival < imin) {
						this._valid = false;
					}
				} else if (k.substr(0, 6) === "*same:") {
					let other = k.substr(6);
					let o = get(other);
					if (o) {
						var otherText = o.get("text");
						if (otherText === null)
							otherText = "";
						if (text !== otherText)
							this._valid = false;
					} else {
						this._valid = false;
					}
				} else {
					var regexp: RegExp;
					if (k.substr(0, 1) === "*") {
						var v = VALIDATORS[k];
						if (v)
							regexp = new RegExp(v);
						else
							throw new Error("Invalid validator: " + k + " is not a valid validator");
					} else {
						regexp = new RegExp(k);
					}
					this._valid = regexp.test(text);
				}
				if (!this._valid) {
					this._invalidMessage = item.message;
					break;
				}
			}
			if (!this._valid && !this._invalidMessage) {
				this._invalidMessage = tui.str("Invalid input.");
			}
			this.render();
			if (e)
				this.fire("validate", {e: e, valid: this._valid, message: this._invalidMessage});
			return this._valid;
		}
	}
}