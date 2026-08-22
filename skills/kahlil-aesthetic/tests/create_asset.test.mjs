import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createAsset } from '../scripts/create_asset.mjs';
import { initLibrary, readJson } from '../scripts/lib.mjs';
import { verifyAsset } from '../scripts/verify_asset.mjs';

const fixture = new URL('./fixtures/reference.svg', import.meta.url).pathname;

function temporaryRoot() {
  return mkdtempSync(join(realpathSync(tmpdir()), 'kahlil-aesthetic-test-'));
}

function draftFor(sourcePath, changes = {}) {
  return {
    name: '低饱和留白_测试标本',
    kind: 'image',
    sources: [{ type: 'file', value: sourcePath, label: '测试原图', rights: 'owned' }],
    evidence: [{ path: sourcePath, role: 'primary', label: '主证据' }],
    analysis: { overall: '在低饱和底色中用单一环形结构组织留白。', tags: ['低饱和', '留白'], composition: '主体在中央，外围保留大面积呼吸区。', palette: '暖灰、氧化绿、褪色砖红。', typography: '无主导文字，字体分析不适用。', material: '平面纸本感。', motionInteraction: '静态图片，动态分析不适用。', reuse: ['先确定空白，再确定锚点。'], avoid: ['不要将元素平均铺满。'] },
    ...changes
  };
}

function writeDraft(root, name, draft) {
  const path = join(root, name);
  writeFileSync(path, JSON.stringify(draft, null, 2));
  return path;
}

