export const LevelClass = {
  direct: "good",
  derivable: "derive",
  weak: "weak"
};

export const quadraticMatrix = {
  key: "quadratic",
  forms: [
    { id: "qStandard", equation: "y = ax² + bx + c", representationType: "algebraic" },
    { id: "qFactored", equation: "y = a(x-r₁)(x-r₂)", representationType: "algebraic" },
    { id: "qVertex", equation: "y = a(x-h)² + k", representationType: "transform" }
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

export const linearMatrix = {
  key: "linear",
  forms: [
    { id: "lSlope", equation: "y = mx + b", representationType: "algebraic" },
    { id: "lPoint", equation: "y - y₁ = m(x - x₁)", representationType: "geometric" },
    { id: "lStandard", equation: "Ax + By + C = 0", representationType: "algebraic" }
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
