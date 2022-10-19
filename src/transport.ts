
import fs = require('fs');

import wrtc = require('wrtc');
import {Socket, io} from 'socket.io-client';

import {JSON} from './crypto_util';

interface Transport {

  getPeers(): Array<JSON>;

  send(peer: JSON, msg: JSON): void;

  registerReceiveHandler(handler: (peer: JSON, msg: JSON) => void): void;
}

class WRTCTransport {

  private signalServer: Socket;

  constructor(signalServer: string) {
    this.signalServer = io(signalServer);
  }

  send(peer: JSON, msg: JSON): void {

  }

}
