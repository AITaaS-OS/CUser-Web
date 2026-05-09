import { useAppConfig } from "../store";
import { OpenAPI } from "../openapi";
import { STSConfig } from "../types";
import recording from "./useRecording";

// 语音转语音

async function startSpeech(onStarted?: (success: boolean, msg?: string) => void | null) {
    recording.start(onStarted);
}

function cancelSpeech() {
    recording.cancel();
}

async function speech2speech(onCompleted?: (success: boolean, result?: any) => void | null) {
    recording.end((success, audioFileUrl, text) => {
        if (!success || !audioFileUrl) {
            onCompleted?.(false, text);
            return;
        }

        const stsPayload: STSConfig = { ...useAppConfig.getState().voiceConfig, audioPath: audioFileUrl };

        OpenAPI.aiSTS(stsPayload)
            .then((response) => {
                if (response.success) {
                    onCompleted?.(true, response.result ?? "");
                }
                else {
                    onCompleted?.(false, response.message);
                }
            })
            .catch((e) => {
                onCompleted?.(false, e.message);
            });
    });
}

async function speech2OSS(onCompleted?: (success: boolean, result?: string) => void | null) {
    recording.end((success, audioFileUrl, text) => {
        if (!success || !audioFileUrl) {
            onCompleted?.(false, text);
            return;
        }


        onCompleted?.(true, audioFileUrl);
    });
}

async function stopSpeech(onEnded?: (audioData?: Blob) => void | null) {
    recording.endWithData(onEnded);
}

const sts = { startSpeech, stopSpeech, cancelSpeech, speech2speech, speech2OSS };

export default sts;
