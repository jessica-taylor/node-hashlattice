import vm2 = require('vm2');

interface StringAnyMapping {
  [name: string]: any;
}

declare module 'vm2' {
  export function runInNewContext(code: string, sandbox: StringAnyMapping): any;
}

interface Computation {
  code: string;
  data: StringAnyMapping;
};

function evalComputation(computation: Computation): any {
  const sandbox: StringAnyMapping = {};
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
