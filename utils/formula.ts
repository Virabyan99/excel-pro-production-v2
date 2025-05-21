import { evaluate } from 'mathjs';
import { addressToCoords } from './address';
import { Row } from '../lib/types';

export function isFormula(value: string): boolean {
  return value.trimStart().startsWith('=');
}

export function replaceCellRefs(expr: string, data: Row[]): string {
  return expr.replace(/[A-Z]+\d+/g, (ref) => {
    const { row, col } = addressToCoords(ref);
    if (row >= data.length) {
      throw new Error(`Row index out of bounds: ${row}`);
    }
    const rowData = data[row];
    const colLetter = String.fromCharCode(65 + col); // Maps 0 to "A", 1 to "B", etc.
    const cellVal = rowData[colLetter];
    if (cellVal === undefined) {
      throw new Error(`Column ${colLetter} not found in row ${row}`);
    }
    const num = (typeof cellVal === 'string' && isFormula(cellVal))
      ? evaluateExpression(cellVal, data)
      : Number(cellVal) || 0;
    return String(num);
  });
}

export function evaluateExpression(expr: string, data: Row[]): number {
  try {
    const raw = expr.trim().replace(/^=/, '');
    const expanded = replaceCellRefs(raw, data);
    const result = evaluate(expanded);
    if (typeof result === 'number') {
      return result;
    }
    throw new Error('Expression did not return a number');
  } catch (err) {
    console.error('Failed to evaluate expression:', err);
    return NaN;
  }
}