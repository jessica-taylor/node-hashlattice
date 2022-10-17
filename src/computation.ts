import {VM} from 'vm2';
import {JSON} from './crypto_util';

export type Computation = {
  code: string;
  data: Record<string, JSON>;
};

export function evalComputation(computation: Computation): any {
  const sandbox: Record<string, any> = {};
  sandbox.data = computation.data;
  return new VM({sandbox}).run(computation.code);
}

export function constComputation(x: JSON): Computation {
  return {
    code: 'x',
    data: {x}
  };
}
