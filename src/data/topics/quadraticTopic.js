import { quadraticMatrix } from "../matrices.js";
import { detailLibrary } from "../details.js";
import { formulaCards, problemRouterData } from "../formulas.js";
import { transformationRules, flowContent } from "../transformationRules.js";

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
  formulasTitleKey: "formulaGroupQuadratic",
  routerTitleKey: "formulaGroupQuadratic",
  matrixTitleKey: "qMatrixTitle",
  matrixNoteKey: "qMatrixNote",
  matrix: quadraticMatrix,
  details: {
    namespace: "quadratic",
    library: detailLibrary
  },
  formulas,
  router: problemRouterData.quadratic,
  transformations: {
    rules,
    flowContent: topicFlowContent,
    defaultFlowRuleId: "std_to_fact"
  },
  graph: {
    type: "quadratic",
    defaultFormId: "qVertex",
    parameterForms: ["qStandard", "qFactored", "qVertex"],
    defaultSelection: {
      matrixKey: "quadratic",
      formId: "qVertex",
      infoKey: "vertex"
    }
  },
  matrixKey: "quadratic",
  visibility: {
    showSameGeometry: true,
    showDiscriminant: true
  }
};
