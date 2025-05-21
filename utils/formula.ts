import { evaluate } from 'mathjs';

export function isFormula(value: string): boolean {
  return value.trimStart().startsWith('=');
}

export function evaluateExpression(expr: string): number {
  try {
    const raw = expr.trim().replace(/^=/, '');
    const result = evaluate(raw);
    if (typeof result === 'number') {
      return result;
    }
    throw new Error('Expression did not return a number');
  } catch (err) {
    console.error('Failed to evaluate expression:', err);
    return NaN;
  }
}