import vm2 = require('vm2');
import {JSON} from './crypto_util';

export interface Computation {
  code: string;
  data: Record<string, JSON>;
};

export function evalComputation(computation: Computation): any {
  const sandbox: Record<string, any> = {};
  for (const name in computation.data) {
    sandbox[name] = computation.data[name];
  };
  return vm2.runInNewContext(computation.code, sandbox);
}

export function constComputation(x: JSON): Computation {
  return {
    code: 'x',
    data: {x}
  };
}
