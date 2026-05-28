/** Common mistakes per rule (merged into flowContent at load). */
export const flowMistakesByRule = {
  std_to_vertex: {
    en: ["Dividing by 2a but forgetting the minus in h = −b/(2a)", "Arithmetic errors when substituting x = h into the standard form"],
    zh: ["算 h 时漏掉负号：h = −b/(2a)", "代入 x = h 求 k 时计算错误"]
  },
  vertex_to_std: {
    en: ["Sign errors expanding (x − h)²", "Forgetting to multiply every term by a after expanding"],
    zh: ["(x − h)² 展开时符号搞错", "展开后忘记每一项乘 a"]
  },
  std_to_fact: {
    en: [
      "Skipping the discriminant check before factoring",
      "Trying to factor when Δ < 0",
      "Sign mistakes in r = (−b ± √Δ) / (2a)"
    ],
    zh: ["分解前忘记先算 Δ", "Δ < 0 仍强行写因式分解式", "求根公式中 ± 或符号抄错"]
  },
  fact_to_std: {
    en: ["Expanding brackets but forgetting to multiply by a"],
    zh: ["展开括号后忘记乘前面的 a"]
  },
  fact_to_vertex: {
    en: ["Using r₁ − r₂ instead of (r₁ + r₂)/2 for h", "Substituting the wrong x when finding k"],
    zh: ["h 误写成 r₁ − r₂，应为 (r₁ + r₂)/2", "代入求 k 时 x 值用错"]
  },
  vertex_to_fact: {
    en: [
      "Taking square roots before checking −k/a ≥ 0",
      "Dropping the leading a in y = a(x − r₁)(x − r₂)"
    ],
    zh: ["未判断 −k/a ≥ 0 就开方", "写因式式时漏掉前面的系数 a"]
  },
  lin_slope_to_point: {
    en: ["Using a point that is not on the line", "Slope m copied with wrong sign"],
    zh: ["取的点不在直线上", "斜率 m 符号抄错"]
  },
  lin_point_to_standard: {
    en: ["Leaving terms on both sides instead of Ax + By + C = 0", "Sign errors when moving terms"],
    zh: ["移项后仍两边都有项，未整理成 Ax + By + C = 0", "移项变号错误"]
  },
  lin_standard_to_slope: {
    en: [
      "Dividing by B when B = 0 (vertical line)",
      "Sign error: m should be −A/B, not A/B"
    ],
    zh: ["B = 0 时仍强行化成斜截式（竖直线）", "斜率误写成 A/B，应为 −A/B"]
  },
};
