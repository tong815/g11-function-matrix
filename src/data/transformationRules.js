export const transformationRules = [
  {
    topic: "quadratic",
    id: "std_to_fact",
    from: "Standard",
    to: "Factored",
    fromFormId: "qStandard",
    toFormId: "qFactored",
    labelEN: "factoring",
    labelZH: "因式分解"
  },
  {
    topic: "quadratic",
    id: "fact_to_std",
    from: "Factored",
    to: "Standard",
    fromFormId: "qFactored",
    toFormId: "qStandard",
    labelEN: "expand",
    labelZH: "展开"
  },
  {
    topic: "quadratic",
    id: "std_to_vertex",
    from: "Standard",
    to: "Vertex",
    fromFormId: "qStandard",
    toFormId: "qVertex",
    labelEN: "completing square",
    labelZH: "配方"
  },
  {
    topic: "quadratic",
    id: "vertex_to_std",
    from: "Vertex",
    to: "Standard",
    fromFormId: "qVertex",
    toFormId: "qStandard",
    labelEN: "expand",
    labelZH: "展开"
  },
  {
    topic: "quadratic",
    id: "fact_to_vertex",
    from: "Factored",
    to: "Vertex",
    fromFormId: "qFactored",
    toFormId: "qVertex",
    labelEN: "midpoint + substitute",
    labelZH: "中点+代入"
  },
  {
    topic: "quadratic",
    id: "vertex_to_fact",
    from: "Vertex",
    to: "Factored",
    fromFormId: "qVertex",
    toFormId: "qFactored",
    labelEN: "solve roots",
    labelZH: "解根"
  },
  {
    topic: "linear",
    id: "lin_slope_to_point",
    from: "Slope-Intercept",
    to: "Point-Slope",
    fromFormId: "lSlope",
    toFormId: "lPoint",
    labelEN: "point form",
    labelZH: "点斜式"
  },
  {
    topic: "linear",
    id: "lin_point_to_standard",
    from: "Point-Slope",
    to: "Standard",
    fromFormId: "lPoint",
    toFormId: "lStandard",
    labelEN: "rearrange",
    labelZH: "移项整理"
  },
  {
    topic: "linear",
    id: "lin_standard_to_slope",
    from: "Standard",
    to: "Slope-Intercept",
    fromFormId: "lStandard",
    toFormId: "lSlope",
    labelEN: "solve for y",
    labelZH: "化成斜截式"
  },
  {
    topic: "exponential",
    id: "exp_basic_to_transformed",
    from: "Basic",
    to: "Transformed",
    fromFormId: "eBasic",
    toFormId: "eTransformed",
    labelEN: "add shifts",
    labelZH: "加平移"
  },
  {
    topic: "exponential",
    id: "exp_transformed_to_basic",
    from: "Transformed",
    to: "Basic",
    fromFormId: "eTransformed",
    toFormId: "eBasic",
    labelEN: "normalize",
    labelZH: "归一化"
  }
];

export { flowContent } from "./flowContent.js";
