"use client";
import {
  ServerAPIPath,
  Alibaba,
  REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import { useModelProviderConfig, useAppConfig, useChatStore } from "@/app/store";

import {
  ChatOptions,
  getHeaders,
  LLMApi,
  LLMModel,
  SpeechOptions
} from "../api";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { getClientConfig } from "@/app/config/client";
import { getMessageTextContent } from "@/app/utils";
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

interface RequestParam {
  result_format: string;
  incremental_output?: boolean;
  temperature?: number;
  repetition_penalty?: number;
  top_p?: number;
  max_tokens?: number;
}
interface RequestPayload {
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string | MultimodalContent[];
  }[];
  stream: boolean;
  parameters?: RequestParam;
}

export class QwenApi implements LLMApi {
  path(path: string): string {
    const accessStore = useModelProviderConfig.getState();

    let baseUrl = "";

    if (accessStore.enableCustomConfig) {
      baseUrl = accessStore.alibabaBaseUrl;
    }

    if (baseUrl.length === 0) {
      const isApp = !!getClientConfig()?.isApp;
      baseUrl = isApp ? Alibaba.BaseUrl : ServerAPIPath.Alibaba;
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    if (!baseUrl.startsWith("http") && !baseUrl.startsWith(ServerAPIPath.Alibaba)) {
      baseUrl = "https://" + baseUrl;
    }

    return [baseUrl, path].join("/");
  }

  extractMessage(res: any) {
    return res?.choices?.at(0)?.message?.content ?? "";
  }

  speech(options: SpeechOptions): Promise<ArrayBuffer> {
    throw new Error("Method not implemented.");
  }

  async chat(options: ChatOptions) {
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: getMessageTextContent(v),
    }));

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.modelName,
      },
    };

    const shouldStream = !!options.config.stream;
    const requestPayload: RequestPayload = {
      model: modelConfig.model,
      messages: messages,
      stream: shouldStream
      // parameters: {
      //   result_format: "message",
      //   incremental_output: shouldStream,
      //   //temperature: modelConfig.temperature,
      //   // max_tokens: modelConfig.max_tokens,
      //   //top_p: modelConfig.top_p === 1 ? 0.99 : modelConfig.top_p, // qwen top_p is should be < 1
      // },
    };

    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path(Alibaba.ChatPath);
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: {
          ...getHeaders()
        },
      };

      sys.log.info("chat>>>:", chatPath, chatPayload);

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

            responseRes = res;

            sys.log.info("onopen>>>:", res);

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
              const choices = json.choices as Array<any>;

              let delta = choices[0]?.delta?.content;
              if (!delta && choices[0]?.delta?.reasoning_content)
                delta = choices[0]?.delta?.reasoning_content;

              if (delta)
                remainText += delta;
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
export { Alibaba };
