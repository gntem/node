// Flags: --expose-internals
'use strict';
const common = require('../common');
const tmpdir = require('../common/tmpdir');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validateChownOptions } = require('internal/fs/utils');

tmpdir.refresh();

/*
foo
|_ bar
|    |_ file1.test
|_ baz
|    |_ file2.test
|_ bax
     |_ foo
          |_ file3.test
*/
function makeDirectories() {
  const dirname = 'chown-recursive';

  const foobarPath = path.join(dirname, 'foo', 'bar');
  fs.mkdirSync(foobarPath, { recursive: true });
  fs.writeFileSync(path.join(foobarPath, 'file1.test', 'file1'));

  const foobazPath = path.join(dirname, 'foo', 'baz');
  fs.mkdirSync(foobazPath, { recursive: true });
  fs.writeFileSync(path.join(foobazPath, 'file2.test', 'file1'));

  const foobaxPath = path.join(dirname, 'foo', 'bax', 'foo');
  fs.mkdirSync(foobaxPath, { recursive: true });
  fs.writeFileSync(path.join(foobaxPath, 'file3.test', 'file3'));
}

// Test the synchronous version.
{
  const dir = makeDirectories();

  // Recursive chown should succeed.
  fs.chownSync(dir, 1, 1, { recursive: true });
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
