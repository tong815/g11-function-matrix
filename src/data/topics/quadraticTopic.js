import { quadraticMatrix } from "../matrices.js";
import { detailLibrary } from "../details.js";
import { formulaCards, problemRouterData } from "../formulas.js";
import { transformationRules, flowContent } from "../transformationRules.js";
import { buildRepresentations } from "../representations.js";
import { quadraticGraphAdapter } from "../../graph/quadraticGraphAdapter.js";

const formulas = formulaCards.filter((card) => card.group === "quadratic");
const rules = transformationRules.filter((rule) => rule.topic === "quadratic");
const topicFlowContent = Object.fromEntries(
  rules
    .filter((rule) => flowContent[rule.id])
    .map((rule) => [rule.id, flowContent[rule.id]])
);

export const quadraticTopic = {
  id: "quadratic",
  viewType: "representation-matrix",
  titleKey: "topicQuadraticTitle",
  subtitleKey: "topicQuadraticSubtitle",
  representations: buildRepresentations(quadraticMatrix),
  matrix: quadraticMatrix,
  details: {
    namespace: "quadratic",
    library: detailLibrary
  },
  formulaCards: formulas,
  problemRouter: problemRouterData.quadratic,
  transformations: {
    rules,
    flowContent: topicFlowContent,
    defaultFlowRuleId: "std_to_fact"
  },
  graphAdapter: quadraticGraphAdapter,
  optionalPanels: ["sameGeometry", "discriminant"],
  graph: {
    adapterId: "quadratic",
    defaultFormId: "qVertex",
    parameterForms: quadraticGraphAdapter.parameterForms,
    defaultSelection: {
      matrixKey: "quadratic",
      formId: "qVertex",
      infoKey: "vertex"
    }
  },
  matrixKey: "quadratic",
  matrixTitleKey: "qMatrixTitle",
  matrixNoteKey: "qMatrixNote",
  formulasTitleKey: "formulaGroupQuadratic",
  routerTitleKey: "formulaGroupQuadratic",
  /** @deprecated use formulaCards */
  formulas,
  /** @deprecated use problemRouter */
  router: problemRouterData.quadratic
};
