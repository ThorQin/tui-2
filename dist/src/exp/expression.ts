/// <reference path="./lexer.ts" />
namespace tui.exp {
	const H = 1, L = 0, E = -1, S = -2;
	enum Priority {
		High = H,
		Low = L,
		Error = E,
		Same = S
	}
    const PRIORITIES = [
/*  Q \ S  comma and  or not  cp +,- *,/  sign  fn  (   )  eof
/* comma */  H,   L,  L,  L,  L,  L,  L,   L,   L,  L,  H,  H,
/*  and  */  H,   H,  H,  L,  L,  L,  L,   L,   L,  L,  H,  H,
/*  or   */  H,   L,  H,  L,  L,  L,  L,   L,   L,  L,  H,  H,
/*  not  */  H,   H,  H,  L,  H,  H,  H,   L,   L,  L,  H,  H,
/*  cp   */  H,   H,  H,  L,  H,  L,  L,   L,   L,  L,  H,  H,
/*  +,-  */  H,   H,  H,  L,  H,  H,  L,   L,   L,  L,  H,  H,
/*  *,/  */  H,   H,  H,  L,  H,  H,  H,   L,   L,  L,  H,  H,
/* sign  */  H,   H,  H,  L,  H,  H,  H,   L,   L,  L,  H,  H,
/*  fn   */  H,   H,  H,  E,  H,  H,  H,   E,   E,  L,  H,  H,
/*   (   */  L,   L,  L,  L,  L,  L,  L,   L,   L,  L,  S,  E,
/*   )   */  H,   H,  H,  H,  H,  H,  H,   H,   E,  E,  H,  H,
/*  eof  */  L,   L,  L,  L,  L,  L,  L,   L,   L,  L,  E,  S,
    ];

	function getPriority(opQueue: exp.OPType, opScan: exp.OPType): Priority {
		return PRIORITIES[opQueue * (exp.OPType.EOF + 1) + opScan];
	}

	export interface Identifier {
		name: string,
		type: 'function' | 'variable';
		args?: any[];
	}

	export interface Resolver {
		(identifier: Identifier): any;
	}

	export interface Node extends exp.Token {
		isUnary?: boolean,
		left?: Node,
		right?: Node,
	};

	function isOP(node: Node) {
		return node.type == 'operator' || node.type == 'function';
	}

	function isVal(node: Node) {
		return node.type == 'constant' || node.type == 'variable';
	}

	function makeNode(token: exp.Token): Node {
		let node = token as Node;
		node.isUnary = (node.operator == 'not' ||
			node.operator == 'fn' ||
			node.operator == 'positive' ||
			node.operator == 'negative');
		return node;
	}

	export function parse(expression: string): Node {
		if (typeof expression != 'string') {
			throw new Error('Invalid parameter, should be expression!');
		}

		function formatMsg(pos: number): string {
			return `(pos: ${pos}): ----> ${expression.substr(pos, 20)} <----`;
		}

		let valStack: Node[] = [];
		let opStack: Node[] = [{
			type: 'operator',
			operator: 'eof',
			operatorType: exp.OPType.EOF,
			pos: 0
		}];
		let last = opStack[0];
		function lastOp(): Node {
			return opStack[opStack.length - 1];
		}
		let lexer = new exp.Parser(expression);
		for (; ;) {
			let token = lexer.next();
			let current = makeNode(token);
			if (isVal(current)) {
				if (isVal(last) || last.operator == ')') {
					throw new Error(`Unexpected token: ${formatMsg(current.pos)}`);
				}
				valStack.push(current);
			} else {
				for (; ;) {
					let priority = getPriority(lastOp().operatorType, current.operatorType);
					if (priority == E) {
						if (current.operator == 'eof') {
							throw new Error(`Unexpected EOF: ${current.pos}`);
						} else
							throw new Error(`Unexpected token: ${formatMsg(current.pos)}`);
					} else if (priority == L) {
						opStack.push(current);
						break;
					} else if (priority == H) {
						if (opStack.length < 1) {
							throw new Error(`Unexpected operator: ${formatMsg(current.pos)}`);
						}
						let op = opStack.pop();
						if (valStack.length < 1) {
							if (op.type != 'function') {
								throw new Error(`Unexpected operator: ${formatMsg(op.pos)}`);
							}
						} else {
							let val = valStack.pop();
							if (val.pos > op.pos) {
								op.right = val;
							} else {
								if (op.type != 'function') {
									throw new Error(`Unexpected operator: ${formatMsg(op.pos)}`);
								} else {
									valStack.push(val);
								}
							}
						}
						if (!op.isUnary) {
							if (valStack.length < 1) {
								throw new Error(`Unexpected operator: ${formatMsg(op.pos)}`);
							}
							let val = valStack.pop();
							if (val.pos < op.pos) {
								op.left = val;
							} else {
								throw new Error(`Unexpected operator: ${formatMsg(op.pos)}`);
							}
						}
						valStack.push(op);
					} else { //priority == S
						opStack.pop();
						break;
					}
				}
			}
			last = current;
			if (current.operator == 'eof') {
				break;
			}
		}
		if (valStack.length != 1) {
			throw new Error(`Unexpected EOF: ${last.pos}`);
		}
		if (opStack.length != 0) {
			throw new Error(`Unexpected operator: ${formatMsg(opStack.pop().pos)}`);
		}
		return valStack[0];
	}

