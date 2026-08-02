# 组件使用指南

## 组件概览

本项目采用组件化设计，每个组件都有明确的职责和接口。

---

## 1. ChatPage - 聊天主页面

**位置**: `src/pages/ChatPage.tsx`

**职责**: 
- 协调所有子组件
- 管理生命周期（API检查、历史加载）
- 提供整体布局

**使用方式**: 由路由 `chat/:sessionId` 加载，无 props。

**特点**:
- 自动检查API连接状态（每5秒）
- 根据路由参数自动加载会话历史记录
- 包含完整的聊天界面

---

## 2. ChatHeader - 顶部栏组件

**位置**: `src/components/ChatHeader.tsx`

**职责**:
- 显示品牌信息
- 控制流式输出开关
- 显示API连接状态
- 提供清空对话功能

**Props**: 无（从Redux获取状态）

**内部状态**:
```typescript
{
  apiConnected: boolean,  // API是否连接
  isStreaming: boolean,   // 是否启用流式
  sessionId: string       // 当前会话ID
}
```

**操作**:
- 切换流式模式 → 更新Redux状态
- 清空对话 → 调用API + 更新Redux

---

## 3. MessageList - 消息列表组件

**位置**: `src/components/MessageList.tsx`

**职责**:
- 渲染所有消息
- 自动滚动到底部
- 显示日期分隔线

**Props**: 无（从Redux获取消息列表）

**自动滚动逻辑**:
```typescript
useEffect(() => {
  if (chatRef.current) {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }
}, [messages]); // 当消息变化时触发
```

---

## 4. MessageItem - 单条消息组件

**位置**: `src/components/MessageItem.tsx`

**Props**:
```typescript
interface MessageItemProps {
  message: Message;
}
```

**Message类型**:
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
```

**渲染内容**:
1. **头像**: 用户显示"我"，机器人显示"掌柜智库"
2. **气泡**: 包含文本、进度、图片
3. **时间戳**: 格式化显示时间

**特殊功能**:
- 自动解析文本中的图片URL
- 支持【图片】标记语法
- 显示处理进度（仅机器人消息）
- 打字指示器动画

**使用示例**:
```tsx
<MessageItem 
  message={{
    id: 'msg-1',
    role: 'bot',
    text: '这是回答',
    timestamp: Date.now(),
    progress: {
      doneList: ['步骤1', '步骤2'],
      runningList: ['步骤3'],
      status: 'processing'
    }
  }}
/>
```

---

## 5. ChatInput - 输入框组件

**位置**: `src/components/ChatInput.tsx`

**职责**:
- 接收用户输入
- 发送查询请求
- 处理SSE流式响应
- 管理发送状态

**Props**: 无（从Redux获取配置）

**内部状态**:
```typescript
const [inputValue, setInputValue] = useState('');
```

**键盘快捷键**:
- `Enter`: 发送消息
- `Shift + Enter`: 换行

**发送流程**:
```
1. 验证输入 → 2. 添加用户消息 → 3. 添加机器人骨架 
→ 4. 调用API → 5a. 非流式: 直接更新
              5b. 流式: 创建SSE连接
```

**SSE事件处理**:
- `progress`: 更新进度状态
- `delta`: 追加增量文本
- `final/final_answer`: 完成并关闭连接
- `error`: 显示错误信息

---

## Redux状态管理

### State结构

```typescript
interface ChatState {
  messages: Message[];        // 消息列表
  sessionId: string;          // 会话ID
  isStreaming: boolean;       // 流式开关
  apiConnected: boolean;      // API连接状态
  isLoading: boolean;         // 加载状态
}
```

### Actions

```typescript
// 添加消息
dispatch(addMessage(message));

// 更新消息
dispatch(updateMessage({ 
  id: 'msg-id', 
  updates: { text: '新文本' } 
}));

// 清空消息
dispatch(clearMessages());

// 设置流式模式
dispatch(setIsStreaming(true));

// 设置API连接状态
dispatch(setApiConnected(true));

// 设置加载状态
dispatch(setLoading(true));

// 加载历史记录
dispatch(loadHistory(messages));
```

### Selectors

```typescript
// 在组件中获取状态
const { messages, sessionId, isStreaming } = useSelector(
  (state: RootState) => state.chat
);
```

---

## API服务层

### 主要函数

#### 1. checkHealth()
```typescript
const isConnected = await checkHealth();
// 返回: boolean
```

#### 2. sendQuery()
```typescript
const response = await sendQuery(query, sessionId, isStream);
// 返回: QueryResponse
```

#### 3. getHistory()
```typescript
const items = await getHistory(sessionId);
// 返回: HistoryItem[]
```

#### 4. clearHistory()
```typescript
const success = await clearHistory(sessionId);
// 返回: boolean
```

#### 5. createSSEConnection()
```typescript
const eventSource = createSSEConnection(
  sessionId,
  (data) => console.log('进度:', data),
  (data) => console.log('增量:', data.delta),
  (data) => console.log('完成:', data.answer),
  (error) => console.error('错误:', error)
);
```

---

## 工具函数

### 时间相关

```typescript
// 格式化时间
formatTime(timestamp); // "14:30"

