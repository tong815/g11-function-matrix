export const formulaCards = [
  { group: "quadratic", titleEN: "Quadratic Formula", titleZH: "求根公式", expr: "x = (-b ± √(b² - 4ac)) / 2a" },
  { group: "quadratic", titleEN: "Vertex from Standard", titleZH: "标准式求顶点", expr: "h = -b/(2a),  k = f(h)" },
  { group: "quadratic", titleEN: "Discriminant", titleZH: "判别式", expr: "Δ = b² - 4ac" },
  { group: "quadratic", titleEN: "Axis from Roots", titleZH: "由两根求对称轴", expr: "x = (r₁ + r₂)/2" },
  { group: "quadratic", titleEN: "Vertex Form", titleZH: "顶点式", expr: "y = a(x-h)² + k" },
  { group: "quadratic", titleEN: "Factored Roots", titleZH: "因式分解式（根）", expr: "y = a(x-r₁)(x-r₂)" },
  { group: "linear", titleEN: "Slope", titleZH: "斜率", expr: "m = (y₂ - y₁)/(x₂ - x₁)" },
  { group: "linear", titleEN: "Slope-Intercept", titleZH: "斜截式", expr: "y = mx + b" },
  { group: "linear", titleEN: "Point-Slope", titleZH: "点斜式", expr: "y - y₁ = m(x - x₁)" },
  { group: "linear", titleEN: "Perpendicular Slope", titleZH: "垂线斜率", expr: "m₂ = -1/m₁" },
  { group: "linear", titleEN: "Standard Form Slope", titleZH: "标准式斜率", expr: "m = -A/B" },
  { group: "exponential", titleEN: "Exponential Law", titleZH: "指数法则", expr: "b^(x+y) = b^x · b^y" },
  { group: "exponential", titleEN: "Transformed Exponential", titleZH: "变换指数式", expr: "y = a·b^(x-h) + k" },
  { group: "exponential", titleEN: "Asymptote", titleZH: "水平渐近线", expr: "y = k" },
  { group: "exponential", titleEN: "Growth / Decay", titleZH: "增长/衰减", expr: "b > 1 growth, 0 < b < 1 decay" },
  { group: "exponential", titleEN: "y-intercept", titleZH: "y 截距", expr: "y(0) = a·b^(-h) + k" },
  { group: "trig", titleEN: "SOH CAH TOA", titleZH: "SOH CAH TOA", expr: "sin=opp/hyp, cos=adj/hyp, tan=opp/adj" }
];

export const problemRouterData = {
  quadratic: [
    { problemEN: "Find vertex", problemZH: "求顶点", formEN: "Vertex Form", formZH: "顶点式" },
    { problemEN: "Find x-intercepts", problemZH: "求 x 截距", formEN: "Factored Form", formZH: "因式分解式" },
    { problemEN: "Find y-intercept", problemZH: "求 y 截距", formEN: "Standard Form", formZH: "标准式" },
    { problemEN: "Find max/min", problemZH: "求最大/最小值", formEN: "Vertex Form", formZH: "顶点式" },
    { problemEN: "Describe transformations", problemZH: "描述平移变换", formEN: "Vertex Form", formZH: "顶点式" },
    { problemEN: "Decide number of roots", problemZH: "判断根的个数", formEN: "Standard / Discriminant", formZH: "标准式 / 判别式" }
  ],
  linear: [
    { problemEN: "Find slope", problemZH: "求斜率", formEN: "Slope-Intercept / Point-Slope", formZH: "斜截式 / 点斜式" },
    { problemEN: "Given point + slope", problemZH: "已知一点+斜率", formEN: "Point-Slope", formZH: "点斜式" },
    { problemEN: "Graph line", problemZH: "直线作图", formEN: "Slope-Intercept", formZH: "斜截式" },
    { problemEN: "Find intercepts", problemZH: "求截距", formEN: "Standard Form", formZH: "标准式" },
    { problemEN: "Parallel / perpendicular", problemZH: "平行/垂直判断", formEN: "Any form → find slope", formZH: "任意形式先求斜率" }
  ],
  exponential: [
    { problemEN: "Identify base", problemZH: "识别底数", formEN: "Basic Form", formZH: "基础式" },
    { problemEN: "Read asymptote", problemZH: "读渐近线", formEN: "Transformed Form", formZH: "变换式" },
    { problemEN: "Growth or decay?", problemZH: "增长还是衰减？", formEN: "Basic Form", formZH: "基础式" },
    { problemEN: "Initial value", problemZH: "初始值", formEN: "Transformed Form", formZH: "变换式" },
    { problemEN: "Describe shifts", problemZH: "描述平移", formEN: "Transformed Form", formZH: "变换式" },
    { problemEN: "Domain and range", problemZH: "定义域与值域", formEN: "Transformed Form", formZH: "变换式" }
  ]
};
