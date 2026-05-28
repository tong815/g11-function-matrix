import assert from "node:assert/strict";
import { initialRootForForm } from "../src/functionRegistry/index.js";
import {
  applyRootToGraphState,
  commitGraphFormParams,
  buildConversionParamsFromRoot
} from "../src/state/rootSync.js";
import { getActiveRoot, replaceActiveRoot, setRoot } from "../src/state/rootStore.js";

const topic = { id: "quadratic" };
const graphState = { paramsByAdapter: {}, activeFormByAdapter: {} };

const root = initialRootForForm("quadratic", "qStandard");
setRoot("quadratic", root);
replaceActiveRoot(root);
applyRootToGraphState(graphState, root);

const committed = commitGraphFormParams(topic, graphState, "qStandard", { a: 2, b: 0, c: -8 });
assert.ok(committed, "commitGraphFormParams should succeed");
assert.equal(committed.canonicalParams.a, 2);
assert.equal(committed.canonicalParams.c, -8);
assert.equal(graphState.paramsByAdapter.quadratic.a, 2);
assert.equal(graphState.paramsByAdapter.quadratic.c, -8);
assert.deepEqual(committed.canonicalParams, graphState.paramsByAdapter.quadratic);

const staleGraphState = { paramsByAdapter: { quadratic: { a: 99, b: 0, c: 0 } }, activeFormByAdapter: {} };
applyRootToGraphState(staleGraphState, getActiveRoot());
assert.notEqual(staleGraphState.paramsByAdapter.quadratic.a, 99, "cache should follow root, not stale draft");

replaceActiveRoot(initialRootForForm("quadratic", "qStandard"));
setRoot("quadratic", getActiveRoot());
applyRootToGraphState(graphState, getActiveRoot());

const cw = buildConversionParamsFromRoot(getActiveRoot(), "qVertex");
assert.equal(typeof cw.h, "number");
assert.equal(typeof cw.k, "number");

console.log("test-graph-commit.mjs: all passed");
