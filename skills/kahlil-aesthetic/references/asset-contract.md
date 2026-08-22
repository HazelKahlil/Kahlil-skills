# Asset contract v2

## Library layout

```text
<chosen-library-root>/
├── .kahlil-aesthetic.json
├── .kahlil-aesthetic.lock          # exists only during a library mutation
├── assets/
│   ├── <style-first-name>/
│   │   ├── manifest.json           # machine source of truth
│   │   ├── asset.md                # generated view
│   │   ├── index.html              # generated local archive view
│   │   ├── original/
│   │   ├── capture/
│   │   │   ├── page.html           # inert, escaped webpage evidence
│   │   │   └── capture.json        # capture provenance
│   │   └── derived/
│   ├── .blocked-*/                 # preserved intake failures
│   └── .staging-*/                 # uncommitted work requiring inspection
├── usage/
│   └── <project-id>/<usage-id>.json
├── .migration-backup/
└── _index/
    ├── index.html
    ├── projects.html
    ├── health.html
    └── health.json
```

All paths inside an asset or library manifest are relative and must remain inside their owner directory. The only stable cross-record identity is `assetId`, not the visible folder name.

## States

| State | Meaning |
|---|---|
| `complete` | Every kind-specific evidence gate, required analysis field, hash, local view, and provenance check passes. |
| `partial` | Useful evidence exists, but one or more required fields or captures are missing/mismatched, or partial was explicitly requested. `missing` must disclose every gap. |
| `blocked` | Unsafe input, failed validation, inaccessible source, or failed write. It must not appear as a successful indexed asset. |

No verifier, index builder, or doctor may silently convert a failure into success.

## Evidence roles and integrity

| Role | Storage | Meaning |
|---|---|---|
| `primary` | `original/` | Main reference. For `image` and `screenshot`, it must be a verified visual image. |
| `supporting` | `original/` | Additional independent evidence. |
| `capture` | `original/` | Local full-page screenshot associated with a URL capture. |
| `derived` | `derived/` | Transformation that names a non-derived `derivedFrom` evidence ID. |

Every copied file stores a SHA-256 hash, exact byte count, relative path, and verified dimensions when visual. Evidence IDs are unique within an asset. Reject symbolic links in the file or any parent component, deceptive file extensions, unsafe SVG content, path escapes, oversized files, and unsafe pixel dimensions.

`manifest.json` records the SHA-256 of `asset.md` and `index.html`. The verifier rejects modified views even if their visible marker remains. These hashes detect integrity drift; they are not a cryptographic authenticity signature against an attacker who can rewrite both the manifest and the files.

## Kind-specific completion gates

- `image` / `screenshot`: at least one readable, signature-checked visual `primary` evidence item.
- `content`: at least one `primary` evidence file. A selected conversation excerpt is a local evidence file, not raw text in the manifest.
- `url`: original public URL, `capture/page.html`, `capture/capture.json`, and a local visual `capture` screenshot. The HTML metadata and screenshot must share one `captureId`.
- Every kind: all analysis fields are explicit; `不适用` must include a reason.

## URL capture boundary

- Public `http:` and `https:` only.
- Reject embedded credentials, sensitive query/fragment fields, localhost, private/reserved addresses, and a hostname resolving to any non-public address.
- Revalidate every redirect, pin the validated address into the actual connection, and verify the connected remote address.
- Send no cookies, authorization, or browser state. Accept identity encoding only. Enforce per-request and total deadlines, redirect limits, content type, and byte bounds.
- `capture/page.html` is an inert wrapper containing escaped source response text. It has a restrictive CSP and cannot execute scripts, forms, frames, plugins, or remote resources.
- A full-page screenshot is visual evidence; `page.html` is not a screenshot and renaming HTML to an image extension never satisfies the gate.
- The presence of URL + HTML + screenshot does not mean permanent offline fidelity. Dynamic and authenticated behavior remains unknown.

## Reuse contract

Each v2 asset has:

```json
{
  "generation": {
    "preferredMode": "adaptive | material-faithful | composition-faithful",
    "referenceRequired": true,
    "referenceEvidenceIds": ["evidence-01"],
    "visualDNA": {
      "mustPreserve": [],
      "mayChange": [],
      "mustAvoid": []
    }
  }
}
```

Both faithful modes require real, verified visual reference evidence. A text-only prompt can describe material but cannot prove faithful reproduction. `prepare_reuse.mjs` returns the reference paths and hashes plus a prompt contract; if the generator does not receive those references, the result may only be described as adaptive.

## Usage lifecycle

`usage/` contains immutable Agent project-call events. Creation, manual browsing, verification, migration, indexing, and library maintenance create no usage record. A record is created when an Agent actually consults or applies an asset for a named project deliverable.

Required semantics:

- stable `assetId` and unique UUID `eventId` / `usageId`;
- `consulted` or `applied`;
- reuse mode and whether a reference was really used;
- applied dimensions, output labels, feedback, outcome, and optional score;
- payload hash for idempotency;
- same event ID + same payload returns the existing record; different payload is rejected;
- later application or feedback is a new event, preserving history.

The asset page and `_index/projects.html` are regenerated from valid records. Invalid or orphan usage remains visible in the doctor report.

## Write, failure, and recovery rules

1. Acquire `.kahlil-aesthetic.lock` with exclusive creation before naming or mutating assets/usage.
2. Write into a hidden staging directory and fsync files before atomic rename.
3. Verify hashes and generated views before committing.
4. Never overwrite an existing asset, capture bundle, usage event, or original evidence.
5. Preserve pre-commit failures as `.blocked-*` with `failure.json`; if index rebuilding fails after commit, move that asset to blocked storage.
6. Never automatically remove a lock or abandoned staging/blocked folder. `doctor.mjs` reports it for inspection.
7. Migrate v1 explicitly. Back up control manifests first and never alter evidence bytes.

## Rights and inference

Rights are `owned`, `licensed`, `public-domain`, `unknown`, or `restricted`; default is `unknown` and personal reference only. Aesthetic analysis is `推断` unless directly visible or user-supplied. Never infer authorship, typeface, licensing, interaction, or distribution permission as fact.
