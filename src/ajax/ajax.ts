/// <reference path="../core.ts" />
/// <reference path="../widget/dialog.ts" />
module tui.ajax {
	
	$.ajaxSetup({
		"timeout": 30000,
		"xhrFields": {
			'withCredentials': true
		}
	});
	
	export function send(url: string, method: string, data?: any, options?: {[index: string]: any}): JQueryDeferred<any> {
		var deffered = $.Deferred<any>();
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
					deffered.resolve(respVal, jqXHR);
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
					deffered.reject(jqXHR.status, respText, jqXHR);
				}
			},
			"processData": false
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

	export function getScript(url: string): JQueryDeferred<any> {
		var deffered = $.Deferred<any>(); 
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4) {
				if (xhr.status == 200)
					deffered.resolve(xhr.responseText, xhr);
				else
					deffered.reject(xhr.status, xhr.responseText, xhr);
			}
		};
		xhr.open("GET", url, true);
		xhr.send(null);
		return deffered;
	}

	export function getBody(url: string): JQueryDeferred<any> {
		var deffered = $.Deferred<any>();
		getScript(url).done(function(result){
			var html = document.createElement("html");
			html.innerHTML = result;
			deffered.resolve(html.getElementsByTagName("body")[0].innerHTML);
		}).fail(function(status, responseText, xhr){
			deffered.reject(status, responseText, xhr);
		});
		return deffered;
	}

	export function getComponent(url: string): JQueryDeferred<any> {
		var deffered = $.Deferred<any>();
		getScript(url).done(function(result){
			var html = document.createElement("html");
			html.innerHTML = result;
			var body = html.getElementsByTagName("body")[0];
			for (var i = 0; i < body.children.length; i++) {
				var child = body.children[i];
				if (tui.widget.getFullName(child) === "tui:component") {
					var handler = child.getAttribute("handler");
					if (handler && handler.trim()) {
						if (!text.isAbsUrl(handler)) {
							handler = text.joinUrl(text.getBaseUrl(url), handler);
						}
					}
					deffered.resolve(child.innerHTML, handler ? handler : null);
					return;
				}
			}
			deffered.resolve(body.innerHTML);
		}).fail(function(status, responseText, xhr){
			deffered.reject(status, responseText, xhr);
		});
		return deffered;
	}

	export function getFunction(url: string, param?: any): JQueryDeferred<any> {
		var deffered = $.Deferred<any>();
		getScript(url).done(function(result){
			var fn: Function = eval("(function(){\n" + result + "})"
				+ "\n//# sourceURL=" + url);
			deffered.resolve(fn, param);
		}).fail(function(status, responseText, xhr){
			deffered.reject(status, responseText, xhr);
		});
		return deffered;
	}
	
	(<any>window).$ajax = send;
	(<any>window).$post = post;
	(<any>window).$post_ = post_; // silent mode
	(<any>window).$get = get;
	(<any>window).$get_ = get_; // silent mode
}
