export const transformationRules = [
  {
    topic: "quadratic",
    id: "std_to_fact",
    from: "Standard",
    to: "Factored",
    labelEN: "factoring",
    labelZH: "因式分解"
  },
  {
    topic: "quadratic",
    id: "fact_to_std",
    from: "Factored",
    to: "Standard",
    labelEN: "expand",
    labelZH: "展开"
  },
  {
    topic: "quadratic",
    id: "std_to_vertex",
    from: "Standard",
    to: "Vertex",
    labelEN: "completing square",
    labelZH: "配方"
  },
  {
    topic: "quadratic",
    id: "vertex_to_std",
    from: "Vertex",
    to: "Standard",
    labelEN: "expand",
    labelZH: "展开"
  },
  {
    topic: "quadratic",
    id: "fact_to_vertex",
    from: "Factored",
    to: "Vertex",
    labelEN: "midpoint + substitute",
    labelZH: "中点+代入"
  },
  {
    topic: "quadratic",
    id: "vertex_to_fact",
    from: "Vertex",
    to: "Factored",
    labelEN: "solve roots",
    labelZH: "解根"
  },
  {
    topic: "linear",
    id: "lin_slope_to_point",
    from: "Slope-Intercept",
    to: "Point-Slope",
    labelEN: "point form",
    labelZH: "点斜式"
  },
  {
    topic: "linear",
    id: "lin_point_to_standard",
    from: "Point-Slope",
    to: "Standard",
    labelEN: "rearrange",
    labelZH: "移项整理"
  },
  {
    topic: "linear",
    id: "lin_standard_to_slope",
    from: "Standard",
    to: "Slope-Intercept",
    labelEN: "solve for y",
    labelZH: "化成斜截式"
  },
  {
    topic: "exponential",
    id: "exp_basic_to_transformed",
    from: "Basic",
    to: "Transformed",
    labelEN: "add shifts",
    labelZH: "加平移"
  },
  {
    topic: "exponential",
    id: "exp_transformed_to_basic",
    from: "Transformed",
    to: "Basic",
    labelEN: "normalize",
    labelZH: "归一化"
  }
];

export { flowContent } from "./flowContent.js";
