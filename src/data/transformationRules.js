export const transformationRules = [
  {
    id: "std_to_fact",
    from: "Standard",
    to: "Factored",
    labelEN: "factoring",
    labelZH: "因式分解",
    text: "Standard -> Factored\n\n1) Set y=0\n2) Factor ax²+bx+c\n3) Rewrite as a(x-r₁)(x-r₂)\n\nExample:\ny = x² - 5x + 6\n= (x-2)(x-3)"
  },
  {
    id: "fact_to_std",
    from: "Factored",
    to: "Standard",
    labelEN: "expand",
    labelZH: "展开",
    text: "Factored -> Standard\n\n1) Expand product\n2) Collect like terms\n3) Keep as ax²+bx+c\n\nExample:\ny=(x-2)(x-3)=x²-5x+6"
  },
  {
    id: "std_to_vertex",
    from: "Standard",
    to: "Vertex",
    labelEN: "completing square",
    labelZH: "配方",
    text: "Standard -> Vertex\n\n1) Factor a from x-terms\n2) Complete square inside bracket\n3) Balance constants\n\nExample:\ny=x²-4x+1=(x-2)²-3"
  },
  {
    id: "vertex_to_std",
    from: "Vertex",
    to: "Standard",
    labelEN: "expand",
    labelZH: "展开",
    text: "Vertex -> Standard\n\n1) Expand (x-h)²\n2) Multiply by a\n3) Add k\n\nExample:\ny=(x-2)²-3=x²-4x+1"
  },
  {
    id: "fact_to_vertex",
    from: "Factored",
    to: "Vertex",
    labelEN: "midpoint + substitute",
    labelZH: "中点+代入",
    text: "Factored -> Vertex\n\n1) Read roots r₁,r₂\n2) Axis h=(r₁+r₂)/2\n3) Substitute h into function to get k\n\nExample:\ny=(x-1)(x-5), h=3, k=-4\n=> y=(x-3)²-4"
  },
  {
    id: "vertex_to_fact",
    from: "Vertex",
    to: "Factored",
    labelEN: "solve roots",
    labelZH: "解根",
    text: "Vertex -> Factored\n\n1) Set y=0\n2) Solve a(x-h)²+k=0\n3) Rewrite by roots\n\nExample:\ny=(x-2)²-4=(x-4)(x)"
  },
  {
    id: "lin_slope_to_point",
    from: "Slope-Intercept",
    to: "Point-Slope",
    labelEN: "point form",
    labelZH: "点斜式",
    text: "Slope-Intercept -> Point-Slope\n\n1) Pick a point on the line\n2) Keep slope m\n3) Write y-y₁=m(x-x₁)"
  },
  {
    id: "lin_point_to_standard",
    from: "Point-Slope",
    to: "Standard",
    labelEN: "rearrange",
    labelZH: "移项整理",
    text: "Point-Slope -> Standard\n\n1) Expand right side\n2) Move all terms to one side\n3) Write Ax+By+C=0"
  },
  {
    id: "lin_standard_to_slope",
    from: "Standard",
    to: "Slope-Intercept",
    labelEN: "solve for y",
    labelZH: "化成斜截式",
    text: "Standard -> Slope-Intercept\n\n1) Move Ax and C\n2) Divide by B (if B≠0)\n3) Read y=mx+b"
  }
];

