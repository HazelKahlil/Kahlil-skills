import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderAssetHtml } from './create_asset.mjs';
import { absolutePath, acquireLibraryLock, assertNoSymlinkComponents, atomicWrite, escapeHtml, isInside, libraryRootFromArgs, parseArgs, readJson, readLibrary, relativeHref, required, safeRelativePath, sha256File, sha256Text, slugFor, writeJson } from './lib.mjs';
import { verifyAsset } from './verify_asset.mjs';

const usageModes = new Set(['adaptive', 'material-faithful', 'composition-faithful']);
const usageStates = new Set(['consulted', 'applied']);
const outcomes = new Set(['unknown', 'effective', 'partial', 'ineffective']);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(value, label, { optional = false, max = 500 } = {}) {
  const output = typeof value === 'string' ? value.trim() : '';
  if (!output && !optional) throw new Error(`${label} is required.`);
  if (output.length > max) throw new Error(`${label} exceeds ${max} characters.`);
  return output;
}

function projectDirectoryName(projectId) {
  const cleaned = slugFor(projectId).replace(/\s+/g, '-');
  if (!/^[\p{L}\p{N}._-]+$/u.test(cleaned)) throw new Error('projectId contains unsupported characters.');
  return cleaned;
}

function normalizeObjects(values, label) {
  if (values === undefined) return [];
  if (!Array.isArray(values)) throw new Error(`${label} must be an array.`);
  return values.map((item) => {
    if (typeof item === 'string') return { label: text(item, `${label} item`, { max: 500 }) };
    if (!item || typeof item !== 'object') throw new Error(`${label} items must be strings or objects.`);
    const output = {};
    if (item.label !== undefined) output.label = text(item.label, `${label} label`, { max: 500 });
    if (item.summary !== undefined) output.summary = text(item.summary, `${label} summary`, { max: 1000 });
    if (item.path !== undefined) output.path = text(item.path, `${label} path`, { max: 2048 });
    if (item.url !== undefined) output.url = text(item.url, `${label} URL`, { max: 2048 });
    if (!Object.keys(output).length) throw new Error(`${label} item has no supported fields.`);
    return output;
  });
}

export function normalizeUsageEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Usage event must be an object.');
  const allowed = new Set(['schemaVersion', 'kind', 'usageId', 'recordedAt', 'eventPayloadHash', 'eventId', 'assetId', 'projectId', 'projectName', 'deliverable', 'status', 'mode', 'referenceUsed', 'appliedDimensions', 'outputs', 'feedback', 'outcome', 'score']);
  for (const key of Object.keys(input)) if (!allowed.has(key)) throw new Error(`Usage event contains an unsupported field: ${key}`);
  const eventId = text(input.eventId, 'eventId');
  const assetId = text(input.assetId, 'assetId');
  if (!uuidPattern.test(eventId)) throw new Error('eventId must be a UUID.');
  if (!uuidPattern.test(assetId)) throw new Error('assetId must be a UUID.');
  const projectId = projectDirectoryName(text(input.projectId, 'projectId', { max: 120 }));
  const status = usageStates.has(input.status) ? input.status : 'consulted';
  const mode = usageModes.has(input.mode) ? input.mode : 'adaptive';
  const outcome = outcomes.has(input.outcome) ? input.outcome : 'unknown';
  const appliedDimensions = Array.isArray(input.appliedDimensions)
    ? [...new Set(input.appliedDimensions.map((item) => text(item, 'applied dimension', { max: 80 })))]
    : [];
  let score;
  if (input.score !== undefined) {
    score = Number(input.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error('score must be between 0 and 100.');
  }
  return {
    eventId,
    assetId,
    projectId,
    projectName: text(input.projectName, 'projectName', { max: 200 }),
    deliverable: text(input.deliverable, 'deliverable', { max: 300 }),
    status,
    mode,
    referenceUsed: Boolean(input.referenceUsed),
    appliedDimensions,
    outputs: normalizeObjects(input.outputs, 'outputs'),
    feedback: normalizeObjects(input.feedback, 'feedback'),
    outcome,
    ...(score === undefined ? {} : { score })
  };
}

export function validateUsageRecord(record) {
  if (!record || record.schemaVersion !== 1 || record.kind !== 'kahlil-aesthetic-usage') throw new Error('Invalid usage record kind or schema.');
  const normalized = normalizeUsageEvent(record);
  if (!uuidPattern.test(record.usageId || '')) throw new Error('Usage record needs a UUID usageId.');
  if (Number.isNaN(new Date(record.recordedAt).getTime())) throw new Error('Usage record has an invalid recordedAt.');
  if (record.eventPayloadHash !== sha256Text(JSON.stringify(normalized))) throw new Error('Usage event payload hash mismatch.');
  return record;
}

