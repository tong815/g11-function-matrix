import {
  DEFAULT_LINEAR,
  getLinearFeatures,
  getSlopeInterceptParams,
  getPointSlopeParams,
  getLinearStandardParams,
  syncLinearFromNormal,
  linearFromStandard
} from "../math/linear.js";
import { buildLinearAnnotations, getLinearAnnotationNote } from "./linearGraphAnnotations.js";

export const linearGraphAdapter = {
  id: "linear",
  parameterForms: ["lSlope", "lPoint", "lStandard"],
  defaultFormId: "lSlope",

  getDefaultParams() {
    return { ...DEFAULT_LINEAR };
  },

  getFeatures(params) {
    return getLinearFeatures(params);
  },

  evaluate(x, params) {
    const lf = getLinearFeatures(params);
    if (!lf.valid || lf.isVertical) return null;
    return lf.m * x + lf.b;
  },

  getViewport(params) {
    const lf = getLinearFeatures(params);
    if (lf.valid && lf.isVertical) {
      return { kind: "vertical", xConst: lf.xConst, pixelScale: 22 };
    }
    return { kind: "segment", xMin: -12, xMax: 12, pixelScale: 22 };
  },

  getExampleForms(features, t) {
    if (!features.valid) return null;
    return {
      standard: features.isVertical ? t.noSlopeInterceptNote : features.slopeInterceptText,
      vertex: features.isVertical ? t.noPointSlopeNote : features.pointSlopeText,
      factored: features.standardFormText
    };
  },

  getSlopeInterceptParams,
  getPointSlopeParams,
  getLinearStandardParams,
  syncLinearFromNormal,
  linearFromStandard,

  getActiveFormId(graphState, lastSelected) {
    if (lastSelected?.matrixKey === "linear") return lastSelected.formId;
    return graphState.linearForm || "lSlope";
  },

  isValidParams(features) {
    return features?.valid === true;
  },

  getCanvasError(_features, t) {
    return t.canvasErrorLinearInvalid;
  },

  getAnnotations(ctx) {
    return buildLinearAnnotations({ ...ctx, getLinearFeatures });
  },

  getAnnotationNote(ctx) {
    return getLinearAnnotationNote({ ...ctx, getLinearFeatures });
  }
};

export const linearFormBoost = {
  lSlope: ["slope", "yint"],
  lPoint: ["knownPoint", "slope"],
  lStandard: ["graphing", "yint"]
};
