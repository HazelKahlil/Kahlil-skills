import assert from 'node:assert/strict';
import test from 'node:test';
import { pinnedLookup, resolvePublicTarget } from '../scripts/capture_url.mjs';

test('rejects a hostname when any resolved address is non-public', async () => {
  const resolver = async () => [{ address: '93.184.216.34', family: 4 }, { address: '127.0.0.1', family: 4 }];
  await assert.rejects(() => resolvePublicTarget('example.test', resolver), /public network addresses/);
});

test('pins the verified address for the actual network connection', async () => {
  const lookup = pinnedLookup({ address: '93.184.216.34', family: 4 });
  const result = await new Promise((resolve, reject) => lookup('attacker.example', {}, (error, address, family) => error ? reject(error) : resolve({ address, family })));
  assert.deepEqual(result, { address: '93.184.216.34', family: 4 });
});
