import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { isIP } from 'node:net';
import { homedir } from 'node:os';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

export const LIBRARY_SCHEMA_VERSION = 2;
export const ASSET_SCHEMA_VERSION = 2;
export const MAX_EVIDENCE_BYTES = 200 * 1024 * 1024;
export const MAX_TEXT_EVIDENCE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 120_000_000;
export const MAX_IMAGE_DIMENSION = 32_768;
export const MAX_JSON_BYTES = 5 * 1024 * 1024;

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    index += 1;
  }
  return args;
}

export function required(args, key) {
  if (!args[key]) throw new Error(`Missing required --${key}`);
  return args[key];
}

export function absolutePath(input, label) {
  if (!isAbsolute(input)) throw new Error(`${label} must be an absolute path.`);
  return resolve(input);
}

export function assertNotSymlink(filePath, label = filePath) {
  if (existsSync(filePath) && lstatSync(filePath).isSymbolicLink()) {
    throw new Error(`${label} must not be a symbolic link.`);
  }
}

export function assertNoSymlinkComponents(filePath, label = filePath) {
  let current = resolve(filePath);
  while (true) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) {
      throw new Error(`${label} must not contain a symbolic link.`);
    }
    const parent = dirname(current);
    if (parent === current) return;
    current = parent;
  }
}

export function ensureDirectory(directory) {
  if (existsSync(directory)) {
    assertNotSymlink(directory, directory);
    if (!statSync(directory).isDirectory()) throw new Error(`${directory} is not a directory.`);
  } else {
    mkdirSync(directory, { recursive: true });
  }
}

export function isInside(parent, child) {
  const relation = relative(resolve(parent), resolve(child));
  return relation === '' || (!relation.startsWith(`..${sep}`) && relation !== '..' && !isAbsolute(relation));
}

export function safeRelativePath(filePath) {
  const value = filePath.replaceAll('\\', '/');
  if (!value || value.startsWith('/') || value.split('/').includes('..')) throw new Error(`Unsafe relative path: ${filePath}`);
  return value;
}

export function sha256File(filePath) {
  assertNotSymlink(filePath, filePath);
  const stats = statSync(filePath);
  if (!stats.isFile()) throw new Error(`${filePath} is not a file.`);
  const hash = createHash('sha256');
  const fd = openSync(filePath, 'r');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    let bytes = 0;
    do {
      bytes = readSync(fd, buffer, 0, buffer.length, null);
      if (bytes > 0) hash.update(buffer.subarray(0, bytes));
    } while (bytes > 0);
  } finally {
    closeSync(fd);
  }
  return hash.digest('hex');
}

export function sha256Text(value) {
  return createHash('sha256').update(String(value), 'utf8').digest('hex');
}

const visualEvidenceExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg']);

export function isVisualEvidencePath(filePath) {
  return visualEvidenceExtensions.has(extname(filePath).toLowerCase());
}

export function isRecognizedImageFile(filePath) {
  if (!isVisualEvidencePath(filePath)) return false;
  const extension = extname(filePath).toLowerCase();
  const fd = openSync(filePath, 'r');
  const buffer = Buffer.alloc(4096);
  let bytes;
  try {
    bytes = readSync(fd, buffer, 0, buffer.length, 0);
  } finally {
    closeSync(fd);
  }
  const head = buffer.subarray(0, bytes);
  if (extension === '.png') return head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (extension === '.jpg' || extension === '.jpeg') return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  if (extension === '.gif') return ['GIF87a', 'GIF89a'].includes(head.subarray(0, 6).toString('ascii'));
  if (extension === '.webp') return head.subarray(0, 4).toString('ascii') === 'RIFF' && head.subarray(8, 12).toString('ascii') === 'WEBP';
  if (extension === '.avif') return head.subarray(4, 12).toString('ascii').startsWith('ftypavi');
  if (extension === '.svg') return /<svg\b/i.test(head.toString('utf8'));
  return false;
}

function jpegDimensions(buffer) {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > buffer.length) return null;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

