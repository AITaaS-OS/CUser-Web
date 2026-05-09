/* eslint-disable @next/next/no-img-element */
import { useAppConfig, useChatStore } from "../../store";
//用户状态
import { useUserState } from "../../store/user";
import Locale from "../../locales";
import styles from "./exporter.module.scss";
import {
  IconButton,
  List,
  ListItem,
  Modal,
  Select,
  showImageModal,
  showToast,
} from "../../components/ui-lib";
import {
  copyToClipboard,
  downloadAs,
  getMessageFiles,
  useMobileScreen,
  getMessageTextContent
} from "../../utils";

import LoadingIcon from "../../icons/processing.svg";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSelector, useMessageSelector } from "./message-selector";
import { Avatar } from "../../components/emoji";
import dynamic from "next/dynamic";

import { toBlob, toPng } from "html-to-image";

import { EXPORT_MESSAGE_CLASS_NAME } from "../../constant";
import { getClientConfig } from "../../config/client";
import clsx from "clsx";
import { sys } from "../../utils/sys";
import moment from "moment";
import { Button, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { OpenAPI } from "@/app/openapi";
import { ChatMessage } from "@/app/types";
import { CopyOutlined, DownloadOutlined } from "@ant-design/icons";

const Markdown = dynamic(
  async () => (await import("../../components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);

export function ExportMessageModal(props: { onClose: () => void }) {
  return (
    <Modal title={Locale.Chat.ExportRecords.Title} onClose={props.onClose} defaultMax={true}>
      <div className={styles["export-message-dialog"]}>
        <MessageExporter />
      </div>
    </Modal>
  );
}

function useSteps(
  steps: Array<{
    name: string;
    value: string;
  }>,
) {
  const stepCount = steps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const nextStep = () =>
    setCurrentStepIndex((currentStepIndex + 1) % stepCount);
  const prevStep = () =>
    setCurrentStepIndex((currentStepIndex - 1 + stepCount) % stepCount);

  return {
    currentStepIndex,
    setCurrentStepIndex,
    nextStep,
    prevStep,
    currentStep: steps[currentStepIndex],
  };
}

function Steps<
  T extends {
    name: string;
    value: string;
  }[],
>(props: { steps: T; onStepChange?: (index: number) => void; index: number }) {
  const steps = props.steps;
  const stepCount = steps.length;

  return (
    <div className={styles["steps"]}>
      <div className={styles["steps-progress"]}>
        <div
          className={styles["steps-progress-inner"]}
          style={{
            width: `${((props.index + 1) / stepCount) * 100}%`,
          }}
        ></div>
      </div>
      <div className={styles["steps-inner"]}>
        {steps.map((step, i) => {
          return (
            <div
              key={i}
              className={clsx("clickable", styles["step"], {
                [styles["step-finished"]]: i <= props.index,
                [styles["step-current"]]: i === props.index,
              })}
              onClick={() => {
                props.onStepChange?.(i);
              }}
              role="button"
            >
              <span className={styles["step-index"]}>{i + 1}</span>
              <span className={styles["step-name"]}>{step.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MessageExporter() {
  const steps = [
    {
      name: Locale.Export.Steps.Select,
      value: "select",
    },
    {
      name: Locale.Export.Steps.AISummary,
      value: "summary",
    },
    {
      name: Locale.Export.Steps.Preview,
      value: "preview",
    },
  ];
  const { currentStep, setCurrentStepIndex, currentStepIndex } = useSteps(steps);
  const formats = ["text", "image", "json"] as const;
  type ExportFormat = (typeof formats)[number];

  const [exportConfig, setExportConfig] = useState({
    format: "image" as ExportFormat
  });
  const config = useAppConfig();

  function updateExportConfig(updater: (config: typeof exportConfig) => void) {
    const config = { ...exportConfig };
    updater(config);
    setExportConfig(config);
  }

  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const { selection, updateSelection } = useMessageSelector();
  const selectedMessages = useMemo(() => {
    const ret: ChatMessage[] = [];
    ret.push(...session.messages.filter((m) => selection.has(m.id)));
    return ret;
  }, [
    session.messages,
    session.mask.context,
    selection,
  ]);
  const [processing, setProcessing] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const changeEditingStatus = () => {
    setEditingText(!editingText);
  }
  const onPrompt2Txt = () => {

    if (
      !session.topic ||
      session.topic.length < 10
    ) {
      sys.msg.error(Locale.Chat.ExportRecords.Validate.InvalidTopic);
      return;
    }

    setProcessing(true);

    const lang = config.tttConfig.sourceLanguageName + "和" + config.tttConfig.targetLanguageName;
    let messageContent: any = [
      { background: "会议时间：" + session.firstUpdate + ",会议主题：" + session.topic + ",使用的语言：" + lang }
    ];
    selectedMessages.forEach((m) => {
      messageContent.push({ user: m.userName ?? "", content: getMessageTextContent(m) });
    });

    OpenAPI.aiChat({ type: 'text', text: Locale.Chat.ExportRecords.Prompt(lang, JSON.stringify(messageContent)) })
      .then((result) => {
        if (result.success && result.result) {
          session.summary = result.result
        } else {
          sys.msg.error(result.message);
        }

        setProcessing(false);
      })
      .catch((e) => {
        sys.msg.error(e.message);
        setProcessing(false);
      });
  };

  function preview() {
    if (exportConfig.format === "text") {
      return (
        <MarkdownPreviewer messages={selectedMessages} topic={session.topic} summary={session.summary} />
      );
    } else if (exportConfig.format === "json") {
      return (
        <JsonPreviewer messages={selectedMessages} topic={session.topic} summary={session.summary} />
      );
    } else {
      return (
        <ImagePreviewer messages={selectedMessages} topic={session.topic} summary={session.summary} />
      );
    }
  }
  function select() {
    return (
      <>
        <List>

          <ListItem
            title={Locale.Export.Format.Title}
            desc={Locale.Export.Format.SubTitle}
          >
            <Select
              items={formats.map((f) => (
                {
                  title: Locale.Cons.ExportType(f).title,
                  value: f
                }
              ))}
              defaultSelectedValue={[exportConfig.format.toString()]}
              onSelectValue={
                (values: any) => updateExportConfig(
                  (config) => (config.format = values[0] as ExportFormat)
                )
              }
            />
          </ListItem>

        </List>
        <MessageSelector
          selection={selection}
          updateSelection={updateSelection}
          defaultSelectAll />
      </>
    )
  }
  function summary() {
    return (
      <List>
        <ListItem
          title={Locale.Chat.ExportRecords.Subject}
          className={styles["create-summary"]}
        >
          <Input
            className=""
            type="text"
            value={session.topic}
            onInput={(e) => chatStore.updateTargetSession(
              session,
              (session) => (session.topic = e.currentTarget.value)
            )}
          ></Input>
        </ListItem>

        <ListItem className={styles["create-summary"]}>
          <Button disabled={processing}
            onClick={changeEditingStatus}>
            {editingText ? Locale.Chat.ExportRecords.SaveSummary : Locale.Chat.ExportRecords.EditSummary}
          </Button>

          <Button disabled={processing} type="primary"
            onClick={onPrompt2Txt}>
            {Locale.Chat.ExportRecords.CreateSummary}
          </Button>
        </ListItem>


        {
          editingText && (
            <ListItem vertical={true} className={styles["summary"]}>
              <TextArea
                autoSize={{ minRows: 3, maxRows: 50 }}
                style={{ width: "100%", maxWidth: "unset", textAlign: "left", resize: "vertical" }}
                value={session.summary}
                onInput={(e) => {
                  chatStore.updateTargetSession(
                    session,
                    (session) => (session.summary = e.currentTarget.value)
                  )
                }}
              />
            </ListItem>
          )
        }

        {
          !editingText && (
            <ListItem vertical={true} className={styles["summary"]}>
              <div className={styles["markdown-body-bg"]}>
                <Markdown content={session.summary ? session.summary : Locale.Chat.ExportRecords.SummaryDesc} loading={processing}></Markdown>
              </div>
            </ListItem>
          )
        }

      </List>
    )
  }

  return (
    <>
      <Steps
        steps={steps}
        index={currentStepIndex}
        onStepChange={setCurrentStepIndex}
      />

      <div className={styles["message-exporter-body"]}>
        {currentStep.value === "select" && select()}
        {currentStep.value === "summary" && summary()}
        {currentStep.value === "preview" && preview()}
      </div>
    </>
  );
}

export function RenderExport(props: {
  messages: ChatMessage[];
  onRender: (messages: ChatMessage[]) => void;
}) {
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!domRef.current) return;
    const dom = domRef.current;
    const messages = Array.from(
      dom.getElementsByClassName(EXPORT_MESSAGE_CLASS_NAME),
    );

    if (messages.length !== props.messages.length) {
      return;
    }

    const renderMsgs = messages.map((v, i) => {
      const [role, _] = v.id.split(":");
      return {
        id: i.toString(),
        role: role as any,
        content: role === "user" ? (v.textContent ?? "") : v.innerHTML,
        date: "",
      };
    });

    props.onRender(renderMsgs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={domRef}>
      {props.messages.map((m, i) => (
        <div
          key={i}
          id={`${m.role}:${i}`}
          className={EXPORT_MESSAGE_CLASS_NAME}
        >
          <Markdown content={getMessageTextContent(m)} defaultShow />
        </div>
      ))}
    </div>
  );
}

export function PreviewActions(props: {
  download: () => void;
  copy: () => void;
  showCopy?: boolean;
  messages?: ChatMessage[];
}) {
  const [loading, setLoading] = useState(false);
  const [shouldExport, setShouldExport] = useState(false);
  const config = useAppConfig();
  const onRenderMsgs = (msgs: ChatMessage[]) => {
    setShouldExport(false);

    //const api: ClientApi = getClientApi(config.modelConfig.providerName);
  };

  const share = async () => {
    if (props.messages?.length) {
      setLoading(true);
      setShouldExport(true);
    }
  };

  return (
    <>
      <div className={styles["preview-actions"]}>
        {props.showCopy && (
          <IconButton
            text={Locale.Export.Copy}
            bordered
            shadow
            icon={<CopyOutlined />}
            onClick={props.copy}
          ></IconButton>
        )}
        <IconButton
          text={Locale.Export.Download}
          bordered
          shadow
          icon={<DownloadOutlined />}
          onClick={props.download}
        ></IconButton>
        {/* <IconButton
          text={Locale.Export.Share}
          bordered
          shadow
          icon={loading ? <LoadingIcon /> : <ShareIcon />}
          onClick={share}
        ></IconButton> */}
      </div>
      <div
        style={{
          position: "fixed",
          right: "200vw",
          pointerEvents: "none",
        }}
      >
        {shouldExport && (
          <RenderExport
            messages={props.messages ?? []}
            onRender={onRenderMsgs}
          />
        )}
      </div>
    </>
  );
}

export function ImagePreviewer(props: {
  messages: ChatMessage[];
  topic: string;
  summary: string;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const mask = session.mask;
  const config = useAppConfig();

  const previewRef = useRef<HTMLDivElement>(null);

  const copy = () => {
    showToast(Locale.Export.Image.Toast);
    const dom = previewRef.current;
    if (!dom) return;
    toBlob(dom).then((blob) => {
      if (!blob) return;
      try {
        navigator.clipboard
          .write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])
          .then(() => {
            showToast(Locale.Common.CopySuccess);
            refreshPreview();
          });
      } catch (e) {
        sys.log.error("[Copy Image] ", e);
        showToast(Locale.Common.CopyFailed);
      }
    });
  };

  const isMobile = useMobileScreen();

  const download = async () => {
    showToast(Locale.Export.Image.Toast);
    const dom = previewRef.current;
    if (!dom) return;

    const isApp = getClientConfig()?.isApp;

    try {
      const blob = await toPng(dom);
      if (!blob) return;

      if (isMobile || (isApp && window.__TAURI__)) {
        if (isApp && window.__TAURI__) {
          const result = await window.__TAURI__.dialog.save({
            defaultPath: `${props.topic}.png`,
            filters: [
              {
                name: "PNG Files",
                extensions: ["png"],
              },
              {
                name: "All Files",
                extensions: ["*"],
              },
            ],
          });

          if (result !== null) {
            const response = await fetch(blob);
            const buffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            await window.__TAURI__.fs.writeFile(result, uint8Array);
            showToast(Locale.Common.DownloadSuccess);
          } else {
            showToast(Locale.Common.DownloadFailed);
          }
        } else {
          showImageModal(blob);
        }
      } else {
        const link = document.createElement("a");
        link.download = `${props.topic}.png`;
        link.href = blob;
        link.click();
        refreshPreview();
      }
    } catch (error) {
      showToast(Locale.Common.DownloadFailed);
    }
  };

  const refreshPreview = () => {
    const dom = previewRef.current;
    if (dom) {
      dom.innerHTML = dom.innerHTML; // Refresh the content of the preview by resetting its HTML for fix a bug glitching
    }
  };

  const user = useUserState();
  const users: any[] = [user.userName];

  props.messages.map((m, i) => {
    if (!users.includes(m.userName))
      users.push(m.userName);
  });

  const getTime = () => {
    if (props.messages.length <= 0) return 0;
    const endDate = moment(props.messages[props.messages.length - 1].date);
    const startDate = moment(props.messages[0].date);
    return endDate.diff(startDate, 'm');
  }


  return (
    <div className={styles["image-previewer"]}>
      <PreviewActions
        copy={copy}
        download={download}
        showCopy={!isMobile}
        messages={props.messages}
      />
      <div
        className={clsx(styles["preview-body"], styles["default-theme"])}
        ref={previewRef}
      >
        <div className={styles["chat-info"]}>
          <div>
            <div className={styles["main-title"]}>{session.topic}</div>
            <div className={styles["sub-title"]}></div>
            <div className={styles["icons"]}>
              <span className={styles["icon-space"]}>{Locale.Exporter.Attendees}: </span>
              {
                users.map(element => {
                  return <span key={element} className={styles["icon-space"]}>{element}</span>
                })
              }
            </div>
          </div>

          <div>

            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.Messages}: {props.messages.length}
            </div>

            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.StartTime}:{" "}
              {new Date(
                props.messages.at(0)?.date ?? Date.now(),
              ).toLocaleString()}
            </div>
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.StartEnd}: {getTime()}
            </div>
          </div>
        </div>

        {session.summary &&
          <div className={styles["chat-info"]}>
            <Markdown content={session.summary}></Markdown>
          </div>
        }
        {props.messages.map((m, i) => {
          return (
            <div
              className={clsx(styles["message"], styles["message-" + m.role])}
              key={i}
            >
              <div className={styles["avatar"]}>
                <Avatar avatar={m.userAvatar} />

                <div className={styles["name"]}>
                  {m.role === "user"
                    ? user.userName
                    : m.modelName}
                </div>

                <div className={styles["date"]}>
                  {m.date.toLocaleString()}
                </div>
              </div>

              <div className={styles["body"]}>
                <Markdown
                  content={getMessageTextContent(m)}
                  fontSize={config.fontSize}
                  fontFamily={config.fontFamily}
                  defaultShow
                />
                {getMessageFiles(m).length == 1 && (
                  <img
                    key={i}
                    src={getMessageFiles(m)[0].url}
                    alt="message"
                    className={styles["message-image"]}
                  />
                )}
                {getMessageFiles(m).length > 1 && (
                  <div
                    className={styles["message-images"]}
                    style={
                      {
                        "--image-count": getMessageFiles(m).length,
                      } as React.CSSProperties
                    }
                  >
                    {getMessageFiles(m).map((file, i) => (
                      <img
                        key={i}
                        src={file.url}
                        alt="message"
                        className={styles["message-image-multi"]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarkdownPreviewer(props: {
  messages: ChatMessage[];
  topic: string;
  summary: string;
}) {
  const mdText =
    `# ${props.topic}\n\n` +
    `# ${props.summary}\n\n` +
    props.messages
      .map((m) => {
        return `## ${m.userName}:\n${getMessageTextContent(m)}`
      })
      .join("\n\n");

  const copy = () => {
    copyToClipboard(mdText);
  };
  const download = () => {
    downloadAs(mdText, `${props.topic}.md`);
  };
  return (
    <>
      <PreviewActions
        copy={copy}
        download={download}
        showCopy={true}
        messages={props.messages}
      />
      <div className="markdown-body">
        <pre className={styles["export-content"]}>{mdText}</pre>
      </div>
    </>
  );
}

export function JsonPreviewer(props: {
  messages: ChatMessage[];
  topic: string;
  summary: string;
}) {
  const msgs = {
    messages: [
      ...props.messages.map((m) => ({
        user: m.userName,
        content: m.content,
      })),
    ],
  };
  const mdText = "```json\n" + JSON.stringify(msgs, null, 2) + "\n```";
  const minifiedJson = JSON.stringify(msgs);

  const copy = () => {
    copyToClipboard(minifiedJson);
  };
  const download = () => {
    downloadAs(JSON.stringify(msgs), `${props.topic}.json`);
  };

  return (
    <>
      <PreviewActions
        copy={copy}
        download={download}
        showCopy={false}
        messages={props.messages}
      />
      <div className="markdown-body" onClick={copy}>
        <Markdown content={mdText} />
      </div>
    </>
  );
}
