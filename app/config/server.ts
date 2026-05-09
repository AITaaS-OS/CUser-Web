import { DEFAULT_GA_ID } from "../constant";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AITaaS_BASE_URL: string;
      AITaaS_SOCKET_URL?: string;
      PROXY_URL?: string; // docker only

      //CODE?: string;

      OPENAI_BASE_URL?: string;
      OPENAI_API_KEY?: string;
      OPENAI_ORG_ID?: string; // openai only

      BUILD_MODE?: "standalone" | "export";
      BUILD_APP?: string; // is building desktop app

      DISABLE_GPT4?: string; // allow user to use gpt-4 or not
      ENABLE_BALANCE_QUERY?: string; // allow user to query balance or not
      DISABLE_FAST_LINK?: string; // disallow parse settings from url or not
      CUSTOM_MODELS?: string; // to control custom models
      DEFAULT_MODEL?: string; // to control default model in every new chat window

      // stability only
      STABILITY_BASE_URL?: string;
      STABILITY_API_KEY?: string;

      // azure only
      AZURE_BASE_URL?: string; // https://{azure-url}/openai/deployments/{deploy-name}
      AZURE_API_KEY?: string;
      AZURE_API_VERSION?: string;

      // google only
      GOOGLE_API_KEY?: string;
      GOOGLE_BASE_URL?: string;

      // google tag manager
      GTM_ID?: string;

      // anthropic only
      ANTHROPIC_BASE_URL?: string;
      ANTHROPIC_API_KEY?: string;
      ANTHROPIC_API_VERSION?: string;

      // baidu only
      BAIDU_BASE_URL?: string;
      BAIDU_API_KEY?: string;
      BAIDU_SECRET_KEY?: string;

      // bytedance only
      BYTEDANCE_BASE_URL?: string;
      BYTEDANCE_API_KEY?: string;

      // alibaba only
      ALIBABA_BASE_URL?: string;
      ALIBABA_API_KEY?: string;

      // tencent only
      TENCENT_BASE_URL?: string;
      TENCENT_SECRET_KEY?: string;
      TENCENT_SECRET_ID?: string;

      // moonshot only
      MOONSHOT_BASE_URL?: string;
      MOONSHOT_API_KEY?: string;

      // iflytek only
      IFLYTEK_BASE_URL?: string;
      IFLYTEK_API_KEY?: string;
      IFLYTEK_API_SECRET?: string;

      // xai only
      XAI_BASE_URL?: string;
      XAI_API_KEY?: string;

      // chatglm only
      CHATGLM_BASE_URL?: string;
      CHATGLM_API_KEY?: string;

      // custom template for preprocessing user input
      DEFAULT_INPUT_TEMPLATE?: string;
    }
  }
}

function getApiKey(keys?: string) {
  const apiKeyEnvVar = keys ?? "";
  const apiKeys = apiKeyEnvVar.split(",").map((v) => v.trim());
  const randomIndex = Math.floor(Math.random() * apiKeys.length);
  const apiKey = apiKeys[randomIndex];
  return apiKey;
}

