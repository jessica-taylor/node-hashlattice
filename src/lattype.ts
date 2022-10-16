import {JSON, stringifyJSON, Hash} from './crypto_util';

// export interface Semilattice {
//   isElem(a: JSON): boolean;
//   join(a: JSON, b: JSON): JSON;
//   bottom(): JSON;
// }



export type Key = [Hash | null, JSON];

export type Deps = (key: Key) => null | [JSON];

export interface DepOrder {
  isElem(a: JSON, deps: Deps): boolean;
  compare(a: JSON, b: JSON): number; // less -1, equal 0, greater 1
}


export interface LatticeType {
  getOrder(key: Key): null | DepOrder;
}


// function toLatGraph(v: any): LatGraph {
//   if (typeof v != 'object') {
//     throw new Error('Expected latgraph to be object');
//   }
//   let g = v as LatGraph;
//   if (typeof g.depGraphs != 'object') {
//     throw new Error('Expected depGraphs to be object');
//   }
//   for (const k in g.depGraphs) {
//     if (!Buffer.isBuffer(g.depGraphs[k])) {
//       throw new Error('Expected depGraphs to be buffers');
//     }
//   }
//   for (var f of [g.isKey, g.keyLt, g.isValue, g.bottom, g.join, g.transport]) {
//     if (typeof f != 'function') {
//       throw new Error('Expected function');
//     }
//   }
//   return g;
// }
