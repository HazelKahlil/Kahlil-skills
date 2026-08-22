import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { atomicWrite, escapeHtml, libraryRootFromArgs, parseArgs, readJson, readLibrary, writeJson } from './lib.mjs';
import { readAllUsage } from './record_usage.mjs';
import { verifyAsset } from './verify_asset.mjs';

function processExists(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; }
  catch (error) { return error?.code === 'EPERM'; }
}

export function doctorLibrary(libraryRoot) {
  const library = readLibrary(libraryRoot);
  const issues = [];
  const assets = [];
  const assetIds = new Set();
  const lockPath = join(library.root, '.kahlil-aesthetic.lock');
  if (existsSync(lockPath)) {
    try {
      const lock = readJson(lockPath);
      const age = Date.now() - new Date(lock.createdAt).getTime();
      if (!processExists(lock.pid) || !Number.isFinite(age) || age > 60 * 60 * 1000) {
        issues.push({ code: 'stale-lock', path: lockPath, message: 'A stale library lock exists. Inspect it before manually removing it.' });
      } else {
        issues.push({ code: 'active-lock', path: lockPath, message: `Library write in progress: ${lock.operation || 'unknown operation'}.` });
      }
    } catch (error) {
      issues.push({ code: 'invalid-lock', path: lockPath, message: error.message });
    }
  }
  for (const entry of readdirSync(library.assetsRoot, { withFileTypes: true })) {
    const path = join(library.assetsRoot, entry.name);
    if (entry.name.startsWith('.staging-')) {
      issues.push({ code: 'stale-staging', path, message: 'Uncommitted staging directory requires inspection.' });
      continue;
    }
    if (entry.name.startsWith('.blocked-')) {
      issues.push({ code: 'blocked-asset', path, message: 'A blocked intake is preserved for diagnosis.' });
      continue;
    }
    if (!entry.isDirectory()) continue;
    try {
      const manifest = verifyAsset(path);
      assetIds.add(manifest.assetId);
      assets.push({ assetId: manifest.assetId, name: manifest.name, status: manifest.status, path });
    } catch (error) {
      issues.push({ code: 'invalid-asset', path, message: error.message });
    }
  }
  const usage = readAllUsage(library.root, { tolerateInvalid: true });
  for (const invalid of usage.invalid) issues.push({ code: 'invalid-usage', ...invalid });
  for (const record of usage.records) {
    if (!assetIds.has(record.assetId)) issues.push({ code: 'orphan-usage', path: record.usageId, message: `Usage references unknown assetId ${record.assetId}.` });
  }
  const report = {
    schemaVersion: 1,
    kind: 'kahlil-aesthetic-health-report',
    checkedAt: new Date().toISOString(),
    status: issues.length ? 'partial' : 'complete',
    counts: { assets: assets.length, usageRecords: usage.records.length, issues: issues.length },
    assets,
    issues
  };
  writeJson(join(library.indexRoot, 'health.json'), report);
  const issueMarkup = issues.map((item) => `<li><b>${escapeHtml(item.code)}</b> ${escapeHtml(item.message)}<small>${escapeHtml(item.path || '')}</small></li>`).join('');
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>审美资产库健康报告</title><style>body{margin:0;background:#ecebe5;color:#202825;font:14px/1.6 system-ui}main{width:min(1000px,calc(100vw - 48px));margin:24px auto;padding:32px;background:#faf9f4}li{padding:12px 0;border-top:1px solid #a9ada7}small{display:block;color:#65706b;overflow-wrap:anywhere}</style></head><body><main data-kahlil-aesthetic="health-view"><h1>资产库健康报告</h1><p>状态：${escapeHtml(report.status)} · ${assets.length} 项资产 · ${usage.records.length} 条调用 · ${issues.length} 个问题</p><ul>${issueMarkup || '<li>未发现问题。</li>'}</ul></main></body></html>`;
  atomicWrite(join(library.indexRoot, 'health.html'), html);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const report = doctorLibrary(libraryRootFromArgs(args));
    console.log(`Library health: ${report.status} (${report.counts.issues} issues)`);
    if (report.status !== 'complete') process.exitCode = 2;
  } catch (error) {
    console.error(`Library doctor failed: ${error.message}`);
    process.exitCode = 1;
  }
}