export const getServerSideConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  let customModels = process.env.CUSTOM_MODELS ?? "";
  let defaultModel = process.env.DEFAULT_MODEL ?? "";

  const isOpenAI = !!process.env.OPENAI_API_KEY;
  const isStability = !!process.env.STABILITY_API_KEY;
  const isAzure = !!process.env.AZURE_BASE_URL;
  const isGoogle = !!process.env.GOOGLE_API_KEY;
  const isAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const isTencent = !!process.env.TENCENT_API_KEY;
  const isBaidu = !!process.env.BAIDU_API_KEY;
  const isBytedance = !!process.env.BYTEDANCE_API_KEY;
  const isAlibaba = !!process.env.ALIBABA_API_KEY;
  const isMoonshot = !!process.env.MOONSHOT_API_KEY;
  const isIflytek = !!process.env.IFLYTEK_API_KEY;
  const isXAI = !!process.env.XAI_API_KEY;
  const isChatGLM = !!process.env.CHATGLM_API_KEY;
  // const apiKeyEnvVar = process.env.OPENAI_API_KEY ?? "";
  // const apiKeys = apiKeyEnvVar.split(",").map((v) => v.trim());
  // const randomIndex = Math.floor(Math.random() * apiKeys.length);
  // const apiKey = apiKeys[randomIndex];
  // sys.log.info(
  //   `[Server Config] using ${randomIndex + 1} of ${apiKeys.length} api key`,
  // );

  const allowedWebDavEndpoints = (
    process.env.WHITE_WEBDAV_ENDPOINTS ?? ""
  ).split(",");

  return {
    AITaaS_BaseUrl: process.env.AITaaS_BASE_URL,
    AITaaS_SocketUrl:
      process.env.AITaaS_SOCKET_URL ??
      process.env.AITaaS_BASE_URL?.replace("http", "ws"),

    isOpenAI,
    openaiBaseUrl: process.env.OPENAI_BASE_URL,
    openaiApiKey: getApiKey(process.env.OPENAI_API_KEY),
    openaiOrgId: process.env.OPENAI_ORG_ID,

    isStability,
    stabilityBaseUrl: process.env.STABILITY_BASE_URL,
    stabilityApiKey: getApiKey(process.env.STABILITY_API_KEY),

    isAzure,
    azureBaseUrl: process.env.AZURE_BASE_URL,
    azureApiKey: getApiKey(process.env.AZURE_API_KEY),
    azureApiVersion: process.env.AZURE_API_VERSION,

    isGoogle,
    googleApiKey: getApiKey(process.env.GOOGLE_API_KEY),
    googleBaseUrl: process.env.GOOGLE_BASE_URL,

    isAnthropic,
    anthropicApiKey: getApiKey(process.env.ANTHROPIC_API_KEY),
    anthropicApiVersion: process.env.ANTHROPIC_API_VERSION,
    anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL,

    isBaidu,
    baiduBaseUrl: process.env.BAIDU_BASE_URL,
    baiduApiKey: getApiKey(process.env.BAIDU_API_KEY),
    baiduSecretKey: process.env.BAIDU_SECRET_KEY,

    isBytedance,
    bytedanceApiKey: getApiKey(process.env.BYTEDANCE_API_KEY),
    bytedanceUrl: process.env.BYTEDANCE_BASE_URL,

    isAlibaba,
    alibabaBaseUrl: process.env.ALIBABA_BASE_URL,
    alibabaApiKey: getApiKey(process.env.ALIBABA_API_KEY),

    isTencent,
    tencentBaseUrl: process.env.TENCENT_BASE_URL,
    tencentSecretKey: getApiKey(process.env.TENCENT_SECRET_KEY),
    tencentSecretId: process.env.TENCENT_SECRET_ID,

    isMoonshot,
    moonshotBaseUrl: process.env.MOONSHOT_BASE_URL,
    moonshotApiKey: getApiKey(process.env.MOONSHOT_API_KEY),

    isIflytek,
    iflytekBaseUrl: process.env.IFLYTEK_BASE_URL,
    iflytekApiKey: process.env.IFLYTEK_API_KEY,
    iflytekApiSecret: process.env.IFLYTEK_API_SECRET,

    isXAI,
    xaiBaseUrl: process.env.XAI_BASE_URL,
    xaiApiKey: getApiKey(process.env.XAI_API_KEY),

    isChatGLM,
    chatglmBaseUrl: process.env.CHATGLM_BASE_URL,
    chatglmApiKey: getApiKey(process.env.CHATGLM_API_KEY),

    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareKVNamespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID,
    cloudflareKVApiKey: getApiKey(process.env.CLOUDFLARE_KV_API_KEY),
    cloudflareKVTTL: process.env.CLOUDFLARE_KV_TTL,

    gtmId: process.env.GTM_ID,
    gaId: process.env.GA_ID || DEFAULT_GA_ID,

    proxyUrl: process.env.PROXY_URL,

    hideBalanceQuery: !process.env.ENABLE_BALANCE_QUERY,
    disableFastLink: !!process.env.DISABLE_FAST_LINK,
    customModels,
    defaultModel,
    allowedWebDavEndpoints,
  };
};
