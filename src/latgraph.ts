import {JSON, Hash} from './crypto_util';

export type Deps = (k: JSON, graph?: string) => JSON;

export interface LatGraph {
  depGraphs: Record<string, Hash>;

  isKey(key: JSON): boolean;

  keyLt(key1: JSON, key2: JSON): boolean;

  isValue(key: JSON, value: JSON, deps: Deps): boolean;

  bottom(key: JSON, deps: Deps): JSON;

  join(key: JSON, value1: JSON, value2: JSON, deps: Deps): any;

  transport(key: JSON, value: JSON, deps1: Deps, deps2: Deps): any;
}

function toLatGraph(v: any): LatGraph {
  if (typeof v != 'object') {
    throw new Error('Expected latgraph to be object');
  }
  let g = v as LatGraph;
  if (typeof g.depGraphs != 'object') {
    throw new Error('Expected depGraphs to be object');
  }
  for (const k in g.depGraphs) {
    if (!Buffer.isBuffer(g.depGraphs[k])) {
      throw new Error('Expected depGraphs to be buffers');
    }
  }
  for (var f of [g.isKey, g.keyLt, g.isValue, g.bottom, g.join, g.transport]) {
    if (typeof f != 'function') {
      throw new Error('Expected function');
    }
  }
  return g;
}
