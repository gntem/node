// Flags: --experimental-modules

import { expectsError } from '../common/index.mjs';
import assert from 'assert';
import fixtures from '../common/fixtures.js';

const entry = fixtures.path('/es-modules/invalid.cjs');

import(entry)
.then(assert.fail, expectsError({
    code: 'ESM_CJS_LOAD_ERROR',
    message: `${entry}:1
import "invalid";
       ^^^^^^^^^
Warning: Attempted to load commonjs module but found static import statement
Further information can be found at https://nodejs.org/api/esm.html

SyntaxError: Unexpected string
`,
}))
