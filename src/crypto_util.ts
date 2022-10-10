
import crypto = require('crypto');


export function hashBytes(bs: Buffer): Buffer {
  return crypto.createHash('sha256').update(bs).digest();
}