// 获取当前时间
formatTime(); // 当前时间
```

### URL相关

```typescript
// 判断是否为图片URL
isImageUrl('https://example.com/image.png'); // true

// 标准化URL
normalizeUrl('https://example.com/image with space.png');
// 返回: 'https://example.com/image%20with%20space.png'

// 提取URL
extractUrlsLoose('访问 https://example.com 和 https://test.com');
// 返回: ['https://example.com', 'https://test.com']
```

### 图片解析

```typescript
// 解析答案和图片
const { text, images } = parseAnswerAndImages(`
  这是文字内容
  【图片】
  https://example.com/img1.png
  https://example.com/img2.jpg
`);
// text: "这是文字内容"
// images: ['https://example.com/img1.png', 'https://example.com/img2.jpg']

// 提取所有图片
extractAllImages('查看 https://img.png 这张图');
// 返回: ['https://img.png']
```

### HTML转义

```typescript
escapeHtml('<script>alert("xss")</script>');
// 返回: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
```

---

## 样式系统

### Sass变量

所有变量定义在 `src/styles/variables.scss`:

```scss
// 颜色
$brand: #1aa7ff;           // 主品牌色
$brand2: #5b7cfa;          // 辅助色
$bubble-user: #1aa7ff;     // 用户气泡
$bubble-bot: #ffffff;      // 机器人气泡

// 字体
$font-family: "Segoe UI", ...;
$font-mono: ui-monospace, ...;
```

### 使用变量

```scss
@import '../styles/variables';

.button {
  background: linear-gradient(135deg, $brand, $brand2);
  color: #fff;
}
```

### BEM命名

```scss
.msg {                    // Block
  &.user {               // Modifier
    justify-content: flex-end;
  }
  
  .bubble {              // Element
    border-radius: 14px;
  }
}
```

---

## 最佳实践

### 1. 组件拆分原则

- **单一职责**: 每个组件只做一件事
- **可复用性**: 通用组件应该独立
- ** Props传递**: 避免过深的props嵌套

### 2. 状态管理原则

- **局部状态**: 使用useState管理UI状态
- **全局状态**: 使用Redux管理共享状态
- **派生状态**: 使用selector计算派生值

### 3. 样式组织原则

- **组件样式**: 每个组件有自己的.scss文件
- **变量复用**: 颜色、尺寸使用变量
- **避免冲突**: 使用BEM或CSS Modules

### 4. 类型安全原则

- **定义接口**: 所有数据都有TypeScript类型
- **避免any**: 尽量不使用any类型
- **联合类型**: 使用联合类型表示多种可能

---

## 调试技巧

### Redux DevTools

安装Redux DevTools扩展，可以：
- 查看所有actions
- 时间旅行调试
- 状态快照

### React DevTools

安装React DevTools，可以：
- 查看组件树
- 检查props和state
- 性能分析

### 网络调试

浏览器Network面板：
- 查看API请求
- 检查SSE事件流
- 分析响应时间

### 控制台日志

关键位置已添加console.log：
- API调用
- SSE事件
- 错误信息

---

## 常见问题

### Q: 如何添加新组件？

1. 在`components/`创建`.tsx`和`.scss`文件
2. 实现组件逻辑
3. 在`components/index.ts`导出
4. 在父组件中使用

### Q: 如何修改主题？

编辑`src/styles/variables.scss`中的变量即可。

### Q: 如何添加新的API？

1. 在`src/services/api.ts`添加函数
2. 定义返回类型
3. 在组件中调用

### Q: 如何调试SSE？

1. 打开浏览器Network面板
2. 找到`/stream/{session_id}`请求
3. 查看EventStream标签
4. 观察实时事件

---

## 扩展开发

### 添加新功能示例：语音输入

1. **创建组件**: `VoiceInput.tsx`
2. **添加状态**: 在chatSlice中添加`isRecording`
3. **实现逻辑**: 使用Web Speech API
4. **集成**: 在ChatInput中使用

### 添加新样式主题

1. **创建变量文件**: `themes/dark.scss`
2. **定义变量**: 覆盖默认变量
3. **条件导入**: 根据用户选择导入主题

### 添加国际化

1. **创建语言文件**: `locales/zh.json`, `locales/en.json`
2. **安装i18n库**: `npm install react-i18next`
3. **替换文本**: 使用t()函数

---

希望这份指南能帮助你快速理解和使用各个组件！🚀
