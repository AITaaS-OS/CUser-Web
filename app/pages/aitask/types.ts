export enum TaskStatus {
  TaskDeleted = 0,
  //任务已创建1
  TaskCreated = 1,
  //任务排队中2
  TaskInQueue = 2,
  //任务处理中3
  TaskProcessing = 3,
  //任务已完成4
  TaskCompleted = 4,
  //任务失败5
  TaskFailed = 5,
  //任务等待付款6
  TaskForPay = 6,
  //任务等待下载7
  TaskForDownload = 7,
  //任务关闭8
  TaskClosed = 8,
  //任务挂起9
  TaskSuspend = 9,
};

export type AudioTask = {
  id: string;
  mainTaskId: string;
  taskIndex: number;
  taskPrompt: string;
  taskStatus: TaskStatus;

  text: string;
  voice: string;
  speed: number;
  volume: number;
  intonation: number;
  emotion: string;
};

export type VideoTask = {
  id: string;
  mainTaskId: string;
  taskPrompt: string;
  taskStatus: TaskStatus;
  taskMsg: string;
  taskIndex: number;

  audioId: string;
  picture: string;
  pictureRatio: string;
  pictureMainBox: Array<number> | undefined;
  pictureFocusBox: Array<number> | undefined;

  extraPicture: string;
  extraPictureMainBox: Array<number> | undefined;
  extraPictureFocusBox: Array<number> | undefined;

  quality: number;
  duration: number;
  fps: number;
  size: string | undefined;
};

export type MainTask = {
  id: string;
  createBy: string;
  createTime: number;
  updateBy: string;
  updateTime: number;
  taskCategory: number;
  taskName: string;
  taskDesc: string;
  taskPrompt: string;
  taskPriority: number;
  taskStatus: TaskStatus;
  taskMsg: string;
  audios: AudioTask[];
  videos: VideoTask[];
};

import { useUserState } from "../../store/user";

export const DefaultAudioTask: AudioTask = {
  id: "",
  mainTaskId: "",
  taskPrompt: "",
  taskStatus: TaskStatus.TaskCreated,
  text: "",
  taskIndex: 0,
  voice: "aliyun-zhiyuan",
  speed: 0,
  intonation: 0,
  volume: 100,
  emotion: "",
};

export const DefaultVideoTask: VideoTask = {
  id: "",
  mainTaskId: "",
  taskPrompt: "",
  taskStatus: TaskStatus.TaskCreated,
  taskMsg: "",
  audioId: "",
  picture: "",
  taskIndex: 1,
  pictureRatio: "",
  pictureMainBox: undefined,
  pictureFocusBox: undefined,
  extraPicture: "",
  extraPictureMainBox: undefined,
  extraPictureFocusBox: undefined,
  quality: 0,
  duration: 5,
  fps: 30,
  size: "0:0"
};

export const DefaultMainTask: MainTask = {
  id: "",
  createBy: useUserState.getState().userId,
  createTime: Date.now(),
  updateBy: useUserState.getState().userId,
  updateTime: Date.now(),
  taskCategory: 0,
  taskName: "",
  taskDesc: "",
  taskPriority: 0,
  taskStatus: TaskStatus.TaskCreated,
  taskMsg: "",
  taskPrompt: "",
  videos: [],
  audios: []
}
