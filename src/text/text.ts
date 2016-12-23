/// <reference path="../core.ts" />
module tui.text {
	"use strict";
	/**
     * Convert anything to boolean
     */
    export function parseBoolean(value: any) {
        if (typeof value === UNDEFINED)
            return false;
		if (typeof value === "number")
			return isNaN(value) && value != 0;
        switch (String(str).toLowerCase()) {
            case "true":
            case "1":
            case "yes":
            case "y":
                return true;
            default:
                return false;
        }
    }
	
	/**
	 * Format a string use a set of parameters
	 */
	export function format(token: string, ...params: any[]): string {
		var formatrg = /\{(\d+)\}/g;
		token && (typeof token === "string") && params.length && (token = token.replace(formatrg, function(str, i) {
			return params[i] === null ? "" : params[i];
		}));
		return token ? token : "";
	}

	/**
	 * Convert 'aaaBbbCcc' to 'aaa-bbb-ccc'
	 */
	export function toDashSplit(word: string): string {
		var buffer: string = '';
		for (let i = 0; i < word.length; i++) {
			let c = word.charAt(i);
			let code = c.charCodeAt(0);
			if (code >= 65 && code <= 90) {
				if (i > 0)
					buffer += '-';
				buffer += c.toLowerCase();
			} else
				buffer += c;
		}
		return buffer;
	}
	
	/**
	 * Convert 'aaa-bbb-ccc' or 'aaa_bbb_ccc' to 'aaaBbbCcc' 
	 */
	export function toCamel(word: string): string {
		var buffer: string = '';
		word = word.toLowerCase();
		for (let i = 0; i < word.length; i++) {
			let c = word.charAt(i);
			if (c === '-' || c === '_') {
				if (++i < word.length)
					buffer += word.charAt(i).toUpperCase();
			} else
				buffer += c;
		}
		return buffer;
	}
	
	
	/**
	 * Format a number that padding it with '0'
	 */
	export function paddingNumber(v: number, min: number, max?: number, alignLeft: boolean = false): string {
		var result = Math.abs(v) + "";
		while (result.length < min) {
			result = "0" + result;
		}
		if (typeof max === "number" && result.length > max) {
			if (alignLeft)
				result = result.substr(0, max);
			else
				result = result.substr(result.length - max, max);
		}
		if (v < 0)
			result = "-" + result;
		return result;
	}

	/**
	 * Get the parameter of the URL query string.
	 * @param {String} url
	 * @param {String} key Parameter name
	 */
	export function getUrlParam(url: string, key: string): string {
		key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
			results = regex.exec(url);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	/**
	 * Get the anchor of the URL query string.
	 * @param {String} url
	 */
	export function getUrlAnchor(url: string): string {
		var anchor: any = location.href.match("(#.+)(?:\\?.*)?");
		if (anchor)
			anchor = anchor[1];
		return anchor;
	}

}