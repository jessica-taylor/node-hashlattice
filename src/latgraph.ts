
export type Deps = (k: any, graph?: string) => any;

export interface LatGraph {
  depGraphs: Record<string, Buffer>;

  isKey(key: any): boolean;

  keyLt(key1: any, key2: any): boolean;

  isValue(key: any, value: any, deps: Deps): boolean;

  bottom(key: any, deps: Deps): any;

  join(key: any, value1: any, value2: any, deps: Deps): any;

  transport(key: any, value: any, deps1: Deps, deps2: Deps): any;
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
