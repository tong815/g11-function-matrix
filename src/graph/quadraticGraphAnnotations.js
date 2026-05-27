import { fmt } from "../math/format.js";
import {
  labelVertex,
  labelYInt,
  labelAxis,
  labelRoot1,
  labelRoot2,
  labelDoubleRoot,
  quadraticFormBoost
} from "./quadraticGraphShared.js";

export function buildQuadraticAnnotations({
  graphState,
  selection,
  getQuadraticFeatures,
  currentLang,
  i18n,
  getCellLevel,
  getAnnotationStrength
}) {
  const { formId, infoKey } = selection;
  const t = i18n[currentLang];
  const g = getQuadraticFeatures(graphState.quadratic, currentLang, i18n);
  const annotations = [];
  if (!g.valid) return annotations;

  const s = (target) => {
    let strength = getAnnotationStrength("quadratic", formId, target, infoKey);
    const formBoost = quadraticFormBoost[formId] || [];
    if (formBoost.includes(target)) {
      const level = getCellLevel("quadratic", formId, target);
      if (target === infoKey) return "focus";
      if (level === "direct") return "direct";
    }
    return strength;
  };

  if (s("vertex")) annotations.push({ type: "point", x: g.h, y: g.k, label: labelVertex(g), strength: s("vertex"), target: "vertex" });
  if (s("yint")) annotations.push({ type: "point", x: 0, y: g.c, label: labelYInt(g), strength: s("yint"), target: "yint" });

  const sx = s("xint");
  if (sx) {
    if (g.noRealRoots) {
      annotations.push({ type: "noRoots", strength: sx, target: "xint" });
    } else if (g.hasDoubleRoot) {
      annotations.push({ type: "point", x: g.roots[0], y: 0, label: labelDoubleRoot(g, t), strength: sx, target: "xint" });
    } else if (g.hasTwoRoots) {
      annotations.push({ type: "point", x: g.roots[0], y: 0, label: labelRoot1(g), strength: sx, target: "xint" });
      annotations.push({ type: "point", x: g.roots[1], y: 0, label: labelRoot2(g), strength: sx, target: "xint" });
    }
  }

  if (s("axis")) {
    annotations.push({ type: "verticalLine", x: g.h, label: labelAxis(g), strength: s("axis"), target: "axis" });
  }

  if (s("extreme")) {
    const extLabel = (g.a > 0 ? t.markerMinimum : t.markerMaximum) + " k≈" + fmt(g.k);
    annotations.push({ type: "point", x: g.h, y: g.k, label: extLabel, strength: s("extreme"), target: "extreme" });
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
    annotations.push({ type: "point", x: g.h, y: g.k, label: labelVertex(g), strength: s("transform"), target: "transform" });
    annotations.push({ type: "verticalLine", x: g.h, label: labelAxis(g), strength: s("transform"), target: "transform" });
  }

  return annotations;
}

export function getQuadraticAnnotationNote({ graphState, selection, currentLang, i18n, getQuadraticFeatures, getCellLevel }) {
  const t = i18n[currentLang];
  const isZH = currentLang === "zh";
  const g = getQuadraticFeatures(graphState.quadratic, currentLang, i18n);
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

  const level = getCellLevel("quadratic", selection.formId, selection.infoKey);
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
