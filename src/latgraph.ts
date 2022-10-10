
type Deps = (k: any, graph?: string) => any;

interface LatGraph {
  depGraphs: Record<string, Buffer>;

  isKey(key: any): boolean;

  keyLt(key1: any, key2: any): boolean;

  isValue(key: any, value: any, deps: Deps): boolean;

  bottom(key: any, deps: Deps): any;

  join(key: any, value1: any, value2: any, deps: Deps): any;

  transport(key: any, value: any, deps1: Deps, deps2: Deps): any;
}
