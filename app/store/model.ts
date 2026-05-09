import {
  GoogleSafetySettingsThreshold,
  ModelProvider,
  StoreKey,
  ServerAPIPath, ChatOutputMode,
  DefaultModelName,
  Stability,
  OpenAI,
  Anthropic,
  Google,
  Baidu,
  ByteDance,
  Alibaba,
  Tencent,
  Moonshot,
  Iflytek,
  XAI,
  ChatGLM
} from "../constant";
import { BasePath, AITaaS_BaseUrl, AITaaS_SocketUrl } from "@/app/config/env";
import { getHeaders } from "../client/api";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";
import { DEFAULT_APP_CONFIG, useAppConfig } from "./config";
import { collectModelsWithDefaultModel, getModelProvider } from "../utils/model";
import { useUserState } from "./user";
import { sys } from "@/app/utils/sys";
import { useMemo } from "react";
import { groupBy } from "lodash-es";
import { ModelProviderType } from "../types";
import { ensure } from "../utils";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const isApp = getClientConfig()?.buildMode === "export";

//默认配置项先使用常量（constant.ts）中的设定，在setting中被复写
const DEFAULT_MODEL_PROVIDER_CONFIG = {
  enableCustomConfig: false,

  provider: ModelProvider.AITaaS,

  AITaaS_Socket_Url: AITaaS_SocketUrl,
  AITaaS_Url: AITaaS_BaseUrl,
  AITaaS_OutputMode: ChatOutputMode.Stream,

  // custom config

  // openai
  openaiBaseUrl: isApp ? OpenAI.BaseUrl : ServerAPIPath.OpenAI,
  openaiApiKey: "",

  // azure
  azureBaseUrl: "",
  azureApiKey: "",
  azureApiVersion: "2023-08-01-preview",

  // google ai studio
  googleBaseUrl: isApp ? Google.BaseUrl : ServerAPIPath.Google,
  googleApiKey: "",
  googleApiVersion: "v1",
  googleSafetySettings: GoogleSafetySettingsThreshold.BLOCK_ONLY_HIGH,

  // anthropic
  anthropicBaseUrl: isApp ? Anthropic.BaseUrl : ServerAPIPath.Anthropic,
  anthropicApiKey: "",
  anthropicApiVersion: "2023-06-01",

  // baidu
  baiduBaseUrl: isApp ? Baidu.BaseUrl : ServerAPIPath.Baidu,
  baiduApiKey: "",
  baiduSecretKey: "",

  // bytedance
  bytedanceBaseUrl: isApp ? ByteDance.BaseUrl : ServerAPIPath.ByteDance,
  bytedanceApiKey: "",

  // alibaba
  alibabaBaseUrl: isApp ? Alibaba.BaseUrl : ServerAPIPath.Alibaba,
  alibabaApiKey: "",

  // moonshot
  moonshotBaseUrl: isApp ? Moonshot.BaseUrl : ServerAPIPath.Moonshot,
  moonshotApiKey: "",

  //stability
  stabilityBaseUrl: isApp ? Stability.BaseUrl : ServerAPIPath.Stability,
  stabilityApiKey: "",

  // tencent
  tencentBaseUrl: isApp ? Tencent.BaseUrl : ServerAPIPath.Tencent,
  tencentSecretKey: "",
  tencentSecretId: "",

  // iflytek
  iflytekBaseUrl: isApp ? Iflytek.BaseUrl : ServerAPIPath.Iflytek,
  iflytekApiKey: "",
  iflytekApiSecret: "",

  // xai
  xaiBaseUrl: isApp ? XAI.BaseUrl : ServerAPIPath.XAI,
  xaiApiKey: "",

  // chatglm
  chatglmBaseUrl: isApp ? ChatGLM.BaseUrl : ServerAPIPath.ChatGLM,
  chatglmApiKey: "",

  // server config
  hideBalanceQuery: false,

  disableFastLink: false,
  customModels: "",

  defaultModel: DefaultModelName,

  // tts config
  edgeTTSVoiceName: "zh-CN-YunxiNeural",
};

