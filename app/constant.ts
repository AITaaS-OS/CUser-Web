import { BasePath } from "./config/env";

//logo地址
export enum AITaaSLogo {
  Favicon = "https://www.aitaas.cn/public/favicon.ico",
  Logo = "https://www.aitaas.cn/public/logo.png",
  Circle = "https://www.aitaas.cn/public/logo-circle.png",
  Card = "https://www.aitaas.cn/public/logo-card.png",
}

//header名称
export enum AITaaSHeader {
  Token = "Authorization",
  APIToken = "Access-Token",
  SysCode = "cid"
}

//菜单宽度限制
export const MAX_SIDEBAR_WIDTH = 150;
export const MIN_SIDEBAR_WIDTH = 80;

//限制上传文件数
export const UPLOAD_MAX_COUNT = 5;

// 导航路径无需加BasePath
export enum Path {
  Home = "/",
  Chat = "/chat",
  Video = "/video",
  DH = "/dh",
  MV = "/mv",
  CBC = "/cbc",
  Vision = "/vision",
  Setting = "/setting",
  About = "/about",
  NewChat = "/new-chat",
  Masks = "/masks",
  Plugins = "/plugins",
  Auth = "/auth",
  Sd = "/sd",
  Artifacts = "/artifacts",
  SearchChat = "/search-chat",
}

// 服务端API需加上BasePath+
export enum ServerAPIPath {
  Cors = BasePath + "",
  Azure = BasePath + "/api/azure",
  OpenAI = BasePath + "/api/openai",
  Anthropic = BasePath + "/api/anthropic",
  Google = BasePath + "/api/google",
  Baidu = BasePath + "/api/baidu",
  ByteDance = BasePath + "/api/bytedance",
  Alibaba = BasePath + "/api/alibaba",
  Tencent = BasePath + "/api/tencent",
  Moonshot = BasePath + "/api/moonshot",
  Iflytek = BasePath + "/api/iflytek",
  Stability = BasePath + "/api/stability",
  Artifacts = BasePath + "/api/artifacts",
  XAI = BasePath + "/api/xai",
  ChatGLM = BasePath + "/api/chatglm",
  AITaaS = BasePath + "/api/aitaas",
}

//默认使用的模型
export const DefaultModelName = "AITaaS"
export const DefaultModelProviderName = "AITaaS"
//默认角色头像
export const DEFAULT_MASK_AVATAR = "bot";

// 对话输出模式
export enum ChatOutputMode {
  Common = "Common", //一般，走HTTP
  Socket = "Socket", //单独通道模式
  Stream = "Stream", //流式打字机模式
}

//EMO补偿帧
export const EMOVideo = {
  HelloVideoName: "EMO-HELLO",
  ProcessingVideoName: "EMO-PROCESSING",
  FreeVideoName: "EMO-FREE"
};

export const CACHE_URL_PREFIX = "/api/cache";

export enum SlotID {
  AppContent = "app-content",
  AppSidebar = "app-sidebar",
  CustomModel = "custom-model",
}

export enum StoreKey {
  Chat = "aitaas-chat",
  Plugin = "aitaas-plugin",
  Model = "aitaas-model",
  Config = "aitaas-config",
  Update = "aitaas-updater",
  Mask = "aitaas-mask",
  Prompt = "aitaas-prompt",
  Sync = "sync",
  SdList = "sd-list",
  User = "aitaas-user", //add for AITaaS
}

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "aitaas-cuser";

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

// Google API safety settings, see https://ai.google.dev/gemini-api/docs/safety-settings
// BLOCK_NONE will not block any content, and BLOCK_ONLY_HIGH will block only high-risk content.
export enum GoogleSafetySettingsThreshold {
  BLOCK_NONE = "BLOCK_NONE",
  BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
  BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
  BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
}

export enum ModelProvider {
  AITaaS = "AITaaS",
  OpenAI = "OpenAI",
  Azure = "Azure",
  Google = "Google",
  Anthropic = "Anthropic",
  Baidu = "Baidu",
  ByteDance = "ByteDance",
  Alibaba = "Alibaba",
  Tencent = "Tencent",
  Moonshot = "Moonshot",
  Iflytek = "Iflytek",
  XAI = "XAI",
  ChatGLM = "ChatGLM",
  Stability = "Stability"
}

export const Stability = {
  GeneratePath: "v2beta/stable-image/generate",
  BaseUrl: "https://api.stability.ai",
};

export const Anthropic = {
  ChatPath: "v1/messages",
  ChatPath1: "v1/complete",
  BaseUrl: "https://api.anthropic.com",
  Vision: "2023-06-01",
};

