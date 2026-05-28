import { EPS, fmt, buildFactoredExpression } from "../../math/format.js";
import { flowMistakesByRule } from "../../data/flowMistakes.js";
import {
  L,
  formatRational,
  buildVertexFormText,
  buildFactoredText
} from "../conversionMath.js";
import { featuresFromConversionParams } from "./quadraticFeatureHelper.js";

function mistakes(ruleId, lang) {
  return flowMistakesByRule[ruleId]?.[lang] ?? [];
}

function baseResult(route, known, target, formulas, steps, result, ruleId, lang, intuitionLines) {
  return {
    ok: true,
    blocked: false,
    route,
    known,
    target,
    formulas,
    steps,
    result,
    mistakes: mistakes(ruleId, lang),
    intuition: {
      title: L(lang, "Why this works", "为什么成立"),
      lines: intuitionLines
    }
  };
}

function blockedResult(route, blockMessage, ruleId, lang, partialSteps = []) {
  return {
    ok: false,
    blocked: true,
    blockMessage,
    route,
    known: [],
    target: [],
    formulas: [],
    steps: partialSteps,
    result: null,
    mistakes: mistakes(ruleId, lang),
    intuition: {
      title: L(lang, "Why this works", "为什么成立"),
      lines: []
    }
  };
}

function invalidParams(lang) {
  return {
    ok: false,
    blocked: true,
    blockMessage: L(lang, "❌ Enter valid numbers for all parameters.", "❌ 请为所有参数输入有效数字。"),
    steps: [],
    mistakes: [],
    intuition: { title: "", lines: [] }
  };
}

export function stdToVertex(p, lang) {
  const { a, b, c } = p;
  if (![a, b, c].every(Number.isFinite)) return invalidParams(lang);
  const features = featuresFromConversionParams("qStandard", p, lang);
  if (!features) return invalidParams(lang);
  if (Math.abs(a) < EPS) {
    return blockedResult(
      L(lang, "Standard → Vertex", "一般式 → 顶点式"),
      L(lang, "❌ a = 0 — not a quadratic.", "❌ a = 0 — 不是二次函数。"),
      "std_to_vertex",
      lang
    );
  }
  const { h, k } = features;
  const hFrac = formatRational(-b, 2 * a);
  const steps = [
    {
      label: L(lang, "Read", "读取"),
      lines: [`a = ${fmt(a)},  b = ${fmt(b)},  c = ${fmt(c)}`]
    },
    {
      label: L(lang, "Compute", "计算"),
      lines: ["h = −b / (2a)", `  = −(${fmt(b)}) / (2·${fmt(a)})`, `  = ${hFrac}`]
    },
    {
      label: L(lang, "Substitute", "代入"),
      lines: [
        `k = f(h) = ${fmt(a)}·(${fmt(h)})² + ${fmt(b)}·(${fmt(h)}) + ${fmt(c)}`,
        `  = ${fmt(k)}`
      ]
    },
    {
      label: L(lang, "Final", "结果"),
      lines: [buildVertexFormText(a, h, k)]
    }
  ];
  return baseResult(
    L(lang, "Standard → Vertex", "一般式 → 顶点式"),
    [`a = ${fmt(a)}`, `b = ${fmt(b)}`, `c = ${fmt(c)}`],
    ["h", "k"],
    ["h = −b / (2a)", "k = f(h)"],
    steps,
    buildVertexFormText(a, h, k),
    "std_to_vertex",
    lang,
    [L(lang, "Vertex x lies on axis x = −b/(2a).", "顶点横坐标在对称轴 x = −b/(2a) 上。")]
  );
}

export function vertexToStd(p, lang) {
  const { a, h, k } = p;
  if (![a, h, k].every(Number.isFinite)) return invalidParams(lang);
  const features = featuresFromConversionParams("qVertex", p, lang);
  if (!features?.valid) return invalidParams(lang);
  const { b, c } = features;
  const hSign = h >= 0 ? `- ${fmt(h)}` : `+ ${fmt(-h)}`;
  const steps = [
    {
      label: L(lang, "Read", "读取"),
      lines: [`a = ${fmt(a)},  h = ${fmt(h)},  k = ${fmt(k)}`]
    },
    {
      label: L(lang, "Expand", "展开"),
      lines: [`(x ${hSign})² = x² ${h >= 0 ? "- " + fmt(2 * h) + "x + " + fmt(h * h) : "+ " + fmt(-2 * h) + "x + " + fmt(h * h)}`]
    },
    {
      label: L(lang, "Multiply", "乘 a"),
      lines: [`${fmt(a)}·(expanded) + ${fmt(k)}`]
    },
    {
      label: L(lang, "Final", "结果"),
      lines: [`y = ${fmt(a)}x² ${b >= 0 ? "+ " + fmt(b) : "- " + fmt(Math.abs(b))}x ${c >= 0 ? "+ " + fmt(c) : "- " + fmt(Math.abs(c))}`]
    }
  ];
  return baseResult(
    L(lang, "Vertex → Standard", "顶点式 → 一般式"),
    [`a = ${fmt(a)}`, `h = ${fmt(h)}`, `k = ${fmt(k)}`],
    ["b", "c"],
    ["Expand (x − h)²", "Multiply by a", "Add k"],
    steps,
    `y = ${fmt(a)}x² ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b))}x ${c >= 0 ? "+" : "−"} ${fmt(Math.abs(c))}`,
    "vertex_to_std",
    lang,
    [L(lang, "Expanding unpacks the compressed vertex form.", "展开即还原一般式系数。")]
  );
}

