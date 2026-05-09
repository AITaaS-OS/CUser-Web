import { ModelProvider } from "@/app/constant";
import { ModalConfigValidator, ModelConfig, useChatStore, useModelStore } from "../../store";

import Locale from "../../locales";
import { InputRange } from "../../components/input-range";
import { Input, ListItem } from "../../components/ui-lib";
import { getModelProvider } from "../../utils/model";
import { useMobileScreen } from "@/app/utils";
import { Markdown } from "@/app/components/markdown";
import { ModelSelector } from "@/app/components/model-select";

export function ModelConfigEditor(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const modelStore = useModelStore();
  const chatStore = useChatStore();
  const chatSession = chatStore.currentSession();
  const currentModel = `${props.modelConfig.modelName}@${props.modelConfig.modelProvider.toString()}`;
  const isMobileScreen = useMobileScreen();

  return (
    <>
      <ListItem
        title={Locale.Settings.Model.Model.Title}
        desc={Locale.Settings.Model.Model.SubTitle}
      >
        <ModelSelector
          defaultSelectedValue={[currentModel]}
          onSelectValue={(key) => {
            if (key.length === 0) return;
            const [model, providerName] = getModelProvider(key[0]);
            props.updateConfig((config) => {
              config.modelName = ModalConfigValidator.model(model);
              config.modelProvider = providerName as ModelProvider;

              chatStore.updateTargetSession(chatSession, (session) => {
                session.mask.modelConfig.modelName = model;
                session.mask.modelConfig.modelProvider =
                  providerName as ModelProvider;
              });
            });
          }}
        />
        {/* <Select
          aria-label={Locale.Settings.Model}
          value={value}
          align="left"
          onChange={(e) => {
            const [model, providerName] = getModelProvider(
              e.currentTarget.value,
            );
            props.updateConfig((config) => {
              config.modelName = ModalConfigValidator.model(model);
              config.modelProvider = providerName as ModelProvider;
            });
          }}
        >
          {Object.keys(groupModels).map((providerName, index) => (
            <optgroup label={providerName} key={index} className="select-optgroup">
              {groupModels[providerName].map((v, i) => (
                <option value={`${v.name}@${v.provider?.providerName}`} key={i} className="select-opt">
                  {v.displayName}
                </option>
              ))}
            </optgroup>
          ))}
        </Select> */}
      </ListItem>
      <ListItem
        title={Locale.Settings.Model.Temperature.Title}
        desc={Locale.Settings.Model.Temperature.SubTitle}
        vertical={isMobileScreen}
      >
        <InputRange
          nullable={true}
          value={props.modelConfig.temperature?.toFixed(1)}
          min={0}
          max={1} // lets limit it to 0-1
          step={0.1}
          onChange={(e) => {
            props.updateConfig(
              (config) =>
              (config.temperature =
                e ? ModalConfigValidator.temperature(e) : undefined
              ),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.Model.TopP.Title}
        desc={Locale.Settings.Model.TopP.SubTitle}
        vertical={isMobileScreen}
      >
        <InputRange
          nullable={true}
          value={props.modelConfig.top_p?.toFixed(1)}
          min={0}
          max={1}
          step={0.1}
          onChange={(e) => {
            props.updateConfig(
              (config) =>
              (config.top_p =
                e ? ModalConfigValidator.top_p(e) : undefined),
            );
          }}
        ></InputRange>
      </ListItem>


      {props.modelConfig?.modelProvider == ModelProvider.Google ? null : (
        <>
          <ListItem
            title={Locale.Settings.Model.PresencePenalty.Title}
            desc={Locale.Settings.Model.PresencePenalty.SubTitle}
            vertical={isMobileScreen}
          >
            <InputRange
              nullable={true}
              value={props.modelConfig.presence_penalty?.toFixed(1)}
              min={-2}
              max={2}
              step={0.1}
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                  (config.presence_penalty =
                    e ? ModalConfigValidator.presence_penalty(e) : undefined),
                );
              }}
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.Model.FrequencyPenalty.Title}
            desc={Locale.Settings.Model.FrequencyPenalty.SubTitle}
            vertical={isMobileScreen}
          >
            <InputRange
              nullable={true}
              value={props.modelConfig.frequency_penalty?.toFixed(1)}
              min={-2}
              max={2}
              step={0.1}
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                  (config.frequency_penalty =
                    e ? ModalConfigValidator.frequency_penalty(e) : undefined),
                );
              }}
            ></InputRange>
          </ListItem>

          {/* <ListItem
            title={Locale.Settings.InjectSystemPrompts.Title}
            desc={Locale.Settings.InjectSystemPrompts.SubTitle}
          >
            <input
              aria-label={Locale.Settings.InjectSystemPrompts.Title}
              type="checkbox"
              checked={props.modelConfig.enableInjectSystemPrompts}
              onChange={(e) =>
                props.updateConfig(
                  (config) =>
                  (config.enableInjectSystemPrompts =
                    e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem> */}

          <ListItem
            title={Locale.Settings.Model.MaxTokens.Title}
            desc={Locale.Settings.Model.MaxTokens.SubTitle}
            vertical={isMobileScreen}
          >
            <InputRange
              min={1024}
              max={512000}
              step={256}
              value={props.modelConfig.max_tokens}
              onChange={(e) =>
                props.updateConfig(
                  (config) =>
                  (config.max_tokens = ModalConfigValidator.max_tokens(
                    e||4000,
                  )),
                )
              }
            />
          </ListItem>

          <ListItem
            title={Locale.Settings.Model.InputTemplate.Title}
            desc={<Markdown fontSize={12} content={Locale.Settings.Model.InputTemplate.SubTitle}></Markdown>}
            vertical={isMobileScreen}
          >
            <Input
              aria-label={Locale.Settings.Model.InputTemplate.Title}
              type="text"
              value={props.modelConfig.template}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.template = e.currentTarget.value),
                )
              }
            ></Input>
          </ListItem>
        </>
      )}
      {/* <ListItem
        title={Locale.Settings.HistoryCount.Title}
        desc={Locale.Settings.HistoryCount.SubTitle}
        vertical={isMobileScreen}
      >
        <InputRange
          aria={Locale.Settings.HistoryCount.Title}
          title={props.modelConfig.historyMessageCount.toString()}
          value={props.modelConfig.historyMessageCount}
          min="0"
          max="100"
          step="1"
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.historyMessageCount = e||10),
            )
          }
        ></InputRange>
      </ListItem> */}

      {/* <ListItem
        title={Locale.Settings.CompressThreshold.Title}
        desc={Locale.Settings.CompressThreshold.SubTitle}
      >
        <input
          aria-label={Locale.Settings.CompressThreshold.Title}
          type="number"
          min={500}
          max={4000}
          value={props.modelConfig.compressMessageLengthThreshold}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
              (config.compressMessageLengthThreshold =
                e.currentTarget.valueAsNumber),
            )
          }
        ></input>
      </ListItem>
      <ListItem title={Locale.Memory.Title} desc={Locale.Memory.Send}>
        <input
          aria-label={Locale.Memory.Title}
          type="checkbox"
          checked={props.modelConfig.sendMemory}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.sendMemory = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem> */}
    </>
  );
}
