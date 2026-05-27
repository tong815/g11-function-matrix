import { linearMatrix } from "../matrices.js";
import { detailLibrary } from "../details.js";
import { formulaCards, problemRouterData } from "../formulas.js";
import { transformationRules, flowContent } from "../transformationRules.js";

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
  formulasTitleKey: "formulaGroupLinear",
  routerTitleKey: "formulaGroupLinear",
  matrixTitleKey: "lMatrixTitle",
  matrixNoteKey: "lMatrixNote",
  matrix: linearMatrix,
  details: {
    namespace: "linear",
    library: detailLibrary
  },
  formulas,
  router: problemRouterData.linear,
  transformations: {
    rules,
    flowContent: topicFlowContent,
    defaultFlowRuleId: "lin_slope_to_point"
  },
  graph: {
    type: "linear",
    defaultFormId: "lSlope",
    parameterForms: ["lSlope", "lPoint", "lStandard"],
    defaultSelection: {
      matrixKey: "linear",
      formId: "lSlope",
      infoKey: "slope"
    }
  },
  matrixKey: "linear",
  visibility: {
    showSameGeometry: false,
    showDiscriminant: false
  }
};
