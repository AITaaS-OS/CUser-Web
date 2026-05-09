/* eslint-disable @next/next/no-img-element */
import React, {
  CSSProperties, MouseEvent,
  useEffect,
  useState,
  useCallback,
  useRef,
  RefAttributes,
  forwardRef,
  LegacyRef, useImperativeHandle
} from "react";
import styles from "./ui-lib.module.scss";
import LoadingIcon from "../icons/processing.svg";
import AlertIcon from "../icons/alert.svg";
import AddBelowIcon from "../icons/add-below.svg";
import CameraSwitchIcon from "../icons/camera-switch.svg";
import CameraScreenshotIcon from "../icons/camera-screenshot.svg";
import CameraSelectIcon from "../icons/camera-list.svg";
import CameraRatioIcon from "../icons/camera-ratio.svg";
import RecordingDisableIcon from "../icons/microphone-disable.svg";
import RecordingEnableIcon from "../icons/microphone-enable.svg";
import RecordingIcon from "../icons/flickering.svg";
import DotIcon from "../icons/dot.svg";

import { AuthControl } from "./auth-control";
import Locale from "../locales";
import { createRoot } from "react-dom/client";
import clsx from "clsx";
import { Page, Result } from "../types";
import { useUserState } from "../store/user";
import { Button, Image, Tooltip, Upload, message, Input as AntdInput, Space, Checkbox, Progress, Slider } from "antd";
import type { CheckboxProps, CheckboxRef, GetProp, InputProps, InputRef, UploadFile, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";
import { CheckOutlined, CloseOutlined, DeleteOutlined, DownOutlined, FullscreenExitOutlined, FullscreenOutlined, InfoCircleFilled, MinusCircleFilled, PlusCircleFilled, PlusCircleOutlined, QuestionCircleFilled, QuestionCircleOutlined, RightOutlined, StopOutlined, UploadOutlined } from "@ant-design/icons";
import type { DragEndEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { sys } from "../utils/sys";
import { OpenAPI, UPLOAD_URL } from "../openapi";
import { AITaaSLogo } from "../constant";
import { TextAreaProps } from "antd/es/input";
import file, { getUploadAccept, UploadFormat } from "../utils/file";
import { TextAreaRef } from "antd/es/input/TextArea";
import Password, { PasswordProps } from "antd/es/input/Password";
import { copyToClipboard, reorder, useMobileScreen } from "../utils";
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import Search, { SearchProps } from "antd/es/input/Search";
import Webcam from "react-webcam";
import recording from "../utils/useRecording";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { useAppConfig } from "../store";

export type ButtonType = "primary" | "danger" | null;

export function IconButton(props: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void;
  icon?: JSX.Element;
  type?: ButtonType;
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  className?: string;
  iconClassName?: string;
  title?: string;
  disabled?: boolean;
  tabIndex?: number;
  autoFocus?: boolean;
  style?: CSSProperties;
  aria?: string;
}) {
  return (
    <button
      className={clsx(
        "clickable",
        styles["icon-button"],
        {
          [styles.border]: props.bordered,
          [styles.shadow]: props.shadow,
        },
        styles[props.type ?? ""],
        props.className,
      )}
      onClick={(e) => { props.onClick?.(e) }}
      title={props.title}
      disabled={props.disabled}
      role="button"
      tabIndex={props.tabIndex}
      autoFocus={props.autoFocus}
      style={props.style}
      aria-label={props.aria}
    >
      {props.icon && (
        <div
          aria-label={props.text || props.title}
          className={clsx(
            styles["icon-button-icon"],
            {
              "no-dark": props.type === "primary",
            },
            props.iconClassName,
          )}
        >
          {props.icon}
        </div>
      )}

      {props.text && (
        <div
          aria-label={props.text || props.title}
          className={styles["icon-button-text"]}
        >
          {props.text}
        </div>
      )}
    </button>
  );
}

export function Popover(props: {
  children: JSX.Element;
  content: JSX.Element;
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={styles.popover}>
      {props.children}
      {props.open && (
        <div className={styles["popover-mask"]} onClick={props.onClose}></div>
      )}
      {props.open && (
        <div className={styles["popover-content"]}>{props.content}</div>
      )}
    </div>
  );
}

export function Card(props: Readonly<{ children: JSX.Element[]; className?: string }>) {
  return (
    <div className={clsx(styles.card, props.className)}>{props.children}</div>
  );
}

interface ListItemProps extends React.RefAttributes<HTMLDivElement> {
  id?: string | number;
  title?: string;
  desc?: string | JSX.Element;
  descUnderTitle?: boolean;
  children?: JSX.Element | JSX.Element[];
  icon?: JSX.Element;
  className?: string;
  onClick?: (e: MouseEvent) => void;
  vertical?: boolean;
  tip?: string;
}

export const ListItem = forwardRef(function InnerListItem(props: ListItemProps, ref: LegacyRef<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      ref={ref}
      className={clsx(
        styles["list-item"],
        props.className,
      )}
      onClick={props.onClick}
      id={props.id?.toString()}
    >
      <div className={clsx(
        styles["list-item-body"],
        {
          [styles["vertical"]]: props.vertical,
        })}>

        {(props.icon || props.title) &&
          <div className={styles["list-item-header"]}>
            {props.icon &&
              <div className={styles["list-item-icon"]}>{props.icon}</div>
            }

            {props.title &&
              <div className={styles["list-item-title"]}>
                {props.title.startsWith("*") ? (
                  <>
                    {props.title?.slice(1)}
                    <span className={styles["list-item-title-star"]}> *</span>

                  </>
                ) : (
                  <>{props.title}</>
                )}

                {props.desc && props.descUnderTitle && (
                  <div className={styles["list-item-desc"]}>
                    {props.desc}
                  </div>
                )}
              </div>
            }

            {props.tip && props.tip.length > 0 && (
              <div className={styles["list-item-tip"]}>
                <Tooltip title={props.tip}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </div>
            )}
          </div>
        }

        {props.children &&
          <div className={styles["list-item-children"]}>{props.children}</div>
        }

      </div>

      {props.desc && !props.descUnderTitle && (
        <div className={styles["list-item-desc"]}>
          {props.desc}
        </div>
      )}
    </div>
  );
}
)

interface ListProps extends React.RefAttributes<HTMLDivElement> {
  id?: string | number;
  children?: React.ReactNode;
  title?: string;
  subTitle?: string | JSX.Element;
  icon?: JSX.Element;
  defaultFolded?: boolean;
  enableFold?: boolean;
  className?: string;
  actions?: React.ReactNode[];
  tip?: string;
}

export const List = forwardRef(function List(props: ListProps, ref: LegacyRef<HTMLDivElement>) {
  const [isFolded, setIsFolded] = useState(props.defaultFolded);

  return (
    <div
      id={props.id?.toString()}
      className={clsx(styles.list, props.className)}
      ref={ref}
    >
      {props.title && (
        <div
          aria-hidden="true"
          className={clsx(
            styles["list-title"],
            isFolded && styles["list-title-folded"],
          )}
          onClick={(e) => {
            props.enableFold && setIsFolded(!isFolded);
            e.stopPropagation();
          }}
        >
          {props.enableFold && (
            <div className={styles["list-title-folder"]}>
              {!isFolded && <DownOutlined onClick={() => setIsFolded(!isFolded)} />}
              {isFolded && (
                <RightOutlined onClick={() => setIsFolded(!isFolded)} />
              )}
            </div>
          )}

          {props.icon && (
            <div className={styles["list-title-icon"]}>{props.icon}</div>
          )}

          <div className={styles["list-title-text"]}>
            {props.title?.startsWith("*") ? (
              <div>
                {props.title?.slice(1)}
                <span className={styles["list-title-star"]}> *</span>
              </div>
            ) : (
              <div>{props.title}</div>
            )}

            {props.tip && props.tip.length > 0 && (
              <div className={styles["list-title-tip"]}>
                <Tooltip title={props.tip}>
                  <QuestionCircleFilled color="#ccc" />
                </Tooltip>
              </div>
            )}

            {props.subTitle && (
              <div className={styles["list-title-subtext"]}>
                {props.subTitle}
              </div>
            )}
          </div>

          <div className={styles["list-title-actions"]}>
            {props.actions &&
              props.actions.length > 0 &&
              props.actions.map((action, index) => (
                <div key={index} className={styles["list-title-action"]}>
                  {action}
                </div>
              ))}
          </div>
        </div>
      )}
      <div className={styles["list-content"]}>
        {!isFolded && props.children}
      </div>
    </div>
  );
}
)

