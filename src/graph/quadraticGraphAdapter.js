import {
  DEFAULT_QUADRATIC,
  getQuadraticFeatures,
  getStandardParams,
  getFactoredParams,
  getVertexParams,
  abcFromFactored,
  abcFromVertex
} from "../math/quadratic.js";
import { buildQuadraticAnnotations, getQuadraticAnnotationNote } from "./quadraticGraphAnnotations.js";

export const quadraticGraphAdapter = {
  id: "quadratic",
  parameterForms: ["qStandard", "qFactored", "qVertex"],
  defaultFormId: "qVertex",

  getDefaultParams() {
    return { ...DEFAULT_QUADRATIC };
  },

  getFeatures(params, lang, i18n) {
    return getQuadraticFeatures(params, lang, i18n);
  },

  evaluate(x, params) {
    const { a, b, c } = params;
    return a * x * x + b * x + c;
  },

  getViewport() {
    return { xMin: -10, xMax: 10, sampleStep: 0.05, pixelScale: 22 };
  },

  getExampleForms(features) {
    if (!features.valid) return null;
    return {
      standard: features.standardFormText,
      vertex: features.vertexFormText,
      factored: features.factoredFormText
    };
  },

  getStandardParams,
  getFactoredParams,
  getVertexParams,
  abcFromFactored,
  abcFromVertex,

  getActiveFormId(graphState, lastSelected) {
    if (lastSelected?.matrixKey === "quadratic") return lastSelected.formId;
    return graphState.quadraticForm || "qVertex";
  },

  isValidParams(features) {
    return features?.valid === true;
  },

  getCanvasError(features, t) {
    if (features.error === "aZero") return t.canvasErrorAZero;
    return t.quadErrorInvalid;
  },

  getAnnotations(ctx) {
    return buildQuadraticAnnotations({ ...ctx, getQuadraticFeatures });
  },

  getAnnotationNote(ctx) {
    return getQuadraticAnnotationNote({ ...ctx, getQuadraticFeatures });
  }
};
