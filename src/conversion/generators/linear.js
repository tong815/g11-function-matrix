import { EPS, fmt } from "../../math/format.js";
import { flowMistakesByRule } from "../../data/flowMistakes.js";
import { L, buildSlopeIntercept, buildPointSlope } from "../conversionMath.js";

function mistakes(ruleId, lang) {
  return flowMistakesByRule[ruleId]?.[lang] ?? [];
}

export function slopeToPoint(p, lang) {
  const { m, b } = p;
  if (![m, b].every(Number.isFinite)) {
    return {
      ok: false,
      blocked: true,
      blockMessage: L(lang, "❌ Enter valid numbers for all parameters.", "❌ 请为所有参数输入有效数字。"),
      steps: [],
      mistakes: [],
      intuition: { title: "", lines: [] }
    };
  }
  const x1 = 0;
  const y1 = b;
  const steps = [
    { label: L(lang, "Read", "读取"), lines: [`m = ${fmt(m)},  b = ${fmt(b)}`] },
    {
      label: L(lang, "Pick point", "取点"),
      lines: [`Use x₁ = 0 → y₁ = m·0 + b = ${fmt(y1)}`, `Point: (${fmt(x1)}, ${fmt(y1)})`]
    },
    { label: L(lang, "Final", "结果"), lines: [buildPointSlope(m, x1, y1)] }
  ];
  return {
    ok: true,
    blocked: false,
    route: L(lang, "Slope-Intercept → Point-Slope", "斜截式 → 点斜式"),
    known: [`m = ${fmt(m)}`, `b = ${fmt(b)}`],
    target: ["(x₁, y₁)"],
    formulas: ["y₁ = mx₁ + b", "y − y₁ = m(x − x₁)"],
    steps,
    result: buildPointSlope(m, x1, y1),
    mistakes: mistakes("lin_slope_to_point", lang),
    intuition: {
      title: L(lang, "Why this works", "为什么成立"),
      lines: [L(lang, "Any point on the line works; (0, b) is fastest.", "任一点均可；(0, b) 最快。")]
    }
  };
}

export function pointToStandard(p, lang) {
  const { m, x1, y1 } = p;
  if (![m, x1, y1].every(Number.isFinite)) {
    return {
      ok: false,
      blocked: true,
      blockMessage: L(lang, "❌ Enter valid numbers for all parameters.", "❌ 请为所有参数输入有效数字。"),
      steps: [],
      mistakes: [],
      intuition: { title: "", lines: [] }
    };
  }
  const A = m;
  const B = -1;
  const C = y1 - m * x1;
  const steps = [
    { label: L(lang, "Read", "读取"), lines: [`m = ${fmt(m)},  (${fmt(x1)}, ${fmt(y1)})`] },
    {
      label: L(lang, "Expand", "展开"),
      lines: [`y − ${fmt(y1)} = ${fmt(m)}(x − ${fmt(x1)})`, `y = ${fmt(m)}x + ${fmt(y1 - m * x1)}`]
    },
    {
      label: L(lang, "Rearrange", "移项"),
      lines: [`${fmt(m)}x − y + ${fmt(y1 - m * x1)} = 0`]
    },
    {
      label: L(lang, "Final", "结果"),
      lines: [`${fmt(A)}x + ${fmt(B)}y + ${fmt(C)} = 0`]
    }
  ];
  return {
    ok: true,
    blocked: false,
    route: L(lang, "Point-Slope → Standard", "点斜式 → 标准式"),
    known: [`m = ${fmt(m)}`, `(${fmt(x1)}, ${fmt(y1)})`],
    target: ["A", "B", "C"],
    formulas: ["Expand", "Move all terms to one side"],
    steps,
    result: `${fmt(A)}x + ${fmt(B)}y + ${fmt(C)} = 0`,
    mistakes: mistakes("lin_point_to_standard", lang),
    intuition: {
      title: L(lang, "Why this works", "为什么成立"),
      lines: [L(lang, "Standard form is a rearrangement.", "标准式是移项整理。")]
    }
  };
}

export function standardToSlope(p, lang) {
  const { A, B, C } = p;
  if (![A, B, C].every(Number.isFinite)) {
    return {
      ok: false,
      blocked: true,
      blockMessage: L(lang, "❌ Enter valid numbers for all parameters.", "❌ 请为所有参数输入有效数字。"),
      steps: [],
      mistakes: [],
      intuition: { title: "", lines: [] }
    };
  }
  if (Math.abs(B) < EPS) {
    const xConst = Math.abs(A) < EPS ? NaN : -C / A;
    return {
      ok: false,
      blocked: true,
      blockMessage: L(
        lang,
        "❌ B = 0 — vertical line; no slope-intercept form.",
        "❌ B = 0 — 竖直线，无斜截式。"
      ),
      route: L(lang, "Standard → Slope-Intercept", "标准式 → 斜截式"),
      steps: [
        { label: L(lang, "Check", "检查"), lines: [`B = ${fmt(B)}`, `x = ${Number.isFinite(xConst) ? fmt(xConst) : "?"}`] }
      ],
      mistakes: mistakes("lin_standard_to_slope", lang),
      intuition: { title: L(lang, "Why this works", "为什么成立"), lines: [] }
    };
  }
  const m = -A / B;
  const b = -C / B;
  const steps = [
    { label: L(lang, "Read", "读取"), lines: [`A = ${fmt(A)},  B = ${fmt(B)},  C = ${fmt(C)}`] },
    {
      label: L(lang, "Solve for y", "解 y"),
      lines: [`By = −Ax − C`, `y = (−A/B)x + (−C/B)`]
    },
    {
      label: L(lang, "Simplify", "化简"),
      lines: [`m = −A/B = ${fmt(m)}`, `b = −C/B = ${fmt(b)}`]
    },
    { label: L(lang, "Final", "结果"), lines: [buildSlopeIntercept(m, b)] }
  ];
  return {
    ok: true,
    blocked: false,
    route: L(lang, "Standard → Slope-Intercept", "标准式 → 斜截式"),
    known: [`A = ${fmt(A)}`, `B = ${fmt(B)}`, `C = ${fmt(C)}`],
    target: ["m", "b"],
    formulas: ["m = −A/B", "b = −C/B"],
    steps,
    result: buildSlopeIntercept(m, b),
    mistakes: mistakes("lin_standard_to_slope", lang),
    intuition: {
      title: L(lang, "Why this works", "为什么成立"),
      lines: [L(lang, "Solving for y exposes slope and intercept.", "解出 y 即得斜率与截距。")]
    }
  };
}
