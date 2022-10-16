import {JSON, Hash, hashJSON, stringifyJSON, equalJSON} from './crypto_util';
import {HashLookup, HashPut, HashModule, LatticeType, LatticeLookup, LatticePut, LatticeModule} from './lattype';


export interface HashStore {
  rawHashLookup(hash: Hash): Buffer | null;
  rawHashPut(value: Buffer): Hash;
}

export interface HashModuleStore extends HashStore {
  getHashModule(hash: Hash): HashModule | null;
}

class HashStoreLookup implements HashLookup, HashPut {

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

  callImmut(mod: Hash, key: JSON): JSON {
    let hm = this.store.getHashModule(mod);
    if (hm == null) {
      throw new Error('hash module not found');
    }
    return hm.callImmut(key, this);
  }

  callMut(mod: Hash, key: JSON): JSON {
    let hm = this.store.getHashModule(mod);
    if (hm == null) {
      throw new Error('hash module not found');
    }
    return hm.callMut(key, this);
  }
}



