import assert from "node:assert/strict";
import {
  initialRootForForm,
  updateRootFromFormInput,
  validateRoot,
  deriveFeaturesForRoot
} from "../src/functionRegistry/index.js";
import { buildConversionParamsFromRoot } from "../src/state/rootSync.js";
import { quadraticDefinition } from "../src/functionRegistry/quadratic.js";

function approx(a, b, eps = 1e-9) {
  assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
}

const i18nStub = { en: { noRealFactored: "no" }, zh: {} };

const s0 = initialRootForForm("quadratic", "qStandard");
approx(s0.canonicalParams.a, 1);
approx(s0.canonicalParams.b, 0);
approx(s0.canonicalParams.c, 0);
const d0 = deriveFeaturesForRoot(s0, "en", i18nStub);
assert.equal(d0.hasRealRoots, true);

const v0 = initialRootForForm("quadratic", "qVertex");
const dv0 = deriveFeaturesForRoot(v0, "en", i18nStub);
approx(dv0.h, 0);
approx(dv0.k, 0);

const f0 = initialRootForForm("quadratic", "qFactored");
const df0 = deriveFeaturesForRoot(f0, "en", i18nStub);
approx(df0.r1, 0);
approx(df0.r2, 0);

let root = updateRootFromFormInput(
  initialRootForForm("quadratic", "qStandard"),
  "qVertex",
  { a: 1, h: 2, k: -4 }
);
const dv = deriveFeaturesForRoot(root, "en", i18nStub);
approx(dv.h, 2);

root = updateRootFromFormInput(root, "qFactored", { a: 1, r1: 1, r2: 5 });
approx(root.canonicalParams.b, -6);
approx(root.canonicalParams.c, 5);

const cwParams = buildConversionParamsFromRoot(root, "qStandard");
approx(cwParams.b, -6);

const neg = updateRootFromFormInput(
  initialRootForForm("quadratic", "qStandard"),
  "qStandard",
  { a: 1, b: 0, c: 1 }
);
const dNeg = deriveFeaturesForRoot(neg, "en", i18nStub);
assert.equal(dNeg.hasRealRoots, false);

const flatNorm = quadraticDefinition.normalizeFromForm("qStandard", { a: 0, b: 1, c: 2 });
assert.equal(flatNorm.valid, false);

console.log("test-root-quadratic.mjs: all passed");
