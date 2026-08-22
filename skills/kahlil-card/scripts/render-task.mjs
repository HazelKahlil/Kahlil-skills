#!/usr/bin/env node
/**
 * 将任务 index.html 中所有 .poster 渲成 PNG。
 * 默认输出目录：输出/<H时MM分>/（每次渲染新建时间戳子目录）；可用 --out 覆盖。
 * 同时维护 输出/最近 → 本次时间戳目录 的软链，方便取最新成图。
 * 文件名：优先保留中文 id；常见英文 id 映射为中文。
 * Playwright 从 kahlil-card skill 根解析（本文件可被拷到任务目录当 render.mjs）。
 */
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_OUT_CN = "输出";
const LATEST_LINK = "最近";

/** 本地时间戳目录名：16时06分（不补零小时也可，统一两位数便于排序） */
function stampDirName(d = new Date()) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${Number(h)}时${m}分`;
}

/** 常见英文 poster id → 中文文件名（不含扩展名） */
const ID_TO_CN = {
  "card-01": "卡片-01",
  "card-02": "卡片-02",
  "card-03": "卡片-03",
  "card-04": "卡片-04",
  "card-05": "卡片-05",
  "card-06": "卡片-06",
  "card-07": "卡片-07",
  "card-08": "卡片-08",
  "card-09": "卡片-09",
  "card-10": "卡片-10",
  "card-11": "卡片-11",
  "card-12": "卡片-12",
  "card-s01": "卡片-S01",
  "card-s02": "卡片-S02",
  "card-s03": "卡片-S03",
  "card-s04": "卡片-S04",
  "card-s05": "卡片-S05",
  "card-s06": "卡片-S06",
  "card-s07": "卡片-S07",
  "card-s08": "卡片-S08",
  "card-s09": "卡片-S09",
  "card-s10": "卡片-S10",
  "card-s11": "卡片-S11",
  "card-s12": "卡片-S12",
  "poster-01": "卡片-01",
  "poster-02": "卡片-02",
  "poster-03": "卡片-03",
  "poster-04": "卡片-04",
  "poster-05": "卡片-05",
  "poster-06": "卡片-06",
  "xhs-01": "小红书-01",
  "xhs-02": "小红书-02",
  "xhs-03": "小红书-03",
  "xhs-04": "小红书-04",
  "xhs-05": "小红书-05",
  "xhs-06": "小红书-06",
  "wechat-21x9": "微信-21x9",
  "wechat-1x1": "微信-1x1",
  "wechat-pair-preview": "微信-对预览",
  "s01-final": "S01-最终版",
  "cover": "封面",
};

function looksLikeSkillRoot(dir) {
  return (
    fs.existsSync(path.join(dir, "assets/template-kahlil-card.html")) &&
    fs.existsSync(path.join(dir, "assets/fonts"))
  );
}

function resolveSkillRoot() {
  if (process.env.KAHLIL_CARD_SKILL && looksLikeSkillRoot(process.env.KAHLIL_CARD_SKILL)) {
    return path.resolve(process.env.KAHLIL_CARD_SKILL);
  }

  const fromScripts = path.resolve(__dirname, "..");
  if (looksLikeSkillRoot(fromScripts)) return fromScripts;

  const fontsLink = path.resolve(process.cwd(), "assets/fonts");
  try {
    if (fs.existsSync(fontsLink)) {
      const realFonts = fs.realpathSync(fontsLink);
      const candidate = path.resolve(realFonts, "..");
      if (looksLikeSkillRoot(candidate)) return candidate;
    }
  } catch {
    /* ignore */
  }

  const home = process.env.HOME || "";
  const candidates = [
    path.join(home, ".newmax/skills/kahlil-card"),
    path.join(home, ".claude/skills/kahlil-card"),
    path.join(home, ".agents/skills/kahlil-card"),
    path.join(home, ".codex/skills/kahlil-card"),
  ];
  for (const c of candidates) {
    try {
      const real = fs.existsSync(c) ? fs.realpathSync(c) : c;
      if (looksLikeSkillRoot(real)) return real;
    } catch {
      /* ignore */
    }
  }

  throw new Error(
    "无法解析 kahlil-card skill 根目录。请设置 KAHLIL_CARD_SKILL 或从 skill/scripts 运行。"
  );
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

function resolveOutDir(cwd, outRel, { stamp = true } = {}) {
  if (outRel) return path.resolve(cwd, outRel);
  const cn = path.join(cwd, DEFAULT_OUT_CN);
  const en = path.join(cwd, "output");
  // 根：优先中文 输出/；若只有旧 output 且不是指向 输出 的 symlink，仍可用
  let root = cn;
  if (!fs.existsSync(cn) && fs.existsSync(en)) root = en;
  if (!stamp) return root;
  // 默认每次渲染写入 输出/<H时MM分>/；若撞名则追加 -2、-3…
  let stampName = stampDirName();
  let candidate = path.join(root, stampName);
  let n = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(root, `${stampName}-${n}`);
    n += 1;
  }
  return candidate;
}

function linkLatest(outDir) {
  // outDir = …/输出/16时06分 → 在 输出/ 下维护 最近 → 16时06分
  const parent = path.dirname(outDir);
  const base = path.basename(outDir);
  if (path.basename(parent) !== DEFAULT_OUT_CN && path.basename(parent) !== "output") {
    return;
  }
  const linkPath = path.join(parent, LATEST_LINK);
  try {
    // lstat：含断链；force 删除避免 EEXIST
    fs.lstatSync(linkPath);
    fs.rmSync(linkPath, { force: true });
  } catch {
    /* 不存在即可 */
  }
  try {
    fs.symlinkSync(base, linkPath);
  } catch {
    /* ignore */
  }
}

function fileBaseFromId(id, index) {
  if (!id) return `卡片-${String(index + 1).padStart(2, "0")}`;
  const key = id.toLowerCase();
  if (ID_TO_CN[key]) return ID_TO_CN[key];
  // card-01 / poster-01 等模式
  let m = key.match(/^card-(\d+)$/);
  if (m) return `卡片-${m[1].padStart(2, "0")}`;
  m = key.match(/^poster-(\d+)$/);
  if (m) return `卡片-${m[1].padStart(2, "0")}`;
  m = key.match(/^xhs-(\d+)$/);
  if (m) return `小红书-${m[1].padStart(2, "0")}`;
  m = key.match(/^card-s(\d+)$/);
  if (m) return `卡片-S${m[1].padStart(2, "0")}`;
  // 已是中文或自定义：清洗文件名非法字符
  return id.replace(/[\/\\:*?"<>|]/g, "-").trim() || `卡片-${String(index + 1).padStart(2, "0")}`;
}

async function loadPlaywright(skillRoot) {
  const candidates = [
    path.join(skillRoot, "node_modules/playwright/index.mjs"),
    path.join(skillRoot, "node_modules/playwright/index.js"),
    path.join(process.cwd(), "node_modules/playwright/index.mjs"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return import(pathToFileURL(p).href);
    }
  }
  return import("playwright");
}

const skillRoot = resolveSkillRoot();
const { chromium } = await loadPlaywright(skillRoot);

const htmlRel = arg("--html", "index.html");
const outArg = arg("--out", null);
// --flat-out：直接写到 输出/ 根（旧行为）；默认写 输出/<时间戳>/
const flatOut = process.argv.includes("--flat-out");
const cwd = process.cwd();
const htmlPath = path.resolve(cwd, htmlRel);
const outDir = resolveOutDir(cwd, outArg, { stamp: !flatOut && !outArg });

if (!fs.existsSync(htmlPath)) {
  console.error("缺少 html:", htmlPath);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

// 兼容旧路径：确保 output -> 输出（若 输出 存在且 output 不存在）
const outEn = path.join(cwd, "output");
const outCn = path.join(cwd, DEFAULT_OUT_CN);
if (!fs.existsSync(outEn) && (fs.existsSync(outCn) || outDir.startsWith(outCn + path.sep))) {
  try {
    fs.mkdirSync(outCn, { recursive: true });
    fs.symlinkSync(DEFAULT_OUT_CN, outEn);
  } catch {
    /* ignore */
  }
}

// 维护 输出/最近 → 本次时间戳目录
if (!flatOut && !outArg) {
  linkLatest(outDir);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1400, height: 1800 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle", timeout: 120000 });
await page.evaluate(async () => {
  if (document.fonts?.ready) await document.fonts.ready;
});
await page.waitForTimeout(250);

const posters = page.locator(".poster");
const n = await posters.count();
if (!n) {
  console.error("未找到 .poster");
  await browser.close();
  process.exit(2);
}

for (let i = 0; i < n; i++) {
  const el = posters.nth(i);
  const id = (await el.getAttribute("id")) || `poster-${String(i + 1).padStart(2, "0")}`;
  const base = fileBaseFromId(id, i);
  const box = await el.boundingBox();
  if (!box) continue;
  const file = path.join(outDir, `${base}.png`);
  await el.screenshot({ path: file, type: "png" });
  console.log("已写出", file, `${Math.round(box.width)}x${Math.round(box.height)}`);
}

const fontInfo = await page.evaluate(async () => {
  const out = {
    futura: document.fonts.check('16px "Local Futura"'),
    canela: document.fonts.check('16px "Local Canela"'),
    ruizi: document.fonts.check('16px "S01 Ruizi Xianxi"'),
  };
  const latin = document.querySelector(".latin-en");
  if (latin) out.latinFF = getComputedStyle(latin).fontFamily;
  const cn = document.querySelector(".cn");
  if (cn) out.cnFF = getComputedStyle(cn).fontFamily;
  const chrome = document.querySelector(".chrome-min");
  if (chrome) out.chromeText = chrome.innerText.replace(/\s+/g, " ").trim();
  const html = document.documentElement;
  out.accent = html.getAttribute("data-accent");
  out.enClass = html.className;
  return out;
});
console.log("skillRoot", skillRoot);
console.log("fonts", JSON.stringify(fontInfo));
await browser.close();
console.log("完成 →", outDir);
