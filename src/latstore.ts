import {JSON, Hash, hashJSON, stringifyJSON, equalJSON} from './crypto_util';
import {LatGraph, Deps} from './latgraph';


interface LatMapping {
  latGraphs: Record<string, LatGraph>;
  getMax(graphHash: Hash, key: JSON): [JSON, Hash];
}

interface LatDepsMapping extends LatMapping {
  getDependents(graphHash: Hash, key: JSON): Array<[JSON, Hash]>;
}

function cacheKey(graphHash: Hash, key: JSON): string {
  return `${graphHash.toString('hex')}${stringifyJSON(key)}`;
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

function recordDeps(rec: Record<string, [JSON, Hash]>, curr: Hash): Deps {
  return function (key: JSON, graphName?: string) {
    var graphHash = curr;
    if (graphName) {
      graphHash = currGraph.depGraphs[graphName];
      if (!graphHash) {
        throw new Error(`No graph named ${graphName}`);
      }
    }
    var pair = rec[cacheKey(graphHash, key)];
    if (!pair) {
      throw new Error(`No value for ${key} in ${graphHash}`);
    }
    return pair[0];
  }
}

function valueDeps(mapping: LatMapping, graphHash: Hash, key: JSON, value: JSON): Record<string, [JSON, Hash]> {
  let isValueQueries = {};
  let isValueDeps = mappingDeps(mapping, graphHash, isValueQueries);
  if (!mapping.latGraphs[graphHash.toString('hex')].isValue(key, value, isValueDeps)) {
    throw new Error('Bottom is not a value');
  }
  return isValueDeps;
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
    if (new Set(currs.map(stringifyJSON)).size == 1) {
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
    let isValueQueries = valueDeps(this, graphHash, key, join);
    let hash = hashJSON(isValueQueries);
    return this.cache[ckey] = [join, hash];
  }
}

class ModifyMapping implements LatMapping {

  private readonly baseMapping: LatMapping;

  private cache: Record<string, [JSON, Hash]> = {};

  public latGraphs: Record<string, LatGraph>;

  private readonly modifications: Record<string, JSON>;

  constructor(baseMapping: LatMapping, private readonly modifications: Record<string, JSON>) {
    this.baseMapping = baseMapping;
    this.latGraphs = baseMapping.latGraphs;
    this.modifications = modifications;
  }
}


interface LatDB {
  currentVersion(): number;
  incrementVersion(): number;

  getMax(graphHash: Hash, key: JSON, version: number): number | null | [JSON, Hash];

  setMax(graphHash: Hash, key: JSON, value: JSON, deps: Array<[Hash, JSON]>, version: number): Hash;
  setDirty(graphHash: Hash, key: JSON): void;
  removeMax(graphHash: Hash, key: JSON, version: number): void;

  getDependents(graphHash: Hash, key: JSON, version: number): Array<[Hash, JSON]>;
}

class LatStore {
  private readonly db: LatDB;
  latGraphs: Record<string, LatGraph>;

  constructor(db: LatDB, latGraphs: Record<string, LatGraph>) {
    this.db = db;
    this.latGraphs = latGraphs;
  }

  getMapping(version: number): LatMapping {
    return {
      latGraphs: this.latGraphs,
      getMax: (graphHash: Hash, key: JSON) => {
        return this.getMax(graphHash, key, version);
      }
    };
  }

  getMax(graphHash: Hash, key: JSON, version: number): [JSON, Hash] {
    let latGraph = this.latGraphs[graphHash.toString('hex')];
    let currDeps = mappingDeps(this.getMapping(version), graphHash);
    let oldVPair = this.db.getMax(graphHash, key, version);
    let oldV = oldVPair[0];
    let oldPair = oldVPair[1];
    if (oldV < version) {
      let oldDeps = mappingDeps(this.getMapping(oldV), graphHash);
      let transport = latGraph.transport(key, oldPair[0], oldDeps, currDeps);
      let isValueQueries = valueDeps(this, graphHash, key, transport);
      let depsHash = hashJSON(isValueQueries);
      let bot = latGraph.bottom(key, mappingDeps(this, graphHash));
      if (equalJSON(bot, transport)) {
        this.db.removeMax(graphHash, key, version);
      } else {
        this.db.setMax(graphHash, key, transport, depsHash, version);
      }
      return [transport, depsHash];
    }
    if (oldPair) {
      return oldPair;
    }
    let bot = latGraph.bottom(key, currDeps);
    let isValueQueries = valueDeps(this, graphHash, key, bot);
    let hash = this.db.hashPutDeps(isValueQueries);
    return [bot, hash];
  }


  setDirtyRec(graphHash: Hash, key: JSON) {
    let version = this.db.currentVersion();
    if (this.db.getMax(graphHash, key, version)[0] < version) {
      return;
    }
    this.db.setDirty(graphHash, key);
    this.setDependentsDirtyRec(graphHash, key);
  }

  setDependentsDirtyRec(graphHash: Hash, key: JSON) {
    for (let pair of this.db.getDependents(graphHash, key)) {
      this.setDirtyRec(pair[0], pair[1]);
    }
  }

  joinMax(graphHash: Hash, key: JSON, value: JSON) {
    let version = this.db.currentVersion();
    let latGraph = this.latGraphs[graphHash.toString('hex')];
    let deps = mappingDeps(this.getMapping(version), graphHash);
    let pair = this.getMax(graphHash, key);
    if (!pair) {
      let bot = latGraph.bottom(key, deps);
      if (!equalJSON(bot, value)) {
        this.db.setMax(graphHash, key, value, valueDeps(this, graphHash, key, value), version);
        this.setDependentsDirtyRec(graphHash, key);
      }
      return;
    }
    if (!latGraph.isValue(key, value, deps)) {
      throw new Error('value is not a value');
    }
    let join = latGraph.join(key, pair[0], value, deps);
    if (!equalJSON(pair, [join, hashDeps])) {
      this.db.setMax(graphHash, key, value, valueDeps(this, graphHash, key, value), version);
      this.setDependentsDirtyRec(graphHash, key);
    }
  }
}
