# 孕语 · 孕育全周期 App

陪伴女性从「备孕」到「宝宝 2 岁」全生命周期的智能孕育助手——记录、预测、提醒、知识一站式。以 **PWA** 形态构建，一套代码可安装到 iOS / Android 主屏并离线使用。

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS 4（CSS 变量色板 + 四阶段强调色）
- Zustand（含 persist，本地持久化的单一数据源）
- React Router（5 Tab + 阶段向导 + 急症红线路由）
- Recharts（体重 / 数据趋势）· Framer Motion（动效）· lucide-react（图标）
- vite-plugin-pwa（Service Worker + manifest + 安装到主屏）

## 核心特性

- **单 App 阶段自动切换**：备孕 → 怀孕 → 孕晚期 → 分娩 → 产后 → 育儿的状态机，首页 / 记录 / 知识随阶段切换，可回退不破坏数据。
- **核心记录与预测**：周期排卵预测、孕周与预产期计算、胎动 / 宫缩、喂养 / 睡眠 / 尿布、体重趋势曲线、月龄计算。
- **家庭账号体系**：妈妈主账号 + 伴侣 / 祖辈角色，数据权限矩阵、共同记录、成长动态、提醒认领。
- **医疗合规边界（P0）**：内容分级 L0–L3 标注、免责话术、急症关键词全屏就医红线。

## 开发

```bash
npm install     # 安装依赖
npm run dev     # 本地开发（http://localhost:5173）
npm run build   # 类型检查 + 生产构建
npm run preview # 预览生产构建
```

## 目录结构

```
src/
├── components/   # UI 组件（ui / home / record / knowledge / 导航壳）
├── pages/        # 5 大页面 + Onboarding / 阶段向导 / 急症红线
├── store/        # Zustand 全局状态（阶段状态机 + 档案 + 记录）
├── utils/        # 领域逻辑（孕周/排卵/月龄计算、阶段元数据、合规）
├── data/         # 分级知识库 Mock 数据
└── types/        # 领域类型定义
```

产品需求与技术架构文档见 `.trae/documents/`。数据当前存于本地（localStorage，键前缀 `pregvoice:`），Repository 层预留云端同步接口，供 V1 家庭同步接入。
