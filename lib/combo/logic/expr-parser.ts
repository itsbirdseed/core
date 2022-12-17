import { Game } from '../config';
import { Settings } from '../settings';
import { gameId } from '../util';
import { Expr, exprTrue, exprFalse, exprAnd, exprOr, exprAge, exprHas, exprEvent, exprMasks, exprHealth, exprSetting, exprNot, exprCond } from './expr';

const SIMPLE_TOKENS = ['||', '&&', '(', ')', ',', 'true', 'false', '!'] as const;

type TokenSimple = { type: typeof SIMPLE_TOKENS[number] };
type TokenEOF = { type: 'EOF' };
type TokenIdentifier = { type: 'identifier', value: string };
type TokenNumber = { type: 'number', value: number };
type Token = TokenSimple | TokenEOF | TokenIdentifier | TokenNumber;
type TokenType = Token['type'];
type TokenOfType<T> = Extract<Token, { type: T }>;
type TokenValue<T> = TokenOfType<T> extends { value: infer TT; } ? TT : true;

type ParseContext = {
  buffer: string;
  cursor: number;
  next?: Token;
  macroValues: {[k: string]: Token};
};

type Macro = {
  args: string[];
  buffer: string;
};

export class ExprParser {
  private ctx: ParseContext[] = [];
  private macros: {[k: string]: Macro} = {};

  constructor(private settings: Settings, private game: Game) {}

  addMacro(name: string, args: string[], buffer: string) {
    this.macros[name] = { args, buffer };
  }

  parse(input: string) {
    this.ctx.push({ buffer: input, cursor: 0, macroValues: {} });

    const expr = this.parseExpr();
    if (expr === undefined) {
      console.log(input);
      throw this.error("Expected expression");
    }
    this.expect('EOF');
    this.ctx = [];
    return expr;
  }

  private parseExprTrue(): Expr | undefined {
    if (this.accept('true')) {
      return exprTrue();
    }
  }

  private parseExprFalse(): Expr | undefined {
    if (this.accept('false')) {
      return exprFalse();
    }
  }

  private parseExprNot(): Expr | undefined {
    if (this.accept('!')) {
      const expr = this.parseExprSingle();
      if (expr === undefined) {
        throw this.error("Expected expression");
      }
      return exprNot(expr);
    }
  }

  /* This could be a macro once macros properly handle parens */
  private parseExprCond(): Expr | undefined {
    if (this.peek('identifier') !== 'cond') {
      return undefined;
    }
    this.accept('identifier');
    this.expect('(');
    const cond = this.parseExpr();
    if (cond === undefined) {
      throw this.error("Expected expression");
    }
    this.expect(',');
    const then = this.parseExpr();
    if (then === undefined) {
      throw this.error("Expected expression");
    }
    this.expect(',');
    const otherwise = this.parseExpr();
    if (otherwise === undefined) {
      throw this.error("Expected expression");
    }
    this.expect(')');
    return exprCond(cond, then, otherwise);
  }

  private parseExprAge(): Expr | undefined {
    if (this.peek('identifier') !== 'age') {
      return undefined;
    }
    this.accept('identifier');
    this.expect('(');
    const age = this.expect('identifier');
    if (age !== 'child' && age !== 'adult') {
      throw this.error(`Expected child or adult at ${this.ctx[0].cursor}`);
    }
    this.expect(')');
    return exprAge(age);
  }

  private parseExprHas(): Expr | undefined {
    if (this.peek('identifier') !== 'has') {
      return undefined;
    }
    this.accept('identifier');
    this.expect('(');
    const item = gameId(this.game, this.expect('identifier'), '_');
    let count = 1;
    if (this.accept(',')) {
      count = this.expect('number');
    }
    this.expect(')');
    return exprHas(item, count);
  }

  private parseExprEvent(): Expr | undefined {
    if (this.peek('identifier') !== 'event') {
      return undefined;
    }
    this.accept('identifier');
    this.expect('(');
    const event = gameId(this.game, this.expect('identifier'), '_');
    this.expect(')');
    return exprEvent(event);
  }

  private parseExprMasks(): Expr | undefined {
    if (this.peek('identifier') !== 'masks') {
      return undefined;
    }
    this.accept('identifier');
    this.expect('(');
    const count = this.expect('number');
    this.expect(')');
    return exprMasks(count);
  }

  private parseExprHealth(): Expr | undefined {
    if (this.peek('identifier') !== 'health') {
      return undefined;
    }
    this.accept('identifier');
    this.expect('(');
    const count = this.expect('number');
    this.expect(')');
    return exprHealth(count);
  }

  private parseExprSetting(): Expr | undefined {
    let value: string | boolean = true;
    if (this.peek('identifier') !== 'setting') {
      return undefined;
    }
    this.accept('identifier');
    this.expect('(');
    const key = this.expect('identifier');
    if (this.accept(',')) {
      value = this.expect('identifier');
    }
    this.expect(')');
    return exprSetting(this.settings, key, value);
  }

