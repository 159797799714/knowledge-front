# 快速开始指南

## 🚀 5分钟启动项目

### 前置要求

- Node.js 16+ 
- npm 或 yarn
- 后端API服务正在运行（http://119.29.206.59:8001）

### 步骤1：进入项目目录

```bash
cd chat-react
```

### 步骤2：安装依赖

```bash
npm install
```

这将安装以下核心依赖：
- react & react-dom (v18)
- @reduxjs/toolkit & react-redux
- sass
- vite & typescript

### 步骤3：启动开发服务器

```bash
npm run dev
```

你会看到类似输出：
```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 步骤4：在浏览器中打开

访问 `http://localhost:5173/`

## 📝 主要功能测试

### 1. 发送消息

在输入框中输入问题，按Enter发送：
```
如何使用万用表测量电压？
```

### 2. 切换流式模式

点击右上角的"流式输出"复选框：
- ✅ 勾选：实时显示AI生成的文本
- ❌ 未勾选：等待完整答案后显示

### 3. 查看进度

当AI处理时，会显示阶段进度：
```
阶段进度（已完成2，进行中1，状态：处理中）
✅ 理解用户问题
✅ 检索相关知识
⏳ 生成回答
```

### 4. 查看图片

如果回答包含图片，会自动显示：
- 图片预览
- 图片URL链接（可点击打开）

### 5. 清空对话

点击"清空对话"按钮，确认后会：
- 删除服务端历史记录
- 保留欢迎消息
- 清空本地显示

## 🔧 常见问题

### Q1: API显示"未连接"

**原因**: 后端服务未启动或地址错误

**解决**:
1. 确认后端服务运行在 `http://119.29.206.59:8001`
2. 检查浏览器控制台是否有CORS错误
3. 修改 `src/services/api.ts` 中的 `API_BASE` 常量

### Q2: 流式输出不工作

**原因**: 浏览器不支持EventSource或网络问题

**解决**:
1. 使用现代浏览器（Chrome/Firefox/Edge）
2. 检查网络连接
3. 尝试切换到非流式模式

### Q3: 图片无法显示

**原因**: 图片URL无效或跨域限制

**解决**:
1. 检查图片URL是否可访问
2. 确认图片服务器允许跨域
3. 查看浏览器控制台的图片加载错误

### Q4: 历史记录未加载

**原因**: Session ID不存在或MongoDB连接问题

**解决**:
1. 刷新页面重试
2. 检查浏览器localStorage中是否有`kb_session_id`
3. 确认后端MongoDB服务正常

## 🎨 自定义配置

### 修改API地址

编辑 `src/services/api.ts`:
```typescript
const API_BASE = 'http://your-api-server:port';
```

### 修改主题颜色

编辑 `src/styles/variables.scss`:
```scss
$brand: #your-color;      // 主色调
$brand2: #your-color;     // 辅助色
```

### 修改默认端口

编辑 `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // 修改为你想要的端口
  }
})
```

## 📦 生产部署

### 构建项目

```bash
npm run build
```

生成的文件在 `dist/` 目录

### 本地预览

```bash
npm run preview
```

### 部署到服务器

1. 上传 `dist/` 目录到Web服务器
2. 配置Nginx/Apache指向dist目录
3. 确保API地址可访问

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🛠️ 开发技巧

### 热更新

Vite支持即时热更新，修改代码后浏览器自动刷新。

### TypeScript类型提示

所有组件和函数都有完整的类型定义，IDE会提供智能提示。

### Redux DevTools

安装Redux DevTools浏览器扩展，可以调试状态变化。

### Sass嵌套

样式文件使用Sass嵌套，结构更清晰：
```scss
.msg {
  &.user { ... }
  .bubble { ... }
}
```

## 📚 下一步

- 阅读 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 了解架构设计
- 阅读 [README.md](./README.md) 了解完整文档
- 探索 `src/components/` 目录学习组件实现
- 查看 `src/utils/helpers.ts` 了解工具函数

## 💡 提示

1. **保持后端运行**: 确保API服务始终可用
2. **清除缓存**: 如遇问题，尝试清除浏览器缓存
3. **查看控制台**: 浏览器控制台会显示详细错误信息
4. **Session持久化**: Session ID保存在localStorage，关闭浏览器后仍保留

## 🆘 获取帮助

如遇到问题：
1. 检查浏览器控制台错误信息
2. 查看网络请求是否成功
3. 确认后端API返回正确的数据格式
4. 参考本文档的常见问题部分

祝你使用愉快！🎉
