import Locale from "../../locales";
import { ListItem, Select } from "../../components/ui-lib";
import { useEffect, useState } from "react";
import { Space } from "antd";
import { OpenAPI } from "@/app/openapi";
import { TTTConfig } from "@/app/types";
import { SwapOutlined } from "@ant-design/icons";

export function TTTConfigEditor(props: Readonly<{
  config: TTTConfig;
  updateConfig: (updater: (config: TTTConfig) => void) => void;
}>) {
  const [dictData, setDictData] = useState<any>();
  const onLoadDict = () => {
    OpenAPI.sysLoadDict("language")
      .then((result) => {
        setDictData(result.result);
      });
  };

  useEffect(() => {
    onLoadDict();
  }, []);

  return (

    <ListItem title={Locale.Settings.TTT.FromTo}>
      <Space>
        <Select
          defaultSelectedValue={[props.config.sourceLanguage]}
          items={dictData?.language?.map((v: any, index: number) => {
            return (
              {
                title: v.label,
                value: v.value
              }
            );
          })}
          onSelectValue={(values) => {
            props.updateConfig(
              (config) => (
                config.sourceLanguage = values[0],
                config.sourceLanguageName = dictData?.language?.find((t:any) => values.includes(t.value))?.label
              ))
          }}
        />

        <SwapOutlined />

        <Select
          defaultSelectedValue={[props.config.targetLanguage]}
          items={dictData?.language?.map((v: any, index: number) => {
            return (
              {
                title: v.label,
                value: v.value
              }
            );
          })}
          onSelectValue={(values) => {
            props.updateConfig(
              (config) => (
                config.targetLanguage = values[0],
                config.targetLanguageName = dictData?.language?.find((t:any) => values.includes(t.value))?.label
              ))
          }}
        />
      </Space>
    </ListItem>
  );
}
