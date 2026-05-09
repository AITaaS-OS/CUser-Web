import { DEFAULT_MASK_AVATAR } from "./constant";
import { getLang, Lang } from "./locales";
import { ModelConfig, useAppConfig } from "./store/config";

export type Updater<T> = (updater: (value: T) => void) => void;

export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export type DalleSize = "1024x1024" | "1792x1024" | "1024x1792";
export type DalleQuality = "standard" | "hd";
export type DalleStyle = "vivid" | "natural";

// 和后端协商保持一致，约定数据类型格式
export type SocketDataType = "AIChat" | "AIAudio" | "AIVideo" | "HeartBeat" | "Meeting" | "AIVision";

// 服务端Socket返回的标准数据格式
export type SocketData<T> = {
  type: SocketDataType;
  tag: string,
  data: Result<T>
};

// 服务端OpenAPI返回的标准数据格式
export type Result<T> = {
  code: number;
  success: boolean;
  message: string;
  result: T | null;
};

// 服务端OpenAPI返回的标准数据格式
export const Result = {
  OK<T>(data: T) {
    return {
      code: 200,
      success: true,
      message: "",
      result: data,
    }
  },
  Error(msg: string) {
    return {
      code: 500,
      success: false,
      message: msg,
      result: null,
    }
  }
};

// 服务端OpenAPI返回的标准分页数据格式
export type Page<T> = {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
};

export type UserRegisterInfo = {
  userName: string;
  userAvatar: string;
  userPhone: string;
  verifyCode: string;
  password: string;
};

//服务端返回的用户
export type User = {
  accessToken: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userType: number
};

//付款信息
export type Payment = {
  id: string;
  paymentKey: string;
  dataId: string;
  paymentType: number;
  functionCode: number;
};

export const DefaultPayment: Payment = {
  id: "",
  paymentKey: "0",
  dataId: "",
  paymentType: 0,
  functionCode: 0,
};

//对话配置,扩展使用
export interface ChatConfig {

}
export const ChatConfigDefault: ChatConfig = {

};

export interface MultimodalContent {
  type: "text" | "file" | "config";
  text?: string;
  url?: string;
  config?: ChatConfig
}

export type ChatMessageTool = {
  id: string;
  index?: number;
  type?: string;
  function?: {
    name: string;
    arguments?: string;
  };
  content?: string;
  isError?: boolean;
  msg?: string;
};

export interface RequestMessage {
  role: MessageRole;
  content: string | MultimodalContent[];
}

export type ChatMessage = RequestMessage & {
  id: string;
  date: string;
  isStreaming?: boolean;
  isError?: boolean;
  modelName?: string;
  tools?: ChatMessageTool[];
  userId?: string;
  userName?: string;
  userAvatar?: string;
};

//翻译配置
export interface TTTConfig {
  sourceLanguage: string;
  sourceLanguageName: string;
  targetLanguage: string;
  targetLanguageName: string;
  sourceText: string;
  context?: string;
}
export interface STTTTConfig extends TTTConfig {
  audio: string;
};
export const DefaultTTTConfig: TTTConfig = {
  sourceLanguage: "zh",
  sourceLanguageName: "中文简体",
  targetLanguage: 'en',
  targetLanguageName: '英语',
  sourceText: '',
};
export interface PTPConfig {
  prompt: string,
  images: string[],
  n: number,
  size: string
};
export interface SpeechConfig {
  threshold: number;//说话的阈值，高于此则判定为说话
};
export interface VisionConfig {
  enableVideo: boolean;//启用视频模式
  enableSpeak: boolean;
}
//声音配置
export interface VoiceConfig {
  voice: string;
  speed: number;
  volume: number;
  intonation: number;
  emotion: string;
}
export interface TTSConfig extends VoiceConfig {
  text: string;
};
export interface STSConfig extends VoiceConfig {
  audioPath: string;
};
export const DefaultAudioConfig: VoiceConfig = {
  voice: "aliyun-zhiyuan",
  speed: 0,
  volume: 100,
  intonation: 0,
  emotion: "",
};

//视频配置
export interface VideoConfig {
  picture: string;
  helloText: string;
  ratio: string;
  mainBox: Array<number>;
  focusBox: Array<number>;
  enableDownload: boolean;
}
export const DefaultVideoConfig: VideoConfig = {
  picture: "",
  helloText: "",
  ratio: "3:4",
  mainBox: [],
  focusBox: [],
  enableDownload: false
};

export interface Prompt {
  id: string;
  name: string;
  content: string;
  createBy: string;
  createTime: number;
  isPublic: boolean;
};

export type Mask = {
  id: string;
  createBy: string;
  createTime: number;
  avatar: string;
  name: string;
  hideContext?: boolean;
  context: ChatMessage[];
  syncGlobalConfig?: boolean;
  modelConfig: ModelConfig;
  lang: Lang;
  isPublic: boolean;
  plugin?: string[];
  enableArtifacts?: boolean;
  enableCodeFold?: boolean;
};

export const DefaultMask: Mask = {
  id: "",
  avatar: DEFAULT_MASK_AVATAR,
  name: "",
  context: [],
  syncGlobalConfig: true, // use global config as default
  modelConfig: { ...useAppConfig.getState().modelConfig },
  lang: getLang(),
  createBy: "",
  createTime: Date.now(),
  isPublic: true,
  plugin: [],

};

export type ModelType = {
  key: string;
  name: string;
  available: boolean;
  sorted: number;
  provider: string
}

export type ModelProviderType = {
  key: string;
  name: string;
  sorted: number;
  models: ModelType[]
}

export type P2VConfig = {

  quality: number;
  duration: number;
  fps: number;
  size: string | undefined;

  voice: string;
  speed: number;
  volume: number;
  intonation: number;
  emotion: string;

  enableQuality: boolean;
  enableDuration: boolean;
  enableFPS: boolean;
  enableSize: boolean;
  enableVoice: boolean;
  enableSpeed: boolean;
  enableVolume: boolean;
  enableIntonation: boolean;
  enableEmotion: boolean;
};

export const DefaultP2VConfig: P2VConfig = {
  quality: 0,
  duration: 5,
  fps: 30,
  size: "",
  voice: "aliyun-zhiyuan",
  speed: 0,
  volume: 100,
  intonation: 0,
  emotion: "",

  enableQuality: true,
  enableDuration: true,
  enableFPS: true,
  enableSize: true,
  enableVoice: true,
  enableSpeed: true,
  enableVolume: true,
  enableIntonation: true,
  enableEmotion: true,
};

