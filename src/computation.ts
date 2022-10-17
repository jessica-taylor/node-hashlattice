import {VM} from 'vm2';
import {JSON} from './crypto_util';

export type Computation = {
  code: string;
  data: Record<string, JSON>;
};

export function evalComputation(computation: Computation, api?: Record<string, any>): any {
  // SECURITY NOTE: API values may be modified by the code! Do not pass in re-used functions, instead create
  // new anonymous functions, e.g. evalComputation(comp, {foo: (x) => {return x+5;}})
  const sandbox: Record<string, any> = Object.assign({}, api || {});
  sandbox.data = computation.data;
  return new VM({sandbox}).run(computation.code);
}

export function constComputation(x: JSON): Computation {
  return {
    code: 'x',
    data: {x}
  };
}