export const useModelProviderConfig = createPersistStore(
  { ...DEFAULT_MODEL_PROVIDER_CONFIG },

  (set, get) => ({

    setConfig(config: any) {
      if (config)
        set(() => ({ ...config }));
    },

    edgeVoiceName() {
      this.syncFromServerConfig();

      return get().edgeTTSVoiceName;
    },

    isValidOpenAI() {
      return ensure(get(), ["openaiApiKey"]);
    },

    isValidAzure() {
      return ensure(get(), ["azureBaseUrl", "azureApiKey", "azureApiVersion"]);
    },

    isValidGoogle() {
      return ensure(get(), ["googleApiKey"]);
    },

    isValidAnthropic() {
      return ensure(get(), ["anthropicApiKey"]);
    },

    isValidBaidu() {
      return ensure(get(), ["baiduApiKey", "baiduSecretKey"]);
    },

    isValidByteDance() {
      return ensure(get(), ["bytedanceApiKey"]);
    },

    isValidAlibaba() {
      return ensure(get(), ["alibabaApiKey"]);
    },

    isValidTencent() {
      return ensure(get(), ["tencentSecretKey", "tencentSecretId"]);
    },

    isValidMoonshot() {
      return ensure(get(), ["moonshotApiKey"]);
    },
    isValidIflytek() {
      return ensure(get(), ["iflytekApiKey"]);
    },

    isValidXAI() {
      return ensure(get(), ["xaiApiKey"]);
    },

    isValidChatGLM() {
      return ensure(get(), ["chatglmApiKey"]);
    },

    isAuthorized() {
      this.syncFromServerConfig();

      const user = useUserState.getState();

      //有效的令牌+有效的模型配置
      return (
        this.isValidOpenAI() ||
        this.isValidAzure() ||
        this.isValidGoogle() ||
        this.isValidAnthropic() ||
        this.isValidBaidu() ||
        this.isValidByteDance() ||
        this.isValidAlibaba() ||
        this.isValidTencent() ||
        this.isValidMoonshot() ||
        this.isValidIflytek() ||
        this.isValidXAI() ||
        this.isValidChatGLM() ||
        user.hasValidToken()
      );
    },
    syncFromServerConfig() {
      if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;

      fetchState = 1;

      fetch(BasePath + "/api/config", {
        method: "post",
        body: null,
        headers: {
          ...getHeaders(),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          const defaultModel = res.defaultModel ?? "";
          if (defaultModel !== "") {
            const [model, providerName] = getModelProvider(defaultModel);
            DEFAULT_APP_CONFIG.modelConfig.modelName = model;
            DEFAULT_APP_CONFIG.modelConfig.modelProvider = providerName as any;
          }

          return res;
        })
        .then((res: DangerConfig) => {
          sys.log.info(">>>同步服务端配置: ", res);
          set(() => ({ ...res }));
        })
        .catch(() => {
          sys.log.error(">>>同步服务端配置失败");
        })
        .finally(() => {
          fetchState = 2;
        });
    },
  }),
  {
    name: StoreKey.Model,
    version: 2,
    migrate(persistedState, version) {
      if (version < 2) {
        const state = persistedState as {
          token: string;
          openaiApiKey: string;
          azureApiVersion: string;
          googleApiKey: string;
        };
        state.openaiApiKey = state.token;
        state.azureApiVersion = "2023-08-01-preview";
      }

      return persistedState as any;
    },
  },
);

export function useModelStore() {
  const accessStore = useModelProviderConfig();
  const configStore = useAppConfig();
  const models = useMemo(() => {
    return collectModelsWithDefaultModel(
      configStore.models,
      [configStore.customModels, accessStore.customModels].join(","),
      accessStore.defaultModel,
    );
  }, [
    accessStore.customModels,
    accessStore.defaultModel,
    configStore.customModels,
    configStore.models,
  ]);

  const providers: ModelProviderType[] = useMemo(() => {
    const items: ModelProviderType[] = [];
    const gModels = groupBy(
      models.filter((v) => v.available),
      "provider.providerName",
    );

    Object.keys(gModels).forEach((providerName, index) => {
      const group: ModelProviderType = {
        key: providerName,
        name: providerName,
        models: [],
        sorted: index
      };

      gModels[providerName].forEach((v) => {
        group.models.push(
          {
            provider: v.provider?.providerName || "",
            key: `${v.name}@${v.provider?.providerName}`,
            name: v.displayName,
            available: v.available,
            sorted: v.sorted
          }
        );
      });

      items.push(group);
    });

    return items;
  }, [models]);

  return { models, providers };
}
