import styles from "./mv.module.scss";
import {
  TextArea,
  List,
  ListItem, FileUpload,
  Input,
  IconButton,
  Modal, showConfirm, DynamicList
} from "../../components/ui-lib";
import Locale from "../../locales";
import { useState, useEffect } from "react";
import clsx from "clsx";
import BlankImage from "../../icons/blank.png";

import { useUserState } from "../../store/user";
import {
  MainTask,
  VideoTask,
  DefaultVideoTask,
  DefaultMainTask,
  DefaultAudioTask,
  AudioTask,
  TaskStatus
} from "./types";
import { Image, UploadFile, message } from "antd";
import { SettingOutlined, CloseOutlined, SaveOutlined, EditOutlined, DoubleRightOutlined } from "@ant-design/icons";
import P2VList, { EditFlag } from "./list";
import { FILEVIEW_URL, OpenAPI } from "@/app/openapi";
import { useMobileScreen } from "@/app/utils";
import { useNavigate } from "react-router-dom";
import touch from "@/app/utils/touch";
import { Path } from "@/app/constant";
import { UploadFormat } from "@/app/utils/file";
import { DefaultP2VConfig, P2VConfig } from "@/app/types";
import { P2VConfigModal } from "../config/p2v-config";
import { sys } from "@/app/utils/sys";
import { useAppConfig } from "@/app/store";

type Shot = {
  id: string,
  updated: boolean,
  video: VideoTask,
  audio: AudioTask
}

function ShotInfo(shot: Shot, index: number, isMobileScreen: boolean) {

  return <ListItem vertical={true}>
    <div className={clsx(styles["p2v-shot-summary"])}>
      <div className={styles["p2v-shot-image"]}>
        {shot.video.picture ?
          <Image alt="" src={shot.video.picture} />
          :
          <Image alt="" src={BlankImage.src} />
        }
      </div>

      {
        shot.video.extraPicture && <>
          <DoubleRightOutlined style={{ margin: "0 10px", opacity: 0.3 }} />
          <div className={styles["p2v-shot-image"]}>
            <Image alt="" src={shot.video.extraPicture} />
          </div>
        </>
      }

      {!isMobileScreen &&
        <div className={styles["p2v-shot-duration"]}>
          {"时长 " + shot.video.duration + " 秒"}
        </div>
      }

    </div>
  </ListItem>;
}

function newShot(index: number) {
  return {
    id: crypto.randomUUID(),
    updated: true,
    video: { ...DefaultVideoTask, id: crypto.randomUUID(), picture: "" },
    audio: { ...DefaultAudioTask, id: crypto.randomUUID(), text: "" }
  };
}

