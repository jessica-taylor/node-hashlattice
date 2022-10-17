
// import dgram from 'node:dgram';

declare module 'stun' {
  export interface StunResponse {
    getXorAddress(): {address: string, port: number};
  }
  export function request(url: string, opts: any): Promise<StunResponse>;
}
