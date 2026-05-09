import { useState, useEffect, useMemo } from "react";

import styles from "./index.module.scss";
import LoadingIcon from "../../icons/processing.svg";

import {
  CheckBox,
  IconButton, Input, List,
  ListItem, PasswordInput,
  Select,
  showConfirm,
} from "../../components/ui-lib";
import { ModelConfigEditor } from "../../pages/config/model-config";
import {
  useChatStore, useUpdateStore,
  useModelProviderConfig,
  useAppConfig,
  usePromptStore
} from "../../store";

//用户状态
import { useUserState } from "../../store/user";
import { AuthControl } from "../../components/auth-control";

import Locale, {
  AllLangs,
  ALL_LANG_OPTIONS,
  changeLang,
  getLang,
  Lang,
} from "../../locales";
import { clientUpdate, useMobileScreen } from "../../utils";
import {
  Anthropic,
  Azure,
  Baidu,
  Tencent,
  ByteDance,
  Alibaba,
  Moonshot,
  XAI,
  Google,
  GoogleSafetySettingsThreshold, Path, ModelProvider, Stability,
  Iflytek,
  ChatGLM,
  ChatOutputMode,
  OpenAI
} from "../../constant";
import { InputRange } from "../../components/input-range";
import { useNavigate } from "react-router-dom";
import { getClientConfig } from "../../config/client";
import { useMaskStore } from "../../store/mask";
import { sys } from "../../utils/sys";
import { VoiceConfigEditor } from "./voice-config";
import { AIChatConfigEditor } from "./aichat-config";
import { PicConfigEditor } from "./pic-config";
import { TTTConfigEditor } from "./ttt-config";
import { MaskListModal } from "./mask-config";
import { PromptListModal } from "./prompt-config";
import { OpenAPI } from "@/app/openapi";
import touch from "@/app/utils/touch";
import { Markdown } from "@/app/components/markdown";
import { CloseOutlined, EditOutlined, SyncOutlined } from "@ant-design/icons";
import { SpeechConfigEditor } from "./speech-config";
import { VisionConfigEditor } from "./vision-config";

