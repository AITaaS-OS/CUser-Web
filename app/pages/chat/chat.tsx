import { useDebouncedCallback } from "use-debounce";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo, Fragment,
  RefObject
} from "react";

import SendWhiteIcon from "../../icons/send-white.svg";
import RecordOpenIcon from "../../icons/microphone-open.svg";
import RecordCloseIcon from "../../icons/microphone-close.svg";
import SendIcon from "../../icons/send.svg";
import SpeakIcon from "../../icons/speak.svg";
import SpeakStopIcon from "../../icons/speak-stop.svg";
import LoadingIcon from "../../icons/processing.svg";
import LoadingButtonIcon from "../../icons/processing.svg";
import MaskIcon from "../../icons/mask.svg";
import FileIcon from "../../icons/attachfile.png";
import RobotIcon from "../../icons/robot.svg";
import SizeIcon from "../../icons/size.svg";
import QualityIcon from "../../icons/hd.svg";
import { ChatMessage, Prompt, MultimodalContent } from "@/app/types";
import {
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useModelProviderConfig,
  Theme,
  useAppConfig,
  usePluginStore,
  useModelStore,
} from "../../store";

import { useUserState } from "../../store/user";

import {
  copyToClipboard,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
  getMessageTextContent,
  getMessageFiles,
  isVisionModel,
  isDalle3,
  safeLocalStorage,
} from "../../utils";

import file from "@/app/utils/file";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../../client/controller";
import { DalleSize, DalleQuality, DalleStyle, ChatConfigDefault } from "../../types";
import { usePromptStore } from "../../store/prompt";
import Locale from "../../locales";
import styles from "./chat.module.scss";

import {
  IconButton,
  Input,
  List,
  ListItem,
  Loading,
  Modal, SelectModal, showConfirm,
  showPrompt,
  showToast
} from "../../components/ui-lib";
import { useNavigate } from "react-router-dom";
import {
  CHAT_PAGE_SIZE, Path,
  REQUEST_TIMEOUT_MS,
  UNFINISHED_INPUT,
  ModelProvider,
  UPLOAD_MAX_COUNT,
  DefaultModelName,
  DefaultModelProviderName
} from "../../constant";
import { Avatar } from "../../components/emoji";
import { ChatMessageEditor, MaskEditor } from "../config/mask-config";
import { useMaskStore } from "../../store/mask";
import { ChatCommandPrefix, useChatCommand, useCommand } from "../../command";
import { ExportMessageModal } from "./exporter";
import { getClientConfig } from "../../config/client";
import { getModelProvider } from "../../utils/model";
import clsx from "clsx";
import { Button, Image, Tooltip } from "antd";
import tts from "../../utils/useTTS";
import stt from "../../utils/useSTT";
import { sys } from "../../utils/sys";
import useLLM from "../../utils/useLLM";
import { OpenAPI } from "@/app/openapi";
import touch from "@/app/utils/touch";
import { ModelSelectorModal } from "@/app/components/model-select";
import { AudioOutlined, CheckOutlined, ClearOutlined, CloseOutlined, CloudDownloadOutlined, CopyOutlined, DeleteOutlined, DislikeOutlined, EditOutlined, LikeOutlined, PaperClipOutlined, PauseCircleOutlined, SnippetsOutlined, StopOutlined, SwitcherOutlined, SyncOutlined } from "@ant-design/icons";

const localStorage = safeLocalStorage();

const Markdown = dynamic(
  async () => (await import("../../components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);

export function SessionConfigModel(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const maskStore = useMaskStore();
  const navigate = useNavigate();

  return (
    <div className="modal-dialog">
      <Modal
        title={Locale.Context.Edit}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<SyncOutlined />}
            bordered
            text={Locale.Chat.Config.Reset}
            onClick={async () => {
              if (await showConfirm(null, Locale.Memory.ResetConfirm)) {
                chatStore.updateTargetSession(
                  session,
                  (session) => (session.memoryPrompt = ""),
                );
              }
            }}
          />,
          <IconButton
            key="copy"
            icon={<CopyOutlined />}
            bordered
            text={Locale.Chat.Config.SaveAs}
            onClick={() => {
              navigate(Path.Masks);
              setTimeout(() => {
                //maskStore.create(session.mask);
              }, 500);
            }}
          />,
        ]}
      >
        <MaskEditor
          mask={session.mask}
          updateMask={(updater) => {
            const mask = { ...session.mask };
            updater(mask);
            chatStore.updateTargetSession(
              session,
              (session) => (session.mask = mask),
            );
          }}
          shouldSyncFromGlobal
          extraListItems={
            session.mask.modelConfig.sendMemory ? (
              <ListItem
                className="copyable"
                title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
                desc={session.memoryPrompt || Locale.Memory.EmptyContent}
              ></ListItem>
            ) : (
              <></>
            )
          }
        ></MaskEditor>
      </Modal>
    </div>
  );
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.mask.context;

  return (
    <div className={styles["prompt-toast"]} key="prompt-toast">
      {props.showToast && context.length > 0 && (
        <div
          className={clsx(styles["prompt-toast-inner"], "clickable")}
          role="button"
          onClick={() => props.setShowModal(true)}
        >

          <span className={styles["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel onClose={() => props.setShowModal(false)} />
      )}
    </div>
  );
}

function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;
  const isComposing = useRef(false);
  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    const onCompositionStart = () => {
      isComposing.current = true;
    };
    const onCompositionEnd = () => {
      isComposing.current = false;
    };

    window.addEventListener("compositionstart", onCompositionStart);
    window.addEventListener("compositionend", onCompositionEnd);

    return () => {
      window.removeEventListener("compositionstart", onCompositionStart);
      window.removeEventListener("compositionend", onCompositionEnd);
    };
  }, []);

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

    // Fix Chinese input method "Enter" on Safari
    if (e.keyCode == 229) return false;
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && (e.nativeEvent.isComposing || isComposing.current))
      return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey &&
        !isMobileScreen)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export type RenderPrompt = Pick<Prompt, "name" | "content">;

