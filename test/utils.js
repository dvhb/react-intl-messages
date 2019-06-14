const { mkdirSync, readdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const mkdir = path => mkdirSync(path);
const rmdir = path => {
  readdirSync(path).forEach(file => {
    unlinkSync(resolve(path, file));
  });
  rmdirSync(path);
};
const copyFile = (source, target) => writeFileSync(target, readFileSync(source));

module.exports = {
  readJson,
  mkdir,
  rmdir,
  copyFile,
};
