import { ClientApi, getClientApi } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import {  ChatOutputMode, ModelProvider } from "../constant";
import { createMessage, fillTemplateWith, useModelProviderConfig, useChatStore } from "../store";
import { useUserState } from "../store/user";
import { getMessageTextContent } from "../utils";
import { prettyObject } from "./format";
import { sys } from "./sys";
import Locale from "../locales";
import { ChatConfig, ChatMessage, ChatMessageTool, MultimodalContent, SocketData } from "../types";
import useWebSocket from "../http/socket";
import { useEffect } from "react";

const useLLM = (onResponse?: (text: string) => void) => {
  const socketEndpoint = "LLMChat";
  const socketDataType = "AIChat";
  const chatStore = useChatStore();
  const accessStore = useModelProviderConfig();
  const session = chatStore.currentSession();

  const socketOnReady = () => {

  }
  const socketOnError = (e: any) => {
    if (e.isTrusted) return;

    chatStore.onBotMessage(Locale.Error.CommonError);
  }
  const socketOnClosed = () => {

  }
  const socketOnMessage = (msg: SocketData<string>) => {
    sys.log.info("SOCKET>>>解析消息：", msg);
    if (msg.type == socketDataType) {
      let aicontent = msg.data.result ?? "";
      if (!msg.data.success) {
        aicontent = msg.data.message;
        chatStore.onBotMessage(aicontent, true);
      }
      else {
        chatStore.onBotMessage(aicontent);
      }

      onResponse?.(aicontent);
    }
  }

  const socket = useWebSocket(socketOnMessage, socketOnError, socketOnClosed, socketOnReady);

  useEffect(() => {
    if (session.mask.modelConfig.modelProvider === ModelProvider.AITaaS && accessStore.AITaaS_OutputMode === ChatOutputMode.Socket) {
      sys.log.info("打开socket连接");
      socket.open(socketEndpoint);
    }

    return () => {
      if (session.mask.modelConfig.modelProvider === ModelProvider.AITaaS &&
        accessStore.AITaaS_OutputMode === ChatOutputMode.Socket) {
        sys.log.info("释放socket连接");
        socket.close();
      }
    };
  }, []);

  const chat = async (content: string, config: ChatConfig, attachFiles?: Record<string, string>[]) => {

    const modelConfig = session.mask.modelConfig;
    let streamMode = true;

    const userContent = fillTemplateWith(content, modelConfig);

    let mContent: MultimodalContent[] = [{ type: "text" as const, text: userContent }];

    if (attachFiles && attachFiles.length > 0) {
      mContent = mContent.concat(
        attachFiles.map((file) => ({
          type: "file" as const,
          url: file.url,
        }))
      );
    }

    mContent = mContent.concat([{ type: "config" as const, config: config }]);

    let userMessage: ChatMessage = createMessage({
      role: "user",
      content: mContent,
    });

    const botMessage: ChatMessage = createMessage({
      role: "assistant",
      isStreaming: true,
      modelName: modelConfig.modelName,
    });

    // get recent messages
    const recentMessages = chatStore.getMessagesWithMemory();
    let sendMessages = recentMessages.concat(userMessage);
    const messageIndex = session.messages.length + 1;

    // save user's and bot's message
    chatStore.updateTargetSession(session, (session) => {
      const savedUserMessage = {
        ...userMessage,
        content: mContent,
      };
      session.messages = session.messages.concat([
        savedUserMessage,
        botMessage,
      ]);
    });

    //add for AITaaS, 特殊处理，使用AITaaS模型
    if (session.mask.modelConfig.modelProvider === ModelProvider.AITaaS) {

      let smsg = session.mask.context.reduce((pre, cur) => {
        let part;
        const msg = getMessageTextContent(cur);
        if (!msg || msg.length === 0) return pre;
        if (cur.role === "system") {
          part = msg;
        } else if (cur.role === "user") {
          part = "用户输入:" + msg+"\n";
        } else if (cur.role === "assistant") {
          part = "你的输出:" + msg+"\n\n";;
        }
        return pre + part;
      }, "");

      let aitaasSysMessage: ChatMessage = createMessage({
        role: "system",
        userAvatar: "bot",
        content: smsg,
      });
      let aitaasUserMessage: ChatMessage = createMessage({
        role: "user",
        content: mContent,
      });

      if (smsg.length > 0)
        sendMessages = [aitaasSysMessage, aitaasUserMessage];
      else
        sendMessages = [aitaasUserMessage];

      sys.log.info("chat>>>发送的消息 : ", sendMessages);

      streamMode = !(accessStore.AITaaS_OutputMode == ChatOutputMode.Common);

      if (accessStore.AITaaS_OutputMode === ChatOutputMode.Socket) {

        socket.send(socketDataType, {
          uid: useUserState.getState().userId,
          msg: sendMessages,
        });

        return;
      }
    }

    //调用之前先到服务端认证
    // const user = useUserState.getState();
    // const checkResult = await openapi.userCheckToken();

    // if (!checkResult.success || checkResult.result == null) {
    //   sys.log.info("chat>>>认证不通过");
    //   chatStore.onBotMessage(Locale.Error.Unauthorized, true);
    //   return;
    // }

    // user.updateUser(checkResult.result);

    // sys.log.info("chat>>>认证通过:",checkResult.result);


    //调用目标模型
    const api: ClientApi = getClientApi(modelConfig.modelProvider);

    // make request
    api.llm.chat({
      messages: sendMessages,
      config: { ...modelConfig, stream: streamMode },
      onUpdate(message) {
        botMessage.isStreaming = true;
        if (message) {
          botMessage.content = message;
        }
        chatStore.updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
      },
      onFinish(message) {
        sys.log.info("chat>>>请求完成");
        botMessage.isStreaming = false;

        if (message) {
          botMessage.content = message;
          botMessage.date = new Date().toLocaleString();
          chatStore.onNewBotMessage(botMessage, session);
        }

        ChatControllerPool.remove(session.id, botMessage.id);

        onResponse?.(message);
      },
      onBeforeTool(tool: ChatMessageTool) {
        (botMessage.tools = botMessage?.tools || []).push(tool);
        chatStore.updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
      },

      onAfterTool(tool: ChatMessageTool) {
        botMessage?.tools?.forEach((t, i, tools) => {
          if (tool.id == t.id) {
            tools[i] = { ...tool };
          }
        });
        chatStore.updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
      },
      onError(error) {
        sys.log.info("chat>>>错误返回:", error);
        const isAborted = error.message?.includes?.("aborted");
        botMessage.content +=
          "\n\n" + prettyObject("错误信息：" + error.message);
        botMessage.isStreaming = false;
        userMessage.isError = !isAborted;
        botMessage.isError = !isAborted;
        chatStore.updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
        ChatControllerPool.remove(
          session.id,
          botMessage.id ?? messageIndex,
        );

        sys.log.error("[Chat] failed ", error);

        onResponse?.("");
      },
      onController(controller) {
        // collect controller for stop/retry
        ChatControllerPool.addController(
          session.id,
          botMessage.id ?? messageIndex,
          controller,
        );
      },
    });
  }

  return { chat };
};

export default useLLM;