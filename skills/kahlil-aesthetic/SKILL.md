---
name: kahlil-aesthetic
description: Use only when Kahlil explicitly says `kahlil-aesthetic`, `审美资产入库`, `审美入库`, or `视觉资产入库`; do not use for a bare link, ordinary `入库`, knowledge notes, or generic Obsidian intake.
---

# Kahlil Aesthetic

Turn visuals Kahlil has already selected as good into durable local aesthetic evidence. Preserve the evidence first, record the judgment second, and learn from later project use. This Skill does not decide whether the input is good and does not perform an automatic taste regression at intake.

## Read first

Read `references/asset-contract.md` and `references/draft.schema.json`. Use the scripts in this Skill by absolute path. Never copy scripts, configuration, user paths, or user media into the Skill itself.

## Trigger boundary

- Trigger only on one of the four explicit phrases in the description.
- A bare URL, generic `入库`, or knowledge note remains in `obsidian-ingest`; never modify that Skill.
- One image, screenshot, URL, or selected content/conversation excerpt is the minimum asset.
- A content asset may hold several independently hashed evidence images.
- The user has already curated the input. Do not ask why they like it and do not re-run a formal preference test during intake.

## First use and migration

Ask for a local library root only when no external config exists. Obsidian is optional.

```bash
node <SKILL_ROOT>/scripts/configure.mjs --library "/absolute/library/path"
```

Configuration lives at the user-local config path, outside this Skill. A schema-v1 library must be explicitly migrated; do not edit it ad hoc:

```bash
node <SKILL_ROOT>/scripts/migrate_library.mjs --library "/absolute/library/path"
```

The migration backs up control manifests and must report zero changed evidence files.

## Intake workflow

1. **Inspect.** Identify `image`, `screenshot`, `url`, or `content`. Name it style-first: `风格描述_主体或来源`.
2. **Preserve.** Keep every original in `original/`. Never substitute a generated image, crop, cleaned image, or inferred diagram for real evidence.
3. **Capture a public URL.** Save the original URL. Capture inert HTML without cookies or login state:

   ```bash
   node <SKILL_ROOT>/scripts/capture_url.mjs --url "https://public.example/..." --out "/absolute/temporary/capture-bundle"
   ```

   The bundle contains `page.html`, `capture.json`, and a `captureId`. Capture a local full-page screenshot in the same logged-out capture operation and put that same `captureId` on the screenshot evidence in the draft. URL completeness requires the original URL, inert HTML, screenshot, matching capture IDs, and passing hashes. Any missing or mismatched component is `partial`.
4. **Analyze.** Complete overall judgment, tags, composition/negative space, palette, typography, material, motion/interaction, reusable rules, avoid-list, source, and rights. Label AI readings as `推断`; do not turn uncertain typefaces, authorship, rights, or interaction into facts. Use `不适用` plus a reason where appropriate.
5. **Define reuse behavior.** Add `generation.preferredMode`, reference requirements, reference evidence IDs, and `visualDNA` when the asset has important material or composition characteristics. See “Reuse modes.”
6. **Create.** Write a temporary draft matching `references/draft.schema.json` and run:

   ```bash
   node <SKILL_ROOT>/scripts/create_asset.mjs --draft "/absolute/draft.json"
   ```

7. **Verify.** Run:

   ```bash
   node <SKILL_ROOT>/scripts/verify_asset.mjs --asset "/absolute/asset/path"
   ```

   Never report success after a failed verification. A failed staged intake remains visible as `.blocked-*` with `failure.json`.
8. **Handoff.** Do not open a browser automatically. Capture and show exactly one screenshot of the generated local asset page. State `complete`, `partial`, or `blocked` and list any missing requirements.

## Reuse modes

- `adaptive`: transfer the asset’s visual DNA to new content. A reference image is optional; do not claim close replication.
- `material-faithful`: preserve grain shape, edge behavior, density, surface, and color relationships. A real stored reference image is required.
- `composition-faithful`: preserve hierarchy, visual center, negative-space ratio, scale, and direction. A real stored reference image is required.

Text-only prompts are semantic instructions, not pixel or material evidence. If a faithful mode is requested but the generator did not actually receive the reference image, downgrade the claim to `adaptive` or stop; never pretend it copied the asset faithfully.

For a concrete project, create a usage event and prepare the reuse package together:

```bash
node <SKILL_ROOT>/scripts/prepare_reuse.mjs \
  --library "/absolute/library/path" \
  --asset "/absolute/asset/path" \
  --mode "material-faithful" \
  --event "/absolute/usage-event.json" \
  --out "/absolute/reuse-package.json"
```

The package returns real local reference paths, SHA-256 hashes, must-preserve rules, allowed changes, and avoid rules.

## Project usage lifecycle

Create a usage record only when an Agent actually reads or references an asset for a named project and deliverable. Do not record manual browsing, library maintenance, verification, or merely opening `index.html`.

- Before returning an asset-derived prompt, reference, or decision for a project, record at least `consulted`.
- Use `applied` when the asset is actually used in a deliverable.
- Record mode, whether the reference was really supplied, applied dimensions, outputs, feedback, outcome, and optional 0–100 score.
- Later feedback is a new immutable event with a new `eventId`; never overwrite the earlier call.
- Reusing the same `eventId` with identical content is idempotent. Reusing it with different content is rejected.

Direct recording command:

```bash
node <SKILL_ROOT>/scripts/record_usage.mjs --event "/absolute/usage-event.json"
```

Usage lives centrally under `usage/`, is rendered back onto the asset page, and is summarized in `_index/projects.html`.

## Evidence, privacy, and rights

- Original evidence always goes to `original/`; derived crops, masks, cutouts, palettes, and transparent PNGs go to `derived/` and must name `derivedFrom`.
- Do not automatically cut out white backgrounds. Do it only on explicit request or a concrete reuse need, while preserving the full original.
- A conversation source must be a deliberately selected local excerpt file preserved as evidence. Never put a raw full conversation into `manifest.json` or the HTML page.
- Reject symbolic links, path escapes, invalid image signatures, unsafe SVG, oversized evidence, embedded URL credentials, sensitive URL parameters, private/reserved network targets, and authenticated capture.
- Rights default to `unknown` and personal reference only. Do not imply redistribution rights.
- Asset pages load no remote images or JavaScript, never iframe captured HTML, and never execute captured scripts.

## Naming, collisions, and writes

- Use `风格描述_主体或来源`, without a visible date.
- Let the script append `-02`, `-03`, and so on. Never overwrite an existing asset.
- Library mutations use a visible exclusive lock, temporary staging, file fsync, verification, and atomic rename. Never auto-delete a stale lock, `.staging-*`, or `.blocked-*`; inspect it with the doctor first.

## Health and verification

```bash
node <SKILL_ROOT>/scripts/doctor.mjs
node --test <SKILL_ROOT>/tests/*.test.mjs
```

The doctor writes `_index/health.json` and `health.html`, exposing stale locks, staging remnants, blocked assets, invalid assets, invalid usage, and orphan usage instead of silently hiding them. Before installation or packaging, run the full tests, one real local visual smoke test, and the `skill-vetter` protocol.
