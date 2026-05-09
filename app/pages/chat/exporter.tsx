/* eslint-disable @next/next/no-img-element */
import { useAppConfig, useChatStore } from "../../store";
//用户状态
import { useUserState } from "../../store/user";
import Locale from "../../locales";
import styles from "./exporter.module.scss";
import {
  CheckBox,
  IconButton, List,
  ListItem,
  Modal,
  Select,
  showImageModal,
  showToast
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

import { AITaaSLogo, DEFAULT_MASK_AVATAR, EXPORT_MESSAGE_CLASS_NAME } from "../../constant";
import { getClientConfig } from "../../config/client";
import clsx from "clsx";
import { sys } from "../../utils/sys";
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
    <Modal title={Locale.Export.Title} onClose={props.onClose} defaultMax={true}>
      <div style={{ minHeight: "50vh", minWidth: "50vw" }}>
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
      name: Locale.Export.Steps.Preview,
      value: "preview",
    },
  ];
  const { currentStep, setCurrentStepIndex, currentStepIndex } =
    useSteps(steps);
  const formats = ["text", "image", "json"] as const;
  type ExportFormat = (typeof formats)[number];

  const [exportConfig, setExportConfig] = useState({
    format: "image" as ExportFormat,
    includeContext: true,
  });

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
    if (exportConfig.includeContext) {
      ret.push(...session.mask.context);
    }
    ret.push(...session.messages.filter((m) => selection.has(m.id)));
    return ret;
  }, [
    exportConfig.includeContext,
    session.messages,
    session.mask.context,
    selection,
  ]);
  function preview() {
    if (exportConfig.format === "text") {
      return (
        <MarkdownPreviewer messages={selectedMessages} topic={session.topic} />
      );
    } else if (exportConfig.format === "json") {
      return (
        <JsonPreviewer messages={selectedMessages} topic={session.topic} />
      );
    } else {
      return (
        <ImagePreviewer messages={selectedMessages} topic={session.topic} />
      );
    }
  }
  return (
    <>
      <Steps
        steps={steps}
        index={currentStepIndex}
        onStepChange={setCurrentStepIndex}
      />
      <div
        className={styles["message-exporter-body"]}
        style={currentStep.value !== "select" ? { display: "none" } : {}}
      >
        <List>
          <ListItem
            title={Locale.Export.Format.Title}
            desc={Locale.Export.Format.SubTitle}
          >
            <Select
              items={
                formats.map((f) => (
                  {
                    title: Locale.Cons.ExportType(f).title,
                    value: f
                  }
                ))
              }
              defaultSelectedValue={[exportConfig.format.toString()]}
              onSelectValue={
                (values) => updateExportConfig(
                  (config) => (config.format = values[0] as ExportFormat)
                )
              }
            />
          </ListItem>
          <ListItem
            title={Locale.Export.IncludeContext.Title}
            desc={Locale.Export.IncludeContext.SubTitle}
          >
            <CheckBox
              checked={exportConfig.includeContext}
              onChange={(e) => {
                updateExportConfig(
                  (config) => (config.includeContext = e.target.checked),
                );
              }}
            />
          </ListItem>
        </List>
        <MessageSelector
          selection={selection}
          updateSelection={updateSelection}
          defaultSelectAll
        />
      </div>
      {currentStep.value === "preview" && (
        <div className={styles["message-exporter-body"]}>{preview()}</div>
      )}
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

function ExportAvatar(props: { avatar: string }) {
  if (props.avatar === DEFAULT_MASK_AVATAR) {
    return <Avatar avatar={DEFAULT_MASK_AVATAR} />;
  }

  return <Avatar avatar={props.avatar} />;
}

export function ImagePreviewer(props: {
  messages: ChatMessage[];
  topic: string;
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
            <img src={AITaaSLogo.Logo} alt="logo" width={80} height={80} />
            <div className={styles["main-title"]}>{session.topic}</div>
            {/* <div className={styles["sub-title"]}></div>
            <div className={styles["icons"]}>
              <ExportAvatar avatar={user.userAvatar} />
              <span className={styles["icon-space"]}>&</span>
              <ExportAvatar avatar={mask.avatar} />
            </div> */}
          </div>

          <div>
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.Model}: {mask.modelConfig.modelProvider}
            </div>
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.Messages}: {props.messages.length}
            </div>
            {/* <div className={styles["chat-info-item"]}>
              {Locale.Exporter.Topic}: {session.topic}
            </div> */}
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.StartTime}:{" "}
              {(props.messages?.at(0)?.date?.length || 0) > 0 ?
                new Date(props.messages?.at(0)?.date || Date.now()).toLocaleString() :
                new Date().toLocaleString()
              }
            </div>
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.EndTime}:{" "}
              {
                (props.messages?.at(props.messages?.length - 1)?.date?.length || 0) > 0 ?
                  new Date(props.messages?.at(props.messages?.length - 1)?.date || Date.now()).toLocaleString() :
                  new Date().toLocaleString()
              }
            </div>
          </div>
        </div>
        {props.messages.map((m, i) => {
          return (
            <div
              className={clsx(styles["message"], styles["message-" + m.role])}
              key={i}
            >
              <div className={styles["avatar"]}>
                <ExportAvatar
                  avatar={m.role === "user" ? user.userAvatar : mask.avatar}
                />

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
}) {
  const mdText =
    `# ${props.topic}\n\n` +
    props.messages
      .map((m) => {
        return m.role === "user"
          ? `## ${Locale.Export.MessageFromYou}:\n${getMessageTextContent(m)}`
          : `## ${Locale.Export.MessageFromChatGPT}:\n${getMessageTextContent(
            m,
          ).trim()}`;
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
}) {
  const msgs = {
    messages: [
      {
        role: "system",
        content: `${Locale.Chat.Prompt.System} ${props.topic}`,
      },
      ...props.messages.map((m) => ({
        role: m.role,
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
