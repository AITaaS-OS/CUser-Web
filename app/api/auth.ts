import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import { ModelProvider,AITaaSHeader } from "../constant";
import { sys } from "@/app/utils/sys";

//用户状态
// import { useUserState } from "../user/user";
// import http from "../http/request"

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

export function auth(req: NextRequest, modelProvider: ModelProvider) {

  const aitaasUserToken = req.headers.get(AITaaSHeader.APIToken) ?? "";

  sys.log.info("API>>>认证：Token:%s", aitaasUserToken);

  if ( aitaasUserToken === "") {
    sys.log.info("API>>>认证：令牌验证不通过");

    return {
      error: true,
      type: 0,
      msg: "无效的令牌",
    };
  }

  // TODO
  // 此处是否再次到后台校验令牌？？？

  // 校验API Key
  const authToken = req.headers.get(AITaaSHeader.Token) ?? "";
  const apiKey = authToken.trim().replaceAll("Bearer ", "").trim();

  // if user does not provide an api key, inject system api key
  if (!apiKey) {
    const serverConfig = getServerSideConfig();

    let systemApiKey: string | undefined;

    switch (modelProvider) {
      case ModelProvider.Stability:
        systemApiKey = serverConfig.stabilityApiKey;
        break;
      case ModelProvider.Google:
        systemApiKey = serverConfig.googleApiKey;
        break;
      case ModelProvider.Anthropic:
        systemApiKey = serverConfig.anthropicApiKey;
        break;
      case ModelProvider.ByteDance:
        systemApiKey = serverConfig.bytedanceApiKey;
        break;
      case ModelProvider.Tencent:
        systemApiKey = serverConfig.baiduApiKey;
        break;
      case ModelProvider.Moonshot:
        systemApiKey = serverConfig.moonshotApiKey;
        break;
      case ModelProvider.Iflytek:
        systemApiKey =
          serverConfig.iflytekApiKey + ":" + serverConfig.iflytekApiSecret;
        break;
      case ModelProvider.XAI:
        systemApiKey = serverConfig.xaiApiKey;
        break;
      case ModelProvider.ChatGLM:
        systemApiKey = serverConfig.chatglmApiKey;
        break;
      case ModelProvider.OpenAI:
        systemApiKey = serverConfig.openaiApiKey;
        break;
      case ModelProvider.Alibaba:
        systemApiKey = serverConfig.alibabaApiKey;
        break;
      default:
        if (req.nextUrl.pathname.includes("azure/deployments")) {
          systemApiKey = serverConfig.azureApiKey;
        }
    }

    if (systemApiKey) {
      sys.log.info("API>>>APIKey：使用系统配置的API-Key:", systemApiKey);
      req.headers.set("Authorization", `Bearer ${systemApiKey}`);
    } else {
      sys.log.info("API>>>APIKey：缺少有效的API-Key");
      return {
        error: true,
        type: 1,
        msg: "缺少有效的API-Key",
      };
    }
  } else {
    sys.log.info("API>>>APIKey：使用用户配置的API-Key:", apiKey);
  }

  return {
    error: false,
  };
}