export function PromptHints(props: {
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

function ClearContextDivider() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  return (
    <div
      className={styles["clear-context"]}
      onClick={() =>
        chatStore.updateTargetSession(
          session,
          (session) => (session.clearContextIndex = undefined),
        )
      }
    >
      <div className={styles["clear-context-tips"]}>{Locale.Context.Clear}</div>
      <div className={styles["clear-context-revert-btn"]}>
        {Locale.Context.Revert}
      </div>
    </div>
  );
}

export function ChatAction(props: {
  text: string;
  icon: JSX.Element;
  disabled?: boolean;
  onClick: () => void;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    full: 16,
    icon: 16,
  });

  function updateWidth() {
    if (!iconRef.current || !textRef.current) return;
    const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
    const textWidth = getWidth(textRef.current);
    const iconWidth = getWidth(iconRef.current);
    setWidth({
      full: textWidth + iconWidth,
      icon: iconWidth,
    });
  }

  return (
    <div
      className={clsx(styles["chat-input-action"], "clickable")}
      aria-disabled={props.disabled || false}
      onClick={() => {
        props.onClick();
        setTimeout(updateWidth, 1);
      }}
      onMouseEnter={updateWidth}
      onTouchStart={updateWidth}
      style={
        {
          "--icon-width": `${width.icon}px`,
          "--full-width": `${width.full}px`,
        } as React.CSSProperties
      }
    >
      <div ref={iconRef} className={styles["icon"]}>
        {props.icon}
      </div>
      <div className={styles["text"]} ref={textRef}>
        {props.text}
      </div>
    </div>
  );
}

function useScrollToBottom(
  scrollRef: RefObject<HTMLDivElement>,
  detach: boolean = false,
) {
  // for auto-scroll

  const [autoScroll, setAutoScroll] = useState(true);
  function scrollDomToBottom() {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => {
        setAutoScroll(true);
        dom.scrollTo(0, dom.scrollHeight);
      });
    }
  }

  // auto scroll
  useEffect(() => {
    if (autoScroll && !detach) {
      scrollDomToBottom();
    }
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollDomToBottom,
  };
}

export function ChatActions(props: {
  uploadFile: () => void;
  setAttachFiles: (files: Record<string, string>[]) => void;
  setUploading: (uploading: boolean) => void;
  showPromptModal: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  hitBottom: boolean;
  uploading: boolean;
  setShowShortcutKeyModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUserInput: (input: string) => void;
  setShowChatSidePanel: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRTChat: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const config = useAppConfig();
  const navigate = useNavigate();
  const chatStore = useChatStore();
  const modelStore = useModelStore();
  const pluginStore = usePluginStore();
  const session = chatStore.currentSession();

  // switch themes
  const theme = config.theme;
  function nextTheme() {
    const themes = [Theme.Auto, Theme.Light, Theme.Dark];
    const themeIndex = themes.indexOf(theme);
    const nextIndex = (themeIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    config.update((config) => (config.theme = nextTheme));
  }

  // stop all responses
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();

  const [currentModelName, setCurrentModelName] = useState(session.mask.modelConfig.modelName || DefaultModelName);
  const [currentProviderName, setCurrentProviderName] = useState(session.mask.modelConfig.modelProvider.toString() || DefaultModelProviderName);

  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showPluginSelector, setShowPluginSelector] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);

  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const dalle3Sizes: DalleSize[] = ["1024x1024", "1792x1024", "1024x1792"];
  const dalle3Qualitys: DalleQuality[] = ["standard", "hd"];
  const dalle3Styles: DalleStyle[] = ["vivid", "natural"];
  const currentSize = session.mask.modelConfig?.size ?? "1024x1024";
  const currentQuality = session.mask.modelConfig?.quality ?? "standard";
  const currentStyle = session.mask.modelConfig?.style ?? "vivid";

  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    const show = isVisionModel(session.mask.modelConfig.modelName);
    setShowUploadImage(show);
    if (!show) {
      props.setAttachFiles([]);
      props.setUploading(false);
    }
  }, [session]);

  return (
    <div className={styles["chat-input-actions"]}>
      <Button
        className={styles["chat-realtime-action-open"]}
        onClick={() => { props.setIsRTChat(true); }}
        icon={<AudioOutlined />}
      >
        {Locale.Voice.Title}
      </Button>

      <Button
        className={styles["chat-realtime-action-open"]}
        onClick={props.uploadFile}
        icon={props.uploading ? <LoadingButtonIcon /> : <PaperClipOutlined />}
      >
        {Locale.Chat.InputActions.UploadFile}
      </Button>

      <div className={styles["chat-input-actions-end"]}>

        {/* {couldStop && (
          <ChatAction
            onClick={stopAll}
            text={Locale.Chat.InputActions.Stop}
            icon={<StopIcon />}
          />
        )}

        {!props.hitBottom && (
          <ChatAction
            onClick={props.scrollToBottom}
            text={Locale.Chat.InputActions.ToBottom}
            icon={<BottomIcon />}
          />
        )}

        {props.hitBottom && (
          <ChatAction
            onClick={props.showPromptModal}
            text={Locale.Chat.InputActions.Settings}
            icon={<SettingsIcon />}
          />
        )} */}

        {/* {config.realtimeConfig.enable && (
          <ChatAction
            onClick={() => {
              props.setIsRTChat(true);
              //props.setShowChatSidePanel(true);
            }}
            text={Locale.Chat.RealtimeChat}
            icon={<VoiceIcon />}
          />
        )} */}

        {/* <ChatAction
          onClick={props.uploadImage}
          text={Locale.Chat.InputActions.UploadImage}
          icon={props.uploading ? <LoadingButtonIcon /> : <ImageIcon />}
        /> */}

        {/* <ChatAction
          onClick={nextTheme}
          text={Locale.Chat.InputActions.Theme[theme]}
          icon={
            <>
              {theme === Theme.Auto ? (
                <AutoIcon />
              ) : theme === Theme.Light ? (
                <LightIcon />
              ) : theme === Theme.Dark ? (
                <DarkIcon />
              ) : null}
            </>
          }
        /> */}

        <ChatAction
          onClick={props.showPromptHints}
          text={Locale.Chat.InputActions.Prompt}
          icon={<SnippetsOutlined />}
        />

        <ChatAction
          onClick={() => {
            navigate(Path.Masks);
          }}
          text={Locale.Chat.InputActions.ChangeMask}
          icon={<MaskIcon />}
        />

        {/* <ChatAction
          text={Locale.Chat.InputActions.Clear}
          icon={<BreakIcon />}
          onClick={() => {
            chatStore.updateTargetSession(session, (session) => {
              if (session.clearContextIndex === session.messages.length) {
                session.clearContextIndex = undefined;
              } else {
                session.clearContextIndex = session.messages.length;
                session.memoryPrompt = ""; // will clear memory
              }
            });
          }}
        /> */}

        <ChatAction
          onClick={() => setShowModelSelector(true)}
          text={Locale.Chat.InputActions.ChangeModel}
          icon={<RobotIcon />}
        />

        {showModelSelector && (
          <ModelSelectorModal
            defaultSelectedValue={[currentModelName + "@" + currentProviderName]}
            onClose={() => setShowModelSelector(false)}
            onSelectValue={(s) => {
              if (s.length === 0) return;

              const [modelName, providerName] = getModelProvider(s[0]);

              setCurrentModelName(modelName);
              setCurrentProviderName(providerName);

              config.update((config) => {
                config.modelConfig.modelName = modelName;
                config.modelConfig.modelProvider = providerName as ModelProvider;
              });

              chatStore.updateTargetSession(session, (session) => {
                session.mask.modelConfig.modelName = modelName;
                session.mask.modelConfig.modelProvider =
                  providerName as ModelProvider;
                session.mask.syncGlobalConfig = false;
              });

              showToast(modelName);
            }}
          />
        )}

        {isDalle3(currentModelName) && (
          <ChatAction
            onClick={() => setShowSizeSelector(true)}
            text={currentSize}
            icon={<SizeIcon />}
          />
        )}

        {showSizeSelector && (
          <SelectModal
            defaultSelectedValue={[currentSize]}
            items={dalle3Sizes.map((m) => ({
              title: m,
              value: m,
            }))}
            onClose={() => setShowSizeSelector(false)}
            onSelectValue={(s) => {
              if (s.length === 0) return;
              const size = s[0];
              chatStore.updateTargetSession(session, (session) => {
                session.mask.modelConfig.size = size as DalleSize;
              });
              showToast(size);
            }}
          />
        )}

        {isDalle3(currentModelName) && (
          <ChatAction
            onClick={() => setShowQualitySelector(true)}
            text={currentQuality}
            icon={<QualityIcon />}
          />
        )}

        {showQualitySelector && (
          <SelectModal
            defaultSelectedValue={[currentQuality]}
            items={dalle3Qualitys.map((m) => ({
              title: m,
              value: m,
            }))}
            onClose={() => setShowQualitySelector(false)}
            onSelectValue={(q) => {
              if (q.length === 0) return;
              const quality = q[0];
              chatStore.updateTargetSession(session, (session) => {
                session.mask.modelConfig.quality = quality as DalleQuality;
              });
              showToast(quality);
            }}
          />
        )}

        {isDalle3(currentModelName) && (
          <ChatAction
            onClick={() => setShowStyleSelector(true)}
            text={currentStyle}
            icon={<SwitcherOutlined />}
          />
        )}

        {showStyleSelector && (
          <SelectModal
            defaultSelectedValue={[currentStyle]}
            items={dalle3Styles.map((m) => ({
              title: m,
              value: m,
            }))}
            onClose={() => setShowStyleSelector(false)}
            onSelectValue={(s) => {
              if (s.length === 0) return;
              const style = s[0];
              chatStore.updateTargetSession(session, (session) => {
                session.mask.modelConfig.style = style as DalleStyle;
              });
              showToast(style);
            }}
          />
        )}

        {/* {showPlugins(currentProviderName, currentModel) && (
          <ChatAction
            onClick={() => {
              if (pluginStore.getAll().length == 0) {
                navigate(Path.Plugins);
              } else {
                setShowPluginSelector(true);
              }
            }}
            text={Locale.Plugin.Name}
            icon={<PluginIcon />}
          />
        )}

        {showPluginSelector && (
          <Selector
            multiple
            defaultSelectedValue={chatStore.currentSession().mask?.plugin}
            items={pluginStore.getAll().map((item) => ({
              title: `${item?.title}@${item?.version}`,
              value: item?.id,
            }))}
            onClose={() => setShowPluginSelector(false)}
            onSelection={(s) => {
              chatStore.updateTargetSession(session, (session) => {
                session.mask.plugin = s as string[];
              });
            }}
          />
        )} */}

        {/* {!isMobileScreen && (
          <ChatAction
            onClick={() => props.setShowShortcutKeyModal(true)}
            text={Locale.Chat.ShortcutKey.Title}
            icon={<ShortcutkeyIcon />}
          />
        )} */}

        {/* <ChatAction
            onClick={props.uploadFile}
            text={Locale.Chat.InputActions.UploadFile}
            icon={props.uploading ? <LoadingButtonIcon /> : <AttachIcon />}
          /> */}


      </div>
    </div>
  );
}

