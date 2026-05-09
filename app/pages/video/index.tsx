import styles from "./index.module.scss";
import OpenRecordIcon from "../../icons/microphone-open.svg";
import CancelRecordIcon from "../../icons/microphone-close.svg";
import SendIcon from "../../icons/send.svg";
import HangupIcon from "../../icons/hangup.svg";
import CallIcon from "../../icons/call.svg";
import { FileUpload, IconButton, Loading, Modal, showConfirm, TextArea } from "../../components/ui-lib";
import Locale from "../../locales";
import { useEffect, useRef, useState } from "react";
import sts from "../../utils/useSTS";
import { Button, Space, UploadFile } from "antd";
import { useAppConfig } from "../../store";
import { sys } from "../../utils/sys";
import { useNavigate } from "react-router-dom";
import { EMOVideo, Path } from "../../constant";
import clsx from "clsx";
import useWebSocket from "../../http/socket";
import { SocketData } from "../../types";
import { OpenAPI } from "@/app/openapi";
import file, { UploadFormat } from "@/app/utils/file";
import touch from "@/app/utils/touch";
import { CheckOutlined, DownloadOutlined, LeftOutlined, ReloadOutlined, RightOutlined, StopOutlined, SyncOutlined, UploadOutlined } from "@ant-design/icons";

