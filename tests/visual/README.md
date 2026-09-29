# Mobile Visual Regression Testing

LumenMap uses deterministic automated screenshot testing to prevent mobile layout clipping, horizontal scroll leaks, and unintended UI regressions across narrow viewports.

## Target Viewports & States

Visual snapshots are captured and verified across **3 mobile viewports**:
- `320px`: Small mobile (e.g., iPhone SE)
- `360px`: Android standard mobile
- `390px`: Standard iPhone mobile

Across **5 dashboard states**:
1. `loading`: Skeleton cards / initial data fetching
2. `loaded`: Complete dashboard with treemap, KPIs, and time-series chart
3. `selected`: Active treemap node selected displaying the DetailPanel
4. `empty`: Zero activity / empty response state
5. `error`: BigQuery provider error card state

---

## Commands

### Run Visual Tests
```bash
npm run test:visual
```
Spawns background mock server (if dev server is not already running), navigates to all 15 viewport/state combinations, asserts zero horizontal scroll overflow (`scrollWidth <= viewportWidth`), and compares pixel outputs against approved baselines in `tests/visual/baselines/`.

### Update Baselines (Intentional UI Changes)
```bash
npm run test:visual:update
```
Regenerates and overwrites approved PNG snapshots in `tests/visual/baselines/` when dashboard layout or component styles are intentionally updated.

---

## Baseline & Artifact Directory Structure

```text
tests/visual/
├── baselines/         # Approved reference snapshots committed to git
│   ├── 320px/
│   ├── 360px/
│   └── 390px/
└── diffs/             # Generated side-by-side diff artifacts (git-ignored)
    ├── 320px/
    ├── 360px/
    └── 390px/
```

---

## CI / Failure Handling

If a PR introduces visual differences exceeding 0.1% or causes horizontal clipping at 320px, 360px, or 390px:
1. `npm run test:visual` fails with non-zero exit code.
2. Side-by-side PNG diff artifacts are generated under `tests/visual/diffs/{width}px/{state}-diff.png`.
3. If the visual change is intentional, run `npm run test:visual:update` and commit the updated baselines.

---

## Flow visual baseline

Spec: `e2e/flow-visual.spec.ts` (Playwright `toHaveScreenshot`, runs as part of `npm run test:e2e` in the `e2e` CI workflow).

- Captures the Flow fixture view at **1280x800** (desktop) and **390x844** (mobile).
- Deterministic: fixture data (`LUMENMAP_DATA_SOURCE=fixture`), network isolated, `animations: "disabled"`, `contextOptions.reducedMotion: "reduce"`, fixed viewport/locale/timezone, volatile regions (freshness timestamps, `<time>`, `[data-volatile]`) masked.
- The Flow view is located via `data-testid="flow-view"`, opened at `/?view=flow` (override with `FLOW_VISUAL_PATH=/some/path`).
- **Until the Flow MVP (#287) renders `data-testid="flow-view"`, the tests skip** with an explicit message. Once the element exists and baselines are committed, any diff above 0.1% of pixels fails CI. With the element present but no baseline committed, Playwright fails with "snapshot doesn't exist" (and writes the actual image), so baselines must be added in the same PR that lands the Flow view.

Baselines live next to the spec in `e2e/flow-visual.spec.ts-snapshots/` and are platform-suffixed (e.g. `flow-desktop-1280-chromium-linux.png`).

### Generating / updating baselines

Font rendering differs between macOS and Linux, so baselines **must be generated in the same environment as CI** (Ubuntu). Use the Playwright Docker image matching the installed `@playwright/test` version:

```bash
docker run --rm --ipc=host -v "$PWD":/work -w /work \
  mcr.microsoft.com/playwright:v$(node -p "require('@playwright/test/package.json').version")-jammy \
  bash -c "npm ci && npm run build && npx playwright test e2e/flow-visual.spec.ts --update-snapshots"
```

Then commit the `*-linux.png` files. On a Linux host matching CI you can run directly:

```bash
npx playwright test e2e/flow-visual.spec.ts --update-snapshots
```

Running locally on macOS produces `*-darwin.png` files; do not commit them.

### Verifying the guard

1. With baselines committed, add an intentional break, e.g. in `app/globals.css`:
   ```css
   [data-testid="flow-view"] { padding-left: 40px !important; }
   ```
2. Run `npx playwright test e2e/flow-visual.spec.ts` (inside the Docker image above) — it must fail and write expected/actual/diff images to `test-results/`.
3. Revert the CSS change; the spec passes again.
