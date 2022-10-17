declare module 'vm2' {
  export class VM {
    constructor(options: {sandbox: Record<string, any>});
    run(code: string): any;
  };
}
