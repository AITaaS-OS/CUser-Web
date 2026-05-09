<div align="center">
  <a href='https://www.aitaas.cn'>
    <img src="https://www.aitaas.cn/public/logo-card.png" width="500px" alt="AITaaS"/>
  </a>
  <br />
  <h1>西柚 - AI智能创作平台</h1>
  <p>轻量级 AI 助手，赋能每个人的智能创作之旅</p>

[![Node Version](https://img.shields.io/badge/node-18%2B-green.svg)]()
[![React Version](https://img.shields.io/badge/react-19.2%2B-blue.svg)]()
[![Next Version](https://img.shields.io/badge/next-16.1%2B-black.svg)]()

</div>

---

## 目录

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
  - [环境要求](#环境要求)
  - [安装依赖](#安装依赖)
  - [本地开发](#本地开发)
  - [构建部署](#构建部署)
- [项目结构](#项目结构)
- [配置说明](#配置说明)
- [功能截图](#功能截图)
- [适用场景](#适用场景)
- [贡献指南](#贡献指南)
- [常见问题](#常见问题)
- [文档](#文档)
- [许可证](#许可证)
- [联系方式](#联系方式)

## 项目简介

西柚是 AITaaS 团队推出的轻量级 AI 智能创作应用平台，致力于为 C 端用户提供便捷的 AI 多媒体多模态应用体验，内容涵盖文本、语音、图像、语音、视频、文件等多种格式。基于现代化的技术栈，支持 Web、移动端 APP、桌面端应用等多种部署方式，让 AI 能力触手可及。

## 核心功能

### 🎭 AI 角色扮演
- 内置丰富的角色模板库
- 支持千人千面的个性化配置
- 超长上下文对话支持
- 自定义角色性格和能力

### 🧑‍🤝‍🧑 AI 虚拟朋友
- 仅需一张照片实现类真人视频对话
- 支持自定义视频对象和声音特征
- 实时情感表达和交互
- 多语言对话支持

### 🎬 AI 合成视频
- 精细化生成电商平台视频
- 社交平台短视频一键生成
- 图文声多模态协同创作
- 批量生产和模板管理

### 👁️ AI 视觉识别
- 麦克风和相机实时环境感知
- 声音、图像和视频实时识别
- 多模态融合分析
- 实时反馈和交互

### 💼 AI 一人公司
- 随时随地远程控制 AI 员工
- 手机、电脑、平板多端支持
- 自动化完成各种日常工作
- 工作流程可视化管理

### ⚙️ 个性化配置
- 自定义主题和界面风格
- 大模型参数灵活配置
- 音视频图像参数调节
- 插件和扩展能力管理

## 技术栈

### 前端框架
- **React** - 19.2+ - 用户界面构建
- **Next.js** - 16.1+ - 全栈框架
- **Tauri** - 2.8+ - 跨平台桌面应用
- **Ant Design** - 6.1+ - UI 组件库

### AI 能力
- **LLM** - 大语言模型集成
- **MLLM** - 多模态大语言模型
- **RAG** - 检索增强生成
- **Tools** - 工具调用框架
- **MCP** - 模型控制协议
- **Claw** - 智能代理框架

### 开发工具
- **TypeScript** - 类型安全
- **ESLint** - 代码规范
- **Prettier** - 代码格式化
- **Vite** - 构建工具

## 快速开始

### 环境要求

| 依赖 | 版本要求 |
|------|---------|
| Node.js | 18.x 或更高 |
| npm / yarn | 推荐使用 yarn |
| Rust | Tauri 构建需要 |
| 操作系统 | Windows 10+ / macOS 11+ / Linux |

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/AITaaS-OS/CUser-Web.git

# 进入项目目录
cd CUser-Web

# 安装依赖
yarn install
```

### 本地开发

#### Web 版本开发

```bash
yarn dev
```

访问 http://localhost:3000/cuser 查看应用。

#### 桌面端开发

```bash
yarn tauri dev
```

#### 移动端开发

```bash
# Android
yarn tauri android dev

# iOS (仅 macOS)
yarn tauri ios dev
```

### 构建部署

#### 静态文件部署

```bash
yarn export
```

输出目录：`./out`

#### 桌面端安装包

```bash
yarn app:build
```

- Windows (.exe): `src-tauri/target/release/`
- macOS (.dmg): `src-tauri/target/release/bundle/dmg/`
- Linux (.AppImage): `src-tauri/target/release/bundle/appimage/`

#### 移动端安装包

```bash
# Android APK
yarn tauri android build

# iOS IPA
yarn tauri ios build
```

- Android APK: `src-tauri/gen/android/app/build/outputs/`

## 项目结构

```
CUser-Web/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── components/        # 通用组件
│   ├── pages/             # 页面组件
│   ├── locales/           # 国际化
│   ├── store/             # 状态管理
│   └── utils/             # 工具函数
├── src/                   # 源代码
│   ├── components/        # 业务组件
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # API 服务
│   ├── stores/            # 状态管理
│   ├── types/             # TypeScript 类型
│   └── utils/             # 工具函数
├── public/                # 静态资源
│   └── showcase/          # 演示图片
├── src-tauri/             # Tauri 后端代码
│   ├── src/               # Rust 源码
│   └── tauri.conf.json    # Tauri 配置
├── .env                   # 环境变量
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目文档
```

## 配置说明

### 环境变量

复制 `.env.example` 为 `.env` 并根据需要修改：

```env
# 应用名称
NEXT_PUBLIC_APP_NAME=西柚

# API 地址
NEXT_PUBLIC_BASE_URL=https://api.aitaas.cn
```

### 主题配置

在 `app/config/theme.ts` 中自定义主题：

```typescript
export const themeConfig = {
  primaryColor: '#1890ff',
  layout: 'side',
  navTheme: 'dark',
  // ...
};
```

## 功能截图

### 角色扮演

<div align="center">
  <img src="https://www.aitaas.cn/public/showcase/chat-role1.png" alt="角色选择" width="45%" style="margin: 10px;"/>
  <img src="https://www.aitaas.cn/public/showcase/chat-model.png" alt="模型配置" width="45%" style="margin: 10px;"/>
  <img src="https://www.aitaas.cn/public/showcase/chat1.png" alt="对话界面1" width="45%" style="margin: 10px;"/>
  <img src="https://www.aitaas.cn/public/showcase/chat2.png" alt="对话界面2" width="45%" style="margin: 10px;"/>
</div>

### 虚拟朋友

<div align="center">
  <img src="https://www.aitaas.cn/public/showcase/video.png" alt="虚拟朋友" width="60%" />
</div>

### 视频合成

<div align="center">
  <img src="https://www.aitaas.cn/public/showcase/mv-shot.png" alt="视频合成" width="60%" />
</div>

### 视觉识别

<div align="center">
  <img src="https://www.aitaas.cn/public/showcase/vision.png" alt="视觉识别" width="60%" />
</div>

### 一人公司

<div align="center">
  <img src="https://www.aitaas.cn/public/showcase/opc.jpg" alt="一人公司" width="60%" />
</div>

### 设置界面

<div align="center">
  <img src="https://www.aitaas.cn/public/showcase/setting1.png" alt="设置1" width="45%" style="margin: 10px;"/>
  <img src="https://www.aitaas.cn/public/showcase/setting.png" alt="设置2" width="45%" style="margin: 10px;"/>
</div>

## 适用场景

| 场景 | 描述 |
|------|------|
| **个人用户** | 日常助手、学习伙伴、创意灵感来源 |
| **内容创作者** | 文案生成、视频制作、图片处理 |
| **教育领域** | 智能辅导、语言学习、知识问答 |
| **企业办公** | 文档处理、数据分析、流程自动化 |
| **客服服务** | 智能问答、多语言支持、情感分析 |

## 常见问题

### Q: 如何配置自定义大模型？

A: 在「设置」->「大模型配置」中添加自定义模型，支持 OpenAI、Anthropic、Google、百度、阿里等主流大模型。

### Q: 桌面端构建失败怎么办？

A: 请确保已安装 Rust 环境，并且满足 Tauri 的系统要求，详细请参考 [Tauri 文档](https://tauri.app/v1/guides/getting-started/prerequisites)。

### Q: 如何进行离线使用？

A: 仅角色扮演功能可以配置本地大模型（如 Ollama），在「设置」->「大模型配置」中进行配置。

### Q: 支持哪些大模型？

A: 目前支持 OpenAI、Anthropic Claude、Google Gemini、百度文心一言、阿里通义千问、字节豆包、智谱 AI、Moonshot 等。

## 文档

- 📚 [使用手册](https://www.aitaas.cn/doccenter/docs/guide)
- 📖 [API 文档](https://www.aitaas.cn/doccenter/docs/api)
- 🔧 [开发指南](https://www.aitaas.cn/doccenter/docs/dev)
- 📦 [部署教程](https://www.aitaas.cn/doccenter/docs/deploy)

## 许可证

本项目采用 Apache License 2.0 开源许可证。商业使用需获得授权，商业授权联系AITaaS@outlook.com。

## 联系方式

- 🌐 官网: [https://www.aitaas.cn](https://www.aitaas.cn)
- 📧 邮箱: AITaaS@outlook.com
- 💬 微信公众号: AITaaS

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐ Star 支持！</p>
  <p>Made with ❤️ by AITaaS Team</p>
</div>