import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  FLOW_METHODOLOGY_ANCHORS,
  flowMethodologyHref,
} from "./flow-methodology-anchors";
import { METHODOLOGY_SECTIONS } from "./methodology";

const ids = Object.values(FLOW_METHODOLOGY_ANCHORS);
const pageSource = readFileSync(
  join(process.cwd(), "app/methodology/page.tsx"),
  "utf8",
);

describe("flow methodology anchors", () => {
  it("are unique and do not collide with metric sections", () => {
    assert.equal(new Set(ids).size, ids.length);
    const metricIds = new Set<string>(METHODOLOGY_SECTIONS.map((section) => section.id));
    for (const id of ids) assert.equal(metricIds.has(id), false, id);
  });

  it("are valid fragment ids", () => {
    for (const id of ids) assert.match(id, /^[a-z][a-z0-9-]*$/);
  });

  it("are rendered as ids by the methodology page", () => {
    assert.match(pageSource, /FLOW_METHODOLOGY_ANCHORS/);
    for (const key of Object.keys(FLOW_METHODOLOGY_ANCHORS)) {
      assert.match(
        pageSource,
        new RegExp(`id=\\{FLOW_METHODOLOGY_ANCHORS\\.${key}\\}`),
        key,
      );
    }
  });

  it("builds in-app hrefs", () => {
    assert.equal(
      flowMethodologyHref(FLOW_METHODOLOGY_ANCHORS.sampling),
      "/methodology#flow-sampling",
    );
  });
});
