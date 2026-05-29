import assert from "node:assert/strict";
import { createCoordMapper, buildPannedViewport, viewportWithSampleStep } from "../src/graph/viewport.js";
import { layoutGraphAnnotations } from "../src/graph/annotationLayout.js";

const mockCtx = {
  font: "",
  measureText(text) {
    return { width: text.length * 6.5 };
  }
};

function getAnnStyle() {
  return { font: "11px Segoe UI", color: "#000", lineWidth: 1, dash: [], radius: 5 };
}

function labelRects(laidOut) {
  return laidOut
    .filter((a) => a.labelPos)
    .map((a) => ({
      x: a.labelPos.x,
      y: a.labelPos.y - 13,
      w: a.label.length * 6.5,
      h: 13
    }));
}

function overlaps(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

const bounds = viewportWithSampleStep(buildPannedViewport({ baseXSpan: 20, baseYSpan: 20 }));
const mapper = createCoordMapper({ ...bounds, kind: "bounds" }, 560, 360);

const annotations = [
  { type: "point", x: 0, y: 0, label: "(0,0)", strength: "direct", target: "yint" },
  { type: "verticalLine", x: 0, label: "x=h≈0", strength: "direct", target: "axis" },
  { type: "point", x: 1, y: 1, label: "V(1,1)", strength: "focus", target: "vertex" },
  { type: "slopeTriangle", x0: 0, y0: 0, m: 1, strength: "direct", target: "slope" }
];

const laidOut = layoutGraphAnnotations(mockCtx, annotations, mapper, 560, 360, getAnnStyle);
assert.equal(laidOut.length, 4);

const rects = labelRects(laidOut.filter((a) => a.type !== "slopeTriangle"));
for (let i = 0; i < rects.length; i++) {
  for (let j = i + 1; j < rects.length; j++) {
    assert.ok(!overlaps(rects[i], rects[j]), `labels ${i} and ${j} should not overlap`);
  }
}

const axis = laidOut.find((a) => a.type === "verticalLine");
assert.ok(axis.labelPos.y >= 20, "axis label should sit below y-axis title");

const slope = laidOut.find((a) => a.type === "slopeTriangle");
assert.ok(slope.runLabelPos);
assert.ok(slope.riseLabelPos);
assert.ok(
  !overlaps(
    { x: slope.runLabelPos.x, y: slope.runLabelPos.y - 13, w: 20, h: 13 },
    { x: slope.riseLabelPos.x, y: slope.riseLabelPos.y - 13, w: 30, h: 13 }
  ),
  "slope run/rise labels should not overlap"
);

console.log("test-annotation-layout.mjs: all passed");