export function DnDList(props: ListProps
  & {
    dataIds: string[] | number[],
    onSorted: (fromDataId: string | number, toDataId: string | number) => void
  }
) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => {
        if (e.over && e.active.id != e.over.id) {
          props.onSorted(e.active.id, e.over.id);
        }
      }}
    >
      <SortableContext
        items={props.dataIds}
        strategy={verticalListSortingStrategy}
      >
        <List {...props} className={
          clsx(
            props.className,
            styles["list-sortable"]
          )
        }>

        </List>
      </SortableContext>
    </DndContext>
  );
}

export function DnDListItem(props: Readonly<ListItemProps>) {

  let id = props.id || Date.now().toString();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      id={id.toString()}
      ref={setNodeRef}
      style={style} {...attributes} {...listeners}>
      <ListItem {...props} className={
        clsx(
          props.className,
          styles["list-item-sortable"]
        )
      }>
      </ListItem>
    </div>
  );
}

interface DynamicListProps<T extends { id: string | number; }> {
  id?: string;
  defaultData?: T[];
  vertical?: boolean;
  enableAnD?: boolean; //开启新增和删除
  bigIcon?: boolean;
  onNewItem?: (index: number) => T;
  onRenderItem: (item: T, index: number) => JSX.Element;
  onDataChanged: (newData: T[]) => void;
  onItemDeleting?: (item: T, index: number) => Promise<boolean>;
  onItemSelected?: (item: T, index: number) => void;
  onDragDrop?: (fromIndex: number, endIndex: number) => Promise<boolean>;
  onRenderItemActions?: (item: T, index: number) => JSX.Element[];
  title?: string;
  subTitle?: string | JSX.Element;
  icon?: JSX.Element;
  defaultFolded?: boolean;
  enableFold?: boolean;
  className?: string;
  actions?: React.ReactNode[];
}
export function DynamicList<T extends { id: string | number; }>(props: Readonly<DynamicListProps<T>>) {
  const [innerData, setInnerData] = useState(props.defaultData ?? []);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const onDragEnd = async (fromDataId: string | number, toDataId: string | number) => {
    const fromIndex = innerData.findIndex((i) => i.id === fromDataId);
    const toIndex = innerData.findIndex((i) => i.id === toDataId);

    if (!props.onDragDrop || await props.onDragDrop?.(fromIndex, toIndex)) {

      const orderedData = reorder(
        innerData,
        fromIndex,
        toIndex,
      );

      setSelectedIndex(toIndex);
      setInnerData(orderedData);
      props.onDataChanged(orderedData);
      props.onItemSelected?.(orderedData[toIndex], toIndex);
    }
  };

  const addItem = (index: number) => {
    if (!props.onNewItem) {
      sys.log.error("props.newItem未定义");
      return;
    }

    let orderedData = [...innerData];
    orderedData.splice(index, 0, props.onNewItem(index))

    setSelectedIndex(index);
    setInnerData(orderedData);
    props.onDataChanged(orderedData);
    props.onItemSelected?.(orderedData[index], index);
  }

  const removeItem = async (index: number) => {
    const deletedItem = innerData[index];
    let orderedData = [...innerData];
    orderedData.splice(index, 1)

    if (!props.onItemDeleting || await props.onItemDeleting(deletedItem, index)) {
      setSelectedIndex(index);
      setInnerData(orderedData);
      props.onDataChanged(orderedData);
      props.onItemSelected?.(orderedData[index], index);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => {
        if (e.over && e.active.id != e.over.id) {
          onDragEnd(e.active.id, e.over.id);
        }
      }}
    >
      <SortableContext
        items={innerData}
        strategy={verticalListSortingStrategy}
      >
        <List {...props} className={
          clsx(
            props.className,
            styles["dndlist"]
          )
        }>

          {innerData.map((item, index) => (
            <DnDListItem id={item.id} key={item.id} vertical={true}>

              {/* <div className={styles["sortable-item-dragger-left"]}></div> */}

              <div
                aria-hidden="true"
                className={
                  clsx(
                    styles["sortable-item"],
                    (props.vertical && styles["sortable-item-vertical"]),
                    ((selectedIndex == index) && styles["sortable-item-selected"])
                  )
                }

                onClick={(e) => {
                  setSelectedIndex(index);
                  props.onItemSelected?.(innerData[index], index);
                  e.stopPropagation();
                }}
              >
                <div
                  aria-hidden="true"
                  className={styles["sortable-item-body"]}
                >
                  {props.onRenderItem(item, index)}
                </div>

                {(props.enableAnD || props.onRenderItemActions) &&
                  <div
                    aria-hidden="true"
                    className={
                      clsx(styles["sortable-item-actions"],
                        (props.bigIcon && styles["sortable-item-actions-big"])
                      )
                    }
                  >

                    {
                      props.onRenderItemActions?.(item, index).map((action, aIndex) => (
                        <div key={"action-" + item.id + "-" + aIndex} className={
                          clsx(styles["sortable-item-action"],
                            (!props.vertical && props.bigIcon && styles["sortable-item-action-b"]),
                            (props.vertical && !props.bigIcon && styles["sortable-item-action-v"]),
                            (props.vertical && props.bigIcon && styles["sortable-item-action-vb"])
                          )
                        }>
                          {action}
                        </div>
                      ))
                    }

                    {props.enableAnD && <>
                      <div className={
                        clsx(styles["sortable-item-action"],
                          (!props.vertical && props.bigIcon && styles["sortable-item-action-b"]),
                          (props.vertical && !props.bigIcon && styles["sortable-item-action-v"]),
                          (props.vertical && props.bigIcon && styles["sortable-item-action-vb"])
                        )
                      }>
                        <IconButton
                          icon={<AddBelowIcon />}
                          onClick={
                            (e) => {
                              addItem(index + 1);
                              e.stopPropagation();
                            }
                          }
                        />
                      </div>

                      <div className={
                        clsx(styles["sortable-item-action"],
                          (!props.vertical && props.bigIcon && styles["sortable-item-action-b"]),
                          (props.vertical && !props.bigIcon && styles["sortable-item-action-v"]),
                          (props.vertical && props.bigIcon && styles["sortable-item-action-vb"])
                        )
                      }>
                        <IconButton
                          className={styles["sortable-item-action"]}
                          icon={<DeleteOutlined />}
                          onClick={
                            (e) => {
                              removeItem(index);
                              e.stopPropagation();
                            }
                          }
                        />
                      </div>
                    </>}
                  </div>
                }

              </div>

              <div className={styles["sortable-item-dragger"]}></div>
            </DnDListItem>
          ))}

          {props.enableAnD && props.defaultData?.length === 0 && (
            <div className={styles["sortable-item-blank"]}>
              <IconButton
                icon={<PlusCircleOutlined />}
                bordered
                className={styles["sortable-item-blank-add"]}
                onClick={
                  (e) => {
                    addItem(innerData.length);
                    e.stopPropagation();
                  }
                }
              />
            </div>
          )}

        </List>
      </SortableContext>

    </DndContext>
  );
}

