import { useState, useEffect } from "react";

import styles from "./prompt-config.module.scss";
import {
  IconButton,
  TextArea, DataList,
  Modal, showConfirm,
  Input,
  SearchInput
} from "../../components/ui-lib";

//用户状态
import { useUserState } from "../../store/user";

import Locale from "../../locales";
import { usePromptStore } from "../../store/prompt";
import { sys } from "../../utils/sys";
import { Page, Prompt, Result, Updater } from "../../types";
import { OpenAPI } from "@/app/openapi";
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";

function PromptEditorModal(props: {
  prompt: Prompt;
  onUpdate: Updater<Prompt>;
  onClose: () => void;
  onSave: () => void;
  readonly: boolean;
}) {
  const user = useUserState();

  return (
    <div className="modal-dialog">
      <Modal
        title={Locale.Settings.Prompt.Edit}
        onClose={props.onClose}
        actions={
          !props.readonly ?
            [
              <IconButton
                key="close"
                icon={<CloseOutlined />}
                onClick={props.onClose}
                text={Locale.Common.Close}
                bordered
              />,
              <IconButton
                key="save"
                icon={<CheckOutlined />}
                onClick={() => {
                  if (!props.prompt.name ||
                    props.prompt.name.trim().length == 0 ||
                    !props.prompt.content ||
                    props.prompt.content.trim().length == 0) {
                    sys.msg.error(Locale.Prompt.Edit.InvalidData);
                    return;
                  }

                  props.onSave();
                }}
                text={Locale.Common.Save}
                type={"primary"}
                bordered
              />
            ] :
            [
              <IconButton
                key="close"
                icon={<CloseOutlined />}
                onClick={props.onClose}
                text={Locale.Common.Close}
                bordered
              />
            ]
        }
      >
        <div className={styles["edit-prompt-modal"]}>
          <Input
            type="text"
            placeholder={Locale.Prompt.Edit.NamePlaceholder}
            value={props.prompt.name}
            readOnly={props.readonly}
            className={styles["edit-prompt-title"]}
            onInput={(e) => {
              props.onUpdate((mask) => {
                mask.name = e.currentTarget.value;
              });
            }}
          ></Input>
          <TextArea
            placeholder={Locale.Prompt.Edit.PromptPlaceholder}
            value={props.prompt.content}
            readOnly={props.readonly}
            className={styles["edit-prompt-content"]}
            rows={10}
            onInput={(e) => {
              props.onUpdate((mask) => {
                mask.content = e.currentTarget.value;
              });
            }}
          ></TextArea>
        </div>
      </Modal>
    </div>
  );
}

export function PromptListModal(props: { onClose?: () => void }) {
  const [searchInput, setSearchInput] = useState("");
  const promptStore = usePromptStore();
  const user = useUserState();
  const newPrompt = {
    id: "",
    createBy: user.userId,
    isPublic: true,
    createTime: Date.now(),
    name: "",
    content: "",
  };
  const [editingItem, setEditingItem] = useState<Prompt>(newPrompt);
  const [showEditingModal, setShowEditingModal] = useState<boolean>(false);

  const [loadingFlag, setLoadingFlag] = useState(false);
  const [searchResult, setSearchResult] = useState<Result<Page<Prompt>> | null>();

  const onSearch = () => {
    setLoadingFlag(true);
    OpenAPI.aiPromptSearchData({ "name": searchInput, "lang": "", "pageSize": 1000 }).then((result) => {
      if (result.success) {
        setSearchResult(result);
        promptStore.setPrompts(result.result?.records || []);
      }

      setLoadingFlag(false);
    });
  };

  const onSave = () => {
    OpenAPI.aiPromptSaveData(editingItem).then((result) => {
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
    OpenAPI.aiPromptDeleteData(id).then((result) => {
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
  }, []);

  return (
    <div className="modal-dialog">
      <Modal
        title={Locale.Prompt.List.Title}
        onClose={() => props.onClose?.()}
        actions={[]}
        defaultMax={true}
        className={styles["user-prompt-modal"]}
      >

        <DataList
          loading={loadingFlag}
          data={searchResult}
          renderSearch={<>
            <SearchInput
              placeholder={Locale.Prompt.List.Search}
              value={searchInput}
              onInput={(e) => {
                setSearchInput(e.currentTarget.value);
              }}
              onSearch={() => {
                onSearch()
              }}
              onClear={() => {
                setSearchInput("");
              }}
            />

            <IconButton
              className={styles["filter-action"]}
              key="add"
              onClick={() => {
                setEditingItem(newPrompt);
                setShowEditingModal(true);
              }}
              icon={<PlusCircleOutlined />}
              bordered
              text={Locale.Common.Add}
            />
          </>
          }
          renderData={searchResult?.result?.records.map((item, index) => (
            <div className={styles["data-item"]} key={item.id ?? item.name}>
              <div className={styles["data-item-info"]}>
                <div className={styles["user-prompt-header"]}>
                  <div className={styles["user-prompt-title"]}>
                    {item.name}
                  </div>
                  <div className={styles["user-prompt-content"]}>
                    {item.content}
                  </div>
                </div>
              </div>

              <div className={styles["data-item-actions"]}>
                {item.createBy == user.userId &&
                  <IconButton
                    icon={<EditOutlined />}
                    className={styles["data-item-action"]}
                    text={Locale.Common.Edit}
                    onClick={() => {
                      setEditingItem(item);
                      setShowEditingModal(true);
                    }}
                  />
                }
                {item.createBy == user.userId && (
                  <IconButton
                    icon={<DeleteOutlined />}
                    className={styles["data-item-action"]}
                    text={Locale.Common.Delete}
                    onClick={async () => {
                      if (await showConfirm(null, Locale.Common.DeleteConfirm)) {
                        onDelete(item.id);
                      }
                    }
                    }
                  />
                )}

                <IconButton
                  icon={<EyeOutlined />}
                  className={styles["data-item-action"]}
                  text={Locale.Common.View}
                  onClick={() => {
                    setEditingItem(item);
                    setShowEditingModal(true);
                  }}
                />
              </div>
            </div>
          ))}
        />

      </Modal >

      {showEditingModal && (
        <PromptEditorModal
          readonly={(editingItem.createBy != user.userId)}
          prompt={editingItem}
          onClose={() => setShowEditingModal(false)}
          onSave={() => {
            onSave();
          }}
          onUpdate={(updater) => {
            const updateItem = { ...editingItem };
            updater(updateItem);
            setEditingItem(updateItem);
          }}
        />
      )
      }
    </div >
  );
}
