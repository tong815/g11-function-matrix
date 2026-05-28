import assert from "node:assert/strict";
import { initialRootForForm, updateRootFromFormInput } from "../src/functionRegistry/index.js";
import { applyRootToGraphState, buildConversionParamsFromRoot } from "../src/state/rootSync.js";

const graphState = { paramsByAdapter: {}, activeFormByAdapter: {} };

let root = initialRootForForm("quadratic", "qStandard");
root = updateRootFromFormInput(root, "qStandard", { a: 2, b: 0, c: -8 });
applyRootToGraphState(graphState, root);

assert.equal(graphState.paramsByAdapter.quadratic.a, 2);
assert.equal(graphState.paramsByAdapter.quadratic.c, -8);

const cw = buildConversionParamsFromRoot(root, "qVertex");
assert.equal(cw.a, 2);

console.log("test-sync-flow.mjs: all passed");
