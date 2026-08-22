import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { buildLibraryIndex } from './build_library_index.mjs';
import { ASSET_SCHEMA_VERSION, LIBRARY_SCHEMA_VERSION, absolutePath, acquireLibraryLock, assertNoSymlinkComponents, completionGaps, ensureDirectory, isInside, parseArgs, readJson, required, safeRelativePath, sha256File, writeJson } from './lib.mjs';

function legacyAssetDirectories(root, assetsDirectory) {
  const assetsRoot = resolve(root, safeRelativePath(assetsDirectory || 'assets'));
  if (!isInside(root, assetsRoot)) throw new Error('Legacy assetsDirectory escapes the library root.');
  assertNoSymlinkComponents(assetsRoot, 'Legacy assets directory');
  return readdirSync(assetsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => join(assetsRoot, entry.name));
}

function preflightAsset(directory) {
  const path = join(directory, 'manifest.json');
  const manifest = readJson(path);
  if (manifest.kind !== 'kahlil-aesthetic-asset' || ![1, ASSET_SCHEMA_VERSION].includes(manifest.schemaVersion)) throw new Error(`Unsupported legacy asset manifest: ${path}`);
  if (!Array.isArray(manifest.evidence)) throw new Error(`Legacy asset evidence is invalid: ${path}`);
  for (const item of manifest.evidence) {
    const file = resolve(directory, safeRelativePath(item.path));
    if (!isInside(directory, file) || !existsSync(file) || sha256File(file) !== item.sha256) throw new Error(`Legacy evidence verification failed: ${item.path}`);
  }
  for (const view of ['index.html', 'asset.md']) {
    if (!existsSync(join(directory, view))) throw new Error(`Legacy generated view is missing: ${join(directory, view)}`);
  }
  return { directory, path, manifest };
}

function migratedManifest(record) {
  const manifest = structuredClone(record.manifest);
  if (manifest.schemaVersion === ASSET_SCHEMA_VERSION && manifest.assetId && manifest.views && manifest.generation) return manifest;
  manifest.schemaVersion = ASSET_SCHEMA_VERSION;
  manifest.assetId ||= randomUUID();
  manifest.createdAt ||= statSync(record.directory).mtime.toISOString();
  manifest.generation ||= {
    preferredMode: 'adaptive',
    referenceRequired: false,
    referenceEvidenceIds: [],
    visualDNA: {
      mustPreserve: Array.isArray(manifest.analysis?.reuse) ? manifest.analysis.reuse : [],
      mayChange: [],
      mustAvoid: Array.isArray(manifest.analysis?.avoid) ? manifest.analysis.avoid : []
    }
  };
  if (manifest.assetKind === 'url' && manifest.capture && (!manifest.capture.captureId || !manifest.capture.metadataPath)) {
    manifest.legacyCapture = { ...manifest.capture, reason: 'v1 capture lacked shared capture provenance; preserved as legacy evidence only' };
    delete manifest.capture;
  }
  manifest.missing = completionGaps({ assetKind: manifest.assetKind, evidence: manifest.evidence, capture: manifest.capture, analysis: manifest.analysis });
  manifest.status = manifest.missing.length ? 'partial' : 'complete';
  manifest.views = {
    html: { path: 'index.html', sha256: sha256File(join(record.directory, 'index.html')) },
    markdown: { path: 'asset.md', sha256: sha256File(join(record.directory, 'asset.md')) }
  };
  return manifest;
}

export function migrateLibrary(root) {
  const libraryRoot = absolutePath(root, 'Library root');
  assertNoSymlinkComponents(libraryRoot, 'Library root');
  const libraryPath = join(libraryRoot, '.kahlil-aesthetic.json');
  const legacy = readJson(libraryPath);
  if (legacy.kind !== 'kahlil-aesthetic-library' || ![1, LIBRARY_SCHEMA_VERSION].includes(legacy.schemaVersion)) throw new Error('Unsupported library manifest for migration.');
  const records = legacyAssetDirectories(libraryRoot, legacy.assetsDirectory).map(preflightAsset);
  const pending = records.map((record) => ({ ...record, migrated: migratedManifest(record) }));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDirectory = join(libraryRoot, '.migration-backup', stamp);
  const release = acquireLibraryLock(libraryRoot, 'migrate-v1-to-v2');
  try {
    ensureDirectory(backupDirectory);
    copyFileSync(libraryPath, join(backupDirectory, '.kahlil-aesthetic.json'));
    for (const record of pending) {
      const assetBackup = join(backupDirectory, 'assets', basename(record.directory));
      ensureDirectory(assetBackup);
      copyFileSync(record.path, join(assetBackup, 'manifest.json'));
    }
    for (const record of pending) writeJson(record.path, record.migrated);
    const nextLibrary = {
      schemaVersion: LIBRARY_SCHEMA_VERSION,
      kind: 'kahlil-aesthetic-library',
      assetsDirectory: safeRelativePath(legacy.assetsDirectory || 'assets'),
      indexDirectory: safeRelativePath(legacy.indexDirectory || '_index'),
      usageDirectory: safeRelativePath(legacy.usageDirectory || 'usage')
    };
    ensureDirectory(resolve(libraryRoot, nextLibrary.indexDirectory));
    ensureDirectory(resolve(libraryRoot, nextLibrary.usageDirectory));
    writeJson(libraryPath, nextLibrary);
    const report = {
      schemaVersion: 1,
      kind: 'kahlil-aesthetic-migration-report',
      fromVersion: legacy.schemaVersion,
      toVersion: LIBRARY_SCHEMA_VERSION,
      migratedAt: new Date().toISOString(),
      migratedAssets: pending.filter((item) => item.manifest.schemaVersion !== ASSET_SCHEMA_VERSION || !item.manifest.assetId).length,
      evidenceFilesChanged: 0,
      backupDirectory
    };
    writeJson(join(resolve(libraryRoot, nextLibrary.indexDirectory), `migration-${stamp}.json`), report);
    buildLibraryIndex(libraryRoot);
    return report;
  } finally {
    release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const report = migrateLibrary(required(args, 'library'));
    console.log(`Migrated ${report.migratedAssets} assets to schema v${report.toVersion}.`);
    console.log(`Backup: ${report.backupDirectory}`);
  } catch (error) {
    console.error(`Library migration failed: ${error.message}`);
    process.exitCode = 1;
  }
}
