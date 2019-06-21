/// <reference path="../browser/browser.ts" />
module tui.template {

	export const HTML_BASIC = `
<!DOCTYPE html>
<html lang="zh-cn">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1,maximum-scale=1">
		{{unsafe:header}}
	</head>
	<body>
		{{unsafe:body}}
	</body>
</html>
`;

	const CMD_LOOP = /^@loop\s+(?:([_$a-zA-Z][_$a-zA-Z0-9]*)\s*:\s*)?([_$a-zA-Z][_$a-zA-Z0-9]*)\s+of\s+(.+)$/;
	const CMD_END_LOOP = /^@end\s+loop\s*$/;
	const CMD_IF = /^@if\s+(.+)$/;
	const CMD_ELSE = /^@else\s*$/;
	const CMD_END_IF = /^@end\s+if\s*$/;

	class HtmlError extends Error {
		constructor(...args: any[]) {
			super(...args);
		}
		lines: any;
	}

	function error(match, msg: any = 'unexpected command') {
		let newline = /\n/g;
		let m;
		let lines = 1;
		while ((m = newline.exec(match.input)) != null) {
			if (m.index < match.index) {
				lines++;
			} else
				break;
		}
		let message;
		if (msg instanceof Object) {
			message = msg.message;
			lines += (msg.lines - 1);
		} else {
			message = `Render HTML error: ${msg}: '${match[0]}'`;
		}

		let errObj = new HtmlError(message);
		errObj.lines = lines;
		errObj.toString = function () {
			return this.message + ` at: line ${this.lines}`;
		};
		throw errObj;
	}

	function clone(obj) {
		let newObj = {};
		if (obj instanceof Object) {
			for (let key in obj) {
				if (obj.hasOwnProperty(key)) {
					newObj[key] = obj[key];
				}
			}
		}
		return newObj;
	}

	const IDENTITY = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

	function evalWithData(expr, data) {
		if (!(data instanceof Object)) {
			return tui.browser.safeExec('return ' + expr);
		}
		// var definition = 'var $=data;';
		var context: any = {};
		context.$ = data;
		for (let k in data) {
			if (data.hasOwnProperty(k) && IDENTITY.test(k)) {
				//definition += 'var ' + k + '=$.' + k + ';';
				context[k] = data[k];
			}
		}
		// return tui.browser.safeExec(definition + expr);
		return tui.browser.safeExec('return ' + expr, context);
	}

	const ENTITY = {
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;',
		'\'': '&apos;',
		'"': '&quot;'
	};

	function text(t) {
		if (t == null || typeof t == 'undefined' || (typeof t == 'number' && isNaN(t))) {
			return '';
		} else
			return t;
	}

	export function safeText(t) {
		if (t == null || typeof t == 'undefined' || (typeof t == 'number' && isNaN(t))) {
			return '';
		}
		t += '';
		return t.replace(/[<>&'"]/g, function (v) {
			return ENTITY[v];
		});
	}

