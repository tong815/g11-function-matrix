import { flowMistakesByRule } from "./flowMistakes.js";

/** Exam-style mechanical flow cards (en/zh per rule id). */
export const flowContent = {
  std_to_vertex: {
    en: {
      route: "Standard → Vertex",
      known: ["a, b, c from y = ax² + bx + c"],
      target: ["h, k for y = a(x − h)² + k"],
      formulas: ["h = −b / (2a)", "k = f(h) — plug x = h into the standard form"],
      algorithm: [
        "Read a, b, c from the equation.",
        "Compute h = −b / (2a).",
        "Substitute x = h into y = ax² + bx + c.",
        "The value of y is k.",
        "Write y = a(x − h)² + k."
      ],
      example: {
        given: "y = 3x² + 4x + 5",
        steps: [
          "a = 3,  b = 4,  c = 5",
          "h = −b/(2a) = −4/(2·3) = −2/3",
          "k = 3(−2/3)² + 4(−2/3) + 5 = 11/3",
          "Answer: y = 3(x + 2/3)² + 11/3"
        ]
      },
      notes: ["If a = 0, stop — not a quadratic."],
      intuition: {
        title: "Why this works",
        lines: [
          "The vertex x-coordinate lies on the axis of symmetry x = −b/(2a)."
        ]
      }
    },
    zh: {
      route: "一般式 → 顶点式",
      known: ["一般式 y = ax² + bx + c 中的 a, b, c"],
      target: ["顶点式 y = a(x − h)² + k 中的 h, k"],
      formulas: ["h = −b/(2a)", "k = f(h) — 把 x = h 代回一般式"],
      algorithm: [
        "从式子读出 a, b, c。",
        "算 h = −b/(2a)。",
        "把 x = h 代入 y = ax² + bx + c。",
        "算出的 y 值就是 k。",
        "写成 y = a(x − h)² + k。"
      ],
      example: {
        given: "y = 3x² + 4x + 5",
        steps: [
          "a = 3,  b = 4,  c = 5",
          "h = −b/(2a) = −4/(2·3) = −2/3",
          "k = 3(−2/3)² + 4(−2/3) + 5 = 11/3",
          "得到：y = 3(x + 2/3)² + 11/3"
        ]
      },
      notes: ["若 a = 0，停止 — 不是二次函数。"],
      intuition: {
        title: "为什么成立",
        lines: ["顶点横坐标在对称轴 x = −b/(2a) 上。"]
      }
    }
  },

  vertex_to_std: {
    en: {
      route: "Vertex → Standard",
      known: ["a, h, k from y = a(x − h)² + k"],
      target: ["b, c for y = ax² + bx + c"],
      formulas: ["(x − h)² = x² − 2hx + h²", "Multiply by a, add k, collect terms"],
      algorithm: [
        "Expand (x − h)².",
        "Multiply every term by a.",
        "Add k.",
        "Combine like terms; read b and c."
      ],
      example: {
        given: "y = 2(x − 3)² + 1",
        steps: [
          "(x − 3)² = x² − 6x + 9",
          "2(x² − 6x + 9) + 1 = 2x² − 12x + 19",
          "Answer: y = 2x² − 12x + 19  (a=2, b=−12, c=19)"
        ]
      },
      notes: ["Do not forget to multiply the squared bracket by a."],
      intuition: {
        title: "Why this works",
        lines: ["Vertex form is compressed; expanding recovers the standard coefficients."]
      }
    },
    zh: {
      route: "顶点式 → 一般式",
      known: ["顶点式 y = a(x − h)² + k 中的 a, h, k"],
      target: ["一般式 y = ax² + bx + c 中的 b, c"],
      formulas: ["(x − h)² = x² − 2hx + h²", "乘 a、加 k、合并同类项"],
      algorithm: [
        "展开 (x − h)²。",
        "每一项乘 a。",
        "加上 k。",
        "合并同类项，读出 b, c。"
      ],
      example: {
        given: "y = 2(x − 3)² + 1",
        steps: [
          "(x − 3)² = x² − 6x + 9",
          "2(x² − 6x + 9) + 1 = 2x² − 12x + 19",
          "得到：y = 2x² − 12x + 19  (a=2, b=−12, c=19)"
        ]
      },
      notes: ["不要忘记括号外的前系数 a。"],
      intuition: {
        title: "为什么成立",
        lines: ["顶点式是压缩写法，展开即回到一般式系数。"]
      }
    }
  },

  std_to_fact: {
    en: {
      route: "Standard → Factored",
      known: ["a, b, c from y = ax² + bx + c"],
      target: ["r₁, r₂ for y = a(x − r₁)(x − r₂)"],
      formulas: ["Δ = b² − 4ac", "r = (−b ± √Δ) / (2a)"],
      algorithm: [
        "Read a, b, c.",
        "Compute Δ = b² − 4ac.",
        "If Δ < 0: STOP — no real factored form.",
        "If Δ ≥ 0: compute r₁ and r₂ with the formula above.",
        "Write y = a(x − r₁)(x − r₂).",
        "If Δ = 0: both roots equal — use y = a(x − r)²."
      ],
      example: {
        given: "y = x² − 5x + 6",
        steps: [
          "a = 1, b = −5, c = 6",
          "Δ = (−5)² − 4(1)(6) = 25 − 24 = 1  (Δ ≥ 0, continue)",
          "r = (5 ± 1)/2 → r₁ = 2, r₂ = 3",
          "Answer: y = (x − 2)(x − 3)"
        ]
      },
      notes: [
        "Δ = 0 → one repeated root.",
        "Δ < 0 → no real roots, so no real factored form with real r₁, r₂."
      ],
      intuition: {
        title: "Why this works",
        lines: ["Factored form encodes where the parabola crosses the x-axis (roots)."]
      }
    },
    zh: {
      route: "一般式 → 因式分解式",
      known: ["一般式中的 a, b, c"],
      target: ["因式式 y = a(x − r₁)(x − r₂) 中的 r₁, r₂"],
      formulas: ["Δ = b² − 4ac", "r = (−b ± √Δ) / (2a)"],
      algorithm: [
        "读出 a, b, c。",
        "计算 Δ = b² − 4ac。",
        "若 Δ < 0：停止（无实数因式分解式）。",
        "若 Δ ≥ 0：用求根公式算 r₁, r₂。",
        "写成 y = a(x − r₁)(x − r₂)。",
        "若 Δ = 0：两根相同，写成 y = a(x − r)²。"
      ],
      example: {
        given: "y = x² − 5x + 6",
        steps: [
          "a = 1, b = −5, c = 6",
          "Δ = 25 − 24 = 1  （Δ ≥ 0，继续）",
          "r = (5 ± 1)/2 → r₁ = 2, r₂ = 3",
          "得到：y = (x − 2)(x − 3)"
        ]
      },
      notes: ["Δ = 0 时两根相同。", "Δ < 0 时无实根，不能写成实系数因式式。"],
      intuition: {
        title: "为什么成立",
        lines: ["因式式的本质是“根在 x 轴上的位置”。"]
      }
    }
  },

  fact_to_std: {
    en: {
      route: "Factored → Standard",
      known: ["a, r₁, r₂ from y = a(x − r₁)(x − r₂)"],
      target: ["b, c for y = ax² + bx + c"],
      formulas: ["FOIL the product, then multiply by a"],
      algorithm: [
        "Expand the two brackets (ignore a first).",
        "Multiply the polynomial by a — do not skip this step.",
        "Collect like terms into ax² + bx + c."
      ],
      example: {
        given: "y = 2(x − 2)(x + 1)",
        steps: [
          "(x − 2)(x + 1) = x² − x − 2",
          "2(x² − x − 2) = 2x² − 2x − 4",
          "Answer: y = 2x² − 2x − 4"
        ]
      },
      notes: ["Most common error: expand brackets but forget to multiply by a."],
      intuition: {
        title: "Why this works",
        lines: ["Multiplying factors is the reverse of factoring."]
      }
    },
    zh: {
      route: "因式分解式 → 一般式",
      known: ["y = a(x − r₁)(x − r₂) 中的 a, r₁, r₂"],
      target: ["一般式中的 b, c"],
      formulas: ["先展开括号，再整体乘 a"],
      algorithm: [
        "先展开两个括号（先不管 a）。",
        "整体乘 a — 这一步不能漏。",
        "合并同类项，写成 ax² + bx + c。"
      ],
      example: {
        given: "y = 2(x − 2)(x + 1)",
        steps: [
          "(x − 2)(x + 1) = x² − x − 2",
          "2(x² − x − 2) = 2x² − 2x − 4",
          "得到：y = 2x² − 2x − 4"
        ]
      },
      notes: ["最常见错误：展开后忘记乘 a。"],
      intuition: {
        title: "为什么成立",
        lines: ["展开是因式分解的逆运算。"]
      }
    }
  },

  fact_to_vertex: {
    en: {
      route: "Factored → Vertex",
      known: ["a, r₁, r₂ from y = a(x − r₁)(x − r₂)"],
      target: ["h, k for y = a(x − h)² + k"],
      formulas: ["h = (r₁ + r₂) / 2", "k = f(h) — substitute into the factored form"],
      algorithm: [
        "Read r₁ and r₂ from the factors.",
        "Compute h = (r₁ + r₂) / 2.",
        "Substitute x = h into the original equation to get k.",
        "Write y = a(x − h)² + k."
      ],
      example: {
        given: "y = (x − 1)(x − 5)",
        steps: [
          "r₁ = 1, r₂ = 5, a = 1",
          "h = (1 + 5)/2 = 3",
          "k = (3 − 1)(3 − 5) = (2)(−2) = −4",
          "Answer: y = (x − 3)² − 4"
        ]
      },
      notes: ["Axis of symmetry is always the midpoint of the roots."],
      intuition: {
        title: "Why this works",
        lines: ["The vertex lies on the axis halfway between the two roots."]
      }
    },
    zh: {
      route: "因式分解式 → 顶点式",
      known: ["因式式中的 a, r₁, r₂"],
      target: ["顶点式中的 h, k"],
      formulas: ["h = (r₁ + r₂)/2", "k = f(h) — 代入原式"],
      algorithm: [
        "从因式读出 r₁, r₂。",
        "算 h = (r₁ + r₂)/2。",
        "把 x = h 代回原式求 k。",
        "写成 y = a(x − h)² + k。"
      ],
      example: {
        given: "y = (x − 1)(x − 5)",
        steps: [
          "r₁ = 1, r₂ = 5, a = 1",
          "h = (1 + 5)/2 = 3",
          "k = (3 − 1)(3 − 5) = −4",
          "得到：y = (x − 3)² − 4"
        ]
      },
      notes: ["对称轴恒为两根的中点。"],
      intuition: {
        title: "为什么成立",
        lines: ["顶点在对称轴上，即两根的中点处。"]
      }
    }
  },

  vertex_to_fact: {
    en: {
      route: "Vertex → Factored",
      known: ["a, h, k from y = a(x − h)² + k"],
      target: ["r₁, r₂ for y = a(x − r₁)(x − r₂)"],
      formulas: ["Set y = 0 → (x − h)² = −k/a", "x = h ± √(−k/a)"],
      algorithm: [
        "Set y = 0.",
        "Isolate the square: (x − h)² = −k/a.",
        "If −k/a < 0: STOP — no real roots, no real factored form.",
        "If −k/a ≥ 0: take square roots → r₁, r₂.",
        "Write y = a(x − r₁)(x − r₂)."
      ],
      example: {
        given: "y = (x − 2)² − 4",
        steps: [
          "0 = (x − 2)² − 4 → (x − 2)² = 4  (right side ≥ 0, continue)",
          "x − 2 = ±2 → x = 4 or x = 0",
          "r₁ = 4, r₂ = 0",
          "Answer: y = (x − 4)(x − 0) = x(x − 4)"
        ]
      },
      notes: ["Check −k/a before taking square roots.", "If a ≠ 1, keep a in front: y = a(x − r₁)(x − r₂)."],
      intuition: {
        title: "Why this works",
        lines: ["Factoring is equivalent to solving ax² + bx + c = 0 for x-intercepts."]
      }
    },
    zh: {
      route: "顶点式 → 因式分解式",
      known: ["顶点式中的 a, h, k"],
      target: ["因式式中的 r₁, r₂"],
      formulas: ["令 y = 0 → (x − h)² = −k/a", "x = h ± √(−k/a)"],
      algorithm: [
        "令 y = 0。",
        "孤立平方项：(x − h)² = −k/a。",
        "若 −k/a < 0：停止（无实根，无实因式式）。",
        "若 −k/a ≥ 0：开方得 r₁, r₂。",
        "写成 y = a(x − r₁)(x − r₂)。"
      ],
      example: {
        given: "y = (x − 2)² − 4",
        steps: [
          "(x − 2)² = 4  （右侧 ≥ 0，继续）",
          "x − 2 = ±2 → x = 4 或 0",
          "r₁ = 4, r₂ = 0",
          "得到：y = x(x − 4)"
        ]
      },
      notes: ["开方前先判断 −k/a 是否 ≥ 0。", "a ≠ 1 时前面保留 a。"],
      intuition: {
        title: "为什么成立",
        lines: ["因式分解等价于求抛物线与 x 轴交点（实根）。"]
      }
    }
  },

  lin_slope_to_point: {
    en: {
      route: "Slope-Intercept → Point-Slope",
      known: ["m, b from y = mx + b"],
      target: ["(x₁, y₁) and point-slope form"],
      formulas: ["Pick any x on the line; y₁ = mx₁ + b", "y − y₁ = m(x − x₁)"],
      algorithm: [
        "Read slope m and y-intercept b.",
        "Choose a convenient x₁ (often 0 or 1).",
        "Compute y₁ = mx₁ + b.",
        "Write y − y₁ = m(x − x₁)."
      ],
      example: {
        given: "y = 2x + 3",
        steps: [
          "m = 2, b = 3",
          "Take x₁ = 0 → y₁ = 3  (point (0, 3))",
          "Answer: y − 3 = 2(x − 0)  or  y − 3 = 2x"
        ]
      },
      notes: ["Any point on the line works; (0, b) is fastest when b is known."],
      intuition: {
        title: "Why this works",
        lines: ["Point-slope only needs one point and the slope — same line, different packaging."]
      }
    },
    zh: {
      route: "斜截式 → 点斜式",
      known: ["y = mx + b 中的 m, b"],
      target: ["一点 (x₁, y₁) 与点斜式"],
      formulas: ["任取 x₁，算 y₁ = mx₁ + b", "y − y₁ = m(x − x₁)"],
      algorithm: [
        "读出斜率 m 与 y 截距 b。",
        "任取方便的 x₁（常用 0 或 1）。",
        "算 y₁ = mx₁ + b。",
        "写成 y − y₁ = m(x − x₁)。"
      ],
      example: {
        given: "y = 2x + 3",
        steps: [
          "m = 2, b = 3",
          "取 x₁ = 0 → y₁ = 3，点 (0, 3)",
          "得到：y − 3 = 2(x − 0)"
        ]
      },
      notes: ["直线上任一点均可；(0, b) 在已知 b 时最快。"],
      intuition: {
        title: "为什么成立",
        lines: ["点斜式只需一点和斜率，描述的是同一条直线。"]
      }
    }
  },

  lin_point_to_standard: {
    en: {
      route: "Point-Slope → Standard",
      known: ["m, x₁, y₁ from y − y₁ = m(x − x₁)"],
      target: ["A, B, C for Ax + By + C = 0"],
      formulas: ["Expand, move all terms to one side, integer coefficients if possible"],
      algorithm: [
        "Expand the right side: y − y₁ = mx − mx₁.",
        "Move every term to the left side.",
        "Collect x, y, and constants → Ax + By + C = 0.",
        "Optionally multiply so A, B, C are integers."
      ],
      example: {
        given: "y − 1 = 2(x − 3)",
        steps: [
          "y − 1 = 2x − 6",
          "y − 2x − 1 + 6 = 0",
          "Answer: −2x + y + 5 = 0  (or 2x − y − 5 = 0)"
        ]
      },
      notes: ["Standard form is not unique — any nonzero multiple is equivalent."],
      intuition: {
        title: "Why this works",
        lines: ["Standard form is a rearrangement of the same linear equation."]
      }
    },
    zh: {
      route: "点斜式 → 标准式",
      known: ["点斜式中的 m, x₁, y₁"],
      target: ["Ax + By + C = 0 中的 A, B, C"],
      formulas: ["展开、移项、整理"],
      algorithm: [
        "展开右侧：y − y₁ = mx − mx₁。",
        "所有项移到左边。",
        "合并 x、y 与常数项 → Ax + By + C = 0。",
        "必要时同乘使 A, B, C 为整数。"
      ],
      example: {
        given: "y − 1 = 2(x − 3)",
        steps: [
          "y − 1 = 2x − 6",
          "y − 2x + 5 = 0",
          "得到：2x − y − 5 = 0"
        ]
      },
      notes: ["标准式不唯一，同乘非零常数仍等价。"],
      intuition: {
        title: "为什么成立",
        lines: ["标准式只是同一直线方程的移项写法。"]
      }
    }
  },

  lin_standard_to_slope: {
    en: {
      route: "Standard → Slope-Intercept",
      known: ["A, B, C from Ax + By + C = 0"],
      target: ["m, b for y = mx + b"],
      formulas: ["If B ≠ 0: y = (−A/B)x + (−C/B)", "m = −A/B, b = −C/B"],
      algorithm: [
        "Check B ≠ 0; if B = 0, stop — vertical line has no slope-intercept form.",
        "Move Ax and C to the other side: By = −Ax − C.",
        "Divide every term by B.",
        "Read m = −A/B and b = −C/B."
      ],
      example: {
        given: "2x + 3y − 6 = 0",
        steps: [
          "B = 3 ≠ 0, continue",
          "3y = −2x + 6",
          "y = (−2/3)x + 2",
          "Answer: m = −2/3, b = 2"
        ]
      },
      notes: ["If B = 0: vertical line x = −C/A — no y = mx + b form."],
      intuition: {
        title: "Why this works",
        lines: ["Solving for y isolates slope and intercept explicitly."]
      }
    },
    zh: {
      route: "标准式 → 斜截式",
      known: ["Ax + By + C = 0 中的 A, B, C"],
      target: ["y = mx + b 中的 m, b"],
      formulas: ["B ≠ 0 时：y = (−A/B)x + (−C/B)", "m = −A/B, b = −C/B"],
      algorithm: [
        "检查 B ≠ 0；若 B = 0，停止 — 竖直线无斜截式。",
        "移项：By = −Ax − C。",
        "两边除以 B。",
        "读出 m = −A/B，b = −C/B。"
      ],
      example: {
        given: "2x + 3y − 6 = 0",
        steps: [
          "B = 3 ≠ 0，继续",
          "3y = −2x + 6",
          "y = (−2/3)x + 2",
          "得到：m = −2/3, b = 2"
        ]
      },
      notes: ["B = 0 时为竖直线 x = −C/A，没有 y = mx + b。"],
      intuition: {
        title: "为什么成立",
        lines: ["解出 y 即显式得到斜率与截距。"]
      }
    }
  },

  exp_basic_to_transformed: {
    en: {
      route: "Basic → Transformed",
      known: ["b from y = b^x"],
      target: ["a, h, k for y = a·b^(x − h) + k"],
      formulas: ["b stays the same", "Choose a (stretch/reflect), h (horizontal), k (vertical)"],
      algorithm: [
        "Keep base b unchanged.",
        "Set vertical stretch/reflection a (often given by the problem).",
        "Add horizontal shift h (inside the exponent).",
        "Add vertical shift k (outside).",
        "Write y = a·b^(x − h) + k."
      ],
      example: {
        given: "Start from y = 2^x; stretch by 3, shift right 1, up 4",
        steps: [
          "b = 2  (unchanged)",
          "a = 3, h = 1, k = 4",
          "Answer: y = 3·2^(x − 1) + 4"
        ]
      },
      notes: ["Only a, h, k change; b is the same base throughout.", "h shifts right when positive in (x − h)."],
      intuition: {
        title: "Why this works",
        lines: ["Transformed form layers stretch and shifts on the same base b^x."]
      }
    },
    zh: {
      route: "基础式 → 变换式",
      known: ["y = b^x 中的底数 b"],
      target: ["y = a·b^(x − h) + k 中的 a, h, k"],
      formulas: ["b 保持不变", "选定伸缩 a、水平 h、竖直 k"],
      algorithm: [
        "底数 b 不变。",
        "确定竖直伸缩/反射 a（常由题意给出）。",
        "在指数内加水平平移 h。",
        "在外面加竖直平移 k。",
        "写成 y = a·b^(x − h) + k。"
      ],
      example: {
        given: "从 y = 2^x 出发：纵向伸 3 倍，右移 1，上移 4",
        steps: [
          "b = 2（不变）",
          "a = 3, h = 1, k = 4",
          "得到：y = 3·2^(x − 1) + 4"
        ]
      },
      notes: ["只有 a, h, k 在变；b 始终是同一个底数。", "指数里写 (x − h)，h > 0 时图像右移。"],
      intuition: {
        title: "为什么成立",
        lines: ["变换式是在同一底数 b^x 上叠加伸缩与平移。"]
      }
    }
  },

  exp_transformed_to_basic: {
    en: {
      route: "Transformed → Basic",
      known: ["a, b, h, k from y = a·b^(x − h) + k"],
      target: ["b for y = b^x"],
      formulas: ["Set a = 1, h = 0, k = 0; keep the same b"],
      algorithm: [
        "Identify current a, b, h, k.",
        "Set a → 1, h → 0, k → 0.",
        "Do not change b.",
        "Write y = b^x."
      ],
      example: {
        given: "y = 3·2^(x − 1) + 4",
        steps: [
          "Remove stretch/shifts: a=1, h=0, k=0",
          "b = 2  (unchanged)",
          "Answer: y = 2^x"
        ]
      },
      notes: ["Normalizing removes all transformations except the base."],
      intuition: {
        title: "Why this works",
        lines: ["Basic form is the normalized core curve before shifts and scaling."]
      }
    },
    zh: {
      route: "变换式 → 基础式",
      known: ["变换式中的 a, b, h, k"],
      target: ["基础式中的 b"],
      formulas: ["令 a = 1, h = 0, k = 0；b 不变"],
      algorithm: [
        "读出当前 a, b, h, k。",
        "令 a = 1, h = 0, k = 0。",
        "b 不改。",
        "写成 y = b^x。"
      ],
      example: {
        given: "y = 3·2^(x − 1) + 4",
        steps: [
          "去掉伸缩与平移：a=1, h=0, k=0",
          "b = 2（不变）",
          "得到：y = 2^x"
        ]
      },
      notes: ["归一化即去掉除底数外的所有变换。"],
      intuition: {
        title: "为什么成立",
        lines: ["基础式是去掉平移与伸缩后的核心指数曲线。"]
      }
    }
  }
};

for (const [ruleId, mistakes] of Object.entries(flowMistakesByRule)) {
  const entry = flowContent[ruleId];
  if (!entry) continue;
  for (const lang of ["en", "zh"]) {
    if (entry[lang] && mistakes[lang]) entry[lang].mistakes = mistakes[lang];
  }
}
