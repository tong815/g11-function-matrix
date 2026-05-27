import { EPS, fmt } from "../math/format.js";
import {
  getQuadraticFeatures,
  getStandardParams,
  getFactoredParams,
  getVertexParams,
  abcFromFactored,
  abcFromVertex
} from "../math/quadratic.js";
import {
  getLinearFeatures,
  getSlopeInterceptParams,
  getPointSlopeParams,
  getLinearStandardParams,
  syncLinearFromNormal,
  linearFromStandard
} from "../math/linear.js";

export function syncCanvasSize() {
  const canvas = document.getElementById("graphCanvas");
  if (!canvas) return;
  const isDesktop = document.documentElement.classList.contains("device-desktop");
  canvas.height = isDesktop ? 360 : 280;
  canvas.width = 560;
}

export function detectDeviceMode() {
  const ua = navigator.userAgent || "";
  const isPhone = /iPhone|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry|Opera Mini/i.test(ua);
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const isNarrow = window.innerWidth <= 1100;
  const isMobile = isPhone || (isNarrow && isTouch && isCoarse) || window.innerWidth <= 768;
  document.documentElement.classList.remove("device-mobile", "device-desktop");
  document.documentElement.classList.add(isMobile ? "device-mobile" : "device-desktop");
  syncCanvasSize();
  return isMobile ? "mobile" : "desktop";
}

