import assert from "node:assert/strict";
import { initialRootForForm } from "../src/functionRegistry/index.js";
import { deriveRepresentationsForRoot } from "../src/functionRegistry/index.js";

const root = initialRootForForm("quadratic", "qStandard");
const rep = deriveRepresentationsForRoot(root, "en", {
  en: { noRealFactored: "No real factored form" },
  zh: { noRealFactored: "无实数因式分解" }
});

assert.ok(rep.algebraic.forms.qStandard.equationText.includes("x²"));
assert.ok(rep.algebraic.forms.qVertex.equationText.includes("x"));
assert.equal(rep.graph.valid, true);
assert.equal(rep.graph.adapterParams.a, 1);

const lin = initialRootForForm("linear", "lSlope");
const linRep = deriveRepresentationsForRoot(lin, "en", { en: {}, zh: {} });
assert.equal(linRep.algebraic.forms.lSlope.equationText, "y = x");

console.log("test-representations.mjs: all passed");
