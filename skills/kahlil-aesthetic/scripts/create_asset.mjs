import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, statSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLibraryIndex } from './build_library_index.mjs';
import { ASSET_SCHEMA_VERSION, MAX_EVIDENCE_BYTES, MAX_TEXT_EVIDENCE_BYTES, absolutePath, acquireLibraryLock, assertNoSymlinkComponents, assertVisualImage, atomicWrite, completionGaps, escapeHtml, isInside, isVisualEvidencePath, libraryRootFromArgs, parseArgs, readJson, readLibrary, relativeHref, required, safeRelativePath, sha256File, slugFor, validatePublicUrl, writeJson } from './lib.mjs';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(scriptDirectory, '../assets/asset-page.css'), 'utf8');
const renderableExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.svg']);
const reuseModes = new Set(['adaptive', 'material-faithful', 'composition-faithful']);

function readableStatus(status) {
  return { complete: '完整', partial: '部分完成', blocked: '已阻止' }[status] || '未知';
}

function normalizedText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function assertKnownKeys(value, allowed, label) {
  for (const key of Object.keys(value || {})) {
    if (!allowed.includes(key)) throw new Error(`${label} contains an unsupported field: ${key}`);
  }
}

function validateDraft(draft) {
  if (!draft || typeof draft !== 'object') throw new Error('Draft must be a JSON object.');
  assertKnownKeys(draft, ['name', 'kind', 'requestedStatus', 'sources', 'evidence', 'capture', 'analysis', 'generation'], 'Draft');
  if (!['image', 'screenshot', 'url', 'content'].includes(draft.kind)) throw new Error('Draft kind must be image, screenshot, url, or content.');
  draft.name = slugFor(draft.name);
  if (!Array.isArray(draft.sources) || draft.sources.length === 0) throw new Error('Draft needs at least one source.');
  if (!Array.isArray(draft.evidence)) throw new Error('Draft evidence must be an array.');
  for (const source of draft.sources) {
    if (!source || !['file', 'url', 'conversation'].includes(source.type) || !normalizedText(source.value)) throw new Error('Every source needs a supported type and value.');
    assertKnownKeys(source, ['type', 'value', 'label', 'rights'], 'Source');
    if (source.type === 'url') source.value = validatePublicUrl(source.value);
    if (source.type === 'file') source.value = absolutePath(source.value, 'File source path');
    if (source.type === 'conversation') {
      try { source.value = absolutePath(source.value, 'Conversation source path'); }
      catch { throw new Error('A conversation source must be a selected local evidence file, not raw conversation text.'); }
    }
    source.rights = ['owned', 'licensed', 'public-domain', 'unknown', 'restricted'].includes(source.rights) ? source.rights : 'unknown';
  }
  for (const evidence of draft.evidence) {
    if (!evidence || !['primary', 'supporting', 'capture', 'derived'].includes(evidence.role)) throw new Error('Every evidence item needs a valid role.');
    assertKnownKeys(evidence, ['path', 'role', 'label', 'derivedFrom', 'captureId'], 'Evidence');
    evidence.path = absolutePath(required(evidence, 'path'), 'Evidence path');
    if (evidence.captureId !== undefined && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(evidence.captureId)) {
      throw new Error('Evidence captureId must be a UUID.');
    }
    if (evidence.role === 'derived' && !normalizedText(evidence.derivedFrom)) throw new Error('Derived evidence must name derivedFrom.');
  }
  if (draft.capture !== undefined) {
    if (!draft.capture || typeof draft.capture !== 'object') throw new Error('Draft capture must be an object.');
    assertKnownKeys(draft.capture, ['htmlPath', 'metadataPath'], 'Capture');
  }
  if (['image', 'screenshot'].includes(draft.kind)) {
    const primary = draft.evidence.find((item) => item.role === 'primary');
    if (primary) assertVisualImage(primary.path, 'Primary evidence visual image');
  }
  for (const source of draft.sources.filter((item) => ['file', 'conversation'].includes(item.type))) {
    if (!draft.evidence.some((item) => item.path === source.value)) throw new Error(`Every local file source must also be preserved as evidence: ${source.value}`);
  }
  draft.analysis = draft.analysis && typeof draft.analysis === 'object' ? draft.analysis : {};
  assertKnownKeys(draft.analysis, ['overall', 'tags', 'composition', 'spacing', 'palette', 'typography', 'material', 'motionInteraction', 'reuse', 'avoid'], 'Analysis');
  draft.analysis.overall = normalizedText(draft.analysis.overall);
  draft.analysis.tags = Array.isArray(draft.analysis.tags) ? draft.analysis.tags.map((tag) => normalizedText(tag)).filter(Boolean) : [];
  for (const field of ['composition', 'spacing', 'palette', 'typography', 'material', 'motionInteraction']) {
    draft.analysis[field] = normalizedText(draft.analysis[field]);
  }
  draft.analysis.reuse = Array.isArray(draft.analysis.reuse) ? draft.analysis.reuse.map((item) => normalizedText(item)).filter(Boolean) : [];
  draft.analysis.avoid = Array.isArray(draft.analysis.avoid) ? draft.analysis.avoid.map((item) => normalizedText(item)).filter(Boolean) : [];
  return draft;
}

