import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { renderInertCapturePage, writeCaptureBundle as writeSafeCaptureBundle } from '../scripts/capture_url.mjs';
import { createAsset } from '../scripts/create_asset.mjs';
import { initLibrary, readJson, readLibrary, sha256File, validatePublicUrl, writeJson } from '../scripts/lib.mjs';
import { verifyAsset } from '../scripts/verify_asset.mjs';

const fixture = new URL('./fixtures/reference.svg', import.meta.url).pathname;

function temporaryRoot() {
  return mkdtempSync(join(realpathSync(tmpdir()), 'kahlil-aesthetic-hardening-'));
}

function analysis() {
  return {
    overall: '可验证的视觉判断。',
    tags: ['测试'],
    composition: '主次明确。',
    palette: '冷暖对照。',
    typography: '不适用：无文字。',
    material: '颗粒表面。',
    motionInteraction: '不适用：静态证据。',
    reuse: ['保留秩序。'],
    avoid: ['不要伪造事实。']
  };
}

function writeDraft(root, draft) {
  const path = join(root, 'draft.json');
  writeJson(path, draft);
  return path;
}

function writeCaptureBundle(root, { sourceUrl = 'https://example.com/reference', captureId = randomUUID(), executable = false } = {}) {
  const htmlPath = join(root, 'page.html');
  const html = executable
    ? '<!doctype html><script>globalThis.pwned = true</script>'
    : renderInertCapturePage({ sourceUrl, finalUrl: sourceUrl, capturedAt: '2026-07-18T00:00:00.000Z', sourceHtml: '<html><script>alert(1)</script><body>Reference</body></html>' });
  writeFileSync(htmlPath, html);
  const metadataPath = join(root, 'capture.json');
  writeJson(metadataPath, {
    schemaVersion: 1,
    kind: 'kahlil-aesthetic-capture',
    captureId,
    sourceUrl,
    finalUrl: sourceUrl,
    capturedAt: '2026-07-18T00:00:00.000Z',
    mode: 'public-logged-out',
    pageSha256: sha256File(htmlPath)
  });
  return { htmlPath, metadataPath, captureId };
}

function urlDraft(root, captureBundle, screenshotCaptureId = captureBundle.captureId) {
  return {
    name: '颗粒渐变_安全网页',
    kind: 'url',
    sources: [{ type: 'url', value: 'https://example.com/reference', label: 'Reference', rights: 'unknown' }],
    evidence: [{ path: fixture, role: 'capture', label: '整页截图', captureId: screenshotCaptureId }],
    capture: { htmlPath: captureBundle.htmlPath, metadataPath: captureBundle.metadataPath },
    analysis: analysis()
  };
}

