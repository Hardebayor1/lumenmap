/**
 * Stable `/methodology` anchor ids for the payment-flow graph section.
 *
 * The Flow view legend and coverage badge link to these anchors, so the ids
 * are part of the public URL surface: do not rename them without keeping a
 * redirect-compatible alias.
 */
export const FLOW_METHODOLOGY_ANCHORS = {
  flow: "flow",
  nodes: "flow-nodes",
  edges: "flow-edges",
  sampling: "flow-sampling",
  assetModes: "flow-asset-modes",
} as const;

export type FlowMethodologyAnchor =
  (typeof FLOW_METHODOLOGY_ANCHORS)[keyof typeof FLOW_METHODOLOGY_ANCHORS];

/** In-app href for a payment-flow methodology anchor. */
export function flowMethodologyHref(anchor: FlowMethodologyAnchor): string {
  return `/methodology#${anchor}`;
}
