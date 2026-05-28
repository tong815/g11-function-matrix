import { fmt } from "../math/format.js";
import {
  DEFAULT_EXPONENTIAL,
  evaluateExponential,
  getExponentialFeatures,
  validateExponentialParams
} from "../math/exponential.js";
import { buildExponentialViewport, viewportWithSampleStep } from "./viewport.js";
import { buildExponentialAnnotations, getExponentialAnnotationNote } from "./exponentialGraphAnnotations.js";

const MAX_VIEW_Y = 1e5;

export const exponentialGraphAdapter = {
  id: "exponential",
  parameterForms: ["eTransformed"],
  defaultFormId: "eTransformed",

  getDefaultParams() {
    return { ...DEFAULT_EXPONENTIAL };
  },

  getFeatures(params, lang) {
    return getExponentialFeatures(params, lang);
  },

  evaluate(x, params) {
    const check = validateExponentialParams(params);
    if (!check.valid) return null;
    return evaluateExponential(x, check);
  },

  getRequiredPoints(params, features) {
    const g = features?.valid === true ? features : getExponentialFeatures(params, "en");
    if (!g.valid) return [];
    const { a, b, h, k } = g;
    const evalAt = (x) => evaluateExponential(x, { a, b, h, k });
    const pts = [
      { x: 0, y: g.yIntercept },
      { x: h, y: k },
      { x: h - 2, y: evalAt(h - 2) },
      { x: h, y: evalAt(h) },
      { x: h + 2, y: evalAt(h + 2) }
    ];
    return pts.filter((p) => Number.isFinite(p.y) && Math.abs(p.y) <= MAX_VIEW_Y);
  },

  getViewport(params, features, options = {}) {
    if (options.auto === false) {
      return { xMin: -6, xMax: 6, sampleStep: 0.03, pixelScale: 28, kind: "legacy" };
    }
    const requiredPoints = this.getRequiredPoints(params, features);
    const bounds = buildExponentialViewport({
      requiredPoints,
      baseXSpan: 20,
      baseYSpan: 20
    });
    return { ...viewportWithSampleStep(bounds, 0.03), kind: "bounds" };
  },

  getExampleForms(features, t) {
    if (!features.valid) return null;
    return {
      cards: [
        {
          className: "card-vertex",
          title: t.formExponentialTransformedLabel,
          expr: features.transformedFormText
        }
      ]
    };
  },

  getActiveFormId(graphState) {
    return graphState.activeFormByAdapter?.exponential ?? this.defaultFormId;
  },

  getCurrentParams(graphState) {
    return graphState.paramsByAdapter?.exponential;
  },

  setCurrentParams(graphState, next) {
    if (!graphState.paramsByAdapter) graphState.paramsByAdapter = {};
    graphState.paramsByAdapter.exponential = next;
  },

  setActiveFormId(graphState, formId) {
    if (!graphState.activeFormByAdapter) graphState.activeFormByAdapter = {};
    graphState.activeFormByAdapter.exponential = formId;
  },

  renderParameterFields({ graphState, formId, mount, t, bindEnter }) {
    document.getElementById("graphParamsSubtitle").textContent = t.paramSubtitle_eTransformed || "";
    const params = this.getCurrentParams(graphState) || this.getDefaultParams();
    const num = (label, id, val) =>
      `<label><span>${label}:</span> <input type="number" step="any" id="${id}" value="${val}" /></label>`;

    mount.innerHTML =
      num("a", "expInputA", fmt(params.a)) +
      num("b", "expInputB", fmt(params.b)) +
      num("h", "expInputH", fmt(params.h)) +
      num("k", "expInputK", fmt(params.k));
    bindEnter(mount);
  },

  applyParameterInputs({ graphState, formId, t, setError }) {
    const a = Number(document.getElementById("expInputA").value);
    const b = Number(document.getElementById("expInputB").value);
    const h = Number(document.getElementById("expInputH").value);
    const k = Number(document.getElementById("expInputK").value);
    const check = validateExponentialParams({ a, b, h, k });
    if (!check.valid) {
      setError(
        check.error === "aZero"
          ? t.expErrorAZero
          : check.error === "bInvalid"
            ? t.expErrorBInvalid
            : t.expErrorInvalid
      );
      return { changed: false };
    }
    setError("");
    return { changed: true, formId, formParams: { a, b, h, k } };
  },

  isValidParams(features) {
    return features?.valid === true;
  },

  getCanvasError(features, t) {
    if (features.error === "aZero") return t.expErrorAZero;
    if (features.error === "bInvalid") return t.expErrorBInvalid;
    return t.expErrorInvalid;
  },

  getAnnotations(ctx) {
    return buildExponentialAnnotations(ctx);
  },

  getAnnotationNote(ctx) {
    return getExponentialAnnotationNote(ctx);
  }
};
