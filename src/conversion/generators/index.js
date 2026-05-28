import * as quadratic from "./quadratic.js";
import * as linear from "./linear.js";
import { flowMistakesByRule } from "../../data/flowMistakes.js";
import { L } from "../conversionMath.js";

const generators = {
  std_to_vertex: quadratic.stdToVertex,
  vertex_to_std: quadratic.vertexToStd,
  std_to_fact: quadratic.stdToFact,
  fact_to_std: quadratic.factToStd,
  fact_to_vertex: quadratic.factToVertex,
  vertex_to_fact: quadratic.vertexToFact,
  lin_slope_to_point: linear.slopeToPoint,
  lin_point_to_standard: linear.pointToStandard,
  lin_standard_to_slope: linear.standardToSlope
};

export function hasLiveGenerator(ruleId) {
  return Boolean(generators[ruleId]);
}

function staticFallback(ruleId, flowContent, lang) {
  const entry = flowContent?.[ruleId]?.[lang];
  if (!entry) {
    return {
      ok: false,
      blocked: true,
      blockMessage: L(lang, "No direct conversion rule available.", "没有直接转换规则。"),
      steps: [],
      mistakes: [],
      intuition: { title: "", lines: [] }
    };
  }
  const steps = (entry.algorithm || []).map((line, i) => ({
    label: `${i + 1}.`,
    lines: [line]
  }));
  if (entry.example) {
    steps.push({
      label: L(lang, "Example (static)", "例题（静态）"),
      lines: [entry.example.given, ...(entry.example.steps || [])]
    });
  }
  return {
    ok: true,
    blocked: false,
    route: entry.route,
    known: entry.known || [],
    target: entry.target || [],
    formulas: entry.formulas || [],
    steps,
    result: entry.example?.steps?.slice(-1)?.[0] || entry.route,
    mistakes: entry.mistakes || flowMistakesByRule[ruleId]?.[lang] || [],
    intuition: entry.intuition || { title: L(lang, "Why this works", "为什么成立"), lines: [] },
    static: true
  };
}

export function runConversionGenerator(ruleId, params, lang, flowContent) {
  const gen = generators[ruleId];
  if (gen) return gen(params, lang);
  return staticFallback(ruleId, flowContent, lang);
}

export { generators };
