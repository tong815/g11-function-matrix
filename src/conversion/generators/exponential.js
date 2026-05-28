import { EPS, fmt } from "../../math/format.js";
import { buildBasicFormText, buildTransformedFormText } from "../../math/exponential.js";
import { flowMistakesByRule } from "../../data/flowMistakes.js";
import { L } from "../conversionMath.js";

function mistakes(ruleId, lang) {
  return flowMistakesByRule[ruleId]?.[lang] ?? [];
}

export function basicToTransformed(p, lang) {
  const { b } = p;
  if (!Number.isFinite(b) || b <= 0 || Math.abs(b - 1) < EPS) {
    return {
      ok: false,
      blocked: true,
      blockMessage: L(lang, "❌ b must be > 0 and b ≠ 1.", "❌ 底数 b 须 > 0 且 b ≠ 1。"),
      steps: [],
      mistakes: mistakes("exp_basic_to_transformed", lang),
      intuition: { title: "", lines: [] }
    };
  }
  const a = 1;
  const h = 0;
  const k = 0;
  const steps = [
    { label: L(lang, "Read", "读取"), lines: [`b = ${fmt(b)}  (${L(lang, "unchanged", "保持不变")})`] },
    {
      label: L(lang, "Choose shifts", "选定变换"),
      lines: [
        L(lang, "Set stretch a (example: a = 1)", "设伸缩 a（示例：a = 1）"),
        L(lang, "Set h, k for shifts (example: h = 0, k = 0)", "设平移 h, k（示例：h = 0, k = 0）")
      ]
    },
    { label: L(lang, "Final", "结果"), lines: [buildTransformedFormText(a, b, h, k)] }
  ];
  return {
    ok: true,
    blocked: false,
    route: L(lang, "Basic → Transformed", "基础式 → 变换式"),
    known: [`b = ${fmt(b)}`],
    target: ["a", "h", "k"],
    formulas: ["Keep b", "y = a·b^(x − h) + k"],
    steps,
    result: buildTransformedFormText(a, b, h, k),
    mistakes: mistakes("exp_basic_to_transformed", lang),
    intuition: {
      title: L(lang, "Why this works", "为什么成立"),
      lines: [L(lang, "Only a, h, k change; base b stays.", "只有 a, h, k 变；底数 b 不变。")]
    }
  };
}

export function transformedToBasic(p, lang) {
  const { a, b, h, k } = p;
  if (![a, b, h, k].every(Number.isFinite)) {
    return {
      ok: false,
      blocked: true,
      blockMessage: L(lang, "❌ Enter valid numbers for all parameters.", "❌ 请为所有参数输入有效数字。"),
      steps: [],
      mistakes: [],
      intuition: { title: "", lines: [] }
    };
  }
  if (Math.abs(a) < EPS) {
    return {
      ok: false,
      blocked: true,
      blockMessage: L(lang, "❌ a = 0 — invalid.", "❌ a = 0 — 无效。"),
      steps: [],
      mistakes: mistakes("exp_transformed_to_basic", lang),
      intuition: { title: "", lines: [] }
    };
  }
  if (b <= 0 || Math.abs(b - 1) < EPS) {
    return {
      ok: false,
      blocked: true,
      blockMessage: L(lang, "❌ b must be > 0 and b ≠ 1.", "❌ 底数 b 须 > 0 且 b ≠ 1。"),
      steps: [],
      mistakes: mistakes("exp_transformed_to_basic", lang),
      intuition: { title: "", lines: [] }
    };
  }
  const steps = [
    {
      label: L(lang, "Read", "读取"),
      lines: [`a = ${fmt(a)},  b = ${fmt(b)},  h = ${fmt(h)},  k = ${fmt(k)}`]
    },
    {
      label: L(lang, "Normalize", "归一化"),
      lines: ["a → 1,  h → 0,  k → 0", `b = ${fmt(b)}  (${L(lang, "unchanged", "不变")})`]
    },
    { label: L(lang, "Final", "结果"), lines: [buildBasicFormText(b)] }
  ];
  return {
    ok: true,
    blocked: false,
    route: L(lang, "Transformed → Basic", "变换式 → 基础式"),
    known: [`a = ${fmt(a)}`, `b = ${fmt(b)}`, `h = ${fmt(h)}`, `k = ${fmt(k)}`],
    target: ["b"],
    formulas: ["Set a=1, h=0, k=0; keep b"],
    steps,
    result: buildBasicFormText(b),
    mistakes: mistakes("exp_transformed_to_basic", lang),
    intuition: {
      title: L(lang, "Why this works", "为什么成立"),
      lines: [L(lang, "Basic form removes shifts and scaling.", "基础式去掉平移与伸缩。")]
    }
  };
}
