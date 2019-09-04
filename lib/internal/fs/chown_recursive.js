'use strict';

const {
  readdir,
  readdirSync,
  lstat,
  lstatSync,
  chown,
  chownSync
} = require('fs');

const { join, resolve } = require('path');
const notEmptyErrorCodes = new Set(['EEXIST']);
const { setTimeout } = require('timers');

function chownRSync(path, uid, gid, options) {
  const stats = lstatSync(path);
  if (stats !== undefined && stats.isDirectory()) {
    const childrenPaths = readdirSync(path);
    childrenPaths.forEach((childPath) =>
      _chownRChildrenSync(path, childPath, uid, gid, options));
  } else {
    chownSync(path, uid, gid);
  }
}

function _chownRChildrenSync(path, childPath, uid, gid, options) {
  if (typeof childPath === 'string') {
    const stats = lstatSync(resolve(path, childPath));
    stats.name = childPath;
    childPath = stats;
  }

  if (childPath.isDirectory()) {
    chownRSync(resolve(path, childPath.name), uid, gid, options);
  }

  chownSync(path, uid, gid);
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
      chownR(join(path, child), uid, gid, options, (err) => {
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

function _chownR(path, uid, gid, options, callback) {
  lstat(path, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT')
        return callback(null);
    } else if (stats.isDirectory()) {
      return _chown(path, uid, gid, options, err, callback);
    }
  });
}

function chownR(path, uid, gid, options, callback) {
  let timeout = 0;  // For EMFILE handling.
  _chownR(path, uid, gid, options, function CB(err) {
    if (err) {
      if (err.code === 'EMFILE')
        return setTimeout(_chownR, timeout++, path, options, CB);
    }
    callback(err);
  });
}


module.exports = { chownRSync, chownR };
