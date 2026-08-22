import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createAsset } from '../scripts/create_asset.mjs';
import { renderInertCapturePage } from '../scripts/capture_url.mjs';
import { initLibrary, readJson, sha256File, writeJson } from '../scripts/lib.mjs';
import { verifyAsset } from '../scripts/verify_asset.mjs';
import { buildLibraryIndex } from '../scripts/build_library_index.mjs';

const fixture = new URL('./fixtures/reference.svg', import.meta.url).pathname;

function temporaryRoot() { return mkdtempSync(join(realpathSync(tmpdir()), 'kahlil-aesthetic-test-')); }

function createUrlAsset(root) {
  const library = join(root, 'library');
  initLibrary(library);
  const capture = join(root, 'page.html');
  const sourceUrl = 'https://example.com/reference';
  const captureId = randomUUID();
  writeFileSync(capture, renderInertCapturePage({ sourceUrl, finalUrl: sourceUrl, capturedAt: '2026-07-18T00:00:00.000Z', sourceHtml: '<!doctype html><title>Reference</title>' }));
  const captureMetadata = join(root, 'capture.json');
  writeJson(captureMetadata, { schemaVersion: 1, kind: 'kahlil-aesthetic-capture', captureId, sourceUrl, finalUrl: sourceUrl, capturedAt: '2026-07-18T00:00:00.000Z', mode: 'public-logged-out', pageSha256: sha256File(capture) });
  const draft = {
    name: '暗色留白_网页参考', kind: 'url',
    sources: [{ type: 'url', value: sourceUrl, rights: 'unknown' }],
    evidence: [{ path: fixture, role: 'capture', label: '整页截图', captureId }],
    capture: { htmlPath: capture, metadataPath: captureMetadata },
    analysis: { overall: '公开页面的视觉判断。', tags: ['网页'], composition: '页面有明确主次。', palette: '以中性色为主。', typography: '文字层级清楚。', material: '屏幕界面。', motionInteraction: '静态截图无法确认交互。', reuse: ['保留留白'], avoid: ['不要假装离线保真'] }
  };
  const draftPath = join(root, 'draft.json');
  writeFileSync(draftPath, JSON.stringify(draft));
  return createAsset(library, draftPath);
}

test('verifies a complete URL asset and rejects changed evidence bytes', () => {
  const root = temporaryRoot();
  try {
    const result = createUrlAsset(root);
    assert.equal(result.status, 'complete');
    assert.equal(verifyAsset(result.assetDirectory).status, 'complete');
    const manifest = readJson(join(result.assetDirectory, 'manifest.json'));
    writeFileSync(join(result.assetDirectory, manifest.evidence[0].path), 'tampered');
    assert.throws(() => verifyAsset(result.assetDirectory), /hash mismatch|byte length mismatch/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('rejects executable remote content and sensitive URL sources', () => {
  const root = temporaryRoot();
  try {
    const result = createUrlAsset(root);
    writeFileSync(join(result.assetDirectory, 'index.html'), '<main data-kahlil-aesthetic="asset-view"><script src="https://bad.example/a.js"></script></main>');
    assert.throws(() => verifyAsset(result.assetDirectory), /executable or remote content/);
    const manifestPath = join(result.assetDirectory, 'manifest.json');
    const manifest = readJson(manifestPath);
    manifest.sources[0].value = 'https://example.com/?token=secret';
    writeJson(manifestPath, manifest);
    assert.throws(() => verifyAsset(result.assetDirectory), /sensitive query parameter/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('library index excludes an asset whose evidence no longer verifies', () => {
  const root = temporaryRoot();
  try {
    const result = createUrlAsset(root);
    const manifest = readJson(join(result.assetDirectory, 'manifest.json'));
    writeFileSync(join(result.assetDirectory, manifest.evidence[0].path), 'tampered');
    const indexPath = buildLibraryIndex(join(root, 'library'));
    const index = readFileSync(indexPath, 'utf8');
    assert.doesNotMatch(index, /暗色留白_网页参考/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
