import { buildAlgebraicRepresentation } from "./algebraic.js";
import { buildGraphRepresentation } from "./graph.js";

export function deriveRepresentations(root, currentLang, i18n) {
  return {
    algebraic: buildAlgebraicRepresentation(root, currentLang, i18n),
    graph: buildGraphRepresentation(root, currentLang, i18n)
  };
}

export { buildAlgebraicRepresentation, buildGraphRepresentation };
