
import crypto = require('crypto');

import cjson = require('canonical-json');

export type JSON = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
    [x: string]: JSON;
}

export interface JSONArray extends Array<JSON> { }

export function hashBytes(bs: Buffer): Buffer {
  return crypto.createHash('sha256').update(bs).digest();
}

export function jsonToBuffer(js: JSON): Buffer {
  return Buffer.from(cjson.stringify(js), 'utf8');
}

export function hashJSON(js: JSON): Buffer {
  return hashBytes(jsonToBuffer(js));
}

export function bufferToJSON(bs: Buffer): JSON {
  return JSON.parse(bs.toString('utf8')) as JSON;
}
