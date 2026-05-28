import { fmt } from "../math/format.js";
import { linearFormBoost } from "./linearGraphShared.js";

export function buildLinearAnnotations({
  graphState,
  selection,
  getLinearFeatures,
  currentLang,
  i18n,
  getCellLevel,
  getAnnotationStrength
}) {
  const { formId, infoKey } = selection;
  const t = i18n[currentLang];
  const currentParams = graphState.paramsByAdapter?.linear;
  const lf = getLinearFeatures(currentParams);
  const annotations = [];
  if (!lf.valid) return annotations;

  const s = (target) => {
    let strength = getAnnotationStrength("linear", formId, target, infoKey);
    const formBoost = linearFormBoost[formId] || [];
    if (formBoost.includes(target)) {
      const level = getCellLevel("linear", formId, target);
      if (target === infoKey) return "focus";
      if (level === "direct") return "direct";
    }
    return strength;
  };

  if (lf.isVertical) {
    const vx = lf.xConst;
    const vLabel = "x=" + fmt(vx);
    const vStrength = s("graphing") || s("yint") || (formId === "lStandard" ? "direct" : null);
    if (vStrength) {
      annotations.push({ type: "verticalLine", x: vx, label: vLabel, strength: vStrength, target: "graphing" });
    }
    return annotations;
  }

  const { m, b, point } = lf;
  const x1 = point[0];
  const y1 = point[1];

  if (formId === "lSlope") {
    if (s("yint")) annotations.push({ type: "point", x: 0, y: b, label: t.markerYInt + " (0," + fmt(b) + ")", strength: s("yint"), target: "yint" });
    if (s("slope") || s("graphing")) {
      annotations.push({ type: "slopeTriangle", x0: 0, y0: b, m, strength: s("slope") || s("graphing"), target: "slope" });
    }
    if (s("parallel") || s("perpendicular")) {
      annotations.push({ type: "slopeTriangle", x0: 0, y0: b, m, strength: s("parallel") || s("perpendicular"), target: infoKey });
    }
  }

  if (formId === "lPoint") {
    if (s("knownPoint")) annotations.push({ type: "point", x: x1, y: y1, label: t.markerKnownPoint + " (" + fmt(x1) + "," + fmt(y1) + ")", strength: s("knownPoint"), target: "knownPoint" });
    if (s("slope") || s("graphing")) {
      annotations.push({ type: "slopeTriangle", x0: x1, y0: y1, m, strength: s("slope") || s("graphing"), target: "slope" });
    }
    if (s("yint")) {
      const yInt = y1 - m * x1;
      annotations.push({ type: "point", x: 0, y: yInt, label: t.markerYInt + " (0," + fmt(yInt) + ")", strength: s("yint"), target: "yint" });
    }
  }

  if (formId === "lStandard") {
    const yInt = lf.yInt;
    const xInt = lf.xInt;
    if (s("yint") && yInt !== null && Number.isFinite(yInt)) {
      annotations.push({ type: "point", x: 0, y: yInt, label: t.markerYInt + " (0," + fmt(yInt) + ")", strength: s("yint"), target: "yint" });
    }
    if ((s("graphing") || s("knownPoint")) && xInt !== null && Number.isFinite(xInt)) {
      annotations.push({ type: "point", x: xInt, y: 0, label: t.markerXInt + " (" + fmt(xInt) + ",0)", strength: s("graphing") || s("knownPoint"), target: "graphing" });
    }
    if (s("graphing") && yInt !== null && xInt !== null && Number.isFinite(yInt) && Number.isFinite(xInt)) {
      annotations.push({ type: "interceptLine", xInt, yInt, strength: s("graphing"), target: "graphing" });
    }
    if (s("slope")) {
      annotations.push({ type: "slopeTriangle", x0: 0, y0: yInt, m: lf.m, strength: s("slope"), target: "slope" });
    }
  }

  return annotations;
}

