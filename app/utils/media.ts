import Locale from "../locales";
import { sys } from "@/app/utils/sys";
import { OpenAPI } from "../openapi";
import { TTSConfig } from "../types";

type TTS = {
  init: () => void;
  dispose: () => void;
  speak: (
    payload: TTSConfig,
    onPlay?: (file: string) => void,
    onEnded?: (success: boolean, file?: string) => void
  ) => Promise<void>;
  stop: () => void;
};

export function createTTS(): TTS {
  let audioContext: AudioContext | null = null;
  let audioBufferSourceNode: AudioBufferSourceNode | null = null;

  const init = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.suspend();
      sys.log.info("tts>>>init.");
    }
  };

  const speak = async (
    payload: TTSConfig,
    onPlay?: (file: string) => void,
    onEnded?: (success: boolean, file?: string) => void
  ) => {
    sys.log.info("tts>>>payload:", payload);

    const { markdownToTxt } = require("markdown-to-txt");
    payload.text = markdownToTxt(payload.text);

    const response = await OpenAPI.aiTTS(payload);

    sys.log.info("tts>>>response.");

    let audioBuffer = response as unknown as ArrayBuffer;
    if (!audioBuffer || audioBuffer.byteLength <= 0) {
      onEnded?.(false, Locale.Voice.Error.TTSError);
      return;
    }

    const buffer = await audioContext!.decodeAudioData(audioBuffer);
    let url = window.URL.createObjectURL(new Blob([audioBuffer], { type: "arraybuffer" }))

    audioBufferSourceNode = audioContext!.createBufferSource();
    audioBufferSourceNode.onended = () => { onEnded?.(true, url) };
    audioBufferSourceNode.buffer = buffer;
    audioBufferSourceNode.connect(audioContext!.destination);
    audioContext!.resume().then(() => {
      onPlay?.(url);
      audioBufferSourceNode!.start();
    });
  };

  const stop = () => {
    if (audioBufferSourceNode) {
      audioBufferSourceNode.stop();
      audioBufferSourceNode.disconnect();
      audioBufferSourceNode = null;
    }
    if (audioContext) {
      audioContext.suspend();
    }
  };

  const dispose = () => {
    if (audioBufferSourceNode) {
      audioBufferSourceNode.stop();
      audioBufferSourceNode.disconnect();
      audioBufferSourceNode = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    sys.log.info("tts>>>dispose.");
  };

  return { init, dispose, speak, stop };
}

type Recording = {
  init: () => Promise<void>;
  dispose: () => void;
  startRecording: (onStarted?: (success: boolean, msg?: string) => void | null) => void;
  stopRecording: (onEnded: (audioData?: Blob) => void | null) => void;
  cancelRecording: () => void;
};

export function createRecording(): Recording {

  let stream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let isCancelled: boolean = false;
  let audioChunks: Blob[] = [];
  let complete: (audioData?: Blob) => void | null;

  const startRecording = (onStarted?: (success: boolean, msg?: string) => void | null) => {
    audioChunks = [];

    if (!mediaRecorder) {
      onStarted?.(false, Locale.Voice.Error.RecorderError);
      sys.log.error("recording>>>error. mediaRecorder 初始化失败");
      return;
    }

    if (mediaRecorder?.state != "recording")
      mediaRecorder?.start();

    onStarted?.(true);
    sys.log.info("recording>>>开始录音...");
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      isCancelled = true;
      mediaRecorder.stop();
      sys.log.info("recording>>>取消录音.");
    }

    audioChunks = [];
  };

  const stopRecording = (onEnded: (audioData?: Blob) => void | null) => {
    complete = onEnded;

    if (mediaRecorder) {
      isCancelled = false;
      mediaRecorder.stop();
    }
    else {
      sys.log.error("recording>>>error, mediaRecorder不存在.");
      onEnded?.();
    }

    sys.log.info("recording>>>结束录音.");
  };

  const init = async () => {
    if (mediaRecorder) {
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder = new MediaRecorder(stream, { audioBitsPerSecond: 16000 });

      mediaRecorder.ondataavailable = (event) => {
        audioChunks = [...audioChunks, event.data];
      };
      mediaRecorder.onstop = (event) => {
        packageAudioData();
      };

      sys.log.info("recording>>>init.");
    }
    catch (error: any) {
      sys.log.error('recording>>>init Error:', error);
    }
  }

  const dispose = () => {
    if (stream) {
      stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live') {
          track.stop();
        }
      });

      stream = null;
    }

    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder = null;
    }

    audioChunks = [];

    sys.log.info("recording>>>dispose.");
  };

  const packageAudioData = async () => {
    if (isCancelled)
      return;

    if (audioChunks.length <= 0) {
      complete?.();
      return;
    }

    sys.log.info("recording>>>packageAudioData...", audioChunks.length);

    const reader = new FileReader();

    reader.onload = async (event) => {
      sys.log.info("recording>>>FileReader...");

      if (!event.target?.result) {
        complete?.();
        return;
      }

      try {

        //设置采样率为16000，不设置会根据浏览器自己来判断设置
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const arrayBuffer = event.target.result as unknown as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        //设置wav的头
        const wavData = encodeWAV(audioBuffer);
        const wavBlob = new Blob([wavData], { type: 'audio/wav' });
        // const formData = new FormData();
        // formData.append('file', wavBlob, 'recording.wav');

        sys.log.info("recording>>>blob:", wavBlob.size);

        complete?.(wavBlob);
      } catch (e) {
        sys.log.error('recording>>>audio failed', e);
        complete?.();
      }
    };

    reader.readAsArrayBuffer(audioChunks[0]);
  };



  const encodeWAV = (audioBuffer: AudioBuffer) => {
    const numOfChan = audioBuffer.numberOfChannels,
      length = audioBuffer.length * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      sampleRate = audioBuffer.sampleRate,
      samples = audioBuffer.getChannelData(0);

    let offset = 0;

    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset++, str.charCodeAt(i));
      }

    };
    writeString('RIFF');
    view.setUint32(offset, length - 8, true);
    offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint16(offset, numOfChan, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * 2 * numOfChan, true);
    offset += 4;
    view.setUint16(offset, numOfChan * 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString('data');
    view.setUint32(offset, length - offset - 8, true);
    offset += 4;
    for (const element of samples) {
      view.setInt16(offset, element * 0x7FFF, true);
      offset += 2;
    }
    return view;
  };

  return { init, dispose, startRecording, stopRecording, cancelRecording };
}
