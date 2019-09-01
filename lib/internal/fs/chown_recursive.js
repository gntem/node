'use strict';

const { readdirSync, lstatSync, chownSync } = require('fs');

function chownRecursiveSync(path, uid, gid, options) {
  const stats = lstatSync(path);
  if (stats !== undefined && stats.isDirectory()) {
    const files = readdirSync(path);
    files.forEach((file) =>
      chownRecursiveSync(path, uid, gid, options));
  } else {
    chownSync(path, uid, gid, options);
  }
}

function chownRecursive(path, uid, gid, options, callback) {}

module.exports = { chownRecursiveSync, chownRecursive };
