import { getClientConfig } from "../config/client";
import { AITaaSHeader, ModelProvider } from "../constant";

import {
  useModelProviderConfig,
  useChatStore,
} from "../store";
//用户状态, add for AITaaS
import { useUserState } from "../store/user";
import { ChatGPTApi, DalleRequestPayload } from "./platforms/openai";
import { GeminiProApi } from "./platforms/google";
import { ClaudeApi } from "./platforms/anthropic";
import { ErnieApi } from "./platforms/baidu";
import { DoubaoApi } from "./platforms/bytedance";
import { QwenApi } from "./platforms/alibaba";
import { HunyuanApi } from "./platforms/tencent";
import { MoonshotApi } from "./platforms/moonshot";
import { SparkApi } from "./platforms/iflytek";
import { XAIApi } from "./platforms/xai";
import { ChatGLMApi } from "./platforms/glm";
import { AITaaSApi } from "./platforms/aitaas";
import { ChatMessageTool, RequestMessage } from "../types";

export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export const Models = ["gpt-3.5-turbo", "gpt-4"] as const;
export const TTSModels = ["tts-1", "tts-1-hd"] as const;

export interface LLMConfig {
  modelName: string;
  providerName?: string;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  size?: DalleRequestPayload["size"];
  quality?: DalleRequestPayload["quality"];
  style?: DalleRequestPayload["style"];
}

export interface SpeechOptions {
  model: string;
  input: string;
  voice: string;
  response_format?: string;
  speed?: number;
  onController?: (controller: AbortController) => void;
}

export interface ChatOptions {
  messages: RequestMessage[];
  config: LLMConfig;

  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string, responseRes: Response) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
  onBeforeTool?: (tool: ChatMessageTool) => void;
  onAfterTool?: (tool: ChatMessageTool) => void;
}

export interface LLMUsage {
  used: number;
  total: number;
}

export interface LLMModel {
  name: string;
  displayName?: string;
  available: boolean;
  provider: LLMModelProvider;
  sorted: number;
}

export interface LLMModelProvider {
  id: string;
  providerName: string;
  providerType: string;
  sorted: number;
}

export abstract class LLMApi {
  abstract chat(options: ChatOptions): Promise<void>;
  abstract speech(options: SpeechOptions): Promise<ArrayBuffer>;
  abstract usage(): Promise<LLMUsage>;
  abstract models(): Promise<LLMModel[]>;
}

type ProviderName = "openai" | "azure" | "claude" | "palm";

interface Model {
  name: string;
  provider: ProviderName;
  ctxlen: number;
}

interface ChatProvider {
  name: ProviderName;
  apiConfig: {
    baseUrl: string;
    apiKey: string;
    summaryModel: Model;
  };
  models: Model[];

  chat: () => void;
  usage: () => void;
}

export class ClientApi {
  public llm: LLMApi;

  constructor(provider: ModelProvider = ModelProvider.AITaaS) {
    switch (provider) {
      case ModelProvider.Google:
        this.llm = new GeminiProApi();
        break;
      case ModelProvider.Anthropic:
        this.llm = new ClaudeApi();
        break;
      case ModelProvider.Baidu:
        this.llm = new ErnieApi();
        break;
      case ModelProvider.ByteDance:
        this.llm = new DoubaoApi();
        break;
      case ModelProvider.Alibaba:
        this.llm = new QwenApi();
        break;
      case ModelProvider.Tencent:
        this.llm = new HunyuanApi();
        break;
      case ModelProvider.Moonshot:
        this.llm = new MoonshotApi();
        break;
      case ModelProvider.Iflytek:
        this.llm = new SparkApi();
        break;
      case ModelProvider.XAI:
        this.llm = new XAIApi();
        break;
      case ModelProvider.ChatGLM:
        this.llm = new ChatGLMApi();
        break;
      case ModelProvider.OpenAI:
        this.llm = new ChatGPTApi();
        break;
      default:
        this.llm = new AITaaSApi();
    }
  }

  config() { }

  prompts() { }

  masks() { }
}

export function getBearerToken(
  apiKey: string,
  noBearer: boolean = false,
): string {
  return validString(apiKey)
    ? `${noBearer ? "" : "Bearer "}${apiKey.trim()}`
    : "";
}

export function validString(x: string): boolean {
  return x?.length > 0;
}

export function getHeaders(ignoreHeaders: boolean = false) {
  const accessStore = useModelProviderConfig.getState();
  const chatStore = useChatStore.getState();
  const user = useUserState.getState();

  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  //统一添加后端校验使用的用户令牌
  if (user.accessToken && user.userId)
    headers[AITaaSHeader.APIToken] = user.accessToken;

  const clientConfig = getClientConfig();

  function getConfig() {
    const modelConfig = chatStore.currentSession().mask.modelConfig;
    const isGoogle = modelConfig.modelProvider === ModelProvider.Google;
    const isAzure = modelConfig.modelProvider === ModelProvider.Azure;
    const isAnthropic = modelConfig.modelProvider === ModelProvider.Anthropic;
    const isBaidu = modelConfig.modelProvider == ModelProvider.Baidu;
    const isByteDance = modelConfig.modelProvider === ModelProvider.ByteDance;
    const isAlibaba = modelConfig.modelProvider === ModelProvider.Alibaba;
    const isMoonshot = modelConfig.modelProvider === ModelProvider.Moonshot;
    const isIflytek = modelConfig.modelProvider === ModelProvider.Iflytek;
    const isXAI = modelConfig.modelProvider === ModelProvider.XAI;
    const isChatGLM = modelConfig.modelProvider === ModelProvider.ChatGLM;
    const isOpenAI = modelConfig.modelProvider === ModelProvider.OpenAI;
    const isAITaaS = modelConfig.modelProvider === ModelProvider.AITaaS;
    const apiKey = isGoogle
      ? accessStore.googleApiKey
      : isAzure
        ? accessStore.azureApiKey
        : isAnthropic
          ? accessStore.anthropicApiKey
          : isByteDance
            ? accessStore.bytedanceApiKey
            : isAlibaba
              ? accessStore.alibabaApiKey
              : isMoonshot
                ? accessStore.moonshotApiKey
                : isXAI
                  ? accessStore.xaiApiKey
                  : isChatGLM
                    ? accessStore.chatglmApiKey
                    : isOpenAI
                      ? accessStore.openaiApiKey
                      : isIflytek
                        ? accessStore.iflytekApiKey &&
                          accessStore.iflytekApiSecret
                          ? accessStore.iflytekApiKey +
                          ":" +
                          accessStore.iflytekApiSecret
                          : ""
                        : user.accessToken;
    return {
      isGoogle,
      isAzure,
      isAnthropic,
      isBaidu,
      isByteDance,
      isAlibaba,
      isMoonshot,
      isIflytek,
      isXAI,
      isChatGLM,
      apiKey,
    };
  }

  function getAuthHeader(): string {
    return isAzure
      ? "api-key"
      : isAnthropic
        ? "x-api-key"
        : isGoogle
          ? "x-goog-api-key"
          : "Authorization";
  }

  const { isGoogle, isAzure, isAnthropic, isBaidu, apiKey } = getConfig();
  // when using baidu api in app, not set auth header
  if (isBaidu && clientConfig?.isApp) return headers;

  const authHeader = getAuthHeader();

  const bearerToken = getBearerToken(
    apiKey,
    isAzure || isAnthropic || isGoogle,
  );

  if (bearerToken) {
    headers[authHeader] = bearerToken;
  }

  return headers;
}

export function getClientApi(provider: ModelProvider): ClientApi {
  return new ClientApi(provider);
}
