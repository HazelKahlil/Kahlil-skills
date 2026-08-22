import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWrite, escapeHtml, libraryRootFromArgs, parseArgs, readLibrary, relativeHref, writeJson } from './lib.mjs';
import { verifyAsset } from './verify_asset.mjs';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(scriptDirectory, '../assets/asset-page.css'), 'utf8');

function readableStatus(status) {
  return { complete: '完整', partial: '部分完成', blocked: '已阻止' }[status] || '未知';
}

export function buildLibraryIndex(libraryRoot) {
  const library = readLibrary(libraryRoot);
  const records = [];
  const errors = [];
  for (const entry of readdirSync(library.assetsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const assetDirectory = join(library.assetsRoot, entry.name);
    const manifestPath = join(assetDirectory, 'manifest.json');
    if (!existsSync(manifestPath) || !statSync(manifestPath).isFile()) continue;
    try {
      const manifest = verifyAsset(assetDirectory);
      if (manifest.kind !== 'kahlil-aesthetic-asset' || manifest.status === 'blocked') continue;
      const primary = manifest.evidence.find((item) => item.role === 'primary') || manifest.evidence.find((item) => item.role === 'capture');
      records.push({ manifest, assetDirectory, primary });
    } catch (error) {
      errors.push({ assetDirectory, message: error.message });
    }
  }
  records.sort((left, right) => left.manifest.name.localeCompare(right.manifest.name, 'zh-Hans-CN'));
  const cards = records.map(({ manifest, assetDirectory, primary }) => {
    const pageHref = escapeHtml(encodeURI(relativeHref(library.indexRoot, join(assetDirectory, 'index.html'))));
    const imageHref = primary ? escapeHtml(encodeURI(relativeHref(library.indexRoot, join(assetDirectory, primary.path)))) : '';
    const image = primary ? `<img src="${imageHref}" alt="${escapeHtml(primary.label || manifest.name)}" />` : '<div class="missing">无本地视觉证据</div>';
    const tags = (manifest.analysis.tags || []).slice(0, 5).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `<a class="card" href="${pageHref}"><div class="preview">${image}</div><small>${escapeHtml(readableStatus(manifest.status))} · ${escapeHtml(manifest.assetKind)}</small><h2>${escapeHtml(manifest.name)}</h2><p>${escapeHtml(manifest.analysis.overall || '暂无分析')}</p><div class="tags">${tags}</div></a>`;
  }).join('');
  const healthNotice = errors.length ? `<p class="status-notice"><b>${errors.length} 项异常资产未进入索引。</b>请查看 index-errors.json 或运行 doctor.mjs；没有被静默视为成功。</p>` : '';
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kahlil Aesthetic Library</title><style>${css}\n.library{width:min(1440px,calc(100vw - 48px));margin:24px auto;padding:28px;background:var(--paper);box-shadow:0 18px 56px rgba(24,35,31,.13)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:28px}.card{display:block;padding:14px;border-top:2px solid var(--ink);background:#fffefa;color:inherit;text-decoration:none}.preview{aspect-ratio:1.45 / 1;display:grid;place-items:center;background:#e7e7df;overflow:hidden}.preview img{width:100%;height:100%;object-fit:contain}.card small{display:block;margin-top:11px;color:var(--muted);font:10px Inter,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase}.card h2{margin:6px 0;font-size:19px;font-weight:500}.card p{margin:0;color:var(--muted);font-size:13px;line-height:1.45}.tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}.tags span{padding:4px 5px;border:1px solid var(--line);font:10px Inter,Arial,sans-serif;color:var(--muted)}@media(max-width:900px){.library{width:calc(100vw - 24px);margin:12px auto;padding:18px}.grid{grid-template-columns:1fr}}</style></head><body><main class="library" data-kahlil-aesthetic="library-view"><p class="eyebrow">kahlil aesthetic / local library</p><h1>审美资产库</h1><p class="state">${records.length} 项本地资产 · 仅显示可验证记录</p>${healthNotice}<section class="grid">${cards || '<p>尚无可验证资产。</p>'}</section></main></body></html>`;
  const output = join(library.indexRoot, 'index.html');
  atomicWrite(output, html);
  writeJson(join(library.indexRoot, 'index-errors.json'), { schemaVersion: 1, kind: 'kahlil-aesthetic-index-errors', generatedAt: new Date().toISOString(), errors });
  return output;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    console.log(`Built library index: ${buildLibraryIndex(libraryRootFromArgs(args))}`);
  } catch (error) {
    console.error(`Library index failed: ${error.message}`);
    process.exitCode = 1;
  }
}
