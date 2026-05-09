import { IconButton, List, ListItem, Modal, Select, SelectItem } from "../../components/ui-lib";
import Locale from "../../locales";
import { InputRange } from "../../components/input-range";
import { useMobileScreen } from "@/app/utils";
import { DefaultP2VConfig, P2VConfig } from "@/app/types";
import { useEffect, useState } from "react";
import { OpenAPI } from "@/app/openapi";
import SpeakIcon from "../../icons/speak.svg";
import SpeakStopIcon from "../../icons/speak-stop.svg";
import tts from "@/app/utils/useTTS";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

export function P2VConfigEditor(props: {
  defaultConfig: P2VConfig;
  updateConfig: (newConfig: P2VConfig) => void;
}) {

  const isMobileScreen = useMobileScreen();
  const [dictData, setDictData] = useState<any>();
  const [playingVoice, setPlayingVoice] = useState("");
  async function onPlayAudio(voice: string) {

    if (playingVoice) {
      tts.stop();
      setPlayingVoice("");
    }
    else {
      setPlayingVoice(voice);
      tts.speak(Locale.AboutMe.substring(0, 52),
        { ...props.defaultConfig, voice: voice },
        () => { },
        () => {
          setPlayingVoice("");
        });
    }
  };
  const onLoadDict = () => {
    OpenAPI.sysLoadDict("voice", "video_size")
      .then((result) => {
        setDictData(result.result);
      });
  };

  useEffect(() => {
    onLoadDict();
  }, []);

  return (
    <List>

      {props.defaultConfig.enableDuration &&
        <ListItem title={Locale.Settings.P2V.Video.Duration}>
          <Select
            items={[
              {
                title: "5秒",
                value: 5
              },
              {
                title: "10秒",
                value: 10
              }
            ]}
            defaultSelectedValue={[props.defaultConfig.duration]}
            onSelectValue={(values) => {
              props.updateConfig(
                {
                  ...props.defaultConfig,
                  duration: values[0]
                }
              );
            }}
          />
        </ListItem>
      }

      {props.defaultConfig.enableSize &&
        <ListItem
          title={Locale.Settings.P2V.Video.Size}
          desc={Locale.Settings.P2V.Video.SizeDesc}
        >
          <Select
            items={dictData?.video_size?.map((v: any, index: number) => {
              return (
                {
                  title: v.label,
                  value: v.value
                }
              );
            })}
            defaultSelectedValue={[props.defaultConfig.size || "0:0"]}
            onSelectValue={(values) => {
              props.updateConfig(
                {
                  ...props.defaultConfig,
                  size: values[0]
                }
              );
            }}
          />
        </ListItem>
      }

      {props.defaultConfig.enableQuality &&
        <ListItem title={Locale.Settings.P2V.Video.Quality}>
          <Select
            items={[
              {
                title: "默认质量",
                value: 0
              }
            ]}
            defaultSelectedValue={[props.defaultConfig.quality]}
            onSelectValue={(values) => {
              props.updateConfig(
                {
                  ...props.defaultConfig,
                  quality: values[0]
                }
              );
            }}
          />
        </ListItem>
      }

      {props.defaultConfig.enableFPS &&
        <ListItem title={Locale.Settings.P2V.Video.FPS}>
          <Select
            items={[
              {
                title: "30帧",
                value: 30
              },
              {
                title: "60帧",
                value: 60
              }
            ]}
            defaultSelectedValue={[props.defaultConfig.fps]}
            onSelectValue={(values) => {
              props.updateConfig(
                {
                  ...props.defaultConfig,
                  fps: values[0]
                }
              );
            }}
          />
        </ListItem>
      }

      {props.defaultConfig.enableVoice &&
        <ListItem title={Locale.Settings.P2V.Audio.Voice}>
          <Select
            items={
              dictData?.voice?.map((v: any, index: number) => {
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
                  } as SelectItem<string>
                );
              })}
            defaultSelectedValue={[props.defaultConfig.voice]}
            onSelectValue={(values) => {
              props.updateConfig(
                {
                  ...props.defaultConfig,
                  voice: values[0]
                }
              );
            }}
          ></Select>
        </ListItem>
      }

      {props.defaultConfig.enableSpeed &&
        <ListItem
          title={Locale.Settings.P2V.Audio.Speed}
          desc={Locale.Settings.P2V.Audio.SpeedDesc}
          vertical={isMobileScreen}
        >
          <InputRange
            value={props.defaultConfig.speed}
            min={-100}
            max={100}
            step={1}
            onChange={(e) => {
              props.updateConfig(
                {
                  ...props.defaultConfig,
                  speed: e || 0
                }
              );
            }}
          ></InputRange>
        </ListItem>
      }

      {props.defaultConfig.enableIntonation &&
        <ListItem
          title={Locale.Settings.P2V.Audio.Intonation}
          desc={Locale.Settings.P2V.Audio.IntonationDesc}
          vertical={isMobileScreen}
        >
          <InputRange
            value={props.defaultConfig.intonation}
            min={-100}
            max={100}
            step={1}
            onChange={(e) => {
              props.updateConfig(
                {
                  ...props.defaultConfig,
                  intonation: e || 0
                }
              );
            }}
          ></InputRange>
        </ListItem>
      }

      {props.defaultConfig.enableVolume &&
        <ListItem title={Locale.Settings.P2V.Audio.Volume}
          vertical={isMobileScreen}>
          <InputRange
            value={props.defaultConfig.volume}
            min={1}
            max={100}
            step={1}
            onChange={(e) => {
              props.updateConfig(
                {
                  ...props.defaultConfig,
                  volume: e || 0
                }
              );
            }}
          ></InputRange>
        </ListItem>
      }
    </List>
  );
}

export function P2VConfigModal(props: {
  defaultConfig?: P2VConfig;
  onOK: (newConfig: P2VConfig) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState(props.defaultConfig ?? DefaultP2VConfig);

  return <Modal
    title={Locale.Settings.P2V.Title}
    onClose={() => { props.onClose() }}
    actions={[
      <IconButton
        icon={<CloseOutlined />}
        text={Locale.Common.Close}
        key="close"
        bordered
        onClick={() => { props.onClose() }}
      />,
      <IconButton
        icon={<CheckOutlined />}
        text={Locale.Common.Save}
        key="save"
        type="primary"
        bordered
        onClick={() => {
          props.onOK(data);
        }}
      />]}
  >
    <div style={{ maxHeight: "60vh" }}>
      <P2VConfigEditor
        defaultConfig={data}
        updateConfig={
          (newVideoSetting) => {
            setData(newVideoSetting);
          }
        }
      />
    </div>
  </Modal>
}