function generationContract(input, evidence, analysis) {
  const value = input && typeof input === 'object' ? input : {};
  assertKnownKeys(value, ['preferredMode', 'referenceRequired', 'referenceEvidenceIds', 'visualDNA'], 'Generation contract');
  const preferredMode = reuseModes.has(value.preferredMode) ? value.preferredMode : 'adaptive';
  const faithful = preferredMode !== 'adaptive';
  const referenceRequired = faithful ? true : Boolean(value.referenceRequired);
  const defaultReference = evidence.find((item) => ['primary', 'capture'].includes(item.role) && isVisualEvidencePath(item.path));
  const referenceEvidenceIds = Array.isArray(value.referenceEvidenceIds)
    ? value.referenceEvidenceIds.map((item) => normalizedText(item)).filter(Boolean)
    : (referenceRequired && defaultReference ? [defaultReference.id] : []);
  for (const id of referenceEvidenceIds) {
    const item = evidence.find((candidate) => candidate.id === id);
    if (!item || !isVisualEvidencePath(item.path)) throw new Error(`Generation reference evidence does not exist or is not visual: ${id}`);
  }
  if (referenceRequired && referenceEvidenceIds.length === 0) throw new Error('Reference-required generation needs at least one visual reference evidence ID.');
  const dna = value.visualDNA && typeof value.visualDNA === 'object' ? value.visualDNA : {};
  assertKnownKeys(dna, ['mustPreserve', 'mayChange', 'mustAvoid'], 'Generation visualDNA');
  const list = (items, fallback = []) => Array.isArray(items) ? items.map((item) => normalizedText(item)).filter(Boolean) : fallback;
  return {
    preferredMode,
    referenceRequired,
    referenceEvidenceIds,
    visualDNA: {
      mustPreserve: list(dna.mustPreserve, analysis.reuse),
      mayChange: list(dna.mayChange),
      mustAvoid: list(dna.mustAvoid, analysis.avoid)
    }
  };
}

function nextDirectory(assetsRoot, baseName) {
  let candidate = baseName;
  let number = 2;
  while (existsSync(join(assetsRoot, candidate))) {
    candidate = `${baseName}-${String(number).padStart(2, '0')}`;
    number += 1;
  }
  return join(assetsRoot, candidate);
}

function safeSourceFile(sourcePath) {
  assertNoSymlinkComponents(sourcePath, sourcePath);
  const stats = statSync(sourcePath);
  if (!stats.isFile()) throw new Error(`Evidence is not a file: ${sourcePath}`);
  if (stats.size > MAX_EVIDENCE_BYTES) throw new Error(`Evidence exceeds ${MAX_EVIDENCE_BYTES} bytes: ${sourcePath}`);
  const image = isVisualEvidencePath(sourcePath) ? assertVisualImage(sourcePath, 'Evidence visual image') : null;
  if (!image && stats.size > MAX_TEXT_EVIDENCE_BYTES) throw new Error(`Non-visual evidence exceeds ${MAX_TEXT_EVIDENCE_BYTES} bytes: ${sourcePath}`);
  return { ...stats, image };
}

