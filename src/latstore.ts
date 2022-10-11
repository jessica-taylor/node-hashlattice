import {JSON, Hash, hashJSON} from './crypto_util';
import {LatGraph, Deps} from './latgraph';
import cjson = require('canonical-json');


interface LatMapping {
  latGraphs: Record<string, LatGraph>;
  getMax(graphHash: Hash, key: JSON): [JSON, Hash];
}

function cacheKey(graphHash: Hash, key: JSON): string {
  return `${graphHash.toString('hex')}${cjson.stringify(key)}`;
}

function mappingDeps(mapping: LatMapping, curr: Hash, queries: Record<string, [JSON, Hash]> = {}): Deps {
  let currGraph = mapping.latGraphs[curr.toString('hex')];
  if (!currGraph) {
    throw new Error(`No graph with hash ${curr}`);
  }
  return function(key: JSON, graphName?: string) {
    var graphHash = curr;
    if (graphName) {
      graphHash = currGraph.depGraphs[graphName];
      if (!graphHash) {
        throw new Error(`No graph named ${graphName}`);
      }
    }
    var pair = queries[cacheKey(graphHash, key)] = mapping.getMax(graphHash, key);
    return pair[0];
  }
}

class MergeMapping implements LatMapping {
  private readonly mappings: LatMapping[];
  private cache: Record<string, [JSON, Hash]> = {};
  public latGraphs: Record<string, LatGraph>;
  constructor(mappings: LatMapping[]) {
    if (mappings.length === 0) {
      throw new Error('MergeMapping must have at least one mapping');
    }
    this.latGraphs = mappings[0].latGraphs;
    // for (const mapping of mappings) {
    //   if (mapping.latGraph !== this.latGraph) {
    //     throw new Error('mappings must have the same latGraph');
    //   }
    // }
    this.mappings = mappings;
  }
  getMax(graphHash: Hash, key: JSON): [JSON, Hash] {
    let ckey = cacheKey(graphHash, key);
    if (ckey in this.cache) {
      return this.cache[ckey];
    }
    let currs: [any, Hash][] = [];
    for (const mapping of this.mappings) {
      currs.push(mapping.getMax(graphHash, key));
    }
    if (new Set(currs.map(x => x[1])).size == 1) {
      return this.cache[ckey] = currs[0];
    }
    let latGraph = this.latGraphs[graphHash.toString('hex')];
    let deps = mappingDeps(this, graphHash);
    let transports = [];
    for (var i = 0; i < currs.length; ++i) {
      transports.push(latGraph.transport(key, currs[i][0], mappingDeps(this.mappings[i], graphHash), deps));
    }
    let join = transports[0];
    for (var i = 1; i < transports.length; ++i) {
      join = latGraph.join(key, join, transports[i], deps);
    }
    let isValueQueries = {};
    let isValueDeps = mappingDeps(this, graphHash, isValueQueries);
    if (!latGraph.isValue(key, join, isValueDeps)) {
      throw new Error('Join is not a value');
    }
    let hash = hashJSON([join, isValueQueries]);
    return this.cache[ckey] = [join, hash];
  }
}


interface LatDB {
  getMax(graphHash: Hash, key: JSON): [JSON, Hash] | null;
  setMax(graphHash: Hash, key: JSON, value: JSON, hash: Hash): void;
  removeMax(graphHash: Hash, key: JSON): void;

  hashLookupDeps(hash: Hash): Record<string, [JSON, Hash]>;

  isDirty(graphHash: Hash, key: JSON): boolean;
  setDirty(graphHash: Hash, key: JSON, dirty: boolean): void;

  getDependents(graphHash: Hash, key: JSON): Array<[Hash, JSON]>;
  setDependency(first: [Hash, JSON], second: [Hash, JSON], dep: boolean): void;
}

// class LatStore implements LatMapping {
//   private readonly db: LatDB;
//   latGraphs: Record<string, LatGraph>;
// 
//   constructor(db: LatDB, latGraphs: Record<string, LatGraph>) {
//     this.db = db;
//     this.latGraphs = latGraphs;
//   }
// 
//   getMax(graphHash: Hash, key: JSON): [JSON, Hash] {
//     if (this.db.isDirty(graphHash, key)) {
//       // TODO transport, need old deps?
//       this.db.setDirty(graphHash, key, false);
//     }
//     let oldPair = this.db.getMax(graphHash, key);
//     if (oldPair) {
//       return oldPair;
//     }
//     let bot = this.latGraphs[graphHash.toString('hex')].bottom(key, mappingDeps(this, graphHash));
//     let isValueQueries = {};
//     let isValueDeps = mappingDeps(this, graphHash, isValueQueries);
//     if (!latGraph.isValue(key, bot, isValueDeps)) {
//       throw new Error('Bottom is not a value');
//     }
//     let hash = hashJSON([join, isValueQueries]);
//     // this.db.setMax(graphHash, key, bot, hash);
//     // for (let pair of this.db.getDependents(graphHash, key)) {
//     //   this.setDirtyRec(pair[0], pair[1]);
//     // }
//   }
// 
//   setDirtyRec(graphHash: Hash, key: JSON) {
//     if (this.db.isDirty(graphHash, key)) {
//       return;
//     }
//     this.db.setDirty(graphHash, key, true);
//     for (let pair of this.db.getDependents(graphHash, key)) {
//       this.setDirtyRec(pair[0], pair[1]);
//     }
//   }
// 
//   joinMax(graphHash: Hash, key: JSON, value: JSON) {
//     let pair = this.db.getMax(graphHash, key);
//     if (!pair) {
//       this.db.setMax(graphHash, key, value);
//       return;
//     }
//     let latGraph = this.latGraphs[graphHash.toString('hex')];
//     let deps = mappingDeps(this, graphHash);
//     let transport = latGraph.transport(key, value, deps, deps);
//     let join = latGraph.join(key, pair[0], transport, deps);
//     if (hashJSON(join) === pair[1]) {
//       return;
//     }
//     this.db.setMax(graphHash, key, join);
//   }
// }