interface DynamicContainerProps<T> {
  id?: string;
  defaultData?: T[];
  className?: string;
  vertical?: boolean;
  enableAnD?: boolean; //开启新增和删除
  bigIcon?: boolean;
  onNewItem?: (index: number) => T;
  onRenderItem: (item: T, index: number) => JSX.Element;
  onDataChanged: (newData: T[]) => void;
  onDeleteItem?: (item: T, index: number) => boolean;
  onDragDrop?: (fromIndex: number, endIndex: number) => boolean;
  onRenderItemActions?: (item: T, index: number) => JSX.Element[];
}
export function DynamicContainer<T>(props: Readonly<DynamicContainerProps<T>>) {
  const [innerData, setInnerData] = useState(props.defaultData || []);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) {
      return;
    }

    if (!props.onDragDrop || props.onDragDrop?.(result.source.index,
      result.destination.index)) {
      const orderedData = reorder(
        innerData,
        result.source.index,
        result.destination.index,
      );

      setSelectedIndex(result.destination.index);
      setInnerData(orderedData);
      props.onDataChanged(orderedData);
    }
  };

  const addItem = (index: number) => {
    if (!props.onNewItem) {
      sys.log.error("props.newItem未定义");
      return;
    }

    let tempData = [...innerData];
    tempData.splice(index, 0, props.onNewItem(index))

    setSelectedIndex(index);
    setInnerData(tempData);
    props.onDataChanged(tempData);
  }

  const removeItem = async (index: number) => {

    const deletedItem = innerData[index];
    let tempData = [...innerData];
    tempData.splice(index, 1)

    if (!props.onDeleteItem || props.onDeleteItem(deletedItem, index)) {
      setSelectedIndex(index);
      setInnerData(tempData);
      props.onDataChanged(tempData);
    }
  }

  return (
    <div
      className={clsx(styles["sortable-container"], props.className)}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={props.id ?? Date.now().toString()}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {innerData.map((item, index) => (
                <Draggable
                  draggableId={index.toString()}
                  index={index}
                  key={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div
                        aria-hidden="true"
                        className={
                          clsx(
                            styles["sortable-item"],
                            (props.vertical && styles["sortable-item-vertical"]),
                            ((selectedIndex == index) && styles["sortable-item-selected"])
                          )
                        }

                        onClick={(e) => {
                          setSelectedIndex(index);
                          e.stopPropagation();
                        }}
                      >
                        <div
                          aria-hidden="true"
                          className={styles["sortable-item-body"]}
                        >
                          {props.onRenderItem(item, index)}
                        </div>

                        {(props.enableAnD || props.onRenderItemActions) &&
                          <div
                            aria-hidden="true"
                            className={
                              clsx(styles["sortable-item-actions"],
                                (props.bigIcon && styles["sortable-item-actions-big"])
                              )
                            }
                          >

                            {
                              props.onRenderItemActions?.(item, index).map((action) => (
                                <div key={"div-" + action?.key} className={
                                  clsx(styles["sortable-item-action"],
                                    (!props.vertical && props.bigIcon && styles["sortable-item-action-b"]),
                                    (props.vertical && !props.bigIcon && styles["sortable-item-action-v"]),
                                    (props.vertical && props.bigIcon && styles["sortable-item-action-vb"])
                                  )
                                }>
                                  {action}
                                </div>
                              ))
                            }

                            {props.enableAnD && <>
                              <div className={
                                clsx(styles["sortable-item-action"],
                                  (!props.vertical && props.bigIcon && styles["sortable-item-action-b"]),
                                  (props.vertical && !props.bigIcon && styles["sortable-item-action-v"]),
                                  (props.vertical && props.bigIcon && styles["sortable-item-action-vb"])
                                )
                              }>
                                <IconButton
                                  icon={<PlusCircleOutlined />}
                                  onClick={
                                    (e) => {
                                      addItem(index + 1);
                                      e.stopPropagation();
                                    }
                                  }
                                />
                              </div>
                              <div className={
                                clsx(styles["sortable-item-action"],
                                  (!props.vertical && props.bigIcon && styles["sortable-item-action-b"]),
                                  (props.vertical && !props.bigIcon && styles["sortable-item-action-v"]),
                                  (props.vertical && props.bigIcon && styles["sortable-item-action-vb"])
                                )
                              }>
                                <IconButton
                                  className={styles["sortable-item-action"]}
                                  icon={<DeleteOutlined />}
                                  onClick={
                                    (e) => {
                                      removeItem(index);
                                      e.stopPropagation();
                                    }
                                  }
                                />
                              </div>
                            </>
                            }
                          </div>
                        }
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

      {props.enableAnD && props.defaultData?.length === 0 && (
        <div className={styles["sortable-item-blank"]}>
          <IconButton
            icon={<PlusCircleOutlined />}
            bordered
            className={styles["sortable-item-blank-add"]}
            onClick={
              (e) => {
                addItem(innerData.length);
                e.stopPropagation();
              }
            }
          />
        </div>
      )}
    </div>
  );
}

export interface ModalProps {
  title: string;
  children?: any;
  actions?: React.ReactNode[];
  defaultMax?: boolean;
  hideMax?: boolean;
  className?: string;
  onClose?: () => void;
  icon?: JSX.Element;
}

//弹窗
export function Modal(props: Readonly<ModalProps>) {
  const user = useUserState();
  const isMobileScreen = useMobileScreen();
  const [inputting, setInputting] = useState(false);
  const [isMax, setMax] = useState(!!props.defaultMax);

  useEffect(() => {
    sys.log.info("user.isInputting>>>", user.isInputting);
    setInputting(user.isInputting);
  }, [user.isInputting]);

  useEffect(() => {
    return () => {
      user.setInputting(false);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-dialog"
      onClick={() => {
        sys.log.info("modal-dialog.isInputting>>>", false);
        setInputting(false)
      }}
    >
      <div
        className={
          clsx(
            props.className,
            styles["modal-container"],
            { [styles["modal-container-max"]]: isMax, }
          )
        }
      >
        <div className={styles["modal-header"]}>
          {
            props.icon &&
            <div className={styles["modal-icon"]}>{props.icon}</div>
          }

          <div className={styles["modal-title"]}>{props.title}</div>

          <div className={styles["modal-header-actions"]}>
            {!props.hideMax && (
              <div
                aria-hidden="true"
                className={styles["modal-header-action"]}
                onClick={() => setMax(!isMax)}
              >
                {isMax ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </div>
            )}
            <div
              aria-hidden="true"
              className={styles["modal-header-action"]}
              onClick={() => {
                props.onClose?.()
              }}
            >
              <CloseOutlined />
            </div>
          </div>
        </div>

        <div className={styles["modal-content"]}>{props.children}</div>

        {(!inputting || !isMobileScreen) && props.actions && props.actions?.length > 0 && (
          <div className={styles["modal-actions"]}>
            {props.actions?.map((action, i) => (
              <div key={i} className={styles["modal-action"]}>
                {action}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function showModal(props: ModalProps) {
  const div = document.createElement("div");
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    props.onClose?.();
    root.unmount();
    div.remove();
  };

  div.onclick = (e) => {
    if (e.target === div) {
      closeModal();
    }
  };

  root.render(<Modal {...props} onClose={closeModal}></Modal>);
}

export type ToastProps = {
  content: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  onClose?: () => void;
};

export function Toast(props: Readonly<ToastProps>) {
  return (
    <div className={styles["toast-container"]}>
      <div className={styles["toast-content"]}>
        <span>{props.content}</span>
        {props.action && (
          <button
            onClick={() => {
              props.action?.onClick?.();
              props.onClose?.();
            }}
            className={styles["toast-action"]}
          >
            {props.action.text}
          </button>
        )}
      </div>
    </div>
  );
}

export function showToast(
  content: string,
  action?: ToastProps["action"],
  delay = 3000,
) {
  const div = document.createElement("div");
  div.className = styles.show;
  document.body.appendChild(div);

  const root = createRoot(div);
  const close = () => {
    div.classList.add(styles.hide);

    setTimeout(() => {
      root.unmount();
      div.remove();
    }, 300);
  };

  setTimeout(() => {
    close();
  }, delay);

  root.render(<Toast content={content} action={action} onClose={close} />);
}

export function TextArea(props: TextAreaProps & React.RefAttributes<TextAreaRef>) {
  const user = useUserState();
  return (
    <AntdInput.TextArea
      {...props}
      className={clsx(styles["textarea"], props.className)}
      autoSize={props.autoSize ?? { minRows: 3, maxRows: 100 }}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => { user.setInputting(true); }}
      onBlur={(e) => { user.setInputting(false); }}
    ></AntdInput.TextArea>
  );
}

export function Input(props: InputProps & RefAttributes<InputRef>) {
  const user = useUserState();
  return (
    <AntdInput
      {...props}
      size="small"
      className={clsx(styles["input"], props.className)}
      count={props.count ?? {
        show: (props.showCount == true),
        max: (props.maxLength ?? 20),
      }}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => { user.setInputting(true); }}
      onBlur={(e) => { user.setInputting(false); }}
    ></AntdInput>
  );
}

export function CheckBox(props: CheckboxProps & React.RefAttributes<CheckboxRef>) {
  return (
    <Checkbox
      {...props}
      className={clsx(styles["checkbox"], props.className)}
    />
  );
}

export function PasswordInput(
  props: PasswordProps & React.RefAttributes<InputRef>
) {
  const user = useUserState();
  return (
    <Password
      {...props}
      size={"small"}
      className={styles["password-input"]}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => { user.setInputting(true); }}
      onBlur={(e) => { user.setInputting(false); }}
    />
  );
}

export function SearchInput(props: SearchProps) {
  return <Search
    {...props}
    className={styles["search"]}
    allowClear
    size="large"
  />
}

export function showConfirm(title: string | null, content: any, resize?: boolean) {
  const div = document.createElement("div");
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };

  return new Promise<boolean>((resolve) => {
    root.render(
      <Modal
        title={title ?? Locale.Common.Confirm}
        className="confirm-modal-container"
        actions={[
          <IconButton
            key="cancel"
            text={Locale.Common.Cancel}
            onClick={() => {
              resolve(false);
              closeModal();
            }}
            icon={<StopOutlined />}
            tabIndex={0}
            bordered
            shadow
          ></IconButton>,
          <IconButton
            key="confirm"
            text={Locale.Common.Confirm}
            type="primary"
            onClick={() => {
              resolve(true);
              closeModal();
            }}
            icon={<CheckOutlined />}
            tabIndex={0}
            autoFocus
            bordered
            shadow
          ></IconButton>,
        ]}
        onClose={closeModal}
        hideMax={resize == false}
        icon={<AlertIcon />}
      >
        {content}
      </Modal>,
    );
  });
}
export function showInfo(title: string, content: any, resize?: boolean) {
  const div = document.createElement("div");
  div.className = "modal-dialog";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };

  return new Promise(() => {
    root.render(
      <Modal
        title={title ?? Locale.Common.Info}
        className="confirm-modal-container"
        onClose={closeModal}
        hideMax={resize == false}
      >
        {content}
      </Modal>,
    );
  });
}

function PromptInput(props: Readonly<{
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}>) {
  const [input, setInput] = useState(props.value);
  const onInput = (value: string) => {
    props.onChange(value);
    setInput(value);
  };

  return (
    <TextArea
      className={styles["modal-input"]}
      autoFocus
      autoSize={true}
      value={input}
      onInput={(e) => onInput(e.currentTarget.value)}
      rows={props.rows ?? 3}
    ></TextArea>
  );
}

export function showPrompt(content: any, value = "", rows = 3) {
  const div = document.createElement("div");
  div.className = "modal-dialog";
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
    div.remove();
  };

  return new Promise<string>((resolve) => {
    let userInput = value;

    root.render(
      <Modal
        title={content}
        actions={[
          <IconButton
            key="cancel"
            text={Locale.Common.Cancel}
            onClick={() => {
              closeModal();
            }}
            icon={<CloseOutlined />}
            bordered
            shadow
            tabIndex={0}
          ></IconButton>,
          <IconButton
            key="confirm"
            text={Locale.Common.Confirm}
            type="primary"
            onClick={() => {
              resolve(userInput);
              closeModal();
            }}
            icon={<CheckOutlined />}
            bordered
            shadow
            tabIndex={0}
          ></IconButton>,
        ]}
        onClose={closeModal}
      >
        <PromptInput
          onChange={(val) => (userInput = val)}
          value={value}
          rows={rows}
        ></PromptInput>
      </Modal>,
    );
  });
}

export function showImageModal(
  img: string,
  defaultMax?: boolean,
  style?: CSSProperties,
  boxStyle?: CSSProperties,
) {
  showModal({
    title: Locale.Export.Image.Modal,
    defaultMax: defaultMax,
    children: (
      <div style={{ display: "flex", justifyContent: "center", ...boxStyle }}>
        <img
          src={img}
          alt="preview"
          style={
            style ?? {
              maxWidth: "100%",
            }
          }
        ></img>
      </div>
    ),
  });
}

export type SelectItem<T> = {
  title: string;
  value: T;
  icon?: JSX.Element;
  desc?: string;
  disable?: boolean;
  children?: SelectItem<T>[];
  actions?: React.ReactNode[];
};

export enum DisplayStyle {
  IconAndText,
  Icon,
  Text
}
export function Select<T>(props: Readonly<{
  items: SelectItem<T>[];
  defaultSelectedValue?: T[];
  onSelectValue?: (values: T[]) => void;
  onDisplayText?: (values: T[]) => string;
  multiple?: boolean;
  className?: string;
  icon?: JSX.Element;
  displayStyle?: DisplayStyle;
}>) {
  const [showSelectModal, setShowSelectModal] = useState(false);

  const [displayText, setDisplayText] = useState(Locale.Common.Select);

  function findItems(values: T[]) {
    let items: SelectItem<T>[] = [];

    if (!props.items) return items;

    props.items.forEach(t => {
      if (values.includes(t.value)) {
        items.push(t);
      }

      const item = t.children?.find((c) => values.includes(c.value));
      if (item) {
        items.push(item);
      }
    });

    return items;
  };

  useEffect(() => {
    if (props.onDisplayText && props.defaultSelectedValue) {
      setDisplayText(props.onDisplayText(props.defaultSelectedValue));
    }
    else {
      const items = findItems(props.defaultSelectedValue || []);
      if (items.length > 0)
        setDisplayText(items[0].title + (props.multiple ? "..." : ""))
    }
  }, [props, props.items, props.defaultSelectedValue]);

  return (
    <>
      <Button className={clsx(props.className, styles["selector-button"])}
        onClick={() => { setShowSelectModal(!showSelectModal) }}
      >
        {props.displayStyle != DisplayStyle.Text &&
          props.icon
        }
        {props.displayStyle != DisplayStyle.Icon &&
          <Space>
            {displayText}
            <DownOutlined />
          </Space>
        }
      </Button>

      {showSelectModal &&
        <SelectModal
          items={props.items}
          defaultSelectedValue={props.defaultSelectedValue}
          onSelectValue={props.onSelectValue}
          onClose={() => { setShowSelectModal(false) }}
          multiple={props.multiple}
        />
      }
    </>
  );
}
export function SelectModal<T>(props: Readonly<{
  items: Array<SelectItem<T>>;
  defaultSelectedValue?: T[];
  onSelectValue?: (values: T[]) => void;
  onClose?: () => void;
  multiple?: boolean;
}>) {
  const [selectedValues, setSelectedValues] = useState<T[]>(
    props.defaultSelectedValue ?? [],
  );

  const handleSelection = (e: MouseEvent, selectedItem: SelectItem<T>) => {
    if (props.multiple) {
      e.stopPropagation();
      const newSelectedValues = selectedValues.includes(selectedItem.value)
        ? selectedValues.filter((v) => v !== selectedItem.value)
        : [...selectedValues, selectedItem.value];
      setSelectedValues(newSelectedValues);
      props.onSelectValue?.(newSelectedValues);
    } else {
      setSelectedValues([selectedItem.value]);
      props.onSelectValue?.([selectedItem.value]);
      props.onClose?.();
    }
  };

  let selectedGroupIndex = -1;
  let selectedItemIndex = -1;
  let isGroupedItems = false;

  props.items?.forEach((item, index) => {
    if (selectedValues.includes(item.value)) {
      selectedItemIndex = index
    }

    if (item.children && item.children.length > 0) {
      isGroupedItems = true;
      item.children.forEach((citem, ci) => {
        if (selectedValues.includes(citem.value)) {
          selectedItemIndex = ci;
          selectedGroupIndex = index;
        }
      });
    }
  });

  const selectContentElement = useRef<HTMLDivElement | null>(null);
  const selectedGroupElement = useRef<HTMLDivElement | null>(null);
  const selectedItemElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedItemElement.current) {
      let top = selectedItemElement.current.offsetTop;

      if (selectedGroupElement.current) {
        top += selectedGroupElement.current?.offsetTop;
      }

      selectContentElement.current?.scrollTo({
        top: top
      });
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      className={styles["selector"]}
      onClick={(e) => props.onClose?.()}
    >
      <div className={
        clsx(styles["selector-content"],
          { [styles["selector-content-noscroll"]]: (!isGroupedItems && props.items.length <= 6) }
        )}
        ref={selectContentElement}>
        {props.items?.map((item, i) => {
          if (item.children && item.children.length > 0) {
            return (
              <List
                key={i}
                id={i}
                ref={i == selectedGroupIndex ? selectedGroupElement : null}
                title={item.title}
                className={styles["selector-group"]}
                icon={item.icon}
                enableFold={true}
              > {
                  item.children.map((citem, ci) => {
                    const selected = (selectedItemIndex == ci && selectedGroupIndex == i);
                    return (
                      <ListItem
                        id={ci}
                        ref={selected ? selectedItemElement : null}
                        className={
                          clsx(styles["selector-item"],
                            {
                              [styles["selector-item-disabled"]]: citem.disable,
                            },
                            {
                              [styles["selector-item-selected"]]: selected,
                            }
                          )
                        }
                        key={ci}
                        icon={citem.icon}
                        title={citem.title}
                        desc={citem.desc}
                        onClick={(e) => {
                          if (citem.disable) {
                            e.stopPropagation();
                          } else {
                            handleSelection(e, citem);
                          }
                        }}
                      >
                        <>
                          {item.actions &&
                            item.actions.length > 0 &&
                            item.actions.map((action, index) => (
                              <div key={index} className={styles["list-title-action"]}>
                                {action}
                              </div>
                            ))}
                        </>

                        {
                          (selected && (!item.actions || item.actions?.length == 0)) ? (
                            <div
                              className={
                                props.multiple ?
                                  styles["selector-item-multiple-selected-flag"]
                                  :
                                  styles["selector-item-selected-flag"]}>
                            </div>
                          )
                            :
                            <></>
                        }
                      </ListItem>
                    );

                  })}
              </List>
            )
          }
          else {
            const selected = (selectedItemIndex == i);
            return (
              <ListItem
                ref={selected ? selectedItemElement : null}
                className={
                  clsx(
                    styles["selector-item"],
                    {
                      [styles["selector-item-disabled"]]: item.disable,
                    },
                    {
                      [styles["selector-item-selected"]]: selected,
                    }
                  )
                }
                key={i}
                icon={item.icon}
                title={item.title}
                desc={item.desc}
                onClick={(e) => {
                  if (item.disable) {
                    e.stopPropagation();
                  } else {
                    handleSelection(e, item);
                  }
                }}
              >

                <>
                  {item.actions &&
                    item.actions.length > 0 &&
                    item.actions.map((action, index) => (
                      <div key={index} className={styles["list-title-action"]}>
                        {action}
                      </div>
                    ))}
                </>

                {
                  (selected && (!item.actions || item.actions?.length == 0)) ?
                    (
                      <div
                        className={
                          props.multiple ?
                            styles["selector-item-multiple-selected-flag"]
                            :
                            styles["selector-item-selected-flag"]}>
                      </div>
                    )
                    :
                    <></>
                }

              </ListItem>
            );
          }
        })}
      </div>
    </div>
  );
}
export function FullScreen(props: any) {
  const { children, right = 10, top = 10, ...rest } = props;
  const ref = useRef<HTMLDivElement>();
  const [fullScreen, setFullScreen] = useState(false);
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      ref.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);
  useEffect(() => {
    const handleScreenChange = (e: any) => {
      if (e.target === ref.current) {
        setFullScreen(!!document.fullscreenElement);
      }
    };
    document.addEventListener("fullscreenchange", handleScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleScreenChange);
    };
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }} {...rest}>
      <div style={{ position: "absolute", right, top }}>
        <IconButton
          icon={fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={toggleFullscreen}
          bordered
        />
      </div>
      {children}
    </div>
  );
}

interface DraggableUploadListItemProps {
  originNode: React.ReactElement<
    any,
    string | React.JSXElementConstructor<any>
  >;
  file: UploadFile<any>;
}

const DraggableUploadListItem = ({
  originNode,
  file,
}: DraggableUploadListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: file.uid,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: "move",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // prevent preview event when drag end
      className={isDragging ? "is-dragging" : ""}
      {...attributes}
      {...listeners}
    >
      {/* hide error tooltip when dragging */}
      {file.status === "error" && isDragging
        ? originNode.props.children
        : originNode}
    </div>
  );
};

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export function FileUpload(props: Readonly<{
  useOSS?: boolean;
  className?: string;
  iconClassName?: string;
  imageClassName?: string;
  onChange?: (files: UploadFile[]) => void;
  onComplete?: (files: UploadFile[]) => void;
  onPreview?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => void;
  maxSize?: number;
  maxCount: number | 1;
  display?: "text" | "picture" | "picture-card" | "picture-circle";
  defaultFiles: UploadFile[];
  aspect?: number;
  format?: UploadFormat;
}>) {
  const [fileList, setFileList] = useState<UploadFile[]>(
    props.defaultFiles ?? props.defaultFiles,
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const beforeUpload = (file: UploadFile) => {
    if (props.maxSize && file.size && file.size > props.maxSize * 1024) {
      message.error("文件超出大小，请重新上传");
      return Upload.LIST_IGNORE;
    }

    if (props.useOSS) {
      file.url = useUserState.getState().userId + "/" + new Date().getTime() + file.name.slice(file.name.lastIndexOf('.'));
    }

    return true;
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {

      let newfileList: UploadFile[] = [];

      setFileList((prev) => {
        const activeIndex = prev.findIndex((i) => i.uid === active.id);
        const overIndex = prev.findIndex((i) => i.uid === over?.id);
        newfileList = arrayMove(prev, activeIndex, overIndex);
        return newfileList;
      });

      props.onComplete?.(fileList);
    }
  };

  const onChange: UploadProps["onChange"] = async ({ fileList: newFileList }) => {

    let data = newFileList.map(
      (f) => (
        {
          ...f,
          thumbUrl: f.url
        })
    );

    setFileList(data);

    props.onChange?.(data);

    const uploadingData = data.filter((f) => f.status == "uploading");
    if (uploadingData.length <= 0) {
      data = data.filter((f) => f.status == "done");

      sys.log.info("上传有效文件数>>>", data.length);

      props.onComplete?.(data);
    }
  };

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onPreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewUrl(file.url || (file.preview as string));

    if (props.onPreview) {
      props.onPreview(file);
      return;
    }

    setPreviewOpen(!previewOpen);
  };

  const onRemove = async (file: UploadFile) => {
    sys.log.info("删除文件>>>", file.url);

    const newFileList = fileList.filter((f) => f.uid != file.uid);
    setFileList(newFileList);

    props.onComplete?.(newFileList);

    if (props.onRemove) {
      return props.onRemove(file);
    }

    return true;
  };

  let uploadUrl = UPLOAD_URL + "?token=" + useUserState.getState().accessToken + "&to=p2v";

  const customRequest = async (options: any) => {

    if (!props.useOSS)
      return;

    const { onSuccess, onError, file, onProgress } = options;

    const filePath = useUserState.getState().userId.replace(".", "-") + "/" + new Date().getTime() + file.name.slice(file.name.lastIndexOf('.'));

    OpenAPI.ossGetSTS(filePath)
      .then((result) => {
        // 获取上传签名
        if (!result.success || result.result == null) {
          sys.log.error("sts>>>获取上传签名错误:", result);
          message.error(result.message);
          onError(result);
          setFileList([]);
          return;
        }

        const data = result.result;

        let formData = new FormData();
        formData.append("success_action_status", "200");
        formData.append("policy", data.policy);
        formData.append("x-oss-signature", data.signature);
        formData.append("x-oss-signature-version", "OSS4-HMAC-SHA256");
        formData.append("x-oss-credential", data.x_oss_credential);
        formData.append("x-oss-date", data.x_oss_date);
        formData.append("key", filePath); // 文件名
        formData.append("x-oss-security-token", data.security_token);
        formData.append("file", file); // file 必须为最后一个表单域

        sys.log.info("sts>>>上传文件:", formData);

        return fetch(data.host, {
          method: "POST",
          body: formData
        });
      })
      .then((response) => {
        if (!response?.ok) {
          // sys.log.error("sts>>>文件上传错误:", response);
          //message.error("上传失败：" + response?.text);
          setFileList([]);
          onError();
        }

        return OpenAPI.ossGetUrl(filePath);
      })
      .then(async (result) => {
        if (result.success) {
          file.url = result.result;
          onSuccess();
          // const completed = await props.onComplete?.([file]);
          // if (!completed) {
          //   onError();
          //   setFileList([]);
          // }
          // else {
          //   onSuccess();
          // }
        }
        else {
          onError();
        }
      })
      .catch((error) => {
        // sys.log.info("sts>>>未知错误:", error);
        message.error("上传失败：" + error.message);
        setFileList([]);
        onError();
      });
  };

  // 定义上传组件的样式
  // 此处设定必须和 globals.scss 中的ant-upload-list-item-container的配置一致
  const fileItemWidth = 99;
  const stylesObject = {
    root: {

    },
    list: {

    },
    item: {
      width: fileItemWidth,
      height: fileItemWidth * (props.aspect ? (1 / props.aspect) : 1),
    },
    select: {
      border: 0,
      width: fileItemWidth,
      height: (fileItemWidth - 8) * (props.aspect ? (1 / props.aspect) : 1)
    }
  };

  return (
    <div className={clsx(styles["upload-image"], props.className)}>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext
          items={fileList.map((i) => i.uid)}
        >
          {(props.format == "image") &&
            <ImgCrop rotationSlider aspect={props.aspect} showGrid={true} quality={1} fillColor="black" minZoom={0.3}>
              <Upload
                styles={stylesObject}
                action={uploadUrl}
                listType={props.display}
                customRequest={props.useOSS ? customRequest : undefined}
                fileList={fileList}
                onChange={onChange}
                onPreview={onPreview}
                onRemove={onRemove}
                beforeUpload={beforeUpload}
                maxCount={props.maxCount}
                itemRender={(originNode, file) => (
                  <DraggableUploadListItem originNode={originNode} file={file} />
                )}
                accept={file.getUploadAccept(props.format)}
              >
                {fileList.length < props.maxCount && (
                  <Button style={stylesObject.select} icon={<UploadOutlined />}></Button>
                )}
              </Upload>
            </ImgCrop>
          }

          {(props.format != "image") &&
            <Upload
              styles={stylesObject}
              action={uploadUrl}
              listType={props.display}
              customRequest={props.useOSS ? customRequest : undefined}
              fileList={fileList}
              onChange={onChange}
              onPreview={onPreview}
              onRemove={onRemove}
              beforeUpload={beforeUpload}
              maxCount={props.maxCount}
              itemRender={(originNode, file) => (
                <DraggableUploadListItem originNode={originNode} file={file} />
              )}
              accept={getUploadAccept(props.format)}
            >
              {fileList.length < props.maxCount && (
                <Button style={stylesObject.select} icon={<UploadOutlined />}></Button>
              )}
            </Upload>

          }

        </SortableContext>
      </DndContext>


      {previewUrl && previewOpen && (
        (props.format == "video") ?
          <video controls className={styles["upload-preview-video"]}>
            <source src={previewUrl} />
          </video> :
          <Image
            alt=""
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewUrl(""),
            }}
            src={previewUrl}
          />
      )
      }
    </div>
  );
}

