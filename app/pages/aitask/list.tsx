import styles from "./list.module.scss";
import AIVideoIcon from "../../icons/aivideo.svg";
import ReDoIcon from "../../icons/redo.svg";

import SpeedIcon from "../../icons/speed.svg";
import StatusCompleteIcon from "../../icons/status-complete.svg";
import StatusErrorIcon from "../../icons/status-error.svg";
import StatusProcessingIcon from "../../icons/status-processing.svg";
import StatusCreatedIcon from "../../icons/status-created.svg";
import StatusClosedIcon from "../../icons/status-closed.svg";
import StatusDownloadIcon from "../../icons/status-download.svg";
import {
  IconButton,
  DataList, showConfirm
} from "../../components/ui-lib";
import Locale from "../../locales";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useUserState } from "../../store/user";
import {
  MainTask,
  DefaultMainTask,
  DefaultAudioTask,
  DefaultVideoTask,
  TaskStatus,
} from "./types";
import { Page, Result } from "../../types";
import { message, Tooltip } from "antd";
import moment from "moment";
import { PaymentInfo } from "../../components/user-account";
import { sys } from "../../utils/sys";
import { OpenAPI } from "@/app/openapi";
import touch from "@/app/utils/touch";
import { useAppConfig } from "@/app/store";
import { AccountBookOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, PlusCircleOutlined, SyncOutlined } from "@ant-design/icons";

export type EditFlag = "add" | "edit" | "redo";

