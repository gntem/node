// Flags: --experimental-modules

import { expectsError } from '../common/index.mjs';
import assert from 'assert';
import fixtures from '../common/fixtures.js';

const entry = fixtures.path('es-modules/invalid.cjs');

import(entry)
.then(assert.fail, expectsError({
    code: '',
    reason: '',
    pathname: entry,
}))
