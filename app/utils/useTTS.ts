import { useAppConfig } from "../store";
import { VoiceConfig } from "../types";
import { createTTS } from "../utils/media";

// 同种文字转语音

const innerTTS = createTTS();

async function speak(
    text: string,
    setting?: VoiceConfig | null,
    onPlay?: (file: string) => void,
    onEnded?: (success: boolean, file?: string) => void
) {
    innerTTS.stop();
    innerTTS.init();

    let audioConfig = useAppConfig.getState().voiceConfig;
    if (setting) {
        audioConfig = { ...audioConfig, ...setting };
    }

    innerTTS.speak({ ...audioConfig, text: text }, onPlay, onEnded);
}

function stop() {
    innerTTS.stop();
}

function dispose() {
    innerTTS.dispose();
}

const tts = { speak, stop, dispose };

export default tts;