export function DataList(props: Readonly<{
  loading: boolean;
  data?: Result<Page<any>> | null;
  renderData: React.ReactNode;
  renderSearch?: React.ReactNode | null;
  className?: string;
}>) {
  const [authModal, setAuthModal] = useState(false);

  return (
    <div className={clsx(styles["data-list"], props.className)}>
      {props.renderSearch && (
        <div className={styles["data-filter"]}>{props.renderSearch}</div>
      )}

      {props.loading && (
        <div className={styles["data-loading"]}>
          <LoadingIcon />
        </div>
      )}

      {!props.loading && !props.data?.success && (
        <div className={styles["data-error"]}>
          {props.data?.code === 500 ? Locale.Error.CommonError : props.data?.message}
          {props.data?.code !== 500 && (
            <div>
              <Button
                type="primary"
                onClick={() => {
                  setAuthModal(true);
                }}
              >
                {Locale.Common.Setting}
              </Button>
            </div>
          )}
        </div>
      )}

      {props.data?.success && props.data?.result?.records.length === 0 && (
        <div className={styles["data-empty"]}>{Locale.Common.NoData}</div>
      )}

      {
        (props.data?.result?.records?.length ?? 0) > 0 && (
          <div className={styles["data-items"]}>{props.renderData}</div>
        )}

      {authModal && (
        <div className={styles["modal-dialog"]}>
          <Modal
            title={Locale.Common.Setting}
            onClose={() => {
              setAuthModal(false);
            }}
            className={styles["auth-modal"]}
            defaultMax={false}
          >
            <AuthControl />
          </Modal>
        </div>
      )}
    </div>
  );
}

