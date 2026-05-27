export function D(whyEN, stepsEN, exEN, misEN, whyZH, stepsZH, exZH, misZH) {
  return {
    en: { why: whyEN, steps: stepsEN, example: exEN, mistake: misEN },
    zh: { why: whyZH, steps: stepsZH, example: exZH, mistake: misZH }
  };
}

export const detailLibrary = {
  "quadratic|qStandard|vertex": D(
    "Standard form does not show vertex directly; compute axis first, then substitute.",
    ["Identify a, b, c", "Compute h=-b/(2a)", "Substitute x=h into y=ax²+bx+c", "Vertex=(h,k)"],
    "y=x²-6x+5: h=3, k=9-18+5=-4, Vertex=(3,-4)",
    "Missing the minus in -b/(2a), or forgetting brackets around 2a.",
    "标准式不能直读顶点，先求对称轴再代回即可稳定得到。",
    ["识别 a,b,c", "计算 h=-b/(2a)", "把 x=h 代回 y=ax²+bx+c", "顶点=(h,k)"],
    "y=x²-6x+5: h=3, k=9-18+5=-4, 顶点=(3,-4)",
    "-b/(2a) 的负号或 2a 括号容易错。"
  ),
  "quadratic|qStandard|xint": D(
    "Set y=0 and solve a quadratic equation.",
    ["Set y=0", "Solve ax²+bx+c=0", "Use factoring if easy; otherwise quadratic formula", "Write (x1,0),(x2,0)"],
    "y=x²-5x+6 -> 0=(x-2)(x-3), intercepts: (2,0),(3,0); Δ=b²-4ac controls root count.",
    "Forgetting discriminant logic: Δ>0 two roots, Δ=0 one, Δ<0 no real roots.",
    "令 y=0 后解二次方程即可。",
    ["令 y=0", "解 ax²+bx+c=0", "能因式分解先分解，不能就用求根公式", "写出 (x1,0),(x2,0)"],
    "y=x²-5x+6 -> 0=(x-2)(x-3)，截距：(2,0),(3,0)；根的个数由 Δ=b²-4ac 决定。",
    "忘记判别式结论：Δ>0 两个，Δ=0 一个，Δ<0 无实根。"
  ),
  "quadratic|qStandard|yint": D(
    "At x=0, the value is c.",
    ["Set x=0", "Get y=c", "Write point (0,c)"],
    "y=x²-6x+5 -> y-int=(0,5)",
    "y-intercept is a point (0,c), not just 'c'.",
    "x=0 时只剩 c。",
    ["令 x=0", "得到 y=c", "写点 (0,c)"],
    "y=x²-6x+5 -> y 截距=(0,5)",
    "y 截距是点 (0,c)，不是只写 c。"
  ),
  "quadratic|qStandard|axis": D(
    "Axis is computed from coefficients.",
    ["Identify a and b", "Compute x=-b/(2a)", "Write axis line x=h"],
    "y=2x²+8x+1 -> axis x=-8/4=-2",
    "Using -b/2*a instead of -b/(2a).",
    "对称轴由系数公式直接算。",
    ["识别 a 和 b", "计算 x=-b/(2a)", "写成直线 x=h"],
    "y=2x²+8x+1 -> 对称轴 x=-8/4=-2",
    "把 -b/(2a) 错写成 -b/2*a。"
  ),
  "quadratic|qStandard|extreme": D(
    "Need vertex first, then read extremum from vertex y.",
    ["Compute vertex (h,k)", "Check sign of a", "a>0 minimum, a<0 maximum", "Extremum value is k"],
    "y=x²-6x+5 -> vertex (3,-4), a>0 so minimum is -4",
    "Deciding max/min before checking sign of a.",
    "先求顶点，再由 a 的符号判断极值类型。",
    ["先求顶点 (h,k)", "看 a 的符号", "a>0 最小值，a<0 最大值", "极值就是 k"],
    "y=x²-6x+5 -> 顶点 (3,-4)，a>0，所以最小值 -4",
    "还没看 a 的符号就判断最大/最小。"
  ),
  "quadratic|qStandard|opening": D(
    "a controls opening directly.",
    ["Read coefficient a", "a>0 opens up, a<0 opens down", "|a|>1 narrower, 0<|a|<1 wider"],
    "y=-0.5x²+2 -> opens down and wider",
    "Confusing sign with width; sign decides direction, |a| decides width.",
    "开口由 a 直接决定。",
    ["读取系数 a", "a>0 开口向上，a<0 向下", "|a|>1 更窄，0<|a|<1 更宽"],
    "y=-0.5x²+2 -> 向下且更宽",
    "把方向和宽窄混为一谈。"
  ),
  "quadratic|qStandard|transform": D(
    "Standard form hides transformation parameters.",
    ["Recognize readability is weak", "Convert to vertex form", "Read h,k,a there"],
    "x²-6x+5=(x-3)²-4 -> right 3, down 4",
    "Trying to read shifts directly from b and c.",
    "标准式对平移信息不直观。",
    ["先判断为弱读取", "先转顶点式", "再读 h,k,a"],
    "x²-6x+5=(x-3)²-4 -> 右移3，下移4",
    "直接从 b、c 硬读平移。"
  ),
  "quadratic|qFactored|vertex": D(
    "Roots are visible, so midpoint gives axis then vertex.",
    ["Read roots r1,r2", "Compute h=(r1+r2)/2", "Substitute x=h to get k", "Vertex=(h,k)"],
    "y=(x-1)(x-5): h=3, k=(3-1)(3-5)=-4 -> Vertex=(3,-4)",
    "Averaging with wrong signs from factors.",
    "因式分解式能直读根，用中点可快速找顶点。",
    ["读出根 r1,r2", "计算 h=(r1+r2)/2", "代入 x=h 求 k", "顶点=(h,k)"],
    "y=(x-1)(x-5): h=3, k=(3-1)(3-5)=-4 -> 顶点=(3,-4)",
    "因式里的符号看反，导致中点错。"
  ),
  "quadratic|qFactored|xint": D(
    "Each factor equals zero gives an intercept.",
    ["Set each bracket to 0", "Solve x from each bracket", "Write x-intercept points", "Check repeated factor for touching root"],
    "y=(x-4)(x+1) -> x=4,-1; y=(x-2)² has one touching root at x=2",
    "Forgetting inside sign reversal.",
    "每个因式=0 就得到一个截距。",
    ["令每个括号=0", "分别解出 x", "写出 x 截距点", "重根时是相切根"],
    "y=(x-4)(x+1) -> x=4,-1；y=(x-2)² 在 x=2 相切",
    "括号内符号看反。"
  ),
  "quadratic|qFactored|yint": D(
    "Substitute x=0 into product form.",
    ["Set x=0", "Compute y=a(0-r1)(0-r2)=a r1 r2", "Write point (0, a r1 r2)"],
    "y=2(x-3)(x+1): y=2(-3)(1)=-6 -> (0,-6)",
    "Dropping coefficient a.",
    "代入 x=0 直接算。",
    ["令 x=0", "计算 y=a(0-r1)(0-r2)=a r1 r2", "写点 (0, a r1 r2)"],
    "y=2(x-3)(x+1): y=2(-3)(1)=-6 -> (0,-6)",
    "漏乘前面的 a。"
  ),
  "quadratic|qFactored|axis": D(
    "Axis is midpoint of two roots.",
    ["Read roots r1,r2", "Compute x=(r1+r2)/2", "Write axis line"],
    "y=(x-1)(x-5) -> axis x=(1+5)/2=3",
    "Using factor numbers without sign correction.",
    "对称轴是两根中点。",
    ["读根 r1,r2", "算 x=(r1+r2)/2", "写出对称轴"],
    "y=(x-1)(x-5) -> 对称轴 x=(1+5)/2=3",
    "未处理好因式的符号。"
  ),
  "quadratic|qFactored|extreme": D(
    "Get vertex by midpoint first, then decide by a.",
    ["Find h from roots midpoint", "Substitute h for k", "Check sign of a for max/min"],
    "y=-2(x-1)(x-5): h=3, k=8, a<0 -> maximum 8",
    "Computing midpoint but not evaluating y-value.",
    "先用中点找顶点，再看 a 判定极值类型。",
    ["先取两根中点得 h", "代入求 k", "看 a 符号判最大/最小"],
    "y=-2(x-1)(x-5): h=3, k=8, a<0 -> 最大值 8",
    "只算了中点没算顶点 y 值。"
  ),
  "quadratic|qFactored|opening": D(
    "a is visible in front of factors.",
    ["Read a", "a>0 up, a<0 down", "Use |a| for narrow/wide"],
    "y=3(x-1)(x+2): opens up, narrower",
    "Ignoring a when factors look symmetric.",
    "因式前的 a 可直接读开口。",
    ["读 a", "a>0 向上，a<0 向下", "看 |a| 判断宽窄"],
    "y=3(x-1)(x+2): 向上且更窄",
    "只看根，不看 a。"
  ),
  "quadratic|qFactored|transform": D(
    "Transformations are not explicit in factored form.",
    ["Treat readability as derivable", "Convert to vertex form", "Read shifts and stretch there"],
    "y=(x-1)(x-5) -> y=(x-3)²-4",
    "Reading h and k directly from r1,r2.",
    "因式分解式不直观显示平移参数。",
    ["先判为可推导", "转成顶点式", "再读平移和伸缩"],
    "y=(x-1)(x-5) -> y=(x-3)²-4",
    "把 r1、r2 直接当 h、k。"
  ),
  "quadratic|qVertex|vertex": D(
    "Vertex form encodes turning point directly.",
    ["Read h from (x-h)", "Read k from +k", "Vertex=(h,k)", "Axis is x=h"],
    "y=(x-2)²-3 -> vertex (2,-3), axis x=2",
    "Inside sign is reversed: (x+3) means h=-3.",
    "顶点式直接编码转折点。",
    ["从 (x-h) 读 h", "从 +k 读 k", "顶点=(h,k)", "对称轴 x=h"],
    "y=(x-2)²-3 -> 顶点 (2,-3)，轴 x=2",
    "括号内符号相反：(x+3) 对应 h=-3。"
  ),
  "quadratic|qVertex|xint": D(
    "Set y=0 and isolate square term.",
    ["Set y=0", "Solve a(x-h)²+k=0", "(x-h)²=-k/a", "If -k/a<0: no real roots", "x=h±sqrt(-k/a)"],
    "y=(x-2)²-9 -> (x-2)²=9 -> x=2±3 -> x=-1,5",
    "Taking square root before isolating the square.",
    "令 y=0 后解平方项。",
    ["令 y=0", "解 a(x-h)²+k=0", "化成 (x-h)²=-k/a", "-k/a<0 则无实根", "x=h±sqrt(-k/a)"],
    "y=(x-2)²-9 -> (x-2)²=9 -> x=2±3 -> x=-1,5",
    "平方项未先孤立就开方。"
  ),
  "quadratic|qVertex|yint": D(
    "Plug x=0 into vertex form.",
    ["Set x=0", "Compute y=a(0-h)²+k=ah²+k", "Write point (0,ah²+k)"],
    "y=2(x-3)²-4 -> y=2*9-4=14 -> (0,14)",
    "Forgetting square on h.",
    "把 x=0 代入顶点式。",
    ["令 x=0", "算 y=a(0-h)²+k=ah²+k", "写点 (0,ah²+k)"],
    "y=2(x-3)²-4 -> y=2*9-4=14 -> (0,14)",
    "忘记 h 要平方。"
  ),
  "quadratic|qVertex|axis": D(
    "Axis is directly x=h.",
    ["Read h", "Write x=h"],
    "y=-(x+1)²+2 -> axis x=-1",
    "Sign error from (x-h).",
    "对称轴可直读 x=h。",
    ["读 h", "写 x=h"],
    "y=-(x+1)²+2 -> 对称轴 x=-1",
    "把 (x-h) 的符号看反。"
  ),
  "quadratic|qVertex|extreme": D(
    "Vertex y-value is extremum.",
    ["Read k", "Check sign of a", "a>0 minimum=k, a<0 maximum=k", "Vertex is turning point"],
    "y=-2(x-1)²+5 -> max value is 5",
    "Calling k a minimum when a<0.",
    "顶点 y 值就是极值。",
    ["读 k", "看 a 的符号", "a>0 最小值=k，a<0 最大值=k", "顶点是转折点"],
    "y=-2(x-1)²+5 -> 最大值为 5",
    "a<0 时却写成最小值。"
  ),
  "quadratic|qVertex|opening": D(
    "a controls both direction and width.",
    ["Read a", "Sign -> up/down", "Absolute value -> narrow/wide"],
    "y=0.5(x-2)²-1 -> opens up and wider",
    "Thinking smaller |a| makes graph steeper.",
    "a 同时控制方向和宽窄。",
    ["读取 a", "符号决定上下", "绝对值决定宽窄"],
    "y=0.5(x-2)²-1 -> 向上且更宽",
    "误以为 |a| 变小会更陡。"
  ),
  "quadratic|qVertex|transform": D(
    "Vertex form is the best transformation view.",
    ["Read y=a(x-h)²+k", "h: horizontal shift", "k: vertical shift", "a: reflection/stretch-compression"],
    "y=-2(x+3)²+4 -> left 3, up 4, reflect over x-axis, vertical stretch 2",
    "(x-3) is right 3; (x+3) is left 3.",
    "顶点式最适合读变换。",
    ["读取 y=a(x-h)²+k", "h: 水平平移", "k: 竖直平移", "a: 翻折与伸缩"],
    "y=-2(x+3)²+4 -> 左移3，上移4，关于x轴翻折，纵向拉伸2倍",
    "(x-3) 是右移3，(x+3) 是左移3。"
  ),
  "linear|lSlope|slope": D(
    "Slope-intercept exposes slope directly as m.",
    ["Read coefficient m of x"],
    "y=2x-3 -> slope=2",
    "Using b as slope by mistake.",
    "斜截式可直读斜率 m。",
    ["读取 x 的系数 m"],
    "y=2x-3 -> 斜率=2",
    "把 b 当成斜率。"
  ),
  "linear|lSlope|yint": D(
    "Intercept is directly b.",
    ["Read b", "Write point (0,b)"],
    "y=2x-3 -> y-intercept (0,-3)",
    "Writing y-intercept as -3 only, not point.",
    "截距可直读 b。",
    ["读取 b", "写点 (0,b)"],
    "y=2x-3 -> y 截距 (0,-3)",
    "只写 -3，不写点。"
  ),
  "linear|lSlope|knownPoint": D(
    "Only one guaranteed point is (0,b); arbitrary known point is not explicit.",
    ["Use (0,b) if needed", "Or substitute x to generate a point"],
    "y=2x-3 -> known point (0,-3)",
    "Assuming a point-slope style point is directly given.",
    "只能直接得到 (0,b)，不直接给任意已知点。",
    ["可先用 (0,b)", "或代入一个 x 生成新点"],
    "y=2x-3 -> 已知点可取 (0,-3)",
    "误以为像点斜式那样直接给了任意点。"
  ),
  "linear|lSlope|parallel": D(
    "Parallel lines share same slope.",
    ["Read m", "Use same m for new line", "Change intercept/point"],
    "Given y=2x-3, a parallel line: y=2x+5",
    "Changing slope when building a parallel line.",
    "平行线斜率相同。",
    ["读出 m", "新直线保持同 m", "改截距或过点即可"],
    "已知 y=2x-3，平行线可写 y=2x+5",
    "平行线却改了斜率。"
  ),
  "linear|lSlope|perpendicular": D(
    "Perpendicular slope is negative reciprocal.",
    ["Read m1", "Compute m2=-1/m1", "Use m2 to form new line"],
    "If m1=2, then perpendicular slope m2=-1/2",
    "Using only reciprocal (1/m) without negative sign.",
    "垂线斜率是负倒数。",
    ["读 m1", "算 m2=-1/m1", "用 m2 写新方程"],
    "若 m1=2，则垂直斜率 m2=-1/2",
    "只取倒数没取负号。"
  ),
  "linear|lSlope|graphing": D(
    "Best graphing flow is intercept then rise/run.",
    ["Plot (0,b)", "Use slope rise/run to get second point", "Draw line through points"],
    "y=2x-3: plot (0,-3), then rise 2 run 1",
    "Rise/run direction mismatch when slope is negative.",
    "作图流程很机械：先截距再斜率。",
    ["先画 (0,b)", "按斜率升/跑找第二点", "连线"],
    "y=2x-3：先画 (0,-3)，再上2右1",
    "负斜率时升/跑方向搞反。"
  ),
  "linear|lPoint|slope": D(
    "Point-slope also shows m directly.",
    ["Read m from y-y1=m(x-x1)"],
    "y-3=-4(x-1) -> slope=-4",
    "Confusing x1,y1 with slope.",
    "点斜式也可直读 m。",
    ["从 y-y1=m(x-x1) 读 m"],
    "y-3=-4(x-1) -> 斜率=-4",
    "把 x1,y1 当成斜率。"
  ),
  "linear|lPoint|yint": D(
    "Need substitution or conversion first.",
    ["Substitute x=0 and solve y", "OR expand to y=mx+b then read b"],
    "y-3=2(x-1): x=0 -> y-3=-2 -> y=1 -> y-int (0,1)",
    "Forgetting to move y1 to right side correctly.",
    "y 截距需推导，不能直读。",
    ["代入 x=0 解 y", "或先化成 y=mx+b 再读 b"],
    "y-3=2(x-1): x=0 -> y-3=-2 -> y=1 -> y 截距 (0,1)",
    "移项时符号错。"
  ),
  "linear|lPoint|knownPoint": D(
    "Known point is explicit in form.",
    ["Read (x1,y1) from y-y1=m(x-x1)", "Correct signs carefully"],
    "y-3=2(x-1) -> point (1,3); y+3=2(x-1) -> point (1,-3)",
    "Not reversing sign inside parentheses.",
    "点斜式直接给已知点。",
    ["从 y-y1=m(x-x1) 读 (x1,y1)", "特别注意括号内符号"],
    "y-3=2(x-1) -> 点 (1,3)；y+3=2(x-1) -> 点 (1,-3)",
    "括号内符号不反转。"
  ),
  "linear|lPoint|parallel": D(
    "Parallel decision still depends on slope m.",
    ["Read m", "Keep same m for parallel line"],
    "y-3=2(x-1) -> any parallel line has slope 2",
    "Changing m and still calling it parallel.",
    "平行判断仍看 m。",
    ["读 m", "平行线保持同 m"],
    "y-3=2(x-1) -> 平行线斜率都应为 2",
    "改了 m 还说平行。"
  ),
  "linear|lPoint|perpendicular": D(
    "Use negative reciprocal of m.",
    ["Read m1", "Compute m2=-1/m1", "Build line with m2"],
    "If y-3=2(x-1), perpendicular slope is -1/2",
    "Reciprocal computed but sign not flipped.",
    "垂直判断用负倒数。",
    ["读 m1", "算 m2=-1/m1", "用 m2 写直线"],
    "若 y-3=2(x-1)，垂线斜率是 -1/2",
    "只倒数不取负。"
  ),
  "linear|lPoint|graphing": D(
    "Point-slope is graph-friendly: point + slope.",
    ["Plot known point (x1,y1)", "Use slope rise/run for second point", "Draw line"],
    "y-3=2(x-1): plot (1,3), then rise 2 run 1",
    "Plotting (-x1,-y1) by sign mistake.",
    "点斜式作图很直接：已知点+斜率。",
    ["先画已知点 (x1,y1)", "按斜率升/跑找第二点", "连线"],
    "y-3=2(x-1)：先画 (1,3)，再上2右1",
    "把点画成 (-x1,-y1)。"
  ),
  "linear|lStandard|slope": D(
    "Need solve for y to read slope.",
    ["Start from Ax+By+C=0", "Rearrange: By=-Ax-C", "y=(-A/B)x-C/B", "Slope=-A/B"],
    "2x-3y+6=0 -> y=(2/3)x+2 -> slope 2/3",
    "Dropping minus signs when dividing by B.",
    "标准式需先化成斜截式。",
    ["从 Ax+By+C=0 出发", "移项：By=-Ax-C", "化简：y=(-A/B)x-C/B", "斜率=-A/B"],
    "2x-3y+6=0 -> y=(2/3)x+2 -> 斜率 2/3",
    "除以 B 时负号丢失。"
  ),
  "linear|lStandard|yint": D(
    "Set x=0 in standard form.",
    ["Set x=0", "Get By+C=0", "Compute y=-C/B", "Write point (0,-C/B)"],
    "2x-3y+6=0 -> x=0 => -3y+6=0 => y=2 -> (0,2)",
    "Assuming y-intercept is C directly.",
    "在标准式里令 x=0。",
    ["令 x=0", "得到 By+C=0", "算 y=-C/B", "写点 (0,-C/B)"],
    "2x-3y+6=0 -> x=0 => -3y+6=0 => y=2 -> (0,2)",
    "把 C 直接当 y 截距。"
  ),
  "linear|lStandard|knownPoint": D(
    "No explicit fixed point; derive one from intercepts or substitution.",
    ["Find y-intercept or x-intercept", "Use resulting point as known point"],
    "2x-3y+6=0 -> y-int (0,2), x-int (-3,0)",
    "Thinking A,B,C are coordinates.",
    "标准式不直接给固定点，需要推导。",
    ["先求 y 截距或 x 截距", "把得到的点作为已知点"],
    "2x-3y+6=0 -> y 截距 (0,2), x 截距 (-3,0)",
    "把 A,B,C 误当坐标。"
  ),
  "linear|lStandard|parallel": D(
    "Need slope first from -A/B.",
    ["Compute slope m=-A/B", "Parallel line uses same m", "Convert if needed to compare"],
    "2x-3y+6=0 has m=2/3; parallel line must keep m=2/3",
    "Comparing A,B directly when equations are scaled differently.",
    "先求斜率再判断平行。",
    ["先算 m=-A/B", "平行线用同 m", "必要时先化简再比较"],
    "2x-3y+6=0 的 m=2/3；平行线也应是 2/3",
    "方程倍数不同却直接比 A、B。"
  ),
  "linear|lStandard|perpendicular": D(
    "Get slope then take negative reciprocal.",
    ["Find m1=-A/B", "Compute m2=-1/m1", "Build/check line with m2"],
    "If m1=2/3, then perpendicular slope is -3/2",
    "Using reciprocal B/A without sign check.",
    "先求斜率，再取负倒数。",
    ["先算 m1=-A/B", "再算 m2=-1/m1", "据此写或判定垂线"],
    "若 m1=2/3，则垂直斜率是 -3/2",
    "只取 B/A，符号没处理。"
  ),
  "linear|lStandard|graphing": D(
    "Intercept method is fastest for standard form.",
    ["Set y=0 -> x-intercept x=-C/A", "Set x=0 -> y-intercept y=-C/B", "Plot two intercepts and connect"],
    "2x-3y+6=0 -> x-int (-3,0), y-int (0,2)",
    "Arithmetic slip when solving intercept equations.",
    "标准式作图最稳是双截距法。",
    ["令 y=0 求 x 截距 x=-C/A", "令 x=0 求 y 截距 y=-C/B", "画两点连线"],
    "2x-3y+6=0 -> x 截距 (-3,0), y 截距 (0,2)",
    "解截距方程时计算错误。"
  ),
  "exponential|eBasic|base": D(
    "Direct read: base b is written in y=b^x.",
    ["Read b directly", "Confirm b>0 and b≠1"],
    "y=2^x -> b=2",
    "Confusing b with exponent position.",
    "可直接读：y=b^x 中底数 b 写在式子里。",
    ["直接读出 b", "确认 b>0 且 b≠1"],
    "y=2^x -> b=2",
    "把底数和指数位置搞混。"
  ),
  "exponential|eBasic|initialValue": D(
    "Derivable: substitute x=0 in y=b^x to get y=1 (when a=1, k=0).",
    ["Set x=0", "Compute b^0=1", "For full model use transformed form if a≠1 or k≠0"],
    "y=2^x -> y(0)=1",
    "Using b as initial value.",
    "需推导：在 y=b^x 中令 x=0 得 y=1。",
    ["令 x=0", "算 b^0=1", "若有伸缩/平移请转变换式"],
    "y=2^x -> y(0)=1",
    "误把 b 当初始值。"
  ),
  "exponential|eBasic|growthDecay": D(
    "Direct read: compare b to 1.",
    ["Read b", "b>1 growth, 0<b<1 decay"],
    "y=0.5^x -> decay",
    "Using a or A instead of b.",
    "可直接读：比较 b 与 1。",
    ["读 b", "b>1 增长，0<b<1 衰减"],
    "y=0.5^x -> 衰减",
    "误用 a 或 A 判断。"
  ),
  "exponential|eBasic|asymptote": D(
    "Derivable: basic form implies k=0, so asymptote y=0.",
    ["Recognize y=b^x has no +k term", "Horizontal asymptote y=0", "Or convert to transformed form"],
    "y=2^x -> asymptote y=0",
    "Looking for vertical asymptote.",
    "需推导：基础式等价 k=0，渐近线 y=0。",
    ["y=b^x 无 +k", "水平渐近线 y=0", "或转变换式读 k"],
    "y=2^x -> 渐近线 y=0",
    "误找竖直渐近线。"
  ),
  "exponential|eBasic|domainRange": D(
    "Derivable: domain ℝ; with a>0 and k=0, range is y>0.",
    ["State domain ℝ", "Use a sign: a>0 => y>k, here k=0 => y>0"],
    "y=2^x: domain ℝ, range y>0",
    "Thinking range depends on k sign instead of a.",
    "需推导：定义域 ℝ；a>0 且 k=0 时值域 y>0。",
    ["定义域 ℝ", "由 a 决定：a>0 => y>k，此处 k=0 即 y>0"],
    "y=2^x：定义域 ℝ，值域 y>0",
    "误用 k 的正负决定值域方向。"
  ),
  "exponential|eBasic|transformations": D(
    "Weak for shifts: use transformed form y=a·b^(x-h)+k.",
    ["Basic form hides a,h,k", "Switch to transformed form", "Read a,h,k there"],
    "Prefer y=2·3^(x-1)+4 over y=3^x for shifts",
    "Forcing shifts into y=b^x only.",
    "不适合读平移/伸缩：请用变换式 y=a·b^(x-h)+k。",
    ["基础式不含 a,h,k", "改看变换式", "在那里读参数"],
    "描述平移宜用 y=2·3^(x-1)+4",
    "硬在 y=b^x 里找平移。"
  ),
  "exponential|eTransformed|base": D(
    "Direct read: b appears in y=a·b^(x-h)+k.",
    ["Identify b in the power", "Check b>0, b≠1"],
    "y=3·2^(x-1)+4 -> b=2",
    "Using a as base.",
    "可直接读：b 在指数底位置。",
    ["找出指数里的 b", "确认 b>0, b≠1"],
    "y=3·2^(x-1)+4 -> b=2",
    "误把 a 当底数。"
  ),
  "exponential|eTransformed|initialValue": D(
    "Derivable: substitute x=0 into y=a·b^(x-h)+k.",
    ["Set x=0", "Compute a·b^(-h)+k"],
    "y=2·3^(x-1)+4 -> y(0)=2·3^(-1)+4",
    "Using k alone as initial value.",
    "需推导：令 x=0 代入 y=a·b^(x-h)+k。",
    ["令 x=0", "算 a·b^(-h)+k"],
    "y=2·3^(x-1)+4 -> y(0)=2·3^(-1)+4",
    "只写 k 当初始值。"
  ),
  "exponential|eTransformed|growthDecay": D(
    "Derivable: compare b to 1 (same factor as r in growth form).",
    ["Read b", "b>1 growth, 0<b<1 decay", "Or rewrite as y=A·r^x with r=b"],
    "b=1.2 -> growth",
    "Using sign of a only.",
    "需推导：比较 b 与 1（与 r 相同角色）。",
    ["读 b", "b>1 增长，0<b<1 衰减", "或写成 r=b"],
    "b=1.2 -> 增长",
    "只看 a 的正负。"
  ),
  "exponential|eTransformed|asymptote": D(
    "Direct read: horizontal asymptote is y=k.",
    ["Read k", "Write line y=k"],
    "y=2^(x-1)+4 -> asymptote y=4",
    "Using b or h as asymptote.",
    "可直接读：水平渐近线 y=k。",
    ["读 k", "写直线 y=k"],
    "y=2^(x-1)+4 -> 渐近线 y=4",
    "误用 b 或 h。"
  ),
  "exponential|eTransformed|domainRange": D(
    "Derivable: domain ℝ; range follows a and k (a>0 => y>k).",
    ["Domain ℝ", "If a>0 then y>k; if a<0 then y<k"],
    "a=1,k=3 -> range y>3; a=-1,k=3 -> y<3",
    "Using k sign to flip range direction.",
    "需推导：定义域 ℝ；a>0 则 y>k，a<0 则 y<k。",
    ["定义域 ℝ", "a>0 => y>k；a<0 => y<k"],
    "a=1,k=3 -> y>3；a=-1,k=3 -> y<3",
    "用 k 正负决定值域方向。"
  ),
  "exponential|eTransformed|transformations": D(
    "Direct read: a,h,k show stretch and shifts.",
    ["Read a (stretch/reflect)", "Read h (horizontal shift)", "Read k (vertical shift)"],
    "y=-2·3^(x+1)-1: reflect, left 1, down 1",
    "Sign errors on h.",
    "可直接读：a,h,k 表示伸缩与平移。",
    ["a 伸缩/反射", "h 水平平移", "k 竖直平移"],
    "y=-2·3^(x+1)-1：反射、左移 1、下移 1",
    "h 的符号搞反。"
  ),
  "exponential|eGrowthDecay|base": D(
    "Direct read: base is r in y=A·r^x.",
    ["Read r", "Check r>0, r≠1"],
    "y=5·1.2^x -> r=1.2",
    "Using A as base.",
    "可直接读：底数为 r。",
    ["读 r", "确认 r>0, r≠1"],
    "y=5·1.2^x -> r=1.2",
    "误把 A 当底数。"
  ),
  "exponential|eGrowthDecay|initialValue": D(
    "Direct read: at x=0, y=A·r^0=A.",
    ["Set x=0", "y=A"],
    "y=5·1.2^x -> initial value 5",
    "Using r as initial value.",
    "可直接读：x=0 时 y=A。",
    ["令 x=0", "y=A"],
    "y=5·1.2^x -> 初始值 5",
    "误把 r 当初始值。"
  ),
  "exponential|eGrowthDecay|growthDecay": D(
    "Direct read: compare r to 1.",
    ["Read r", "r>1 growth, 0<r<1 decay"],
    "r=0.8 -> decay",
    "Using A to decide growth/decay.",
    "可直接读：比较 r 与 1。",
    ["读 r", "r>1 增长，0<r<1 衰减"],
    "r=0.8 -> 衰减",
    "用 A 判断增长衰减。"
  ),
  "exponential|eGrowthDecay|asymptote": D(
    "Derivable: pure form has k=0, asymptote y=0; add k via transformed form.",
    ["Here y=A·r^x implies asymptote y=0", "If shifts exist, use y=a·b^(x-h)+k and read k"],
    "y=5·1.2^x -> asymptote y=0",
    "Thinking asymptote is A.",
    "需推导：纯式子 k=0，渐近线 y=0；有平移看变换式 k。",
    ["y=A·r^x 时渐近线 y=0", "有平移则转变换式读 k"],
    "y=5·1.2^x -> 渐近线 y=0",
    "误把 A 当渐近线。"
  ),
  "exponential|eGrowthDecay|domainRange": D(
    "Derivable: domain ℝ; with A>0 and k=0, range y>0 (sign of A sets y>k or y<k in full form).",
    ["Domain ℝ", "For A>0 here: y>0", "In transformed form: a>0 => y>k"],
    "y=5·1.2^x: domain ℝ, range y>0",
    "Confusing range bound with A.",
    "需推导：定义域 ℝ；A>0 时 y>0；完整式子由 a 决定 y>k 或 y<k。",
    ["定义域 ℝ", "A>0 时 y>0", "变换式中 a>0 => y>k"],
    "y=5·1.2^x：定义域 ℝ，值域 y>0",
    "把值域边界和 A 混淆。"
  ),
  "exponential|eGrowthDecay|transformations": D(
    "Weak: shifts not explicit; use transformed form.",
    ["Growth form shows A and r only", "For h,k use y=a·b^(x-h)+k", "Match A=a, r=b when h=0,k=0"],
    "Use transformed form to describe left/right/up/down",
    "Adding h,k into y=A·r^x without converting.",
    "不适合读平移：请用变换式。",
    ["增长式只显 A,r", "有平移用 y=a·b^(x-h)+k", "无平移时 A=a,r=b"],
    "描述平移应转变换式",
    "硬在 y=A·r^x 里写 h,k。"
  )
};
