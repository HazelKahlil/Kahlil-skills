import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePublicUrl } from '../scripts/lib.mjs';

test('rejects localhost and literal private-network URL targets', () => {
  for (const url of [
    'http://localhost/reference',
    'http://127.0.0.1/reference',
    'http://10.0.0.2/reference',
    'http://192.168.1.2/reference',
    'http://[::1]/reference'
  ]) {
    assert.throws(() => validatePublicUrl(url), /public host/);
  }
});