export const OpenAI = {
  BaseUrl: "https://api.openai.com",
  ChatPath: "v1/chat/completions",
  SpeechPath: "v1/audio/speech",
  ImagePath: "v1/images/generations",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

export const Azure = {
  ChatPath: (deployName: string, apiVersion: string) =>
    `deployments/${deployName}/chat/completions?api-version=${apiVersion}`,
  // https://<your_resource_name>.openai.azure.com/openai/deployments/<your_deployment_name>/images/generations?api-version=<api_version>
  ImagePath: (deployName: string, apiVersion: string) =>
    `deployments/${deployName}/images/generations?api-version=${apiVersion}`,
  BaseUrl: "https://{resource-url}/openai",
};

export const Google = {
  BaseUrl: "https://generativelanguage.googleapis.com/",
  ChatPath: (modelName: string) =>
    `v1beta/models/${modelName}:streamGenerateContent`,
};

export const Baidu = {
  BaseUrl: "https://aip.baidubce.com",
  ChatPath: (modelName: string) => {
    let endpoint = modelName;
    if (modelName === "ernie-4.0-8k") {
      endpoint = "completions_pro";
    }
    if (modelName === "ernie-4.0-8k-preview-0518") {
      endpoint = "completions_adv_pro";
    }
    if (modelName === "ernie-3.5-8k") {
      endpoint = "completions";
    }
    if (modelName === "ernie-speed-8k") {
      endpoint = "ernie_speed";
    }
    return `rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${endpoint}`;
  },
  OAuthUrl :"https://aip.baidubce.com/oauth/2.0/token"
};

export const ByteDance = {
  BaseUrl: "https://ark.cn-beijing.volces.com/api/v3",
  ChatPath: "chat/completions",
};

export const Alibaba = {
  BaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  ChatPath: "chat/completions",
};

export const Tencent = {
  BaseUrl: "https://hunyuan.tencentcloudapi.com",
};

export const Moonshot = {
  BaseUrl: "https://api.moonshot.cn/v1",
  ChatPath: "chat/completions",
};

export const Iflytek = {
  BaseUrl: "https://spark-api-open.xf-yun.com/v1",
  ChatPath: "chat/completions",
};

export const XAI = {
  BaseUrl: "https://api.x.ai",
  ChatPath: "v1/chat/completions",
};

export const ChatGLM = {
  BaseUrl: "https://open.bigmodel.cn/api/paas/v4",
  ChatPath: "chat/completions",
};

// input / time / model / lang
export const DEFAULT_INPUT_TEMPLATE = `{{input}}`;

// export const DEFAULT_SYSTEM_TEMPLATE = `
// You are ChatGPT, a large language model trained by {{ServiceProvider}}.
// Knowledge cutoff: {{cutoff}}
// Current model: {{model}}
// Current time: {{time}}
// Latex inline: $x^2$
// Latex block: $$e=mc^2$$
// `;
export const DEFAULT_SYSTEM_TEMPLATE = `
You are ChatGPT, a large language model trained by {{ServiceProvider}}.
Knowledge cutoff: {{cutoff}}
Current model: {{model}}
Current time: {{time}}
Latex inline: \\(x^2\\) 
Latex block: $$e=mc^2$$
`;

export const SUMMARIZE_MODEL = "gpt-4o-mini";
export const GEMINI_SUMMARIZE_MODEL = "gemini-pro";

export const KnowledgeCutOffDate: Record<string, string> = {
  default: "2021-09",
  "gpt-4-turbo": "2023-12",
  "gpt-4-turbo-2024-04-09": "2023-12",
  "gpt-4-turbo-preview": "2023-12",
  "gpt-4o": "2023-10",
  "gpt-4o-2024-05-13": "2023-10",
  "gpt-4o-2024-08-06": "2023-10",
  "gpt-4o-2024-11-20": "2023-10",
  "chatgpt-4o-latest": "2023-10",
  "gpt-4o-mini": "2023-10",
  "gpt-4o-mini-2024-07-18": "2023-10",
  "gpt-4-vision-preview": "2023-04",
  "o1-mini": "2023-10",
  "o1-preview": "2023-10",
  // After improvements,
  // it's now easier to add "KnowledgeCutOffDate" instead of stupid hardcoding it, as was done previously.
  "gemini-pro": "2023-12",
  "gemini-pro-vision": "2023-12",
};

export const DEFAULT_TTS_ENGINE = DefaultModelName;
export const DEFAULT_TTS_MODEL = DefaultModelName;
export const DEFAULT_TTS_VOICE = "alloy";

export const TTS_ENGINES = ["AITaaS", "OpenAI-TTS", "Edge-TTS"];
export const TTS_MODELS = ["tts-1", "tts-1-hd"];
export const TTS_VOICES = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
];

const openaiModels = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-0125",
  "gpt-4",
  "gpt-4-0613",
  "gpt-4-32k",
  "gpt-4-32k-0613",
  "gpt-4-turbo",
  "gpt-4-turbo-preview",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-11-20",
  "chatgpt-4o-latest",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-4-vision-preview",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-1106-preview",
  "dall-e-3",
  "o1-mini",
  "o1-preview",
];