export const flowContent = {
  std_to_fact: {
    en: { route: "Standard -> Factored", sections: [{ heading: "Steps", numbered: true, lines: ["Set y=0", "Try factoring ax²+bx+c", "If successful, write a(x-r₁)(x-r₂)", "Verify by expansion"] }, { heading: "Example", numbered: false, lines: ["y=x²-5x+6=(x-2)(x-3)"], mono: true }, { heading: "Note", numbered: false, lines: ["If not factorable nicely, use quadratic formula first."] }] },
    zh: { route: "标准式 -> 因式分解式", sections: [{ heading: "步骤", numbered: true, lines: ["令 y=0", "尝试分解 ax²+bx+c", "成功后写成 a(x-r₁)(x-r₂)", "反向展开核对"] }, { heading: "示例", numbered: false, lines: ["y=x²-5x+6=(x-2)(x-3)"], mono: true }, { heading: "备注", numbered: false, lines: ["若难分解，先用求根公式再写因式。"] }] }
  },
  fact_to_std: {
    en: { route: "Factored -> Standard", sections: [{ heading: "Steps", numbered: true, lines: ["Expand two brackets", "Multiply by a (if a≠1)", "Combine like terms into ax²+bx+c"] }, { heading: "Example", numbered: false, lines: ["y=2(x-2)(x+1)=2(x²-x-2)=2x²-2x-4"], mono: true }] },
    zh: { route: "因式分解式 -> 标准式", sections: [{ heading: "步骤", numbered: true, lines: ["先展开两个括号", "再乘前面的 a（若 a≠1）", "合并同类项成 ax²+bx+c"] }, { heading: "示例", numbered: false, lines: ["y=2(x-2)(x+1)=2(x²-x-2)=2x²-2x-4"], mono: true }] }
  },
  std_to_vertex: {
    en: { route: "Standard -> Vertex", sections: [{ heading: "Steps", numbered: true, lines: ["Group x-terms and factor out a", "Complete square inside bracket", "Add/subtract balancing constant", "Rewrite as a(x-h)²+k"] }, { heading: "Example", numbered: false, lines: ["y=x²-6x+5=(x²-6x+9)-4=(x-3)²-4"], mono: true }] },
    zh: { route: "标准式 -> 顶点式", sections: [{ heading: "步骤", numbered: true, lines: ["先把 x 项分组并提出 a", "在括号内配方", "同时加减平衡常数", "写成 a(x-h)²+k"] }, { heading: "示例", numbered: false, lines: ["y=x²-6x+5=(x²-6x+9)-4=(x-3)²-4"], mono: true }] }
  },
  vertex_to_std: {
    en: { route: "Vertex -> Standard", sections: [{ heading: "Steps", numbered: true, lines: ["Expand (x-h)²", "Multiply every term by a", "Add k and combine constants"] }, { heading: "Example", numbered: false, lines: ["y=-2(x-1)²+5=-2(x²-2x+1)+5=-2x²+4x+3"], mono: true }] },
    zh: { route: "顶点式 -> 标准式", sections: [{ heading: "步骤", numbered: true, lines: ["展开 (x-h)²", "每一项都乘 a", "加上 k 并合并常数"] }, { heading: "示例", numbered: false, lines: ["y=-2(x-1)²+5=-2(x²-2x+1)+5=-2x²+4x+3"], mono: true }] }
  },
  fact_to_vertex: {
    en: { route: "Factored -> Vertex", sections: [{ heading: "Steps", numbered: true, lines: ["Read roots r₁,r₂ from factors", "Compute midpoint h=(r₁+r₂)/2", "Substitute x=h to get k", "Write y=a(x-h)²+k"] }, { heading: "Example", numbered: false, lines: ["y=(x-1)(x-5): h=3, k=(3-1)(3-5)=-4", "=> y=(x-3)²-4"], mono: true }] },
    zh: { route: "因式分解式 -> 顶点式", sections: [{ heading: "步骤", numbered: true, lines: ["从因式读根 r₁,r₂", "算中点 h=(r₁+r₂)/2", "代入 x=h 求 k", "写成 y=a(x-h)²+k"] }, { heading: "示例", numbered: false, lines: ["y=(x-1)(x-5): h=3, k=(3-1)(3-5)=-4", "=> y=(x-3)²-4"], mono: true }] }
  },
  vertex_to_fact: {
    en: { route: "Vertex -> Factored", sections: [{ heading: "Steps", numbered: true, lines: ["Set y=0", "Isolate square term: (x-h)²=-k/a", "Solve roots x=h±sqrt(-k/a)", "Write y=a(x-r₁)(x-r₂)"] }, { heading: "Example", numbered: false, lines: ["y=(x-2)²-4 -> x=2±2 -> r₁=4,r₂=0", "=> y=(x-4)x"], mono: true }] },
    zh: { route: "顶点式 -> 因式分解式", sections: [{ heading: "步骤", numbered: true, lines: ["令 y=0", "先孤立平方项：(x-h)²=-k/a", "解根 x=h±sqrt(-k/a)", "写成 y=a(x-r₁)(x-r₂)"] }, { heading: "示例", numbered: false, lines: ["y=(x-2)²-4 -> x=2±2 -> r₁=4,r₂=0", "=> y=(x-4)x"], mono: true }] }
  },
  lin_slope_to_point: {
    en: { route: "Slope-Intercept -> Point-Slope", sections: [{ heading: "Steps", numbered: true, lines: ["Read slope m", "Pick a point (x₁,y₁) on the line", "Write y-y₁=m(x-x₁)"] }] },
    zh: { route: "斜截式 -> 点斜式", sections: [{ heading: "步骤", numbered: true, lines: ["读取斜率 m", "在线上取一点 (x₁,y₁)", "写成 y-y₁=m(x-x₁)"] }] }
  },
  lin_point_to_standard: {
    en: { route: "Point-Slope -> Standard", sections: [{ heading: "Steps", numbered: true, lines: ["Expand y-y₁=m(x-x₁)", "Move all terms to one side", "Collect as Ax+By+C=0"] }] },
    zh: { route: "点斜式 -> 标准式", sections: [{ heading: "步骤", numbered: true, lines: ["展开 y-y₁=m(x-x₁)", "移项到一侧", "整理为 Ax+By+C=0"] }] }
  },
  lin_standard_to_slope: {
    en: { route: "Standard -> Slope-Intercept", sections: [{ heading: "Steps", numbered: true, lines: ["Move Ax and C", "Divide by B (B≠0)", "Write y=mx+b"] }] },
    zh: { route: "标准式 -> 斜截式", sections: [{ heading: "步骤", numbered: true, lines: ["移项得到 By=-Ax-C", "两边除以 B（B≠0）", "写成 y=mx+b"] }] }
  }
};
