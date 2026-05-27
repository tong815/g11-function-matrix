export const LevelClass = {
  direct: "good",
  derivable: "derive",
  weak: "weak"
};

export const quadraticMatrix = {
  key: "quadratic",
  objectLabelKey: "graphQuadratic",
  forms: [
    { id: "qStandard", equation: "y = ax² + bx + c", representationType: "algebraic", labelKey: "formStandardLabel" },
    { id: "qFactored", equation: "y = a(x-r₁)(x-r₂)", representationType: "algebraic", labelKey: "formFactoredLabel" },
    { id: "qVertex", equation: "y = a(x-h)² + k", representationType: "transform", labelKey: "formVertexLabel" }
  ],
  info: ["vertex", "xint", "yint", "axis", "extreme", "opening", "transform"],
  cells: {
    vertex: { qStandard: "derivable", qFactored: "derivable", qVertex: "direct" },
    xint: { qStandard: "derivable", qFactored: "direct", qVertex: "derivable" },
    yint: { qStandard: "direct", qFactored: "derivable", qVertex: "derivable" },
    axis: { qStandard: "derivable", qFactored: "derivable", qVertex: "direct" },
    extreme: { qStandard: "derivable", qFactored: "derivable", qVertex: "direct" },
    opening: { qStandard: "direct", qFactored: "direct", qVertex: "direct" },
    transform: { qStandard: "weak", qFactored: "derivable", qVertex: "direct" }
  }
};

export const exponentialMatrix = {
  key: "exponential",
  objectLabelKey: "graphExponential",
  forms: [
    { id: "eBasic", equation: "y = b^x", representationType: "algebraic", labelKey: "formExponentialBasicLabel" },
    {
      id: "eTransformed",
      equation: "y = a·b^(x-h) + k",
      representationType: "transform",
      labelKey: "formExponentialTransformedLabel"
    },
    {
      id: "eGrowthDecay",
      equation: "y = A·r^x",
      representationType: "analytic",
      labelKey: "formExponentialGrowthDecayLabel"
    }
  ],
  info: ["base", "initialValue", "growthDecay", "asymptote", "domainRange", "transformations"],
  cells: {
    base: { eBasic: "direct", eTransformed: "direct", eGrowthDecay: "direct" },
    initialValue: { eBasic: "derivable", eTransformed: "derivable", eGrowthDecay: "direct" },
    growthDecay: { eBasic: "direct", eTransformed: "derivable", eGrowthDecay: "direct" },
    asymptote: { eBasic: "derivable", eTransformed: "direct", eGrowthDecay: "derivable" },
    domainRange: { eBasic: "derivable", eTransformed: "derivable", eGrowthDecay: "derivable" },
    transformations: { eBasic: "weak", eTransformed: "direct", eGrowthDecay: "weak" }
  }
};

export const linearMatrix = {
  key: "linear",
  objectLabelKey: "graphLinear",
  forms: [
    { id: "lSlope", equation: "y = mx + b", representationType: "algebraic", labelKey: "formLinearSlopeLabel" },
    { id: "lPoint", equation: "y - y₁ = m(x - x₁)", representationType: "geometric", labelKey: "formLinearPointLabel" },
    { id: "lStandard", equation: "Ax + By + C = 0", representationType: "algebraic", labelKey: "formLinearStandardLabel" }
  ],
  info: ["slope", "yint", "knownPoint", "parallel", "perpendicular", "graphing"],
  cells: {
    slope: { lSlope: "direct", lPoint: "direct", lStandard: "derivable" },
    yint: { lSlope: "direct", lPoint: "derivable", lStandard: "derivable" },
    knownPoint: { lSlope: "weak", lPoint: "direct", lStandard: "derivable" },
    parallel: { lSlope: "direct", lPoint: "direct", lStandard: "derivable" },
    perpendicular: { lSlope: "direct", lPoint: "direct", lStandard: "derivable" },
    graphing: { lSlope: "direct", lPoint: "derivable", lStandard: "derivable" }
  }
};