export function Loading(props: { noLogo?: boolean; displayText?: boolean }) {
  return (
    <div className={clsx("no-dark", styles["loading-content"])}>
      {props.noLogo ? null : (
        <Image
          alt="AITaaS"
          preview={false}
          src={AITaaSLogo.Circle}
          width={80}
          className={styles["loading-logo"]}
        />
      )}

      {props.displayText &&

        <p>初始加载资源较多速度较慢，请耐心等待</p>
      }

      <LoadingIcon />
    </div>
  );
}

export function Required() {
  return <span className={styles["required-star"]}>*</span>;
}

export interface CameraSettings extends MediaTrackSettings {
  pan?: number;
  tilt?: number;
  zoom?: number;
}
export interface CameraCapabilities extends MediaTrackCapabilities {
  zoom?: { min?: number, max?: number, step?: number };
  pan?: { min?: number, max?: number, step?: number };
  tilt?: { min?: number, max?: number, step?: number };
}
export interface CameraRef {
  getCapabilities: () => CameraCapabilities | null;
  setParams: (params: any) => void;
  startCapture: () => void;
  stopCapture: () => void;
  getVideo: () => Promise<string | null>;
  getScreenshot: () => Promise<string | null>;
  getDevices: () => Promise<MediaDeviceInfo[]>;
  setAudio: (audio: boolean) => void;
  getAudio: () => boolean;
}
export const Camera = forwardRef(function InnerCamera(props: {
  onReady?: () => void;
  className?: string;
}, ref: React.Ref<CameraRef>) {

  useImperativeHandle(ref, () => ({
    getCapabilities: () => {
      return getCapabilities() ?? null;
    },
    setParams: (params: any) => {
      setCameraSetting(params);
    },
    startCapture: () => {
      // 开始录像
      startCapture();
    },
    stopCapture: () => {
      // 停止录像
      stopCapture();
    },
    getVideo: () => {
      // 获取录像数据
      return getVideo();
    },
    getScreenshot: () => {
      // 拍照
      return getScreenshot();
    },
    getDevices: () => {
      return getDevices();
    },
    setAudio: (audio: boolean) => {
      return setAudio(audio);
    },
    getAudio: () => {
      return getAudio();
    }
  }));

  const options = {
    mimeType: 'video/webm',//移动端仅支持此格式！！！
  };
  const videoFormat = options.mimeType.split("/")[1];
  const VideoFormat = {
    MP4: "video/mp4",
    AVI: "video/avi",
    MKV: "video/mkv",
    MOV: "video/mov",
    WMV: "video/wmv",
    WEBM: "video/webm",
  }

  //相机默认3:4, 2K画质
  const convertRatio = (ratio: string) => {
    return Number.parseInt(ratio.split(":")[0]) / Number.parseInt(ratio.split(":")[1])
  };
  const [cameraRatio, setCameraRatio] = useState("3:4");
  const cameraSize = {
    width: { min: 300, ideal: 1440, max: 2880 },
    height: { min: 400, ideal: 1920, max: 3840 },
    aspectRatio: convertRatio(cameraRatio)
  }
  //窗口根据比例动态调整
  const videoPanel = useRef<HTMLDivElement>(null);
  const [videoSize, setVideoSize] = useState({ width: 300, height: 400 });
  useEffect(() => {
    cameraSize.aspectRatio = convertRatio(cameraRatio);
    cameraSize.height = {
      min: Number.parseInt((cameraSize.width.min * (1 / cameraSize.aspectRatio)).toFixed(0)),
      ideal: Number.parseInt((cameraSize.width.ideal * (1 / cameraSize.aspectRatio)).toFixed(0)),
      max: Number.parseInt((cameraSize.width.max * (1 / cameraSize.aspectRatio)).toFixed(0))
    };
    sys.log.info("camera>>>相机大小：", cameraSize);

    const size = { width: (videoPanel.current as any)?.clientWidth, height: (videoPanel.current as any)?.clientHeight };

    const maxHeight = size.width * (1 / cameraSize.aspectRatio);
    if (maxHeight > size.height) {
      size.height -= 50;
      size.width = size.height * cameraSize.aspectRatio;
    }
    setVideoSize(size);
    sys.log.info("camera>>>视频大小:", size);

    const setting = {
      ...cameraSetting,
      width: cameraSize.width.ideal,
      height: cameraSize.height.ideal,
      aspectRatio: cameraSize.aspectRatio
    };

    applySettings(setting);
  }, [cameraRatio]);

  const [capturing, setCapturing] = React.useState(false);
  const cameraRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraCapabilities, setCameraCapabilities] = useState<CameraCapabilities>();
  const [cameraSetting, setCameraSetting] = useState<CameraSettings>();
  const [enableAudio, setEnableAudio] = useState<boolean>(true);
  const [videoConstraints, setVideoConstraints] = useState<any>({
    ...cameraSize,
    facingMode: { exact: "environment" }
  });

  const startCapture = () => {

    recordedChunks.current = [];

    if (!cameraRef.current?.stream)
      return;

    setCapturing(true);

    mediaRecorderRef.current = new MediaRecorder(cameraRef.current.stream, options);

    mediaRecorderRef.current.ondataavailable = (e) => {
      sys.log.info("camera>>>接收视频流:", e.data.size / 1024 / 1024 + "MB");

      if (e.data.size > 0) {
        recordedChunks.current = [...recordedChunks.current, e.data];
      }
    };

    // 每10秒获取一次视频数据，或者通过stopCapture来获取最后的视频数据
    //mediaRecorderRef.current.start(10000);

    if (mediaRecorderRef.current.state != "recording")
      mediaRecorderRef.current.start();

    sys.log.info("camera>>>开始录像...");
  };

  const stopCapture = () => {
    mediaRecorderRef.current?.stop();
    setCapturing(false);

    sys.log.info("camera>>>结束录像");
  };

  const getVideo = async () => {
    sys.log.info("camera>>>获取视频...");
    //此处调用stopCapture的原因是为了确保录像结束，获取到完整的视频数据
    //但是ondataavailable事件的触发存在延迟，recordedChunks可能还没有数据???
    mediaRecorderRef.current?.stop();

    return new Promise<string>((resolve, reject) => {
      setTimeout(async () => {
        const tempData = [...recordedChunks.current];

        if (!tempData || tempData.length === 0) {
          sys.log.error("camera>>>无法获取视频数据");
          reject(new Error("无法获取视频数据"));
        }

        // const blob = new Blob(tempData, {
        //   type: "video/mp4"
        // });
        // const url = URL.createObjectURL(blob);

        // const a = document.createElement("a");
        // document.body.appendChild(a);
        // a.style = "display: none";
        // a.href = url;
        // a.download = "react-webcam-stream-capture.mp4";
        // a.click();
        // window.URL.revokeObjectURL(url);

        const tempFile = new File(tempData, Date.now() + "." + videoFormat, { type: options.mimeType });

        recordedChunks.current = [];

        sys.log.info("camera>>>视频文件大小:", (tempFile.size / 1024 / 1024).toFixed(1) + "MB");

        mediaRecorderRef.current?.start();

        const fileUrl: string = await file.uploadFile(tempFile);

        sys.log.info("camera>>>视频上传结果:", fileUrl);

        if (fileUrl) {
          resolve(fileUrl);
        }
        else {
          reject(new Error("视频上传失败"));
        }

      }, 100);
    });
  };

  const getCapabilities = () => {
    if (cameraCapabilities) {
      return cameraCapabilities;
    }

    if (!cameraRef.current)
      return;

    const stream = cameraRef.current?.stream as MediaStream;
    if (!stream)
      return;

    const tracks = stream.getVideoTracks();
    if (tracks.length === 0)
      return;

    const track = tracks[0];

    const capabilities = track.getCapabilities();
    const settings = track.getSettings();

    setCameraCapabilities(capabilities);
    setCameraSetting(settings);

    return { ...capabilities };
  };

  const getCameraInfo = () => {
    if (!cameraRef.current)
      return null;

    const stream = cameraRef.current?.stream as MediaStream;
    if (!stream)
      return null;

    const tracks = stream.getVideoTracks();
    if (tracks.length === 0)
      return null;

    const track = tracks[0];

    const capabilities = track.getCapabilities();
    const settings = track.getSettings();

    let supportedType = "";

    Object.values(VideoFormat).forEach(value => {
      if (MediaRecorder.isTypeSupported(value))
        supportedType += value + ";";
    });

    return { capabilities: capabilities, settings: settings, tracks: tracks, devices: cameraDevices, videoType: supportedType };
  };

  async function getDevices() {
    if (cameraDevices.length > 0) {
      return cameraDevices;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    setCameraDevices(videoDevices);

    return videoDevices;
  }

  const getScreenshot = () => {
    // 拍照
    const base64Data = cameraRef.current?.getScreenshot();

    if (!base64Data) return Promise.reject(new Error("无法获取截图"));

    return file.uploadBase64Data(base64Data, Date.now() + ".png");
  }

  const setAudio = (audio: boolean) => {
    setEnableAudio(audio);
  }
  const getAudio = () => {
    return enableAudio;
  }

  useEffect(() => {
    getDevices().then((devices) => {
      sys.log.info("camera>>>相机设备:", devices);
    });
  }, []);

  const applySettings = (params: any) => {
    if (!cameraRef.current)
      return;

    const stream = cameraRef.current?.stream as MediaStream;
    if (!stream)
      return;

    const tracks = stream.getVideoTracks();
    if (tracks.length === 0)
      return;

    const track = tracks[0];
    const oldSetting = track.getSettings() as any;
    const capabilities = track.getCapabilities();

    let advancedParams = {} as any;

    for (const key in params) {
      if (!capabilities || !(key in capabilities))
        continue;

      if (oldSetting[key] == params[key])
        continue;

      advancedParams[key] = params[key];

      if (advancedParams[key] < (cameraCapabilities as any)[key]!.min!)
        advancedParams[key] = (cameraCapabilities as any)[key]!.min!;

      if (advancedParams[key] > (cameraCapabilities as any)[key]!.max!)
        advancedParams[key] = (cameraCapabilities as any)[key]!.max!;
    }

    const newSetting = { ...cameraSetting, ...advancedParams };

    sys.log.info("camera>>>变更前配置:", oldSetting);
    sys.log.info("camera>>>变更配置:", advancedParams);
    sys.log.info("camera>>>变更后配置:", newSetting);

    setCameraSetting(newSetting);

    track.applyConstraints({
      advanced: [advancedParams]
    });
  };

  return (
    <div ref={videoPanel} className={clsx(styles["camera-panel"], props.className)}>
      <Webcam
        width={videoSize.width}
        ref={cameraRef}
        disablePictureInPicture={true}
        audio={enableAudio}
        screenshotFormat="image/png"
        videoConstraints={videoConstraints}
        onUserMedia={() => {
          const cs = getCameraInfo();

          if (!cs)
            return;

          sys.log.info("camera>>>相机参数:", cs);

          setCameraCapabilities(cs.capabilities);
          setCameraSetting(cs.settings);

          //初始时静音，后置摄像头，3:4比例
          setEnableAudio(false);

          setCameraRatio("4:3");//手机是反着的

          props.onReady?.();
        }}
      />

      <div className={styles["control-panel"]}>
        <div className={styles["setting-panel"]}>

          <IconButton
            className={styles["icon"]}
            shadow bordered
            icon={<InfoCircleFilled />}
            onClick={() => {
              copyToClipboard(JSON.stringify(getCameraInfo()));
            }}
          />

          <Select
            className={styles["icon"]}
            icon={<CameraSelectIcon />}
            displayStyle={DisplayStyle.Icon}
            defaultSelectedValue={[cameraSetting?.deviceId]}
            items={cameraDevices.map((device: MediaDeviceInfo) => {
              return {
                title: device.label + "(" + device.deviceId + ")",
                value: device.deviceId
              }
            })}

            onSelectValue={(values: any) => {
              applySettings({ deviceId: values[0] });
            }}
          />

          <Select
            className={styles["icon"]}
            icon={<CameraRatioIcon />}
            displayStyle={DisplayStyle.Icon}
            defaultSelectedValue={[cameraRatio]}
            items={[
              {
                title: "1:1",
                value: "1:1",
              },
              {
                title: "3:4",
                value: "4:3",
              },
              {
                title: "9:16",
                value: "16:9",
              },
              {
                title: "4:3",
                value: "3:4",
              },
              {
                title: "16:9",
                value: "9:16",
              }
            ]}

            onSelectValue={(values: any) => {
              setCameraRatio(values[0]);
            }}
          />

          <IconButton
            className={styles["icon"]}
            shadow bordered
            icon={<PlusCircleFilled />}
            onClick={() => {
              let newZoom = getCapabilities()?.zoom?.min ?? 0;
              if (cameraSetting?.zoom)
                newZoom = cameraSetting?.zoom;

              newZoom += (getCapabilities()?.zoom?.step ?? 1);

              applySettings({ zoom: newZoom });
            }}
          />

          <Slider style={{ height: '100px' }}
            vertical
            defaultValue={0}
            max={getCapabilities()?.zoom?.max ?? 100}
            min={getCapabilities()?.zoom?.min ?? 0}
            step={getCapabilities()?.zoom?.step ?? 1}
            value={cameraSetting?.zoom ?? 0}
            onChange={(value) => {
              applySettings({ zoom: value });
            }} />

          <IconButton
            className={styles["icon"]}
            shadow bordered
            icon={<MinusCircleFilled />}
            onClick={() => {
              let newZoom = getCapabilities()?.zoom?.max ?? 0;
              if (cameraSetting?.zoom)
                newZoom = cameraSetting?.zoom;

              newZoom -= (getCapabilities()?.zoom?.step ?? 1);

              applySettings({ zoom: newZoom });
            }}
          />

          <IconButton
            className={styles["icon"]}
            shadow bordered
            icon={<CameraSwitchIcon />}
            onClick={() => {
              const fm = videoConstraints.facingMode?.exact == "environment" ? "user" : "environment";

              setVideoConstraints({ ...videoConstraints, facingMode: { exact: fm } });
            }}
          />

          <IconButton
            className={styles["icon"]}
            shadow bordered
            icon={enableAudio ? <RecordingEnableIcon /> : <RecordingDisableIcon />}
            onClick={() => {
              setEnableAudio(!enableAudio);
            }}
          />

          <IconButton
            className={styles["icon"]}
            shadow bordered
            icon={<CameraScreenshotIcon />}
            onClick={() => {
              getScreenshot().then((pictureUrl) => {
                showInfo("截图", <img alt='截图' width='100%' src={pictureUrl || ""} />);
                // const a = document.createElement("a");
                // document.body.appendChild(a);
                // a.style.cssText = "display: none";
                // a.href = pictureUrl || "";
                // a.download = Date.now() + ".png";
                // a.click();
                // window.URL.revokeObjectURL(pictureUrl || "");
              }).catch((e: any) => {
                sys.log.error("获取截图失败>>>:", e);
                sys.msg.error("获取截图失败");
              });
            }}
          />

          <IconButton
            className={styles["icon"]}
            shadow bordered
          />

        </div>
      </div>

    </div>
  )
});

