namespace tui.exp {
  export enum OPType {
    COMMA = 0,
    AND,
    OR,
    NOT,
    CP,
    PLUMIN,
    MULDIV,
    SIGN,
    FN,
    LP,
    RP,
    EOF,
  }

  export interface TokenBase {
    type: 'constant'|'variable'|'operator'|'function';
    name?: string;
    value?: any;
    operator?: 'eof'|'and'|'or'|'not'|'='|'!='|'~'|'!~'|'>'|'>='|'<'|'<='|'+'|
        '-'|'positive'|'negative'|'*'|'/'|'('|')'|'fn'|',';
    operatorType?: OPType;
  }

  export interface Token extends TokenBase {
    pos: number;
  }
  const TEMPLATE: {[idx: string]: TokenBase} = {
    'and': {type: 'operator', operator: 'and', operatorType: OPType.AND},
    'or': {type: 'operator', operator: 'or', operatorType: OPType.OR},
    'not': {type: 'operator', operator: 'not', operatorType: OPType.NOT},
    'true': {
      type: 'constant',
      value: true,
    },
    'false': {
      type: 'constant',
      value: false,
    },
    'null': {
      type: 'constant',
      value: null,
    },
    '=': {type: 'operator', operator: '=', operatorType: OPType.CP},
    '!=': {type: 'operator', operator: '!=', operatorType: OPType.CP},
    '~': {type: 'operator', operator: '~', operatorType: OPType.CP},
    '!~': {type: 'operator', operator: '!~', operatorType: OPType.CP},
    '>': {type: 'operator', operator: '>', operatorType: OPType.CP},
    '>=': {type: 'operator', operator: '>=', operatorType: OPType.CP},
    '<': {type: 'operator', operator: '<', operatorType: OPType.CP},
    '<=': {type: 'operator', operator: '<=', operatorType: OPType.CP},
    '+': {type: 'operator', operator: '+', operatorType: OPType.PLUMIN},
    '-': {type: 'operator', operator: '-', operatorType: OPType.PLUMIN},
    '*': {type: 'operator', operator: '*', operatorType: OPType.MULDIV},
    '/': {type: 'operator', operator: '/', operatorType: OPType.MULDIV},
    '(': {type: 'operator', operator: '(', operatorType: OPType.LP},
    ')': {type: 'operator', operator: ')', operatorType: OPType.RP},
    ',': {type: 'operator', operator: ',', operatorType: OPType.COMMA}
  };

  function getPredefined(key: string): TokenBase {
    let token = TEMPLATE[key] as any;
    if (token) {
      let ret = {} as any;
      for (let k in token) {
        ret[k] = token[k];
      }
      return ret;
    } else {
      return null;
    }
  }

  const LEXER_REGEX =
      /(\s+)|((?:true|false|null|and|or|not)(?=\W|$))|([a-zA-Z_]\w*(?:\.\w+)*(?=\s*\())|([a-zA-Z_]\w*(?:\.\w+)*)|(<=|>=|!=|!~|[,\-+*/=~<>()])|(\d+(?:\.\d+)?)|("(?:[^"]|\\")*"|'(?:[^']|\\')*')|(.+)/gm;
  enum LexType { SPACE = 0, KEYWORD, FN, ID, OP, NUM, STR, UNKNOW }

  function parseString(str: string): string {
    str = str.substr(1, str.length - 2);
    return str.replace(/\\(.)/gm, function(s, w) {
      switch (w) {
        case 'n':
          return '\n';
        case 'r':
          return '\r';
        case 't':
          return '\t';
        case 'v':
          return '\v';
        case 'f':
          return '\f';
        case 'b':
          return '\b';
        default:
          return w;
      }
    });
  }
  function formatMsg(match: RegExpExecArray): string {
    let msg = match[0].substr(0, 20);
    return `(pos: ${match.index}): ----> ${msg} <----`;
  }
  function addPos(token: TokenBase, pos: number): Token {
    (token as Token).pos = pos;
    return (token as Token);
	}

	function findIndex(match: any[]): number {
		for (let i = 1; i < match.length; i++) {
			if (typeof match[i] == 'string')
				return i - 1;
		}
	}

  export class Parser {
    private _input: string;
    private _rex: RegExp;
    private _last: Token = null;
    constructor(source: string) {
      this._input = source;
      this._rex = new RegExp(LEXER_REGEX);
    }
    reset() {
      this._rex.lastIndex = 0;
      this._last = null;
    }
    next(): Token {
      let match: RegExpExecArray;
      while ((match = this._rex.exec(this._input)) != null) {
        let type: LexType = findIndex(match);
            // match.slice(1).findIndex(item => {return typeof item == 'string'});
        if (type == LexType.SPACE) {
          continue;
        } else if (type == LexType.FN) {
          this._last = {
            type: 'function',
            name: match[0],
            operator: 'fn',
            operatorType: OPType.FN,
            pos: match.index
          };
          return this._last;
        } else if (type == LexType.ID || type == LexType.KEYWORD) {
          let token = getPredefined(match[0]);
          if (token) {
            this._last = addPos(token, match.index);
            return this._last;
          } else {
            this._last = {type: 'variable', name: match[0], pos: match.index};
            return this._last;
          }
        } else if (type == LexType.NUM) {
          this._last = {
            type: 'constant',
            value: parseFloat(match[0]),
            pos: match.index
          };
          return this._last;
        } else if (type == LexType.STR) {
          this._last = {
            type: 'constant',
            value: parseString(match[0]),
            pos: match.index
          };
          return this._last;
        } else if (type == LexType.OP) {
          let op = match[0];
          if (op == '+' || op == '-') {
            if (this._last == null ||
                this._last.type == 'operator' && this._last.operator != ')') {
              this._last = {
                type: 'operator',
                operator: op == '+' ? 'positive' : 'negative',
                operatorType: OPType.SIGN,
                pos: match.index
              };
              return this._last;
            }
          }
          let token = getPredefined(op);
          if (token) {
            this._last = addPos(token, match.index);
            return this._last;
          } else {
            throw new Error(
                `Internal error: Undefined operator: ${formatMsg(match)}`);
          }
        } else {
          throw new Error(`Unexpected token: ${formatMsg(match)}`);
        }
      }
      return {
        type: 'operator',
        operator: 'eof',
        operatorType: OPType.EOF,
        pos: this._input.length
      };
    }
  }
}
