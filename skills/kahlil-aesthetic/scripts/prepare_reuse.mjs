import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { absolutePath, isInside, parseArgs, readJson, required, safeRelativePath, sha256File, writeJson } from './lib.mjs';
import { recordUsage } from './record_usage.mjs';
import { verifyAsset } from './verify_asset.mjs';

const modes = new Set(['adaptive', 'material-faithful', 'composition-faithful']);

function generationFromManifest(manifest) {
  if (!manifest.generation || typeof manifest.generation !== 'object') throw new Error('Asset has no generation reuse contract.');
  const preferredMode = modes.has(manifest.generation.preferredMode) ? manifest.generation.preferredMode : 'adaptive';
  const referenceEvidenceIds = Array.isArray(manifest.generation.referenceEvidenceIds) ? manifest.generation.referenceEvidenceIds : [];
  const visualDNA = manifest.generation.visualDNA && typeof manifest.generation.visualDNA === 'object' ? manifest.generation.visualDNA : {};
  return {
    preferredMode,
    referenceRequired: Boolean(manifest.generation.referenceRequired),
    referenceEvidenceIds,
    visualDNA: {
      mustPreserve: Array.isArray(visualDNA.mustPreserve) ? visualDNA.mustPreserve : [],
      mayChange: Array.isArray(visualDNA.mayChange) ? visualDNA.mayChange : [],
      mustAvoid: Array.isArray(visualDNA.mustAvoid) ? visualDNA.mustAvoid : []
    }
  };
}

export function prepareReuse(assetPath, { mode } = {}) {
  const assetDirectory = absolutePath(assetPath, 'Asset directory');
  const preliminary = readJson(join(assetDirectory, 'manifest.json'));
  const generation = generationFromManifest(preliminary);
  const selectedMode = mode || generation.preferredMode;
  if (!modes.has(selectedMode)) throw new Error(`Unsupported reuse mode: ${selectedMode}`);
  const referenceRequired = selectedMode !== 'adaptive' || generation.referenceRequired;
  const selectedReferences = generation.referenceEvidenceIds.map((id) => {
    const item = preliminary.evidence?.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`Required reference evidence is missing: ${id}`);
    const relativePath = safeRelativePath(item.path);
    const absolute = resolve(assetDirectory, relativePath);
    if (!isInside(assetDirectory, absolute) || !existsSync(absolute)) throw new Error(`Required reference evidence is unavailable: ${id}`);
    return { evidenceId: id, label: item.label, relativePath, absolutePath: absolute, sha256: item.sha256 };
  });
  if (referenceRequired && selectedReferences.length === 0) throw new Error(`${selectedMode} requires reference evidence; text-only prompting cannot claim fidelity.`);
  const manifest = verifyAsset(assetDirectory);
  for (const reference of selectedReferences) {
    if (sha256File(reference.absolutePath) !== reference.sha256) throw new Error(`Required reference evidence hash mismatch: ${reference.evidenceId}`);
  }
  const modeRule = {
    adaptive: '将视觉 DNA 迁移到新内容；允许重组构图和材料，不声称复制原图。',
    'material-faithful': '必须把所附参考图作为材料依据，优先忠实保留颗粒形态、边缘、密度和色彩关系；文字描述只负责新画幅与内容。',
    'composition-faithful': '必须把所附参考图作为构图依据，优先忠实保留视觉重心、留白比例、尺度关系和方向；允许内容换新。'
  }[selectedMode];
  const promptContract = [
    `复用模式：${selectedMode}。${modeRule}`,
    ...(referenceRequired ? ['参考图是必要输入；若生成系统没有实际接收参考图，结果只能标为 adaptive，不得标为 faithful。'] : []),
    `必须保留：${generation.visualDNA.mustPreserve.join('；') || '以资产分析中的可复用规则为准。'}`,
    `允许变化：${generation.visualDNA.mayChange.join('；') || '主题与画幅可按当前项目变化。'}`,
    `必须避免：${generation.visualDNA.mustAvoid.join('；') || '以资产避免事项为准。'}`
  ];
  return {
    schemaVersion: 1,
    kind: 'kahlil-aesthetic-reuse-package',
    assetId: manifest.assetId,
    assetName: manifest.name,
    mode: selectedMode,
    referenceRequired,
    references: selectedReferences,
    visualDNA: generation.visualDNA,
    promptContract
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const asset = absolutePath(required(args, 'asset'), 'Asset directory');
    const usageEvent = readJson(absolutePath(required(args, 'event'), 'Usage event path'));
    const libraryRoot = absolutePath(required(args, 'library'), 'Library root');
    const packageData = prepareReuse(asset, { mode: args.mode });
    if (usageEvent.assetId !== packageData.assetId) throw new Error('Usage event assetId does not match the prepared asset.');
    if ((usageEvent.mode || packageData.mode) !== packageData.mode) throw new Error('Usage event mode does not match the reuse package.');
    recordUsage(libraryRoot, { ...usageEvent, mode: packageData.mode, referenceUsed: packageData.references.length > 0 });
    if (args.out) writeJson(absolutePath(args.out, 'Reuse package output'), packageData);
    console.log(JSON.stringify(packageData, null, 2));
  } catch (error) {
    console.error(`Reuse preparation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
