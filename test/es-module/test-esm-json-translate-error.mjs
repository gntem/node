// Flags: --experimental-modules
import { expectsError, mustCall } from '../common/index.mjs';
import assert from 'assert';

import('../fixtures/es-modules/translate-invalid-jsonfile.json')
.then(assert.fail, expectsError({
  code: 'ERR_ESM_TRANSLATE_CJS_JSON',
  reason: 'Unexpected token \n in JSON at position 17',
}))
.then(mustCall());
