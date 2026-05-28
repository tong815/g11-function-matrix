import assert from "node:assert/strict";

/** Ensures the browser import graph loads without circular-init failures. */
const { graphAdapterRegistry } = await import("../src/graph/graphAdapterRegistry.js");
assert.ok(graphAdapterRegistry.quadratic?.id === "quadratic", "quadratic adapter must load");
assert.ok(graphAdapterRegistry.linear?.id === "linear", "linear adapter must load");
assert.ok(graphAdapterRegistry.exponential?.id === "exponential", "exponential adapter must load");

const { getActiveRoot } = await import("../src/state/rootStore.js");
const root = getActiveRoot();
assert.ok(root?.canonicalParams, "active root must exist at init");
assert.equal(root.functionType, "quadratic");

const { buildConversionParamsFromRoot } = await import("../src/state/rootSync.js");
const params = buildConversionParamsFromRoot(root, "qStandard");
assert.equal(typeof params.a, "number");

console.log("test-app-init.mjs: all passed");
