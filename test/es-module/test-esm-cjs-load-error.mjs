// Flags: --experimental-modules

import { expectsError } from '../common/index.mjs';
import assert from 'assert';
import fixtures from '../common/fixtures.js';

const entry = fixtures.path('/es-modules/invalid.cjs');

import(entry)
.then(assert.fail, expectsError({
    message: `Unexpected string`,
    stack: `
Note: To load an ES module set "type": "module" in the package.json or use the .mjs extension.

${entry}:1
import "invalid";
       ^^^^^^^^^

SyntaxError: Unexpected string
    at wrapSafe (internal/modules/cjs/loader.js:723:20)
    at Module._compile (internal/modules/cjs/loader.js:764:27)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:805:10)
    at Module.load (internal/modules/cjs/loader.js:657:32)
    at Function.Module._load (internal/modules/cjs/loader.js:565:12)
    at internal/modules/esm/translators.js:86:15
    at Object.meta.done (internal/modules/esm/create_dynamic_module.js:48:9)
    at file://${entry}:9:13
    at ModuleJob.run (internal/modules/esm/module_job.js:111:37)
    at async Loader.import (internal/modules/esm/loader.js:134:24)`
}))
