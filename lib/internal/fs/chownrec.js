'use strict';

const { readdirSync, lstatSync, chownSync } = require('fs');

function _chownRecSync(path, uid, gid, options) {
  const stats = lstatSync(path);
  if (stats !== undefined && stats.isDirectory()) {
    const files = readdirSync(path);
    files.forEach((file) =>
      chownSync(path, uid, gid, options));
  } else {
    chownSync(path, uid, gid, options);
  }
}
