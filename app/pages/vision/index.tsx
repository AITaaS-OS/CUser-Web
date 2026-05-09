import styles from "./index.module.scss";
import StopIcon from "../../icons/stop.svg";
import { Camera, CameraRef, DurationButton, SpeechMonitor, SpeechMonitorRef, IconButton, Loading, SpeechButton } from "../../components/ui-lib";
import Locale from "../../locales";
import { useEffect, useRef, useState } from "react";
import tts from "../../utils/useTTS";
import { useAppConfig } from "../../store";
import { sys } from "../../utils/sys";
import { useNavigate } from "react-router-dom";
import { Path } from "../../constant";
import useWebSocket from "../../http/socket";
import { SocketData, Result } from "../../types";
import touch from "@/app/utils/touch";
import { CloseOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useUserState } from "@/app/store/user";
import { Markdown } from "@/app/components/markdown";
import { OpenAPI } from "@/app/openapi";
import { copyToClipboard } from "@/app/utils";

function VisionPage() {
  const socketEndpoint = "VisionChat";
  const socketDataType = "AIVision";

  const taskTimer = useRef<NodeJS.Timeout>();
  const videoTimer = useRef<NodeJS.Timeout>();

  const navigate = useNavigate();
  const appSetting = useAppConfig();
  const user = useUserState();
  enum ProcessTag {
    Chat = "chat",
    VR = "vr",
    PR = "pr"
  }

  // 定义状态
  const currentTag = useRef<ProcessTag>(ProcessTag.Chat);
  const [processing, setProcessing] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const cameraRef = useRef<CameraRef>(null);
  const recordingMonitor = useRef<SpeechMonitorRef>(null);
  const vrPromptRef = useRef<string>("");
  const [vrResult, setVrResult] = useState<string>("");
  const cameraAudio = useRef<boolean>(false);
  const visionRecognitionInterval = 30000; //每30秒解析一次视频

  // 定义socket通信
  const getTaskStatus = (taskId: string) => {
    if (taskId.length > 0 && taskTimer.current) {
      sys.log.info("查询任务进度>>>:", taskId);
      socket.send(socketDataType, { tag: currentTag.current + "-result", taskId: taskId });
    }
  }

  const socketOnReady = () => {

  }
  const socketOnError = () => {
    sys.log.error("camera>>>socket连接发生错误");
    sys.msg.error("连接错误,请稍后重试");
    reset();
  }
  const socketOnClosed = () => {
    // reset();
  }
  const socketOnMessage = (msg: SocketData<string>) => {
    setProcessing(false);
    sys.log.info("camera>>>tag:{}, msg:{}", currentTag.current, msg);

    if (msg.tag == ProcessTag.Chat) {
      chatResult(msg?.data);
    }
    else if (msg.tag == ProcessTag.VR) {
      videoResult(msg?.data);
    }
    else if (msg.tag == ProcessTag.PR) {
      pictureResult(msg?.data);
    }
  }

  function pictureResult(result: Result<string>) {
    recordingMonitor.current?.start();

    if (!result.success) {
      sys.msg.error(result.message || Locale.VideoChat.Error.Common);
      return;
    }

    if (result.result) {
      if (appSetting.visionConfig.enableSpeak) {
        tts.speak(result.result ?? "");
      }
      setVrResult(result.result ?? "");
    }
  }

  function videoResult(result: Result<string>) {
    if (!result.success) {
      sys.msg.error(result.message || Locale.VideoChat.Error.Common);
      return;
    }

    const data: { answer: string, result: boolean } = JSON.parse(result.result || "{}");

    if (data.result) {
      if (appSetting.visionConfig.enableSpeak) {
        tts.speak(result.result ?? "");
      }

      setVrResult(data.answer ?? "");
    }
  }

  function chatResult(result: Result<string>) {
    if (!result.success) {
      sys.msg.error(result.message || Locale.VideoChat.Error.Common);
      return;
    }

    const data: { answer: string, prompt: string, result: boolean } = JSON.parse(result.result || "{}");

    if (data.answer && appSetting.visionConfig.enableSpeak) {
      tts.speak(data.answer ?? "");
    }

    if (data.prompt) {
      vrPromptRef.current = data.prompt ?? "";

      if (!recording) {
        setRecording(true);
        setProcessing(true);

        try {
          //开始录像
          cameraRef.current?.startCapture();
        } catch (e: any) {
          sys.log.error("camera>>>无法使用录像设备>>>:", e);
          setVrResult(e);
          sys.msg.error("无法使用录像设备:{}", e);
        }

        //定时解析视频
        videoTimer.current = setInterval(() => {
          recognizeVideo();
        }, visionRecognitionInterval);
      }
    }
  }

  const socket = useWebSocket(socketOnMessage, socketOnError, socketOnClosed, socketOnReady);

  useEffect(() => {
    //打开通道
    socket.open(socketEndpoint);

    return () => {
      sys.log.info("释放资源...");

      reset();

      socket.close();

      OpenAPI.aiChatClearHistory()
        .then((result) => {
          if (result.success && result.result) {
            sys.log.info("camera>>>清空对话历史成功");
          }
          else {
            sys.log.error("camera>>>清空对话历史失败:", result.message);
          }
        });
    }
  }, []);

  function reset() {
    setRecording(false);
    setProcessing(false);
    setVrResult("");

    clearInterval(taskTimer.current);
    taskTimer.current = undefined;
    clearInterval(videoTimer.current);
    videoTimer.current = undefined;

    cameraRef.current?.stopCapture();
  }

  function recognizeVideo() {
    socket.open(socketEndpoint);
    sys.log.info("camera>>>开始分析视频:", vrPromptRef.current);

    if (vrPromptRef.current.length > 0) {
      cameraRef.current?.getVideo().then((videoUrl) => {
        sys.log.info("camera>>>视频地址>>>:", videoUrl);
        if (videoUrl) {
          currentTag.current = ProcessTag.VR;
          const fttPayload = { file: videoUrl, prompt: vrPromptRef.current };
          socket.send(socketDataType, { tag: "vr", fttSetting: fttPayload });
        }
      }).catch((e) => {
        sys.log.error("camera>>>获取视频失败>>>:", e);
        sys.msg.error("获取视频失败");
      });
    }
  }

  return (
    <div className={styles["camera-page"]}>
      <div className={styles["camera-panel"]}>
        <Camera
          ref={cameraRef}
          onReady={() => {

          }} />

        {vrResult &&
          <div className={styles["result-panel"]}>
            <Markdown content={vrResult} onClick={() => { copyToClipboard(vrResult) }} />

            <IconButton
              className={styles["result-close"]}
              icon={<CloseOutlined />}
              onClick={() => {
                setVrResult("");
              }}
            />

          </div>
        }

      </div>

      <div className={styles["action-panel"]}>
        <div className={styles["flag-panel"]}>
          {(processing || recording) && <Loading noLogo />}
        </div>
        <div className={styles["video-action"]}>

          {!appSetting.visionConfig.enableVideo &&
            <SpeechMonitor
              ref={recordingMonitor}
              onSpeechEnd={(audioUrl) => {
                recordingMonitor.current?.pause();
                cameraRef.current?.getScreenshot().then((pictureUrl) => {
                  setProcessing(true);
                  currentTag.current = ProcessTag.PR;
                  const fttPayload = { file: pictureUrl, prompt: audioUrl };
                  socket.send(socketDataType, { tag: "pr", fttSetting: fttPayload });
                }).catch((e) => {
                  sys.log.error("SpeechMonitor>>>无法获取截图：", e);
                  setVrResult("无法获取视频信息，请调整视频后重试");
                });
              }}
            />
          }

          {appSetting.visionConfig.enableVideo &&
            <>
              {recording &&
                <Button
                  className={styles["action-blank"]}
                  disabled={true} />
              }

              <SpeechButton
                maxTime={30}
                onStart={() => {
                  //对话时关闭音频，并打开socket
                  cameraAudio.current = cameraRef.current?.getAudio() ?? false;
                  cameraRef.current?.setAudio(false);
                  socket.open(socketEndpoint);
                }}
                onCancel={() => {
                  cameraRef.current?.setAudio(cameraAudio.current);
                }}
                onEnd={(audioFileUrl) => {
                  setProcessing(true);
                  cameraRef.current?.setAudio(cameraAudio.current);
                  //发送语音
                  currentTag.current = ProcessTag.Chat;
                  const attPayload = { audio: audioFileUrl };
                  socket.send(socketDataType, { tag: "chat", attSetting: attPayload });
                }}
              />

              {recording &&
                <Button
                  className={styles["action-stop"]}
                  icon={<StopIcon />}
                  onClick={() => {
                    // 释放资源
                    socket.close();
                    reset();
                  }} />
              }
            </>
          }
        </div>
      </div>
    </div>
  );
}


export default function AIVision() {
  const navigate = useNavigate();

  useEffect(() => {
    const leftKey = touch.addSlideLeftFunc(() => {
      navigate(Path.DH);
    });
    const rightKey = touch.addSlideRightFunc(() => {
      navigate(Path.Chat);
    });

    return () => {
      touch.removeSlideLeftFunc(leftKey);
      touch.removeSlideRightFunc(rightKey);
    };
  }, []);

  return <VisionPage></VisionPage>
}