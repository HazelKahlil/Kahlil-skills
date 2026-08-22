import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { createAsset } from '../scripts/create_asset.mjs';
import { doctorLibrary } from '../scripts/doctor.mjs';
import { initLibrary, readJson, sha256File, writeJson } from '../scripts/lib.mjs';
import { migrateLibrary } from '../scripts/migrate_library.mjs';
import { prepareReuse } from '../scripts/prepare_reuse.mjs';
import { readUsageForAsset, recordUsage } from '../scripts/record_usage.mjs';
import { verifyAsset } from '../scripts/verify_asset.mjs';

const fixture = new URL('./fixtures/reference.svg', import.meta.url).pathname;

function temporaryRoot() { return mkdtempSync(join(realpathSync(tmpdir()), 'kahlil-aesthetic-lifecycle-')); }

const TEST_EVENT_ID = randomUUID();

function draft(sourcePath = fixture) {
  return {
    name: '柔和颗粒_生命周期标本',
    kind: 'image',
    sources: [{ type: 'file', value: sourcePath, label: '原始参考', rights: 'owned' }],
    evidence: [{ path: sourcePath, role: 'primary', label: '主参考' }],
    analysis: {
      overall: '柔和色域中保留可辨认的颗粒边缘。', tags: ['柔和渐变', '颗粒'],
      composition: '大色块连续过渡。', palette: '降饱和蓝、粉、暖黄。', typography: '不适用：无文字。',
      material: '细密喷绘颗粒。', motionInteraction: '不适用：静态图。',
      reuse: ['保留连续色域与颗粒密度变化。'], avoid: ['避免荧光高饱和。']
    },
    generation: {
      preferredMode: 'material-faithful',
      referenceRequired: true,
      referenceEvidenceIds: ['evidence-01'],
      visualDNA: {
        mustPreserve: ['细密、非规则的喷绘颗粒', '降饱和冷暖过渡'],
        mayChange: ['横图构图', '色块位置'],
        mustAvoid: ['规则波点', '荧光高饱和']
      }
    }
  };
}

function create(root) {
  const library = join(root, 'library');
  initLibrary(library);
  const draftPath = join(root, 'draft.json');
  writeJson(draftPath, draft());
  return { library, result: createAsset(library, draftPath) };
}

function usageEvent(assetId, changes = {}) {
  return {
    eventId: TEST_EVENT_ID,
    assetId,
    projectId: 'lumora-prompt-test',
    projectName: 'Lumora 提示词测试',
    deliverable: '16:9 横图背景',
    status: 'applied',
    mode: 'material-faithful',
    referenceUsed: true,
    appliedDimensions: ['material', 'palette'],
    outputs: [{ label: '生成结果', path: 'outputs/result.png' }],
    feedback: [{ summary: '整体 80 分，主要问题是饱和度偏高。' }],
    outcome: 'effective',
    score: 80,
    ...changes
  };
}

test('records an Agent project usage once, updates the asset page, and builds a project index', () => {
  const root = temporaryRoot();
  try {
    const { library, result } = create(root);
    const manifest = readJson(join(result.assetDirectory, 'manifest.json'));
    assert.deepEqual(readUsageForAsset(library, manifest.assetId), []);
    const first = recordUsage(library, usageEvent(manifest.assetId));
    const second = recordUsage(library, usageEvent(manifest.assetId));
    assert.equal(first.usageId, second.usageId);
    assert.equal(readUsageForAsset(library, manifest.assetId).length, 1);
    assert.ok(existsSync(join(library, '_index', 'projects.html')));
    const page = readFileSync(join(result.assetDirectory, 'index.html'), 'utf8');
    assert.match(page, /Lumora 提示词测试/);
    assert.match(page, /80/);
    assert.equal(verifyAsset(result.assetDirectory).assetId, manifest.assetId);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('rejects event ID reuse with different content', () => {
  const root = temporaryRoot();
  try {
    const { library, result } = create(root);
    const assetId = readJson(join(result.assetDirectory, 'manifest.json')).assetId;
    recordUsage(library, usageEvent(assetId));
    assert.throws(() => recordUsage(library, usageEvent(assetId, { score: 40 })), /eventId.*different/i);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('prepares a faithful reuse package with the real reference and refuses missing reference evidence', () => {
  const root = temporaryRoot();
  try {
    const { result } = create(root);
    const reusable = prepareReuse(result.assetDirectory, { mode: 'material-faithful' });
    assert.equal(reusable.mode, 'material-faithful');
    assert.equal(reusable.referenceRequired, true);
    assert.equal(reusable.references.length, 1);
    assert.equal(reusable.references[0].sha256, sha256File(reusable.references[0].absolutePath));
    assert.match(reusable.promptContract.join('\n'), /参考图|reference/i);
    const manifestPath = join(result.assetDirectory, 'manifest.json');
    const manifest = readJson(manifestPath);
    manifest.generation.referenceEvidenceIds = ['evidence-99'];
    writeJson(manifestPath, manifest);
    assert.throws(() => prepareReuse(result.assetDirectory, { mode: 'material-faithful' }), /reference evidence/i);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('migrates a v1 image library without changing evidence bytes', () => {
  const root = temporaryRoot();
  try {
    const { library, result } = create(root);
    const manifestPath = join(result.assetDirectory, 'manifest.json');
    const evidencePath = join(result.assetDirectory, readJson(manifestPath).evidence[0].path);
    const before = sha256File(evidencePath);
    const legacyAsset = readJson(manifestPath);
    legacyAsset.schemaVersion = 1;
    delete legacyAsset.assetId;
    delete legacyAsset.createdAt;
    delete legacyAsset.views;
    delete legacyAsset.generation;
    writeJson(manifestPath, legacyAsset);
    writeJson(join(library, '.kahlil-aesthetic.json'), { schemaVersion: 1, kind: 'kahlil-aesthetic-library', assetsDirectory: 'assets', indexDirectory: '_index' });
    const report = migrateLibrary(library);
    assert.equal(report.migratedAssets, 1);
    assert.equal(sha256File(evidencePath), before);
    assert.equal(verifyAsset(result.assetDirectory).schemaVersion, 2);
    assert.ok(existsSync(report.backupDirectory));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('doctor reports stale work and invalid usage instead of silently hiding it', () => {
  const root = temporaryRoot();
  try {
    const { library } = create(root);
    writeFileSync(join(library, '.kahlil-aesthetic.lock'), JSON.stringify({ pid: 999999, operation: 'test', createdAt: '2020-01-01T00:00:00.000Z' }));
    writeJson(join(library, 'usage', 'orphan.json'), { schemaVersion: 1, kind: 'kahlil-aesthetic-usage', assetId: 'missing' });
    const report = doctorLibrary(library);
    assert.equal(report.status, 'partial');
    assert.ok(report.issues.some((item) => item.code === 'stale-lock'));
    assert.ok(report.issues.some((item) => item.code === 'invalid-usage'));
    assert.ok(existsSync(join(library, '_index', 'health.json')));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
