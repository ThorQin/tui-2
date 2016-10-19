/// <reference path="core.ts" />
/// <reference path="widget/dialog.ts" />
module tui.ajax {
	
	$.ajaxSetup({
		"timeout": 30000,
	});
	
	export function send(url: string, method: string, data?: any, options?: {[index: string]: any}): JQueryDeferred<JQueryXHR> {
		var deffered = $.Deferred<JQueryXHR>();
		var waitbox: {close: ()=>void} = null;
		if (!options || !options["silent"])
			waitbox = tui.waitbox(tui.str("Processing..."));
		var ajaxData: {[index: string]: any} = {
			"type": method.toUpperCase(),
			"url": url,
			"contentType": "application/json",
			"data": (method.toUpperCase() === "GET" ? data : JSON.stringify(data)),
			"complete": function (jqXHR: JQueryXHR, status: string) {
				waitbox && waitbox.close();
				if (status === "success") {
					var respJson = /^\s*application\/json\s*(;.+)?/i.test(jqXHR.getResponseHeader("content-type"));
					var respVal = (respJson ? (<any>jqXHR).responseJSON : jqXHR.responseText);
					deffered.resolve(jqXHR, respVal);
				} else {
					var plainType = /^\s*text\/plain\s*(;.+)?/i.test(jqXHR.getResponseHeader("content-type"));
					var respText: string;
					if (plainType && jqXHR.responseText)
						respText = tui.str(jqXHR.responseText);
					else {
						if (jqXHR.status != 0)
							respText = tui.str(status) + " (" + jqXHR.status + ")";
						else
							respText = "Operation was canceled!";
					}
					if ((!options || !options["silent"]) && jqXHR.status != 0)
						tui.errbox(respText);
					deffered.reject(jqXHR, status, respText);
				}
			},
			"processData": (method.toUpperCase() === "GET" ? true : false)
		};
		
		if (options) {
			for (var k in options) {
				if (options.hasOwnProperty(k)) {
					ajaxData[k] = options[k];
				}
			}
		}
		
		$.ajax(ajaxData);
		return deffered;
	}
	
	export function post(url: string, data: any, options?: {[index: string]: any}) {
		return send(url, "post", data, options);
	}
	
	export function post_(url: string, data: any, options?: {[index: string]: any}) {
		if (!options)
			options = {"silent": true};
		else
			options["silent"] = true;
		return send(url, "post", data, options);
	}
	
	export function get(url: string, options?: {[index: string]: any}) {
		return send(url, "get", null, options);
	}
	
	export function get_(url: string, options?: {[index: string]: any}) {
		if (!options)
			options = {"silent": true};
		else
			options["silent"] = true;
		return send(url, "get", null, options);
	}
	
	(<any>window).$ajax = send;
	(<any>window).$post = post;
	(<any>window).$post_ = post_; // silent mode
	(<any>window).$get = get;
	(<any>window).$get_ = get_; // silent mode
}