function storedFileName(index, role, sourcePath) {
  const extension = extname(sourcePath).toLowerCase() || '.bin';
  const rawBase = basename(sourcePath, extname(sourcePath)).replace(/[^\p{L}\p{N}._-]+/gu, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '') || 'evidence';
  return `${String(index).padStart(2, '0')}-${role}-${rawBase.slice(0, 48)}${extension}`;
}

function copyEvidence(stageDirectory, item, index) {
  const stats = safeSourceFile(item.path);
  const area = item.role === 'derived' ? 'derived' : 'original';
  const targetDirectory = join(stageDirectory, area);
  mkdirSync(targetDirectory, { recursive: true });
  const target = join(targetDirectory, storedFileName(index, item.role, item.path));
  copyFileSync(item.path, target, 0);
  return {
    id: `evidence-${String(index).padStart(2, '0')}`,
    role: item.role,
    label: normalizedText(item.label, basename(item.path)),
    path: safeRelativePath(relative(stageDirectory, target)),
    sha256: sha256File(target),
    bytes: stats.size,
    ...(stats.image ? { width: stats.image.width, height: stats.image.height } : {}),
    ...(item.captureId ? { captureId: item.captureId } : {}),
    ...(item.derivedFrom ? { derivedFrom: item.derivedFrom } : {})
  };
}

