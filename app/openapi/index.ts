import dayjs from "dayjs";
import { AITaaS_BaseUrl } from "../config/env";
import http from "../http/request";
import { useUserState } from "../store/user";
import { DefaultPayment, Page, User, STSConfig, STTTTConfig, TTSConfig, TTTConfig, VideoConfig, Mask, Prompt, PTPConfig, UserRegisterInfo } from "../types";
import { sys } from "../utils/sys";
import { MainTask } from "../pages/aitask/types";

export enum OpenAPIPath {
    CheckLatest = "/openapi/smartclient/getlatestversion",

    SendVerifyCode = "/openapi/auth/sendVerifyCode",
    Register = "/openapi/auth/login",

    AIChat = "/openapi/ai/chat",
    AIChatStream = "/openapi/ai/chat_flux",
    AIChatClearHistory = "/openapi/cuser/clear-chat-history",
    AITTS = "/openapi/ai/tta",
    AISTT = "/openapi/ai/att",
    AISTTTT = "/openapi/ai/atttt",
    AITTT = "/openapi/ai/ttt",
    AISTS = "/openapi/ai/attta",
    AIPTP = "/openapi/ai/ptp",
    AIEMO = "/openapi/ai/emodetect",

    AIMaskList = "/openapi/aimask/list",
    AIMaskSave = "/openapi/aimask/save",
    AIMaskDelete = "/openapi/aimask/delete",

    AIPromptList = "/openapi/aiprompt/list",
    AIPromptSave = "/openapi/aiprompt/save",
    AIPromptDelete = "/openapi/aiprompt/delete",

    UserCheckToken = "/openapi/cuser/checkToken",
    UserUpgrade = "/openapi/cuser/vip",
    UserPrice = "/openapi/cuser/price",
    UserBalance = "/openapi/cuser/balance",
    UserConfig = "/openapi/cuser/config",
    UserConfig_Video_Save = "/openapi/cuser/config/video/save",
    UserConfig_Video_Get = "/openapi/cuser/config/video/get",
    UserFeedback = "/openapi/cuser/feedback",

    AITaskSearchTasks = "/openapi/aitask/tasks",
    AITaskGetTaskDetail = "/openapi/aitask/task_detail",
    AITaskGetTask = "/openapi/aitask/task",
    AITaskSaveTask = "/openapi/aitask/save",
    AITaskStartTask = "/openapi/aitask/start",
    AITaskRetryTask = "/openapi/aitask/retry",
    AITaskReDoTask = "/openapi/aitask/redo",
    AITaskPay4Priority = "/openapi/aitask/pay4priority",
    AITaskPay4Video = "/openapi/aitask/pay4video",
    AITaskDownloadTask = "/openapi/aitask/download",
    AITaskDeleteTask = "/openapi/aitask/delete",
    AITaskSampleAudio = "/openapi/aitask/audio",

    OSSGetSTS = "/openapi/oss/getsts",
    OSSGetUrl = "/openapi/oss/geturl",
    FileUpload = "/openapi/file/upload",
    FileView = "/openapi/file/view",

    SysDict = "/openapi/sys/dict",

}

export const UPLOAD_URL = AITaaS_BaseUrl + OpenAPIPath.FileUpload;
export const FILEVIEW_URL = AITaaS_BaseUrl + OpenAPIPath.FileView;

