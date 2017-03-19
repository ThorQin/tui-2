/// <reference path="../core.ts" />
module tui.text.exp {
	"use strict";

	export interface Evaluator {
		(variable: string): any;
	}

	enum Type {
		_,
		SP,
		LOGIC,
		COMPARE,
		BOOL,
		NULL,
		ID,
		STR,
		NUM,
		L,
		R,
		UNKNOW
	}
	const LEVEL: {[index: number]: number} = {};
	LEVEL[Type.LOGIC] = 1;
	LEVEL[Type.COMPARE] = 2;
	LEVEL[Type.L] = 0;

	interface Node {
		type: Type;
		value?: any;
	}

	const SYMBOL = /([\r\n\s]+)|((?:and|or)(?=$|\s|\r|\n))|(<|<=|>|>=|=|!=|~|!~)|((?:true|false)(?=$|\s|\r|\n))|(null(?=$|\s|\r|\n))|([$_a-zA-Z][$_a-zA-Z0-9]*)|("[^"]*"|'[^']*'|`[^`]*`)|([+-]?[0-9]+(?:\.[0-9]+)?)|(\()|(\))|(.+)/gm;

	function error(match?: RegExpExecArray, msg?: string) {
		if (match) {
			if (msg)
				throw new Error(`Invalid expression! (Position: ${match.index}, cause: ${msg} )`);
			else
				throw new Error(`Invalid expression! (Position: ${match.index} )`);
		} else {
			if (msg)
				throw new Error(msg);
			else
				throw new Error("Invalid expression!");
		}
	}

	function convert(type: Type, value: string): any {
		var v: any;
		if (type == Type.NUM) {
			v = parseFloat(value);
		} else if (type == Type.BOOL) {
			v = parseBoolean(value);
		} else if (type == Type.NULL) {
			v = null;
		} else if (type == Type.STR) {
			v = value.substr(1, value.length - 2);
		} else
			v = value;
		return v;
	}

	function getNode(match: RegExpExecArray): Node {
		for (var i = Type.SP; i <= Type.UNKNOW; i++) {
			if (match[i])
				return {type: i, value: convert(i, match[i])};
		}
		error(match);
	}

	function isData(node: Node): boolean {
		switch (node.type) {
			case Type.BOOL:
			case Type.ID:
			case Type.NULL:
			case Type.NUM:
			case Type.STR:
				return true;
			default:
				return false;
		}
	}

	function isOp(node: Node): boolean {
		switch (node.type) {
			case Type.LOGIC:
			case Type.COMPARE:
				return true;
			default:
				return false;
		}
	}

	export function evaluate(expression: string, evaluator: Evaluator): boolean {
		if (!expression)
			error();
		var data: Node[] = [];
		var op: Node[] = [];
		function getValue(n: Node): any {
			var v: any;
			if (n.type == Type.ID) {
				if (evaluator)
					v = evaluator(n.value);
				if (typeof v === UNDEFINED)
					v = null;
			} else
				v = n.value;
			return v;
		}
		function calculate(m: RegExpExecArray) {
			if (data.length < 2)
				error(m);
			var b = data.pop();
			var a = data.pop();
			if (op.length < 1)
				error(m);
      var o = op.pop();
			var v1 = getValue(a);
			var v2 = getValue(b);
			if (o.type == Type.LOGIC) {
				if (o.value == "and")
					data.push({type: Type.BOOL, value: v1 && v2});
				else if (o.value == "or")
					data.push({type: Type.BOOL, value: v1 || v2});
			} else if (o.type == Type.COMPARE) {
				if (o.value == "=") {
					data.push({type: Type.BOOL, value: v1 == v2});
				} else if (o.value == "<") {
					data.push({type: Type.BOOL, value: v1 < v2});
				} else if (o.value == "<=") {
					data.push({type: Type.BOOL, value: v1 <= v2});
				} else if (o.value == ">") {
					data.push({type: Type.BOOL, value: v1 > v2});
				} else if (o.value == ">=") {
					data.push({type: Type.BOOL, value: v1 >= v2});
				} else if (o.value == "!=") {
					data.push({type: Type.BOOL, value: v1 != v2});
				} else if (o.value == "~") {
					if (typeof v2 != "string")
						error(m, "Invalid regular expression, must be a string value.");
					data.push({type: Type.BOOL, value: String(v1).match(v2)});
				} else if (o.value == "!~") {
					if (typeof v2 != "string")
						error(m, "Invalid regular expression, must be a string value.");
					data.push({type: Type.BOOL, value: !String(v1).match(v2)});
				}
			}
		}
		SYMBOL.lastIndex = 0;
		var m: RegExpExecArray;
		var last: Node = null;
		while ((m = SYMBOL.exec(expression)) != null) {
			let node = getNode(m);
			// DEBUG INFO:
			// console.log(`node: ${Type[node.type]}, value: ${node.value}`);
			if (node.type == Type.SP)
				continue;
			if (node.type == Type.UNKNOW)
				error(m);
			if (last != null) {
				if (isData(last) && isData(node))
					error(m);
				else if (isOp(last) && isOp(node))
					error(m);
			}
			last = node;
			if (isData(node)) {
				data.push(node);
			} else if (node.type == Type.L) {
				op.push(node);
			} else if (node.type == Type.R) {
				while (op[op.length - 1].type != Type.L) {
					calculate(m);
				}  
				op.pop();
			} else {  
				while (op.length > 0 && LEVEL[node.type] <= LEVEL[op[op.length - 1].type]) {
					calculate(m);
				}
				op.push(node);
			}  
		}
		while (op.length > 0)  
      calculate(m);
		if (data.length != 1)
			error(m);
		return data.pop().value;
	}

}