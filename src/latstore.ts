import {JSON, Hash, parseJSON, hashJSON, stringifyJSON, equalJSON} from './crypto_util';
import {Computation, evalComputation} from './computation';
import {HashLookup, HashPut, LatticeType, LatticeLookup, LatticePut} from './lattype';


export interface HashStore {

  rawHashLookup(hash: Hash): Buffer | null;

  rawHashPut(value: Buffer): Hash;
}

export interface LatticeStore {

  getLatticeType(hash: Hash): LatticeType | null;

  rawGetMax(typ: Hash, key: JSON): null | [JSON];

  rawSetMax(typ: Hash, key: JSON, value: JSON): void;
}

class HashStoreLookup implements HashLookup, HashPut {

  // THIS HAS NO CACHING

  private store: HashStore;

  constructor(store: HashStore) {
    this.store = store;
  }

  hashLookup(hash: Hash): JSON {
    let buf = this.store.rawHashLookup(hash);
    if (buf == null) {
      throw new Error('hash not found');
    }
    return JSON.parse(buf.toString('utf8'));
  }

  hashPut(json: JSON): Hash {
    let buf = new Buffer(stringifyJSON(json), 'utf8');
    return this.store.rawHashPut(buf);
  }

  hashEvalImmut(comp: Computation): JSON {
    let api = {
      hashLookup: (hash: Hash) => this.hashLookup(hash)
    };
    let res = evalComputation(comp, api);
    return parseJSON(JSON.stringify(res));
  }

  hashEvalMut(comp: Computation): JSON {
    let api = {
      hashLookup: (hash: Hash) => this.hashLookup(hash),
      hashPut: (json: JSON) => this.hashPut(json)
    };
    let res = evalComputation(comp, api);
    return parseJSON(JSON.stringify(res));
  }
}

class LatticeStoreLookup implements LatticeLookup, LatticePut {

  // THIS HAS NO CACHING

  private hstore: HashStoreLookup;
  private lstore: LatticeStore;

  constructor(hstore: HashStoreLookup, lstore: LatticeStore) {
    this.hstore = hstore;
    this.lstore = lstore;
  }

  hashLookup(hash: Hash): JSON {
    return this.hstore.hashLookup(hash);
  }

  hashPut(json: JSON): Hash {
    return this.hstore.hashPut(json);
  }

  hashEvalImmut(comp: Computation): JSON {
    return this.hstore.hashEvalImmut(comp);
  }

  hashEvalMut(comp: Computation): JSON {
    return this.hstore.hashEvalMut(comp);
  }

  getMax(typ: Hash, key: JSON): null | [JSON] {
    return this.lstore.rawGetMax(typ, key);
  }

  joinMax(typ: Hash, key: JSON, value: JSON): void {
    let ltyp = this.lstore.getLatticeType(typ);
    if (ltyp == null) {
      throw new Error('lattice type not found');
    }
    let isElem = this.hashEvalImmut(ltyp.isElem(key, value));
    if (!isElem) {
      throw new Error('value is not an element of the lattice');
    }
    let oldMax = this.getMax(typ, key);
    if (oldMax == null) {
      this.lstore.rawSetMax(typ, key, value);
      return;
    }
    let join = this.hashEvalMut(ltyp.join(key, oldMax[0], value));

    if (!equalJSON(join, oldMax[0])) {
      let joinElem = this.hashEvalImmut(ltyp.isElem(key, join));
      if (!joinElem) {
        throw new Error('join is not an element of the lattice');
      }
      this.lstore.rawSetMax(typ, key, join);
    }
  }

  // latCallImmut(mod: Hash, key: JSON): JSON {
  //   let m = this.lstore.getLatticeModule(mod);
  //   if (m == null) {
  //     throw new Error('lattice module not found');
  //   }
  //   return m.callImmut(key, this);
  // }

  // latCallMut(mod: Hash, key: JSON): JSON {
  //   let m = this.lstore.getLatticeModule(mod);
  //   if (m == null) {
  //     throw new Error('lattice module not found');
  //   }
  //   return m.callMut(key, this);
  // }

}


