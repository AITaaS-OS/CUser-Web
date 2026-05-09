import Locale from "../../locales";
import { ListItem } from "../../components/ui-lib";
import { InputRange } from "../../components/input-range";
import { SpeechConfig } from "@/app/types";
import { useMobileScreen } from "@/app/utils";

export function SpeechConfigEditor(props: {
  speechConfig: SpeechConfig;
  updateConfig: (updater: (config: SpeechConfig) => void) => void;
}) {
  const isMobileScreen = useMobileScreen();

  return (
    <ListItem
      title={Locale.Settings.Speech.Threshold}
      desc={Locale.Settings.Speech.ThresholdDesc}
      vertical={isMobileScreen}
    >
      <InputRange
        value={props.speechConfig.threshold}
        min={0}
        max={1}
        step={0.1}
        onChange={(e) => {
          props.updateConfig(
            (config) => (config.threshold = e || 0),
          )
        }}
      ></InputRange>
    </ListItem>
  );
}
