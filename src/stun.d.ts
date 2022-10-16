
declare module 'stun' {
  export interface StunResponse {
    getXorAddress(): {address: string, port: number};
  }
  export function request(url: string): Promise<StunResponse>;
}
