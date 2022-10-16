
import net = require('net');
import stun = require('stun');

type AddressPort = {address: string, port: number};


export async function getMyIP(): Promise<AddressPort> {
  return (await stun.request('stun.l.google.com')).getXorAddress();
}

export function tcpListen(port: number): void {
  let server = net.createServer();
  server.listen(() => {
    let port = (server.address() as net.AddressInfo).port;
  });
  server.on('error', (err) => {
    throw err;
  });
  server.on('connection', (socket) => {
    console.log('connection', socket);
  });
}

export function tcpConnect(ap: AddressPort): void {
  let sock = net.connect(ap.port, ap.address, () => {
    console.log('connected');
  });
}
