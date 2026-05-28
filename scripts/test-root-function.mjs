import assert from "node:assert/strict";
import {
  initialRootForForm,
  updateRootFromFormInput,
  validateRoot
} from "../src/functionRegistry/index.js";
import { mergeConversionWithRoot } from "../src/state/rootSync.js";
import {
  getRoot,
  setActiveFunctionType,
  replaceActiveRoot,
  setRoot
} from "../src/state/rootStore.js";

function approx(a, b, eps = 1e-9) {
  assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
}

const q = initialRootForForm("quadratic", "qStandard");
approx(q.canonicalParams.a, 1);
approx(q.canonicalParams.b, 0);
approx(q.canonicalParams.c, 0);
assert.equal(validateRoot(q), true);

const lin = initialRootForForm("linear", "lPoint");
approx(lin.canonicalParams.m, 1);
approx(lin.canonicalParams.b, 0);
assert.equal(lin.canonicalParams.x1, undefined);

const exp = initialRootForForm("exponential", "eTransformed");
assert.equal(exp.canonicalParams.b, 2);

setActiveFunctionType("linear");
setRoot("linear", lin);
replaceActiveRoot(lin);

const merged = mergeConversionWithRoot(
  { id: "linear" },
  { fromFormId: "lPoint", params: { m: 1, x1: 0, y1: 0 } },
  { params: { m: 5, x1: 0, y1: 0 } },
  getRoot("linear")
);
approx(merged.params.m, 5);
approx(merged.root.canonicalParams.b, 0);

console.log("test-root-function.mjs: all passed");