test('renders captured source as inert escaped evidence with a restrictive CSP', () => {
  const page = renderInertCapturePage({
    sourceUrl: 'https://example.com/',
    finalUrl: 'https://example.com/final',
    capturedAt: '2026-07-18T00:00:00.000Z',
    sourceHtml: '<script src="https://evil.example/x.js"></script><form action="https://evil.example/"></form>'
  });
  assert.match(page, /Content-Security-Policy/);
  assert.match(page, /default-src &#39;none&#39;|default-src 'none'/);
  assert.doesNotMatch(page, /<script\b|<form\b|<iframe\b|<object\b|<embed\b/i);
  assert.match(page, /&lt;script/);
});

test('rejects a raw executable page supplied as a capture', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const capture = writeCaptureBundle(root, { executable: true });
    assert.throws(() => createAsset(library, writeDraft(root, urlDraft(root, capture))), /inert|executable/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('keeps a URL partial when screenshot and HTML do not share a capture ID', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const capture = writeCaptureBundle(root);
    const result = createAsset(library, writeDraft(root, urlDraft(root, capture, randomUUID())));
    const manifest = readJson(join(result.assetDirectory, 'manifest.json'));
    assert.equal(result.status, 'partial');
    assert.ok(manifest.missing.includes('evidence.captureBinding'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a non-image primary for image and screenshot assets', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const text = join(root, 'not-an-image.txt');
    writeFileSync(text, 'not visual evidence');
    const draft = {
      name: '伪装图片_文本',
      kind: 'image',
      sources: [{ type: 'file', value: text, rights: 'owned' }],
      evidence: [{ path: text, role: 'primary' }],
      analysis: analysis()
    };
    assert.throws(() => createAsset(library, writeDraft(root, draft)), /visual image/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects oversized SVG dimensions before it can be rendered', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const huge = join(root, 'huge.svg');
    writeFileSync(huge, '<svg xmlns="http://www.w3.org/2000/svg" width="100000" height="100000"><rect width="1" height="1"/></svg>');
    const draft = {
      name: '超大画布_测试',
      kind: 'image',
      sources: [{ type: 'file', value: huge, rights: 'owned' }],
      evidence: [{ path: huge, role: 'primary' }],
      analysis: analysis()
    };
    assert.throws(() => createAsset(library, writeDraft(root, draft)), /pixel|dimensions/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects tampered generated views even when the asset marker remains', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const draft = {
      name: '留白结构_视图一致性',
      kind: 'image',
      sources: [{ type: 'file', value: fixture, rights: 'owned' }],
      evidence: [{ path: fixture, role: 'primary' }],
      analysis: analysis()
    };
    const result = createAsset(library, writeDraft(root, draft));
    writeFileSync(join(result.assetDirectory, 'index.html'), '<main data-kahlil-aesthetic="asset-view">tampered</main>');
    assert.throws(() => verifyAsset(result.assetDirectory), /generated view mismatch/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects library control paths that escape the configured root', () => {
  const root = temporaryRoot();
  try {
    initLibrary(root);
    const manifestPath = join(root, '.kahlil-aesthetic.json');
    const manifest = readJson(manifestPath);
    manifest.assetsDirectory = '../escape';
    writeJson(manifestPath, manifest);
    assert.throws(() => readLibrary(root), /escape|relative path|inside/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects symlinked library control files', () => {
  const root = temporaryRoot();
  try {
    const real = join(root, 'real-library.json');
    const library = join(root, 'library');
    initLibrary(library);
    const manifestPath = join(library, '.kahlil-aesthetic.json');
    writeFileSync(real, readFileSync(manifestPath));
    rmSync(manifestPath);
    symlinkSync(real, manifestPath);
    assert.throws(() => readLibrary(library), /symbolic link/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects common signed and session URL parameter variants', () => {
  for (const value of [
    'https://example.com/?X-Amz-Signature=secret',
    'https://example.com/?authToken=secret',
    'https://example.com/?session_id=secret',
    'https://example.com/?credential=secret'
  ]) {
    assert.throws(() => validatePublicUrl(value), /sensitive query parameter/);
  }
});

test('stores conversation content as a preserved local file rather than raw manifest text', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const rawDraft = {
      name: '对话参考_隐私边界', kind: 'content',
      sources: [{ type: 'conversation', value: 'a very private full conversation', rights: 'unknown' }],
      evidence: [], analysis: analysis()
    };
    assert.throws(() => createAsset(library, writeDraft(root, rawDraft)), /conversation.*local.*file/i);
    const conversation = join(root, 'conversation.txt');
    writeFileSync(conversation, 'selected excerpt only');
    const localDraft = {
      ...rawDraft,
      sources: [{ type: 'conversation', value: conversation, label: '摘录', rights: 'unknown' }],
      evidence: [{ path: conversation, role: 'primary', label: '对话摘录' }]
    };
    const result = createAsset(library, writeDraft(root, localDraft));
    const manifest = readJson(join(result.assetDirectory, 'manifest.json'));
    assert.ok(!manifest.sources[0].value.startsWith('/'));
    assert.equal(manifest.sources[0].value, manifest.evidence[0].path);
    assert.doesNotMatch(readFileSync(join(result.assetDirectory, 'index.html'), 'utf8'), /selected excerpt only/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('serializes library writes with a visible lock instead of racing asset names', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    writeFileSync(join(library, '.kahlil-aesthetic.lock'), JSON.stringify({ pid: process.pid, operation: 'other', createdAt: new Date().toISOString() }));
    const draft = {
      name: '并发保护_锁测试', kind: 'image',
      sources: [{ type: 'file', value: fixture, rights: 'owned' }],
      evidence: [{ path: fixture, role: 'primary' }], analysis: analysis()
    };
    assert.throws(() => createAsset(library, writeDraft(root, draft)), /locked/i);
    assert.deepEqual(readdirSync(join(library, 'assets')), []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('writes URL evidence as a staged inert capture bundle with shared provenance', () => {
  const root = temporaryRoot();
  try {
    const output = join(root, 'bundle');
    const bundle = writeSafeCaptureBundle(output, {
      sourceUrl: 'https://example.com/start', finalUrl: 'https://example.com/final',
      html: '<script>unsafe()</script>', capturedAt: '2026-07-18T00:00:00.000Z',
      captureId: randomUUID()
    });
    const metadata = readJson(bundle.metadataPath);
    assert.equal(metadata.captureId, bundle.captureId);
    assert.equal(metadata.pageSha256, sha256File(bundle.htmlPath));
    assert.doesNotMatch(readFileSync(bundle.htmlPath, 'utf8'), /<script>/);
    assert.throws(() => writeSafeCaptureBundle(output, { sourceUrl: 'https://example.com', finalUrl: 'https://example.com', html: '' }), /overwrite/i);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
