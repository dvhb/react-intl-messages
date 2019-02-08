const { promisify } = require('util');
const { readFile, writeFile } = require('fs');
const globPkg = require('glob');
const request = require('request');

const glob = (pattern, ignore) =>
  new Promise((resolve, reject) => {
    globPkg(pattern, { ignore }, (err, val) => (err ? reject(err) : resolve(val)));
  });

module.exports = {
  request: promisify(request),
  readFile: promisify(readFile),
  writeFile: promisify(writeFile),
  glob,
};