export function createGraphHandlers(deps) {
  const { graphState, getLang, i18n, quadraticMatrix, linearMatrix, getLastSelected } = deps;
  const currentLang = () => getLang();

function drawAxes(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
}

function toCanvasX(x, w) { return w / 2 + x * 22; }
function toCanvasY(y, h) { return h / 2 - y * 22; }

function labelVertex(g) {
  return "(h,k)≈(" + fmt(g.h) + "," + fmt(g.k) + ")";
}

function labelYInt(g) {
  return "(0,c)=(" + fmt(0) + "," + fmt(g.c) + ")";
}

function labelAxis(g) {
  return "x=h≈" + fmt(g.h);
}

function labelRoot1(g) {
  return "r₁≈" + fmt(g.roots[0]);
}

function labelRoot2(g) {
  return "r₂≈" + fmt(g.roots[1]);
}

function labelDoubleRoot(g) {
  const t = i18n[currentLang()];
  return "r≈" + fmt(g.roots[0]) + " (" + t.markerDoubleRoot + ")";
}

function getActiveQuadraticFormId() {
  if (getLastSelected() && getLastSelected().matrixKey === "quadratic") {
    return getLastSelected().formId;
  }
  return graphState.quadraticForm || "qVertex";
}

function getActiveLinearFormId() {
  if (getLastSelected() && getLastSelected().matrixKey === "linear") {
    return getLastSelected().formId;
  }
  return graphState.linearForm || "lSlope";
}

function updateGraphLabel(matrixKey, formId) {
  const q = quadraticMatrix.forms.find(f => f.id === formId);
  const l = linearMatrix.forms.find(f => f.id === formId);
  const t = i18n[currentLang()];
  const qForms = t.qForms;
  const lForms = t.lForms;
  const label = matrixKey === "quadratic"
    ? (q ? t.graphQuadratic + " / " + qForms[quadraticMatrix.forms.findIndex(f => f.id === formId)] : t.graphQuadratic)
    : (l ? t.graphLinear + " / " + lForms[linearMatrix.forms.findIndex(f => f.id === formId)] : t.graphLinear);
  document.getElementById("graphLabel").textContent = label;
}

function getQuadraticAnnotationStrength(formId, targetInfo, infoKey) {
  let strength = getAnnotationStrength("quadratic", formId, targetInfo, infoKey);
  const formBoost = {
    qStandard: ["yint", "opening"],
    qFactored: ["xint"],
    qVertex: ["vertex", "axis", "extreme"]
  }[formId] || [];
  if (formBoost.includes(targetInfo)) {
    const level = getCellLevel("quadratic", formId, targetInfo);
    if (targetInfo === infoKey) return "focus";
    if (level === "direct") return "direct";
  }
  return strength;
}

function getLinearAnnotationStrength(formId, targetInfo, infoKey) {
  let strength = getAnnotationStrength("linear", formId, targetInfo, infoKey);
  const formBoost = {
    lSlope: ["slope", "yint"],
    lPoint: ["knownPoint", "slope"],
    lStandard: ["graphing", "yint"]
  }[formId] || [];
  if (formBoost.includes(targetInfo)) {
    const level = getCellLevel("linear", formId, targetInfo);
    if (targetInfo === infoKey) return "focus";
    if (level === "direct") return "direct";
  }
  return strength;
}

function getCellLevel(matrixKey, formId, infoKey) {
  const matrix = matrixKey === "quadratic" ? quadraticMatrix : linearMatrix;
  return matrix.cells[infoKey][formId];
}

function getAnnotationStrength(matrixKey, formId, targetInfo, clickedInfo) {
  const level = getCellLevel(matrixKey, formId, targetInfo);
  if (targetInfo === clickedInfo) return "focus";
  if (level === "weak") return null;
  if (level === "direct") return "direct";
  if (level === "derivable") return "derivable";
  return null;
}

const strengthRank = { focus: 3, direct: 2, derivable: 1 };

function getAnnStyle(strength) {
  if (strength === "focus") {
    return { color: "#dc2626", lineWidth: 2.5, radius: 6, dash: [], font: "bold 11px Segoe UI" };
  }
  if (strength === "direct") {
    return { color: "#2563eb", lineWidth: 2, radius: 5, dash: [], font: "600 11px Segoe UI" };
  }
  return { color: "#9ca3af", lineWidth: 1.5, radius: 4, dash: [5, 4], font: "11px Segoe UI" };
}

function pushPoint(annotations, x, y, label, strength, target) {
  if (!strength) return;
  const key = "p:" + x.toFixed(3) + "," + y.toFixed(3);
  const existing = annotations.find(a => a.type === "point" && a.key === key);
  if (existing) {
    if (strengthRank[strength] >= strengthRank[existing.strength]) {
      existing.strength = strength;
      existing.label = label;
      existing.target = target;
    }
    return;
  }
  annotations.push({ type: "point", x, y, label, strength, target, key });
}

function getDirectGraphAnnotations(selection) {
  if (!selection) return [];
  const { matrixKey, formId, infoKey } = selection;
  const t = i18n[currentLang()];
  const annotations = [];
  const s = (target) => {
    if (matrixKey === "quadratic") return getQuadraticAnnotationStrength(formId, target, infoKey);
    if (matrixKey === "linear") return getLinearAnnotationStrength(formId, target, infoKey);
    return getAnnotationStrength(matrixKey, formId, target, infoKey);
  };

  if (matrixKey === "quadratic") {
    const g = getQuadraticFeatures(graphState.quadratic, currentLang(), i18n);
    if (!g.valid) return annotations;

    if (s("vertex")) pushPoint(annotations, g.h, g.k, labelVertex(g), s("vertex"), "vertex");
    if (s("yint")) pushPoint(annotations, 0, g.c, labelYInt(g), s("yint"), "yint");

    const sx = s("xint");
    if (sx) {
      if (g.noRealRoots) {
        annotations.push({ type: "noRoots", strength: sx, target: "xint" });
      } else if (g.hasDoubleRoot) {
        pushPoint(annotations, g.roots[0], 0, labelDoubleRoot(g), sx, "xint");
      } else if (g.hasTwoRoots) {
        pushPoint(annotations, g.roots[0], 0, labelRoot1(g), sx, "xint");
        pushPoint(annotations, g.roots[1], 0, labelRoot2(g), sx, "xint");
      }
    }

    if (s("axis")) {
      annotations.push({ type: "verticalLine", x: g.h, label: labelAxis(g), strength: s("axis"), target: "axis" });
    }

    if (s("extreme")) {
      const extLabel = (g.a > 0 ? t.markerMinimum : t.markerMaximum) + " k≈" + fmt(g.k);
      pushPoint(annotations, g.h, g.k, extLabel, s("extreme"), "extreme");
    }

    if (s("opening")) {
      annotations.push({
        type: "text",
        x: g.h + 1.2,
        y: g.k + (g.a > 0 ? 2.5 : -2.5),
        label: g.openingText,
        strength: s("opening"),
        target: "opening"
      });
    }

    if (s("transform") && formId === "qVertex") {
      pushPoint(annotations, g.h, g.k, labelVertex(g), s("transform"), "transform");
      annotations.push({ type: "verticalLine", x: g.h, label: labelAxis(g), strength: s("transform"), target: "transform" });
    }
  } else {
    const lf = getLinearFeatures(graphState.linear);
    if (!lf.valid) return annotations;

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
      if (s("yint")) pushPoint(annotations, 0, b, t.markerYInt + " (0," + fmt(b) + ")", s("yint"), "yint");
      if (s("slope") || s("graphing")) {
        annotations.push({ type: "slopeTriangle", x0: 0, y0: b, m, strength: s("slope") || s("graphing"), target: "slope" });
      }
      if (s("parallel") || s("perpendicular")) {
        annotations.push({ type: "slopeTriangle", x0: 0, y0: b, m, strength: s("parallel") || s("perpendicular"), target: infoKey });
      }
    }

    if (formId === "lPoint") {
      if (s("knownPoint")) pushPoint(annotations, x1, y1, t.markerKnownPoint + " (" + fmt(x1) + "," + fmt(y1) + ")", s("knownPoint"), "knownPoint");
      if (s("slope") || s("graphing")) {
        annotations.push({ type: "slopeTriangle", x0: x1, y0: y1, m, strength: s("slope") || s("graphing"), target: "slope" });
      }
      if (s("yint")) {
        const yInt = y1 - m * x1;
        pushPoint(annotations, 0, yInt, t.markerYInt + " (0," + fmt(yInt) + ")", s("yint"), "yint");
      }
    }

    if (formId === "lStandard") {
      const yInt = lf.yInt;
      const xInt = lf.xInt;
      if (s("yint") && yInt !== null && Number.isFinite(yInt)) {
        pushPoint(annotations, 0, yInt, t.markerYInt + " (0," + fmt(yInt) + ")", s("yint"), "yint");
      }
      if ((s("graphing") || s("knownPoint")) && xInt !== null && Number.isFinite(xInt)) {
        pushPoint(annotations, xInt, 0, t.markerXInt + " (" + fmt(xInt) + ",0)", s("graphing") || s("knownPoint"), "graphing");
      }
      if (s("graphing") && yInt !== null && xInt !== null && Number.isFinite(yInt) && Number.isFinite(xInt)) {
        annotations.push({ type: "interceptLine", xInt, yInt, strength: s("graphing"), target: "graphing" });
      }
      if (s("slope")) {
        annotations.push({ type: "slopeTriangle", x0: 0, y0: yInt, m: lf.m, strength: s("slope"), target: "slope" });
      }
    }
  }

  return annotations;
}

