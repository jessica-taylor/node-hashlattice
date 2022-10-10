
import crypto = require('crypto');

import cjson = require('canonical-json');

export function hashBytes(bs: Buffer): Buffer {
  return crypto.createHash('sha256').update(bs).digest();
}

export function jsonToBuffer(js: any): Buffer {
  return Buffer.from(cjson.stringify(js), 'utf8');
}

export function hashJson(js: any): Buffer {
  return hashBytes(jsonToBuffer(js));
}

export function bufferToJson(bs: Buffer): any {
  return JSON.parse(bs.toString('utf8'));
}
