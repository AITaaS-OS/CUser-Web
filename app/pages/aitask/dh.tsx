import styles from "./dh.module.scss";
import {
  TextArea,
  List,
  ListItem, FileUpload,
  Input,
  Modal,
  IconButton,
} from "../../components/ui-lib";
import Locale from "../../locales";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

import { useUserState } from "../../store/user";
import {
  MainTask,
  VideoTask,
  DefaultVideoTask,
  DefaultMainTask,
  DefaultAudioTask
} from "./types";
import { UploadFile, message, Button, Steps, Space } from "antd";

import { Markdown } from "../../components/markdown";
import { usePromptStore } from "../../store/prompt";
import { useDebouncedCallback } from "use-debounce";
import P2VList from "./list";
import { sys } from "../../utils/sys";
import { useAppConfig } from "../../store";
import { FILEVIEW_URL, OpenAPI } from "@/app/openapi";
import { DefaultP2VConfig, P2VConfig, Prompt } from "@/app/types";
import { useMobileScreen } from "@/app/utils";
import { useNavigate } from "react-router-dom";
import touch from "@/app/utils/touch";
import { Path } from "@/app/constant";
import { UploadFormat } from "@/app/utils/file";
import { CheckOutlined, CloseOutlined, SaveOutlined, SettingOutlined } from "@ant-design/icons";
import { P2VConfigModal } from "../config/p2v-config";

type RenderPrompt = Pick<Prompt, "name" | "content">;