function drawPointAnnotation(ctx, w, h, ann) {
  const style = getAnnStyle(ann.strength);
  const px = toCanvasX(ann.x, w);
  const py = toCanvasY(ann.y, h);
  ctx.fillStyle = style.color;
  ctx.beginPath();
  ctx.arc(px, py, style.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = style.color;
  ctx.font = style.font;
  ctx.fillText(ann.label, px + 7, py - 7);
}

function drawVerticalLineAnnotation(ctx, w, h, ann) {
  const style = getAnnStyle(ann.strength);
  const px = toCanvasX(ann.x, w);
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;
  ctx.setLineDash(style.dash);
  ctx.beginPath();
  ctx.moveTo(px, 0);
  ctx.lineTo(px, h);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = style.color;
  ctx.font = style.font;
  ctx.fillText(ann.label, px + 4, 14);
}

function drawTextAnnotation(ctx, w, h, ann) {
  const style = getAnnStyle(ann.strength);
  ctx.fillStyle = style.color;
  ctx.font = style.font;
  ctx.fillText(ann.label, toCanvasX(ann.x, w), toCanvasY(ann.y, h));
}

function drawSlopeTriangle(ctx, w, h, ann) {
  const style = getAnnStyle(ann.strength);
  const t = i18n[currentLang()];
  const x0 = ann.x0;
  const y0 = ann.y0;
  const m = ann.m;
  const x1 = x0 + 1;
  const y1 = y0 + m;
  const px0 = toCanvasX(x0, w);
  const py0 = toCanvasY(y0, h);
  const px1 = toCanvasX(x1, w);
  const py1 = toCanvasY(y1, h);
  const pyBase = toCanvasY(y0, h);

  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;
  ctx.setLineDash(style.dash);
  ctx.beginPath();
  ctx.moveTo(px0, py0);
  ctx.lineTo(px1, py1);
  ctx.moveTo(px0, pyBase);
  ctx.lineTo(px1, pyBase);
  ctx.moveTo(px1, pyBase);
  ctx.lineTo(px1, py1);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = style.color;
  ctx.font = style.font;
  ctx.fillText(t.markerRun, (px0 + px1) / 2 - 12, pyBase + 12);
  ctx.fillText(t.markerRise + "=" + m, px1 + 4, (pyBase + py1) / 2);
}

function drawNoRootsAnnotation(ctx, w, h, ann) {
  const style = getAnnStyle(ann.strength);
  const t = i18n[currentLang()];
  const msg = currentLang() === "zh" ? "无实数 x 截距（Δ < 0）" : "No real x-intercepts (Δ < 0)";
  ctx.fillStyle = style.color;
  ctx.font = style.font;
  ctx.fillText(msg, w / 2 - 95, toCanvasY(0, h) + 20);
}

function drawInterceptLineAnnotation(ctx, w, h, ann) {
  const style = getAnnStyle(ann.strength);
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;
  ctx.setLineDash(style.dash);
  ctx.beginPath();
  ctx.moveTo(toCanvasX(ann.xInt, w), toCanvasY(0, h));
  ctx.lineTo(toCanvasX(0, w), toCanvasY(ann.yInt, h));
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderAnnotations(ctx, w, h, annotations) {
  annotations.forEach(ann => {
    if (ann.type === "point") drawPointAnnotation(ctx, w, h, ann);
    else if (ann.type === "verticalLine") drawVerticalLineAnnotation(ctx, w, h, ann);
    else if (ann.type === "text") drawTextAnnotation(ctx, w, h, ann);
    else if (ann.type === "slopeTriangle") drawSlopeTriangle(ctx, w, h, ann);
    else if (ann.type === "noRoots") drawNoRootsAnnotation(ctx, w, h, ann);
    else if (ann.type === "interceptLine") drawInterceptLineAnnotation(ctx, w, h, ann);
  });
}

function getGraphAnnotationNote(selection) {
  if (!selection) return i18n[currentLang()].graphAnnotationDefault;
  const t = i18n[currentLang()];
  const isZH = currentLang() === "zh";

  if (selection.matrixKey === "quadratic") {
    const g = getQuadraticFeatures(graphState.quadratic, currentLang(), i18n);
    if (!g.valid) {
      return g.error === "aZero" ? t.quadErrorAZero : t.quadErrorInvalid;
    }
    const key = selection.formId + "|" + selection.infoKey;

    if (key === "qFactored|xint" || key === "qStandard|xint") {
      if (g.noRealRoots) {
        return isZH
          ? "当前例子 Δ<0，因此没有实数 x 截距；实数范围内不能写成因式分解式。"
          : "This example has Δ<0, so there are no real x-intercepts. Factored form over real numbers is not available.";
      }
      if (g.hasDoubleRoot) {
        return isZH
          ? "因式分解式直接暴露根：r≈" + fmt(g.roots[0]) + " 是重根（图像与 x 轴相切）。"
          : "Factored form exposes the root directly: r≈" + fmt(g.roots[0]) + " is a double root (tangent to the x-axis).";
      }
      return isZH
        ? "因式分解式直接暴露根：r₁≈" + fmt(g.roots[0]) + " 和 r₂≈" + fmt(g.roots[1]) + " 就是 x 轴交点。"
        : "Factored form exposes the roots directly: r₁≈" + fmt(g.roots[0]) + " and r₂≈" + fmt(g.roots[1]) + " are the x-intercepts.";
    }

    if (key === "qVertex|vertex") {
      return isZH
        ? "顶点式直接暴露转折点：顶点 (h,k)≈(" + fmt(g.h) + "," + fmt(g.k) + ")。"
        : "Vertex form exposes the turning point directly: vertex=(h,k)≈(" + fmt(g.h) + "," + fmt(g.k) + ").";
    }

    if (key === "qVertex|axis" || key === "qStandard|axis") {
      return isZH
        ? "对称轴为 x=h≈" + fmt(g.h) + "；顶点式可直接读取，标准式需用 x=-b/(2a) 推导。"
        : "The axis of symmetry is x=h≈" + fmt(g.h) + "; vertex form reads it directly, standard form derives it.";
    }

    if (key === "qStandard|yint") {
      return isZH
        ? "标准式直接暴露 y 截距：当 x=0 时，y=c=" + fmt(g.c) + "，即 (0,c)。"
        : "Standard form exposes the y-intercept directly: when x=0, y=c=" + fmt(g.c) + ", so the point is (0,c).";
    }

    if (key === "qStandard|opening" || key === "qVertex|opening" || key === "qFactored|opening") {
      return isZH
        ? "系数 a=" + fmt(g.a) + " 决定开口：" + g.openingText + "。"
        : "Coefficient a=" + fmt(g.a) + " controls opening: " + g.openingText + ".";
    }

    if (key === "qVertex|extreme") {
      const kind = g.a > 0 ? (isZH ? "最小值" : "minimum") : (isZH ? "最大值" : "maximum");
      return isZH
        ? "顶点式直接给出极值：k≈" + fmt(g.k) + " 是当前例子的" + kind + "。"
        : "Vertex form exposes the extremum directly: k≈" + fmt(g.k) + " is the " + kind + " for this example.";
    }

    if (key === "qVertex|transform") {
      return isZH
        ? "顶点式 y=a(x-h)²+k 直接显示平移：h≈" + fmt(g.h) + "，k≈" + fmt(g.k) + "，a=" + fmt(g.a) + "。"
        : "Vertex form y=a(x-h)²+k shows transformations directly: h≈" + fmt(g.h) + ", k≈" + fmt(g.k) + ", a=" + fmt(g.a) + ".";
    }

    if (selection.formId === "qStandard") {
      return isZH
        ? "标准式参数 a,b,c：重点可看 y 截距 c=" + fmt(g.c) + " 与开口方向（a=" + fmt(g.a) + "，" + g.openingText + "）。"
        : "Standard form parameters a,b,c: focus on y-intercept c=" + fmt(g.c) + " and opening (a=" + fmt(g.a) + ", " + g.openingText + ").";
    }
    if (selection.formId === "qFactored") {
      if (g.noRealRoots) return t.noRealFactoredParamNote;
      if (g.hasDoubleRoot) {
        return isZH
          ? "因式分解式参数 a,r₁,r₂：根 r≈" + fmt(g.roots[0]) + " 是 x 轴交点（重根）。"
          : "Factored form parameters a,r₁,r₂: root r≈" + fmt(g.roots[0]) + " is the x-intercept (double root).";
      }
      return isZH
        ? "因式分解式参数 a,r₁,r₂：根 r₁≈" + fmt(g.roots[0]) + "、r₂≈" + fmt(g.roots[1]) + " 即 x 轴交点。"
        : "Factored form parameters a,r₁,r₂: roots r₁≈" + fmt(g.roots[0]) + " and r₂≈" + fmt(g.roots[1]) + " are the x-intercepts.";
    }
    if (selection.formId === "qVertex") {
      const kind = g.a > 0 ? (isZH ? "最小值" : "minimum") : (isZH ? "最大值" : "maximum");
      return isZH
        ? "顶点式参数 a,h,k：顶点 (" + fmt(g.h) + "," + fmt(g.k) + ")，对称轴 x=" + fmt(g.h) + "，极值 k≈" + fmt(g.k) + "（" + kind + "）。"
        : "Vertex form parameters a,h,k: vertex (" + fmt(g.h) + "," + fmt(g.k) + "), axis x=" + fmt(g.h) + ", extremum k≈" + fmt(g.k) + " (" + kind + ").";
    }
  }

  if (selection.matrixKey === "linear") {
    const lf = getLinearFeatures(graphState.linear);
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
  }

  const level = getCellLevel(selection.matrixKey, selection.formId, selection.infoKey);
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

function updateGraphAnnotationText(selection) {
  const el = document.getElementById("graphAnnotationText");
  if (el) el.textContent = getGraphAnnotationNote(selection);
}

function drawMainGraph() {
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  drawAxes(ctx, w, h);

  if (graphState.mode === "quadratic") {
    const g = getQuadraticFeatures(graphState.quadratic, currentLang(), i18n);
    if (!g.valid) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "13px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(
        g.error === "aZero" ? i18n[currentLang()].canvasErrorAZero : i18n[currentLang()].quadErrorInvalid,
        w / 2,
        h / 2
      );
      ctx.textAlign = "left";
      return;
    }
    const { a, b, c } = g;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let x = -10; x <= 10; x += 0.05) {
      const y = a * x * x + b * x + c;
      const px = toCanvasX(x, w);
      const py = toCanvasY(y, h);
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  } else {
    const lf = getLinearFeatures(graphState.linear);
    if (!lf.valid) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "13px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(i18n[currentLang()].canvasErrorLinearInvalid, w / 2, h / 2);
      ctx.textAlign = "left";
      return;
    }
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (lf.isVertical) {
      const px = toCanvasX(lf.xConst, w);
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
    } else {
      const { m, b } = lf;
      const x1 = -12, y1 = m * x1 + b;
      const x2 = 12, y2 = m * x2 + b;
      ctx.moveTo(toCanvasX(x1, w), toCanvasY(y1, h));
      ctx.lineTo(toCanvasX(x2, w), toCanvasY(y2, h));
    }
    ctx.stroke();
  }

  const annotations = getDirectGraphAnnotations(getLastSelected());
  renderAnnotations(ctx, w, h, annotations);
}

function drawDiscCanvas(id, mode) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  drawAxes(ctx, w, h);
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  let first = true;
  for (let x = -4; x <= 4; x += 0.03) {
    let y;
    if (mode === "pos") y = (x - 1) * (x + 1) - 1;
    if (mode === "zero") y = (x - 0) * (x - 0);
    if (mode === "neg") y = (x - 0) * (x - 0) + 1;
    const px = w / 2 + x * 18;
    const py = h / 2 - y * 18;
    if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
  }
  ctx.stroke();
}
  return {
    updateGraphLabel,
    drawMainGraph,
    updateGraphAnnotationText,
    drawDiscCanvas,
    getActiveQuadraticFormId,
    getActiveLinearFormId
  };
}