export interface DurationButtonRef {
  disable: () => void;
  enable: () => void;
}
export const DurationButton = forwardRef(function InnerDurationButton(
  props: Readonly<{
    className?: string;
    progressClassName?: string;
    iconClassName?: string;
    disabled?: boolean;
    maxTime?: number;
    minTime?: number;
    onStart?: () => void;
    onCancel?: () => void;
    onEnd: (duration: number) => void;
    onClick?: () => void;
    progressType?: "line" | "circle" | "dashboard";
    icon?: JSX.Element;
    text?: string;
  }>, ref: React.Ref<DurationButtonRef>) {
  const timer = useRef<NodeJS.Timeout>();
  const [duration, setDuration] = useState<number>(0);
  const [disabled, setDisabled] = useState<boolean>(props.disabled ?? false);
  const maxTime = props.maxTime ?? 30;

  useImperativeHandle(ref, () => ({
    disable: () => {
      setDisabled(true);
    },
    enable: () => {
      setDisabled(false);
    },
  }));

  function cancel() {
    setDuration(0);

    if (timer.current) {
      clearInterval(timer.current);
      timer.current = undefined;
    }

    props.onCancel?.();
  }

  function stop() {
    if (duration <= (props.minTime || 3)) {
      cancel();
      return;
    }

    if (timer.current) {
      clearInterval(timer.current);
      timer.current = undefined;
    }

    setDuration(0);

    props.onEnd?.(duration);
  }

  function start() {
    timer.current = setInterval(() => {
      setDuration((prev) => {
        if (prev < maxTime) {
          return prev + 1;
        }
        else {
          clearInterval(timer.current);
          timer.current = undefined;
          return prev;
        }
      });
    }, 1000);

    props.onStart?.();
  }

  return (
    <Button
      disabled={disabled}
      className={clsx(props.className, props.progressType == "line" ? styles["duration-line"] : styles["duration-circle"])}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={stop}
      onTouchCancel={cancel}
      onClick={() => { props.onClick?.() }}
    >
      <Progress
        className={clsx(props.progressClassName, styles["duration-progress"])}
        type={props.progressType ?? "circle"}
        percent={duration / maxTime * 100}
        showInfo={props.icon ? true : !!props.text}
        format={() =>
          <div className={clsx(props.iconClassName, styles["duration-icon"])}>
            {
              props.icon ?? (props.text ?? "")
            }
          </div>
        }
      />
    </Button>
  );
}
)

