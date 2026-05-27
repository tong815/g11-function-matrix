import { quadraticGraphAdapter } from "./quadraticGraphAdapter.js";
import { linearGraphAdapter } from "./linearGraphAdapter.js";
import { exponentialGraphAdapter } from "./exponentialGraphAdapter.js";

export const graphAdapterRegistry = {
  quadratic: quadraticGraphAdapter,
  linear: linearGraphAdapter,
  exponential: exponentialGraphAdapter
};

export function getGraphAdapter(adapterId) {
  return graphAdapterRegistry[adapterId];
}
