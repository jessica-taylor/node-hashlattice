
interface LatGraph {
  depGraphs: Record<string, Buffer>;

  isKey(key: any): boolean;

  keyLt(key1: any, key2: any): boolean;

  isValue(key: any, value: any, deps: (k: any) => any): boolean;

  bottom(key: any, deps: (k: any) => any): any;

  join(key: any, value1: any, value2: any, deps: (k: any) => any): any;

  transport(key: any, value: any, deps1: (k: any) => any, deps2: (k: any) => any): any;
}
