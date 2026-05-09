import { getServerSideConfig } from "@/app/config/server";
import { AITaaS_SocketUrl, AITaaS_SocketPath } from "@/app/config/env";
import { useUserState } from "../store/user";
import { useRef } from "react";
import { sys } from "../utils/sys";
import { SocketData, SocketDataType, } from "../types";
import Locale from "../locales";

const useWebSocket = (
  onMessage: (msg: SocketData<string>) => void,
  onError?: (e: any) => void,
  onClosed?: () => void,
  onReady?: () => void,
  path?: AITaaS_SocketPath,
) => {
  const webSocket = useRef<WebSocket | null>();
  const reconnectCount = useRef(0);
  const endpointRef = useRef("");
  const user = useUserState();
  const serverConfig = getServerSideConfig();

  // useEffect(() => {
  //   return () => {
  //     if (webSocket?.current) {
  //       sys.log.info("释放socket资源");
  //       reconnectCount.current = 0;
  //       webSocket.current?.close();
  //       webSocket.current = null;
  //     }
  //   };
  // }, []);

  const open = (
    endpoint: string,
    onOpened?: () => void) => {

    endpointRef.current = endpoint;

    if (webSocket.current && webSocket.current.readyState == WebSocket.OPEN)
      return;

    if (!user || user.accessToken === "" || user.userId === "") {
      sys.log.error("SOCKET>>>没有权限");
      //sys.msg.error(Locale.Error.Unauthorized);
      onError?.(Locale.Error.Unauthorized);
      return;
    }

    //{userid}/{endpoint}

    let socketUrl = serverConfig.AITaaS_SocketUrl ?? AITaaS_SocketUrl;

    socketUrl =
      socketUrl +
      (path ?? AITaaS_SocketPath.OpenSocket) +
      "/" +
      user.userId +
      "/" +
      endpoint;

    //所有请求认证格式
    webSocket.current = new WebSocket(socketUrl, [user.accessToken]);

    sys.log.info("SOCKET>>>正在连接服务器...");

    webSocket.current.onerror = (e) => {
      //sys.log.info("SOCKET>>>错误,", e);
      onError?.(e);
    };

    webSocket.current.onmessage = (event) => {
      sys.log.info("SOCKET>>>收到消息");
      onMessage?.(JSON.parse(event.data));
    };

    webSocket.current.onopen = () => {
      sys.log.info("SOCKET>>>已连接");
      onOpened?.();
      onReady?.();
    };
  };

  const send = (dataType: SocketDataType, data: any) => {
    if (!webSocket.current ||
      webSocket.current.readyState == WebSocket.CLOSING ||
      webSocket.current.readyState == WebSocket.CLOSED) {

      if (reconnectCount.current > 3) {
        sys.log.error("SOCKET>>>重连次数超过限制，服务器连接已断开");
        onClosed?.();
        return;
      }

      reconnectCount.current = reconnectCount.current + 1;

      sys.log.info("SOCKET>>>服务器连接已断开，重连中...", reconnectCount.current);
      open(endpointRef.current, () => {
        let msgData = JSON.stringify({ type: dataType, data: data });
        sys.log.info("SOCKET>>>重连后补发消息：", msgData);
        webSocket.current?.send(msgData);
      });
    } else if (webSocket.current && webSocket.current.readyState == WebSocket.OPEN) {
      let msgData = JSON.stringify({ type: dataType, data: data });
      sys.log.info("SOCKET>>>发送消息：", msgData);
      webSocket.current?.send(msgData);
    }
    else {
      sys.log.error("SOCKET>>>服务器连接已断开,无法发送消息!");
      onClosed?.();
    }
  };

  const close = () => {
    if (webSocket.current && webSocket.current.readyState == WebSocket.OPEN) {
      sys.log.info("SOCKET>>>关闭连接");
      webSocket.current.close();
      onClosed?.();
    }
  };

  return { open, send, close };
};

export default useWebSocket;
