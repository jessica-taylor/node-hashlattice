import {JSON, Hash, hashJSON, stringifyJSON, equalJSON} from './crypto_util';
import {LatticeType, Key} from './lattype';


interface LatMapping {
  latTypes: Record<string, LatticeType>;

  getMax(key: Key): [JSON] | null;
}

// export function joinMappingsAt(mapping1: LatMapping, mapping2: LatMapping, key: Key, rec: Record<string, JSON>): JSON {
//   let latType = mapping.latTypes[key[0].toString('hex')];
//   let comp = latType.getComputation(key[1]);
//   if (comp[0] == 'return') {
//     return comp[1];
//   }
//   if (comp[0] == 'bind') {
//     let max1 = mapping1.getMax(key);
//     let max2 = mapping2.getMax(key);
//     if (max1 == null || max2 == null) {
//       throw new Error('Unbound key');
//     }
//     let join = latType.join(max1, max2);
//     rec[stringifyJSON(key)] = join;
//     return evalComputation(mapping, comp[2](join));
//   }
//   if (comp[0] == 'let') {
//     return evalComputation(mapping, comp[2](evalComputation(mapping, comp[1])));
//   }
//   if (comp[0] == 'tail') {
//     return evalComputation(mapping, comp[1]);
//   }
//   throw new Error('Unknown computation');
// }
// 
// // interface LatDB {
// //   getMax(typeHash: Hash, key: JSON): null | [JSON];
// // 
// //   setMax(typeHash: Hash, key: JSON, value: null | [JSON]): void;
// // }
// 
// class LatDBMapping implements LatMapping {
//   public readonly latTypes: Record<string, LatticeType>;
//   private readonly db: LatDB;
// 
//   constructor(db: LatDB, latTypes: Record<string, LatticeType>) {
//     this.db = db;
//     this.latTypes = latTypes;
//   }
// 
//   public getMax(typeHash: Hash, key: JSON): JSON {
//     let value = this.db.getMax(typeHash, key);
//     if (value != null) {
//       return value[0];
//     }
//     const type = this.latTypes[typeHash.toString('hex')];
//     if (type == null) {
//       throw new Error('unknown type');
//     }
//     return type.bottom(key);
//   }
// 
//   public join(typeHash: Hash, key: JSON, value: JSON): JSON {
//     const type = this.latTypes[typeHash.toString('hex')];
//     if (type == null) {
//       throw new Error('unknown type');
//     }
//     if (!type.isValue(key, value)) {
//       throw new Error('invalid value');
//     }
//     const old = this.getMax(typeHash, key);
//     const join = type.join(key, old, value);
//     if (!equalJSON(join, old)) {
//       if (equalJSON(join, type.bottom(key))) {
//         this.db.setMax(typeHash, key, null);
//       } else {
//         this.db.setMax(typeHash, key, [join]);
//       }
//     }
//   }
// }


// interface LatDepsMapping extends LatMapping {
//   getDependents(typeHash: Hash, key: JSON): Array<[JSON, Hash]>;
// }


// function mappingDeps(mapping: LatMapping, curr: Hash, queries: Record<string, [JSON, Hash]> = {}): Deps {
//   let currType = mapping.latTypes[curr.toString('hex')];
//   if (!currType) {
//     throw new Error(`No type with hash ${curr}`);
//   }
//   return function(key: JSON, typeName?: string) {
//     var typeHash = curr;
//     if (typeName) {
//       typeHash = currType.depTypes[typeName];
//       if (!typeHash) {
//         throw new Error(`No type named ${typeName}`);
//       }
//     }
//     var pair = queries[cacheKey(typeHash, key)] = mapping.getMax(typeHash, key);
//     return pair[0];
//   }
// }
// 
// function recordDeps(rec: Record<string, [JSON, Hash]>, curr: Hash): Deps {
//   return function (key: JSON, typeName?: string) {
//     var typeHash = curr;
//     if (typeName) {
//       typeHash = currType.depTypes[typeName];
//       if (!typeHash) {
//         throw new Error(`No type named ${typeName}`);
//       }
//     }
//     var pair = rec[cacheKey(typeHash, key)];
//     if (!pair) {
//       throw new Error(`No value for ${key} in ${typeHash}`);
//     }
//     return pair[0];
//   }
// }

// function valueDeps(mapping: LatMapping, typeHash: Hash, key: JSON, value: JSON): Record<string, [JSON, Hash]> {
//   let isValueQueries = {};
//   let isValueDeps = mappingDeps(mapping, typeHash, isValueQueries);
//   if (!mapping.latTypes[typeHash.toString('hex')].isValue(key, value, isValueDeps)) {
//     throw new Error('Bottom is not a value');
//   }
//   return isValueDeps;
// }




