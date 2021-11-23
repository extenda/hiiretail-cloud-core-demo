import { JsonDB } from 'node-json-db';
import * as fs from 'fs';

export const db =
  fs.existsSync('db.json') ?
    new JsonDB('db.json', true, true) :
    fs.writeFileSync('db.json', '{}') as undefined || new JsonDB('db.json', true, true);