function PromptHints(props: {
  prompts: RenderPrompt[];
  onPromptSelect: (prompt: RenderPrompt) => void;
}) {
  const noPrompts = props.prompts.length === 0;
  const [selectIndex, setSelectIndex] = useState(0);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectIndex(0);
  }, [props.prompts.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (noPrompts || e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      // arrow up / down to select prompt
      const changeIndex = (delta: number) => {
        e.stopPropagation();
        e.preventDefault();
        const nextIndex = Math.max(
          0,
          Math.min(props.prompts.length - 1, selectIndex + delta),
        );
        setSelectIndex(nextIndex);
        selectedRef.current?.scrollIntoView({
          block: "center",
        });
      };

      if (e.key === "ArrowUp") {
        changeIndex(1);
      } else if (e.key === "ArrowDown") {
        changeIndex(-1);
      } else if (e.key === "Enter") {
        const selectedPrompt = props.prompts.at(selectIndex);
        if (selectedPrompt) {
          props.onPromptSelect(selectedPrompt);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prompts.length, selectIndex]);

  if (noPrompts) return null;
  return (
    <div className={styles["prompt-hints"]}>
      {props.prompts.map((prompt, i) => (
        <div
          ref={i === selectIndex ? selectedRef : null}
          className={clsx(styles["prompt-hint"], {
            [styles["prompt-hint-selected"]]: i === selectIndex,
          })}
          key={prompt.name + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
          onMouseEnter={() => setSelectIndex(i)}
        >
          <div className={styles["hint-title"]}>{prompt.name}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function EditTextModal(props: Readonly<{
  text: string,
  onOk: (text: string) => void;
  onClose: () => void
}>) {
  const [content, setContent] = useState(props.text);

  return <Modal
    title={Locale.P2V.Editor.EditText}
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
        icon={<CheckOutlined />}
        text={Locale.Common.Save}
        key="save"
        type="primary"
        bordered
        onClick={() => {
          props.onOk(content);
        }}
      />]}
  >
    <div className={styles["p2v-dh-edit-text"]}>
      <TextArea
        aria-label={Locale.P2V.Editor.TaskText}
        autoSize={false}
        value={content}
        onInput={(e) => {
          setContent(e.currentTarget.value);
        }} />
    </div>
  </Modal>
}

function P2VEditor(props: {
  data: MainTask;
  onOK: (task: MainTask) => void;
  onClose: () => void;
}) {
  const user = useUserState();
  const appConfig = useAppConfig();
  const [editData, setEditData] = useState(props.data);
  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<RenderPrompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      promptStore.search(text).then((matchedPrompts) => {
        setPromptHints(matchedPrompts || []);
      });
    },
    100,
    { leading: true, trailing: true },
  );

  const defaultVideoSetting: P2VConfig = {
    ...DefaultP2VConfig,
    ...editData.audios[0],

    enableDuration: false,
    enableFPS: false,
    enableSize: false,
    enableQuality: false
  };

  //初始化图片
  let defaultFiles: UploadFile[] = [];
  if (editData.videos) {
    editData.videos.forEach((v, i) => {
      let pictureUrl = v.picture;
      if (v.picture && !v.picture.startsWith("http://") && !v.picture.startsWith("https://")) {
        pictureUrl = FILEVIEW_URL +
          "/" +
          v.picture +
          "?token=" +
          user.accessToken;
      }

      if (pictureUrl) {
        defaultFiles.push({
          uid: v.id,
          name: v.id,
          status: "done",
          thumbUrl: pictureUrl,
          url: pictureUrl,
        } as UploadFile);
      }
    });
  }

  const uploadCompleted = (files: UploadFile[]) => {
    let abc: VideoTask[] = [];
    files.forEach((file, index) => {
      abc.push({
        ...DefaultVideoTask,
        taskIndex: index,
        picture: file.url ? file.url : file.response?.result
      });
    });

    setEditData(
      {
        ...editData,
        videos: abc,
      });

    setCurrentStep(3);

    return true;
  };

  const [processing, setProcessing] = useState(false);

  const onPrompt2Txt = () => {

    if (
      !editData.taskPrompt ||
      editData.taskPrompt.length < 10 ||
      editData.taskPrompt.length > 2000
    ) {
      message.error(Locale.P2V.Validate.InvalidDesc);
      return;
    }

    setProcessing(true);

    OpenAPI.aiChat({
      role: "user",
      content: [
        { type: 'text', text: editData.taskPrompt }
      ]
    })
      .then((result) => {
        if (result.success && result.result) {
          if (editData.audios.length > 0) {
            setEditData({
              ...editData,
              audios: [{
                ...editData.audios[0],
                text: result.result,
              }]
            });
          }

          setCurrentStep(2);
        } else {
          sys.msg.error(result.message);
        }

        setProcessing(false);
      })
      .catch((e) => {
        message.error(e.message);
        setProcessing(false);
      });
  };

  const onPromptSelect = (prompt: RenderPrompt) => {
    setTimeout(() => {
      setPromptHints([]);
    }, 30);
  };

  const [showEditTextModal, setShowEditTextModal] = useState<boolean>(false);

  const [showP2VConfigModal, setShowP2VConfigModal] = useState<boolean>(false);

  const [currentStep, setCurrentStep] = useState(0);

  const isMobileScreen = useMobileScreen();

  return (
    <Modal
      title={Locale.P2V.Editor.EditTask}
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
            props.onOK(editData);
          }}
        />]}
    >
      <div className={styles["p2v-dh-page"]}>
        {editData.id == null || editData.id.length === 0 &&
          <Steps current={currentStep} size="small" responsive={false} direction="horizontal" items={[
            {
              title: '提示词',
            },
            {
              title: '生成文案',
            },
            {
              title: '上传素材',
            },
          ]}></Steps>}

        <List>
          <ListItem title={Locale.P2V.Editor.TaskName}>
            <Input
              showCount={true}
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
            />
          </ListItem>
        </List>

        <List title={Locale.P2V.Editor.TaskInfo} defaultFolded={false} enableFold={true}>

          <ListItem vertical={true} title={Locale.P2V.Editor.TaskPrompt}
            className={styles["task-prompt-list"]}>
            <TextArea
              showCount
              placeholder={Locale.P2V.Editor.TaskPromptPlaceholder}
              aria-label={Locale.P2V.Editor.TaskPrompt}
              rows={2}
              value={editData.taskPrompt}
              style={{ width: "100%", maxWidth: "unset", textAlign: "left", resize: "vertical" }}
              onInput={(e) => {
                const text = e.currentTarget.value;

                setEditData({
                  ...editData,
                  taskPrompt: text
                });

                const n = text.trim().length;

                // clear search results
                if (n === 0) {
                  setPromptHints([]);
                }
                else if (text.startsWith("/")) {
                  let searchText = text.slice(1);
                  onSearch(searchText);
                }

                setCurrentStep(1)

              }}
            ></TextArea>

          </ListItem>

          {/* 显示提示词 */}
          <PromptHints
            prompts={promptHints}
            onPromptSelect={onPromptSelect}
          />

          <ListItem className={styles["create-text-list"]} title=" ">
            <Space>
              <Button className={styles["create-text"]}
                disabled={processing}
                type="primary"
                onClick={onPrompt2Txt}>{Locale.P2V.Editor.CreateText}
              </Button>
              <Button className={styles["create-text"]}
                disabled={processing}
                onClick={() => { setShowEditTextModal(true) }}>
                {Locale.P2V.Editor.EditText}
              </Button>
            </Space>
          </ListItem>

          {
            showEditTextModal &&
            <EditTextModal
              text={editData.audios[0].text}
              onClose={() => { setShowEditTextModal(false) }}
              onOk={(text) => {
                setEditData({
                  ...editData,
                  audios: [{
                    ...editData.audios[0],
                    text: text
                  }]
                });
                setShowEditTextModal(false)
              }
              }
            />
          }

          <ListItem vertical={true} title=" ">
            <div className={styles["markdown-body-bg"]}>
              <Markdown
                fontSize={12}
                content={editData.audios[0]?.text ? editData.audios[0].text : "点击“生成文案”，如需修订点击“编辑文案”"}
                loading={processing}
                onDoubleClick={() => {
                  setShowEditTextModal(true)
                }}
              />
            </div>
          </ListItem>
        </List>

        <List title={Locale.P2V.Editor.TaskMaterial} enableFold={true} defaultFolded={false}
          actions={[
            <SettingOutlined key={1} onClick={() => { setShowP2VConfigModal(true) }} />
          ]}
        >
          <ListItem vertical={true}>
            <FileUpload
              useOSS={true}
              className={styles["dh-upload-image"]}
              iconClassName={styles["dh-upload-image-icon"]}
              imageClassName={styles["dh-upload-image-image"]}
              defaultFiles={defaultFiles}
              onComplete={uploadCompleted}
              format={UploadFormat.Image}
              display="picture-card"
              maxSize={5 * 1024}
              maxCount={5}
              aspect={9 / 16}
            />
          </ListItem>

        </List>

        {showP2VConfigModal &&
          <P2VConfigModal
            defaultConfig={defaultVideoSetting}
            onClose={
              () => { setShowP2VConfigModal(false) }
            }
            onOK={
              (newVideoSetting) => {
                setEditData({
                  ...editData,
                  audios: [{
                    ...editData.audios[0],
                    voice: newVideoSetting.voice,
                    speed: newVideoSetting.speed,
                    intonation: newVideoSetting.intonation,
                    volume: newVideoSetting.volume,
                  }]
                });
                setShowP2VConfigModal(false);
              }
            }
          />
        }
      </div >
    </Modal>
  );
}

