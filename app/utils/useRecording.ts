import { createRecording } from "../utils/media";
import Locale from "../locales";
import { sys } from "@/app/utils/sys";
import file from "./file";

// 录音相关逻辑

const innerRecording = createRecording();

async function start(onStarted?: (success: boolean, msg?: string) => void | null) {
    await innerRecording.init();

    innerRecording.startRecording(onStarted);
}

function cancel() {
    innerRecording.cancelRecording()
}

async function end(onCompleted: (success: boolean, audioFileUrl?: string, text?: string) => void) {
    innerRecording.stopRecording((audioData?: Blob) => {

        if (!audioData || audioData.size == 0) {
            onCompleted?.(false, "", Locale.Voice.Error.STTError);
            return;
        }

        const fileName = new Date().getTime() + ".wav";

        file.uploadFile(audioData, fileName)
            .then((url) => {
                onCompleted?.(true, url);
            })
            .catch((error) => {
                sys.log.info("sts>>>上传文件失败:", error);
                onCompleted?.(false, Locale.Common.UploadFailed);
            });
    });
}

async function endWithData(onEnded?: (audioData?: Blob) => void | null) {
    innerRecording.stopRecording((audioData?: Blob) => {
        onEnded?.(audioData);
    });
}

const recording = { start, end, cancel, endWithData };

export default recording;
