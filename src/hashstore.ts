import {Hash, hashBytes} from './crypto_util';
import computation = require('./computation');

interface HashStore {
  hashLookup(hash: Buffer): Buffer | null;
  hashPut(data: Buffer): Buffer;
}

class MemoryHashStore implements HashStore {
  private store: {[hash: string]: Buffer} = {};

  hashLookup(hash: Hash): Buffer | null {
    return this.store[hash.toString('hex')];
  }

  hashPut(data: Buffer): Hash {
    var hash = hashBytes(data);
    this.store[hash.toString('hex')] = data;
    return hash;
  }
}

