
import net = require('net');
import stun = require('stun');


async function getMyIP(): Promise<string> {
  return (await stun.request('stun.l.google.com')).getXorAddress().address;
}
