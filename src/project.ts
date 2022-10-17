import path = require('node:path');
import fs = require('node:fs');

import {JSON, Hash, hashJSON, parseJSON} from './crypto_util';
import {Computation, evalComputation} from './computation';


type ModuleType = 'text' | 'data' | 'js' | 'json';

function fileModuleType(path: string): ModuleType {
  if (path.endsWith('.js')) {
    return 'js';
  }
  if (path.endsWith('.json')) {
    return 'json';
  }
  if (path.endsWith('.txt')) {
    return 'text';
  }
  return 'data';
}

export class Project {
  private baseDir: string;
  private modules: Record<string, Computation> = {};
  private moduleHashes: Record<string, Hash> = {};

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  private loadModule(mpath: string, typ: ModuleType): void {
    if (mpath in this.modules) {
      return;
    }
    let comp: Computation = {code: '', data: {}};
    let fullPath = path.join(this.baseDir, mpath);
    if (typ == 'text') {
      let txt = fs.readFileSync(fullPath, {encoding: 'utf8'});
      comp = {
        data: {t: txt},
        code: 'data.t',
      };
    } else if (typ == 'json') {
      let txt = fs.readFileSync(fullPath, {encoding: 'utf8'});
      let data = parseJSON(txt);
      comp = {
        data: {d: data},
        code: 'data.d',
      };

    } else if (typ == 'data') {
      let data = fs.readFileSync(fullPath);
      let b64 = data.toString('base64');
      comp = {
        data: {d: b64},
        code: 'Buffer.from(data.d, "base64")',
      };
    } else if (typ == 'js') {
      let code = fs.readFileSync(path.join(this.baseDir, mpath), {encoding: 'utf8'});
      let endHeader = code.indexOf('###');
      if (endHeader === -1) {
        throw new Error(`Module ${mpath} does not have a header`);
      }
      let header = code.slice(0, endHeader);
      let lines = header.split(';');
      let data: Record<string, JSON> = {};
      for (let line of lines) {
        if (line.trim() === '') {
          continue;
        }
        let endKey = line.indexOf(':');
        if (endKey === -1) {
          throw new Error(`Module ${mpath} has an invalid header`);
        }
        let key = line.slice(0, endKey).trim();
        let value = line.slice(endKey + 1).trim();
        this.loadModule(key, fileModuleType(key));
        data[key] = this.moduleHashes[key].toString('hex');
      }
      comp = {
        data,
        code: code.slice(endHeader + 3),
      };
    } else {
      throw new Error(`Unknown module type ${typ}`);
    }
    this.modules[mpath] = comp;
    this.moduleHashes[mpath] = hashJSON(comp);
  }
}