function usageFiles(directory) {
  if (!existsSync(directory)) return [];
  assertNoSymlinkComponents(directory, 'Usage directory');
  const output = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Usage storage must not contain symbolic links: ${path}`);
    if (entry.isDirectory()) output.push(...usageFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.json')) output.push(path);
  }
  return output;
}

export function readAllUsage(libraryRoot, { tolerateInvalid = false } = {}) {
  const library = readLibrary(libraryRoot);
  const records = [];
  const invalid = [];
  for (const path of usageFiles(library.usageRoot)) {
    try { records.push(validateUsageRecord(readJson(path))); }
    catch (error) {
      invalid.push({ path, message: error.message });
      if (!tolerateInvalid) throw error;
    }
  }
  records.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  return tolerateInvalid ? { records, invalid } : records;
}

export function readUsageForAsset(libraryRoot, assetId) {
  return readAllUsage(libraryRoot).filter((record) => record.assetId === assetId);
}

function findAsset(library, assetId) {
  for (const entry of readdirSync(library.assetsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const directory = join(library.assetsRoot, entry.name);
    const path = join(directory, 'manifest.json');
    if (!existsSync(path)) continue;
    const manifest = readJson(path);
    if (manifest.assetId === assetId) return { directory, manifest: verifyAsset(directory) };
  }
  throw new Error(`No verified asset found for assetId: ${assetId}`);
}

function refreshAssetPage(asset, usageRecords) {
  const pagePath = join(asset.directory, 'index.html');
  atomicWrite(pagePath, renderAssetHtml(asset.manifest, asset.directory, usageRecords));
  asset.manifest.views.html.sha256 = sha256File(pagePath);
  writeJson(join(asset.directory, 'manifest.json'), asset.manifest);
}

export function buildProjectIndex(libraryRoot) {
  const library = readLibrary(libraryRoot);
  const { records, invalid } = readAllUsage(libraryRoot, { tolerateInvalid: true });
  const byAsset = new Map();
  for (const entry of readdirSync(library.assetsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const directory = join(library.assetsRoot, entry.name);
    try {
      const manifest = verifyAsset(directory);
      byAsset.set(manifest.assetId, { manifest, directory });
    } catch {}
  }
  const cards = records.map((record) => {
    const asset = byAsset.get(record.assetId);
    const href = asset ? escapeHtml(encodeURI(relativeHref(library.indexRoot, join(asset.directory, 'index.html')))) : '';
    const name = asset?.manifest.name || `缺失资产 ${record.assetId}`;
    return `<article><p>${escapeHtml(record.projectName)} · ${escapeHtml(record.deliverable)}</p><h2>${href ? `<a href="${href}">${escapeHtml(name)}</a>` : escapeHtml(name)}</h2><small>${escapeHtml(record.status)} · ${escapeHtml(record.mode)} · ${escapeHtml(record.outcome)}${Number.isFinite(record.score) ? ` · ${record.score} 分` : ''}</small></article>`;
  }).join('');
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'self' file:"><title>审美资产项目调用</title><style>body{margin:0;background:#ecebe5;color:#202825;font:14px/1.6 system-ui}main{width:min(1100px,calc(100vw - 48px));margin:24px auto;background:#faf9f4;padding:32px}article{padding:18px 0;border-top:1px solid #a9ada7}h1,h2,p{margin:0 0 8px}a{color:inherit}small{color:#65706b}</style></head><body><main data-kahlil-aesthetic="project-usage-view"><h1>项目使用记录</h1><p>${records.length} 条有效记录${invalid.length ? ` · ${invalid.length} 条异常记录请查看 health.json` : ''}</p>${cards || '<p>尚无 Agent 项目调用。</p>'}</main></body></html>`;
  const output = join(library.indexRoot, 'projects.html');
  atomicWrite(output, html);
  return output;
}

export function recordUsage(libraryRoot, input) {
  const normalized = normalizeUsageEvent(input);
  const library = readLibrary(libraryRoot);
  const release = acquireLibraryLock(library.root, 'record-usage');
  try {
    const existing = readAllUsage(library.root).find((record) => record.eventId === normalized.eventId);
    const fingerprint = sha256Text(JSON.stringify(normalized));
    if (existing) {
      if (existing.eventPayloadHash !== fingerprint) throw new Error(`eventId was already used with different content: ${normalized.eventId}`);
      return existing;
    }
    const asset = findAsset(library, normalized.assetId);
    const usageId = normalized.eventId;
    const record = {
      schemaVersion: 1,
      kind: 'kahlil-aesthetic-usage',
      usageId,
      recordedAt: new Date().toISOString(),
      eventPayloadHash: fingerprint,
      ...normalized
    };
    const directory = join(library.usageRoot, normalized.projectId);
    const output = join(directory, `${usageId}.json`);
    if (existsSync(output)) throw new Error(`Refusing to overwrite usage record: ${output}`);
    writeJson(output, record);
    const assetRecords = readAllUsage(library.root).filter((item) => item.assetId === normalized.assetId);
    refreshAssetPage(asset, assetRecords);
    buildProjectIndex(library.root);
    return record;
  } finally {
    release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const event = readJson(absolutePath(required(args, 'event'), 'Usage event path'));
    const record = recordUsage(libraryRootFromArgs(args), event);
    console.log(`Recorded Agent project usage: ${record.usageId}`);
  } catch (error) {
    console.error(`Usage recording failed: ${error.message}`);
    process.exitCode = 1;
  }
}