	const CALCULATOR = {
		'+': function(l, r) {
			return l + r;
		},
		'-': function(l, r) {
			return l - r;
		},
		'*': function(l, r) {
			return l * r;
		},
		'/': function(l, r) {
			return l / r;
		},
		'=': function(l, r) {
			return l == r;
		},
		'!=': function(l, r) {
			return l != r;
		},
		'~': function(l, r) {
			let rex = new RegExp(r+'');
			return rex.test(l+'');
		},
		'!~': function(l, r) {
			let rex = new RegExp(r+'');
			return !rex.test(l+'');
		},
		'>': function(l, r) {
			return l > r;
		},
		'>=': function(l, r) {
			return l >= r;
		},
		'<': function(l, r) {
			return l < r;
		},
		'<=': function(l, r) {
			return l <= r;
		},
		',': function(l, r) {
			return r;
		},
		'not': function(l, r) {
			return !r;
		},
		'positive': function(l, r) {
			return +r;
		},
		'negative': function(l, r) {
			return -r;
		},
	};

	export function evaluate(exp: Node, resolver: Resolver): any;
	export function evaluate(exp: string, resolver: Resolver): any;
	export function evaluate(exp: Node | string, resolver: Resolver): any {
		let root: Node;
		if (typeof exp == 'string') {
			root = parse(exp);
		} else if (exp instanceof Node) {
			root = exp;
		} else {
			throw new Error('Invalid parameter, should be expression or exp tree!');
		}
		function evalArgs(node: Node): any[] {
			let args = [];
			if (node == null) {
				return args;
			}
			if (node.operator == ',') {
				if (node.left.operator == ',') {
					args = args.concat(evalArgs(node.left));
				} else {
					args.push(evalNode(node.left));
				}
				args.push(evalNode(node.right));
			} else {
				args.push(evalNode(node));
			}
			return args;
		}
		function evalNode(node: Node): any {
			if (!node) {
				return null;
			}
			if (node.type == 'function') {
				if (typeof resolver != 'function') {
					throw new Error(`Cannot evaluate function: '${node.name}': no resolver provide!`);
				}
				let args = evalArgs(node.right);
				return resolver({
					name: node.name,
					type: 'function',
					args: args,
				});
			} else if (node.type == 'variable') {
				if (typeof resolver != 'function') {
					throw new Error(`Cannot evaluate variable: '${node.name}': no resolver provide!`);
				}
				return resolver({
					name: node.name,
					type: 'variable',
				});
			} else if (node.type == 'constant') {
				return node.value;
			} else { // node.type == 'operator'
				if (node.operator == 'and') {
					return evalNode(node.left) && evalNode(node.right);
				} else if (node.operator == 'or') {
					return evalNode(node.left) || evalNode(node.right);
				} else {
					let cacl = CALCULATOR[node.operator];
					if (cacl) {
						return cacl(evalNode(node.left), evalNode(node.right));
					} else {
						throw new Error(`Unexpected operator: '${node.operator}': internal error!`);
					}
				}
			}
		}
		return evalNode(root);
	}

	export function processStandardFunc(id: Identifier) {
		if (id.name == 'len') {
			if (id.args.length < 1) {
				throw new Error("Invalid parameter for function 'len()'");
			}
			let v = id.args[0];
			if (v instanceof Array) {
				return v.length;
			} else if (v == null) {
				return 0;
			} else {
				return (v + "").length;
			}
		} else if (id.name == 'has') {
			if (id.args.length < 2) {
				throw new Error("Invalid parameter for function 'has()'");
			}
			let arr = id.args[0];
			if (arr == null) {
				return false;
			} else if (!(arr instanceof Array)) {
				arr = [arr];
			}
			for (let i = 1; i < id.args.length; i++) {
				let t = id.args[i];
				for (let v of arr) {
					if (t == v) {
						return true;
					}
				}
			}
			return false;
		} else if (id.name == 'hasAll') {
			if (id.args.length < 2) {
				throw new Error("Invalid parameter for function 'hasAll()'");
			}
			let arr = id.args[0];
			if (arr == null) {
				return false;
			} else if (!(arr instanceof Array)) {
				arr = [arr];
			}
			for (let i = 1; i < id.args.length; i++) {
				let t = id.args[i];
				let find = false;
				for (let v of arr) {
					if (t == v) {
						find = true;
						break;
					}
				}
				if (!find) {
					return false;
				}
			}
			return true;
		} else if (id.name == 'get') {
			if (id.args.length < 2) {
				throw new Error("Invalid parameter for function 'get()'");
			}
			let obj = id.args[0];
			if (obj == null) {
				return null;
			} if (obj instanceof Object || obj instanceof Array ) {
				let k = id.args[1];
				return obj[k];
			} else {
				throw new Error("Invalid parameter for function 'get()'");
			}
		} else if (id.name == 'getAll') {
			if (id.args.length < 2) {
				throw new Error("Invalid parameter for function 'getAll()'");
			}
			let arr = id.args[0];
			if (arr == null) {
				return null;
			} if (!(arr instanceof Array) ) {
				arr = [arr];
			}
			let k = id.args[1];
			let result = [];
			for (let item of arr) {
				result.push(item[k]);
			}
			return result;
		} else {
			throw new Error("Invalid expression: Undefined function: '" + id.name + "()'");
		}
	}
}
