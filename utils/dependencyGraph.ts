// utils/dependencyGraph.ts
import { Row } from '../lib/types';
import { isFormula } from './formula';
import { coordsToAddress } from './address';

export type DependencyGraph = Map<string, Set<string>>;

export function buildGraph(data: Row[]): DependencyGraph {
  const graph: DependencyGraph = new Map();
  data.forEach((rowData, rowIdx) => {
    Object.entries(rowData).forEach(([colKey, val]) => {
      if (typeof val === 'string' && isFormula(val)) {
        const addr = coordsToAddress(rowIdx, colKey.charCodeAt(0) - 65);
        const refs = Array.from(new Set((val.match(/[A-Z]+\d+/g) || [])));
        refs.forEach(ref => {
          if (!graph.has(ref)) graph.set(ref, new Set());
          graph.get(ref)!.add(addr);
        });
        if (!graph.has(addr)) graph.set(addr, new Set());
      }
    });
  });
  return graph;
}

export function topoSort(start: string, graph: DependencyGraph): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function visit(node: string) {
    if (visited.has(node)) return;
    visited.add(node);
    const dependents = graph.get(node) || new Set();
    dependents.forEach(dep => visit(dep));
    result.push(node);
  }

  visit(start);
  return result;
}

/**
 * Detect a cycle and return the cycle path or null.
 */
export function findCycle(graph: DependencyGraph): string[] | null {
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): boolean {
    if (stack.has(node)) {
      path.push(node);
      return true;
    }
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    for (const dep of graph.get(node) || []) {
      if (dfs(dep)) {
        path.push(node);
        return true;
      }
    }
    stack.delete(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (dfs(node)) return path.reverse();
  }
  return null;
}