  private parseMacro(): Expr | undefined {
    /* Check for a macro with the given name */
    const name = this.peek('identifier');
    if (name === undefined) {
      return undefined;
    }
    const macro = this.macros[name];
    if (macro === undefined) {
      return undefined;
    }
    this.accept('identifier');

    /* We found a match - parse the macro arguments */
    const args: Token[] = [];
    if (this.accept('(')) {
      if (!this.accept(')')) {
        for (;;) {
          const arg = this.popNextToken();
          if (arg.type !== 'number' && arg.type !== 'identifier') {
            throw this.error(`Expected number or identifier at ${this.ctx[0].cursor}`);
          }
          args.push(arg);
          if (this.accept(')')) {
            break;
          }
          this.expect(',');
        }
      }
    }

    /* Check that the number of arguments matches */
    if (args.length !== macro.args.length) {
      throw this.error(`Expected ${macro.args.length} arguments at ${this.ctx[0].cursor}`);
    }

    /* Zip the arguments */
    const macroValues: {[k: string]: Token} = {};
    for (let i = 0; i < macro.args.length; i++) {
      macroValues[macro.args[i]] = args[i];
    }

    /* Setup the context */
    this.ctx.push({ buffer: macro.buffer, cursor: 0, macroValues });

    /* Parse */
    const expr = this.parseExpr();
    if (expr === undefined) {
      throw this.error("Expected expression");
    }
    this.expect('EOF');
    this.ctx.pop();
    return expr;
  }

  private parseExprSingle(): Expr | undefined {
    if (this.accept('(')) {
      const expr = this.parseExpr();
      this.expect(')');
      return expr;
    }
    return this.parseExprTrue()
      || this.parseExprFalse()
      || this.parseExprNot()
      || this.parseExprCond()
      || this.parseExprAge()
      || this.parseExprHas()
      || this.parseExprEvent()
      || this.parseExprMasks()
      || this.parseExprHealth()
      || this.parseExprSetting()
      || this.parseMacro();
  }

  private parseExprOr(): Expr | undefined {
    const exprs: Expr[] = [];
    let expr = this.parseExprAnd();
    if (expr === undefined) {
      return undefined;
    }
    exprs.push(expr);
    while (this.accept('||')) {
      expr = this.parseExprAnd();
      if (expr === undefined) {
        throw this.error(`Expected expression after || at ${this.ctx[0].cursor}`);
      }
      exprs.push(expr);
    }
    if (exprs.length === 1) {
      return exprs[0];
    } else {
      return exprOr(exprs);
    }
  }

  private parseExprAnd(): Expr | undefined {
    const exprs: Expr[] = [];
    let expr = this.parseExprSingle();
    if (expr === undefined) {
      return undefined;
    }
    exprs.push(expr);
    while (this.accept('&&')) {
      expr = this.parseExprSingle();
      if (expr === undefined) {
        throw this.error(`Expected expression after && at ${this.ctx[0].cursor}`);
      }
      exprs.push(expr);
    }
    if (exprs.length === 1) {
      return exprs[0];
    } else {
      return exprAnd(exprs);
    }
  }

  private parseExpr(): Expr | undefined {
    return this.parseExprOr();
  }

  private skipWhitespace() {
    const ctx = this.ctx[this.ctx.length - 1];
    for (;;) {
      const c = ctx.buffer[ctx.cursor];
      if (c !== ' ' && c !== '\t' && c !== '\n') {
        break;
      }
      ctx.cursor++;
    }
  }

  private expect<T extends TokenType>(t: T): TokenValue<T> {
    const token = this.accept(t);
    if (token === undefined) {
      throw this.error(`Expected token ${t} at ${this.ctx[0].cursor}`);
    }
    return token;
  }

  private accept<T extends TokenType>(t: T): TokenValue<T> | undefined {
    const p = this.peek(t);
    if (p !== undefined) {
      this.ctx[this.ctx.length - 1].next = undefined;
      return p;
    }
    return undefined;
  }

  private peek<T extends TokenType>(t: T): TokenValue<T> | undefined {
    const next = this.nextToken();
    if (next.type === t) {
      return (next as any).value === undefined ? true : (next as any).value;
    }
    return undefined;
  }

  private popNextToken(): Token {
    const t = this.nextToken();
    this.ctx[this.ctx.length - 1].next = undefined;
    return t;
  }

  private nextToken(): Token {
    const ctx = this.ctx[this.ctx.length - 1];
    if (!ctx.next) {
      ctx.next = this.parseNextToken();
    }
    return ctx.next;
  }

  private parseNextToken(): Token {
    const ctx = this.ctx[this.ctx.length - 1];

    /* Skip whitespace */
    this.skipWhitespace();

    /* Check for EOF */
    if (ctx.cursor >= ctx.buffer.length) {
      return { type: 'EOF' };
    }

    /* Check for a simple token */
    for (const t of SIMPLE_TOKENS) {
      const str = ctx.buffer.substring(ctx.cursor, ctx.cursor + t.length);
      if (str === t) {
        ctx.cursor += t.length;
        return { type: t };
      }
    }

    /* Check for an identifier */
    if (/[a-zA-Z_]/.test(ctx.buffer[ctx.cursor] || '')) {
      const start = ctx.cursor;
      while (/[a-zA-Z0-9_]/.test(ctx.buffer[ctx.cursor] || '')) {
        ctx.cursor++;
      }
      const str = ctx.buffer.substring(start, ctx.cursor);

      /* Might be a macro argument */
      if (str in ctx.macroValues) {
        return ctx.macroValues[str];
      }

      return { type: 'identifier', value: str };
    }

    /* Check for a number */
    if (/[0-9]/.test(ctx.buffer[ctx.cursor] || '')) {
      const start = ctx.cursor;
      while (/[0-9]/.test(ctx.buffer[ctx.cursor] || '')) {
        ctx.cursor++;
      }
      const str = ctx.buffer.substring(start, ctx.cursor);
      return { type: 'number', value: parseInt(str) };
    }

    /* Unknown token */
    throw this.error(`Unknown token at ${ctx.cursor}`);
  }

  private error(msg: string) {
    return new Error(msg + "\nwhen parsing `" + this.ctx[0].buffer + "`");
  }
};