export const OpenAPI = {
    sysCheckLatest: async function () {
        return http.get<any>(OpenAPIPath.CheckLatest)
    },
    sysLoadDict: async function (...dict_names: string[]) {
        return http.get<any>(OpenAPIPath.SysDict + "?codes=" + dict_names.join())
    },

    sysFeedback: async function (feedback: any) {
        return http
            .post<boolean>(
                OpenAPIPath.UserFeedback,
                feedback
            );
    },

    userVerifyCode: async function (registerInfo: UserRegisterInfo) {
        return http
            .post<boolean>(
                OpenAPIPath.SendVerifyCode,
                registerInfo
            );
    },
    userRegister: async function (registerInfo: UserRegisterInfo) {
        return http
            .post<User>(
                OpenAPIPath.Register,
                registerInfo
            );
    },
    userCheckToken: async function () {
        return http.get<User>(
            OpenAPIPath.UserCheckToken +
            "?token=" + useUserState.getState().accessToken
        );
    },
    userCheckTokenAndUpdateUserInfo: async function () {
        return http.get<User>(
            OpenAPIPath.UserCheckToken +
            "?token=" +
            useUserState.getState().accessToken +
            "&username=" +
            useUserState.getState().userName +
            "&useravatar=" +
            useUserState.getState().userAvatar
        );
    },

    userUpgrade2VIP: async function () {
        return http
            .post<User>(
                OpenAPIPath.UserUpgrade +
                "?token=" +
                useUserState.getState().accessToken +
                "&user_id=" +
                useUserState.getState().userId +
                "&user_type=1",
                {
                    ...DefaultPayment,
                    dataId: useUserState.getState().userId,
                    functionCode: 91,
                }
            );
    },

    userGetPrice: async function (functionCode: number) {
        return http.get<any>(
            OpenAPIPath.UserPrice +
            "?user_id=" +
            useUserState.getState().userId +
            "&function_code=" +
            functionCode,
        )
    },

    userSaveConfig: async function (config: any) {
        return http.post<string>(OpenAPIPath.UserConfig, config)
    },

    userGetConfig: async function () {
        return http.get<any>(OpenAPIPath.UserConfig)
    },

    userGetEMO: async function () {
        return http.get<[]>(OpenAPIPath.UserConfig_Video_Get)
    },

    userSaveEMO: async function (data: { face: VideoConfig, audio: any, texts: any }) {
        return http.post<MainTask>(OpenAPIPath.UserConfig_Video_Save, data);
    },

    userSearchBalance: async function (params: { startTime?: string, endTime?: string, pageSize?: number, pageNo?: number }) {

        const p = {
            startTime: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
            endTime: dayjs().format('YYYY-MM-DD'),
            pageSize: 100,
            pageNo: 1,
            ...params ?? params
        };

        return http
            .get<any>(
                OpenAPIPath.UserBalance +
                "?startTime=" + p.startTime +
                "&endTime=" + p.endTime +
                "&pageNo=" + p.pageNo +
                "&pageSize=" + p.pageSize +
                "&token=" +
                useUserState.getState().accessToken +
                "&user_id=" +
                useUserState.getState().userId,
            )
    },

    aiEMODetect: async function (data: VideoConfig) {
        return http.post<VideoConfig>(OpenAPIPath.AIEMO, data);
    },

    aiChat: async function (...msgs: any[]) {

        const data = {
            uid: useUserState.getState().userId,
            msg: msgs
        };

        return http.post<string>(OpenAPIPath.AIChat, data)
    },

    aiChatClearHistory: async function () {
        return http.post<any>(OpenAPIPath.AIChatClearHistory);
    },

    aiTTT: async function (config: TTTConfig) {
        return http.post<any>(OpenAPIPath.AITTT, config);
    },

    aiSTS: async function (config: STSConfig) {
        return http.post<string>(OpenAPIPath.AISTS, config);
    },

    aiPTP: async function (config: PTPConfig) {
        return http.post<string>(OpenAPIPath.AIPTP, config);
    },

    aiSTT: async function (config: {
        audio: string;
    }) {
        return http.post<{ audio: string, text: string }>(OpenAPIPath.AISTT, config)
    },

    aiSTTTT: async function (config: STTTTConfig) {
        return http.post<{ audio: string, audioText: string, text: string }>(OpenAPIPath.AISTTTT, config);
    },

    aiTTS: async function (config: TTSConfig) {
        return http.request("POST", OpenAPIPath.AITTS, config, { responseType: "arraybuffer" });
    },

    aiTaskSearchMainTask: async function (params: { category: number, pageSize?: number, pageNo?: number }) {
        const p = { taskName: "", pageSize: 1000, pageNo: 1, ...params };
        return http.get<Page<MainTask>>(OpenAPIPath.AITaskSearchTasks +
            "?taskCategory=" + p.category +
            "&pageNo=" + p.pageNo +
            "&pageSize=" + p.pageSize
        );
    },
    aiTaskGetMainTask: async function (id: string) {
        return http.get<MainTask>(OpenAPIPath.AITaskGetTaskDetail + "?task_id=" + id)
    },
    aiTaskStartTask: async function (id: string) {
        return http.post<string>(OpenAPIPath.AITaskStartTask + "?task_id=" + id)
    },
    aiTaskRetryTask: async function (id: string) {
        return http.post<string>(OpenAPIPath.AITaskRetryTask + "?task_id=" + id)
    },
    aiTaskReDoTask: async function (id: string) {
        return http.post<string>(OpenAPIPath.AITaskReDoTask + "?task_id=" + id)
    },
    aiTaskDeleteTask: async function (id: string) {
        return http.post<string>(OpenAPIPath.AITaskDeleteTask + "?task_id=" + id)
    },
    aiTaskDownloadTaskResult: async function (id: string) {
        return http.get<string>(OpenAPIPath.AITaskDownloadTask + "?task_id=" + id)
    },
    aiTaskPay4Video: async function (id: string) {
        return http.post<string>(OpenAPIPath.AITaskPay4Video + "?task_id=" + id,
            {
                ...DefaultPayment,
                dataId: id,
                functionCode: 80,
            })
    },
    aiTaskPay4Priority: async function (id: string) {
        return http.post<string>(OpenAPIPath.AITaskPay4Priority + "?task_id=" + id,
            {
                ...DefaultPayment,
                dataId: id,
                functionCode: 81,
            })
    },
    aiTaskSaveTask: async function (task: MainTask) {
        return http.post<string>(OpenAPIPath.AITaskSaveTask, task);
    },

    aiMaskSearchData: async function (params?: { name?: string, lang?: string, pageSize?: number, pageNo?: number }) {

        const p = {
            name: "",
            lang: "cn",
            pageSize: 1000,
            pageNo: 1,
            ...params ?? params
        };

        return http.get<Page<Mask>>(OpenAPIPath.AIMaskList, p);
    },
    aiMaskSaveData: async function (mask: Mask) {
        return http.post<Mask>(OpenAPIPath.AIMaskSave, mask);
    },
    aiMaskDeleteData: async function (id: string) {
        return http.post<string>(OpenAPIPath.AIMaskDelete + "?id=" + id);
    },

    aiPromptSearchData: async function (params?: { name?: string, lang?: string, pageSize?: number, pageNo?: number }) {

        const p = {
            name: "",
            lang: "",
            pageSize: 1000,
            pageNo: 1,
            ...params ?? params
        };

        return http.get<Page<Prompt>>(OpenAPIPath.AIPromptList, p);
    },
    aiPromptSaveData: async function (prompt: Prompt) {
        return http.post<Prompt>(OpenAPIPath.AIPromptSave, prompt);
    },
    aiPromptDeleteData: async function (id: string) {
        return http.post<string>(OpenAPIPath.AIPromptDelete + "?id=" + id);
    },



    ossGetSTS: async function (filePath: string) {
        return http.get<any>(AITaaS_BaseUrl + OpenAPIPath.OSSGetSTS, { "file": filePath });
    },

    ossGetUrl: async function (filePath: string) {
        return http.get<string>(OpenAPIPath.OSSGetUrl, { "file": filePath });
    },

    default: async function (params: {}) {

    },

    promptList: async function (params?: { name?: string, lang?: string, pageSize?: number, pageNo?: number }) {
        const p = { name: "", lang: "", pageSize: 1000, pageNo: 1, ...params ?? params };
        sys.log.info(">>>p:{}", p);
        return http.get<Page<Prompt>>(OpenAPIPath.AIPromptList, p);
    },
};