import { BOT_HELLO, createMessage, useAppConfig, useChatStore } from "../store";
import { sys } from "./sys";
import { ChatMessage, MultimodalContent, SocketData, TTTConfig } from "../types";
import useWebSocket from "../http/socket";
import { useUserState } from "../store/user";
import { OpenAPI } from "../openapi";

// 跨境对话（机器翻译）

export const useMeeting = (onChanged?: (content: any) => void) => {
  const socketDataType = "Meeting";
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const user = useUserState();

  const socketOnReady = () => {

  }
  const socketOnError = () => {

  }
  const socketOnClosed = () => {

  }
  const socketOnMessage = (msg: SocketData<any>) => {
    sys.log.info("SOCKET>>>解析消息：", msg);
    if (msg.type == socketDataType) {
      if (msg.tag == "changed") {
        onChanged?.(msg.data.result);
      }
      else if (msg.data.success) {
        const receivedMsg: ChatMessage = msg.data.result;
        receivedMsg.role = "system";
        chatStore.addNewMessage(msg.data.result);
      }
      else {
        const receivedMsg: ChatMessage = BOT_HELLO;
        receivedMsg.role = "system";
        receivedMsg.content = msg.data.message;
        chatStore.addNewMessage(msg.data.result);
      }
    }
  }

  const socket = useWebSocket(socketOnMessage, socketOnError, socketOnClosed, socketOnReady);

  const connect = (roomNum: string) => {
    socket.open(roomNum, () => {
      socket.send(socketDataType, {
        tag: "connect",
        content: { userId: user.userId, userName: user.userName, userAvatar: user.userAvatar },
      });
    });
  }

  const disconnect = (roomNum: string) => {
    socket.send(socketDataType, {
      tag: "close",
      content: { userId: user.userId, userName: user.userName, userAvatar: user.userAvatar },
    });

    socket.close();
  }

  const chat = async (content: string, attachFiles?: Record<string, string>[], ttt?: boolean) => {

    if (content && content.length > 0) {
      //统一翻译
      const tttPayload: TTTConfig = { ...useAppConfig.getState().tttConfig, sourceText: content };

      const response = await OpenAPI.aiTTT(tttPayload);

      if (response.success)
        content = response.result?.targetText + "\n" + response.result?.sourceText;
      else {
        sys.msg.error(response.message);
        return;
      }
    }

    let mContent: string | MultimodalContent[] = content;

    if (attachFiles && attachFiles.length > 0) {
      mContent = [
        ...(mContent
          ? [{ type: "text" as const, text: mContent }]
          : []),
        ...attachFiles.map((file) => ({
          type: "file" as const,
          url: file.url,
        })),
      ];
    }

    let myMessage: ChatMessage = createMessage({
      role: "user",
      content: mContent,
      userId: user.userId,
      userName: user.userName,
      userAvatar: user.userAvatar,
    });

    // 显示已经翻译的信息
    chatStore.updateTargetSession(session, (session) => {
      const savedUserMessage = {
        ...myMessage,
        content: mContent,
      };
      session.messages = session.messages.concat([
        savedUserMessage
      ]);
    });

    // 将翻译后的信息发送给对方
    socket.send(socketDataType, {
      tag: "chat",
      content: myMessage,
    });
  }

  return { chat, connect, disconnect };
};