function svgDimensions(text) {
  const opening = text.match(/<svg\b[^>]*>/i)?.[0] || '';
  const numeric = (name) => {
    const match = opening.match(new RegExp(`\\b${name}\\s*=\\s*["']\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i'));
    return match ? Number(match[1]) : null;
  };
  let width = numeric('width');
  let height = numeric('height');
  if (!width || !height) {
    const viewBox = opening.match(/\bviewBox\s*=\s*["']\s*[-+]?\d+(?:\.\d+)?[ ,]+[-+]?\d+(?:\.\d+)?[ ,]+([0-9]+(?:\.\d+)?)[ ,]+([0-9]+(?:\.\d+)?)/i);
    if (viewBox) {
      width ||= Number(viewBox[1]);
      height ||= Number(viewBox[2]);
    }
  }
  return width && height ? { width, height } : null;
}

export function assertSafeSvgText(text, label = 'SVG evidence') {
  const unsafe = /<!DOCTYPE|<!ENTITY|<\s*(?:script|foreignObject|iframe|object|embed|image|use|a|style)\b|\son[a-z]+\s*=|\bstyle\s*=|@import|url\s*\(|(?:xlink:)?href\s*=/i;
  if (unsafe.test(text)) throw new Error(`${label} contains executable or external SVG content.`);
}

export function inspectImageFile(filePath) {
  if (!isRecognizedImageFile(filePath)) return null;
  const extension = extname(filePath).toLowerCase();
  const stats = statSync(filePath);
  const readLength = Math.min(stats.size, 2 * 1024 * 1024);
  const fd = openSync(filePath, 'r');
  const buffer = Buffer.alloc(readLength);
  try { readSync(fd, buffer, 0, readLength, 0); } finally { closeSync(fd); }
  let dimensions = null;
  if (extension === '.png' && buffer.length >= 24) dimensions = { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  else if ((extension === '.jpg' || extension === '.jpeg') && buffer.length >= 4) dimensions = jpegDimensions(buffer);
  else if (extension === '.gif' && buffer.length >= 10) dimensions = { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  else if (extension === '.webp' && buffer.length >= 30) {
    const kind = buffer.subarray(12, 16).toString('ascii');
    if (kind === 'VP8X') dimensions = { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
    else if (kind === 'VP8 ' && buffer.length >= 30) dimensions = { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    else if (kind === 'VP8L' && buffer.length >= 25) {
      const bits = buffer.readUInt32LE(21);
      dimensions = { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  } else if (extension === '.svg') {
    const text = buffer.toString('utf8');
    assertSafeSvgText(text, filePath);
    dimensions = svgDimensions(text);
  }
  if (!dimensions || !Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height) || dimensions.width <= 0 || dimensions.height <= 0) {
    throw new Error(`Unable to verify image dimensions: ${filePath}`);
  }
  if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION || dimensions.width * dimensions.height > MAX_IMAGE_PIXELS) {
    throw new Error(`Image dimensions exceed the safe pixel limit: ${filePath}`);
  }
  return { extension, bytes: stats.size, ...dimensions };
}

export function assertVisualImage(filePath, label = 'Visual image') {
  const metadata = inspectImageFile(filePath);
  if (!metadata) throw new Error(`${label} must be a recognized visual image.`);
  return metadata;
}

export function readJson(filePath) {
  assertNoSymlinkComponents(filePath, filePath);
  const stats = statSync(filePath);
  if (!stats.isFile()) throw new Error(`${filePath} is not a file.`);
  if (stats.size > MAX_JSON_BYTES) throw new Error(`JSON file exceeds ${MAX_JSON_BYTES} bytes: ${filePath}`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function syncDirectory(directory) {
  let fd;
  try {
    fd = openSync(directory, 'r');
    fsyncSync(fd);
  } catch {
    // Some filesystems do not permit directory fsync. The file itself is still synced.
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

export function atomicWrite(filePath, content, { mode = 0o644 } = {}) {
  ensureDirectory(dirname(filePath));
  assertNoSymlinkComponents(dirname(filePath), dirname(filePath));
  const temporary = `${filePath}.${randomUUID()}.tmp`;
  let fd;
  try {
    fd = openSync(temporary, 'wx', mode);
    writeFileSync(fd, content, 'utf8');
    fsyncSync(fd);
    closeSync(fd);
    fd = undefined;
    renameSync(temporary, filePath);
    syncDirectory(dirname(filePath));
  } catch (error) {
    if (fd !== undefined) closeSync(fd);
    try { unlinkSync(temporary); } catch {}
    throw error;
  }
}

export function atomicWriteBuffer(filePath, content, { mode = 0o644 } = {}) {
  if (!Buffer.isBuffer(content)) throw new Error('atomicWriteBuffer requires a Buffer.');
  ensureDirectory(dirname(filePath));
  assertNoSymlinkComponents(dirname(filePath), dirname(filePath));
  const temporary = `${filePath}.${randomUUID()}.tmp`;
  let fd;
  try {
    fd = openSync(temporary, 'wx', mode);
    writeFileSync(fd, content);
    fsyncSync(fd);
    closeSync(fd);
    fd = undefined;
    renameSync(temporary, filePath);
    syncDirectory(dirname(filePath));
  } catch (error) {
    if (fd !== undefined) closeSync(fd);
    try { unlinkSync(temporary); } catch {}
    throw error;
  }
}

export function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function escapeText(value = '') {
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', '\\n');
}

export function slugFor(value) {
  const cleaned = String(value).trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').replace(/-+/g, '-').replace(/^[-. ]+|[-. ]+$/g, '');
  if (cleaned.length < 3) throw new Error('Asset name must contain at least three usable characters.');
  return cleaned.slice(0, 96);
}

export function relativeHref(fromDirectory, targetPath) {
  const value = relative(fromDirectory, targetPath).replaceAll('\\', '/');
  if (!value || isAbsolute(value)) throw new Error(`Unsafe relative href: ${value || targetPath}`);
  return value;
}

export function writeJson(filePath, object) {
  atomicWrite(filePath, `${JSON.stringify(object, null, 2)}\n`);
}

export function validatePublicUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only http: and https: URLs are supported.');
  if (parsed.username || parsed.password) throw new Error('URLs with embedded credentials are not allowed.');
  const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || (isIP(hostname) && !isPublicIpAddress(hostname))) {
    throw new Error('URL must use a public host; localhost and private or reserved network targets are not allowed.');
  }
  const sensitive = new Set(['token', 'key', 'secret', 'signature', 'sig', 'authorization', 'password', 'accesstoken', 'apikey', 'auth', 'session', 'credential', 'policy']);
  for (const key of parsed.searchParams.keys()) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if ([...sensitive].some((term) => normalized === term || normalized.includes(term))) throw new Error(`URL contains a sensitive query parameter: ${key}`);
  }
  const fragment = parsed.hash.toLowerCase();
  if (/(token|secret|signature|credential|password|session|authorization|api[_-]?key)=/.test(fragment)) throw new Error('URL contains sensitive data in its fragment.');
  return parsed.toString();
}

function ipv4Bytes(address) {
  const parts = address.split('.').map(Number);
  return parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) ? parts : null;
}

function ipv6Words(address) {
  const clean = address.toLowerCase().split('%')[0];
  const halves = clean.split('::');
  if (halves.length > 2) return null;
  const parsePart = (part) => {
    if (!part) return [];
    const tokens = part.split(':');
    const output = [];
    for (const token of tokens) {
      if (token.includes('.')) {
        const bytes = ipv4Bytes(token);
        if (!bytes) return null;
        output.push((bytes[0] << 8) | bytes[1], (bytes[2] << 8) | bytes[3]);
      } else if (/^[a-f0-9]{1,4}$/.test(token)) output.push(Number.parseInt(token, 16));
      else return null;
    }
    return output;
  };
  const left = parsePart(halves[0]);
  const right = parsePart(halves[1] || '');
  if (!left || !right) return null;
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;
  return [...left, ...Array(missing).fill(0), ...right];
}

function isPublicIpv4(address) {
  const bytes = ipv4Bytes(address);
  if (!bytes) return false;
  const [a, b, c] = bytes;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)))) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}

export function isPublicIpAddress(address) {
  const version = isIP(address);
  if (version === 4) return isPublicIpv4(address);
  if (version !== 6) return false;
  const words = ipv6Words(address);
  if (!words) return false;
  if (words.slice(0, 7).every((word) => word === 0) && words[7] <= 1) return false;
  if ((words[0] & 0xfe00) === 0xfc00 || (words[0] & 0xffc0) === 0xfe80 || (words[0] & 0xff00) === 0xff00) return false;
  if (words[0] === 0x2001 && words[1] === 0x0db8) return false;
  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
    return isPublicIpv4(`${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`);
  }
  return true;
}

export function defaultConfigPath() {
  return join(homedir(), '.config', 'kahlil-aesthetic', 'config.json');
}

export function libraryRootFromArgs(args) {
  if (args.library) return absolutePath(args.library, 'Library root');
  const configPath = args.config ? absolutePath(args.config, 'Config path') : defaultConfigPath();
  assertNoSymlinkComponents(configPath, 'Config path');
  if (!existsSync(configPath)) throw new Error(`No kahlil-aesthetic configuration found: ${configPath}`);
  const config = readJson(configPath);
  if (config.schemaVersion !== 1 || !config.libraryRoot) throw new Error(`Invalid kahlil-aesthetic configuration: ${configPath}`);
  return absolutePath(config.libraryRoot, 'Configured library root');
}

const analysisFields = [
  ['overall', 'analysis.overall'],
  ['tags', 'analysis.tags'],
  ['composition', 'analysis.composition'],
  ['palette', 'analysis.palette'],
  ['typography', 'analysis.typography'],
  ['material', 'analysis.material'],
  ['motionInteraction', 'analysis.motionInteraction'],
  ['reuse', 'analysis.reuse'],
  ['avoid', 'analysis.avoid']
];

export function analysisGaps(analysis = {}) {
  return analysisFields.flatMap(([field, key]) => {
    const value = analysis[field];
    if (Array.isArray(value)) return value.some((item) => String(item).trim()) ? [] : [key];
    return typeof value === 'string' && value.trim() ? [] : [key];
  });
}

export function completionGaps({ assetKind, evidence = [], capture = null, analysis = {}, requestedStatus }) {
  const gaps = analysisGaps(analysis);
  if (assetKind === 'url') {
    if (!capture) gaps.unshift('capture.pageHtml');
    const screenshot = evidence.find((item) => item.role === 'capture' && isVisualEvidencePath(item.path));
    if (!screenshot) gaps.unshift('evidence.fullPageScreenshot');
    else if (!capture?.captureId || screenshot.captureId !== capture.captureId) gaps.unshift('evidence.captureBinding');
  } else if (!evidence.some((item) => item.role === 'primary')) gaps.unshift('evidence.primary');
  if (requestedStatus === 'partial') gaps.push('status.requestedPartial');
  return gaps;
}

export function libraryManifestPath(root) {
  return resolve(root, '.kahlil-aesthetic.json');
}

export function initLibrary(root) {
  const libraryRoot = absolutePath(root, 'Library root');
  assertNoSymlinkComponents(libraryRoot, 'Library root');
  ensureDirectory(libraryRoot);
  const manifestPath = libraryManifestPath(libraryRoot);
  if (existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    if (manifest.kind !== 'kahlil-aesthetic-library' || manifest.schemaVersion !== LIBRARY_SCHEMA_VERSION) {
      throw new Error(`Existing library manifest is incompatible: ${manifestPath}`);
    }
  } else {
    writeJson(manifestPath, {
      schemaVersion: LIBRARY_SCHEMA_VERSION,
      kind: 'kahlil-aesthetic-library',
      assetsDirectory: 'assets',
      indexDirectory: '_index',
      usageDirectory: 'usage'
    });
  }
  ensureDirectory(resolve(libraryRoot, 'assets'));
  ensureDirectory(resolve(libraryRoot, '_index'));
  ensureDirectory(resolve(libraryRoot, 'usage'));
  return libraryRoot;
}

export function readLibrary(root) {
  const libraryRoot = absolutePath(root, 'Library root');
  assertNoSymlinkComponents(libraryRoot, 'Library root');
  const manifestPath = libraryManifestPath(libraryRoot);
  if (!existsSync(manifestPath)) throw new Error(`Library is not initialized: ${libraryRoot}`);
  const manifest = readJson(manifestPath);
  if (manifest.kind !== 'kahlil-aesthetic-library' || manifest.schemaVersion !== LIBRARY_SCHEMA_VERSION) throw new Error(`Invalid library manifest: ${manifestPath}`);
  const controlPath = (key, fallback) => {
    const stored = safeRelativePath(manifest[key] || fallback);
    const resolved = resolve(libraryRoot, stored);
    if (!isInside(libraryRoot, resolved)) throw new Error(`${key} must stay inside the library root.`);
    assertNoSymlinkComponents(resolved, key);
    if (!existsSync(resolved) || !statSync(resolved).isDirectory()) throw new Error(`${key} is not an initialized library directory.`);
    return resolved;
  };
  return {
    root: libraryRoot,
    manifest,
    assetsRoot: controlPath('assetsDirectory', 'assets'),
    indexRoot: controlPath('indexDirectory', '_index'),
    usageRoot: controlPath('usageDirectory', 'usage')
  };
}

export function acquireLibraryLock(root, operation) {
  const libraryRoot = absolutePath(root, 'Library root');
  assertNoSymlinkComponents(libraryRoot, 'Library root');
  const lockPath = join(libraryRoot, '.kahlil-aesthetic.lock');
  assertNotSymlink(lockPath, lockPath);
  let fd;
  try {
    fd = openSync(lockPath, 'wx', 0o600);
    writeFileSync(fd, `${JSON.stringify({ schemaVersion: 1, pid: process.pid, operation: String(operation || 'library-write'), createdAt: new Date().toISOString() }, null, 2)}\n`);
    fsyncSync(fd);
  } catch (error) {
    if (fd !== undefined) closeSync(fd);
    if (error?.code === 'EEXIST') throw new Error(`Library is locked by another operation: ${lockPath}`);
    throw error;
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    closeSync(fd);
    assertNotSymlink(lockPath, lockPath);
    unlinkSync(lockPath);
    syncDirectory(libraryRoot);
  };
}
