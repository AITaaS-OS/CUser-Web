import Locale from "../../locales";
import { ListItem, CheckBox } from "../../components/ui-lib";
import { useMobileScreen } from "@/app/utils";
import { VisionConfig } from "@/app/types";

export function VisionConfigEditor(props: {
  config: VisionConfig;
  updateConfig: (updater: (config: VisionConfig) => void) => void;
}) {
  const isMobileScreen = useMobileScreen();

  return (
    <>
      <ListItem
        title={Locale.Settings.Vision.EnableVideo}
        desc={Locale.Settings.Vision.EnableVideoDesc}
      >
        <CheckBox
          checked={props.config.enableVideo}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.enableVideo = e.target.checked),
            )
          }
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.Vision.EnableSpeak}
        desc={Locale.Settings.Vision.EnableSpeakDesc}
      >
        <CheckBox
          checked={props.config.enableSpeak}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.enableSpeak = e.target.checked),
            )
          }
        />
      </ListItem>
    </>
  );
}
