import { sys } from "@/app/utils/sys";
import { OpenAPI } from "../openapi";
import recording from "./useRecording";

// 语音转文字

interface STTPayload {
    audio: string;
};

async function startSpeech(onStarted?: (success: boolean, msg?: string) => void | null) {
    recording.start(onStarted);
}

function cancelSpeech() {
    recording.cancel();
}

async function speech2Text(onCompleted: (success: boolean, audioFile?: string, result?: string) => void) {
    recording.end((success, audioFileUrl, text) => {
        if (!success || !audioFileUrl) {
            onCompleted?.(false, "", text);
            return;
        }

        //调用STT服务
        const sttPayload: STTPayload = { audio: audioFileUrl };

        sys.log.info("stt>>>调用STT服务:", sttPayload);

        OpenAPI.aiSTT(sttPayload)
            .then((response) => {
                if (response.success) {
                    sys.log.info('stt>>>语音转文字结果:', response.result);
                    onCompleted?.(true, response.result?.audio, response.result?.text);
                }
                else {
                    sys.log.info("stt>>>语音转文字失败:{message}", response);
                    onCompleted?.(false, audioFileUrl, response.message);
                }
            })
            .catch((e) => {
                sys.log.info("stt>>>catch error:", e);
                onCompleted?.(false, audioFileUrl, e.message);
            });
    });
}

const stt = { startSpeech, speech2Text, cancelSpeech };

export default stt;
