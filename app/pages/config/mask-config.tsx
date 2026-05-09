import styles from "./mask-config.module.scss";

import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../../client/api";
import { Avatar, AvatarPicker } from "../../components/emoji";
import {
  IconButton,
  TextArea,
  List,
  ListItem,
  DataList,
  Modal,
  Popover,
  showConfirm,
  Select,
  Input,
  SearchInput,
} from "../../components/ui-lib";
import { Path } from "../../constant";
import Locale, { ALL_LANG_OPTIONS } from "../../locales";
import {
  createMessage,
  ModelConfig, useAppConfig,
  useChatStore
} from "../../store";
import { useMaskStore } from "../../store/mask";
import { useUserState } from "../../store/user";
import { ChatMessage, DefaultMask, Mask, MultimodalContent, Page, Result, Updater } from "../../types";
import {
  getMessageFiles,
  getMessageTextContent,
  reorder
} from "../../utils";
import { sys } from "../../utils/sys";
import { ModelConfigEditor } from "./model-config";
import { OpenAPI } from "@/app/openapi";
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, EyeOutlined, HolderOutlined, PlusCircleOutlined, SearchOutlined, WechatOutlined } from "@ant-design/icons";

export function MaskEditor(props: {
  mask: Mask;
  updateMask: Updater<Mask>;
  extraListItems?: JSX.Element;
  readonly?: boolean;
  shouldSyncFromGlobal?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const updateConfig = (updater: (config: ModelConfig) => void) => {
    if (props.readonly) return;

    const config = { ...props.mask.modelConfig };
    updater(config);
    props.updateMask((mask) => {
      mask.modelConfig = config;
      // if user changed current session mask, it will disable auto sync
      mask.syncGlobalConfig = false;
    });
  };

  return (
    <>
      <List>
        <ListItem title={Locale.Mask.Edit.Avatar}>
          <Popover
            content={
              <AvatarPicker
                onEmojiClick={(emoji) => {
                  props.updateMask((mask) => (mask.avatar = emoji));
                  setShowPicker(false);
                }}
              ></AvatarPicker>
            }
            open={showPicker}
            onClose={() => setShowPicker(false)}
          >
            <div
              tabIndex={0}
              aria-label={Locale.Mask.Edit.Avatar}
              onClick={() => setShowPicker(true)}
              style={{ cursor: "pointer" }}
            >
              <Avatar avatar={props.mask.avatar} />
            </div>
          </Popover>
        </ListItem>
        <ListItem title={Locale.Mask.Edit.Name}>
          <Input
            aria-label={Locale.Mask.Edit.Name}
            type="text"
            value={props.mask.name}
            onInput={(e) =>
              props.updateMask((mask) => {
                mask.name = e.currentTarget.value;
              })
            }
          />
        </ListItem>

        {/* <ListItem
          title={Locale.Mask.Config.HideContext.Title}
          desc={Locale.Mask.Config.HideContext.SubTitle}
        >
          <input
            aria-label={Locale.Mask.Config.HideContext.Title}
            type="checkbox"
            checked={props.mask.hideContext}
            onChange={(e) => {
              props.updateMask((mask) => {
                mask.hideContext = e.currentTarget.checked;
              });
            }}
          ></input>
        </ListItem> */}

        {/* {globalConfig.enableArtifacts && (
          <ListItem
            title={Locale.Mask.Config.Artifacts.Title}
            desc={Locale.Mask.Config.Artifacts.SubTitle}
          >
            <input
              aria-label={Locale.Mask.Config.Artifacts.Title}
              type="checkbox"
              checked={props.mask.enableArtifacts !== false}
              onChange={(e) => {
                props.updateMask((mask) => {
                  mask.enableArtifacts = e.currentTarget.checked;
                });
              }}
            ></input>
          </ListItem>
        )}
        {globalConfig.enableCodeFold && (
          <ListItem
            title={Locale.Mask.Config.CodeFold.Title}
            desc={Locale.Mask.Config.CodeFold.SubTitle}
          >
            <input
              aria-label={Locale.Mask.Config.CodeFold.Title}
              type="checkbox"
              checked={props.mask.enableCodeFold !== false}
              onChange={(e) => {
                props.updateMask((mask) => {
                  mask.enableCodeFold = e.currentTarget.checked;
                });
              }}
            ></input>
          </ListItem>
        )}

        {!props.shouldSyncFromGlobal ? (
          <ListItem
            title={Locale.Mask.Config.Share.Title}
            desc={Locale.Mask.Config.Share.SubTitle}
          >
            <IconButton
              aria={Locale.Mask.Config.Share.Title}
              icon={<CopyIcon />}
              text={Locale.Mask.Config.Share.Action}
              onClick={copyMaskLink}
            />
          </ListItem>
        ) : null}

        {props.shouldSyncFromGlobal ? (
          <ListItem
            title={Locale.Mask.Config.Sync.Title}
            desc={Locale.Mask.Config.Sync.SubTitle}
          >
            <input
              aria-label={Locale.Mask.Config.Sync.Title}
              type="checkbox"
              checked={props.mask.syncGlobalConfig}
              onChange={async (e) => {
                const checked = e.currentTarget.checked;
                if (
                  checked &&
                  (await showConfirm(null, Locale.Mask.Config.Sync.Confirm))
                ) {
                  props.updateMask((mask) => {
                    mask.syncGlobalConfig = checked;
                    mask.modelConfig = { ...globalConfig.modelConfig };
                  });
                } else if (!checked) {
                  props.updateMask((mask) => {
                    mask.syncGlobalConfig = checked;
                  });
                }
              }}
            ></input>
          </ListItem>
        ) : null} */}
      </List>

      <List title={Locale.Mask.Edit.ChatMessage} enableFold={true} defaultFolded={true}>

        <ListItem vertical={true}>
          <ChatMessageEditor
            context={props.mask.context}
            updateContext={(updater) => {
              const context = props.mask.context.slice();
              updater(context);
              props.updateMask((mask) => (mask.context = context));
            }}
          /></ListItem>
      </List>

      <List title={Locale.Mask.Edit.Model} enableFold={true} defaultFolded={true}>
        <ModelConfigEditor
          modelConfig={{ ...props.mask.modelConfig }}
          updateConfig={updateConfig}
        />
        {props.extraListItems}
      </List>
    </>
  );
}

function ChatMessageItemEditor(props: {
  index: number;
  prompt: ChatMessage;
  update: (prompt: ChatMessage) => void;
  remove: () => void;
}) {
  const [focusingInput, setFocusingInput] = useState(false);

  return (
    <div className={styles["context-prompt-row"]}>
      {!focusingInput && (
        <>
          <div className={styles["context-drag"]}>
            <HolderOutlined />
          </div>
          <Select
            className={styles["context-role"]}
            items={
              ROLES.map((r) => (
                {
                  title: r,
                  value: r
                }
              ))
            }
            defaultSelectedValue={[props.prompt.role]}
            onSelectValue={
              (values) => {
                props.update({
                  ...props.prompt,
                  role: values[0],
                })
              }
            }
          />
        </>
      )}
      <TextArea
        value={getMessageTextContent(props.prompt)}
        className={styles["context-content"]}
        autoSize={false}
        rows={focusingInput ? 5 : 1}
        onFocus={() => setFocusingInput(true)}
        onBlur={() => {
          setFocusingInput(false);
          // If the selection is not removed when the user loses focus, some
          // extensions like "Translate" will always display a floating bar
          window?.getSelection()?.removeAllRanges();
        }}
        onInput={(e) =>
          props.update({
            ...props.prompt,
            content: e.currentTarget.value as any,
          })
        }
      />
      {!focusingInput && (
        <IconButton
          icon={<DeleteOutlined />}
          className={styles["context-delete-button"]}
          onClick={() => props.remove()}
          bordered
        />
      )}
    </div>
  );
}

export function ChatMessageEditor(props: {
  context: ChatMessage[];
  updateContext: (updater: (context: ChatMessage[]) => void) => void;
}) {
  const context = props.context;

  const addContextPrompt = (prompt: ChatMessage, i: number) => {
    props.updateContext((context) => context.splice(i, 0, prompt));
  };

  const removeContextPrompt = (i: number) => {
    props.updateContext((context) => context.splice(i, 1));
  };

  const updateContextPrompt = (i: number, prompt: ChatMessage) => {
    props.updateContext((context) => {
      const files = getMessageFiles(context[i]);
      context[i] = prompt;
      if (files.length > 0) {
        const text = getMessageTextContent(context[i]);
        const newContext: MultimodalContent[] = [{ type: "text", text }];
        for (const file of files) {
          newContext.push({ type: "file", url: file.url });
        }
        context[i].content = newContext;
      }
    });
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) {
      return;
    }
    const newContext = reorder(
      context,
      result.source.index,
      result.destination.index,
    );
    props.updateContext((context) => {
      context.splice(0, context.length, ...newContext);
    });
  };

  return (
    <div className={styles["context-prompt"]} >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="context-prompt-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {context.map((c, i) => (
                <Draggable
                  draggableId={c.id || i.toString()}
                  index={i}
                  key={c.id}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <ChatMessageItemEditor
                        index={i}
                        prompt={c}
                        update={(prompt) => updateContextPrompt(i, prompt)}
                        remove={() => removeContextPrompt(i)}
                      />
                      <div
                        className={styles["context-prompt-insert"]}
                        onClick={() => {
                          addContextPrompt(
                            createMessage({
                              role: "user",
                              content: "",
                              date: new Date().toLocaleString(),
                            }),
                            i + 1,
                          );
                        }}
                      >
                        <PlusCircleOutlined />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {props.context.length === 0 && (
        <div className={styles["context-prompt-row"]}>
          <IconButton
            icon={<PlusCircleOutlined />}
            text={Locale.Context.Add}
            bordered
            className={styles["context-prompt-button"]}
            onClick={() =>
              addContextPrompt(
                createMessage({
                  role: "user",
                  content: "",
                  date: "",
                }),
                props.context.length,
              )
            }
          />
        </div>
      )}
    </div>
  );
}

