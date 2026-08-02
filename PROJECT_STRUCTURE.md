# 项目架构说明

## 设计理念

本项目采用**组件化**、**模块化**的设计思想，将原有的HTML页面功能拆解为多个独立的React组件，每个组件负责特定的功能模块。

## 核心架构

### 1. 状态管理 (Redux)

使用 **Redux Toolkit** 进行全局状态管理，主要包含：

- **ChatState**: 聊天相关的所有状态
  - `messages`: 消息列表
  - `sessionId`: 会话ID
  - `isStreaming`: 是否启用流式输出
  - `apiConnected`: API连接状态
  - `isLoading`: 加载状态

### 2. 组件层次结构

```
App (根组件)
└── Layout (布局容器)
    └── ChatPage (聊天主页面，路由加载)
        ├── ChatHeader (顶部栏)
        │   ├── Logo & Title
        │   ├── Stream Toggle
        │   ├── API Status
        │   └── Clear Button
        ├── MessageList (消息列表)
        │   └── MessageItem (单条消息) × N
        │       ├── Avatar (头像)
        │       ├── Bubble (气泡)
        │       │   ├── Typing Indicator
        │       │   ├── Answer Text
        │       │   ├── Progress Details
        │       │   └── Images
        │       └── Meta (时间戳)
        └── ChatInput (输入框)
            ├── Textarea
            └── Send Button
```

### 3. 数据流向

```
用户操作 → Action → Reducer → State更新 → 组件重新渲染
     ↓
API调用 → Response → Dispatch Action → State更新
```

### 4. 文件组织原则

#### `/src/components/` - UI组件
每个组件包含两个文件：
- `.tsx` - 组件逻辑
- `.scss` - 组件样式

**职责分离**：
- `ChatPage.tsx` (pages/): 页面级容器，协调子组件，处理生命周期（API检查、历史加载）
- `ChatHeader.tsx`: 顶部控制栏（流式切换、清空对话）
- `MessageList.tsx`: 消息列表容器，自动滚动
- `MessageItem.tsx`: 单条消息渲染（支持文本、图片、进度）
- `ChatInput.tsx`: 输入框和发送逻辑

#### `/src/store/` - 状态管理
- `store.ts`: Redux Store配置
- `chatSlice.ts`: 聊天状态的Reducer和Actions

#### `/src/services/` - API服务
- `api.ts`: 封装所有API调用（健康检查、查询、SSE、历史记录）

#### `/src/types/` - TypeScript类型
- `index.ts`: 定义所有数据类型接口

#### `/src/utils/` - 工具函数
- `helpers.ts`: 纯函数工具（时间格式化、URL解析、图片提取等）

#### `/src/styles/` - 全局样式
- `variables.scss`: Sass变量（颜色、字体）
- `index.scss`: 全局样式重置和布局

## 关键技术实现

### 1. SSE流式响应处理

```typescript
createSSEConnection(
  sessionId,
  onProgress,  // 接收进度更新
  onDelta,     // 接收增量文本
  onFinal,     // 接收最终结果
  onError      // 错误处理
)
```

### 2. 图片解析逻辑

支持多种图片标记方式：
- 【图片】标记后的URL列表
- 文本中直接包含的图片URL
- 后端返回的image_urls数组

### 3. 进度追踪

使用`<details>`元素展示处理进度：
- ✅ 已完成的步骤
- ⏳ 进行中的步骤
- 状态标签（pending/processing/completed/failed）

### 4. 会话持久化

- Session ID存储在localStorage
- 历史记录从MongoDB加载
- 支持清空会话

## 样式系统

### Sass变量管理

所有颜色、字体统一定义在`variables.scss`中，便于主题定制：

```scss
$brand: #1aa7ff;      // 主品牌色
$brand2: #5b7cfa;     // 辅助品牌色
$bubble-user: #1aa7ff; // 用户气泡背景
$bubble-bot: #ffffff;  // 机器人气泡背景
```

### 组件样式隔离

每个组件拥有独立的`.scss`文件，使用BEM命名规范避免冲突：

```scss
.msg { ... }
.msg.user { ... }
.msg.bot { ... }
.bubble { ... }
.avatar { ... }
```

## 性能优化

1. **懒加载图片**: `loading="lazy"`
2. **事件源复用**: SSE连接完成后自动关闭
3. **防抖处理**: 输入框状态管理
4. **记忆化选择器**: Redux selector自动优化

## 扩展性设计

### 添加新功能

1. **新组件**: 在`components/`创建`.tsx`和`.scss`
2. **新状态**: 在`chatSlice.ts`添加action和reducer
3. **新API**: 在`api.ts`添加函数
4. **新类型**: 在`types/index.ts`添加interface

### 主题定制

修改`styles/variables.scss`中的变量即可全局更换主题色。

## 最佳实践

1. **单一职责**: 每个组件只做一件事
2. **类型安全**: 所有数据都有TypeScript类型定义
3. **错误边界**: API调用都有try-catch处理
4. **代码复用**: 工具函数抽离到utils
5. **样式变量**: 避免硬编码颜色和尺寸

## 开发工作流

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（热更新）
npm run dev

# 3. 代码检查
npm run lint

# 4. 构建生产版本
npm run build

# 5. 预览生产构建
npm run preview
```

## 部署建议

1. 运行`npm run build`生成dist目录
2. 将dist目录部署到静态服务器（Nginx、Apache等）
3. 确保后端API可访问（CORS已配置）
4. 建议使用HTTPS协议

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 完全支持
- IE11: ❌ 不支持（需要polyfill）