function P2VShotEditor(props: Readonly<{
  shot: Shot;
  onOK: (data: Shot) => void;
  onClose: () => void
}>) {
  const user = useUserState();
  const isMobileScreen = useMobileScreen();
  const [data, setData] = useState(props.shot);

  //初始化图片
  let startImages: UploadFile[] = [];
  let endImages: UploadFile[] = [];
  if (data.video.picture) {
    let pictureUrl = data.video.picture;
    if (!pictureUrl.startsWith("http://") && !pictureUrl.startsWith("https://")) {
      pictureUrl = FILEVIEW_URL +
        "/" +
        pictureUrl +
        "?token=" +
        user.accessToken;
    }

    startImages = [
      {
        uid: data.video.id,
        name: data.video.id,
        status: "done",
        url: pictureUrl,
        thumbUrl: pictureUrl
      } as UploadFile,
    ];
  }
  if (data.video.extraPicture) {
    let pictureUrl = data.video.extraPicture;
    if (!pictureUrl.startsWith("http://") && !pictureUrl.startsWith("https://")) {
      pictureUrl = FILEVIEW_URL +
        "/" +
        pictureUrl +
        "?token=" +
        user.accessToken;
    }

    endImages = [
      {
        uid: data.video.id,
        name: data.video.id,
        status: "done",
        url: pictureUrl,
        thumbUrl: pictureUrl
      } as UploadFile,
    ];
  }

  const startImageUploadCompleted = (files: UploadFile[]) => {
    const newData = { ...data };
    newData.updated = true;
    newData.video.picture = "";

    if (files.length > 0) {
      newData.video.picture = files[0].url ? files[0].url : files[0].response?.result;
    }

    setData(newData);

    return true;
  };

  const endImageUploadCompleted = (files: UploadFile[]) => {
    const newData = { ...data };
    newData.updated = true;
    newData.video.extraPicture = "";

    if (files.length > 0) {
      newData.video.extraPicture = files[0].url ? files[0].url : files[0].response?.result;
    }

    setData(newData);

    return true;
  };

  return (
    <Modal
      title={Locale.P2V.Editor.EditShot}
      onClose={() => { props.onClose() }}
      actions={[
        <IconButton
          icon={<CloseOutlined />}
          text={Locale.Common.Close}
          key="close"
          bordered
          onClick={() => { props.onClose() }}
        />,
        <IconButton
          icon={<SaveOutlined />}
          text={Locale.Common.Save}
          key="save"
          type="primary"
          bordered
          onClick={() => {
            props.onOK(data);
          }}
        />]}
    >
      <List>

        <ListItem
          title={Locale.P2V.Editor.Picture}
          desc={Locale.P2V.Editor.PictureDesc}
          vertical={isMobileScreen}
        >
          <FileUpload
            useOSS={true}
            defaultFiles={startImages}
            onComplete={startImageUploadCompleted}
            format={UploadFormat.Image}
            display="picture-card"
            maxSize={5 * 1024}
            maxCount={1}
          />

          <DoubleRightOutlined style={{ margin: "0 20px", opacity: 0.5 }} />

          <FileUpload
            useOSS={true}
            defaultFiles={endImages}
            onComplete={endImageUploadCompleted}
            format={UploadFormat.Image}
            display="picture-card"
            maxSize={5 * 1024}
            maxCount={1}
          />
        </ListItem>


        <ListItem
          title={Locale.P2V.Editor.AudioText}
          desc={Locale.P2V.Editor.AudioTextDesc}
          vertical={true}
        >
          <TextArea
            showCount
            maxLength={50}
            rows={2}
            value={data.audio.text}
            onInput={(e) => {
              const newData = { ...data };
              newData.audio.text = e.currentTarget.value;
              newData.updated = true;
              setData(newData);
            }}
          />
        </ListItem>
        <ListItem
          title={Locale.P2V.Editor.Prompt}
          desc={Locale.P2V.Editor.PromptDesc}
          vertical={true}
        >
          <TextArea
            showCount
            maxLength={200}
            rows={2}
            value={data.video.taskPrompt}
            onInput={(e) => {
              const newData = { ...data };
              newData.video.taskPrompt = e.currentTarget.value;
              newData.updated = true;
              setData(newData);
            }}
          />
        </ListItem>
      </List>
    </Modal>
  );
}

