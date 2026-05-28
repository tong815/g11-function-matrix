import assert from "node:assert/strict";
import { initialRootForForm, updateRootFromFormInput } from "../src/functionRegistry/index.js";
import {
  applyRootToGraphState,
  buildConversionParamsFromRoot,
  commitGraphFormParams
} from "../src/state/rootSync.js";
import { getActiveRoot, replaceActiveRoot, setRoot } from "../src/state/rootStore.js";

const topic = { id: "quadratic" };
const graphState = { paramsByAdapter: {}, activeFormByAdapter: {} };

let root = initialRootForForm("quadratic", "qStandard");
setRoot("quadratic", root);
replaceActiveRoot(root);
applyRootToGraphState(graphState, root);

const draftCache = { a: 99, b: 1, c: 1 };
graphState.paramsByAdapter.quadratic = draftCache;
assert.equal(getActiveRoot().canonicalParams.a, 1, "draft cache must not change root before commit");

const committed = commitGraphFormParams(topic, graphState, "qStandard", { a: 2, b: 0, c: -8 });
assert.ok(committed);
assert.equal(getActiveRoot().canonicalParams.a, 2);
assert.equal(graphState.paramsByAdapter.quadratic.a, 2);
assert.notEqual(graphState.paramsByAdapter.quadratic.a, 99);

root = updateRootFromFormInput(getActiveRoot(), "qStandard", { a: 2, b: 0, c: -8 });
applyRootToGraphState(graphState, root);
replaceActiveRoot(root);

assert.equal(graphState.paramsByAdapter.quadratic.a, 2);
assert.equal(graphState.paramsByAdapter.quadratic.c, -8);

const cw = buildConversionParamsFromRoot(root, "qVertex");
assert.equal(cw.a, 2);

const switched = updateRootFromFormInput(root, "qVertex", buildConversionParamsFromRoot(root, "qVertex"));
assert.equal(switched.activeForm, "qVertex");
assert.equal(switched.canonicalParams.a, 2, "form switch must not reset canonical");

console.log("test-sync-flow.mjs: all passed");
