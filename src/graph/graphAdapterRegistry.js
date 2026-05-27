import { quadraticGraphAdapter } from "./quadraticGraphAdapter.js";
import { linearGraphAdapter } from "./linearGraphAdapter.js";

export const graphAdapterRegistry = {
  quadratic: quadraticGraphAdapter,
  linear: linearGraphAdapter
};

export function getGraphAdapter(adapterId) {
  return graphAdapterRegistry[adapterId];
}
