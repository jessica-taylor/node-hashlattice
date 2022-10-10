declare module 'vm2' {
  export function runInNewContext(code: string, sandbox: Record<string, any>): any;
}