function copyCapture(stageDirectory, capture, sourceUrls) {
  if (!capture || !capture.htmlPath) return null;
  const source = absolutePath(capture.htmlPath, 'Capture HTML path');
  const stats = safeSourceFile(source);
  if (stats.size > 5 * 1024 * 1024) throw new Error('Capture HTML exceeds 5 MiB.');
  if (!capture.metadataPath) throw new Error('Capture metadata is required so HTML and screenshot provenance can be bound.');
  const metadataPath = absolutePath(capture.metadataPath, 'Capture metadata path');
  const metadata = readJson(metadataPath);
  assertKnownKeys(metadata, ['schemaVersion', 'kind', 'captureId', 'sourceUrl', 'finalUrl', 'capturedAt', 'mode', 'pageSha256'], 'Capture metadata');
  if (metadata.kind !== 'kahlil-aesthetic-capture' || metadata.schemaVersion !== 1) throw new Error('Invalid capture metadata.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(metadata.captureId || '')) throw new Error('Capture metadata needs a UUID captureId.');
  metadata.sourceUrl = validatePublicUrl(metadata.sourceUrl);
  metadata.finalUrl = validatePublicUrl(metadata.finalUrl);
  if (!sourceUrls.includes(metadata.sourceUrl)) throw new Error('Capture sourceUrl does not match an asset URL source.');
  if (metadata.mode !== 'public-logged-out') throw new Error('Capture mode must be public-logged-out.');
  if (Number.isNaN(new Date(metadata.capturedAt).getTime())) throw new Error('Capture metadata has an invalid capturedAt timestamp.');
  if (metadata.pageSha256 !== sha256File(source)) throw new Error('Capture HTML hash does not match capture metadata.');
  const sourceHtml = readFileSync(source, 'utf8');
  if (!/Content-Security-Policy/i.test(sourceHtml) || !/default-src\s+(?:&#39;|')none(?:&#39;|')/i.test(sourceHtml) || /<\s*(?:script|form|iframe|object|embed)\b/i.test(sourceHtml)) {
    throw new Error('Capture page is not inert or contains executable content.');
  }
  const targetDirectory = join(stageDirectory, 'capture');
  mkdirSync(targetDirectory, { recursive: true });
  const target = join(targetDirectory, 'page.html');
  copyFileSync(source, target, 0);
  const storedMetadata = join(targetDirectory, 'capture.json');
  writeJson(storedMetadata, metadata);
  return {
    captureId: metadata.captureId,
    sourceUrl: metadata.sourceUrl,
    finalUrl: metadata.finalUrl,
    capturedAt: new Date(metadata.capturedAt).toISOString(),
    mode: metadata.mode,
    path: safeRelativePath(relative(stageDirectory, target)),
    sha256: sha256File(target),
    bytes: stats.size,
    metadataPath: safeRelativePath(relative(stageDirectory, storedMetadata)),
    metadataSha256: sha256File(storedMetadata)
  };
}

function storedSources(sources, draftEvidence, storedEvidence) {
  return sources.map((source) => {
    if (!['file', 'conversation'].includes(source.type)) return source;
    const index = draftEvidence.findIndex((item) => item.path === source.value);
    return { ...source, value: storedEvidence[index].path };
  });
}

function isRenderable(path) {
  return renderableExtensions.has(extname(path).toLowerCase());
}

const missingLabels = {
  'capture.pageHtml': '网页 HTML 响应',
  'evidence.fullPageScreenshot': '本地全页截图',
  'evidence.captureBinding': '同一次捕获的 HTML 与全页截图',
  'evidence.primary': '主视觉证据',
  'analysis.overall': '总体判断',
  'analysis.tags': '风格标签',
  'analysis.composition': '构图与留白',
  'analysis.palette': '色彩',
  'analysis.typography': '字体与文字（可写“不适用”）',
  'analysis.material': '材质与边缘',
  'analysis.motionInteraction': '动态 / 交互（可写“不适用”）',
  'analysis.reuse': '可复用规则',
  'analysis.avoid': '避免事项',
  'status.requestedPartial': '用户指定保留为 partial'
};

function missingMarkup(missing) {
  if (!missing.length) return '';
  const labels = missing.map((key) => missingLabels[key] || key).join('；');
  return `<div class="status-notice"><b>缺少：</b>${escapeHtml(labels)}</div>`;
}

function evidenceMarkup(assetDirectory, evidence, className = '') {
  if (!evidence || !isRenderable(evidence.path)) return '<div class="missing">无可直接显示的本地视觉证据</div>';
  const href = escapeHtml(encodeURI(relativeHref(assetDirectory, join(assetDirectory, evidence.path))));
  return `<a class="evidence-link" href="${href}" target="_blank" rel="noopener"><img class="${className}" src="${href}" alt="${escapeHtml(evidence.label)}" /></a>`;
}

function factList(manifest) {
  const sourceText = manifest.sources.map((source) => source.label || source.value).join('；');
  const rights = [...new Set(manifest.sources.map((source) => source.rights || 'unknown'))].join(' / ');
  return `<dl class="facts"><dt>来源</dt><dd>${escapeHtml(sourceText)}</dd><dt>类型</dt><dd>${escapeHtml(manifest.assetKind)} · ${escapeHtml(readableStatus(manifest.status))}</dd><dt>权利状态</dt><dd>${escapeHtml(rights)} · 个人参考为默认边界</dd></dl>`;
}

function analysisList(analysis) {
  const fields = [['构图 / 留白', analysis.composition || analysis.spacing], ['色彩', analysis.palette], ['字体 / 文字', analysis.typography], ['材质 / 边缘', analysis.material], ['动态 / 交互', analysis.motionInteraction]];
  return `<ul class="analysis-list">${fields.filter(([, value]) => normalizedText(value)).map(([label, value]) => `<li><b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span></li>`).join('')}</ul>`;
}

function listCard(label, title, items, className = '') {
  return `<article class="card ${className}"><p class="label">${escapeHtml(label)}</p><h2>${escapeHtml(title)}</h2><ul>${(items.length ? items : ['待补充']).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>`;
}

function usageStateLabel(status) {
  return { consulted: '已查看', applied: '已应用' }[status] || '已记录';
}

function outcomeLabel(outcome) {
  return { effective: '有效', partial: '部分有效', ineffective: '效果不佳', unknown: '待复盘' }[outcome] || '待复盘';
}

function usageMarkup(usageRecords) {
  if (!Array.isArray(usageRecords) || usageRecords.length === 0) return '';
  const cards = usageRecords.filter((record) => record && typeof record === 'object').map((record) => {
    const assets = Array.isArray(record.assets) ? record.assets.filter((item) => item && typeof item === 'object') : [];
    const states = [...new Set((assets.length ? assets.map((item) => item.status) : [record.status]).map((item) => usageStateLabel(item)))];
    const directDimensions = Array.isArray(record.appliedDimensions) ? record.appliedDimensions : [];
    const dimensions = [...new Set([...directDimensions, ...assets.flatMap((item) => Array.isArray(item.appliedDimensions) ? item.appliedDimensions : [])].map((item) => normalizedText(item)).filter(Boolean))];
    const outputs = (Array.isArray(record.outputs) ? record.outputs : []).map((item) => normalizedText(item?.label || item)).filter(Boolean);
    const feedback = (Array.isArray(record.feedback) ? record.feedback : []).map((item) => normalizedText(item?.summary || item)).filter(Boolean);
    const outcome = normalizedText(record.outcome, 'unknown');
    const score = Number.isFinite(record.score) ? ` · ${record.score} 分` : '';
    const mode = normalizedText(record.mode, 'adaptive');
    return `<article class="usage-card" data-outcome="${escapeHtml(outcome)}"><div class="usage-card-head"><div><p class="label">项目调用</p><h3>${escapeHtml(normalizedText(record.projectName, '未命名项目'))}</h3><p class="usage-deliverable">${escapeHtml(normalizedText(record.deliverable, '未命名任务'))}</p></div><span class="usage-status">${escapeHtml(states.join(' / ') || '已记录')} · ${escapeHtml(outcomeLabel(outcome))}${escapeHtml(score)}</span></div><dl class="usage-meta"><dt>复用模式</dt><dd>${escapeHtml(mode)}${record.referenceUsed ? ' · 使用参考图' : ''}</dd><dt>应用维度</dt><dd>${escapeHtml(dimensions.join(' · ') || '尚未应用')}</dd><dt>关联产物</dt><dd>${escapeHtml(outputs.join('；') || '尚未关联')}</dd><dt>项目反馈</dt><dd>${escapeHtml(feedback.join('；') || '尚未复盘')}</dd></dl></article>`;
  }).join('');
  if (!cards) return '';
  return `<section class="usage-section" data-section="usage"><div class="usage-heading"><div><p class="eyebrow">project usage / trace</p><h2>项目使用记录</h2></div><p>仅在 Agent 为具体项目实际读取或引用资产后出现。</p></div><div class="usage-grid">${cards}</div></section>`;
}

export function renderAssetHtml(manifest, assetDirectory, usageRecords = []) {
  const primary = manifest.evidence.find((item) => item.role === 'primary') || manifest.evidence.find((item) => item.role === 'capture');
  const support = manifest.evidence.filter((item) => item.id !== primary?.id);
  const featuredSupport = support.slice(0, 4);
  const remainingSupport = support.slice(4);
  const captureLink = manifest.capture ? `<p class="label">网页证据：<a href="capture/page.html" rel="noopener">打开惰性 HTML 证据</a>（脚本与远程资源不会执行，视觉仍可能离线失真）</p>` : '';
  const evidenceGrid = featuredSupport.length ? `<div class="evidence">${featuredSupport.map((item) => `<figure>${evidenceMarkup(assetDirectory, item)}<figcaption>${escapeHtml(item.label)}</figcaption></figure>`).join('')}</div>` : '';
  const evidenceArchive = remainingSupport.length ? `<details class="evidence-archive"><summary>查看其余 ${remainingSupport.length} 张证据（共 ${manifest.evidence.length} 项）</summary><div class="evidence evidence-all">${remainingSupport.map((item) => `<figure>${evidenceMarkup(assetDirectory, item)}<figcaption>${escapeHtml(item.label)}</figcaption></figure>`).join('')}</div></details>` : '';
  const tags = manifest.analysis.tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join('');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(manifest.name)} · 审美资产档案</title><style>${css}</style></head><body><main class="page" data-kahlil-aesthetic="asset-view"><header><div><p class="eyebrow">kahlil aesthetic / local asset record</p><h1>${escapeHtml(manifest.name)}</h1></div><p class="state">${escapeHtml(readableStatus(manifest.status))}<br>本地证据 ${manifest.evidence.length} 项<br>所有判断均应视为推断，除非另有来源</p></header>${missingMarkup(manifest.missing || [])}<section class="hero"><figure data-section="source"><div class="media-frame"><span class="index">01</span>${evidenceMarkup(assetDirectory, primary)}</div><figcaption><span>主证据 / ${escapeHtml(primary?.label || '未提供')}</span><span>${escapeHtml(manifest.assetKind)}</span></figcaption>${evidenceGrid}${evidenceArchive}</figure><aside class="analysis" data-section="analysis"><p class="label">总体判断 · 推断</p><p class="statement">${escapeHtml(manifest.analysis.overall || '待补充视觉判断。')}</p><div class="tags">${tags}</div>${factList(manifest)}${analysisList(manifest.analysis)}${captureLink}</aside></section><section class="details"><article class="card" data-section="palette"><p class="label">审美观察 · 推断</p><h2>材料与秩序</h2><p>${escapeHtml(manifest.analysis.material || manifest.analysis.palette || '待补充')}</p></article>${listCard('可复用规则', '下一次可迁移什么', manifest.analysis.reuse, 'reuse')} ${listCard('避免', '不要把它做成什么', manifest.analysis.avoid, 'avoid')}</section>${usageMarkup(usageRecords)}<footer><span>manifest.json 为机器源数据</span><span>本页仅加载本地媒体，不执行网页捕获内容</span></footer></main></body></html>`;
}

export function renderAssetMarkdown(manifest) {
  const sources = manifest.sources.map((source) => `- ${source.type}：${source.label || source.value}\n  - 值：${source.value}\n  - 权利状态：${source.rights}`).join('\n');
  const evidence = manifest.evidence.map((item) => `- ${item.role}：\`${item.path}\` · sha256 ${item.sha256}${item.derivedFrom ? ` · derivedFrom ${item.derivedFrom}` : ''}`).join('\n');
  return `# ${manifest.name}\n\n## 状态\n\n- 当前：${readableStatus(manifest.status)}\n- 提示：所有视觉判断均为推断，除非来源另有说明。\n\n## 来源\n\n${sources}\n\n## 证据\n\n${evidence || '- 暂无'}\n\n## 总体判断\n\n${manifest.analysis.overall || '待补充'}\n\n## 标签\n\n${manifest.analysis.tags.map((tag) => `- ${tag}`).join('\n') || '- 暂无'}\n\n## 构图与留白\n\n${manifest.analysis.composition || manifest.analysis.spacing || '待补充'}\n\n## 色彩\n\n${manifest.analysis.palette || '待补充'}\n\n## 字体与文字\n\n${manifest.analysis.typography || '待补充'}\n\n## 材质与边缘\n\n${manifest.analysis.material || '待补充'}\n\n## 动态 / 交互\n\n${manifest.analysis.motionInteraction || '不适用或待补充'}\n\n## 可复用规则\n\n${manifest.analysis.reuse.map((item) => `- ${item}`).join('\n') || '- 暂无'}\n\n## 避免\n\n${manifest.analysis.avoid.map((item) => `- ${item}`).join('\n') || '- 暂无'}\n`;
}

