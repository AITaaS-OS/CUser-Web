"use client";
import {
  ServerAPIPath,
  REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import { AITaaS_BaseUrl } from "@/app/config/env";
import { useAppConfig, useChatStore } from "@/app/store";

import {
  ChatOptions,
  getHeaders,
  LLMApi,
  LLMModel,
  SpeechOptions,
} from "../api";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { getClientConfig } from "@/app/config/client";
import { getMessageContent } from "@/app/utils";
import { fetch } from "@/app/utils/stream";
import { buildErrorResponse } from "@/app/utils/chat";
import { useUserState } from "@/app/store/user";
import CryptoJS from "crypto-js";
import { sys } from "@/app/utils/sys";
import { OpenAPIPath } from "@/app/openapi";

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}

export class AITaaSApi implements LLMApi {
  path(path: string): string {
    const isApp = !!getClientConfig()?.isApp;
    let baseUrl = isApp ? AITaaS_BaseUrl : ServerAPIPath.AITaaS;

    sys.log.info("isApp>>>",isApp);

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }

    return [baseUrl, path].join("");
  }

  extractMessage(res: any) {
    return res?.output?.choices?.at(0)?.message?.content ?? "";
  }

  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("不支持");
  }

  async chat(options: ChatOptions) {
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: getMessageContent(v.content),
    }));

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.modelName,
      },
    };

    sys.log.info("chat>>>模型名称： ", modelConfig.model);

    let shouldStream = !!options.config.stream;

    let data = {
      uid: useUserState.getState().userId,
      msg: messages
    };

    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path(
        shouldStream ? OpenAPIPath.AIChatStream : OpenAPIPath.AIChat,
      );

      sys.log.info("AITaaS>>>客户端请求地址： ", chatPath);
      sys.log.info("AITaaS>>>客户端请求数据： ", data);

      const chatPayload = {
        method: "POST",
        body: JSON.stringify(data),
        signal: controller.signal,
        headers: {
          ...getHeaders(),
          "X-DashScope-SSE": shouldStream ? "enable" : "disable",
        },
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      if (shouldStream) {
        sys.log.info("chat>>>流式输出中...");
        let responseText = "";
        let remainText = "";
        let finished = false;
        let responseRes: Response;

        // animate response to make it looks smooth
        function animateResponseText() {
          if (finished || controller.signal.aborted) {
            responseText += remainText;
            sys.log.info("chat>>>输出结束");
            if (responseText?.length === 0) {
              options.onError?.(new Error("empty response from server"));
            }
            return;
          }

          if (remainText.length > 0) {
            const fetchCount = Math.max(1, Math.round(remainText.length / 60));
            const fetchText = remainText.slice(0, fetchCount);
            responseText += fetchText;
            remainText = remainText.slice(fetchCount);
            options.onUpdate?.(responseText, fetchText);
          }

          requestAnimationFrame(animateResponseText);
        }

        // start animaion
        animateResponseText();

        const finish = () => {
          if (!finished) {
            finished = true;
            options.onFinish(responseText + remainText, responseRes);
          }
        };

        controller.signal.onabort = finish;

        fetchEventSource(chatPath, {
          fetch: fetch as any,
          ...chatPayload,
          async onopen(res) {
            clearTimeout(requestTimeoutId);
            const contentType = res.headers.get("content-type");

            responseRes = res;

            if (contentType?.startsWith("text/plain")) {
              responseText = await res.clone().text();
              return finish();
            }

            if (
              !res.ok ||
              !res.headers
                .get("content-type")
                ?.startsWith(EventStreamContentType) ||
              res.status !== 200
            ) {
              responseText = await buildErrorResponse(res);

              return finish();
            }
          },
          onmessage(msg) {
            const text = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(msg.data)); // '
            if (text === "[DONE]" || finished) {
              return finish();
            }
            remainText += text;
            //remainText += text.replaceAll("&#32;", " ").replaceAll("&#92n", "\n");
          },
          onclose() {
            sys.log.info("chat>>>连接关闭");
            finish();
          },
          onerror(e) {
            sys.log.error("chat>>>请求错误", e);
            options.onError?.(e);
            throw e;
          },
          openWhenHidden: true,
        });
      } else {
        const res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);

        const resJson = await res.json();
        //sys.log.info("AITaaS>>>非流式响应:", resJson);
        //const message = this.extractMessage(resJson.result);

        options.onFinish(resJson.success ? resJson.result : resJson.message, res);
      }
    } catch (e) {
      sys.log.error("chat>>>请求错误", e);
      options.onError?.(e as Error);
    }
  }
  async usage() {
    return {
      used: 0,
      total: 0,
    };
  }

  async models(): Promise<LLMModel[]> {
    return [];
  }
}