	export function render(template, data) {
		if (!template)
			return '';
		// let $ = data;
		template = template + '';
		let html = '';
		let regex = /\{\{([^}]+)\}\}/g;
		let match;
		let pos = 0;
		let cmdStack = [];
		while ((match = regex.exec(template)) != null) {
			if (cmdStack.length == 0) {
				html += template.substring(pos, match.index);
			}
			pos = regex.lastIndex;
			let key = match[1].trim();
			if (key[0] == '@') { // is command
				let m;
				if ((m = CMD_LOOP.exec(key)) != null) { // is loop
					cmdStack.push({
						cmd: 'loop',
						idx: m[1],
						declare: m[2],
						expression: m[3],
						match: match,
						index: pos
					});
				} else if ((m = CMD_END_LOOP.exec(key)) != null) {
					if (cmdStack.length > 0 && cmdStack[cmdStack.length - 1].cmd == 'loop') {
						let loopCmd = cmdStack.pop();
						if (cmdStack.length > 0)
							continue;
						let loopTemplate = template.substring(loopCmd.index, match.index);
						let array;
						try {
							array = evalWithData(loopCmd.expression, data);
						} catch (e) {
							error(loopCmd.match, e + '');
						}
						if (!(array instanceof Array)) {
							error(loopCmd.match, 'expression cannot be calculate as array');
						}
						try {
							let newData = clone(data);
							for (let i = 0; i < array.length; i++) {
								let item = array[i];
								if (loopCmd.declare != '_') {
									newData[loopCmd.declare] = item;
								}
								if (loopCmd.idx && loopCmd.idx != '_') {
									newData[loopCmd.idx] = i;
								}
								html += render(loopTemplate, newData);
							}
						} catch (e) {
							error(loopCmd.match, e);
						}
					} else {
						error(match);
					}
				} else if ((m = CMD_IF.exec(key)) != null) {
					cmdStack.push({
						cmd: 'if',
						expression: m[1],
						match: match,
						index: pos
					});
				} else if ((m = CMD_ELSE.exec(key)) != null) {
					if (cmdStack.length > 0 && cmdStack[cmdStack.length - 1].cmd == 'if') {
						cmdStack.push({
							cmd: 'else',
							match: match,
							index: pos
						});
					} else {
						error(match);
					}
				} else if ((m = CMD_END_IF.exec(key)) != null) {
					if (cmdStack.length > 0 && cmdStack[cmdStack.length - 1].cmd == 'if') {
						let ifCmd = cmdStack.pop();
						if (cmdStack.length > 0)
							continue;
						let ifTemplate = template.substring(ifCmd.index, match.index);
						let result;
						try {
							result = evalWithData(ifCmd.expression, data);
						} catch (e) {
							error(ifCmd.match, e + '');
						}
						if (result) {
							try {
								html += render(ifTemplate, data);
							} catch (e) {
								error(ifCmd.match, e);
							}
						}
					} else if (cmdStack.length > 0 && cmdStack[cmdStack.length - 1].cmd == 'else') {
						let elseCmd = cmdStack.pop();
						let elseTemplate = template.substring(elseCmd.index, match.index);
						if (cmdStack.length == 0) {
							error(match);
						}
						let ifCmd = cmdStack.pop();
						if (cmdStack.length > 0)
							continue;

						let ifTemplate = template.substring(ifCmd.index, elseCmd.match.index);
						let result;
						try {
							result = evalWithData(ifCmd.expression, data);
						} catch (e) {
							error(ifCmd.match, e + '');
						}
						try {
							if (result) {
								html += render(ifTemplate, data);
							} else {
								html += render(elseTemplate, data);
							}
						} catch (e) {
							error(ifCmd.match, e);
						}
					} else {
						error(match);
					}
				} else {
					error(match, 'invalid command');
				}
			} else if (cmdStack.length == 0) {
				if (data instanceof Object) {
					try {
						let isHtml = false;
						let isJson = false;
						if (/^unsafe:/.test(key)) {
							isHtml = true;
							key = key.substring(7);
						} else if (/^json:/.test(key)) {
							isJson = true;
							key = key.substring(5);
						}
						let value;
						if (/[+\-*/%=^()[\]{}&<>.'";:!]/.test(key)) {
							value = evalWithData(key, data);
						} else {
							value = data[key];
						}

						if (!isHtml)
							html += safeText(value);
						else if (isJson) {
							html += JSON.stringify(value);
						} else
							html += text(value);
					} catch (e) {
						error(match, e + '');
					}
				}
			}
		}
		if (cmdStack.length > 0) {
			error(cmdStack[0].match, 'cannot find corresponding close command');
		}
		if (pos < template.length) {
			html += template.substring(pos);
		}
		return html;
	}

	export function renderSafety(template, data) {
		try {
			return render(template, data);
		} catch (e) {
			return render(`
<div style="text-align: center; padding: 20px">
	<p>
		<a href="mailto:sy_mobile@cnooc.com.cn?subject=ERROR%20REPORT&body={{message}}"
			style="font-size: 12pt;color: #26d;text-decoration: none !important;">发送错误报告</a>
	</p>
</div>`, {
					message: encodeURIComponent(e.stack ? e + '\n' + e.stack : e + ''),
				});
		}
	}

}
