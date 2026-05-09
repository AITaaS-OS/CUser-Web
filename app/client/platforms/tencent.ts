"use client";
import { ServerAPIPath, REQUEST_TIMEOUT_MS, Tencent } from "@/app/constant";
import { useModelProviderConfig, useAppConfig, useChatStore } from "@/app/store";

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
import { getMessageTextContent, isVisionModel } from "@/app/utils";
import mapKeys from "lodash-es/mapKeys";
import mapValues from "lodash-es/mapValues";
import isArray from "lodash-es/isArray";
import isObject from "lodash-es/isObject";
import { fetch } from "@/app/utils/stream";
import { buildErrorResponse } from "@/app/utils/chat";
import { sys } from "@/app/utils/sys";
import { MultimodalContent } from "@/app/types";

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}

interface RequestPayload {
  Messages: {
    Role: "system" | "user" | "assistant";
    Content: string | MultimodalContent[];
  }[];
  Stream?: boolean;
  Model: string;
  Temperature: number;
  TopP: number;
}

function capitalizeKeys(obj: any): any {
  if (isArray(obj)) {
    return obj.map(capitalizeKeys);
  } else if (isObject(obj)) {
    return mapValues(
      mapKeys(obj, (value: any, key: string) =>
        key.replace(/(^|_)(\w)/g, (m, $1, $2) => $2.toUpperCase()),
      ),
      capitalizeKeys,
    );
  } else {
    return obj;
  }
}

export class HunyuanApi implements LLMApi {
  path(): string {
    const accessStore = useModelProviderConfig.getState();

    let baseUrl = "";

    if (accessStore.enableCustomConfig) {
      baseUrl = accessStore.tencentBaseUrl;
    }

    if (baseUrl.length === 0) {
      const isApp = !!getClientConfig()?.isApp;
      baseUrl = isApp ? Tencent.BaseUrl : ServerAPIPath.Tencent;
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    if (!baseUrl.startsWith("http") && !baseUrl.startsWith(ServerAPIPath.Tencent)) {
      baseUrl = "https://" + baseUrl;
    }

    sys.log.info("[Proxy Endpoint] ", baseUrl);
    return baseUrl;
  }

  extractMessage(res: any) {
    return res.Choices?.at(0)?.Message?.Content ?? "";
  }

  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Method not implemented.");
  }

  async chat(options: ChatOptions) {
    const visionModel = isVisionModel(options.config.modelName);
    const messages = options.messages.map((v, index) => ({
      // "Messages 中 system 角色必须位于列表的最开始"
      role: index !== 0 && v.role === "system" ? "user" : v.role,
      content: visionModel ? v.content : getMessageTextContent(v),
    }));

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.modelName,
      },
    };

    const requestPayload: RequestPayload = capitalizeKeys({
      model: modelConfig.model,
      messages,
      temperature: modelConfig.temperature,
      top_p: modelConfig.top_p,
      stream: options.config.stream,
    });

    sys.log.info("[Request] Tencent payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path();
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      if (shouldStream) {
        let responseText = "";
        let remainText = "";
        let finished = false;
        let responseRes: Response;

        // animate response to make it looks smooth
        function animateResponseText() {
          if (finished || controller.signal.aborted) {
            responseText += remainText;
            sys.log.info("[Response Animation] finished");
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
            sys.log.info(
              "[Tencent] request response content type: ",
              contentType,
            );
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
            if (msg.data === "[DONE]" || finished) {
              return finish();
            }
            const text = msg.data;
            try {
              const json = JSON.parse(text);
              const choices = json.Choices as Array<{
                Delta: { Content: string };
              }>;
              const delta = choices[0]?.Delta?.Content;
              if (delta) {
                remainText += delta;
              }
            } catch (e) {
              sys.log.error("[Request] parse error", text, msg);
            }
          },
          onclose() {
            finish();
          },
          onerror(e) {
            options.onError?.(e);
            throw e;
          },
          openWhenHidden: true,
        });
      } else {
        const res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);

        const resJson = await res.json();
        const message = this.extractMessage(resJson);
        options.onFinish(message, res);
      }
    } catch (e) {
      sys.log.info("[Request] failed to make a chat request", e);
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
