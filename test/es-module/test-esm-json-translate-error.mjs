// Flags: --experimental-modules
import { expectsError, mustCall } from '../common/index.mjs';
import { resolve } from 'path';
import assert from 'assert';

const pathToFile = resolve(process.cwd(), 'test/fixtures/es-modules/translate-invalid-jsonfile.json');

import(pathToFile)
.then(assert.fail, expectsError({
    code: 'ERR_ESM_TRANSLATE_CJS_JSON',
    reason: 'Unexpected token \n in JSON at position 17',
    pathname: pathToFile,
}))
.then(mustCall());
