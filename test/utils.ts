import { mkdirSync, readdirSync, readFileSync, rmdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';

export const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
export const mkdir = (path: string) => mkdirSync(path);
export const rmdir = (path: string) => {
  readdirSync(path).forEach(file => {
    unlinkSync(resolve(path, file));
  });
  rmdirSync(path);
};
