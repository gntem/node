// Flags: --expose-internals
'use strict';
const common = require('../common');
const tmpdir = require('../common/tmpdir');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validateChownOptions } = require('internal/fs/utils');

tmpdir.refresh();

const filePaths = [
  'foo/bar/file1.test',
  'foo/bar',
  'foo/baz/file2.test',
  'foo/baz',
  'foo/bax/file3.test',
  'foo/bax',
  'foo/file4.test',
  'foo'
];

function makeDirectories() {
  const dirname = 'chown-recursive';

  const foobarPath = path.join(dirname, 'foo', 'bar');
  fs.mkdirSync(foobarPath, { recursive: true });
  fs.writeFileSync(path.join(foobarPath, 'file1.test'), 'file1');

  const foobazPath = path.join(dirname, 'foo', 'baz');
  fs.mkdirSync(foobazPath, { recursive: true });
  fs.writeFileSync(path.join(foobazPath, 'file2.test'), 'file1');

  const foobaxPath = path.join(dirname, 'foo', 'bax', 'foo');
  fs.mkdirSync(foobaxPath, { recursive: true });
  fs.writeFileSync(path.join(foobaxPath, 'file3.test'), 'file3');

  return dirname;
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
  const dir = makeDirectories();

  // Recursive chown should succeed.
  fs.chownSync(dir, 1, 1, { recursive: true });

  filePaths.forEach((pathToCheck) => {
    const stat = fs.lstatSync(pathToCheck);
    assert.ok(stat.uid === 1, `uid for ${pathToCheck} should equal 1`);
    assert.ok(stat.gid === 1, `gid for ${pathToCheck} should equal 1`);
  });

  fs.rmdirSync('foo');

}

// test async version.
{
  makeDirectories();
  fs.chown(tmpdir.path, 1, 1, { recursive: true }, common.mustCall(() => {
    filePaths.forEach((pathToCheck) => {
      const stat = fs.lstatSync(pathToCheck);
      assert.ok(stat.uid === 1, `uid for ${pathToCheck} should equal 1`);
      assert.ok(stat.gid === 1, `gid for ${pathToCheck} should equal 1`);
    });
  }, 1));
}
