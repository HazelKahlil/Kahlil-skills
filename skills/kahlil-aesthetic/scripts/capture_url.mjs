import { lookup } from 'node:dns/promises';
import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { absolutePath, atomicWrite, escapeHtml, isPublicIpAddress, parseArgs, required, sha256File, validatePublicUrl, writeJson } from './lib.mjs';

const MAX_CAPTURE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const TOTAL_CAPTURE_TIMEOUT_MS = 30_000;

export function renderInertCapturePage({ sourceUrl, finalUrl, capturedAt, sourceHtml }) {
  const safeSource = validatePublicUrl(sourceUrl);
  const safeFinal = validatePublicUrl(finalUrl);
  const timestamp = new Date(capturedAt);
  if (Number.isNaN(timestamp.getTime())) throw new Error('Capture timestamp must be a valid ISO-8601 value.');
  const escapedSource = escapeHtml(sourceHtml);
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><title>惰性网页证据</title><style>body{margin:0;padding:24px;background:#f4f3ee;color:#202825;font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}main{max-width:1100px;margin:auto}dl{display:grid;grid-template-columns:100px 1fr;gap:8px 14px}dd{margin:0;overflow-wrap:anywhere}details{margin-top:24px}pre{overflow:auto;padding:16px;background:#fff;border:1px solid #ccd0ca;white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body><main><h1>惰性网页证据</h1><p>此页面不会执行原网页脚本、表单、跳转或远程资源。</p><dl><dt>原始 URL</dt><dd>${escapeHtml(safeSource)}</dd><dt>最终 URL</dt><dd>${escapeHtml(safeFinal)}</dd><dt>捕获时间</dt><dd>${escapeHtml(timestamp.toISOString())}</dd></dl><details><summary>查看转义后的原始响应</summary><pre>${escapedSource}</pre></details></main></body></html>`;
}

export async function resolvePublicTarget(hostname, resolver = lookup) {
  if (isIP(hostname)) {
    if (!isPublicIpAddress(hostname)) throw new Error(`URL host is not a public network address: ${hostname}`);
    return { address: hostname, family: isIP(hostname) };
  }
  const addresses = await resolver(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicIpAddress(address))) {
    throw new Error(`URL host does not resolve exclusively to public network addresses: ${hostname}`);
  }
  return addresses[0];
}

export function pinnedLookup(target) {
  return (_hostname, options, callback) => options?.all
    ? callback(null, [target])
    : callback(null, target.address, target.family);
}

function withDeadline(promise, timeoutMs, message) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), Math.max(1, timeoutMs)); })
  ]).finally(() => clearTimeout(timer));
}

function requestOnce(url, target, timeoutMs) {
  const parsed = new URL(url);
  const transport = parsed.protocol === 'https:' ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const request = transport(parsed, {
      method: 'GET',
      lookup: pinnedLookup(target),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Encoding': 'identity',
        'User-Agent': 'kahlil-aesthetic/1.0 local capture'
      }
    }, (response) => {
      const remoteAddress = response.socket.remoteAddress;
      if (!remoteAddress || !isPublicIpAddress(remoteAddress.replace(/^::ffff:/, ''))) {
        response.destroy();
        reject(new Error('Capture connection reached a non-public network address.'));
        return;
      }
      const chunks = [];
      let total = 0;
      response.on('data', (chunk) => {
        total += chunk.length;
        if (total > MAX_CAPTURE_BYTES) {
          response.destroy(new Error('Captured response exceeds 5 MiB.'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => resolve({ status: response.statusCode || 0, headers: response.headers, body: Buffer.concat(chunks) }));
      response.on('error', reject);
    });
    request.setTimeout(Math.max(1, Math.min(10_000, timeoutMs)), () => request.destroy(new Error('Capture request timed out.')));
    request.on('error', reject);
    request.end();
  });
}

export async function fetchHtml(initialUrl, { resolver = lookup, timeoutMs = TOTAL_CAPTURE_TIMEOUT_MS } = {}) {
  const deadline = Date.now() + timeoutMs;
  let currentUrl = validatePublicUrl(initialUrl);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error('Capture exceeded its total time limit.');
    const hostname = new URL(currentUrl).hostname.replace(/^\[|\]$/g, '');
    const target = await withDeadline(resolvePublicTarget(hostname, resolver), remaining, 'Capture DNS resolution timed out.');
    const response = await requestOnce(currentUrl, target, deadline - Date.now());
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.location;
      if (!location) throw new Error(`Redirect without location from ${currentUrl}`);
      currentUrl = validatePublicUrl(new URL(location, currentUrl).toString());
      continue;
    }
    if (response.status < 200 || response.status >= 300) throw new Error(`Capture request returned HTTP ${response.status}.`);
    const contentEncoding = String(response.headers['content-encoding'] || 'identity').toLowerCase();
    if (contentEncoding !== 'identity') throw new Error(`Capture refused unexpected content encoding: ${contentEncoding}.`);
    const contentType = response.headers['content-type'] || '';
    if (!/^(text\/html|application\/xhtml\+xml)/i.test(contentType)) throw new Error(`Expected HTML but received ${contentType || 'an unknown content type'}.`);
    return { url: currentUrl, html: response.body.toString('utf8') };
  }
  throw new Error(`Exceeded ${MAX_REDIRECTS} redirects.`);
}

export function writeCaptureBundle(outputDirectory, { sourceUrl, finalUrl, html, capturedAt = new Date().toISOString(), captureId = randomUUID() }) {
  const output = absolutePath(outputDirectory, 'Capture output directory');
  if (existsSync(output)) throw new Error(`Refusing to overwrite existing capture bundle: ${output}`);
  const stage = join(dirname(output), `.staging-capture-${randomUUID()}`);
  mkdirSync(stage, { recursive: false });
  try {
    const pagePath = join(stage, 'page.html');
    atomicWrite(pagePath, renderInertCapturePage({ sourceUrl, finalUrl, capturedAt, sourceHtml: html }));
    writeJson(join(stage, 'capture.json'), {
      schemaVersion: 1,
      kind: 'kahlil-aesthetic-capture',
      captureId,
      sourceUrl: validatePublicUrl(sourceUrl),
      finalUrl: validatePublicUrl(finalUrl),
      capturedAt: new Date(capturedAt).toISOString(),
      mode: 'public-logged-out',
      pageSha256: sha256File(pagePath)
    });
    renameSync(stage, output);
    return { directory: output, htmlPath: join(output, 'page.html'), metadataPath: join(output, 'capture.json'), captureId };
  } catch (error) {
    try { writeJson(join(stage, 'failure.json'), { status: 'blocked', message: error.message, failedAt: new Date().toISOString() }); } catch {}
    try { renameSync(stage, join(dirname(output), `.blocked-capture-${basename(output)}-${Date.now()}`)); } catch {}
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const sourceUrl = required(args, 'url');
    const output = absolutePath(required(args, 'out'), 'Output directory');
    const result = await fetchHtml(required(args, 'url'));
    const bundle = writeCaptureBundle(output, { sourceUrl, finalUrl: result.url, html: result.html });
    console.log(`Captured inert HTML: ${bundle.htmlPath}`);
    console.log(`Capture metadata: ${bundle.metadataPath}`);
    console.log(`Capture ID: ${bundle.captureId}`);
    console.log(`Final URL: ${result.url}`);
  } catch (error) {
    console.error(`URL capture failed: ${error.message}`);
    process.exitCode = 1;
  }
}