export interface SpeechButtonRef {
  disable: () => void;
  enable: () => void;
}
export const SpeechButton = forwardRef(function InnerSpeechButton(
  props: Readonly<{
    maxTime?: number;
    onStart?: () => void;
    onCancel?: () => void;
    onEnd: (audioFileUrl: string | undefined) => void;
  }>, ref: React.Ref<SpeechButtonRef>) {

  const maxTime = props.maxTime ?? 30;
  const buttonRef = useRef<SpeechButtonRef>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    disable: () => {
      buttonRef.current?.disable();
    },
    enable: () => {
      buttonRef.current?.enable();
    },
  }));

  function cancelRecording() {
    setIsSpeaking(false);
    recording.cancel();
    props.onCancel?.();
  }

  function stopRecording(duration: number) {
    setIsSpeaking(false);
    recording.end((success, url, text) => {
      if (!success) {
        sys.log.error("Recording>>>无法保存录音文件:", text);
        sys.msg.error(text ?? Locale.Voice.Error.STTError);
        return;
      }

      props.onEnd?.(url);
    }).catch((e) => {
      sys.log.error("Recording>>>录音异常：", e.message);
      sys.msg.error(e.message ?? Locale.Voice.Error.STTError);
    });
  }

  function startRecording() {
    setIsSpeaking(true);
    recording.start((success, text) => {
      if (!success) {
        sys.log.info("Recording>>>开启录音失败：", text);
        sys.msg.error(Locale.Voice.Error.RecorderError);
        return;
      }

      props.onStart?.();
    });
  }

  return (
    <DurationButton
      ref={buttonRef}
      maxTime={maxTime}
      icon={<DotIcon />}
      progressType="circle"
      onCancel={cancelRecording}
      onStart={startRecording}
      onEnd={stopRecording}
    />
  );
}
)