const googleModels = [
  "gemini-1.0-pro",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash-latest",
  "gemini-exp-1114",
  "gemini-exp-1121",
  "learnlm-1.5-pro-experimental",
  "gemini-pro-vision",
];

const anthropicModels = [
  "claude-instant-1.2",
  "claude-2.0",
  "claude-2.1",
  "claude-3-sonnet-20240229",
  "claude-3-opus-20240229",
  "claude-3-opus-latest",
  "claude-3-haiku-20240307",
  "claude-3-5-haiku-20241022",
  "claude-3-5-haiku-latest",
  "claude-3-5-sonnet-20240620",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-latest",
];

const baiduModels = [
  "ernie-4.0-turbo-8k",
  "ernie-4.0-8k",
  "ernie-4.0-8k-preview",
  "ernie-4.0-8k-preview-0518",
  "ernie-4.0-8k-latest",
  "ernie-3.5-8k",
  "ernie-3.5-8k-0205",
  "ernie-speed-128k",
  "ernie-speed-8k",
  "ernie-lite-8k",
  "ernie-tiny-8k",
];

const bytedanceModels = [
  "doubao-seed-1-8-251215",
  "doubao-seed-1-6-251015",
  "doubao-seed-1-6-lite-251015",
  "doubao-seed-1-6-flash-250828",
  "doubao-seed-1-6-vision-250815",
  "doubao-seed-1-6-thinking-250715"
];

const alibabaModes = [
  "qwen-turbo",
  "qwen-plus",
  "qwen-max",
  "qwen-max-0428",
  "qwen-max-0403",
  "qwen-max-0107",
  "qwen-max-longcontext",
];

const aitaasModes = ["AITaaS"];

const tencentModels = [
  "hunyuan-pro",
  "hunyuan-standard",
  "hunyuan-lite",
  "hunyuan-role",
  "hunyuan-functioncall",
  "hunyuan-code",
  "hunyuan-vision",
];

const moonshotModes = ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"];

const iflytekModels = [
  "general",
  "generalv3",
  "pro-128k",
  "generalv3.5",
  "4.0Ultra",
];

const xAIModes = ["grok-beta"];

const chatglmModels = [
  "glm-4-plus",
  "glm-4-0520",
  "glm-4",
  "glm-4-air",
  "glm-4-airx",
  "glm-4-long",
  "glm-4-flashx",
  "glm-4-flash",
];

let seq = 1000; // 内置的模型序号生成器从1000开始
export const DEFAULT_MODELS = [
  ...aitaasModes.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "AITaaS",
      providerName: "AITaaS",
      providerType: "AITaaS",
      sorted: 0,
    },
  })),
  ...openaiModels.map((name) => ({
    name,
    available: true,
    sorted: seq++, // Global sequence sort(index)
    provider: {
      id: "openai",
      providerName: "OpenAI",
      providerType: "openai",
      sorted: 1, // 这里是固定的，确保顺序与之前内置的版本一致
    },
  })),
  ...openaiModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "azure",
      providerName: "Azure",
      providerType: "azure",
      sorted: 2,
    },
  })),
  ...googleModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "google",
      providerName: "Google",
      providerType: "google",
      sorted: 3,
    },
  })),
  ...anthropicModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "anthropic",
      providerName: "Anthropic",
      providerType: "anthropic",
      sorted: 4,
    },
  })),
  ...baiduModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "baidu",
      providerName: "Baidu",
      providerType: "baidu",
      sorted: 5,
    },
  })),
  ...bytedanceModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "bytedance",
      providerName: "ByteDance",
      providerType: "bytedance",
      sorted: 6,
    },
  })),
  ...alibabaModes.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "alibaba",
      providerName: "Alibaba",
      providerType: "alibaba",
      sorted: 7,
    },
  })),
  ...tencentModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "tencent",
      providerName: "Tencent",
      providerType: "tencent",
      sorted: 8,
    },
  })),
  ...moonshotModes.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "moonshot",
      providerName: "Moonshot",
      providerType: "moonshot",
      sorted: 9,
    },
  })),
  ...iflytekModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "iflytek",
      providerName: "Iflytek",
      providerType: "iflytek",
      sorted: 10,
    },
  })),
  ...xAIModes.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "xai",
      providerName: "XAI",
      providerType: "xai",
      sorted: 11,
    },
  })),
  ...chatglmModels.map((name) => ({
    name,
    available: true,
    sorted: seq++,
    provider: {
      id: "chatglm",
      providerName: "ChatGLM",
      providerType: "chatglm",
      sorted: 12,
    },
  })),
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;

export const DEFAULT_GA_ID = "G-89WN60ZK2E";
export const PLUGINS = [
  { name: "Plugins", path: Path.Plugins },
  { name: "Stable Diffusion", path: Path.Sd },
  { name: "Search Chat", path: Path.SearchChat },
];