export function getLinearAnnotationNote({ graphState, selection, currentLang, i18n, getLinearFeatures, getCellLevel }) {
  const t = i18n[currentLang];
  const isZH = currentLang === "zh";
  const currentParams = graphState.paramsByAdapter?.linear;
  const lf = getLinearFeatures(currentParams);
  const linKey = selection.formId + "|" + selection.infoKey;

  if (linKey === "lSlope|slope" && !lf.isVertical) {
    return isZH
      ? "斜截式直接暴露斜率：m=" + fmt(lf.m) + "。升跑三角表示 run=1 时 rise=" + fmt(lf.m) + "。"
      : "Slope-intercept form exposes the slope directly: m=" + fmt(lf.m) + ". The rise/run triangle shows rise=" + fmt(lf.m) + " for run=1.";
  }
  if (linKey === "lSlope|yint" && !lf.isVertical) {
    return isZH
      ? "斜截式直接暴露 y 截距：(0,b)=(" + fmt(0) + "," + fmt(lf.b) + ")。"
      : "Slope-intercept form exposes the y-intercept directly: (0,b)=(" + fmt(0) + "," + fmt(lf.b) + ").";
  }
  if (linKey === "lPoint|knownPoint" && !lf.isVertical) {
    const p = lf.point;
    return isZH
      ? "点斜式直接暴露一个已知点：(x₁,y₁)=(" + fmt(p[0]) + "," + fmt(p[1]) + ")。"
      : "Point-slope form exposes a point directly: (x₁,y₁)=(" + fmt(p[0]) + "," + fmt(p[1]) + ").";
  }
  if ((linKey === "lStandard|graphing" || linKey === "lStandard|yint") && !lf.isVertical) {
    return isZH
      ? "标准式适合截距作图：令 x=0 得 y 截距，令 y=0 得 x 截距。"
      : "Standard form is convenient for intercept graphing: set x=0 for y-intercept and y=0 for x-intercept.";
  }
  if (lf.isVertical && selection.formId === "lStandard") {
    return isZH
      ? "竖直线 x=" + fmt(lf.xConst) + "；标准式 Ax+By+C=0 在 B=0 时表示 x 为常数。"
      : "Vertical line x=" + fmt(lf.xConst) + "; standard form Ax+By+C=0 with B=0 gives constant x.";
  }

  if (selection.formId === "lSlope") {
    if (lf.isVertical) return t.noSlopeInterceptNote;
    return isZH
      ? "斜截式参数 m,b：斜率 m=" + fmt(lf.m) + "，y 截距 (0," + fmt(lf.b) + ")。"
      : "Slope-intercept parameters m,b: slope m=" + fmt(lf.m) + ", y-intercept (0," + fmt(lf.b) + ").";
  }
  if (selection.formId === "lPoint") {
    if (lf.isVertical) return t.noPointSlopeNote;
    const p = lf.point;
    return isZH
      ? "点斜式参数 m,x₁,y₁：已知点 (" + fmt(p[0]) + "," + fmt(p[1]) + ")，斜率 m=" + fmt(lf.m) + "。"
      : "Point-slope parameters m,x₁,y₁: known point (" + fmt(p[0]) + "," + fmt(p[1]) + "), slope m=" + fmt(lf.m) + ".";
  }
  if (selection.formId === "lStandard") {
    if (lf.isVertical) {
      return isZH
        ? "标准式参数 A,B,C：竖直线 x=" + fmt(lf.xConst) + "（B=0）。"
        : "Standard parameters A,B,C: vertical line x=" + fmt(lf.xConst) + " (B=0).";
    }
    return isZH
      ? "标准式参数 A,B,C：x 截距≈" + fmt(lf.xInt) + "，y 截距≈" + fmt(lf.yInt) + "，等价于 y=" + fmt(lf.m) + "x" + (lf.b >= 0 ? "+" : "") + fmt(lf.b) + "。"
      : "Standard parameters A,B,C: x-int≈" + fmt(lf.xInt) + ", y-int≈" + fmt(lf.yInt) + ", equivalent to y=" + fmt(lf.m) + "x" + (lf.b >= 0 ? "+" : "") + fmt(lf.b) + ".";
  }

  const level = getCellLevel("linear", selection.formId, selection.infoKey);
  if (level === "direct") {
    return isZH
      ? "绿色 Direct：该信息在当前形式下可直接从图像读取（高亮显示）。"
      : "Green Direct: this information is read directly from the graph in this form (highlighted).";
  }
  if (level === "derivable") {
    return isZH
      ? "黄色 Derivable：该信息需推导；图中以虚线弱显示相关辅助信息。"
      : "Yellow Derivable: requires derivation; related helpers are shown with dashed lines.";
  }
  return isZH
    ? "灰色 Weak：该形式不优先用于此信息；点击后仅作辅助说明。"
    : "Grey Weak: this form is not preferred for this information.";
}