export interface SpeechMonitorRef {
  start: () => Promise<void>;
  pause: () => Promise<void>;
}

export const SpeechMonitor = forwardRef(function InnerVAD(
  props: Readonly<{
    maxTime?: number;
    className?: string;
    iconClassName?: string;
    onSpeechStart?: () => void;
    onSpeechEnd: (audioFileUrl: string | undefined) => void;
  }>, ref: React.Ref<SpeechMonitorRef>) {

  const appConfig = useAppConfig();
  const maxTime = props.maxTime ?? 30;

  //注意：需将vad-web和onnxruntime-web的dist复制到可访问的位置
  //或者使用有效的CDN！！！
  //手动复制到public/js目录下
  const vad = useMicVAD({
    model: "v5",
    positiveSpeechThreshold: appConfig.speechConfig.threshold,
    // onnxWASMBasePath: "https://cdn.jsdmirror.com/npm/onnxruntime-web/dist/",
    // baseAssetPath: "https://cdn.jsdmirror.com/npm/@ricky0123/vad-web/dist/",
    baseAssetPath: "/cuser/js/@ricky0123/vad-web/dist/",
    onnxWASMBasePath: "/cuser/js/onnxruntime-web/dist/",
    onSpeechStart: () => {
      setSpeaking(true);
      props.onSpeechStart?.();
    },
    onSpeechEnd: (audio) => {
      setSpeaking(false);
      //Float32Array of audio samples at sample rate 16000
      const audioBuffer = utils.encodeWAV(audio, 1);
      const audioData = new Blob([audioBuffer], { type: 'audio/wav' });

      if (!audioData || audioData.size == 0) {
        return;
      }

      const fileName = new Date().getTime() + ".wav";

      file.uploadFile(audioData, fileName)
        .then((url) => {
          sys.log.info("SpeechMonitor>>>音频文件:", url);
          props.onSpeechEnd?.(url);
        })
        .catch((error) => {
          sys.log.info("SpeechMonitor>>>上传文件失败:", error);
        });
    },
  });

  const [listening, setListening] = useState<boolean>(vad.listening);
  const [speaking, setSpeaking] = useState<boolean>(vad.userSpeaking);
  const [error, setError] = useState<string>(vad.errored || "");

  useImperativeHandle(ref, () => ({
    start: async () => {
      return start();
    },
    pause: async () => {
      return pause();
    },
  }));

  async function start() {
    return vad.start().then(() => {
      sys.log.info("SpeechMonitor>>>录音中...");
    }).catch((e) => {
      sys.log.error("SpeechMonitor>>>开启录音失败：", e);
    });
  }

  async function pause() {
    return vad.pause().then(() => {
      sys.log.info("SpeechMonitor>>>暂停录音...");
    }).catch((e) => {
      sys.log.error("SpeechMonitor>>>暂停录音失败：", e);
    });;
  }

  useEffect(() => {
    setListening(vad.listening);
    setSpeaking(vad.userSpeaking);
    setError(vad.errored || "");
  }, [vad.listening, vad.userSpeaking, vad.errored]);

  return (
    <>
      {!(listening || speaking) &&
        <IconButton
          className={clsx(props.className, styles["speech-monitor"])}
          iconClassName={clsx(props.iconClassName, styles["speech-monitor-icon"])}
          icon={<DotIcon />}
          onClick={start}
        />
      }

      {(listening || speaking) &&
        <IconButton
          className={clsx(props.className, styles["speech-monitor"])}
          iconClassName={clsx(props.iconClassName, styles["speech-monitor-icon"])}
          icon={<RecordingIcon />}
          onClick={pause}
        />
      }

      {/* {(speaking) &&
        <IconButton
          className={clsx(props.className, styles["speech-monitor"])}
          iconClassName={clsx(props.iconClassName, styles["speech-monitor-icon"])}
          icon={<LoadingIcon />}
          onClick={pause}
        />
      } */}
    </>
  );
}
)


