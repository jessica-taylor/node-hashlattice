
import crypto = require('crypto');

import cjson = require('canonical-json');

export type JSON = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
    [x: string]: JSON;
}

export interface JSONArray extends Array<JSON> { }

export interface Hash extends Buffer {
  length: 32;
}

// export type Hash = FixedLengthArray<32, number>;

export function hashBytes(bs: Buffer): Hash {
  return crypto.createHash('sha256').update(bs).digest() as Hash;
}

export function parseJSON(s: string): JSON {
  return JSON.parse(s) as JSON;
}

export function stringifyJSON(js: JSON): string {
  return cjson.stringify(js);
}

export function jsonToBuffer(js: JSON): Buffer {
  return Buffer.from(stringifyJSON(js), 'utf8');
}

export function hashJSON(js: JSON): Hash {
  return hashBytes(jsonToBuffer(js));
}

export function bufferToJSON(bs: Buffer): JSON {
  return JSON.parse(bs.toString('utf8')) as JSON;
}

export function equalJSON(js1: JSON, js2: JSON): boolean {
  return stringifyJSON(js1) == stringifyJSON(js2);
}
