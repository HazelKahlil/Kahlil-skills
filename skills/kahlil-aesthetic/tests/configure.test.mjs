import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { initLibrary, readLibrary } from '../scripts/lib.mjs';

function temporaryRoot() {
  return mkdtempSync(join(realpathSync(tmpdir()), 'kahlil-aesthetic-test-'));
}

test('initializes a new library and remains idempotent', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'my-library');
    assert.equal(initLibrary(library), library);
    assert.equal(initLibrary(library), library);
    assert.ok(existsSync(join(library, '.kahlil-aesthetic.json')));
    assert.equal(readLibrary(library).manifest.kind, 'kahlil-aesthetic-library');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a relative library root and incompatible manifest', () => {
  assert.throws(() => initLibrary('relative-library'), /absolute path/);
  const root = temporaryRoot();
  try {
    writeFileSync(join(root, '.kahlil-aesthetic.json'), JSON.stringify({ kind: 'another-library', schemaVersion: 1 }));
    assert.throws(() => initLibrary(root), /incompatible/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('configure records a user-local config outside the Skill', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    const config = join(root, 'user-config', 'config.json');
    const script = fileURLToPath(new URL('../scripts/configure.mjs', import.meta.url));
    execFileSync(process.execPath, [script, '--library', library, '--config', config], { encoding: 'utf8' });
    const saved = JSON.parse(readFileSync(config, 'utf8'));
    assert.equal(saved.libraryRoot, library);
    assert.equal(saved.schemaVersion, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
