import {JSON, Hash, hashJSON, stringifyJSON, equalJSON} from './crypto_util';
import {HashLookup, HashPut, HashModule, LatticeType, LatticeLookup, LatticePut, LatticeModule} from './lattype';


export interface HashStore {

  rawHashLookup(hash: Hash): Buffer | null;

  rawHashPut(value: Buffer): Hash;
}

export interface HashModuleStore extends HashStore {
  getHashModule(hash: Hash): HashModule | null;
}

export interface LatticeStore {

  getLatticeType(hash: Hash): LatticeType | null;

  rawGetMax(typ: Hash, key: JSON): null | [JSON];

  rawSetMax(typ: Hash, key: JSON, value: JSON): void;
}

export interface LatticeModuleStore extends LatticeStore {

  getLatticeModule(hash: Hash): LatticeModule | null;

}

class HashStoreLookup implements HashLookup, HashPut {

  // THIS HAS NO CACHING

  private store: HashModuleStore;

  constructor(store: HashModuleStore) {
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

  hashCallImmut(mod: Hash, key: JSON): JSON {
    let hm = this.store.getHashModule(mod);
    if (hm == null) {
      throw new Error('hash module not found');
    }
    return hm.callImmut(key, this);
  }

  hashCallMut(mod: Hash, key: JSON): JSON {
    let hm = this.store.getHashModule(mod);
    if (hm == null) {
      throw new Error('hash module not found');
    }
    return hm.callMut(key, this);
  }
}

class LatticeStoreLookup implements LatticeLookup, LatticePut {

  // THIS HAS NO CACHING

  private hstore: HashStoreLookup;
  private lstore: LatticeModuleStore;

  constructor(hstore: HashStoreLookup, lstore: LatticeModuleStore) {
    this.hstore = hstore;
    this.lstore = lstore;
  }

  hashLookup(hash: Hash): JSON {
    return this.hstore.hashLookup(hash);
  }

  hashPut(json: JSON): Hash {
    return this.hstore.hashPut(json);
  }

  hashCallImmut(mod: Hash, key: JSON): JSON {
    return this.hstore.hashCallImmut(mod, key);
  }

  hashCallMut(mod: Hash, key: JSON): JSON {
    return this.hstore.hashCallMut(mod, key);
  }

  getMax(typ: Hash, key: JSON): null | [JSON] {
    return this.lstore.rawGetMax(typ, key);
  }

  joinMax(typ: Hash, key: JSON, value: JSON): void {
    let ltyp = this.lstore.getLatticeType(typ);
    if (ltyp == null) {
      throw new Error('lattice type not found');
    }
    let isElemPair = ltyp.isElem(key, value);
    let isElem = this.latCallImmut(isElemPair[0], isElemPair[1]);
    if (!isElem) {
      throw new Error('value is not an element of the lattice');
    }
    let oldMax = this.getMax(typ, key);
    if (oldMax == null) {
      this.lstore.rawSetMax(typ, key, value);
      return;
    }
    let joinPair = ltyp.join(key, oldMax[0], value);
    let join = this.latCallMut(joinPair[0], joinPair[1]);

    if (!equalJSON(join, oldMax[0])) {
      let joinElemPair = ltyp.isElem(key, join);
      let joinElem = this.latCallImmut(joinElemPair[0], joinElemPair[1]);
      if (!joinElem) {
        throw new Error('join is not an element of the lattice');
      }
      this.lstore.rawSetMax(typ, key, join);
    }
  }

  latCallImmut(mod: Hash, key: JSON): JSON {
    let m = this.lstore.getLatticeModule(mod);
    if (m == null) {
      throw new Error('lattice module not found');
    }
    return m.callImmut(key, this);
  }

  latCallMut(mod: Hash, key: JSON): JSON {
    let m = this.lstore.getLatticeModule(mod);
    if (m == null) {
      throw new Error('lattice module not found');
    }
    return m.callMut(key, this);
  }

}


