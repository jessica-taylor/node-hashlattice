import {JSON, hashJSON} from './crypto_util';
import {LatGraph, Deps} from './latgraph';
import cjson = require('canonical-json');


interface LatMapping {
  latGraphs: Record<string, LatGraph>;
  getMax(graphHash: Buffer, key: JSON): [JSON, Buffer];
}

function cacheKey(graphHash: Buffer, key: JSON): string {
  return `${graphHash.toString('hex')}${cjson.stringify(key)}`;
}

function mappingDeps(mapping: LatMapping, curr: Buffer, queries: Record<string, [JSON, Buffer]> = {}): Deps {
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
  private cache: Record<string, [JSON, Buffer]> = {};
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
  getMax(graphHash: Buffer, key: JSON): [JSON, Buffer] {
    let ckey = cacheKey(graphHash, key);
    if (ckey in this.cache) {
      return this.cache[ckey];
    }
    let currs: [any, Buffer][] = [];
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

