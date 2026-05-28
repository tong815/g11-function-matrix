import { exponentialMatrix } from "../matrices.js";
import { detailLibrary } from "../details.js";
import { formulaCards, problemRouterData } from "../formulas.js";
import { buildRepresentations } from "../representations.js";
import { exponentialGraphAdapter } from "../../graph/exponentialGraphAdapter.js";

const formulas = formulaCards.filter((card) => card.group === "exponential");

export const exponentialTopic = {
  id: "exponential",
  viewType: "representation-matrix",
  titleKey: "topicExponentialTitle",
  subtitleKey: "topicExponentialSubtitle",
  representations: buildRepresentations(exponentialMatrix),
  matrix: exponentialMatrix,
  details: {
    namespace: "exponential",
    library: detailLibrary
  },
  formulaCards: formulas,
  problemRouter: problemRouterData.exponential,
  transformations: {
    rules: [],
    flowContent: {}
  },
  graphAdapter: exponentialGraphAdapter,
  optionalPanels: [],
  intuition: {
    titleKey: "intuitionExponentialTitle",
    oneLineKey: "intuitionExponentialOneLine",
    bullets: ["intuitionExponentialB1", "intuitionExponentialB2", "intuitionExponentialB3"],
    contrastKey: "intuitionExponentialContrast"
  },
  graph: {
    adapterId: "exponential",
    defaultFormId: exponentialGraphAdapter.defaultFormId,
    parameterForms: exponentialGraphAdapter.parameterForms,
    defaultSelection: {
      matrixKey: "exponential",
      formId: "eTransformed",
      infoKey: "growthDecay"
    }
  },
  matrixKey: "exponential",
  matrixTitleKey: "eMatrixTitle",
  matrixNoteKey: "eMatrixNote",
  formulasTitleKey: "formulaGroupExponential",
  routerTitleKey: "formulaGroupExponential",
  formulas,
  router: problemRouterData.exponential
};