function P2VEditor(props: Readonly<{
  data: MainTask;
  editFlag?: EditFlag;
  onOK: (task: MainTask) => void;
  onClose: () => void;
}>) {
  const appConfig = useAppConfig();
  const [editData, setEditData] = useState(props.data);
  const [shotData, setShotData] = useState<Shot[]>(
    props.data.videos.map((v, i) => (
      {
        id: v.id,
        video: v,
        updated: false,
        audio: props.data.audios[i] || DefaultAudioTask,
      } as Shot
    ))
  );
  const [shareSetting, setShareSetting] = useState<P2VConfig>({
    ...DefaultP2VConfig,
    ...appConfig.voiceConfig
  });

  const [showP2VConfigModal, setShowP2VConfigModal] = useState<boolean>(false);
  const [showP2VEditorModal, setShowP2VEditorModal] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState(-1);

  const editShot = (shot: Shot) => {

    if (!shot.video.picture)
      return false;

    const newData = [...shotData];

    newData[editIndex] = shot;

    setShotData(newData);

    return true;
  };

  const editConfig = (newConfig: P2VConfig) => {
    const newData = [...shotData];

    if (editIndex < 0) {
      newData.forEach((shot, index) => {
        shot.video.duration = newConfig.duration;
        shot.video.size = newConfig.size;
        shot.video.fps = newConfig.fps;
        shot.video.quality = newConfig.quality;

        shot.audio.voice = newConfig.voice;
        shot.audio.speed = newConfig.speed;
        shot.audio.intonation = newConfig.intonation;
        shot.audio.volume = newConfig.volume;
      });

      setShareSetting({
        ...shareSetting,
        ...newConfig,
      });
    }
    else {
      newData[editIndex].video.duration = newConfig.duration;
      newData[editIndex].video.size = newConfig.size;
      newData[editIndex].video.fps = newConfig.fps;
      newData[editIndex].video.quality = newConfig.quality;

      newData[editIndex].audio.voice = newConfig.voice;
      newData[editIndex].audio.speed = newConfig.speed;
      newData[editIndex].audio.intonation = newConfig.intonation;
      newData[editIndex].audio.volume = newConfig.volume;
    }

    setShotData(newData);
  };

  function RenderShotAction(shot: Shot, index: number) {
    return [<IconButton
      key={"edit-" + shot.id + index}
      className={styles["p2v-shot-action"]}
      icon={<EditOutlined />}
      onClick={() => {
        setEditIndex(index);
        setShowP2VEditorModal(true);
      }} />,

    <IconButton
      key={"setting-" + shot.id + index}
      className={styles["p2v-shot-action"]}
      icon={<SettingOutlined />}
      onClick={() => {
        setEditIndex(index);
        setShareSetting({
          ...shareSetting,
          ...editData.audios[index],
          ...editData.videos[index]
        });
        setShowP2VConfigModal(true);
      }} />];
  }

  async function deleteShot(shot: Shot, index: number) {
    if (!shot.video.picture || !shot.audio.text)
      return true;

    return showConfirm(
      Locale.Common.Delete,
      Locale.Common.DeleteConfirm,
      false
    );
  }

  function shotChanged(shots: Shot[]) {
    shots.forEach((v, index) => {
      v.video.taskIndex = index;
      v.audio.taskIndex = index;
    });

    setShotData(shots);
  }

  function onOK() {
    let videos: VideoTask[] = [];
    let audios: AudioTask[] = [];
    let updated = false;

    shotData.forEach((v, index) => {
      if (v.updated) updated = true;
      videos.push({ ...v.video, taskIndex: index });
      if (v.audio?.text)
        audios.push({ ...v.audio, taskIndex: index });
    });

    const data = {
      ...editData,
      videos: videos,
      audios: audios
    };

    //根据编辑类型初始化编辑数据
    if (props.editFlag == "redo") {
      data.videos.forEach((v, i) => {
        v.taskStatus = TaskStatus.TaskInQueue;
      });
      data.audios.forEach((a, i) => {
        a.taskStatus = TaskStatus.TaskInQueue;
      });
    }

    props.onOK(data);
  }

  const isMobileScreen = useMobileScreen();

  return (
    <Modal
      title={Locale.P2V.Editor.EditShot}
      defaultMax={true}
      onClose={() => { props.onClose() }}
      actions={[
        <IconButton
          icon={<CloseOutlined />}
          text={Locale.Common.Close}
          key="close"
          bordered
          onClick={() => { props.onClose() }}
        />,
        <IconButton
          icon={<SaveOutlined />}
          text={Locale.Common.Save}
          key="save"
          type="primary"
          bordered
          onClick={() => {
            onOK();
          }}
        />]}
    >
      <div className={styles["p2v-mv-page"]}>
        {props.editFlag != "redo" &&
          <List>

            <ListItem title={Locale.P2V.Editor.TaskName}>
              <Input
                showCount
                maxLength={20}
                aria-label={Locale.P2V.Editor.TaskName}
                type="text"
                value={editData.taskName}
                onInput={(e) => {
                  setEditData({
                    ...editData,
                    taskName: e.currentTarget.value as any,
                  });
                }}
              ></Input>
            </ListItem>

            {/* <ListItem title={Locale.P2V.Editor.TaskDesc}
            vertical={isMobileScreen}>
            <Input
              aria-label={Locale.P2V.Editor.TaskDesc}
              type="text"
              value={editData.taskDesc}
              onInput={(e) => {
                setEditData({
                  ...editData,
                  taskDesc: e.currentTarget.value as any,
                });
              }}
            ></Input>
          </ListItem> */}

          </List>
        }

        <DynamicList
          enableAnD={true}
          // bigIcon={true}
          // vertical={true}
          defaultData={shotData}
          onDataChanged={(data) => shotChanged(data)}
          onItemDeleting={(item, index) => { return deleteShot(item, index) }}
          onRenderItem={(item, index) => ShotInfo(item, index, isMobileScreen)}
          onNewItem={(index) => newShot(index)}
          onRenderItemActions={(item, index) => (RenderShotAction(item, index))}
          enableFold={false}
          title={Locale.P2V.Editor.SelectPicture}
          actions={[
            <SettingOutlined key="setting"
              onClick={() => {
                setShareSetting({
                  ...DefaultP2VConfig,
                  ...appConfig.voiceConfig
                });
                setEditIndex(-1);
                setShowP2VConfigModal(true);
              }}
            />
          ]}
        />

        {showP2VConfigModal &&
          <P2VConfigModal
            defaultConfig={shareSetting}
            onClose={
              () => {
                setShowP2VConfigModal(false)
              }
            }
            onOK={
              (newConfig) => {
                editConfig(newConfig);
                setShowP2VConfigModal(false)
              }
            }
          />
        }

        {showP2VEditorModal &&
          <P2VShotEditor
            shot={shotData[editIndex]}
            onClose={() => { setShowP2VEditorModal(false) }}
            onOK={
              (data) => {
                if (editShot(data))
                  setShowP2VEditorModal(false);
              }
            }
          />
        }
      </div>
    </Modal>
  );
}

