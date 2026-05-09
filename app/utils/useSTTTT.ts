import { createRecording } from "../utils/media";
import { sys } from "@/app/utils/sys";
import { useAppConfig } from "../store";
import { OpenAPI } from "../openapi";
import { STTTTConfig } from "../types";
import recording from "./useRecording";

// 语音转文字后翻译

const innerSpeech = createRecording();

async function startSpeech(onStarted?: (success: boolean, msg?: string) => void | null) {
    recording.start(onStarted);
}

function cancelSpeech() {
    recording.cancel();
}

async function speech2Text(onCompleted: (success: boolean, audio?: string, result?: string) => void) {
    recording.end((success, audioFileUrl, text) => {
        if (!success || !audioFileUrl) {
            onCompleted?.(false, "", text);
            return;
        }

        //调用ATTTT服务
        const sttPayload: STTTTConfig = { ...useAppConfig.getState().tttConfig, audio: audioFileUrl, sourceText: "" };

        sys.log.info("stttt>>>调用ATTTT服务:", sttPayload);

        OpenAPI.aiSTTTT(sttPayload)
            .then((response) => {
                if (response.success) {
                    sys.log.info('stttt>>>语音转译文字结果:', response.result);
                    onCompleted?.(true, response.result?.audio, response.result?.text + "\n(" + response.result?.audioText + ")");
                }
                else {
                    sys.log.info("stttt>>>语音转译文字失败:{message}", response);
                    onCompleted?.(false, audioFileUrl, response.message);
                }
            })
            .catch((e) => {
                sys.log.info("stttt>>>catch error:", e);
                onCompleted?.(false, audioFileUrl, e.message);
            });
    });
}

const stttt = { startSpeech, speech2Text, cancelSpeech };

export default stttt;
