
import net = require('net');
import stun = require('stun');


function getMyIP(): Promise<string> {
  return (await stun.request('stun.l.google.com')).getAddress().address;
}
