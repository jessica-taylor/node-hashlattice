
import fs = require('fs');

import {Client, client, xml, jid} from '@xmpp/client';

// import debug = require('@xmpp/debug');

type XmppCreds = {
  service: string,
  username: string,
  password: string
}

function clientFromCreds(creds: XmppCreds): Client {
  let cl = client({
    service: creds.service,
    username: creds.username,
    password: creds.password,
    resource: 'xmppjs'
  });
  cl.on("error", (err) => {
    console.error(err);
  });
  cl.on("offline", () => {
    console.log("offline");
  });
  return cl;
}

function testJixim() {

  let creds = JSON.parse(fs.readFileSync('xmpp_creds/jixim.json', {encoding: 'utf8'}));
  const xmpp = clientFromCreds(creds);

  // debug(xmpp, true);



  xmpp.on("stanza", async (stanza) => {
    // TODO let the user add more event handlers by tag
    if (stanza.is("message")) {
      console.log(stanza);
      console.log(stanza.getChild('body'))
      // await xmpp.send(xml("presence", { type: "unavailable" }));
      // await xmpp.stop();
    }
  });

  xmpp.on("online", async (address) => {
    console.log('my address is: ' + address);

    // Makes itself available
    await xmpp.send(xml("presence"));

    // Sends a chat message to itself
    const message = xml(
      "message",
      { type: "chat", to: jid('jessicata@sure.im') },
      xml("body", {}, "hello world 5"),
    );
    await xmpp.send(message);
  });

  xmpp.start().catch(console.error);
}

// import wrtc = require('wrtc');

// type AddressPort = {address: string, port: number};

// export function testWRTC(): void {
//   let pc = new wrtc.RTCPeerConnection();
//   let dc = pc.createDataChannel('data');
//   dc.onopen = () => {
//     console.log('data channel open');
//   };
//   dc.onmessage = (event) => {
//     console.log('data channel message', event.data);
//   };
//   dc.onclose = () => {
//     console.log('data channel close');
//   };
//   pc.addEventListener('icecandidate', (e) => {
//     console.log('icecandidate', e.candidate);
//   });
// }

// export async function getMyIP(port: number): Promise<AddressPort> {
//   console.log('internal port', port);
//   let udpSock = dgram.createSocket('udp4');
//   udpSock.bind(port);
//   return (await stun.request('stun.l.google.com', {socket: udpSock})).getXorAddress();
// }
// 
// export function tcpListen(): Promise<AddressPort> {
//   return new Promise((resolve, reject) => {
//     let server = net.createServer();
//     server.listen(() => {
//       let port = (server.address() as net.AddressInfo).port;
//       getMyIP(port).then((addrPort) => { resolve(addrPort); });
//     });
//     server.on('error', (err) => {
//       reject(err);
//     });
//     server.on('connection', (socket) => {
//       console.log('connection', socket);
//     });
//   });
// }
// 
// export function tcpConnect(ap: AddressPort): void {
//   let sock = net.connect(ap.port, ap.address, () => {
//     console.log('connected');
//   });
// }
// 
// async function main(): Promise<void> {
//   let ap = await tcpListen();
//   console.log('external address', ap);
//   tcpConnect(ap);
// }
// 
// main().then(() => {
//   console.log('main done');
// })