function localStagingCheck(stageDirectory, manifest) {
  for (const item of manifest.evidence) {
    const filePath = resolve(stageDirectory, item.path);
    if (!isInside(stageDirectory, filePath) || !existsSync(filePath) || sha256File(filePath) !== item.sha256) throw new Error(`Staging evidence verification failed: ${item.path}`);
  }
  if (manifest.capture) {
    const capturePath = resolve(stageDirectory, manifest.capture.path);
    if (!isInside(stageDirectory, capturePath) || !existsSync(capturePath) || sha256File(capturePath) !== manifest.capture.sha256) throw new Error('Staging capture verification failed.');
  }
  const page = readFileSync(join(stageDirectory, 'index.html'), 'utf8');
  if (!page.includes('data-kahlil-aesthetic="asset-view"') || /(?:src|script)\s*=\s*["']https?:/i.test(page)) throw new Error('Generated archive view is invalid.');
}

export function createAsset(libraryRoot, draftPath, { buildIndex = buildLibraryIndex } = {}) {
  const library = readLibrary(libraryRoot);
  const root = library.root;
  const draft = validateDraft(readJson(absolutePath(draftPath, 'Draft path')));
  const releaseLock = acquireLibraryLock(root, 'create-asset');
  const finalDirectory = nextDirectory(library.assetsRoot, draft.name);
  const stageDirectory = join(library.assetsRoot, `.staging-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  let committed = false;
  mkdirSync(stageDirectory, { recursive: false });
  try {
    const evidence = draft.evidence.map((item, index) => copyEvidence(stageDirectory, item, index + 1));
    for (const item of evidence.filter((entry) => entry.role === 'derived')) {
      if (!evidence.some((entry) => entry.id === item.derivedFrom && entry.role !== 'derived')) {
        throw new Error(`Derived evidence references an unknown evidence ID: ${item.derivedFrom}`);
      }
    }
    const capture = copyCapture(stageDirectory, draft.capture, draft.sources.filter((item) => item.type === 'url').map((item) => item.value));
    const missing = completionGaps({ assetKind: draft.kind, evidence, capture, analysis: draft.analysis, requestedStatus: draft.requestedStatus });
    const manifest = {
      schemaVersion: ASSET_SCHEMA_VERSION,
      kind: 'kahlil-aesthetic-asset',
      assetId: randomUUID(),
      createdAt: new Date().toISOString(),
      name: basename(finalDirectory),
      assetKind: draft.kind,
      status: missing.length ? 'partial' : 'complete',
      missing,
      sources: storedSources(draft.sources, draft.evidence, evidence),
      evidence,
      ...(capture ? { capture } : {}),
      analysis: draft.analysis,
      generation: generationContract(draft.generation, evidence, draft.analysis)
    };
    atomicWrite(join(stageDirectory, 'asset.md'), renderAssetMarkdown(manifest));
    atomicWrite(join(stageDirectory, 'index.html'), renderAssetHtml(manifest, stageDirectory));
    manifest.views = {
      markdown: { path: 'asset.md', sha256: sha256File(join(stageDirectory, 'asset.md')) },
      html: { path: 'index.html', sha256: sha256File(join(stageDirectory, 'index.html')) }
    };
    writeJson(join(stageDirectory, 'manifest.json'), manifest);
    localStagingCheck(stageDirectory, manifest);
    renameSync(stageDirectory, finalDirectory);
    committed = true;
    const indexPath = buildIndex(root);
    return { assetDirectory: finalDirectory, status: manifest.status, indexPath };
  } catch (error) {
    const failedDirectory = committed ? finalDirectory : stageDirectory;
    const blockedName = committed
      ? `.blocked-${basename(finalDirectory)}-${Date.now()}`
      : basename(stageDirectory).replace(/^\.staging-/, '.blocked-');
    try { writeJson(join(failedDirectory, 'failure.json'), { status: 'blocked', message: error.message }); } catch {}
    try { renameSync(failedDirectory, join(library.assetsRoot, blockedName)); } catch {}
    throw error;
  } finally {
    releaseLock();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = createAsset(libraryRootFromArgs(args), required(args, 'draft'));
    console.log(`Created asset: ${result.assetDirectory}`);
    console.log(`Status: ${result.status}`);
    console.log(`Library index: ${result.indexPath}`);
  } catch (error) {
    console.error(`Asset creation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
