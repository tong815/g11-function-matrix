# Topic Module Schema

本项目的「函数知识可视化」以 **topic module** 为扩展单元。通用 UI（矩阵、变换网络、公式卡、问题路由、图像预览）由框架渲染；仅二次函数等 topic 才挂载可选面板。

## Topic 对象字段

| 字段 | 说明 |
|------|------|
| `id` | 唯一标识，如 `quadratic`、`linear` |
| `titleKey` / `subtitleKey` | i18n 键，用于 topic 选择器 |
| `representations` | 由 `buildRepresentations(matrix)` 生成，见下文 |
| `matrix` | 信息读取矩阵（forms × info × level） |
| `details` | `{ namespace, library }`，可读信息文案 |
| `formulaCards` | 公式卡数据 |
| `problemRouter` | 问题 → 最佳形式 路由表 |
| `transformations` | `{ rules, flowContent, defaultFlowRuleId }` |
| `graphAdapter` | 图像与参数适配器，见下文 |
| `optionalPanels` | 可选面板 ID 列表，如 `["sameGeometry", "discriminant"]` |
| `graph` | `{ adapterId, defaultSelection, parameterForms, defaultFormId }` |

`linear` topic 的 `optionalPanels` 为空数组，不显示判别式或对称轴对照面板。

## Representation 分类

每个 matrix form 带有 `representationType`：

```js
{
  id: "qVertex",
  formula: "y = a(x-h)² + k",
  type: "transform",           // algebraic | geometric | transform | analytic
  readableInfo: ["vertex", …] // 来自 matrix.info
}
```

当前映射：

- 二次：标准式 / 因式分解式 → `algebraic`；顶点式 → `transform`
- 一次：斜截式 / 一般式 → `algebraic`；点斜式 → `geometric`

后续三角函数可将振幅 / 周期 / 相移表单标为 `transform` 或 `analytic`，无需改 UI 结构。

## Generic vs Topic-specific

| Generic（所有 topic 共用） | Topic-specific |
|---------------------------|----------------|
| `render/matrixRenderer.js` | `optionalPanels` 中的面板 |
| `render/networkRenderer.js` | `graph/discriminantPanel.js`（仅 quadratic） |
| `render/formulaRenderer.js` | `graph/quadraticGraphAnnotations.js` |
| `render/routerRenderer.js` | `math/quadratic.js` |
| `render/graphRenderer.js`（画布、坐标、调度 adapter） | index.html 中 `.block-disc` / `.block-same-geo` DOM（隐藏由 topic 控制） |
| `data/optionalPanels.js` | |
| `graph/*GraphAdapter.js`（按 topic 注册） | |

## optionalPanels 机制

1. 在 `src/data/optionalPanels.js` 的 `optionalPanelRegistry` 注册面板 ID 与 CSS 选择器。
2. topic 的 `optionalPanels` 数组列出要启用的 ID。
3. `applyOptionalPanels(topic)` 在切换 topic / 语言时设置 `display: block | none`。
4. 面板专属渲染（如判别式小图）在 `main.js` 中仅在 `topicHasOptionalPanel(topic, "discriminant")` 时调用 `renderDiscriminantPanels()`。

新增面板步骤：注册 selector → 在 HTML 保留 DOM → 某 topic 的 `optionalPanels` 加入 ID → 实现该面板的 render/localize 函数。

## graphAdapter 接口

每个 topic 在 `src/graph/<name>GraphAdapter.js` 实现适配器，并在 topic 中挂载为 `graphAdapter`。`graphAdapterRegistry` 按 `graph.adapterId` 查找。

| 方法 | 职责 |
|------|------|
| `id` | 与 `graphState.mode` / `graph.adapterId` 一致 |
| `getDefaultParams()` | 重置图像参数用的默认值 |
| `getFeatures(params, lang, i18n)` | 派生特征（公式字符串、有效性、根等） |
| `evaluate(x, params)` | 曲线上一点的 y；竖直线等返回 `null` |
| `getViewport(params, features?)` | 绘图范围：采样 `{ xMin, xMax, sampleStep, pixelScale }` 或 `{ kind: "segment" \| "vertical", … }` |
| `getExampleForms(features, t?)` | 当前例子下的多形式展示文案 |
| `parameterForms` / `defaultFormId` | 参数控件切换的形式列表 |
| `getActiveFormId(graphState, lastSelected)` | 当前激活的 matrix form |

注释与扩展点（后续 topic 可实现）：

- **指数函数**：`getViewport` 可扩大 x 范围；`evaluate` 用 `a*b^x`；可增加 `getAnnotations` 中的水平渐近线类型。
- **三角函数**：`getViewport` 按周期设置 `sampleStep`；`evaluate` 用 `sin`/`cos`；形式 type 用 `transform`（振幅、周期、相移）。

注：标注与说明文字目前在 `quadraticGraphAnnotations.js` / `linearGraphAnnotations.js`，由 `graphRenderer` 按 `matrixKey` 分发；可逐步迁入各 adapter 的 `getAnnotations` / `getAnnotationNote`。

## 如何新增 exponential topic

1. 在 `src/math/exponential.js` 实现计算与公式文本。
2. 在 `src/data/matrices.js` 增加 `exponentialMatrix`（forms 带 `representationType`）。
3. 在 `src/data/details.js` 增加 `exponential|…` 详情键。
4. 在 `src/data/formulas.js`、`transformationRules.js` 增加 group / topic 过滤数据。
5. 新建 `src/graph/exponentialGraphAdapter.js`，注册到 `graphAdapterRegistry.js`。
6. 新建 `src/data/topics/exponentialTopic.js`，`optionalPanels: []`（或以后加渐近线说明面板）。
7. 在 `topicRegistry.js` 与 `topicOrder` 注册；`i18n.js` 增加文案键。
8. `graphState` 增加 `exponential` 字段；`controlsRenderer` 增加参数分支（或后续再抽象为 adapter 驱动）。

入口文件：**`src/data/topics/exponentialTopic.js`** + **`src/graph/exponentialGraphAdapter.js`**。

## 如何新增 trig topic

与指数函数类似，额外注意：

- forms 的 `representationType`：`algebraic`（如 `y=sin x`）、`transform`（`y=A sin(Bx+C)+D`）。
- `getViewport` 建议 `sampleStep = period / 200` 量级。
- 可选 `optionalPanels`：单位圆对照、相位说明等（新建 panel ID，勿写入 linear/quadratic topic）。

入口文件：**`src/data/topics/trigTopic.js`** + **`src/graph/trigGraphAdapter.js`**。

## 本地运行

```bash
py -m http.server 8000
```

浏览器打开 `http://localhost:8000`，验证 topic 切换、矩阵点击、变换边、中英文、二次函数专属面板。
