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
import FileIcon from "../../icons/attachfile.png";
import ExportRecordIcon from "../../icons/meetingrecord.svg";

import {
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useModelProviderConfig,
  Theme,
  useAppConfig
} from "../../store";


import {
  copyToClipboard, autoGrowTextArea,
  useMobileScreen,
  getMessageTextContent,
  getMessageFiles, safeLocalStorage
} from "../../utils";

import file from "@/app/utils/file";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../../client/controller";
import Locale from "../../locales";
import styles from "./index.module.scss";

import {
  IconButton,
  Input,
  List,
  ListItem,
  Loading,
  Modal, showConfirm
} from "../../components/ui-lib";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CHAT_PAGE_SIZE, Path,
  REQUEST_TIMEOUT_MS,
  UNFINISHED_INPUT
} from "../../constant";
import { Avatar } from "../../components/emoji";
import { ChatCommandPrefix, useChatCommand, useCommand } from "../../command";
import { prettyObject } from "../../utils/format";
import { getClientConfig } from "../../config/client";
import { isEmpty } from "lodash-es";
import clsx from "clsx";
import { Button, Image, Tooltip } from "antd";
import tts from "../../utils/useTTS";
import stt from "../../utils/useSTT";
import { sys } from "../../utils/sys";
import { useMeeting } from "../../utils/useMeeting";
import { TTTConfigEditor } from "../../pages/config/ttt-config";
import { ExportMessageModal } from "./exporter";
import { ChatMessage, Prompt } from "@/app/types";
import touch from "@/app/utils/touch";
import { AudioOutlined, CheckOutlined, ClearOutlined, CloseOutlined, CopyOutlined, PaperClipOutlined, PauseCircleOutlined, StopOutlined, TranslationOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";

const localStorage = safeLocalStorage();

const Markdown = dynamic(
  async () => (await import("../../components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);


function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;
  const isComposing = useRef(false);

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
        !e.metaKey)
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

export function ChatAction(props: {
  text: string;
  icon: JSX.Element;
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
  setIsRTChat: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const config = useAppConfig();
  const navigate = useNavigate();
  const chatStore = useChatStore();
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

  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    props.setAttachFiles([]);
    props.setUploading(false);
  }, [chatStore, session]);

  return (
    <div className={styles["chat-input-actions"]}>
      <>
        <Button
          className={styles["chat-realtime-action-open"]}
          onClick={() => { props.setIsRTChat(true); }}
          icon={<AudioOutlined />}
        >{Locale.Voice.Title}</Button>

        {/* <ChatAction
          onClick={props.uploadFile}
          text={Locale.Chat.InputActions.UploadImage}
          icon={props.uploading ? <LoadingButtonIcon /> : <ImageIcon />}
        /> */}

        {/* <ChatAction
          onClick={props.showPromptHints}
          text={Locale.Chat.InputActions.Prompt}
          icon={<PromptIcon />}
        /> */}

      </>

      <div className={styles["chat-input-actions-end"]}>

        {/* <ChatAction
          onClick={props.uploadFile}
          text={Locale.Chat.InputActions.UploadFile}
          icon={props.uploading ? <LoadingButtonIcon /> : <AttachIcon />}
        /> */}

        <Button
          className={styles["chat-realtime-action-open"]}
          onClick={props.uploadFile}
          icon={props.uploading ? <LoadingButtonIcon /> : <PaperClipOutlined />}
        >{Locale.Chat.InputActions.UploadFile}</Button>

      </div>
    </div>
  );
}

export function ConnectRoomModal(props: {
  roomNum: string;
  connected: boolean;
  onConnect: (roomNum: string) => void;
  onClose: (roomNum: string) => void;
  onCancel: () => void
}) {
  const [roomNum, setRoomNum] = useState(props.roomNum.length > 0 ? props.roomNum : new Date().getTime() + "");

  return (
    <Modal
      title={Locale.Chat.EditRoomNum.Title}
      onClose={props.onCancel}
      hideMax={true}
      actions={
        props.connected ?
          [
            <IconButton
              text={Locale.Common.Cancel}
              icon={<StopOutlined />}
              key="cancel"
              onClick={() => {
                props.onCancel();
              }}
            />,

            <IconButton
              text={Locale.Chat.EditRoomNum.Close}
              icon={<UserDeleteOutlined />}
              key="close"
              type="primary"
              onClick={() => {
                props.onClose(roomNum);
              }}
            />
          ] :
          [
            <IconButton
              text={Locale.Common.Cancel}
              icon={<StopOutlined />}
              key="cancel"
              onClick={() => {
                props.onCancel();
              }}
            />,
            <IconButton
              type="primary"
              text={Locale.Chat.EditRoomNum.Join}
              icon={<CheckOutlined />}
              key="ok"
              onClick={() => {
                props.onConnect(roomNum);
              }}
            />,
          ]
      }
    >
      <div style={{ minWidth: "40vw" }}>
        <List>
          <ListItem
            title={Locale.Chat.EditRoomNum.Topic.Title}
            desc={Locale.Chat.EditRoomNum.Topic.SubTitle}
          >
            <Input
              type="text"
              value={roomNum}
              disabled={props.connected}
              readOnly={props.connected}
              onInput={(e) =>
                setRoomNum(e.currentTarget.value)
              }
            ></Input>
            <IconButton
              icon={<CopyOutlined />}
              onClick={() => { copyToClipboard(roomNum) }}
            ></IconButton>
          </ListItem>

        </List>
      </div>

    </Modal>
  );
}

export function ExportRecordsModal(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const [messages, setMessages] = useState(session.messages.slice());

  return (
    <Modal
      title={Locale.Chat.ExportRecords.Title}
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

      <List>
        <ListItem
          title={Locale.Chat.EditMessage.Topic.Title}
          desc={Locale.Chat.EditMessage.Topic.SubTitle}
        >
          <Input
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

    </Modal>
  );
}

export function ChangeTTTConfigModal(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();
  const [tTTTConfig, setTTTTConfig] = useState(config.tttConfig);

  return (
    <Modal
      title={Locale.Chat.ChangeLanguage.Title}
      onClose={props.onClose}
      hideMax={true}
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
            config.update((config) => (config.tttConfig = tTTTConfig));
            sys.log.info("ttttConfig>>>", tTTTConfig);
            props.onClose();
          }}
        />,
      ]}
    >
      <div >
        <List>
          <TTTConfigEditor
            config={{ ...tTTTConfig, sourceText: "" }}
            updateConfig={(updater) => {
              const tempConfig = { ...tTTTConfig, sourceText: "" };
              updater(tempConfig);
              setTTTTConfig(tempConfig);
            }}
          />
        </List>
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

