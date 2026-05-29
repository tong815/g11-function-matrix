import assert from "node:assert/strict";
import {
  buildPannedViewport,
  createCoordMapper,
  viewportWithSampleStep
} from "../src/graph/viewport.js";

function unitPixelScale(mapper, x0, y0) {
  const dx = mapper.toCanvasX(x0 + 1) - mapper.toCanvasX(x0);
  const dy = mapper.toCanvasY(y0) - mapper.toCanvasY(y0 + 1);
  return { dx, dy };
}

const bounds = viewportWithSampleStep(
  buildPannedViewport({ baseXSpan: 20, baseYSpan: 20, preferredOriginCentered: true })
);
const desktop = createCoordMapper({ ...bounds, kind: "bounds" }, 560, 360);
const { dx, dy } = unitPixelScale(desktop, 0, 0);

assert.equal(dx, dy, "x and y unit length must match in pixels");
assert.equal(dx, 18, "560×360 with span 20 → 18 px per unit");

const mobile = createCoordMapper({ ...bounds, kind: "bounds" }, 560, 280);
const mobileUnits = unitPixelScale(mobile, 0, 0);
assert.equal(mobileUnits.dx, mobileUnits.dy);
assert.equal(mobileUnits.dx, 14, "560×280 with span 20 → 14 px per unit");

console.log("test-viewport-aspect.mjs: all passed");
