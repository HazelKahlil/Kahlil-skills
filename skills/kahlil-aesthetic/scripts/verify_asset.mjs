import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSET_SCHEMA_VERSION, absolutePath, assertNoSymlinkComponents, assertVisualImage, completionGaps, isInside, isVisualEvidencePath, parseArgs, readJson, required, safeRelativePath, sha256File, validatePublicUrl } from './lib.mjs';

function assertKnownKeys(value, allowed, label) {
  for (const key of Object.keys(value || {})) if (!allowed.includes(key)) throw new Error(`${label} contains an unsupported field: ${key}`);
}

function verifiedFile(assetDirectory, item, label) {
  const relativePath = safeRelativePath(item.path);
  const filePath = resolve(assetDirectory, relativePath);
  if (!isInside(assetDirectory, filePath)) throw new Error(`${label} escapes the asset directory.`);
  if (!existsSync(filePath)) throw new Error(`${label} is missing: ${relativePath}`);
  assertNoSymlinkComponents(filePath, label);
  if (!statSync(filePath).isFile()) throw new Error(`${label} is not a file: ${relativePath}`);
  if (!Number.isInteger(item.bytes) || item.bytes !== statSync(filePath).size) throw new Error(`${label} byte length mismatch: ${relativePath}`);
  if (sha256File(filePath) !== item.sha256) throw new Error(`${label} hash mismatch: ${relativePath}`);
  if (isVisualEvidencePath(filePath)) {
    const metadata = assertVisualImage(filePath, label);
    if (item.width !== undefined && item.width !== metadata.width) throw new Error(`${label} width mismatch.`);
    if (item.height !== undefined && item.height !== metadata.height) throw new Error(`${label} height mismatch.`);
  }
}

