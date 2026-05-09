import { LLMModel } from "../client/api";
import { DalleSize, DalleQuality, DalleStyle } from "../types";
import { getClientConfig } from "../config/client";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_MODELS,
  DEFAULT_TTS_ENGINE,
  TTS_ENGINES,
  DEFAULT_TTS_MODEL,
  TTS_MODELS, TTS_VOICES,
  StoreKey,
  ModelProvider,
  DefaultModelName
} from "../constant";
import { createPersistStore } from "../utils/store";
import type { Voice } from "rt-client";
import { sys } from "../utils/sys";

export type TTSModelType = (typeof TTS_MODELS)[number];
export type TTSVoiceType = (typeof TTS_VOICES)[number];
export type TTSEngineType = (typeof TTS_ENGINES)[number];

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

const config = getClientConfig();

export const DEFAULT_APP_CONFIG = {
  lastUpdate: Date.now(), // timestamp, to merge state
  submitKey: SubmitKey.ShiftEnter,
  shouldNarrow: true,
  fontSize: 14,
  fontFamily: "",
  theme: Theme.Auto as Theme,
  tightBorder: !!config?.isApp,
  sendPreviewBubble: true,
  enableAutoGenerateTitle: false,
  enableArtifacts: true, // show artifacts config
  enableCodeFold: true, // code fold config
  disablePromptHint: false,
  dontShowMaskSplashScreen: true, // dont show splash screen when create chat
  models: DEFAULT_MODELS as any as LLMModel[],
  //模型名称@模型服务商,模型名称@模型服务商,模型名称@模型服务商
  customModels: "",
  modelConfig: {
    modelName: DefaultModelName,
    modelProvider: ModelProvider.AITaaS,
    temperature: 0.7 as any,
    top_p: 0.8 as any,
    max_tokens: 4000,
    presence_penalty: null as any,
    frequency_penalty: null as any,
    sendMemory: false,
    historyMessageCount: 10,
    compressMessageLengthThreshold: 1000,
    enableInjectSystemPrompts: false,
    template: config?.template ?? DEFAULT_INPUT_TEMPLATE,
    size: "1024x1024" as DalleSize,
    quality: "standard" as DalleQuality,
    style: "vivid" as DalleStyle,
  },

  chatConfig: {
    enable: true,
    autoplay: false,
    engine: DEFAULT_TTS_ENGINE,
    model: DEFAULT_TTS_MODEL,
  },

  tttConfig: {
    sourceLanguage: "zh",
    sourceLanguageName: "中文简体",
    targetLanguage: 'en',
    targetLanguageName: '英语',
  },

  voiceConfig: {
    voice: "aliyun-zhiyuan",
    speed: 0,
    volume: 100,
    intonation: 0,
    emotion: "",
  },

  videoConfig: {
    picture: "",
    helloText: "",
    helloVideo: "",
    ratio: "3:4",
    mainBox: [],
    focusBox: [],
    enableDownload: false,
  },

  realtimeConfig: {
    enable: false,
    provider: ModelProvider.OpenAI,
    model: "gpt-4o-realtime-preview-2024-10-01",
    apiKey: "",
    azure: {
      endpoint: "",
      deployment: "",
    },
    temperature: 0.9,
    voice: "alloy" as Voice,
  },

  visionConfig: {
    enableVideo: false,
    enableSpeak: true,
  },

  speechConfig: {
    threshold: 0.5
  },
};

export type ChatConfig = typeof DEFAULT_APP_CONFIG;

export type ModelConfig = ChatConfig["modelConfig"];
export type TTSConfig = ChatConfig["chatConfig"];
export type RealtimeConfig = ChatConfig["realtimeConfig"];

export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number,
) {
  if (isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}

export const TTSConfigValidator = {
  engine(x: string) {
    return x as TTSEngineType;
  },
  model(x: string) {
    return x as TTSModelType;
  },
  voice(x: string) {
    return x as TTSVoiceType;
  },
  speed(x: number) {
    return limitNumber(x, 0.25, 4.0, 1.0);
  },
};

export const ModalConfigValidator = {
  model(x: string) {
    return x;
  },
  max_tokens(x: number) {
    return limitNumber(x, 0, 512000, 1024);
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  frequency_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 2, 1);
  },
  top_p(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
};

export const useAppConfig = createPersistStore(
  { ...DEFAULT_APP_CONFIG },
  (set, get) => ({
    reset() {
      set(() => ({ ...DEFAULT_APP_CONFIG }));
    },

    setConfig(config: any) {
      if (config)
        set(() => ({ ...config, models: DEFAULT_MODELS as any as LLMModel[] }));
    },

    mergeModels(newModels: LLMModel[]) {
      if (!newModels || newModels.length === 0) {
        return;
      }

      const oldModels = get().models;
      const modelMap: Record<string, LLMModel> = {};

      for (const model of oldModels) {
        model.available = false;
        modelMap[`${model.name}@${model?.provider?.id}`] = model;
      }

      for (const model of newModels) {
        model.available = true;
        modelMap[`${model.name}@${model?.provider?.id}`] = model;
      }

      sys.log.info(">>>合并模型:", modelMap);

      set(() => ({
        models: Object.values(modelMap),
      }));
    }
  }),
  {
    name: StoreKey.Config,
    version: 4.1,

    merge(persistedState, currentState) {
      const state = persistedState as ChatConfig | undefined;
      if (!state) return { ...currentState };
      const models = currentState.models.slice();
      state.models.forEach((pModel) => {
        const idx = models.findIndex(
          (v) => v.name === pModel.name && v.provider === pModel.provider,
        );
        if (idx !== -1) models[idx] = pModel;
        else models.push(pModel);
      });
      return { ...currentState, ...state, models: models };
    },

    migrate(persistedState, version) {
      const state = persistedState as ChatConfig;

      if (version < 3.4) {
        state.modelConfig.sendMemory = true;
        state.modelConfig.historyMessageCount = 4;
        state.modelConfig.compressMessageLengthThreshold = 1000;
        state.modelConfig.frequency_penalty = 0;
        state.modelConfig.top_p = 1;
        state.modelConfig.template = DEFAULT_INPUT_TEMPLATE;
        state.dontShowMaskSplashScreen = false;
      }

      if (version < 3.5) {
        state.customModels = "claude,claude-100k";
      }

      if (version < 3.6) {
        state.modelConfig.enableInjectSystemPrompts = true;
      }

      if (version < 3.7) {
        state.enableAutoGenerateTitle = true;
      }

      if (version < 3.8) {
        state.lastUpdate = Date.now();
      }

      if (version < 3.9) {
        state.modelConfig.template =
          state.modelConfig.template !== DEFAULT_INPUT_TEMPLATE
            ? state.modelConfig.template
            : (config?.template ?? DEFAULT_INPUT_TEMPLATE);
      }

      if (version < 4.1) {
        state.modelConfig.modelName =
          DEFAULT_APP_CONFIG.modelConfig.modelName;
        state.modelConfig.modelProvider =
          DEFAULT_APP_CONFIG.modelConfig.modelProvider;
      }

      return state as any;
    },
  },
);
