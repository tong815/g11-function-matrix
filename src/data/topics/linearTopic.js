import { linearMatrix } from "../matrices.js";
import { detailLibrary } from "../details.js";
import { formulaCards, problemRouterData } from "../formulas.js";
import { transformationRules, flowContent } from "../transformationRules.js";
import { buildRepresentations } from "../representations.js";
import { linearGraphAdapter } from "../../graph/linearGraphAdapter.js";

const formulas = formulaCards.filter((card) => card.group === "linear");
const rules = transformationRules.filter((rule) => rule.topic === "linear");
const topicFlowContent = Object.fromEntries(
  rules
    .filter((rule) => flowContent[rule.id])
    .map((rule) => [rule.id, flowContent[rule.id]])
);

export const linearTopic = {
  id: "linear",
  viewType: "representation-matrix",
  titleKey: "topicLinearTitle",
  subtitleKey: "topicLinearSubtitle",
  representations: buildRepresentations(linearMatrix),
  matrix: linearMatrix,
  details: {
    namespace: "linear",
    library: detailLibrary
  },
  formulaCards: formulas,
  problemRouter: problemRouterData.linear,
  transformations: {
    rules,
    flowContent: topicFlowContent,
    defaultFlowRuleId: "lin_slope_to_point"
  },
  graphAdapter: linearGraphAdapter,
  optionalPanels: [],
  intuition: {
    titleKey: "intuitionLinearTitle",
    oneLineKey: "intuitionLinearOneLine",
    bullets: ["intuitionLinearB1", "intuitionLinearB2", "intuitionLinearB3"],
    contrastKey: "intuitionLinearContrast"
  },
  graph: {
    adapterId: "linear",
    defaultFormId: "lSlope",
    parameterForms: linearGraphAdapter.parameterForms,
    defaultSelection: {
      matrixKey: "linear",
      formId: "lSlope",
      infoKey: "slope"
    }
  },
  matrixKey: "linear",
  matrixTitleKey: "lMatrixTitle",
  matrixNoteKey: "lMatrixNote",
  formulasTitleKey: "formulaGroupLinear",
  routerTitleKey: "formulaGroupLinear",
  formulas,
  router: problemRouterData.linear
};
