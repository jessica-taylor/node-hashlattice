import {JSON, stringifyJSON, Hash} from './crypto_util';
import {Computation} from './computation';

export interface HashLookup {
  hashLookup(hash: Hash): JSON; // throw error if not found
  hashEvalImmut(comp: Computation): JSON;
}

export interface HashPut extends HashLookup {
  hashPut(json: JSON): Hash;
  hashEvalMut(comp: Computation): JSON;
}

export interface LatticeType {
  isElem(key: JSON, value: JSON): Computation;     // immut computation
  join(key: JSON, a: JSON, b: JSON): Computation;  // mut computation
}

export interface LatticeLookup extends HashLookup {
  getMax(typ: Hash, key: JSON): null | [JSON];
  // latCallImmut(mod: Hash, key: JSON): JSON;
}

export interface LatticePut extends HashPut, LatticeLookup {
  joinMax(typ: Hash, key: JSON, value: JSON): void;
  // latCallMut(mod: Hash, key: JSON): JSON;
}

// export interface LatticeModule {
//   callImmut(key: JSON, ll: LatticeLookup): JSON;
//   callMut(key: JSON, lp: LatticePut): JSON;
// }