function MVPage() {
  const defaultData = { ...DefaultMainTask };
  defaultData.videos = [];
  defaultData.audios = [];
  defaultData.taskCategory = 0;

  const [editData, setEditData] = useState<MainTask>(defaultData);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editFlag, setEditFlag] = useState<EditFlag>("edit");
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());

  const onSave = async (task: MainTask) => {

    if (!task || task.videos.length <= 0) {
      message.error(Locale.P2V.Validate.InvalidSetting);
      return;
    }

    if (
      !task.taskName ||
      task.taskName.length <= 0 ||
      task.taskName.length > 20
    ) {
      message.error(Locale.P2V.Validate.InvalidName);
      return;
    }

    for (const video of task.videos) {
      if (!video.picture) {
        sys.msg.error(Locale.P2V.Validate.InvalidSetting);
        return;
      }
    }

    const result = await OpenAPI.aiTaskSaveTask(task);

    if (!result.success) {
      sys.msg.error(result.message);
    }

    return result.success;
  };

  return (
    <>
      <P2VList
        category={0}
        refreshTimestamp={refreshTimestamp}
        onEditData={(task, editFlag) => {
          setEditData(task);
          setShowEditModal(true);
          setEditFlag(editFlag);
        }}
      />

      {showEditModal &&
        <P2VEditor
          data={editData}
          editFlag={editFlag}
          onClose={() => { setShowEditModal(false); }}
          onOK={async (task) => {
            if (await onSave(task)) {
              setShowEditModal(false);
              setRefreshTimestamp(Date.now());
            }
          }}
        />
      }
    </>
  );
}

export function MV() {
  const navigate = useNavigate();

  useEffect(() => {
    const leftKey = touch.addSlideLeftFunc(() => {
      navigate(Path.CBC);
    });
    const rightKey = touch.addSlideRightFunc(() => {
      navigate(Path.DH);
    });

    return () => {
      touch.removeSlideLeftFunc(leftKey);
      touch.removeSlideRightFunc(rightKey);
    };
  }, []);

  return <MVPage></MVPage>
}