function DHPage() {
  const defaultData = { ...DefaultMainTask };
  defaultData.audios = [{ ...DefaultAudioTask }];
  defaultData.taskCategory = 2;
  const [editData, setEditData] = useState<MainTask>(defaultData);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
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

    let haderror = false;
    task.videos.forEach((video, index) => {
      if (!video.picture) {
        haderror = true;
        return;
      }

      video.taskIndex = index;
    });

    task.audios.forEach((audio, index) => {
      if (!audio.text) {
        haderror = true;
        return;
      }

      audio.taskIndex = index;
    });

    if (haderror) {
      sys.msg.error(Locale.P2V.Validate.InvalidSetting);
      return;
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
        refreshTimestamp={refreshTimestamp}
        category={2}
        onEditData={(task, flag) => {
          setEditData(task);
          setShowEditModal(true);
        }} />

      {
        showEditModal &&
        <P2VEditor
          data={editData}
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

export function DH() {
  const navigate = useNavigate();

  useEffect(() => {
    const leftKey = touch.addSlideLeftFunc(() => {
      navigate(Path.MV);
    });
    const rightKey = touch.addSlideRightFunc(() => {
      navigate(Path.Video);
    });

    return () => {
      touch.removeSlideLeftFunc(leftKey);
      touch.removeSlideRightFunc(rightKey);
    };
  }, []);

  return <DHPage></DHPage>
}