
declare module 'stun' {
  export interface StunResponse {
    getXorAddress(): {address: string};
  }
  export function request(url: string): Promise<StunResponse>;
}
