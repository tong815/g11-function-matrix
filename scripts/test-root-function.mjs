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

// Quadratic
const q = initialRootForForm("quadratic", "qStandard");
approx(q.canonicalParams.a, 3);
assert.equal(validateRoot(q), true);
const qGraph = toGraphData(q);
approx(qGraph.b, 4);

// Linear CW ↔ graph
const lin = initialRootForForm("linear", "lSlope");
assert.equal(lin.canonicalParams.m, 2);
const linUpdated = updateRootFromFormInput(lin, "lSlope", { m: 3, b: 1 });
approx(linUpdated.canonicalParams.m, 3);

// Exponential
const exp = initialRootForForm("exponential", "eTransformed");
assert.equal(exp.canonicalParams.b, 2);

// Merge conversion (linear)
const topic = { id: "linear" };
const merged = mergeConversionWithRoot(
  topic,
  { fromFormId: "lSlope", params: { m: 2, b: -1 } },
  { params: { m: 5, b: 0 } },
  lin
);
approx(merged.params.m, 5);

console.log("test-root-function.mjs: all passed");