export function EditMessageModal(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const [messages, setMessages] = useState(session.messages.slice());

  return (

    <Modal
      title={Locale.Chat.EditMessage.Title}
      onClose={props.onClose}
      actions={[
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
            chatStore.updateTargetSession(
              session,
              (session) => (session.messages = messages),
            );
            props.onClose();
          }}
        />,
      ]}
    >
      <div style={{ minWidth: "50vw" }}>
        <List>
          <ListItem
            title={Locale.Chat.EditMessage.Topic.Title}
            desc={Locale.Chat.EditMessage.Topic.SubTitle}
          >
            <Input
              count={{
                show: true,
                max: 20,
              }}
              type="text"
              value={session.topic}
              onInput={(e) =>
                chatStore.updateTargetSession(
                  session,
                  (session) => (session.topic = e.currentTarget.value),
                )
              }
            ></Input>
          </ListItem>
        </List>
        <List
          title={Locale.Chat.EditMessage.ChatMessage.Title}
          enableFold={true}
          defaultFolded={true}
        >
          <ListItem vertical={true}>
            <ChatMessageEditor
              context={messages}
              updateContext={(updater) => {
                const newMessages = messages.slice();
                updater(newMessages);
                setMessages(newMessages);
              }}
            />
          </ListItem></List>
      </div>
    </Modal>

  );
}

export function DeleteAttachFileButton(props: { deleteFile: () => void }) {
  return (
    <IconButton
      icon={<CloseOutlined />}
      className={styles["delete-file"]} onClick={props.deleteFile}
    />
  );
}

