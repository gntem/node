// Flags: --expose-internals
'use strict';
const common = require('../common');
const tmpdir = require('../common/tmpdir');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validateChownOptions } = require('internal/fs/utils');
let count = 0;

tmpdir.refresh();

function makeNonEmptyDirectory() {
  const dirname = `chown-recursive-${count}`;
  fs.mkdirSync(path.join(dirname, 'foo', 'bar', 'baz'), { recursive: true });
  fs.writeFileSync(path.join(dirname, 'text.txt'), 'hello', 'utf8');
  count++;
  return dirname;
}

// Test the synchronous version.
{
  const dir = makeNonEmptyDirectory();

  // Recursive removal should succeed.
  fs.chownSync(dir, 1, 1, { recursive: true });

  // No error should occur if recursive and the directory does not exist.
  fs.chownSync(dir, 1, 1, { recursive: true });

  // Attempted removal should fail now because the directory is gone.
  common.expectsError(() => fs.chownSync(dir), { syscall: 'chown' });
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

  [null, 'foo', 5, NaN].forEach((bad) => {
    common.expectsError(() => {
      validateChownOptions(bad);
    }, {
      code: 'ERR_INVALID_ARG_TYPE',
      type: TypeError,
      message: /^The "options" argument must be of type object\./
    });
  });

  [undefined, null, 'foo', Infinity, function() {}].forEach((bad) => {
    common.expectsError(() => {
      validateChownOptions({ recursive: bad });
    }, {
      code: 'ERR_INVALID_ARG_TYPE',
      type: TypeError,
      message: /^The "recursive" argument must be of type boolean\./
    });
  });
}
