import assert from "node:assert/strict";
import {
  initialRootForForm,
  paramsForForm,
  toGraphData,
  validateRoot,
  equationForForm,
  updateRootFromFormInput
} from "../src/functionRegistry/index.js";
import { mergeConversionWithRoot } from "../src/state/rootSync.js";

function approx(a, b, eps = 1e-9) {
  assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
}

// Quadratic y = x²
const q = initialRootForForm("quadratic", "qStandard");
approx(q.canonicalParams.a, 1);
approx(q.canonicalParams.b, 0);
approx(q.canonicalParams.c, 0);
assert.equal(validateRoot(q), true);

// Linear point-slope default m=1, (0,0)
const lin = initialRootForForm("linear", "lPoint");
assert.equal(lin.canonicalParams.m, 1);
assert.equal(lin.canonicalParams.point[0], 0);
assert.equal(lin.canonicalParams.point[1], 0);
const linUpdated = updateRootFromFormInput(lin, "lSlope", { m: 3, b: 1 });
approx(linUpdated.canonicalParams.m, 3);

// Exponential
const exp = initialRootForForm("exponential", "eTransformed");
assert.equal(exp.canonicalParams.b, 2);

// Merge conversion (linear)
const topic = { id: "linear" };
const merged = mergeConversionWithRoot(
  topic,
  { fromFormId: "lPoint", params: { m: 1, x1: 0, y1: 0 } },
  { params: { m: 5, x1: 0, y1: 0 } },
  lin
);
approx(merged.params.m, 5);

console.log("test-root-function.mjs: all passed");
