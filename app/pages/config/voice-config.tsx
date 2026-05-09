import Locale from "../../locales";
import { ListItem, Input, Select, IconButton } from "../../components/ui-lib";
import { InputRange } from "../../components/input-range";
import { useEffect, useState } from "react";
import tts from "../../utils/useTTS";
import { Button } from "antd";
import SpeakIcon from "../../icons/speak.svg";
import SpeakStopIcon from "../../icons/speak-stop.svg";
import { OpenAPI } from "@/app/openapi";
import { VoiceConfig } from "@/app/types";
import { useMobileScreen } from "@/app/utils";

export function VoiceConfigEditor(props: {
  voiceConfig: VoiceConfig;
  updateConfig: (updater: (config: VoiceConfig) => void) => void;
}) {
  const [dictData, setDictData] = useState<any>();
  const [playingVoice, setPlayingVoice] = useState("");
  const [auditionText, setAuditionText] = useState<string>(Locale.AboutMe);
  const onLoadDict = () => {
    OpenAPI.sysLoadDict("voice")
      .then((result) => {
        setDictData(result.result);
      });
  };
  async function onPlayAudio(voice: string) {

    if (playingVoice) {
      tts.stop();
      setPlayingVoice("");
    }
    else {
      setPlayingVoice(voice);
      tts.speak(auditionText.substring(0, 52),
        { ...props.voiceConfig, voice: voice },
        () => { },
        () => {
          setPlayingVoice("");
        });
    }
  };

  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    onLoadDict();
  }, []);

  return (
    <>

      <ListItem title={Locale.Settings.Audio.Voice}
        desc={Locale.Settings.Audio.VoiceDesc}>

        <Select
          items={
            dictData?.voice?.map(
              (v: any, index: number) => {
                return (
                  {
                    title: v.label,
                    value: v.value,
                    actions: [
                      <IconButton
                        key={"speak"}
                        onClick={(e) => {
                          if (!playingVoice) {
                            onPlayAudio(v.value);
                          }
                          e.stopPropagation();
                        }}
                        icon={
                          (playingVoice == v.value) ? (
                            <SpeakStopIcon />
                          ) : (
                            <SpeakIcon />
                          )
                        } />
                    ]
                  }
                )
              }
            )
          }
          defaultSelectedValue={[props.voiceConfig.voice]}
          onSelectValue={(values) => {
            props.updateConfig(
              (config) => (config.voice = values[0]),
            )
          }}

        ></Select>
      </ListItem>

      <ListItem
        title={Locale.Settings.Audio.Speed}
        desc={Locale.Settings.Audio.SpeedDesc}
        vertical={isMobileScreen}
      >
        <InputRange
          value={props.voiceConfig.speed}
          min={-100}
          max={100}
          step={1}
          onChange={(e) => {
            props.updateConfig(
              (config) => (config.speed = e || 0),
            )
          }}
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.Audio.Intonation}
        desc={Locale.Settings.Audio.IntonationDesc}
        vertical={isMobileScreen}
      >
        <InputRange
          value={props.voiceConfig.intonation}
          min={-100}
          max={100}
          step={1}
          onChange={(e) => {
            props.updateConfig(
              (config) => (config.intonation = e || 0),
            )
          }}
        ></InputRange>
      </ListItem>



      <ListItem
        title={Locale.Settings.Audio.Volume}
        desc={Locale.Settings.Audio.VolumeDesc}
        vertical={isMobileScreen}
      >
        <InputRange
          value={props.voiceConfig.volume}
          min={1}
          max={100}
          step={1}
          onChange={(e) => {
            props.updateConfig(
              (config) => (config.volume = e || 0),
            )
          }}
        ></InputRange>
      </ListItem>

      <ListItem title={Locale.Settings.Audio.AuditionText}>
        <Button onClick={() => { onPlayAudio(props.voiceConfig.voice) }} icon={
          playingVoice ? (
            <SpeakStopIcon />
          ) : (
            <SpeakIcon />
          )
        }>{Locale.Settings.Audio.Audition}</Button>

      </ListItem>
      <ListItem vertical={true}>
        <Input
          aria-label={Locale.Settings.Audio.AuditionText}
          value={auditionText}
          onInput={(e) => {
            setAuditionText(e.currentTarget.value);
          }}
        />
      </ListItem>

    </>
  );
}