export function MaskListPage() {
  const navigate = useNavigate();

  return (
    <div className={styles["mask-page"]}>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.Mask.List.Title}
          </div>
        </div>

        <div className="window-actions">
          {/* <div className="window-action-button">
              <IconButton
                icon={<DownloadIcon />}
                bordered
                onClick={downloadAll}
                text={Locale.Common.Export}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<UploadIcon />}
                text={Locale.Common.Import}
                bordered
                onClick={() => importFromFile()}
              />
            </div> */}
          <div className="window-action-button">
            <IconButton
              icon={<CloseOutlined />}
              bordered
              onClick={() => navigate(-1)}
            />
          </div>
        </div>
      </div>

      <div className={styles["mask-body"]}>
        <MaskList></MaskList>
      </div>
    </div>
  );
}

export function MaskListModal(props: { onClose?: () => void }) {
  return (
    <Modal
      title={Locale.Settings.Mask.List}
      onClose={() => props.onClose?.()}
      actions={[]}
      defaultMax={true}
      className={styles["user-prompt-modal"]}
    >
      <MaskList></MaskList>
    </Modal >
  );
}
function MaskList() {
  const navigate = useNavigate();
  const config = useAppConfig();
  const maskStore = useMaskStore();
  const chatStore = useChatStore();
  const user = useUserState();

  const filterLang = maskStore.language;

  const [searchText, setSearchText] = useState<string>("");
  const [editingMask, setEditingMask] = useState<Mask>(DefaultMask);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const closeMaskModal = () => setShowConfigModal(false);
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [searchResult, setSearchResult] = useState<Result<Page<Mask>> | null>();

  const onSearch = () => {
    setLoadingFlag(true);
    OpenAPI.aiMaskSearchData({ "name": searchText ?? "", "lang": filterLang ?? "", "pageSize": 1000 }).then((result) => {
      if (result.success) {
        sys.log.info(">>>加载角色数据:{}条", result.result?.total);
        setSearchResult(result);
        maskStore.setMasks(result.result?.records || []);
      }

      setLoadingFlag(false);
    });
  };

  const onSave = () => {
    if (!editingMask.name || editingMask.name.length > 20) {
      sys.msg.error(Locale.Mask.Edit.InvalidData);
      return;
    }

    OpenAPI.aiMaskSaveData(editingMask).then((result) => {
      if (result.success) {
        sys.msg.success(Locale.Common.SaveSuccess);
      }
      else {
        sys.msg.error(result.message);
      }

      onSearch();
    });
  };

  const onDelete = (id: string) => {
    OpenAPI.aiMaskDeleteData(id)
      .then((result) => {
        if (result.success) {
          sys.msg.success(Locale.Common.DeleteSuccess);
        }
        else {
          sys.msg.error(Locale.Common.DeleteFailed + result.message);
        }

        onSearch();
      });
  };

  useEffect(() => {
    onSearch();
    return () => {

    };
  }, []);

  return (
    <>
      <div className={styles["mask-data"]}>
        <DataList
          loading={loadingFlag}
          data={searchResult}
          renderSearch={<>
            <SearchInput
              placeholder={Locale.Mask.List.Search}
              value={searchText}
              onInput={(e) => {
                setSearchText(e.currentTarget.value);
              }}
              onSearch={() => {
                onSearch()
              }}
              onClear={() => {
                setSearchText("");
              }}
            />

            <IconButton
              className={styles["filter-action"]}
              icon={<PlusCircleOutlined />}
              text={Locale.Common.Add}
              bordered
              onClick={() => {
                setEditingMask({ ...DefaultMask, createBy: user.userId });
                setShowConfigModal(true);
              }}
            />
          </>
          }
          renderData={searchResult?.result?.records.map((item, index) => (
            <div className={styles["data-item"]} key={item.id}>
              <div className={styles["data-item-info"]}>
                <div className={styles["mask-icon"]}>
                  <Avatar avatar={item.avatar} />
                </div>
                <div className={styles["mask-title"]}>
                  <div className={styles["mask-name"]}>{item.name}</div>
                  <div className={clsx(styles["mask-info"], "one-line")}>
                    {`${Locale.Mask.ChatMessage.Info(item.context.length)} / ${ALL_LANG_OPTIONS[item.lang]
                      } / ${item.modelConfig.modelName}`}
                  </div>
                </div>
              </div>
              <div className={styles["data-item-actions"]} >

                {item.createBy == user.userId ? (
                  <IconButton
                    icon={<EditOutlined />}
                    text={Locale.Common.Edit}
                    className={styles["data-item-action"]}
                    onClick={() => {
                      setEditingMask(item);
                      setShowConfigModal(true);
                    }}
                  />
                ) : (
                  <IconButton
                    icon={<EyeOutlined />}
                    text={Locale.Common.View}
                    className={styles["data-item-action"]}
                    onClick={() => {
                      setEditingMask(item);
                      setShowConfigModal(true);
                    }}
                  />
                )}
                {item.createBy == user.userId && (
                  <IconButton
                    icon={<DeleteOutlined />}
                    text={Locale.Common.Delete}
                    className={styles["data-item-action"]}
                    onClick={async () => {
                      if (await showConfirm(null, Locale.Common.DeleteConfirm)) {
                        onDelete(item.id);
                      }
                    }}
                  />
                )}

                <IconButton
                  icon={<WechatOutlined />}
                  text={Locale.Mask.ChatMessage.Chat}
                  type={"primary"}
                  className={styles["data-item-action"]}
                  onClick={() => {
                    chatStore.newSession(item);
                    config.update((config) => {
                      config.modelConfig.modelName = item.modelConfig.modelName;
                      config.modelConfig.modelProvider = item.modelConfig.modelProvider;
                    });
                    navigate(Path.Chat);
                  }}
                />
              </div>
            </div>
          ))}
        />
      </div>

      {showConfigModal && (
        <div className="modal-dialog">
          <Modal
            title={Locale.Mask.Edit.Title(editingMask?.createBy != user.userId)}
            onClose={closeMaskModal}
            defaultMax={true}
            actions={
              editingMask?.createBy == user.userId ?
                [
                  <IconButton
                    icon={<CloseOutlined />}
                    text={Locale.Common.Close}
                    key="export"
                    bordered
                    onClick={closeMaskModal}
                  />,

                  <IconButton
                    key="save"
                    type="primary"
                    icon={<CheckOutlined />}
                    bordered
                    text={Locale.Common.Save}
                    onClick={() => {
                      onSave();
                    }}
                  />]
                :
                [
                  <IconButton
                    icon={<CloseOutlined />}
                    text={Locale.Common.Close}
                    key="export"
                    bordered
                    onClick={closeMaskModal}
                  />
                ]
            }

          >
            <MaskEditor
              mask={editingMask}
              updateMask={(updater) => {
                const updateMask = { ...editingMask };
                updater(updateMask);
                setEditingMask(updateMask);
              }
              }
              readonly={editingMask?.createBy != user.userId}
            />
          </Modal>
        </div>
      )}
    </>
  );
}