export function stdToFact(p, lang) {
  const { a, b, c } = p;
  if (![a, b, c].every(Number.isFinite)) return invalidParams(lang);
  if (Math.abs(a) < EPS) {
    return blockedResult(
      L(lang, "Standard → Factored", "一般式 → 因式分解式"),
      L(lang, "❌ a = 0 — not a quadratic.", "❌ a = 0 — 不是二次函数。"),
      "std_to_fact",
      lang
    );
  }
  const features = featuresFromConversionParams("qStandard", p, lang);
  if (!features?.valid) return invalidParams(lang);
  const { delta, r1, r2 } = features;
  const steps = [
    { label: L(lang, "Read", "读取"), lines: [`a = ${fmt(a)},  b = ${fmt(b)},  c = ${fmt(c)}`] },
    {
      label: L(lang, "Check Δ", "检查 Δ"),
      lines: [
        "Δ = b² − 4ac",
        `  = (${fmt(b)})² − 4·${fmt(a)}·${fmt(c)}`,
        `  = ${fmt(delta)}`
      ]
    }
  ];
  if (delta < -EPS) {
    steps.push({
      label: L(lang, "Stop", "停止"),
      lines: [L(lang, "Δ < 0 → no real roots → no real factored form.", "Δ < 0 → 无实根 → 无实数因式分解式。")]
    });
    return blockedResult(
      L(lang, "Standard → Factored", "一般式 → 因式分解式"),
      L(lang, "❌ No real factored form exists (Δ < 0).", "❌ 不存在实数因式分解式（Δ < 0）。"),
      "std_to_fact",
      lang,
      steps
    );
  }
  const sqrtD = Math.sqrt(Math.max(0, delta));
  const root1 = r1 ?? (-b - sqrtD) / (2 * a);
  const root2 = r2 ?? (-b + sqrtD) / (2 * a);
  steps.push(
    {
      label: L(lang, "Compute roots", "求根"),
      lines: ["r = (−b ± √Δ) / (2a)", `r₁ = ${fmt(root1)},  r₂ = ${fmt(root2)}`]
    },
    { label: L(lang, "Final", "结果"), lines: [buildFactoredText(a, root1, root2)] }
  );
  return baseResult(
    L(lang, "Standard → Factored", "一般式 → 因式分解式"),
    [`a = ${fmt(a)}`, `b = ${fmt(b)}`, `c = ${fmt(c)}`],
    ["r₁", "r₂"],
    ["Δ = b² − 4ac", "r = (−b ± √Δ) / (2a)"],
    steps,
    buildFactoredText(a, root1, root2),
    "std_to_fact",
    lang,
    [L(lang, "Factored form encodes root positions.", "因式式表示根的位置。")]
  );
}

export function factToStd(p, lang) {
  const { a, r1, r2 } = p;
  if (![a, r1, r2].every(Number.isFinite)) return invalidParams(lang);
  const features = featuresFromConversionParams("qFactored", p, lang);
  if (!features?.valid) return invalidParams(lang);
  const { b, c } = features;
  const expanded = r1 * r2;
  const sum = r1 + r2;
  const steps = [
    { label: L(lang, "Read", "读取"), lines: [`a = ${fmt(a)},  r₁ = ${fmt(r1)},  r₂ = ${fmt(r2)}`] },
    {
      label: L(lang, "Expand", "展开"),
      lines: [`${buildFactoredExpression(1, r1, r2)} = x² − ${fmt(sum)}x + ${fmt(expanded)}`]
    },
    {
      label: L(lang, "Multiply by a", "乘 a"),
      lines: [`${fmt(a)}·(x² − ${fmt(sum)}x + ${fmt(expanded)}) = ${fmt(a)}x² ${b >= 0 ? "+ " + fmt(b) : "- " + fmt(Math.abs(b))}x ${c >= 0 ? "+ " + fmt(c) : "- " + fmt(Math.abs(c))}`]
    },
    {
      label: L(lang, "Final", "结果"),
      lines: [`y = ${fmt(a)}x² ${b >= 0 ? "+ " + fmt(b) : "- " + fmt(Math.abs(b))}x ${c >= 0 ? "+ " + fmt(c) : "- " + fmt(Math.abs(c))}`]
    }
  ];
  return baseResult(
    L(lang, "Factored → Standard", "因式分解式 → 一般式"),
    [`a = ${fmt(a)}`, `r₁ = ${fmt(r1)}`, `r₂ = ${fmt(r2)}`],
    ["b", "c"],
    ["Expand brackets", "Multiply by a"],
    steps,
    `y = ${fmt(a)}x² ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b))}x ${c >= 0 ? "+" : "−"} ${fmt(Math.abs(c))}`,
    "fact_to_std",
    lang,
    [L(lang, "Do not skip multiplying by a.", "不要忘记乘 a。")]
  );
}