export function ShortcutKeyModal(props: { onClose: () => void }) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcuts = [
    {
      title: Locale.Chat.ShortcutKey.newChat,
      keys: isMac ? ["⌘", "Shift", "O"] : ["Ctrl", "Shift", "O"],
    },
    { title: Locale.Chat.ShortcutKey.focusInput, keys: ["Shift", "Esc"] },
    {
      title: Locale.Chat.ShortcutKey.copyLastCode,
      keys: isMac ? ["⌘", "Shift", ";"] : ["Ctrl", "Shift", ";"],
    },
    {
      title: Locale.Chat.ShortcutKey.copyLastMessage,
      keys: isMac ? ["⌘", "Shift", "C"] : ["Ctrl", "Shift", "C"],
    },
    {
      title: Locale.Chat.ShortcutKey.showShortcutKey,
      keys: isMac ? ["⌘", "/"] : ["Ctrl", "/"],
    },
  ];
  return (
    <div className="modal-dialog">
      <Modal
        title={Locale.Chat.ShortcutKey.Title}
        onClose={props.onClose}
        actions={[
          <IconButton
            type="primary"
            text={Locale.Common.Confirm}
            icon={<CheckOutlined />}
            key="ok"
            onClick={() => {
              props.onClose();
            }}
          />,
        ]}
      >
        <div className={styles["shortcut-key-container"]}>
          <div className={styles["shortcut-key-grid"]}>
            {shortcuts.map((shortcut, index) => (
              <div key={index} className={styles["shortcut-key-item"]}>
                <div className={styles["shortcut-key-title"]}>
                  {shortcut.title}
                </div>
                <div className={styles["shortcut-key-keys"]}>
                  {shortcut.keys.map((key, i) => (
                    <div key={i} className={styles["shortcut-key"]}>
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InnerChat() {
  type RenderMessage = ChatMessage & { preview?: boolean };

  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();
  const user = useUserState();
  const llm = useLLM((text) => {
    setCanSpeak(true);
    if (config.chatConfig.autoplay && text) {
      setIsRecording(false);
      setIsSpeaking(true);
      tts.speak(text,
        null,
        () => { setIsSpeaking(true); },
        (success, text) => {
          setIsSpeaking(false);
          if (!success) sys.msg.error(text);
        });
    }
  });

  const fontSize = config.fontSize;
  const fontFamily = config.fontFamily;

  const [showExport, setShowExport] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generateVideo, setGenerateVideo] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottom = scrollRef?.current
    ? Math.abs(
      scrollRef.current.scrollHeight -
      (scrollRef.current.scrollTop + scrollRef.current.clientHeight),
    ) <= 1
    : false;
  const isAttachWithTop = useMemo(() => {
    const lastMessage = scrollRef.current?.lastElementChild as HTMLElement;
    // if scrolllRef is not ready or no message, return false
    if (!scrollRef?.current || !lastMessage) return false;
    const topDistance =
      lastMessage!.getBoundingClientRect().top -
      scrollRef.current.getBoundingClientRect().top;
    // leave some space for user question
    return topDistance < 100;
  }, [scrollRef?.current?.scrollHeight]);

  const isTyping = userInput !== "";

  // if user is typing, should auto scroll to bottom
  // if user is not typing, should auto scroll to bottom only if already at bottom
  const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(
    scrollRef,
    (isScrolledToBottom || isAttachWithTop) && !isTyping,
  );
  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();
  // const [attachImages, setAttachImages] = useState<string[]>([]);
  const [attachFiles, setAttachFiles] = useState<Record<string, string>[]>([]);
  const [uploading, setUploading] = useState(false);

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<RenderPrompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      promptStore.search(text).then((matchedPrompts) => {
        sys.log.info(">>>加载提示词数量：{}", matchedPrompts.length);
        setPromptHints(matchedPrompts);
      });

    },
    100,
    { leading: true, trailing: true },
  );

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        20,
        Math.max(2 + Number(!isMobileScreen), rows),
      );
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // chat commands shortcuts
  const chatCommands = useChatCommand({
    new: () => chatStore.newSession(),
    newm: () => navigate(Path.NewChat),
    prev: () => chatStore.nextSession(-1),
    next: () => chatStore.nextSession(1),
    clear: () =>
      chatStore.updateTargetSession(
        session,
        (session) => (session.clearContextIndex = session.messages.length),
      ),
    fork: () => chatStore.forkSession(),
    del: () => chatStore.deleteSession(chatStore.currentSessionIndex),
  });

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (text.match(ChatCommandPrefix)) {
      setPromptHints(chatCommands.search(text));
    } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith("/")) {
        let searchText = text.slice(1);
        onSearch(searchText);
      }
    }
  };

  const doSubmit = (userInput: string) => {
    if (userInput.trim() === "") return;

    const matchCommand = chatCommands.match(userInput);

    if (matchCommand.matched) {
      setUserInput("");
      setPromptHints([]);
      matchCommand.invoke();
      return;
    }

    //发送聊天请求
    doChat(userInput, attachFiles);
  };

  const doChat = (userInput: string, attachFiles?: Record<string, string>[]) => {
    llm.chat(userInput, { ...ChatConfigDefault }, attachFiles).then(() => setIsLoading(false));

    setAttachFiles([]);
    chatStore.setLastInput(userInput);
    setUserInput("");
    setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  }

  const onPromptSelect = (prompt: RenderPrompt) => {
    setTimeout(() => {
      setPromptHints([]);

      const matchedChatCommand = chatCommands.match(prompt.content);
      if (matchedChatCommand.matched) {
        // if user is selecting a chat command, just trigger it
        matchedChatCommand.invoke();
        setUserInput("");
      } else {
        // or fill the prompt
        setUserInput(prompt.content);
      }
      inputRef.current?.focus();
    }, 30);
  };

  // stop response
  const onUserStop = (messageId: string) => {
    ChatControllerPool.stop(session.id, messageId);
  };

  useEffect(() => {
    chatStore.updateTargetSession(session, (session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || new Date(m.date).getTime() < stopTiming) {
          if (m.isStreaming) {
            m.isStreaming = false;
          }

          if (!m.content || m.content.length === 0) {
            m.isError = true;
            m.content = Locale.Error.CommonError;
          }
        }
      });

      // auto sync mask config from global config
      if (session.mask.syncGlobalConfig) {
        sys.log.info("[Mask] syncing from global, name = ", session.mask.name);
        session.mask.modelConfig = { ...config.modelConfig };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput, fill with last input
    if (
      e.key === "ArrowUp" &&
      userInput.length <= 0 &&
      !(e.metaKey || e.altKey || e.ctrlKey)
    ) {
      setUserInput(chatStore.lastInput ?? "");
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e) && promptHints.length === 0) {
      doSubmit(userInput);
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, getMessageTextContent(message))) {
      if (userInput.length === 0) {
        setUserInput(getMessageTextContent(message));
      }

      e.preventDefault();
    }
  };

  const deleteMessage = (msgId?: string) => {
    chatStore.updateTargetSession(
      session,
      (session) =>
        (session.messages = session.messages.filter((m) => m.id !== msgId)),
    );
  };

  const clearAllMessage = () => {
    showConfirm(Locale.Chat.Actions.ClearScreen, Locale.Chat.Actions.ClearScreenConfirm, false).then(() => {
      OpenAPI.aiChatClearHistory()
        .then((result) => {
          if (result.success && result.result) {
            chatStore.updateTargetSession(
              session,
              (session) =>
                (session.messages = []),
            );
            sys.log.info(">>>清空对话历史成功");
          }
          else {
            sys.log.error(">>>清空对话历史失败:", result.message);
            sys.msg.error(result.message);
          }
        });
    });



  };

  const onDelete = (msgId: string) => {
    deleteMessage(msgId);
  };

  const onResend = (message: ChatMessage) => {
    // when it is resending a message
    // 1. for a user's message, find the next bot response
    // 2. for a bot's message, find the last user's input
    // 3. delete original user input and bot's message
    // 4. resend the user's input

    const resendingIndex = session.messages.findIndex(
      (m) => m.id === message.id,
    );

    if (resendingIndex < 0 || resendingIndex >= session.messages.length) {
      sys.log.error("[Chat] failed to find resending message", message);
      return;
    }

    let userMessage: ChatMessage | undefined;
    let botMessage: ChatMessage | undefined;

    if (message.role === "assistant") {
      // if it is resending a bot's message, find the user input for it
      botMessage = message;
      for (let i = resendingIndex; i >= 0; i -= 1) {
        if (session.messages[i].role === "user") {
          userMessage = session.messages[i];
          break;
        }
      }
    } else if (message.role === "user") {
      // if it is resending a user's input, find the bot's response
      userMessage = message;
      for (let i = resendingIndex; i < session.messages.length; i += 1) {
        if (session.messages[i].role === "assistant") {
          botMessage = session.messages[i];
          break;
        }
      }
    }

    if (userMessage === undefined) {
      sys.log.error("[Chat] failed to resend", message);
      return;
    }

    // delete the original messages
    deleteMessage(userMessage.id);
    deleteMessage(botMessage?.id);

    // resend the message
    setIsLoading(true);
    const textContent = getMessageTextContent(userMessage);
    const files = getMessageFiles(userMessage);
    llm.chat(textContent, { ...ChatConfigDefault, generateVideo: generateVideo }, files).then(() => setIsLoading(false));
    
    scrollToBottom();
  };

  const onPinMessage = (message: ChatMessage) => {
    chatStore.updateTargetSession(session, (session) =>
      session.mask.context.push(message),
    );

    showToast(Locale.Chat.Actions.PinToastContent, {
      text: Locale.Chat.Actions.PinToastAction,
      onClick: () => {
        setShowPromptModal(true);
      },
    });
  };

  const accessStore = useModelProviderConfig();

  const context: RenderMessage[] = useMemo(() => {
    return session.mask.hideContext ? [] : session.mask.context.slice();
  }, [session.mask.context, session.mask.hideContext]);

  if (
    context.length === 0 &&
    session.messages.at(0)?.content !== BOT_HELLO.content
  ) {
    const copiedHello = Object.assign({}, BOT_HELLO);
    if (!accessStore.isAuthorized()) {
      copiedHello.content = Locale.Error.Unauthorized;
    }
    context.push(copiedHello);
  }

  // preview messages
  const renderMessages = useMemo(() => {
    return context
      .concat(session.messages as RenderMessage[])
      .concat(
        isLoading
          ? [
            {
              ...createMessage({
                role: "assistant",
                content: "……",
              }),
              preview: true,
            },
          ]
          : [],
      )
      .concat(
        userInput.length > 0 && config.sendPreviewBubble
          ? [
            {
              ...createMessage({
                role: "user",
                content: userInput,
              }),
              preview: true,
            },
          ]
          : [],
      );
  }, [
    config.sendPreviewBubble,
    context,
    isLoading,
    session.messages,
    userInput,
  ]);

  const [msgRenderIndex, _setMsgRenderIndex] = useState(
    Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
  );

  function setMsgRenderIndex(newIndex: number) {
    newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
    newIndex = Math.max(0, newIndex);
    _setMsgRenderIndex(newIndex);
  }

  const messages = useMemo(() => {
    const endRenderIndex = Math.min(
      msgRenderIndex + 3 * CHAT_PAGE_SIZE,
      renderMessages.length,
    );
    return renderMessages.slice(msgRenderIndex, endRenderIndex);
  }, [msgRenderIndex, renderMessages]);

  const onChatBodyScroll = (e: HTMLElement) => {
    const bottomHeight = e.scrollTop + e.clientHeight;
    const edgeThreshold = e.clientHeight;

    const isTouchTopEdge = e.scrollTop <= edgeThreshold;
    const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
    const isHitBottom =
      bottomHeight >= e.scrollHeight - (isMobileScreen ? 4 : 10);

    const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
    const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

    if (isTouchTopEdge && !isTouchBottomEdge) {
      setMsgRenderIndex(prevPageMsgIndex);
    } else if (isTouchBottomEdge) {
      setMsgRenderIndex(nextPageMsgIndex);
    }

    setHitBottom(isHitBottom);
    setAutoScroll(isHitBottom);
  };
  function scrollToBottom() {
    setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
    scrollDomToBottom();
  }
  function onInputFocus() {
    scrollToBottom();
    setInputFocus(true);
  }
  function onInputBlur() {
    setInputFocus(false);
  }

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length - msgRenderIndex
      : -1;

  const [showPromptModal, setShowPromptModal] = useState(false);

  const clientConfig = useMemo(() => getClientConfig(), []);

  const autoFocus = !isMobileScreen; // wont auto focus on mobile screen

  useCommand({
    fill: setUserInput,
    submit: (text) => {
      doSubmit(text);
    },
    code: (text) => {
      if (accessStore.disableFastLink) return;
      sys.log.info("[Command] got code from url: ", text);
      showConfirm(null, Locale.URLCommand.Code + `code = ${text}`).then((res) => {
        if (res) {
          //accessStore.update((access) => (access.accessCode = text));
        }
      });
    },
    settings: (text) => {
      if (accessStore.disableFastLink) return;

      try {
        const payload = JSON.parse(text) as {
          key?: string;
          url?: string;
        };

        sys.log.info("[Command] got settings from url: ", payload);

        if (payload.key || payload.url) {
          showConfirm(null,
            Locale.URLCommand.Settings +
            `\n${JSON.stringify(payload, null, 4)}`,
          ).then((res) => {
            if (!res) return;
            if (payload.key) {
              accessStore.update(
                (access) => (access.openaiApiKey = payload.key!),
              );
            }
            if (payload.url) {
              accessStore.update((access) => (access.openaiBaseUrl = payload.url!));
            }
            accessStore.update((access) => (access.enableCustomConfig = true));
          });
        }
      } catch {
        sys.log.error("[Command] failed to get settings from url: ", text);
      }
    },
  });

  // edit / insert message modal
  const [showEditMessageModal, setShowEditMessageModal] = useState(false);

  // remember unfinished input
  useEffect(() => {
    // try to load from local storage
    const key = UNFINISHED_INPUT(session.id);
    const mayBeUnfinishedInput = localStorage.getItem(key);
    if (mayBeUnfinishedInput && userInput.length === 0) {
      setUserInput(mayBeUnfinishedInput);
      localStorage.removeItem(key);
    }

    const dom = inputRef.current;
    return () => {
      localStorage.setItem(key, dom?.value ?? "");
    };
  }, []);

  async function uploadFile() {

    if (attachFiles.length >= UPLOAD_MAX_COUNT) {
      return;
    }

    const files: Record<string, string>[] = [];
    files.push(...attachFiles);

    await file.uploadFiles({
      maxCount: UPLOAD_MAX_COUNT,

      onCompleted: (uploadedFiles) => {
        setUploading(false);
        files.push(
          ...uploadedFiles,
        );
      },

      onUploading: () => {
        setUploading(true);
      }
    });

    const filesLength = files.length;
    if (filesLength > UPLOAD_MAX_COUNT) {
      files.splice(UPLOAD_MAX_COUNT, filesLength - UPLOAD_MAX_COUNT);
    }

    setAttachFiles(files);
  }

  // 快捷键 shortcut keys
  const [showShortcutKeyModal, setShowShortcutKeyModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      // 打开新聊天 command + shift + o
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "o"
      ) {
        event.preventDefault();
        setTimeout(() => {
          chatStore.newSession();
          navigate(Path.Chat);
        }, 10);
      }
      // 聚焦聊天输入 shift + esc
      else if (event.shiftKey && event.key.toLowerCase() === "escape") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      // 复制最后一个代码块 command + shift + ;
      else if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.code === "Semicolon"
      ) {
        event.preventDefault();
        const copyCodeButton =
          document.querySelectorAll<HTMLElement>(".copy-code-button");
        if (copyCodeButton.length > 0) {
          copyCodeButton[copyCodeButton.length - 1].click();
        }
      }
      // 复制最后一个回复 command + shift + c
      else if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "c"
      ) {
        event.preventDefault();
        const lastNonUserMessage = messages
          .filter((message) => message.role !== "user")
          .pop();
        if (lastNonUserMessage) {
          const lastMessageContent = getMessageTextContent(lastNonUserMessage);
          copyToClipboard(lastMessageContent);
        }
      }
      // 展示快捷键 command + /
      else if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        setShowShortcutKeyModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [messages, chatStore, navigate]);

  const [showChatSidePanel, setShowChatSidePanel] = useState(false);
  const [isRTChat, setIsRTChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(true);
  const closeRTChat = () => {
    setCanSpeak(true);
    setIsRecording(false);
    setIsRTChat(false);
  };

  // helper to render a file entry (image / audio / video / link)
  function renderFileElement(
    f: Record<string, string>,
    index?: number,
    isMulti?: boolean,
  ) {
    if (file.isImage(f.url)) {
      return (
        <div className={styles["chat-message-item-file"]} key={index}>
          {file.getName(f.url)}
          <Image
            key={index}
            src={f.url}
            alt=""
          />
        </div>
      );
    } else if (file.isAudio(f.url)) {
      return (
        <div className={styles["chat-message-item-file"]} key={index}>
          {file.getName(f.url)}
          <audio src={f.url} controls>
            <track kind="captions" src="" srcLang="en" label="captions" />
          </audio>
        </div>
      );
    } else if (file.isVideo(f.url)) {
      return (
        <div className={styles["chat-message-item-file"]} key={index}>
          {file.getName(f.url)}
          <video src={f.url} controls>
            <track kind="captions" src="" srcLang="en" label="captions" />
          </video>
        </div>
      );
    } else {
      return (
        <div className={styles["chat-message-item-file"]} key={index}>
          <a href={f.url} target="blank">
            {file.getName(f.url)}
          </a>
        </div>
      );
    }
  }

  //是否显示header，输入时隐藏，增加可视面积
  const showHeader = isRTChat ? false : inputFocus ? false : true;

  const [showAction, setShowAction] = useState(false);

  return (
    <>
      <div className={styles.chat} key={session.id}>
        {(showHeader || !isMobileScreen) &&
          <div className="window-header" data-tauri-drag-region>
            <div className={clsx("window-header-title", styles["chat-body-title"])}>
              <div
                className={clsx(
                  "window-header-main-title",
                  styles["chat-body-main-title"],
                )}
              >
                {!session.topic ? Locale.Chat.DefaultTopic : session.topic}
              </div>
              <div className="window-header-sub-title">
                {Locale.Chat.SubTitle(session.messages.length)}
              </div>
            </div>
            <div className="window-actions">
              {/* <div className="window-action-button">
              <IconButton
                icon={<ReloadIcon />}
                bordered
                title={Locale.Chat.Actions.RefreshTitle}
                onClick={() => {
                  showToast(Locale.Chat.Actions.RefreshToast);
                  chatStore.summarizeSession(false, session);
                }}
              />
            </div> */}

              <div className="window-action-button">
                <IconButton
                  icon={<EditOutlined />}
                  bordered
                  title={Locale.Chat.EditMessage.Title}
                  aria={Locale.Chat.EditMessage.Title}
                  onClick={() => setShowEditMessageModal(true)}
                />
              </div>

              <div className="window-action-button">
                <IconButton
                  icon={<CloudDownloadOutlined />}
                  bordered
                  title={Locale.Chat.Actions.Export}
                  onClick={() => {
                    setShowExport(true);
                  }}
                />
              </div>

              <div className="window-action-button">
                <IconButton
                  icon={<ClearOutlined />}
                  bordered
                  title={Locale.Chat.Actions.ClearScreen}
                  aria={Locale.Chat.Actions.ClearScreen}
                  onClick={() => {
                    clearAllMessage();
                  }}
                />
              </div>

            </div>
          </div>
        }
        <PromptToast
          showToast={!hitBottom}
          showModal={showPromptModal}
          setShowModal={setShowPromptModal}
        />
        <div className={styles["chat-main"]}>
          <div className={styles["chat-body-container"]}>
            {/* 对话历史 */}
            <div
              className={styles["chat-body"]}
              ref={scrollRef}
              onScroll={(e) => onChatBodyScroll(e.currentTarget)}
              onMouseDown={() => inputRef.current?.blur()}
              onTouchStart={() => {
                inputRef.current?.blur();
                setAutoScroll(false);
              }}
            >
              {messages.map((message, i) => {
                const isUser = message.role === "user";
                const isContext = i < context.length;
                const showActions =
                  i > 0 &&
                  !(message.content?.length === 0) &&
                  !isContext;
                const showTyping = message.preview || message.isStreaming;

                const shouldShowClearContextDivider =
                  i === clearContextIndex - 1;

                return (
                  <Fragment key={message.id}>
                    <div
                      className={
                        isUser
                          ? styles["chat-message-user"]
                          : styles["chat-message"]
                      }
                    >
                      <div className={styles["chat-message-container"]}
                        onClick={() => { setShowAction(!showAction) }}
                      >
                        <div className={styles["chat-message-header"]}>
                          <div className={styles["chat-message-avatar"]}>

                            {isUser ? (
                              <Avatar avatar={user.userAvatar} />
                            ) : (
                              <>
                                {["system"].includes(message.role) ? (
                                  <Avatar avatar="2699-fe0f" />
                                ) : (
                                  <Avatar avatar={session.mask.avatar} />
                                )}
                              </>
                            )}
                          </div>

                          <div className={styles["chat-model-name"]}>
                            {isUser ? user.userName : message.modelName}
                          </div>

                          {(showActions && showAction) && (
                            <div className={styles["chat-message-actions"]}>
                              <div className={styles["chat-input-actions"]}>
                                {message.isStreaming ? (
                                  <ChatAction
                                    text={Locale.Chat.Actions.Stop}
                                    icon={<PauseCircleOutlined />}
                                    onClick={() => onUserStop(message.id ?? i)}
                                  />
                                ) : (
                                  <>
                                    <ChatAction
                                      text={Locale.Chat.Actions.Edit}
                                      icon={<EditOutlined />}
                                      onClick={async () => {
                                        const newMessage = await showPrompt(
                                          Locale.Chat.Actions.Edit,
                                          getMessageTextContent(message),
                                          10,
                                        );
                                        let newContent: string | MultimodalContent[] =
                                          newMessage;
                                        const files = getMessageFiles(message);
                                        if (files.length > 0) {
                                          newContent = [
                                            { type: "text", text: newMessage },
                                          ];
                                          for (const element of files) {
                                            newContent.push({
                                              type: "file",
                                              url: element.url,
                                            });
                                          }
                                        }
                                        chatStore.updateTargetSession(
                                          session,
                                          (session) => {
                                            const m = session.mask.context
                                              .concat(session.messages)
                                              .find((m) => m.id === message.id);
                                            if (m) {
                                              m.content = newContent;
                                            }
                                          },
                                        );
                                      }}
                                    />

                                    <ChatAction
                                      text={Locale.Chat.Actions.Delete}
                                      icon={<DeleteOutlined />}
                                      onClick={() => onDelete(message.id ?? i)}
                                    />

                                    <ChatAction
                                      text={Locale.Chat.Actions.Copy}
                                      icon={<CopyOutlined />}
                                      onClick={() =>
                                        copyToClipboard(
                                          getMessageTextContent(message),
                                        )
                                      }
                                    />

                                    {config.chatConfig.enable && (
                                      <ChatAction
                                        text={
                                          isSpeaking
                                            ? Locale.Chat.Actions.StopSpeech
                                            : Locale.Chat.Actions.Speech
                                        }
                                        icon={
                                          isSpeaking ? (
                                            <SpeakStopIcon />
                                          ) : (
                                            <SpeakIcon />
                                          )
                                        }
                                        onClick={() => {
                                          if (isSpeaking) {
                                            tts.stop();
                                            setIsSpeaking(false);
                                          }
                                          else {
                                            setIsSpeaking(true);
                                            tts.speak(getMessageTextContent(message),
                                              null,
                                              () => { setIsSpeaking(true); },
                                              (success, text) => {
                                                setIsSpeaking(false);
                                                if (!success) sys.msg.error(text);
                                              });
                                          }
                                        }}
                                      />
                                    )}

                                    {/* <ChatAction
                                      text={Locale.Chat.Actions.Share}
                                      icon={<ShareIcon />}
                                      onClick={() => {
                                        sys.msg.info(Locale.Common.Developing);
                                      }}
                                    /> */}

                                    {
                                      (message.role == "user") &&
                                      <ChatAction
                                        text={Locale.Chat.Actions.Retry}
                                        icon={<SyncOutlined />}
                                        onClick={() => onResend(message)}
                                      />
                                    }

                                    {(message.role != "user") && <>

                                      <ChatAction
                                        text={Locale.Chat.Actions.Useful}
                                        icon={<LikeOutlined />}
                                        onClick={() => {

                                        }}
                                      />

                                      <ChatAction
                                        text={Locale.Chat.Actions.Useless}
                                        icon={<DislikeOutlined />}
                                        onClick={() => {

                                        }}
                                      />
                                    </>
                                    }
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {showTyping && (
                          <div className={styles["chat-message-status"]}>
                            {message.role == "user" ? Locale.Common.Typing : Locale.Common.Processing}
                          </div>
                        )}

                        <div className={styles["chat-message-item"]}                        >
                          <Markdown
                            key={message.isStreaming ? "loading" : "done"}
                            content={getMessageTextContent(message)}
                            loading={
                              (message.preview || message.isStreaming) &&
                              message.content.length === 0 &&
                              !isUser
                            }
                            onDoubleClickCapture={() => {
                              if (!isMobileScreen) return;
                              setUserInput(getMessageTextContent(message));
                            }}
                            fontSize={fontSize}
                            fontFamily={fontFamily}
                            parentRef={scrollRef}
                            defaultShow={i >= messages.length - 6}
                          />

                          {getMessageFiles(message).length > 0 && (
                            <div
                              className={styles["chat-message-item-images"]}
                              style={
                                {
                                  "--image-count":
                                    getMessageFiles(message).length,
                                } as React.CSSProperties
                              }
                            >
                              {getMessageFiles(message).map((f, index) => {
                                return renderFileElement(f, index, false);
                              })}
                            </div>
                          )}
                        </div>

                        <div className={styles["chat-message-action-date"]}>
                          {isContext
                            ? Locale.Chat.IsContext
                            : message.date.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {shouldShowClearContextDivider && <ClearContextDivider />}
                  </Fragment>
                );
              })}
            </div>

            {/* 对话操作 */}
            {!isRTChat &&
              <div className={styles["chat-input-panel"]}>
                <PromptHints
                  prompts={promptHints}
                  onPromptSelect={onPromptSelect}
                />

                <ChatActions
                  uploadFile={uploadFile}
                  setAttachFiles={setAttachFiles}
                  setUploading={setUploading}
                  showPromptModal={() => setShowPromptModal(true)}
                  scrollToBottom={scrollToBottom}
                  hitBottom={hitBottom}
                  uploading={uploading}
                  showPromptHints={() => {
                    // Click again to close
                    if (promptHints.length > 0) {
                      setPromptHints([]);
                      return;
                    }

                    inputRef.current?.focus();
                    setUserInput("/");
                    onSearch("");
                  }}
                  setShowShortcutKeyModal={setShowShortcutKeyModal}
                  setUserInput={setUserInput}
                  setShowChatSidePanel={setShowChatSidePanel}
                  setIsRTChat={setIsRTChat}
                />
                <label
                  className={clsx(styles["chat-input-panel-inner"], {
                    [styles["chat-input-panel-inner-attach"]]:
                      attachFiles.length > 0,
                  })}
                  htmlFor="chat-input"
                >
                  <textarea
                    id="chat-input"
                    ref={inputRef}
                    className={styles["chat-input"]}
                    placeholder={Locale.Chat.Input(submitKey)}
                    onInput={(e) => onInput(e.currentTarget.value)}
                    value={userInput}
                    onKeyDown={onInputKeyDown}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    onClick={scrollDomToBottom}
                    // onPaste={handlePaste}
                    rows={inputRows}
                    autoFocus={autoFocus}
                    style={{
                      fontSize: config.fontSize,
                      fontFamily: config.fontFamily,
                    }}
                  />

                  <div className={styles["attach-area"]}>
                    {attachFiles.length != 0 && (
                      <div className={styles["attach-files"]}>
                        {attachFiles.map((f, index) => {
                          return (
                            <div
                              key={index}
                              className={styles["attach-file"]}
                              style={{ backgroundImage: `url("${file.isImage(f.name) ? f.url : FileIcon.src}")` }}
                            >
                              <div className={styles["attach-file-mask"]}>
                                <DeleteAttachFileButton
                                  deleteFile={() => {
                                    setAttachFiles(
                                      attachFiles.filter((_, i) => i !== index),
                                    );
                                  }}
                                />

                              </div>
                              <div className={styles["attach-file-name"]}>
                                <Tooltip title={f.name}>
                                  {file.getLimitName(f.name)}
                                </Tooltip>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>

                  <IconButton
                    icon={<SendWhiteIcon />}
                    text=""
                    className={clsx(styles["chat-input-send"], {
                      [styles["chat-input-send-attach"]]:
                        attachFiles.length > 0,
                    })}
                    type="primary"
                    onClick={() => doSubmit(userInput)}
                  />
                </label>
              </div>
            }

            {isRTChat &&
              <div className={styles["chat-realtime-panel"]}>
                <div className={styles["chat-realtime-flag"]}>
                  {!canSpeak && <Loading noLogo />}
                </div>

                <div className={styles["chat-realtime-action"]}>

                  {
                    isRecording &&
                    <Button className={styles["chat-realtime-action-stop"]}
                      icon={< RecordCloseIcon />}
                      onClick={() => {
                        stt.cancelSpeech();
                        setIsRecording(false);
                        setCanSpeak(true);
                      }}>{Locale.Voice.Action.StopVoice}</Button>
                  }

                  {
                    isRecording &&
                    <Button className={styles["chat-realtime-action-send"]}
                      icon={< SendIcon />}
                      onClick={() => {
                        setAutoScroll(true);
                        setIsRecording(false);
                        setCanSpeak(false);
                        stt.speech2Text((success, audio, text) => {
                          if (success && text) {
                            setCanSpeak(false);
                            onInput(text);
                            setAutoScroll(true);
                            doSubmit(text);
                          }
                          else {
                            setCanSpeak(true);
                          }

                          if (!success)
                            sys.msg.error(text);
                        })
                      }}>{Locale.Voice.Action.SendVoice}</Button>
                  }



                  {
                    !isRecording &&
                    <Button className={styles["chat-realtime-action-start"]}
                      icon={< RecordOpenIcon />}
                      disabled={!canSpeak}
                      onClick={() => {
                        if (!canSpeak)
                          return;

                        setCanSpeak(false);
                        tts.stop();
                        setIsSpeaking(false);
                        setIsRecording(false);
                        stt.startSpeech((success, text) => {
                          if (success) {
                            setIsRecording(true);
                          }
                          else {
                            sys.msg.error(text);
                          }
                        });

                      }}>{Locale.Voice.Action.StartVoice}</Button>
                  }

                  <Button className={styles["chat-realtime-action-close"]}
                    icon={<CloseOutlined />}
                    onClick={closeRTChat}>{Locale.Voice.Action.CloseVoice}</Button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      {showExport && (
        <ExportMessageModal onClose={() => setShowExport(false)} />
      )}

      {showEditMessageModal && (
        <EditMessageModal
          onClose={() => {
            setShowEditMessageModal(false);
          }}
        />
      )}

      {showShortcutKeyModal && (
        <ShortcutKeyModal onClose={() => setShowShortcutKeyModal(false)} />
      )}
    </>
  );
}

export function Chat() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const navigate = useNavigate();

  useEffect(() => {

    const leftKey = touch.addSlideLeftFunc(() => {
      navigate(Path.Video);
    });

    return () => {
      touch.removeSlideLeftFunc(leftKey);
    };
  }, []);

  return <InnerChat key={session.id}></InnerChat>;
}