export function verifyAsset(assetPath) {
  const assetDirectory = absolutePath(assetPath, 'Asset directory');
  assertNoSymlinkComponents(assetDirectory, assetDirectory);
  const manifestPath = join(assetDirectory, 'manifest.json');
  if (!existsSync(manifestPath)) throw new Error('manifest.json is missing.');
  const manifest = readJson(manifestPath);
  assertKnownKeys(manifest, ['schemaVersion', 'kind', 'assetId', 'createdAt', 'name', 'assetKind', 'status', 'missing', 'sources', 'evidence', 'capture', 'legacyCapture', 'analysis', 'generation', 'views'], 'Manifest');
  if (manifest.schemaVersion !== ASSET_SCHEMA_VERSION) throw new Error(`Unsupported asset schemaVersion: ${manifest.schemaVersion}`);
  if (manifest.kind !== 'kahlil-aesthetic-asset' || !['image', 'screenshot', 'url', 'content'].includes(manifest.assetKind)) throw new Error('Invalid asset manifest kind.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(manifest.assetId || '')) throw new Error('Invalid or missing stable assetId.');
  if (Number.isNaN(new Date(manifest.createdAt).getTime())) throw new Error('Invalid or missing asset createdAt.');
  if (!['complete', 'partial', 'blocked'].includes(manifest.status)) throw new Error('Invalid asset status.');
  if (!Array.isArray(manifest.evidence)) throw new Error('Manifest evidence is invalid.');
  if (!manifest.analysis || typeof manifest.analysis !== 'object') throw new Error('Manifest analysis is invalid.');
  if (!manifest.generation || typeof manifest.generation !== 'object') throw new Error('Manifest generation contract is invalid.');
  const evidenceIds = new Set();
  for (const item of manifest.evidence) {
    assertKnownKeys(item, ['id', 'role', 'label', 'path', 'sha256', 'bytes', 'width', 'height', 'captureId', 'derivedFrom'], 'Evidence');
    if (!['primary', 'supporting', 'capture', 'derived'].includes(item.role)) throw new Error('Invalid evidence role.');
    if (!item.id || evidenceIds.has(item.id)) throw new Error('Evidence IDs must be present and unique.');
    evidenceIds.add(item.id);
    verifiedFile(assetDirectory, item, `Evidence ${item.id || item.path}`);
    if (item.role === 'derived' && !item.derivedFrom) throw new Error('Derived evidence is missing derivedFrom.');
    if (item.role === 'derived' && !manifest.evidence.some((source) => source.id === item.derivedFrom && source.role !== 'derived')) throw new Error(`Derived evidence references an unknown evidence ID: ${item.derivedFrom}`);
  }
  const reuseModes = new Set(['adaptive', 'material-faithful', 'composition-faithful']);
  if (!reuseModes.has(manifest.generation.preferredMode)) throw new Error('Invalid preferred reuse mode.');
  if (manifest.generation.preferredMode !== 'adaptive' && manifest.generation.referenceRequired !== true) throw new Error('Faithful reuse modes must require reference evidence.');
  if (!Array.isArray(manifest.generation.referenceEvidenceIds)) throw new Error('Generation referenceEvidenceIds must be an array.');
  for (const id of manifest.generation.referenceEvidenceIds) {
    const reference = manifest.evidence.find((item) => item.id === id);
    if (!reference || !isVisualEvidencePath(reference.path)) throw new Error(`Generation reference evidence is invalid: ${id}`);
  }
  if (manifest.generation.referenceRequired && manifest.generation.referenceEvidenceIds.length === 0) throw new Error('Reference-required generation has no reference evidence.');
  for (const field of ['mustPreserve', 'mayChange', 'mustAvoid']) {
    if (!Array.isArray(manifest.generation.visualDNA?.[field])) throw new Error(`Generation visualDNA.${field} must be an array.`);
  }
  if (['image', 'screenshot'].includes(manifest.assetKind)) {
    const primary = manifest.evidence.find((item) => item.role === 'primary');
    if (primary) assertVisualImage(resolve(assetDirectory, primary.path), 'Primary evidence visual image');
  }
  if (manifest.capture) {
    verifiedFile(assetDirectory, manifest.capture, 'HTML capture');
    const metadataPath = resolve(assetDirectory, safeRelativePath(manifest.capture.metadataPath || ''));
    if (!isInside(assetDirectory, metadataPath)) throw new Error('Capture metadata escapes the asset directory.');
    const metadata = readJson(metadataPath);
    assertKnownKeys(metadata, ['schemaVersion', 'kind', 'captureId', 'sourceUrl', 'finalUrl', 'capturedAt', 'mode', 'pageSha256'], 'Capture metadata');
    if (sha256File(metadataPath) !== manifest.capture.metadataSha256) throw new Error('Capture metadata hash mismatch.');
    if (metadata.kind !== 'kahlil-aesthetic-capture' || metadata.captureId !== manifest.capture.captureId || metadata.pageSha256 !== manifest.capture.sha256) throw new Error('Capture metadata binding mismatch.');
    validatePublicUrl(metadata.sourceUrl);
    validatePublicUrl(metadata.finalUrl);
    const capturePage = readFileSync(resolve(assetDirectory, manifest.capture.path), 'utf8');
    if (!/Content-Security-Policy/i.test(capturePage) || /<\s*(?:script|form|iframe|object|embed)\b/i.test(capturePage)) throw new Error('HTML capture is not inert.');
  }
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) throw new Error('Manifest sources are invalid.');
  for (const source of manifest.sources) {
    assertKnownKeys(source, ['type', 'value', 'label', 'rights'], 'Source');
    if (!['file', 'url', 'conversation'].includes(source.type)) throw new Error('Invalid source type.');
    if (source.type === 'url') validatePublicUrl(source.value);
    if (['file', 'conversation'].includes(source.type)) {
      const sourcePath = safeRelativePath(source.value);
      if (!manifest.evidence.some((item) => item.path === sourcePath)) throw new Error(`Local file source is not preserved evidence: ${sourcePath}`);
    }
  }
  const pagePath = join(assetDirectory, 'index.html');
  const markdownPath = join(assetDirectory, 'asset.md');
  if (!existsSync(pagePath) || !existsSync(markdownPath)) throw new Error('Generated asset views are missing.');
  const page = readFileSync(pagePath, 'utf8');
  if (!page.includes('data-kahlil-aesthetic="asset-view"')) throw new Error('Generated page is missing its asset marker.');
  if (/<(?:script|iframe)\b/i.test(page) || /(?:src|script)\s*=\s*["']https?:/i.test(page)) throw new Error('Generated page contains executable or remote content.');
  if (!manifest.views?.html || !manifest.views?.markdown) throw new Error('Generated view integrity metadata is missing.');
  if (safeRelativePath(manifest.views.html.path) !== 'index.html' || safeRelativePath(manifest.views.markdown.path) !== 'asset.md') throw new Error('Generated view paths are invalid.');
  if (sha256File(pagePath) !== manifest.views.html.sha256 || sha256File(markdownPath) !== manifest.views.markdown.sha256) throw new Error('Generated view mismatch.');
  const actualGaps = completionGaps({ assetKind: manifest.assetKind, evidence: manifest.evidence, capture: manifest.capture, analysis: manifest.analysis });
  const recordedMissing = Array.isArray(manifest.missing) ? manifest.missing : [];
  if (actualGaps.some((gap) => !recordedMissing.includes(gap))) throw new Error(`Manifest does not report missing requirement: ${actualGaps.find((gap) => !recordedMissing.includes(gap))}`);
  if (manifest.status === 'complete') {
    if (actualGaps.length || recordedMissing.length) throw new Error('Completed asset has missing requirements.');
  } else if (manifest.status === 'partial' && recordedMissing.length === 0) {
    throw new Error('Partial asset must visibly record at least one missing requirement.');
  }
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const manifest = verifyAsset(required(args, 'asset'));
    console.log(`Asset verification passed: ${manifest.name} (${manifest.status})`);
  } catch (error) {
    console.error(`Asset verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}