export function factToVertex(p, lang) {
  const { a, r1, r2 } = p;
  if (![a, r1, r2].every(Number.isFinite)) return invalidParams(lang);
  const features = featuresFromConversionParams("qFactored", p, lang);
  if (!features?.valid) return invalidParams(lang);
  const { h, k } = features;
  const steps = [
    { label: L(lang, "Read", "读取"), lines: [`a = ${fmt(a)},  r₁ = ${fmt(r1)},  r₂ = ${fmt(r2)}`] },
    {
      label: L(lang, "Compute h", "算 h"),
      lines: ["h = (r₁ + r₂) / 2", `  = (${fmt(r1)} + ${fmt(r2)}) / 2 = ${fmt(h)}`]
    },
    {
      label: L(lang, "Substitute", "代入"),
      lines: [`k = ${fmt(a)}·(${fmt(h)} − ${fmt(r1)})·(${fmt(h)} − ${fmt(r2)}) = ${fmt(k)}`]
    },
    { label: L(lang, "Final", "结果"), lines: [buildVertexFormText(a, h, k)] }
  ];
  return baseResult(
    L(lang, "Factored → Vertex", "因式分解式 → 顶点式"),
    [`a = ${fmt(a)}`, `r₁ = ${fmt(r1)}`, `r₂ = ${fmt(r2)}`],
    ["h", "k"],
    ["h = (r₁ + r₂) / 2", "k = f(h)"],
    steps,
    buildVertexFormText(a, h, k),
    "fact_to_vertex",
    lang,
    [L(lang, "Vertex is at the midpoint of the roots.", "顶点在两根中点处。")]
  );
}

export function vertexToFact(p, lang) {
  const { a, h, k } = p;
  if (![a, h, k].every(Number.isFinite)) return invalidParams(lang);
  if (Math.abs(a) < EPS) {
    return blockedResult(
      L(lang, "Vertex → Factored", "顶点式 → 因式分解式"),
      L(lang, "❌ a = 0 — not a quadratic.", "❌ a = 0 — 不是二次函数。"),
      "vertex_to_fact",
      lang
    );
  }
  const rhs = -k / a;
  const steps = [
    { label: L(lang, "Read", "读取"), lines: [`a = ${fmt(a)},  h = ${fmt(h)},  k = ${fmt(k)}`] },
    { label: L(lang, "Set y = 0", "令 y = 0"), lines: ["0 = a(x − h)² + k"] },
    {
      label: L(lang, "Isolate", "孤立平方项"),
      lines: [`(x − h)² = −k/a = ${fmt(rhs)}`]
    }
  ];
  if (rhs < -EPS) {
    steps.push({
      label: L(lang, "Stop", "停止"),
      lines: [L(lang, "Right side < 0 → no real roots.", "右侧 < 0 → 无实根。")]
    });
    return blockedResult(
      L(lang, "Vertex → Factored", "顶点式 → 因式分解式"),
      L(lang, "❌ No real factored form exists (−k/a < 0).", "❌ 不存在实数因式分解式（−k/a < 0）。"),
      "vertex_to_fact",
      lang,
      steps
    );
  }
  const features = featuresFromConversionParams("qVertex", p, lang);
  if (!features?.valid || !features.hasRealRoots) {
    return blockedResult(
      L(lang, "Vertex → Factored", "顶点式 → 因式分解式"),
      L(lang, "❌ No real factored form exists (−k/a < 0).", "❌ 不存在实数因式分解式（−k/a < 0）。"),
      "vertex_to_fact",
      lang,
      steps
    );
  }
  const { r1, r2 } = features;
  steps.push(
    {
      label: L(lang, "Solve", "开方"),
      lines: [`x − h = ±${fmt(Math.sqrt(Math.max(0, rhs)))}`, `r₁ = ${fmt(r1)},  r₂ = ${fmt(r2)}`]
    },
    { label: L(lang, "Final", "结果"), lines: [buildFactoredText(a, r1, r2)] }
  );
  return baseResult(
    L(lang, "Vertex → Factored", "顶点式 → 因式分解式"),
    [`a = ${fmt(a)}`, `h = ${fmt(h)}`, `k = ${fmt(k)}`],
    ["r₁", "r₂"],
    ["(x − h)² = −k/a", "x = h ± √(−k/a)"],
    steps,
    buildFactoredText(a, r1, r2),
    "vertex_to_fact",
    lang,
    [L(lang, "Factoring = finding x-intercepts.", "因式分解 = 求 x 截距。")]
  );
}
