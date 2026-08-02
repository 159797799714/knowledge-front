# 掌柜智库知识库 - React版本

这是一个基于 React 18 + TypeScript + Sass + Redux 的聊天应用，实现了与后端API的交互功能。

## 技术栈

- **React 18**: 前端框架
- **TypeScript**: 类型安全
- **Sass**: CSS预处理器
- **Redux Toolkit**: 状态管理
- **Vite**: 构建工具

## 项目结构

```
chat-react/
├── src/
│   ├── components/          # React组件
│   │   ├── ChatHeader.tsx       # 顶部栏组件
│   │   ├── MessageList.tsx      # 消息列表组件
│   │   ├── MessageItem.tsx      # 单条消息组件
│   │   └── ChatInput.tsx        # 输入框组件
│   ├── pages/                # 页面组件
│   │   ├── ChatPage.tsx         # 聊天主页面（含 ChatPage.scss）
│   │   └── LoginPage.tsx        # 登录页面
│   ├── store/               # Redux状态管理
│   │   ├── store.ts         # Store配置
│   │   └── chatSlice.ts     # 聊天状态切片
│   ├── services/            # API服务
│   │   └── api.ts           # API调用封装
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts         # 类型定义
│   ├── utils/               # 工具函数
│   │   └── helpers.ts       # 辅助函数
│   ├── styles/              # 全局样式
│   │   ├── variables.scss   # Sass变量
│   │   └── index.scss       # 全局样式
│   ├── App.tsx              # 根组件
│   └── main.tsx             # 入口文件
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 功能特性

1. **实时聊天**: 支持流式和非流式两种模式
2. **历史记录**: 自动加载和保存会话历史
3. **图片展示**: 支持在消息中显示图片
4. **进度追踪**: 显示AI处理过程的各个阶段
5. **会话管理**: 支持清空对话历史
6. **API健康检查**: 定期检查后端连接状态

## 安装和运行

### 1. 安装依赖

```bash
cd chat-react
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## API配置

默认的API地址为: `http://119.29.206.59:8001`

如需修改API地址，请编辑 `src/services/api.ts` 文件中的 `API_BASE` 常量。

## 主要API接口

- `GET /health` - 健康检查
- `POST /query` - 发送查询请求
- `GET /stream/{session_id}` - SSE流式响应
- `GET /history/{session_id}` - 获取历史记录
- `DELETE /history/{session_id}` - 清空历史记录

## 代码特点

1. **模块化设计**: 每个功能都有独立的组件和样式文件
2. **类型安全**: 使用TypeScript确保代码质量
3. **状态管理**: 使用Redux Toolkit进行全局状态管理
4. **响应式设计**: 使用Sass变量和嵌套提高样式可维护性
5. **错误处理**: 完善的错误处理和用户提示

## 注意事项

1. 确保后端API服务正在运行
2. 浏览器需要支持EventSource（SSE）
3. 建议使用现代浏览器（Chrome、Firefox、Edge等）
