import vm2 = require('vm2');

declare module 'vm2' {
  export function runInNewContext(code: string, sandbox: Record<string, any>): any;
}

interface Computation {
  code: string;
  data: Record<string, any>;
};

function evalComputation(computation: Computation): any {
  const sandbox: Record<string, any> = {};
  for (const name in computation.data) {
    sandbox[name] = computation.data[name];
  };
  return vm2.runInNewContext(computation.code, sandbox);
}

function constComputation(x: any): Computation {
  return {
    code: 'x',
    data: {x}
  };
}