function VideoPage() {
  const socketEndpoint = "VideoChat";
  const socketDataType = "AIVideo";

  const timer = useRef<NodeJS.Timeout>();

  const navigate = useNavigate();
  const appSetting = useAppConfig();

  type ProcessStatus = "init" | "readyspeak" | "speaking" | "processing";

  // 定义状态
  const [processStatus, setProcessStatus] = useState<ProcessStatus>("init");

  const [videoUrl, setVideoUrl] = useState(appSetting.videoConfig.helloVideo);
  const [pictureUrl, setPictureUrl] = useState(appSetting.videoConfig.picture);
  const [pictureHistory, setPictureHistory] = useState([appSetting.videoConfig.picture]);
  const [pictureIndex, setPictureIndex] = useState(0);
  const [fixVideos, setFixVideos] = useState([]);
  const [showEditPictureModal, setShowEditPictureModal] = useState(false);
  const [showDigitalHumanModal, setShowDigitalHumanModal] = useState(false);
  const [showEMOModal, setShowEMOModal] = useState(false);
  const [showP2VModal, setShowP2VModal] = useState(false);
  const [showChangeActorModal, setShowChangeActorModal] = useState(false);

  const currentTag = useRef("");

  const playFixVideo = (videoName: string) => {
    fixVideos.forEach((v: any) => {
      if (v.name == videoName) {
        sys.log.info("播放补偿视频>>>:", v);
        setVideoUrl(v.url);
        playVideo();
      }
    });
  }

  // 定义音视频播放组件
  const audio = useRef(new Audio());
  const video = useRef<HTMLVideoElement>(null);

  const playVideo = () => {
    video.current?.load();
  }
  const stopVideo = () => {
    video.current?.pause();
  }
  const videoPlayEnded = () => {
    sys.log.info("视频播放完成>>>");
    clearInterval(timer.current);
    timer.current = undefined;
    if (processStatus != "init")
      setProcessStatus("readyspeak");

    setProcessing(false);
  }
  const videoCanPlay = () => {
    sys.log.info("播放视频>>>");
    video.current?.play();
  }
  const videoPlayError = (e: any) => {
    sys.log.error("视频播放失败>>>", e.target.error.message);
    sys.msg.error(Locale.VideoChat.Error.Common);
    setProcessStatus("readyspeak");
  }

  // 定义socket通信
  const getTaskStatus = (taskId: string) => {
    if (taskId.length > 0 && timer.current) {
      sys.log.info("查询视频进度>>>:", taskId);
      socket.send(socketDataType, { tag: currentTag.current + "-result", taskId: taskId });
    }
  }

  const socketOnReady = () => {

  }
  const socketOnError = () => {
    clearInterval(timer.current);
    timer.current = undefined;
    setProcessing(false);
    setProcessStatus("init");
  }
  const socketOnClosed = () => {
    clearInterval(timer.current);
    timer.current = undefined;
    setProcessing(false);
    setProcessStatus("init");
  }
  const socketOnMessage = (msg: SocketData<string>) => {
    if (msg.type == socketDataType && msg.data.success) {
      sys.log.info("收到消息>>>tag:{}, msg:{}", currentTag.current, msg);
      if (msg.tag == currentTag.current) {
        sys.log.info("正在生成AI视频>>>");
        timer.current = setInterval(() => {
          getTaskStatus(msg.data.result ?? "");
        }, 3000);
      }
      else if (msg.tag.endsWith("-result")) {
        if (msg.data.result && timer.current) {
          sys.log.info("准备播放AI视频>>>", msg.data.result);
          clearInterval(timer.current);
          timer.current = undefined;
          setVideoUrl(msg.data.result);
          playVideo();
        }
      }
      else {
        clearInterval(timer.current);
        timer.current = undefined;
        sys.msg.error(Locale.VideoChat.Error.Common);
        setProcessing(false);
        setProcessStatus("init");
      }
    }
    else {
      sys.msg.error(msg.data.message);
      setProcessing(false);
      setProcessStatus("init");
      clearInterval(timer.current);
      timer.current = undefined;
      sys.msg.error(Locale.VideoChat.Error.Common);
    }
  }

  const socket = useWebSocket(socketOnMessage, socketOnError, socketOnClosed, socketOnReady);

  const [processing, setProcessing] = useState(false);
  async function editPicture(purpose: string) {
    await file.uploadFiles(
      {
        format: UploadFormat.Image,

        maxCount: 1,

        onCompleted: (uploadedFiles) => {

          let prompt = "";
          if (purpose == "ChangeSkin")
            prompt = Locale.VideoChat.Function.ChangeSkinPrompt;
          else if (purpose == "ChangeBG")
            prompt = Locale.VideoChat.Function.ChangeBGPrompt;

          onEditPicture(prompt, uploadedFiles);
        },

        onUploading: () => {
          setProcessing(true);
        }
      }
    );
  };

  async function uploadFile() {
    await file.uploadFiles({
      maxCount: 1,
      maxSize: 5 * 1000 * 1000,
      format: UploadFormat.Image,
      onCompleted: (uploadedFiles) => {
        setProcessing(false);
        setPictureUrl(uploadedFiles[0]?.url);
        setPictureHistory(pictureHistory.concat(uploadedFiles[0]?.url));
        setPictureIndex(pictureHistory.length);
      },
      onError: (file) => {
        setProcessing(false);
      },
      onUploading: () => {
        setProcessing(true);
      }
    });
  }

  function onEditPicture(prompt: string, uploadedFiles?: Record<string, string>[]) {
    const config = {
      prompt: prompt,
      images: [pictureUrl],
      n: 1,
      size: "1500*2000",
    };

    if (uploadedFiles && uploadedFiles.length > 0) {
      const file = uploadedFiles.at(0)?.url || "";
      if (file.length > 0)
        config.images = config.images.concat(file);
    }

    sys.log.info("ptp>>>", config);

    setProcessing(true);

    OpenAPI.aiPTP(config)
      .then((result) => {
        if (result.success && result.result) {
          setPictureUrl(result.result);
          setPictureHistory(pictureHistory.concat(result.result));
          setPictureIndex(pictureHistory.length);
        }
        setProcessing(false);
      }
      ).catch((e) => {
        setProcessing(false);
      });
  }

  function EditPictureModal(props: {
    onOK: (text: string) => void;
    onClose: () => void
  }) {
    const [text, setText] = useState("");

    return (
      <Modal
        title={Locale.VideoChat.Function.EditImage}
        onClose={props.onClose}
        hideMax={false}
        actions={
          [
            <IconButton
              text={Locale.Common.Cancel}
              icon={<StopOutlined />}
              key="cancel"
              onClick={() => {
                props.onClose();
              }}
            />,
            <IconButton
              type="primary"
              text={Locale.Common.Confirm}
              icon={<CheckOutlined />}
              key="ok"
              onClick={() => {
                props.onOK(text);
              }}
            />,
          ]
        }
      >
        <div className={styles["custom-prompt"]}>
          <div className={styles["custom-title"]}>{Locale.VideoChat.Function.EditImageDesc}</div>

          <TextArea
            showCount={true}
            minLength={10}
            maxLength={200}
            className={styles["custom-text"]}
            placeholder={Locale.VideoChat.Function.EditImageDemo}
            rows={5}
            value={text}
            onInput={(e) => {

              setText(e.currentTarget.value)

            }}
          />
        </div>

      </Modal>
    );
  }

  function EMOModal(props: {
    onOK: (text: string) => void;
    onClose: () => void
  }) {
    const [text, setText] = useState("");

    return (
      <Modal
        title={Locale.VideoChat.Function.EMO}
        onClose={props.onClose}
        hideMax={false}
        actions={
          [
            <IconButton
              text={Locale.Common.Cancel}
              icon={<StopOutlined />}
              key="cancel"
              onClick={() => {
                props.onClose();
              }}
            />,
            <IconButton
              type="primary"
              text={Locale.Common.Confirm}
              icon={<CheckOutlined />}
              key="ok"
              onClick={() => {
                props.onOK(text);
              }}
            />,
          ]
        }
      >
        <div className={styles["custom-prompt"]}>
          <div className={styles["custom-desc"]}>{Locale.VideoChat.Function.EMODesc}</div>
          <div className={styles["custom-title"]}>{Locale.VideoChat.Function.EMOTitle}</div>

          <TextArea
            showCount={true}
            minLength={10}
            maxLength={50}
            className={styles["custom-text"]}
            rows={5}
            value={text}
            onInput={(e) => {
              setText(e.currentTarget.value)
            }}
          />

        </div>

      </Modal>
    );
  }

  function DigitalHumanModal(props: {
    onOK: (text: string) => void;
    onClose: () => void
  }) {
    const [text, setText] = useState("");

    return (
      <Modal
        title={Locale.VideoChat.Function.DigitalHuman}
        onClose={props.onClose}
        hideMax={false}
        actions={
          [
            <IconButton
              text={Locale.Common.Cancel}
              icon={<StopOutlined />}
              key="cancel"
              onClick={() => {
                props.onClose();
              }}
            />,
            <IconButton
              type="primary"
              text={Locale.Common.Confirm}
              icon={<CheckOutlined />}
              key="ok"
              onClick={() => {
                props.onOK(text);
              }}
            />,
          ]
        }
      >
        <div className={styles["custom-prompt"]}>
          <div className={styles["custom-desc"]}>{Locale.VideoChat.Function.DigitalHumanDesc}</div>
          <div className={styles["custom-title"]}>{Locale.VideoChat.Function.DigitalHumanTitle}</div>

          <TextArea
            showCount={true}
            minLength={10}
            maxLength={50}
            className={styles["custom-text"]}
            rows={5}
            value={text}
            onInput={(e) => {

              setText(e.currentTarget.value)

            }}
          />

        </div>

      </Modal>
    );
  }

  function P2VModal(props: {
    onOK: (text: string, prompt: string) => void;
    onClose: () => void
  }) {
    const [text, setText] = useState("");
    const [prompt, setPrompt] = useState("");

    return (
      <Modal
        title={Locale.VideoChat.Function.P2V}
        onClose={props.onClose}
        hideMax={false}
        actions={
          [
            <IconButton
              text={Locale.Common.Cancel}
              icon={<StopOutlined />}
              key="cancel"
              onClick={() => {
                props.onClose();
              }}
            />,
            <IconButton
              type="primary"
              text={Locale.Common.Confirm}
              icon={<CheckOutlined />}
              key="ok"
              onClick={() => {
                props.onOK(text, prompt);
              }}
            />,
          ]
        }
      >
        <div className={styles["custom-prompt"]}>
          <div className={styles["custom-desc"]}>{Locale.VideoChat.Function.P2VDesc}</div>
          <div className={styles["custom-title"]}>{Locale.VideoChat.Function.P2VTitle}</div>

          <TextArea
            showCount={true}
            minLength={10}
            maxLength={50}
            className={styles["custom-text"]}
            rows={3}
            value={text}
            onInput={(e) => {
              setText(e.currentTarget.value)
            }}
          />

          <div className={styles["custom-title"]}>
            {Locale.VideoChat.Function.P2VPrompt}
          </div>

          <TextArea
            showCount={true}
            minLength={10}
            maxLength={200}
            className={styles["custom-text"]}
            rows={3}
            value={prompt}
            onInput={(e) => {
              setPrompt(e.currentTarget.value)
            }}
          />

        </div>

      </Modal>
    );
  }

  function ChangeActorModal(props: {
    onOK: (video: string, text: string) => void;
    onClose: () => void
  }) {
    const [video, setVideo] = useState("");
    const [text, setText] = useState("");
    const [prompt, setPrompt] = useState("");
    //初始化图片
    const defaultFiles: UploadFile[] = [];

    const uploadCompleted = async (files: UploadFile[]) => {

      if (files.length == 0) return false;

      setVideo(files[0].url || "");
    };

    return (
      <Modal
        title={Locale.VideoChat.Function.ChangeActor}
        onClose={props.onClose}
        hideMax={false}
        actions={
          [
            <IconButton
              text={Locale.Common.Cancel}
              icon={<StopOutlined />}
              key="cancel"
              onClick={() => {
                props.onClose();
              }}
            />,
            <IconButton
              type="primary"
              text={Locale.Common.Confirm}
              icon={<CheckOutlined />}
              key="ok"
              onClick={() => {
                if (!video || video.length <= 0) return;
                props.onOK(video, text);
              }}
            />,
          ]
        }
      >
        <div className={styles["custom-prompt"]}>
          <div className={styles["custom-desc"]}>
            {Locale.VideoChat.Function.ChangeActorDesc}
          </div>

          <FileUpload
            useOSS={true}
            defaultFiles={defaultFiles}
            onComplete={uploadCompleted}
            format={UploadFormat.Video}
            display="picture-card"
            maxSize={20 * 1000}
            maxCount={1}
            aspect={3 / 4}
          />
          {/* <div className={styles["custom-title"]}>
            {Locale.VideoChat.Function.ChangeActorPrompt}
          </div>
          <TextArea
            className={styles["custom-text"]}
            type="text"
            rows={3}
            value={prompt}
            onInput={(e) => {
              setPrompt(e.currentTarget.value)
            }}
          /> */}

        </div>

      </Modal>
    );
  }

  // 定义视频大小为3:4
  const [visualWidth, setVisualWidth] = useState(300);
  const visualPanel = useRef<HTMLDivElement>(null);
  // const isMobileScreen = useMobileScreen();

  useEffect(() => {
    //初始化页面:
    //1. 重置可视区域大小
    setVisualWidth((visualPanel.current as any)?.clientHeight * 0.75);

    //2. 打开通道
    socket.open(socketEndpoint);

    //3. 加载补偿视频
    OpenAPI.userGetEMO()
      .then((result) => {
        if (result.success && result.result) {
          setFixVideos(result.result);
          sys.log.info("加载补偿视频>>>:", result.result);
        }
      });

    return () => {
      sys.log.info("释放资源...");
      clearInterval(timer.current);
      timer.current = undefined;
      socket.close();
    };
  }, []);

  return (
    <>
      <div className={styles["video-page"]}>
        <div className={styles["video-area"]}>

          <div ref={visualPanel} className={clsx(styles["visual-panel"])}>

            {!videoUrl &&
              appSetting.videoConfig.picture &&
              <img alt="" className={styles["pic"]} style={{ width: visualWidth }}
                src={pictureUrl} />
            }

            {!appSetting.videoConfig.picture && <>
              <div>{Locale.VideoChat.Error.NoPic}</div>
              <Button
                type="primary"
                onClick={() => {
                  navigate(Path.Setting)
                }}
              >
                {Locale.Common.Setting}
              </Button>
            </>
            }

            {videoUrl &&
              <video ref={video} src={videoUrl}
                onCanPlay={videoCanPlay}
                onError={videoPlayError}
                onEnded={videoPlayEnded}
                className={clsx(styles["video"])}
                style={{ width: visualWidth }}
              >
              </video>
            }

            <div className={styles["download-panel"]} style={{ width: visualWidth }}>
              {/* <IconButton
                className={styles["icon"]}
                shadow bordered
                icon={<ReloadOutlined />}
                onClick={() => {
                  if (videoUrl)
                    playVideo();
                  else
                    setPictureUrl(appSetting.videoConfig.picture);
                }}
              /> */}

              <IconButton
                className={styles["icon"]}
                disabled={processing || processStatus != "init"}
                shadow bordered
                icon={<UploadOutlined />}
                onClick={async () => {
                  await uploadFile();
                }}
              />

              <a href={videoUrl || pictureUrl} target="_blank">

                <IconButton
                  className={styles["icon"]}
                  shadow bordered
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    if (pictureIndex < (pictureHistory.length - 1) && !videoUrl) {
                      setPictureIndex(pictureIndex + 1);
                      setPictureUrl(pictureHistory[pictureIndex + 1]);
                    }
                  }}
                /></a>


              <IconButton
                className={styles["icon"]}
                shadow bordered
                icon={<LeftOutlined />}
                onClick={() => {
                  if (pictureIndex > 0 && !videoUrl) {
                    setPictureIndex(pictureIndex - 1);
                    setPictureUrl(pictureHistory[pictureIndex - 1]);
                  }
                }}
              />

              <IconButton
                className={styles["icon"]}
                shadow bordered
                icon={<RightOutlined />}
                onClick={() => {
                  if (pictureIndex < (pictureHistory.length - 1) && !videoUrl) {
                    setPictureIndex(pictureIndex + 1);
                    setPictureUrl(pictureHistory[pictureIndex + 1]);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles["flag-panel"]}>
          {processing && <Loading noLogo />}
        </div>

        <div className={styles["function-panel"]}>

          <Space>
            <IconButton
              className={styles["function-button"]}
              iconClassName={styles["function-icon"]}
              shadow bordered
              disabled={processing || processStatus != "init"}
              text={Locale.VideoChat.Function.ChangeSkin}
              onClick={() => {
                editPicture("ChangeSkin");
              }}
            />

            <IconButton
              className={styles["function-button"]}
              iconClassName={styles["function-icon"]}
              shadow bordered
              disabled={processing || processStatus != "init"}
              text={Locale.VideoChat.Function.ChangeBG}
              onClick={() => {
                editPicture("ChangeBG");
              }}
            />

            <IconButton
              className={styles["function-button"]}
              iconClassName={styles["function-icon"]}
              shadow bordered
              disabled={processing || processStatus != "init"}
              text={Locale.VideoChat.Function.EditImage}
              onClick={() => {
                setShowEditPictureModal(true);
              }}
            />

            {/* <Divider vertical className={styles["function-divider"]} /> */}
            <IconButton
              className={styles["function-button"]}
              iconClassName={styles["function-icon"]}
              shadow bordered
              disabled={processing || processStatus != "init"}
              text={Locale.VideoChat.Function.P2V}
              onClick={() => {
                setShowP2VModal(true);
              }}
            />

            <IconButton
              className={styles["function-button"]}
              iconClassName={styles["function-icon"]}
              shadow bordered
              disabled={processing || processStatus != "init"}
              text={Locale.VideoChat.Function.EMO}
              onClick={() => {
                setShowEMOModal(true);
              }}
            />

            <IconButton
              className={styles["function-button"]}
              iconClassName={styles["function-icon"]}
              shadow bordered
              disabled={processing || processStatus != "init"}
              text={Locale.VideoChat.Function.DigitalHuman}
              onClick={() => {
                setShowDigitalHumanModal(true);
              }}
            />

            <IconButton
              className={styles["function-button"]}
              iconClassName={styles["function-icon"]}
              shadow bordered
              disabled={processing || processStatus != "init"}
              text={Locale.VideoChat.Function.ChangeActor}
              onClick={() => {
                setShowChangeActorModal(true);
              }}
            />
          </Space>
        </div>

        <div className={styles["video-action-panel"]}>
          <div className={styles["video-action"]}>

            {processStatus == "readyspeak" &&
              <IconButton
                className={styles["video-action-start"]}
                iconClassName={styles["video-action-icon"]}
                shadow bordered
                disabled={processStatus != "readyspeak"}
                icon={<OpenRecordIcon />}
                onClick={() => {
                  setProcessing(true);
                  setProcessStatus("speaking");
                  sts.startSpeech((success, text) => {
                    if (!success) {
                      sys.msg.error(Locale.VideoChat.Error.CannotSpeak);
                      setProcessStatus("readyspeak");
                    }
                  });
                }}></IconButton>
            }

            {(processStatus == "speaking" || processStatus == "processing") &&
              <IconButton
                className={styles["video-action-cancel"]}
                iconClassName={styles["video-action-icon"]}
                shadow bordered
                disabled={processStatus != "speaking"}
                icon={<CancelRecordIcon />}
                onClick={() => {
                  sts.cancelSpeech();
                  setProcessing(false);
                  setProcessStatus("readyspeak");
                }}></IconButton>
            }

            {(processStatus == "speaking" || processStatus == "processing") &&
              <IconButton
                className={styles["video-action-send"]}
                iconClassName={styles["video-action-icon"]}
                shadow bordered
                disabled={processStatus != "speaking"}
                icon={<SendIcon />}
                onClick={() => {
                  currentTag.current = "digital-human";
                  setProcessing(true);
                  setProcessStatus("processing");

                  sts.speech2OSS((success, result) => {
                    if (!success) {
                      setProcessing(false);
                      setProcessStatus("readyspeak");
                      sys.msg.error(Locale.VideoChat.Error.Common);
                      return;
                    }

                    const stsPayload = { ...appSetting.voiceConfig, audio: result };
                    const videoPayload = { pictures: [{ ...appSetting.videoConfig, picture: pictureUrl }], audio: result };

                    //视频通话
                    socket.send(socketDataType, { tag: "digital-human", taskId: "", isChat: true, stsSetting: stsPayload, videoSetting: videoPayload });
                  });
                }}></IconButton>
            }

            {processStatus != "init" &&
              <IconButton
                className={styles["video-action-hangup"]}
                iconClassName={styles["video-action-icon"]}
                shadow bordered
                disabled={processStatus == "processing"}
                icon={<HangupIcon />}
                onClick={() => {
                  // 释放资源

                  audio.current.pause();
                  sts.cancelSpeech();

                  socket.close();

                  stopVideo();
                  setProcessing(false);
                  setProcessStatus("init");
                  setVideoUrl("");
                }}></IconButton>
            }

            {processStatus == "init" && <>
              <div></div>
              <IconButton
                className={styles["video-action-call"]}
                iconClassName={styles["video-action-icon"]}
                shadow bordered
                icon={<CallIcon />}
                disabled={processing}
                onClick={() => {
                  //TODO
                  //更好的体验：由图片变成静态打招呼视频（在设置中上传图片，并生成默认的打招呼视频）

                  if (!appSetting.videoConfig.picture) {
                    sys.msg.info(Locale.VideoChat.Error.NoPic);
                    return;
                  }

                  playFixVideo(EMOVideo.HelloVideoName);

                  // socket.open(socketEndpoint);
                  setProcessing(false);
                  setProcessStatus("readyspeak");
                }}></IconButton>
              <div></div>
            </>
            }
          </div>
        </div>
      </div>

      {showEditPictureModal && (
        <EditPictureModal
          onOK={(text) => {
            if (text) {
              onEditPicture(text);
              setShowEditPictureModal(false);
            }

          }}
          onClose={() => {
            setShowEditPictureModal(false);
          }}
        />
      )}

      {showDigitalHumanModal && (
        <DigitalHumanModal
          onOK={(text) => {
            if (text && text.length >= 10) {
              currentTag.current = "digital-human";
              setProcessing(true);

              const stsPayload = { ...appSetting.voiceConfig, text: text };
              const videoPayload = { pictures: [{ ...appSetting.videoConfig, picture: pictureUrl }] };

              //视频通话
              socket.send(socketDataType, { tag: currentTag.current, taskId: "", isChat: false, stsSetting: stsPayload, videoSetting: videoPayload });

              setShowDigitalHumanModal(false);
            }

          }}
          onClose={() => {
            setShowDigitalHumanModal(false);
          }}
        />
      )}

      {showEMOModal && (
        <EMOModal
          onOK={(text) => {
            if (text && text.length >= 10) {
              currentTag.current = "emo";
              setProcessing(true);

              const stsPayload = { ...appSetting.voiceConfig, text: text };
              const videoPayload = { pictures: [{ ...appSetting.videoConfig, picture: pictureUrl }] };

              //视频通话
              socket.send(socketDataType, { tag: currentTag.current, taskId: "", isChat: false, stsSetting: stsPayload, videoSetting: videoPayload });

              setShowEMOModal(false);
            }

          }}
          onClose={() => {
            setShowEMOModal(false);
          }}
        />
      )}

      {showP2VModal && (
        <P2VModal
          onOK={async (text, prompt) => {
            if (await showConfirm(
              Locale.Common.Confirm,
              Locale.VideoChat.Function.P2VConfirm,
              false) === false) {
              return;
            }

            currentTag.current = "p2v";
            setProcessing(true);

            const stsPayload = { ...appSetting.voiceConfig, text: text };
            const videoPayload = { pictures: [{ ...appSetting.videoConfig, picture: pictureUrl, prompt: prompt }] };

            //视频通话
            socket.send(socketDataType, { tag: currentTag.current, taskId: "", isChat: false, stsSetting: stsPayload, videoSetting: videoPayload });

            setShowP2VModal(false);
          }}
          onClose={() => {
            setShowP2VModal(false);
          }}
        />
      )}

      {showChangeActorModal && (
        <ChangeActorModal
          onOK={async (video, text) => {
            if (await showConfirm(
              Locale.Common.Confirm,
              Locale.VideoChat.Function.P2VConfirm,
              false) === false) {
              return;
            }

            currentTag.current = "changeactor";
            setProcessing(true);

            const stsPayload = { ...appSetting.voiceConfig, text: text };
            const videoPayload = { pictures: [{ ...appSetting.videoConfig, picture: pictureUrl, prompt: prompt }], video: video };

            //视频通话
            socket.send(socketDataType, { tag: currentTag.current, taskId: "", isChat: false, stsSetting: stsPayload, videoSetting: videoPayload });

            setShowChangeActorModal(false);
          }}
          onClose={() => {
            setShowChangeActorModal(false);
          }}
        />
      )}
    </>
  );
}


export default function VideoChat() {
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

  return <VideoPage></VideoPage>
}