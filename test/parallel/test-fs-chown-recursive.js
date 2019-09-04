// Flags: --expose-internals
'use strict';
const common = require('../common');
const tmpdir = require('../common/tmpdir');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validateChownOptions } = require('internal/fs/utils');

tmpdir.refresh();

const dirname = 'chown-recursive';

const paths = [
  'bar/file1.test',
  'bar',
  'file2.test',
  'foo'
];

const expectUID = 1;
const expectGID = 1;

const mainPath = path.join(tmpdir.path, dirname);
const fooPath = path.join(mainPath, 'foo');

function makeDirectories() {
  fs.mkdirSync(fooPath, { recursive: true });
  fs.mkdirSync(path.join(fooPath, 'bar'));
  fs.writeFileSync(path.join(fooPath, 'bar', 'file1.test'), 'file1');
  fs.writeFileSync(path.join(fooPath, 'file2.test'), 'file2');
}


// Test input validation.
{
  const defaults = {
    recursive: false
  };
  const modified = {
    recursive: true
  };

  assert.deepStrictEqual(validateChownOptions(), defaults);
  assert.deepStrictEqual(validateChownOptions({}), defaults);
  assert.deepStrictEqual(validateChownOptions(modified), modified);
  assert.deepStrictEqual(validateChownOptions({
  }), {
    recursive: false
  });

  [null, 'foo', 5, NaN].forEach((badArg) => {
    common.expectsError(() => {
      validateChownOptions(badArg);
    }, {
      code: 'ERR_INVALID_ARG_TYPE',
      type: TypeError,
      message: /^The "options" argument must be of type object\./
    });
  });

  [undefined, null, 'foo', Infinity, function() {}].forEach((badValue) => {
    common.expectsError(() => {
      validateChownOptions({ recursive: badValue });
    }, {
      code: 'ERR_INVALID_ARG_TYPE',
      type: TypeError,
      message: /^The "recursive" argument must be of type boolean\./
    });
  });
}

// Test the synchronous version.
{
  makeDirectories();

  // Recursive chown should succeed.
  fs.chownSync(fooPath, expectUID, expectGID, { recursive: true });

  paths.forEach((p) => {
    const stat = fs.lstatSync(path.join(fooPath, p));
    assert.strictEqual(stat.uid, expectUID,
                       `uid for ${p} should equal ${expectUID}`);
    assert.strictEqual(stat.gid, expectGID,
                       `gid for ${p} should equal ${expectGID}`);
  });
}
/*
// test async version.
{
  makeDirectories();
  fs.chown(tmpdir.path, expectUID, expectGID, { recursive: true }, common.mustCall(() => {
    filePaths.forEach((pathToCheck) => {
      const stat = fs.lstatSync(pathToCheck);
      assert.ok(stat.uid === expectUID, `uid for ${pathToCheck} should equal ${expectUID}`);
      assert.ok(stat.gid === expectGID, `gid for ${pathToCheck} should equal ${expectGID}`);
    });
  }, 1));
}
*/
