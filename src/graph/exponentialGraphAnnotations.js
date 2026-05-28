import { fmt } from "../math/format.js";
import { getExponentialFeatures } from "../math/exponential.js";

export function buildExponentialAnnotations({ graphState, selection, getAnnotationStrength }) {
  const { formId, infoKey } = selection;
  const params = graphState.paramsByAdapter?.exponential;
  const g = getExponentialFeatures(params, "en");
  const annotations = [];
  if (!g.valid) return annotations;

  const s = (target) => getAnnotationStrength("exponential", formId, target, infoKey);

  const sy = s("initialValue");
  if (sy) {
    annotations.push({
      type: "point",
      x: 0,
      y: g.yIntercept,
      label: "(0," + fmt(g.yIntercept) + ")",
      strength: sy,
      target: "initialValue"
    });
  }

  const sa = s("asymptote");
  if (sa) {
    annotations.push({
      type: "horizontalLine",
      y: g.asymptoteY,
      label: "y = " + fmt(g.asymptoteY),
      strength: sa,
      target: "asymptote"
    });
  }

  const sg = s("growthDecay") || s("base");
  if (sg && !sy) {
    annotations.push({
      type: "point",
      x: 0,
      y: g.yIntercept,
      label: "(0," + fmt(g.yIntercept) + ")",
      strength: sg,
      target: "initialValue"
    });
  }

  return annotations;
}

export function getExponentialAnnotationNote({ graphState, selection, currentLang, i18n }) {
  const t = i18n[currentLang];
  const isZH = currentLang === "zh";
  const params = graphState.paramsByAdapter?.exponential;
  const g = getExponentialFeatures(params, currentLang);
  if (!g.valid) {
    return g.error === "aZero" ? t.expErrorAZero : g.error === "bInvalid" ? t.expErrorBInvalid : t.expErrorInvalid;
  }
  const key = selection.formId + "|" + selection.infoKey;
  if (key === "eTransformed|base") {
    return isZH
      ? "底数 b≈" + fmt(g.b) + " 决定曲线形状。"
      : "Base b≈" + fmt(g.b) + " controls the curve shape.";
  }
  if (key === "eTransformed|asymptote") {
    return isZH
      ? "水平渐近线 y=" + fmt(g.asymptoteY) + "（参数 k）。"
      : "Horizontal asymptote y=" + fmt(g.asymptoteY) + " (parameter k).";
  }
  if (key === "eTransformed|initialValue") {
    return isZH
      ? "x=0 时 y≈" + fmt(g.yIntercept) + "（代入变换式可得）。"
      : "At x=0, y≈" + fmt(g.yIntercept) + " (substitute into transformed form).";
  }
  if (key === "eTransformed|growthDecay") {
    return isZH
      ? "当前为" + g.growthOrDecay + "：比较 b 与 1，b≈" + fmt(g.b) + "。"
      : "This example shows " + g.growthOrDecay + ": compare b to 1, b≈" + fmt(g.b) + ".";
  }
  return isZH ? g.domainText + "；" + g.rangeText + "。" : g.domainText + "; " + g.rangeText + ".";
}
