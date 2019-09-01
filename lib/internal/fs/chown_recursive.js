/**
 * Chown recursively similar to chown -R
 */
'use strict';

const {
  readdir,
  readdirSync,
  lstat,
  lstatSync,
  chown,
  chownSync
} = require('fs');

const { join } = require('path');
const notEmptyErrorCodes = new Set(['ENOTEMPTY', 'EEXIST']);
const { setTimeout } = require('timers');

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


function _chownChildren(path, uid, gid, options, callback) {
  readdir(path, (err, files) => {
    if (err)
      return callback(err);

    let numFiles = files.length;

    if (numFiles === 0)
      return chown(path, uid, gid, callback);

    let done = false;

    files.forEach((child) => {
      chownRecursive(join(path, child), uid, gid, options, (err) => {
        if (done)
          return;

        if (err) {
          done = true;
          return callback(err);
        }

        numFiles--;
        if (numFiles === 0)
          chown(path, uid, gid, callback);
      });
    });
  });
}

function _chown(path, uid, gid, options, originalErr, callback) {
  chown(path, (err) => {
    if (err) {
      if (notEmptyErrorCodes.has(err.code))
        return _chownChildren(path, uid, gid, options, callback);
      if (err.code === 'ENOTDIR')
        return callback(originalErr);
    }
    callback(err);
  });
}

function _chownRecursive(path, uid, gid, options, callback) {
  lstat(path, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT')
        return callback(null);
    } else if (stats.isDirectory()) {
      return _chown(path, uid, gid, options, err, callback);
    }
  });
}

function chownRecursive(path, uid, gid, options, callback) {
  let timeout = 0;  // For EMFILE handling.
  let busyTries = 0;
  _chownRecursive(path, uid, gid, options, function CB(err) {
    if (err) {
      if ((err.code === 'EBUSY' || err.code === 'ENOTEMPTY' ||
           err.code === 'EPERM') && busyTries < options.maxBusyTries) {
        busyTries++;
        return setTimeout(_chownRecursive, busyTries * 100, path, options, CB);
      }

      if (err.code === 'EMFILE' && timeout < options.emfileWait)
        return setTimeout(_chownRecursive, timeout++, path, options, CB);
    }
    callback(err);
  });
}


module.exports = { chownRecursiveSync, chownRecursive };