interface IParam {
  room?: string;
}

function CBCPage() {
  type RenderMessage = ChatMessage & { preview?: boolean };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roomParam = searchParams.get("room") || "";
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();
  const [connected, setConnected] = useState<boolean>(false);
  const [roomNum, setRoomNum] = useState<string>(roomParam);
  const [roomUsers, setRoomUsers] = useState<any>([]);

  const meeting = useMeeting((connectedUsers: []) => {
    sys.log.info("会议室人数：", connectedUsers.length);
    setRoomUsers(connectedUsers);
  });

  useEffect(() => {
    return () => {
      sys.log.info("离开会议室", roomNum);
      meeting.disconnect(roomNum);
      chatStore.deleteSession(chatStore.currentSessionIndex);
    };
  }, []);

  const fontSize = config.fontSize;
  const fontFamily = config.fontFamily;

  // 弹窗编辑标识
  const [showExportRecordsModal, setShowExportRecordsModal] = useState(false);
  const [showRoomNumModal, setShowRoomNumModal] = useState(false);
  const [showChangeLanguageModal, setShowChangeLanguageModal] = useState(false);

  // 指示标识
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");

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
  const [attachFiles, setAttachFiles] = useState<Record<string, string>[]>([]);


  // prompt hints
  const [promptHints, setPromptHints] = useState<RenderPrompt[]>([]);

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
    // new: () => chatStore.newSession(),
    // newm: () => navigate(Path.NewChat),
    // prev: () => chatStore.nextSession(-1),
    // next: () => chatStore.nextSession(1),
    clear: () =>
      chatStore.updateTargetSession(
        session,
        (session) => (session.clearContextIndex = session.messages.length),
      ),
    // fork: () => chatStore.forkSession(),
    // del: () => chatStore.deleteSession(chatStore.currentSessionIndex),
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
      // if (text.startsWith("/")) {
      //   let searchText = text.slice(1);
      //   onSearch(searchText);
      // }
    }
  };

  const doSubmit = (userInput: string) => {
    if (userInput.trim() === "" && isEmpty(attachFiles)) return;

    const matchCommand = chatCommands.match(userInput);

    if (matchCommand.matched) {
      setUserInput("");
      setPromptHints([]);
      matchCommand.invoke();
      return;
    }

    //发送聊天
    meeting.chat(userInput, attachFiles, true).then(() => setIsLoading(false));

    setAttachFiles([]);
    chatStore.setLastInput(userInput);
    setUserInput("");
    setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

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

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });
    });
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

  const deleteMessage = (msgId?: string) => {
    chatStore.updateTargetSession(
      session,
      (session) =>
        (session.messages = session.messages.filter((m) => m.id !== msgId)),
    );
  };

  const onDelete = (msgId: string) => {
    deleteMessage(msgId);
  };

  const modelConfig = useModelProviderConfig();

  const context: RenderMessage[] = [];

  if (
    context.length === 0 &&
    session.messages.at(0)?.content !== BOT_HELLO.content
  ) {
    const copiedHello = Object.assign({}, BOT_HELLO);
    if (!modelConfig.isAuthorized()) {
      copiedHello.content = Locale.Error.Unauthorized;
      context.push(copiedHello);
    }
    //context.push(copiedHello);
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

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length - msgRenderIndex
      : -1;



  const clientConfig = useMemo(() => getClientConfig(), []);

  const autoFocus = !isMobileScreen; // wont auto focus on mobile screen
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  useCommand({
    fill: setUserInput,
    submit: (text) => {
      doSubmit(text);
    },
    code: (text) => {
      if (modelConfig.disableFastLink) return;
      sys.log.info("[Command] got code from url: ", text);
      showConfirm(null, Locale.URLCommand.Code + `code = ${text}`).then((res) => {
        if (res) {
          //accessStore.update((access) => (access.accessCode = text));
        }
      });
    },
    settings: (text) => {
      if (modelConfig.disableFastLink) return;

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
              modelConfig.update(
                (access) => (access.openaiApiKey = payload.key!),
              );
            }
            if (payload.url) {
              modelConfig.update((access) => (access.openaiBaseUrl = payload.url!));
            }
            modelConfig.update((access) => (access.enableCustomConfig = true));
          });
        }
      } catch {
        sys.log.error("[Command] failed to get settings from url: ", text);
      }
    },
  });



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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const handlePaste = useCallback(
  //   async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
  //     const currentModel = chatStore.currentSession().mask.modelConfig.model;
  //     if (!isVisionModel(currentModel)) {
  //       return;
  //     }
  //     const items = (event.clipboardData || window.clipboardData).items;
  //     for (const item of items) {
  //       if (item.kind === "file" && item.type.startsWith("image/")) {
  //         event.preventDefault();
  //         const file = item.getAsFile();
  //         if (file) {
  //           const images: string[] = [];
  //           images.push(...attachImages);
  //           images.push(
  //             ...(await new Promise<string[]>((res, rej) => {
  //               setUploading(true);
  //               const imagesData: string[] = [];
  //               uploadImageRemote(file)
  //                 .then((dataUrl) => {
  //                   imagesData.push(dataUrl);
  //                   setUploading(false);
  //                   res(imagesData);
  //                 })
  //                 .catch((e) => {
  //                   setUploading(false);
  //                   rej(e);
  //                 });
  //             })),
  //           );
  //           const imagesLength = images.length;

  //           if (imagesLength > 3) {
  //             images.splice(3, imagesLength - 3);
  //           }
  //           setAttachImages(images);
  //         }
  //       }
  //     }
  //   },
  //   [attachImages, chatStore],
  // );

  async function uploadFile() {
    if (attachFiles.length >= 3) {
      sys.msg.info(Locale.Common.SaveSuccess);
      return;
    }

    const files: Record<string, string>[] = [];
    files.push(...attachFiles);

    await file.uploadFiles(
      {
        maxCount: 3,
        
        onCompleted: (uploadedFiles) => {
          setUploading(false);
          files.push(
            ...uploadedFiles,
          );
        },

        onUploading: () => {
          setUploading(true);
        }
      }
    );

    const filesLength = files.length;
    if (filesLength > 3) {
      files.splice(3, filesLength - 3);
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
        <Image
          className={
            isMulti
              ? styles["chat-message-item-image-multi"]
              : styles["chat-message-item-image"]
          }
          key={index}
          src={f.url}
          alt=""
        />
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

  return (
    <>
      <div className={styles.chat} key={session.id}>
        <div className="window-header" data-tauri-drag-region>
          <div
            className={clsx("window-header-title", styles["chat-body-title"])}
          >
            <div className={styles["chat-body-title-txt"]}>参会人数：{roomUsers.length} </div>
            <div className={styles["chat-body-title-icon"]}>
              {roomUsers.map((user: any, i: any) => {
                return <Avatar key={user.userId} avatar={user.userAvatar} />
              })}
            </div>
          </div>

          <div className="window-actions">

            <div className="window-action-button">
              <IconButton
                icon={<TranslationOutlined />}
                bordered
                title={Locale.Chat.ChangeLanguage.Title}
                onClick={() => {
                  setShowChangeLanguageModal(true);
                }}
              />
            </div>

            <div className="window-action-button">
              <IconButton
                icon={<UserAddOutlined />}
                className={connected ? styles["window-action-button-connected"] : ""}
                bordered
                title={Locale.Chat.EditRoomNum.Title}
                aria={Locale.Chat.EditRoomNum.Title}
                onClick={() => setShowRoomNumModal(true)}
              />
            </div>

            <div className="window-action-button">
              <IconButton
                icon={<ExportRecordIcon />}
                bordered
                title={Locale.Chat.ExportRecords.Title}
                onClick={() => {
                  setShowExportRecordsModal(true);
                }}
              />
            </div>
          </div>

        </div>

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
                  !(message.preview || message.content.length === 0) &&
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
                      <div className={styles["chat-message-container"]}>
                        <div className={styles["chat-message-header"]}>
                          <div className={styles["chat-message-avatar"]}>
                            {/* <div className={styles["chat-message-edit"]}>
                              <IconButton
                                icon={<EditIcon />}
                                aria={Locale.Chat.Actions.Edit}
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
                              ></IconButton>
                            </div> */}

                            <Avatar avatar={message.userAvatar} />

                          </div>

                          <div className={styles["chat-model-name"]}>
                            {message.userName}
                          </div>

                          {showActions && (
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
                                      text={Locale.Chat.Actions.Delete}
                                      icon={<ClearOutlined />}
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
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {showTyping && (
                          <div className={styles["chat-message-status"]}>
                            {Locale.Common.Typing}
                          </div>
                        )}
                        <div className={styles["chat-message-item"]}>
                          <Markdown
                            key={message.isStreaming ? "loading" : "done"}
                            content={getMessageTextContent(message)}
                            loading={
                              (message.preview || message.isStreaming) &&
                              message.content.length === 0 &&
                              !isUser
                            }
                            //   onContextMenu={(e) => onRightClick(e, message)} // hard to use
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
                  showPromptModal={() => { }}
                  scrollToBottom={scrollToBottom}
                  hitBottom={hitBottom}
                  uploading={uploading}
                  showPromptHints={() => {
                    // Click again to close
                    // if (promptHints.length > 0) {
                    //   setPromptHints([]);
                    //   return;
                    // }

                    // inputRef.current?.focus();
                    // setUserInput("/");
                    // onSearch("");
                  }}
                  setShowShortcutKeyModal={setShowShortcutKeyModal}
                  setUserInput={setUserInput}
                  setIsRTChat={setIsRTChat}
                />
                <label
                  className={clsx(styles["chat-input-panel-inner"], {
                    [styles["chat-input-panel-inner-attach"]]:
                      attachFiles.length !== 0,
                  })}
                  htmlFor="chat-input"
                >
                  <textarea
                    id="chat-input"
                    ref={inputRef}
                    className={styles["chat-input"]}
                    // placeholder={Locale.Chat.Input(submitKey)}
                    onInput={(e) => onInput(e.currentTarget.value)}
                    value={userInput}
                    onKeyDown={onInputKeyDown}
                    onFocus={scrollToBottom}
                    onClick={scrollToBottom}
                    // onPaste={handlePaste}
                    rows={inputRows}
                    autoFocus={autoFocus}
                    style={{
                      fontSize: config.fontSize,
                      fontFamily: config.fontFamily,
                    }}
                  />

                  <div className={styles["attach-area"]}>

                    {/* {attachImages.length != 0 && (
                      <div className={styles["attach-images"]}>
                        {attachImages.map((image, index) => {
                          return (
                            <div
                              key={index}
                              className={styles["attach-image"]}
                              style={{ backgroundImage: `url("${image}")` }}
                            >
                              <div className={styles["attach-image-mask"]}>
                                <DeleteAttachFileButton
                                  deleteFile={() => {
                                    setAttachImages(
                                      attachImages.filter((_, i) => i !== index),
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )} */}

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
                    className={styles["chat-input-send"]}
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
                            onInput(text);
                            setAutoScroll(true);
                            doSubmit(text);
                            setCanSpeak(true);
                            setIsRecording(false);
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
                        stt.startSpeech((started, text) => {
                          if (started) {
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

      {showExportRecordsModal && (
        <ExportMessageModal onClose={() => setShowExportRecordsModal(false)} />
      )}

      {showRoomNumModal && (
        <ConnectRoomModal
          roomNum={roomNum}
          connected={connected}
          onCancel={() => {
            setShowRoomNumModal(false);
          }}
          onConnect={(roomNum) => {
            if (roomNum) {
              setRoomNum(roomNum);
              meeting.connect(roomNum);
              setConnected(true);
              setShowRoomNumModal(false);
            }
          }}
          onClose={(roomNum) => {
            if (roomNum) {
              meeting.disconnect(roomNum);
              setRoomNum("");
              setConnected(false);
              setRoomUsers([]);
              setShowRoomNumModal(false);
            }
          }}
        />
      )}

      {/* {showShortcutKeyModal && (
        <ShortcutKeyModal
          onClose={() => {
            setShowShortcutKeyModal(false)
          }} />
      )} */}

      {showChangeLanguageModal && (
        <ChangeTTTConfigModal
          onClose={() => {
            setShowChangeLanguageModal(false)
          }} />
      )}
    </>
  );
}

export function CBC() {
  const navigate = useNavigate();

  useEffect(() => {
    const leftKey = touch.addSlideLeftFunc(() => {
      navigate(Path.Setting);
    });
    const rightKey = touch.addSlideRightFunc(() => {
      navigate(Path.MV);
    });

    return () => {
      touch.removeSlideLeftFunc(leftKey);
      touch.removeSlideRightFunc(rightKey);
    };
  }, []);

  return <CBCPage></CBCPage>
}