function SettingPage() {
  const user = useUserState();
  const navigate = useNavigate();
  const appConfig = useAppConfig();
  const modelProviderConfig = useModelProviderConfig();
  const updateConfig = appConfig.update;
  const chatStore = useChatStore();
  const updateStore = useUpdateStore();
  const promptStore = usePromptStore();
  const maskStore = useMaskStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const promptCount = promptStore.count;
  const maskCount = maskStore.count;
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showMaskModal, setShowMaskModal] = useState(false);
  const isMobileScreen = useMobileScreen();

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });
  }

  function uploadConfig() {
    showConfirm(
      Locale.Settings.SyncConfig.UploadConfig,
      Locale.Settings.SyncConfig.UploadConfigConfirm, false).then((res) => {
        if (res) {
          const config = {
            ...appConfig,
            models: [],//没必要保存模型列表
            modelProvider: modelProviderConfig
          };

          sys.log.info(">>>上传配置:", config);

          OpenAPI.userSaveConfig(config).then((result) => {
            if (result.success) {
              sys.msg.success(Locale.Settings.SyncConfig.UploadConfigSuccess);
            }
            else {
              sys.log.error(">>>上传配置失败:", result.message);
              sys.msg.error(result.message);
            }
          });
        }
      });
  };

  function downloadConfig() {
    OpenAPI.userGetConfig()
      .then((result) => {
        if (result.success && result.result) {

          sys.log.info(">>>下载配置:", result.result);

          appConfig.setConfig({ ...result.result });
          modelProviderConfig.setConfig(result.result.modelProvider);
          sys.msg.success(Locale.Settings.SyncConfig.DownloadConfigSuccess);
        }
        else {
          sys.log.error(">>>同步用户配置失败:", result.message);
          sys.msg.error(result.message);
        }
      });

  };

  const shouldHideBalanceQuery = useMemo(() => {
    const isOpenAiUrl = modelProviderConfig.openaiBaseUrl.includes(OpenAI.BaseUrl);

    return (
      modelProviderConfig.hideBalanceQuery ||
      isOpenAiUrl ||
      modelProviderConfig.provider === ModelProvider.Azure
    );
  }, [
    modelProviderConfig.hideBalanceQuery,
    modelProviderConfig.openaiBaseUrl,
    modelProviderConfig.provider,
  ]);

  const usage = {
    used: updateStore.used,
    subscription: updateStore.subscription,
  };
  const [loadingUsage, setLoadingUsage] = useState(false);
  function checkUsage(force = false) {
    if (shouldHideBalanceQuery) {
      return;
    }

    setLoadingUsage(true);
    updateStore.updateUsage(force).finally(() => {
      setLoadingUsage(false);
    });
  }

  const showUsage = modelProviderConfig.isAuthorized();

  useEffect(() => {
    // checks per minutes
    checkUpdate();
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    if (clientConfig?.isApp) {
      // Force to set custom endpoint to true if it's app
      modelProviderConfig.update((state) => {
        state.enableCustomConfig = true;
      });
    }
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientConfig = useMemo(() => getClientConfig(), []);

  const useCustomConfigComponent = (
    <ListItem
      title={Locale.Settings.ModelProvider.CustomEndpoint.Title}
      desc={Locale.Settings.ModelProvider.CustomEndpoint.SubTitle}
    >
      <CheckBox
        checked={modelProviderConfig.enableCustomConfig}
        onChange={(e) =>
          modelProviderConfig.update(
            (access) => (access.enableCustomConfig = e.target.checked),
          )
        }
      />
    </ListItem>
  );

  const openAIConfigComponent = modelProviderConfig.provider ===
    ModelProvider.OpenAI && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.OpenAI.Endpoint.Title}
          desc={Locale.Settings.ModelProvider.OpenAI.Endpoint.SubTitle}
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.OpenAI.Endpoint.Title}
            type="text"
            value={modelProviderConfig.openaiBaseUrl}
            placeholder={OpenAI.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.openaiBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.OpenAI.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.OpenAI.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.OpenAI.ApiKey.Title}
            value={modelProviderConfig.openaiApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.OpenAI.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.openaiApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const azureConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Azure && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Azure.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.Azure.Endpoint.SubTitle + Azure.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Azure.Endpoint.Title}
            type="text"
            value={modelProviderConfig.azureBaseUrl}
            placeholder={Azure.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.azureBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Azure.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Azure.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Azure.ApiKey.Title}
            value={modelProviderConfig.azureApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Azure.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.azureApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Azure.ApiVerion.Title}
          desc={Locale.Settings.ModelProvider.Azure.ApiVerion.SubTitle}
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Azure.ApiVerion.Title}
            type="text"
            value={modelProviderConfig.azureApiVersion}
            placeholder="2023-08-01-preview"
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.azureApiVersion = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
      </>
    );

  const googleConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Google && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Google.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.Google.Endpoint.SubTitle +
            Google.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Google.Endpoint.Title}
            type="text"
            value={modelProviderConfig.googleBaseUrl}
            placeholder={Google.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.googleBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Google.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Google.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Google.ApiKey.Title}
            value={modelProviderConfig.googleApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Google.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.googleApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
        <ListItem
          title={Locale.Settings.ModelProvider.Google.ApiVersion.Title}
          desc={Locale.Settings.ModelProvider.Google.ApiVersion.SubTitle}
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Google.ApiVersion.Title}
            type="text"
            value={modelProviderConfig.googleApiVersion}
            placeholder="2023-08-01-preview"
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.googleApiVersion = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          title={Locale.Settings.ModelProvider.Google.GoogleSafetySettings.Title}
          desc={Locale.Settings.ModelProvider.Google.GoogleSafetySettings.SubTitle}
        >
          <Select
            items={Object.entries(GoogleSafetySettingsThreshold).map(([k, v]) => (
              {
                title: k,
                value: v
              }
            ))}
            defaultSelectedValue={[modelProviderConfig.googleSafetySettings]}
            onSelectValue={
              (values) => {
                modelProviderConfig.update(
                  (access) =>
                    (access.googleSafetySettings = values[0] as GoogleSafetySettingsThreshold),
                );
              }
            }
          />
        </ListItem>
      </>
    );

  const anthropicConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Anthropic && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Anthropic.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.Anthropic.Endpoint.SubTitle +
            Anthropic.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Anthropic.Endpoint.Title}
            type="text"
            value={modelProviderConfig.anthropicBaseUrl}
            placeholder={Anthropic.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.anthropicBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Anthropic.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Anthropic.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Anthropic.ApiKey.Title}
            value={modelProviderConfig.anthropicApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Anthropic.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.anthropicApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
        <ListItem
          title={Locale.Settings.ModelProvider.Anthropic.ApiVerion.Title}
          desc={Locale.Settings.ModelProvider.Anthropic.ApiVerion.SubTitle}
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Anthropic.ApiVerion.Title}
            type="text"
            value={modelProviderConfig.anthropicApiVersion}
            placeholder={Anthropic.Vision}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.anthropicApiVersion = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
      </>
    );

  const baiduConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Baidu && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Baidu.Endpoint.Title}
          desc={Locale.Settings.ModelProvider.Baidu.Endpoint.SubTitle}
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Baidu.Endpoint.Title}
            type="text"
            value={modelProviderConfig.baiduBaseUrl}
            placeholder={Baidu.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.baiduBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Baidu.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Baidu.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Baidu.ApiKey.Title}
            value={modelProviderConfig.baiduApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Baidu.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.baiduApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Baidu.SecretKey.Title}
          desc={Locale.Settings.ModelProvider.Baidu.SecretKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Baidu.SecretKey.Title}
            value={modelProviderConfig.baiduSecretKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Baidu.SecretKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.baiduSecretKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const tencentConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Tencent && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Tencent.Endpoint.Title}
          desc={Locale.Settings.ModelProvider.Tencent.Endpoint.SubTitle}
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Tencent.Endpoint.Title}
            type="text"
            value={modelProviderConfig.tencentBaseUrl}
            placeholder={Tencent.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.tencentBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Tencent.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Tencent.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Tencent.ApiKey.Title}
            value={modelProviderConfig.tencentSecretId}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Tencent.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.tencentSecretId = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Tencent.SecretKey.Title}
          desc={Locale.Settings.ModelProvider.Tencent.SecretKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Tencent.SecretKey.Title}
            value={modelProviderConfig.tencentSecretKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Tencent.SecretKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.tencentSecretKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const byteDanceConfigComponent = modelProviderConfig.provider ===
    ModelProvider.ByteDance && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.ByteDance.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.ByteDance.Endpoint.SubTitle +
            ByteDance.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.ByteDance.Endpoint.Title}
            type="text"
            value={modelProviderConfig.bytedanceBaseUrl}
            placeholder={ByteDance.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.bytedanceBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.ByteDance.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.ByteDance.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.ByteDance.ApiKey.Title}
            value={modelProviderConfig.bytedanceApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.ByteDance.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.bytedanceApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const alibabaConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Alibaba && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Alibaba.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.Alibaba.Endpoint.SubTitle +
            Alibaba.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Alibaba.Endpoint.Title}
            type="text"
            value={modelProviderConfig.alibabaBaseUrl}
            placeholder={Alibaba.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.alibabaBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Alibaba.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Alibaba.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Alibaba.ApiKey.Title}
            value={modelProviderConfig.alibabaApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Alibaba.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.alibabaApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const moonshotConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Moonshot && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Moonshot.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.Moonshot.Endpoint.SubTitle +
            Moonshot.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Moonshot.Endpoint.Title}
            type="text"
            value={modelProviderConfig.moonshotBaseUrl}
            placeholder={Moonshot.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.moonshotBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Moonshot.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Moonshot.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Moonshot.ApiKey.Title}
            value={modelProviderConfig.moonshotApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Moonshot.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.moonshotApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const XAIConfigComponent = modelProviderConfig.provider === ModelProvider.XAI && (
    <>
      <ListItem
        vertical={isMobileScreen}
        title={Locale.Settings.ModelProvider.XAI.Endpoint.Title}
        desc={
          Locale.Settings.ModelProvider.XAI.Endpoint.SubTitle + XAI.BaseUrl
        }
      >
        <Input
          aria-label={Locale.Settings.ModelProvider.XAI.Endpoint.Title}
          type="text"
          value={modelProviderConfig.xaiBaseUrl}
          placeholder={XAI.BaseUrl}
          onChange={(e) =>
            modelProviderConfig.update(
              (access) => (access.xaiBaseUrl = e.currentTarget.value),
            )
          }
        ></Input>
      </ListItem>
      <ListItem
        vertical={isMobileScreen}
        title={Locale.Settings.ModelProvider.XAI.ApiKey.Title}
        desc={Locale.Settings.ModelProvider.XAI.ApiKey.SubTitle}
      >
        <PasswordInput
          aria-label={Locale.Settings.ModelProvider.XAI.ApiKey.Title}
          value={modelProviderConfig.xaiApiKey}
          type="text"
          placeholder={Locale.Settings.ModelProvider.XAI.ApiKey.Placeholder}
          onChange={(e) => {
            modelProviderConfig.update(
              (access) => (access.xaiApiKey = e.currentTarget.value),
            );
          }}
        />
      </ListItem>
    </>
  );

  const chatglmConfigComponent = modelProviderConfig.provider ===
    ModelProvider.ChatGLM && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.ChatGLM.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.ChatGLM.Endpoint.SubTitle +
            ChatGLM.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.ChatGLM.Endpoint.Title}
            type="text"
            value={modelProviderConfig.chatglmBaseUrl}
            placeholder={ChatGLM.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.chatglmBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.ChatGLM.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.ChatGLM.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.ChatGLM.ApiKey.Title}
            value={modelProviderConfig.chatglmApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.ChatGLM.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.chatglmApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const stabilityConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Stability && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Stability.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.Stability.Endpoint.SubTitle +
            Stability.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Stability.Endpoint.Title}
            type="text"
            value={modelProviderConfig.stabilityBaseUrl}
            placeholder={Stability.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.stabilityBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Stability.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Stability.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Stability.ApiKey.Title}
            value={modelProviderConfig.stabilityApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Stability.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.stabilityApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const lflytekConfigComponent = modelProviderConfig.provider ===
    ModelProvider.Iflytek && (
      <>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Iflytek.Endpoint.Title}
          desc={
            Locale.Settings.ModelProvider.Iflytek.Endpoint.SubTitle +
            Iflytek.BaseUrl
          }
        >
          <Input
            aria-label={Locale.Settings.ModelProvider.Iflytek.Endpoint.Title}
            type="text"
            value={modelProviderConfig.iflytekBaseUrl}
            placeholder={Iflytek.BaseUrl}
            onChange={(e) =>
              modelProviderConfig.update(
                (access) => (access.iflytekBaseUrl = e.currentTarget.value),
              )
            }
          ></Input>
        </ListItem>
        <ListItem
          vertical={isMobileScreen}
          title={Locale.Settings.ModelProvider.Iflytek.ApiKey.Title}
          desc={Locale.Settings.ModelProvider.Iflytek.ApiKey.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Iflytek.ApiKey.Title}
            value={modelProviderConfig.iflytekApiKey}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Iflytek.ApiKey.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.iflytekApiKey = e.currentTarget.value),
              );
            }}
          />
        </ListItem>

        <ListItem
          title={Locale.Settings.ModelProvider.Iflytek.ApiSecret.Title}
          desc={Locale.Settings.ModelProvider.Iflytek.ApiSecret.SubTitle}
        >
          <PasswordInput
            aria-label={Locale.Settings.ModelProvider.Iflytek.ApiSecret.Title}
            value={modelProviderConfig.iflytekApiSecret}
            type="text"
            placeholder={Locale.Settings.ModelProvider.Iflytek.ApiSecret.Placeholder}
            onChange={(e) => {
              modelProviderConfig.update(
                (access) => (access.iflytekApiSecret = e.currentTarget.value),
              );
            }}
          />
        </ListItem>
      </>
    );

  const aitaasConfigComponent = modelProviderConfig.provider ===
    ModelProvider.AITaaS && (
      <ListItem title={Locale.Settings.ModelProvider.AITaaS.OutputMode}>
        <Select
          defaultSelectedValue={[modelProviderConfig.AITaaS_OutputMode]}
          items={
            Object.entries(ChatOutputMode).map(([k, v]) => (
              {
                title: Locale.Cons.ChatOutputMode(k).title,
                desc: Locale.Cons.ChatOutputMode(k).desc,
                value: k
              }
            ))
          }
          onSelectValue={(values) => {
            modelProviderConfig.update(
              (access) =>
                (access.AITaaS_OutputMode = values[0] as ChatOutputMode),
            );
          }}
        />
      </ListItem>
    );

  return (
    <>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.Settings.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.Settings.SubTitle}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              aria={Locale.Common.Close}
              icon={<CloseOutlined />}
              onClick={() => navigate(Path.Home)}
              bordered
            />
          </div>
        </div>
      </div>

      <div className={styles["settings"]}>
        {/* 访问令牌设置 */}
        <List>
          <AuthControl />
        </List>

        {clientConfig?.isApp && user.hasValidToken() && (
          <List>
            <ListItem
              title={Locale.Settings.Update.Version(
                updateStore.version ?? "unknown",
              )}
              desc={
                checkingUpdate
                  ? Locale.Settings.Update.IsChecking
                  : updateStore.hasNewVersion
                    ? Locale.Settings.Update.FoundUpdate(
                      updateStore.remoteVersion ?? "ERROR",
                    )
                    : Locale.Settings.Update.IsLatest
              }
            >
              {checkingUpdate ? (
                <LoadingIcon />
              ) : updateStore.hasNewVersion ? (
                <IconButton
                  icon={<SyncOutlined />}
                  text={Locale.Settings.Update.GoToUpdate}
                  onClick={() => clientUpdate()}
                />
              ) : (
                <IconButton
                  icon={<SyncOutlined />}
                  text={Locale.Settings.Update.CheckUpdate}
                  onClick={() => checkUpdate(true)}
                />
              )}
            </ListItem>
          </List>
        )}

        <List>
          {/* <ListItem title={Locale.Settings.SendKey}>
            <Select
              aria-label={Locale.Settings.SendKey}
              value={appConfig.submitKey}
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.submitKey = e.target.value as any as SubmitKey),
                );
              }}
            >
              {Object.values(SubmitKey).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </Select>
          </ListItem> */}

          {/* <ListItem title={Locale.Settings.Theme.Title}>
            <Select
              aria-label={Locale.Settings.Theme.Title}
              value={config.theme}
              onChange={(e) => {
                updateConfig(
                  (config) => (config.theme = e.target.value as any as Theme),
                );
              }}
            >
              {Object.values(Theme).map((v,index) => (
                <option value={v} key={v}>
                  {Locale.Settings.Theme.List[index]}
                </option>
              ))}
            </Select>
          </ListItem> */}

          <ListItem title={Locale.Settings.Lang.Name}>
            <Select
              defaultSelectedValue={[getLang()]}
              items={AllLangs.map((v: Lang) => {
                return (
                  {
                    title: ALL_LANG_OPTIONS[v],
                    value: v
                  }
                );
              })}
              onSelectValue={(values: any) => {
                changeLang(values[0]);
              }}
            />
          </ListItem>

          <ListItem title={Locale.Settings.FontSize.Title}
            desc={Locale.Settings.FontSize.SubTitle}
            vertical={isMobileScreen}
          >
            <InputRange
              title={`${appConfig.fontSize ?? 14}px`}
              value={appConfig.fontSize}
              min={12}
              max={40}
              step={1}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.fontSize = e || 12),
                )
              }
            ></InputRange>
          </ListItem>

          <ListItem title={Locale.Settings.FontFamily.Title}
            desc={Locale.Settings.FontFamily.SubTitle}
          >
            <Input
              aria-label={Locale.Settings.FontFamily.Title}
              type="text"
              value={appConfig.fontFamily}
              placeholder={Locale.Settings.FontFamily.Placeholder}
              onChange={(e) =>
                updateConfig(
                  (config) => (config.fontFamily = e.currentTarget.value),
                )
              }
            ></Input>
          </ListItem>

          {/* <ListItem title={Locale.Settings.AutoGenerateTitle.Title}
            subTitle={Locale.Settings.AutoGenerateTitle.SubTitle}
          >
            <input
              aria-label={Locale.Settings.AutoGenerateTitle.Title}
              type="checkbox"
              checked={config.enableAutoGenerateTitle}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.enableAutoGenerateTitle = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem> */}

          {/* <ListItem  title={Locale.Settings.SendPreviewBubble.Title}
            subTitle={Locale.Settings.SendPreviewBubble.SubTitle}
          >
            <input
              aria-label={Locale.Settings.SendPreviewBubble.Title}
              type="checkbox"
              checked={config.sendPreviewBubble}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.sendPreviewBubble = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem> */}

          {/* <ListItem  title={Locale.Mask.Config.Artifacts.Title}
            subTitle={Locale.Mask.Config.Artifacts.SubTitle}
          >
            <input
              aria-label={Locale.Mask.Config.Artifacts.Title}
              type="checkbox"
              checked={config.enableArtifacts}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.enableArtifacts = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem> */}

          {/* <ListItem  title={Locale.Mask.Config.CodeFold.Title}
            subTitle={Locale.Mask.Config.CodeFold.SubTitle}
          >
            <input
              aria-label={Locale.Mask.Config.CodeFold.Title}
              type="checkbox"
              checked={config.enableCodeFold}
              data-testid="enable-code-fold-checkbox"
              onChange={(e) =>
                updateConfig(
                  (config) => (config.enableCodeFold = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem> */}
        </List>

        {/* 角色配置 */}
        <List enableFold={true} defaultFolded={true} title={Locale.Settings.Mask.Title}>
          <ListItem
            title={Locale.Settings.Mask.Splash.Title}
            desc={Locale.Settings.Mask.Splash.SubTitle}
          >
            <CheckBox
              checked={!appConfig.dontShowMaskSplashScreen}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                  (config.dontShowMaskSplashScreen =
                    !e.target.checked),
                )
              }
            />
          </ListItem>

          <ListItem
            title={Locale.Settings.Mask.List}
            desc={Locale.Settings.Mask.ListCount(maskCount)}
          >
            <IconButton
              aria={Locale.Settings.Mask.Edit + Locale.Common.Edit}
              icon={<EditOutlined />}
              text={Locale.Settings.Mask.Edit}
              onClick={() => setShowMaskModal(true)}
            />
          </ListItem>

          {/* <ListItem
            title={Locale.Settings.Mask.Builtin.Title}
            subTitle={Locale.Settings.Mask.Builtin.SubTitle}
          >
            <input
              aria-label={Locale.Settings.Mask.Builtin.Title}
              type="checkbox"
              checked={config.hideBuiltinMasks}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.hideBuiltinMasks = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem> */}
        </List>
        {showMaskModal && (
          <MaskListModal onClose={() => setShowMaskModal(false)} />
        )}

        {/* 提示词配置 */}
        <List enableFold={true} defaultFolded={true} title={Locale.Settings.Prompt.Config}>
          <ListItem
            title={Locale.Settings.Prompt.Disable.Title}
            desc={Locale.Settings.Prompt.Disable.SubTitle}
          >
            <CheckBox
              checked={appConfig.disablePromptHint}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.disablePromptHint = e.target.checked),
                )
              }
            />
          </ListItem>

          <ListItem
            title={Locale.Settings.Prompt.List}
            desc={Locale.Settings.Prompt.ListCount(promptCount)}
          >
            <IconButton
              aria={Locale.Settings.Prompt.Edit}
              icon={<EditOutlined />}
              text={Locale.Settings.Prompt.Edit}
              onClick={() => setShowPromptModal(true)}
            />
          </ListItem>
        </List>
        {showPromptModal && (
          <PromptListModal onClose={() => setShowPromptModal(false)} />
        )}

        {/* 模型服务商配置 */}
        <List enableFold={true} defaultFolded={true} title={Locale.Settings.ModelProvider.Title}>
          {
            <>
              {useCustomConfigComponent}

              {modelProviderConfig.enableCustomConfig && (
                <>
                  <ListItem
                    title={Locale.Settings.ModelProvider.Provider.Title}
                    desc={<Markdown fontSize={12} content={Locale.Settings.ModelProvider.Provider.SubTitle}></Markdown>}
                  >
                    <Select
                      defaultSelectedValue={[modelProviderConfig.provider]}
                      items={
                        Object.entries(ModelProvider).map(([k, v]) => (
                          {
                            title: k,
                            value: k
                          }
                        ))
                      }
                      onSelectValue={(values: any) => {
                        modelProviderConfig.update(
                          (access) =>
                            (access.provider = values[0] as ModelProvider),
                        );
                      }}
                    />
                  </ListItem>

                  {aitaasConfigComponent}
                  {openAIConfigComponent}
                  {azureConfigComponent}
                  {googleConfigComponent}
                  {anthropicConfigComponent}
                  {baiduConfigComponent}
                  {byteDanceConfigComponent}
                  {alibabaConfigComponent}
                  {tencentConfigComponent}
                  {moonshotConfigComponent}
                  {stabilityConfigComponent}
                  {lflytekConfigComponent}
                  {XAIConfigComponent}
                  {chatglmConfigComponent}
                </>
              )}

              <ListItem
                title={Locale.Settings.ModelProvider.CustomModel.Title}
                desc={Locale.Settings.ModelProvider.CustomModel.SubTitle}
                vertical={true}
              >
                <Input
                  showCount={false}
                  aria-label={Locale.Settings.ModelProvider.CustomModel.Title}
                  style={{ width: "100%", maxWidth: "unset", textAlign: "left" }}
                  type="text"
                  value={appConfig.customModels}
                  placeholder="模型名称@模型服务商,模型名称@模型服务商,模型名称@模型服务商"
                  onChange={(e) =>
                    appConfig.update(
                      (config) => (config.customModels = e.currentTarget.value),
                    )
                  }
                ></Input>
              </ListItem>
            </>
          }

          {!shouldHideBalanceQuery && !clientConfig?.isApp ? (
            <ListItem
              title={Locale.Settings.Usage.Title}
              desc={
                showUsage
                  ? loadingUsage
                    ? Locale.Settings.Usage.IsChecking
                    : Locale.Settings.Usage.SubTitle(
                      usage?.used ?? "[?]",
                      usage?.subscription ?? "[?]",
                    )
                  : Locale.Settings.Usage.NoAccess
              }
            >
              {!showUsage || loadingUsage ? (
                <div />
              ) : (
                <IconButton
                  icon={<SyncOutlined />}
                  text={Locale.Settings.Usage.Check}
                  onClick={() => checkUsage(true)}
                />
              )}
            </ListItem>
          ) : null}

        </List>

        {/* 模型参数配置 */}
        <List enableFold={true} defaultFolded={true} title={Locale.Settings.Model.Title}>
          <ModelConfigEditor
            modelConfig={appConfig.modelConfig}
            updateConfig={(updater) => {
              const modelConfig = { ...appConfig.modelConfig };
              updater(modelConfig);
              appConfig.update((config) => (config.modelConfig = modelConfig));
            }} />
        </List>

        <List enableFold={true} defaultFolded={true} title={Locale.Settings.Audio.Title}>
          <VoiceConfigEditor
            voiceConfig={appConfig.voiceConfig}
            updateConfig={(updater) => {
              const audioConfig = { ...appConfig.voiceConfig };
              updater(audioConfig);
              appConfig.update((config) => (config.voiceConfig = audioConfig));
            }}
          />
        </List>

        <List enableFold={true} defaultFolded={true} title={Locale.Settings.AIChat.Title}>
          <AIChatConfigEditor
            ttsConfig={appConfig.chatConfig}
            updateConfig={(updater) => {
              const ttsConfig = { ...appConfig.chatConfig };
              updater(ttsConfig);
              appConfig.update((config) => (config.chatConfig = ttsConfig));
            }}
          />
        </List>

        <List enableFold={true} defaultFolded={true} title={Locale.Settings.Video.Title}>
          <PicConfigEditor
            videoConfig={appConfig.videoConfig}
            updateConfig={(updater) => {
              const videoConfig = { ...appConfig.videoConfig };
              updater(videoConfig);
              appConfig.update((config) => (config.videoConfig = videoConfig));
            }}
          />
        </List>

        <List enableFold={true} defaultFolded={true} title={Locale.Settings.TTT.Title}>
          <TTTConfigEditor
            config={{ ...appConfig.tttConfig, sourceText: "" }}
            updateConfig={(updater) => {
              const tempConfig = { ...appConfig.tttConfig, sourceText: "" };
              updater(tempConfig);
              appConfig.update((config) => (config.tttConfig = tempConfig));
            }}
          />
        </List>

        <List enableFold={true} defaultFolded={true} title={Locale.Settings.Speech.Title}>
          <SpeechConfigEditor
            speechConfig={{ ...appConfig.speechConfig }}
            updateConfig={(updater) => {
              const tempConfig = { ...appConfig.speechConfig };
              updater(tempConfig);
              appConfig.update((config) => (config.speechConfig = tempConfig));
            }}
          />
        </List>

        <List enableFold={true} defaultFolded={true} title={Locale.Settings.Vision.Title}>
          <VisionConfigEditor
            config={{ ...appConfig.visionConfig }}
            updateConfig={(updater) => {
              const tempConfig = { ...appConfig.visionConfig };
              updater(tempConfig);
              appConfig.update((config) => (config.visionConfig = tempConfig));
            }}
          />
        </List>

        <List>
          <ListItem
            title={Locale.Settings.SyncConfig.UploadConfig}
            desc={Locale.Settings.SyncConfig.UploadConfigDesc}>
            <IconButton
              text={Locale.Settings.SyncConfig.UploadConfig}
              type="danger"
              className={styles["auth-confirm"]}
              onClick={() => {
                uploadConfig();
              }}
            />
          </ListItem>
          <ListItem
            title={Locale.Settings.SyncConfig.DownloadConfig}
            desc={Locale.Settings.SyncConfig.DownloadConfigDesc}>
            <IconButton
              type="danger"
              text={Locale.Settings.SyncConfig.DownloadConfig}
              className={styles["auth-confirm"]}
              onClick={() => {
                downloadConfig();
              }}
            />

          </ListItem>
          <ListItem
            title={Locale.Settings.Danger.Reset.Title}
            desc={Locale.Settings.Danger.Reset.SubTitle}
          >
            <IconButton
              aria={Locale.Settings.Danger.Reset.Title}
              text={Locale.Settings.Danger.Reset.Action}
              onClick={async () => {
                if (await showConfirm(
                  Locale.Settings.Danger.Reset.Title,
                  Locale.Settings.Danger.Reset.Confirm,
                  false
                )) {
                  appConfig.reset();
                }
              }}
              type="danger"
            />
          </ListItem>
          <ListItem
            title={Locale.Settings.Danger.Clear.Title}
            desc={Locale.Settings.Danger.Clear.SubTitle}
          >
            <IconButton
              aria={Locale.Settings.Danger.Clear.Title}
              text={Locale.Settings.Danger.Clear.Action}
              onClick={async () => {
                if (await showConfirm(
                  Locale.Settings.Danger.Clear.Title,
                  Locale.Settings.Danger.Clear.Confirm,
                  false
                )) {
                  chatStore.clearAllData();
                }
              }}
              type="danger"
            />
          </ListItem>
        </List>
      </div>
    </>
  );
}

export default function Settings() {
  const navigate = useNavigate();

  useEffect(() => {
    const rightKey = touch.addSlideRightFunc(() => {
      navigate(Path.CBC);
    });

    return () => {
      touch.removeSlideRightFunc(rightKey);
    };
  }, []);

  return <SettingPage></SettingPage>
}
