import { TTSConfig } from "../../store";

import Locale from "../../locales";
import { CheckBox, ListItem } from "../../components/ui-lib";

export function AIChatConfigEditor(props: Readonly<{
  ttsConfig: TTSConfig;
  updateConfig: (updater: (config: TTSConfig) => void) => void;
}>) {
  return (
    <>
      {/* <ListItem
        title={Locale.Settings.TTS.Enable.Title}
        desc={Locale.Settings.TTS.Enable.SubTitle}
      >
        <CheckBox
          checked={props.ttsConfig.enable}
          onChange={(e) =>
            props.updateConfig(
              (config) => {
                config.enable = e.target.checked;

                if (!e.target.checked)
                  config.autoplay = false;
              },
            )
          }
        />
      </ListItem> */}

      <ListItem
        title={Locale.Settings.AIChat.Autoplay.Title}
        desc={Locale.Settings.AIChat.Autoplay.SubTitle}
      >
        <CheckBox
          checked={props.ttsConfig.autoplay}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.autoplay = e.target.checked),
            )
          }
        />
      </ListItem>

      {
        props.ttsConfig.enable && <>


          {/* <ListItem title={Locale.Settings.TTS.Engine} >
            <Select
              defaultSelectedValue={[props.ttsConfig.engine]}
              items={
                TTS_ENGINES.map((v, i) => (
                  {
                    title: v,
                    value: v
                  }
                ))
              }
              onSelectValue={(values) => {
                props.updateConfig(
                  (config) =>
                    (config.engine = TTSConfigValidator.engine(values[0]))
                );
              }}
            />
          </ListItem>

          {
            props.ttsConfig.engine !== DEFAULT_TTS_ENGINE && (
              <ListItem title={Locale.Settings.TTS.Model}>
                <Select
                  defaultSelectedValue={[props.ttsConfig.model]}
                  items={
                    TTS_MODELS.map((v, i) => (
                      {
                        title: v,
                        value: v
                      }
                    ))
                  }
                  onSelectValue={(values) => {
                    props.updateConfig(
                      (config) =>
                        (config.model = TTSConfigValidator.model(values[0]))
                    );
                  }}
                />
              </ListItem>
            )
          } */}
        </>
      }
    </>
  );
}
