# 快速参考卡片 ⚡

## 🚀 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

---

## 📁 目录速查

```
src/
├── components/    # UI组件
├── store/         # Redux状态
├── services/      # API服务
├── types/         # TS类型
├── utils/         # 工具函数
└── styles/        # 全局样式
```

---

## 🔑 核心API

### Redux Actions
```typescript
dispatch(addMessage(message))
dispatch(updateMessage({ id, updates }))
dispatch(clearMessages())
dispatch(setIsStreaming(true))
dispatch(setApiConnected(true))
dispatch(setLoading(true))
dispatch(loadHistory(messages))
```

### Redux Selectors
```typescript
const { messages, sessionId, isStreaming } = useSelector(
  (state: RootState) => state.chat
);
```

### API Functions
```typescript
import { checkHealth, sendQuery, getHistory, clearHistory, createSSEConnection } from './services/api';

// 健康检查
const ok = await checkHealth();

// 发送查询
const response = await sendQuery(query, sessionId, isStream);

// 获取历史
const items = await getHistory(sessionId);

// 清空历史
await clearHistory(sessionId);

// SSE连接
createSSEConnection(sessionId, onProgress, onDelta, onFinal, onError);
```

---

## 🎨 样式变量

```scss
// 颜色
$brand: #1aa7ff;           // 主品牌色
$brand2: #5b7cfa;          // 辅助色
$bubble-user: #1aa7ff;     // 用户气泡
$bubble-bot: #ffffff;      // 机器人气泡
$border: #e6e9ef;          // 边框色
$muted: #7a869a;           // 次要文字

// 字体
$font-family: "Segoe UI", "Microsoft YaHei", ...;
$font-mono: ui-monospace, ...;
```

---

## 📝 TypeScript类型

```typescript
interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp?: number;
  imageUrls?: string[];
  progress?: ProgressState;
  error?: string;
}

interface ProgressState {
  doneList: string[];
  runningList: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
```

---

## 🛠️ 工具函数

```typescript
import { 
  formatTime, 
  escapeHtml, 
  isImageUrl, 
  normalizeUrl, 
  parseAnswerAndImages,
  extractAllImages 
} from './utils/helpers';

// 格式化时间
formatTime(timestamp); // "14:30"

// HTML转义
escapeHtml('<script>'); // "&lt;script&gt;"

// 判断图片URL
isImageUrl('https://example.com/img.png'); // true

// 解析答案和图片
const { text, images } = parseAnswerAndImages(answerText);
```

---

## 🧩 组件Props

### ChatContainer
```tsx
<ChatContainer />  // 无props，从Redux获取状态
```

### MessageItem
```tsx
<MessageItem 
  message={{
    id: 'msg-1',
    role: 'bot',
    text: '回答内容',
    timestamp: Date.now(),
    progress: { ... },
    imageUrls: [...]
  }}
/>
```

---

## 🔧 常见修改

### 修改API地址
文件: `src/services/api.ts`
```typescript
const API_BASE = 'http://your-server:port';
```

### 修改主题色
文件: `src/styles/variables.scss`
```scss
$brand: #your-color;
$brand2: #your-color;
```

### 修改端口
文件: `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
});
```

---

## 🐛 调试技巧

### Redux DevTools
- 查看所有actions
- 时间旅行调试
- 状态快照

### React DevTools
- 组件树查看
- Props/State检查
- 性能分析

### Network面板
- API请求监控
- SSE事件流查看
- 响应时间分析

### Console日志
- API调用日志
- SSE事件日志
- 错误信息

---

## ⌨️ 快捷键

### 聊天输入
- `Enter` - 发送消息
- `Shift + Enter` - 换行

### 浏览器
- `F12` - 开发者工具
- `Ctrl+Shift+I` - 检查元素
- `Ctrl+Shift+J` - 控制台

---

## 📦 依赖包

### 核心依赖
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@reduxjs/toolkit": "^2.0.1",
  "react-redux": "^9.0.4",
  "sass": "^1.69.7"
}
```

### 开发依赖
```json
{
  "typescript": "^5.2.2",
  "vite": "^5.0.8",
  "@vitejs/plugin-react": "^4.2.1",
  "@types/react": "^18.2.43",
  "eslint": "^8.55.0"
}
```

---

## 🌐 API端点

```
GET  /health                  - 健康检查
POST /query                   - 发送查询
GET  /stream/{session_id}     - SSE流式响应
GET  /history/{session_id}    - 获取历史记录
DELETE /history/{session_id}  - 清空历史记录
```

---

## 💡 最佳实践

### 组件开发
1. 单一职责原则
2. Props类型定义
3. 样式独立文件
4. 导出到index.ts

### 状态管理
1. 局部状态用useState
2. 全局状态用Redux
3. 派生状态用selector
4. 避免直接修改state

### 样式编写
1. 使用Sass变量
2. BEM命名规范
3. 避免!important
4. 组件样式隔离

### 类型安全
1. 定义接口
2. 避免any
3. 联合类型
4. 泛型使用

---

## 🚨 常见问题

### API未连接
✓ 检查后端服务是否运行
✓ 确认API_BASE地址正确
✓ 查看浏览器控制台错误

### 图片不显示
✓ 检查URL是否正确
✓ 确认跨域配置
✓ 查看Network面板

### SSE不工作
✓ 使用现代浏览器
✓ 检查网络连接
✓ 查看EventStream标签

### 样式不生效
✓ 检查.scss文件导入
✓ 确认类名正确
✓ 清除浏览器缓存

---

## 📚 文档链接

- [README.md](./README.md) - 项目总览
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 架构说明
- [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) - 组件指南
- [FILE_CHECKLIST.md](./FILE_CHECKLIST.md) - 文件清单
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - 迁移总结

---

## 🎯 快速任务

### 添加新组件
1. 创建 `ComponentName.tsx`
2. 创建 `ComponentName.scss`
3. 在 `components/index.ts` 导出
4. 在父组件中使用

### 添加新API
1. 在 `services/api.ts` 添加函数
2. 定义返回类型
3. 处理错误
4. 在组件中调用

### 添加新状态
1. 在 `chatSlice.ts` 添加字段
2. 添加reducer
3. 导出action
4. 在组件中dispatch

---

**保存此文件作为快速参考！** 📌
