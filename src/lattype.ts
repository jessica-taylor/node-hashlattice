import {JSON, stringifyJSON, Hash} from './crypto_util';

export interface HashLookup {
  hashLookup(hash: Hash): JSON; // throw error if not found
  callImmut(mod: Hash, key: JSON): JSON;
}

export interface HashPut extends HashLookup {
  hashPut(json: JSON): Hash;
  callMut(mod: Hash, key: JSON): JSON;
}

export interface HashModule {
  callImmut(key: JSON, jl: HashLookup): JSON;
  callMut(key: JSON, jp: HashPut): JSON;
}

export interface LatticeType {
  isElem(key: JSON, value: JSON): [Hash, JSON];    // hash module hash; immut key
  join(key: JSON, a: JSON, b: JSON): [Hash, JSON]; // hash module hash; mut key
}

export interface LatticeLookup extends HashLookup {
  getMax(typ: Hash, key: JSON): null | [JSON];
  callImmut(mod: Hash, key: JSON): JSON;
}

export interface LatticePut extends HashPut, LatticeLookup {
  joinMax(typ: Hash, key: JSON, value: JSON): void;
  callMut(mod: Hash, key: JSON): JSON;
}

export interface LatticeModule {
  callImmut(key: JSON, ll: LatticeLookup): JSON;
  callMut(key: JSON, lp: LatticePut): JSON;
}