export default function P2VList(props: Readonly<{
  category: number;
  onEditData: (task: MainTask, editFlag: EditFlag) => void;
  refreshTimestamp?: number | string;
}>) {
  const user = useUserState();
  const appConfig = useAppConfig();
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [searchParam, setSearchParam] = useState();
  const [searchResult, setSearchResult] = useState<Result<Page<MainTask>> | null>();

  const onSearch = () => {
    setLoadingFlag(true);
    OpenAPI.aiTaskSearchMainTask({ category: props.category })
      .then((result) => {
        setLoadingFlag(false);
        setSearchResult(result);
      })
      .catch((e) => {
        setLoadingFlag(false);
        setSearchResult(null);
      });
  };

  //不采用定时刷新页面，采用下拉刷新
  useEffect(() => {
    onSearch();
  }, [props.refreshTimestamp]);

  useEffect(() => {
    const downKey = touch.addSlideDownFunc(() => {
      onSearch();
    });
    const upKey = touch.addSlideUpFunc(() => {
      //分页
    });

    return () => {
      touch.removeSlideDownFunc(downKey);
      touch.removeSlideUpFunc(upKey);
    };
  }, []);

  const onAddTask = () => {
    const defaultData: MainTask = { ...DefaultMainTask };

    defaultData.audios = [{ ...DefaultAudioTask, ...appConfig.voiceConfig }];

    if (props.category == 0) {
      defaultData.videos.length = 0;
      defaultData.videos = [{ ...DefaultVideoTask }];
    }

    defaultData.taskCategory = props.category;

    props.onEditData(defaultData, "add");
  }

  const onEditing = (id: string, editFlag: EditFlag) => {
    OpenAPI.aiTaskGetMainTask(id)
      .then((result) => {
        if (result.success && result.result) {
          props.onEditData(result.result, editFlag);
        } else {
          message.error(result.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  const onStart = (id: string) => {
    OpenAPI.aiTaskStartTask(id)
      .then((result) => {
        if (result.success) {
          onSearch();
        } else {
          message.error(result.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  const onRetry = (id: string) => {
    OpenAPI.aiTaskRetryTask(id)
      .then((result) => {
        if (result.success) {
          onSearch();
        } else {
          message.error(result.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  const onPay4Video = (id: string) => {
    OpenAPI.aiTaskPay4Video(id)
      .then((result) => {
        if (result.success) {
          message.success(result.message);
          onSearch();
        } else {
          message.error(result.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  const onPay4Priority = (id: string) => {
    OpenAPI.aiTaskPay4Priority(id)
      .then((result) => {
        if (result.success) {
          message.success(result.message);
          onSearch();
        } else {
          message.error(result.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  const onDelete = (id: string) => {
    OpenAPI.aiTaskDeleteTask(id)
      .then((result) => {
        if (result?.success) {
          onSearch();
        } else {
          message.error(result.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  const onDownload = (id: string) => {
    OpenAPI.aiTaskDownloadTaskResult(id)
      .then((result) => {
        if (result.success && result.result) {
          window.open(result.result, "_blank");
        } else {
          sys.msg.error(result.message);
        }
      })
      .catch((e) => {
        sys.msg.error(e.message);
      });
  };

  const getLeftDays = (lastUpdateTime: number) => {
    const start = moment(lastUpdateTime);
    const end = moment(new Date());
    const leftDays = 30 - end.diff(start, "days");
    return leftDays <= 0 ? 0 : leftDays;
  };

  useEffect(() => {
    onSearch();
  }, [searchParam]);

  return (

    <div className={styles["p2v-list-page"]}>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">
            {props.category === 0 ? Locale.P2V.Page.MVTitle : Locale.P2V.Page.DHTitle}
          </div>
          <div className="window-header-sub-title">
            {props.category === 0 ? Locale.P2V.Page.MVSubTitle : Locale.P2V.Page.DHSubTitle}
            {/* {Locale.P2V.Page.SubTitle(
                searchResult?.result?.total ?? 0,
                searchResult?.result?.records.filter((r) => r.taskStatus >= 4)
                  .length ?? 0,
              )} */}
          </div>
        </div>

        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<SyncOutlined />}
              bordered
              onClick={() => onSearch()}
            />
          </div>
          <div className="window-action-button">
            <IconButton
              icon={<PlusCircleOutlined />}
              bordered
              onClick={() => {
                onAddTask();
              }}
            />
          </div>
        </div>
      </div>

      <DataList
        className={styles["p2v-list-data"]}
        loading={loadingFlag}
        data={searchResult}
        renderData={searchResult?.result?.records.map((item, index) => (
          <div className={styles["data-item"]} key={item.id}>
            <div className={styles["data-item-info"]}>
              <div className={styles["item-header"]}>
                <Tooltip
                  title={Locale.P2V.Status[item.taskStatus] + item.taskMsg}
                >
                  <div className={styles["item-icon"]}>
                    {item.taskStatus === TaskStatus.TaskCreated &&
                      <StatusCreatedIcon />}

                    {(item.taskStatus === TaskStatus.TaskInQueue ||
                      item.taskStatus === TaskStatus.TaskProcessing) && (
                        <StatusProcessingIcon />
                      )}

                    {(item.taskStatus === TaskStatus.TaskCompleted ||
                      item.taskStatus === TaskStatus.TaskForPay) && (
                        <StatusCompleteIcon />
                      )}

                    {item.taskStatus === TaskStatus.TaskFailed &&
                      <StatusErrorIcon />}

                    {item.taskStatus === TaskStatus.TaskForDownload &&
                      <StatusDownloadIcon />}

                    {item.taskStatus === TaskStatus.TaskClosed &&
                      <StatusClosedIcon />}
                  </div>
                </Tooltip>
                <div className={styles["item-title"]}>
                  <div className={styles["item-name"]}>{item.taskName}</div>

                  <div className={styles["item-icon"]}>
                    <Tooltip title={Locale.P2V.Page.Speeding}>
                      {item.taskPriority === 1 && <SpeedIcon />}
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div
                className={clsx(
                  styles["item-body"],
                  item.taskStatus === 5 && styles["item-body-error"],
                )}
              >
                {/* 进行中的任务添加进展信息 */}
                {item.taskStatus === TaskStatus.TaskDeleted &&
                  Locale.P2V.Status[item.taskStatus]}

                {item.taskStatus === TaskStatus.TaskCreated &&
                  Locale.P2V.Status[item.taskStatus]}

                {(item.taskStatus === TaskStatus.TaskInQueue ||
                  item.taskStatus === TaskStatus.TaskProcessing) &&
                  Locale.P2V.Status[item.taskStatus] + " " + item.taskMsg}

                {(item.taskStatus === TaskStatus.TaskCompleted ||
                  item.taskStatus === TaskStatus.TaskSuspend) &&
                  Locale.P2V.Page.PrepareResult}

                {item.taskStatus === TaskStatus.TaskFailed && (
                  <Tooltip title={item.taskMsg}>
                    {Locale.P2V.Status[item.taskStatus]}
                  </Tooltip>
                )}

                {(item.taskStatus === TaskStatus.TaskForPay ||
                  item.taskStatus === TaskStatus.TaskForDownload) &&
                  Locale.P2V.Status[item.taskStatus] +
                  Locale.P2V.Page.LeftDay(getLeftDays(item.updateTime))}

                {item.taskStatus === TaskStatus.TaskClosed &&
                  Locale.P2V.Status[item.taskStatus]}
              </div>
            </div>

            <div className={styles["data-item-actions"]}>
              {/* 开始任务 */}
              {item.taskStatus == TaskStatus.TaskCreated && (
                <IconButton
                  icon={<AIVideoIcon />}
                  text={Locale.P2V.Action.Satrt}
                  className="data-item-action"
                  onClick={async () => {
                    if (await showConfirm(
                      Locale.P2V.Action.Satrt,
                      Locale.P2V.Action.StartConfirm,
                      false)) {
                      onStart(item.id);
                    }
                  }}
                />
              )}

              {/* 重试生成视频 */}
              {item.taskStatus == TaskStatus.TaskFailed && (
                <IconButton
                  icon={<AIVideoIcon />}
                  text={Locale.P2V.Action.Retry}
                  className="data-item-action"
                  onClick={async () => {
                    onRetry(item.id);
                  }}
                />
              )}

              {/* 付款 */}
              {item.taskStatus == TaskStatus.TaskForPay && (
                <IconButton
                  icon={<AccountBookOutlined />}
                  text={Locale.P2V.Action.Pay4Video}
                  className="data-item-action"
                  onClick={async () => {
                    if (
                      await showConfirm(
                        Locale.Payment.Title,
                        <PaymentInfo
                          payFor={Locale.Payment.PayForDownloadVideo}
                          priceCode={80}
                        />,
                        false
                      )
                    ) {
                      onPay4Video(item.id);
                    }
                  }}
                />
              )}

              {/* 加速 */}
              {item.taskPriority == TaskStatus.TaskCreated &&
                (item.taskStatus == TaskStatus.TaskFailed) && (
                  <IconButton
                    icon={<AccountBookOutlined />}
                    text={Locale.P2V.Action.Pay4Priority}
                    className="data-item-action"
                    onClick={async () => {
                      if (
                        await showConfirm(
                          Locale.Payment.Title,
                          <PaymentInfo
                            payFor={Locale.Payment.PayForUpgradePriority}
                            priceCode={81}
                          />,
                          false
                        )
                      ) {
                        onPay4Priority(item.id);
                      }
                    }}
                  />
                )
              }

              {/* 下载 */}
              {item.taskStatus == TaskStatus.TaskForDownload && (
                <IconButton
                  icon={<DownloadOutlined />}
                  text={Locale.P2V.Action.Download}
                  className="data-item-action"
                  onClick={async () => {
                    onDownload(item.id);
                  }}
                />
              )}

              {/* 修改任务 */}
              {(item.taskStatus == TaskStatus.TaskCreated ||
                item.taskStatus == TaskStatus.TaskFailed) && (
                  <IconButton
                    icon={<EditOutlined />}
                    text={Locale.Common.Edit}
                    className="data-item-action"
                    onClick={() => onEditing(item.id, "edit")}
                  />
                )}

              {/* 返工 */}
              {(item.taskStatus == TaskStatus.TaskForDownload &&
                item.taskCategory === 0) &&
                <IconButton
                  icon={<ReDoIcon />}
                  text={Locale.P2V.Action.ReDo}
                  className="data-item-action"
                  onClick={() => onEditing(item.id, "redo")}
                />
              }

              {/* 删除 */}
              {item.taskStatus != TaskStatus.TaskInQueue &&
                item.taskStatus != TaskStatus.TaskProcessing && (
                  <IconButton
                    icon={<DeleteOutlined />}
                    text={Locale.Common.Delete}
                    className="data-item-action"
                    onClick={async () => {
                      if (await showConfirm(
                        Locale.Common.Delete,
                        Locale.Common.DeleteConfirm,
                        false)) {
                        onDelete(item.id);
                      }
                    }}
                  />
                )}
            </div>
          </div>
        ))}
      />
    </div>

  );
}
