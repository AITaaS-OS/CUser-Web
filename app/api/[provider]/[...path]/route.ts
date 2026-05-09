import { ServerAPIPath } from "@/app/constant";
import {BasePath} from "@/app/config/env";
import { NextRequest } from "next/server";
import { handle as openaiHandler } from "../../openai";
import { handle as azureHandler } from "../../azure";
import { handle as googleHandler } from "../../google";
import { handle as anthropicHandler } from "../../anthropic";
import { handle as baiduHandler } from "../../baidu";
import { handle as bytedanceHandler } from "../../bytedance";
import { handle as alibabaHandler } from "../../alibaba";
import { handle as moonshotHandler } from "../../moonshot";
import { handle as stabilityHandler } from "../../stability";
import { handle as iflytekHandler } from "../../iflytek";
import { handle as xaiHandler } from "../../xai";
import { handle as chatglmHandler } from "../../glm";
import { handle as aitaasHandler } from "../../aitaas";
import { sys } from "@/app/utils/sys";

async function handle(
  req: NextRequest,
  { params }: { params: { provider: string; path: string[] } },
) {
  //Add by AITaaS
  //如果设置了basePath，修订路径，Add by AITaaS
  req.nextUrl.pathname = req.nextUrl.basePath + req.nextUrl.pathname;
  sys.log.info("API>>>req.nextUrl.pathname:", req.nextUrl.pathname);

  const apiPath = BasePath + `/api/${params.provider}`;
  sys.log.info("API>>>服务端API路由：", apiPath);

  switch (apiPath) {
    case ServerAPIPath.Azure:
      return azureHandler(req, { params });
    case ServerAPIPath.Google:
      return googleHandler(req, { params });
    case ServerAPIPath.Anthropic:
      return anthropicHandler(req, { params });
    case ServerAPIPath.Baidu:
      return baiduHandler(req, { params });
    case ServerAPIPath.ByteDance:
      return bytedanceHandler(req, { params });
    case ServerAPIPath.Alibaba:
      return alibabaHandler(req, { params });
    // case ApiPath.Tencent: using "/api/tencent"
    case ServerAPIPath.Moonshot:
      return moonshotHandler(req, { params });
    case ServerAPIPath.Stability:
      return stabilityHandler(req, { params });
    case ServerAPIPath.Iflytek:
      return iflytekHandler(req, { params });
    case ServerAPIPath.XAI:
      return xaiHandler(req, { params });
    case ServerAPIPath.ChatGLM:
      return chatglmHandler(req, { params });
    case ServerAPIPath.OpenAI:
      return openaiHandler(req, { params });
    case ServerAPIPath.AITaaS:
    default:
      return aitaasHandler(req, { params });
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
export const preferredRegion = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];
