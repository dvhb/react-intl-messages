import * as fs from 'fs';
import * as G from 'glob';

export const glob = (pattern: string, ignore?: string | string[]): Promise<string[]> =>
  new Promise((resolve, reject) => {
    G(pattern, { ignore }, (err, val) => (err ? reject(err) : resolve(val)));
  });

export const readFile = (file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => (err ? reject(err) : resolve(data)));
  });

export const writeFile = (file: string, contents: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.writeFile(file, contents, 'utf8', err => (err ? reject(err) : resolve()));
  });
