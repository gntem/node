// Flags: --experimental-modules

import { mustCall } from '../common/index.mjs';
import assert from 'assert';
import fixtures from '../common/fixtures.js';
import { spawn } from 'child_process';

const entry = fixtures.path('/es-modules/invalid.cjs');

// Expect note to be included in the error output
const expectation = '\nNote: To load an ES module using ' +
'--experimental-modules set "type": "module" in the package.json ' +
'or use the .mjs extension.\n\n';

const child = spawn(process.execPath, ['--experimental-modules', entry]);
let stderr = '';
child.stderr.setEncoding('utf8');
child.stderr.on('data', (data) => {
  stderr += data;
});
child.on('close', mustCall((code, signal) => {
  assert.strictEqual(code, 1);
  assert.strictEqual(signal, null);
  assert.ok(stderr.includes(expectation));
}));