test('creates an image asset, stores hashes, and prevents collisions', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const first = createAsset(library, writeDraft(root, 'first.json', draftFor(fixture)));
    assert.equal(first.status, 'complete');
    assert.ok(existsSync(join(first.assetDirectory, 'index.html')));
    const manifest = readJson(join(first.assetDirectory, 'manifest.json'));
    const page = readFileSync(join(first.assetDirectory, 'index.html'), 'utf8');
    assert.equal(manifest.assetKind, 'image');
    assert.equal(manifest.sources[0].value, manifest.evidence[0].path);
    assert.ok(!manifest.sources[0].value.startsWith('/'));
    assert.match(manifest.evidence[0].sha256, /^[a-f0-9]{64}$/);
    assert.doesNotMatch(page, /data-section="usage"/);
    assert.match(page, /<a class="evidence-link" href="original\//);
    verifyAsset(first.assetDirectory);
    const second = createAsset(library, writeDraft(root, 'second.json', draftFor(fixture)));
    assert.match(second.assetDirectory, /低饱和留白_测试标本-02$/);
    assert.equal(readJson(join(second.assetDirectory, 'manifest.json')).name, '低饱和留白_测试标本-02');
    assert.ok(existsSync(first.indexPath));
    const indexScript = new URL('../scripts/build_library_index.mjs', import.meta.url);
    const output = execFileSync(process.execPath, [indexScript.pathname, '--library', library], { encoding: 'utf8' });
    assert.match(output, /Built library index/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('renders project usage only when explicit records are supplied', async () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const result = createAsset(library, writeDraft(root, 'usage-view.json', draftFor(fixture)));
    const manifest = readJson(join(result.assetDirectory, 'manifest.json'));
    const renderer = await import('../scripts/create_asset.mjs');
    assert.equal(typeof renderer.renderAssetHtml, 'function');
    const page = renderer.renderAssetHtml(manifest, result.assetDirectory, [{
      projectName: '示例项目 <封面>',
      deliverable: '公众号主视觉 & 头图',
      assets: [{ status: 'applied', appliedDimensions: ['composition', 'palette'] }],
      outputs: [{ label: '封面定稿 <PNG>' }],
      feedback: [{ summary: '明确留白结构有效。' }],
      outcome: 'effective'
    }]);
    assert.match(page, /data-section="usage"/);
    assert.match(page, /示例项目 &lt;封面&gt;/);
    assert.match(page, /公众号主视觉 &amp; 头图/);
    assert.match(page, /composition/);
    assert.match(page, /palette/);
    assert.match(page, /封面定稿 &lt;PNG&gt;/);
    assert.match(page, /明确留白结构有效。/);
    assert.match(page, /effective/);
    assert.match(page, /\.usage-section/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('creates a multi-image content asset and escapes generated HTML', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const draft = draftFor(fixture, {
      name: '档案拼贴_内容证据组',
      kind: 'content',
      evidence: [
        { path: fixture, role: 'primary', label: '主证据' },
        { path: fixture, role: 'supporting', label: '辅助证据 01' },
        { path: fixture, role: 'supporting', label: '辅助证据 02' },
        { path: fixture, role: 'supporting', label: '辅助证据 03' },
        { path: fixture, role: 'supporting', label: '辅助证据 04' },
        { path: fixture, role: 'supporting', label: '辅助证据 05' }
      ],
      analysis: { overall: '<script>alert(1)</script>', tags: ['档案'], composition: '主次明确。', palette: '中性色。', typography: '文字不是主证据。', material: '纸本。', motionInteraction: '静态证据，不适用。', reuse: ['保留关系'], avoid: ['不要远程加载'] }
    });
    const result = createAsset(library, writeDraft(root, 'content.json', draft));
    const page = readFileSync(join(result.assetDirectory, 'index.html'), 'utf8');
    assert.equal(result.status, 'complete');
    assert.equal(readJson(join(result.assetDirectory, 'manifest.json')).evidence.length, 6);
    assert.ok(page.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.match(page, /evidence-archive/);
    assert.ok(!page.includes('<script>alert(1)</script>'));
    verifyAsset(result.assetDirectory);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects symbolic-link evidence and marks a URL without captures partial', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const linked = join(root, 'linked.svg');
    symlinkSync(fixture, linked);
    assert.throws(() => createAsset(library, writeDraft(root, 'linked.json', draftFor(linked))), /symbolic link/);
    const blocked = readdirSync(join(library, 'assets')).find((entry) => entry.startsWith('.blocked-'));
    assert.ok(blocked);
    assert.equal(readJson(join(library, 'assets', blocked, 'failure.json')).status, 'blocked');
    const urlDraft = draftFor(fixture, { name: '暗色留白_公开网页', kind: 'url', sources: [{ type: 'url', value: 'https://example.com/reference', rights: 'unknown' }], evidence: [] });
    const partial = createAsset(library, writeDraft(root, 'url.json', urlDraft));
    assert.equal(partial.status, 'partial');
    verifyAsset(partial.assetDirectory);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects evidence whose parent directory is a symbolic link', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const realDirectory = join(root, 'real');
    const linkedDirectory = join(root, 'linked-directory');
    const nestedFixture = join(realDirectory, 'reference.svg');
    mkdirSync(realDirectory);
    copyFileSync(fixture, nestedFixture);
    symlinkSync(realDirectory, linkedDirectory);
    assert.throws(
      () => createAsset(library, writeDraft(root, 'parent-linked.json', draftFor(join(linkedDirectory, 'reference.svg')))),
      /symbolic link/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('marks an asset partial and lists missing analysis instead of claiming completeness', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const draft = draftFor(fixture, {
      analysis: { overall: '只有总体判断。', tags: ['留白'], reuse: ['保留留白'], avoid: ['不要铺满'] }
    });
    const result = createAsset(library, writeDraft(root, 'incomplete-analysis.json', draft));
    const manifest = readJson(join(result.assetDirectory, 'manifest.json'));
    const page = readFileSync(join(result.assetDirectory, 'index.html'), 'utf8');
    assert.equal(result.status, 'partial');
    assert.ok(manifest.missing.includes('analysis.composition'));
    assert.match(page, /缺少：<\/b>构图与留白/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('CLI reads the configured library root when --library is omitted', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    const config = join(root, 'config.json');
    const draft = writeDraft(root, 'configured.json', draftFor(fixture));
    initLibrary(library);
    writeFileSync(config, JSON.stringify({ schemaVersion: 1, libraryRoot: library }));
    const script = fileURLToPath(new URL('../scripts/create_asset.mjs', import.meta.url));
    const output = execFileSync(process.execPath, [script, '--config', config, '--draft', draft], { encoding: 'utf8' });
    assert.match(output, /Created asset/);
    assert.ok(existsSync(join(library, 'assets', '低饱和留白_测试标本', 'manifest.json')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('does not treat a non-visual file as a full-page URL screenshot', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const html = join(root, 'page.html');
    writeFileSync(html, '<!doctype html><title>capture</title>');
    const draft = draftFor(fixture, {
      name: '中性留白_网页捕获',
      kind: 'url',
      sources: [{ type: 'url', value: 'https://example.com/reference', rights: 'unknown' }],
      evidence: [{ path: html, role: 'capture', label: '伪截图' }]
    });
    const result = createAsset(library, writeDraft(root, 'non-visual-capture.json', draft));
    const manifest = readJson(join(result.assetDirectory, 'manifest.json'));
    assert.equal(result.status, 'partial');
    assert.ok(manifest.missing.includes('evidence.fullPageScreenshot'));
    const disguised = join(root, 'fake.png');
    writeFileSync(disguised, '<!doctype html><title>not an image</title>');
    const disguisedDraft = { ...draft, name: '中性留白_伪截图', evidence: [{ path: disguised, role: 'capture', label: '伪装 PNG' }] };
    assert.throws(() => createAsset(library, writeDraft(root, 'disguised-capture.json', disguisedDraft)), /recognized.*image/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a derived file whose derivedFrom ID does not exist', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const draft = draftFor(fixture, {
      evidence: [
        { path: fixture, role: 'primary', label: '主证据' },
        { path: fixture, role: 'derived', label: '派生图', derivedFrom: 'evidence-99' }
      ]
    });
    assert.throws(() => createAsset(library, writeDraft(root, 'dangling-derived.json', draft)), /unknown evidence ID/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('moves a committed asset to blocked storage when index rebuild fails', () => {
  const root = temporaryRoot();
  try {
    const library = join(root, 'library');
    initLibrary(library);
    const draft = writeDraft(root, 'index-failure.json', draftFor(fixture));
    assert.throws(() => createAsset(library, draft, { buildIndex: () => { throw new Error('simulated index failure'); } }), /simulated index failure/);
    const entries = readdirSync(join(library, 'assets'));
    assert.ok(!entries.includes('低饱和留白_测试标本'));
    const blocked = entries.find((entry) => entry.startsWith('.blocked-低饱和留白_测试标本-'));
    assert.ok(blocked);
    assert.equal(readJson(join(library, 'assets', blocked, 'failure.json')).status, 'blocked');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
