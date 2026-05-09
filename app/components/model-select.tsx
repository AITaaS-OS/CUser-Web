import { sys } from "@/app/utils/sys";
import { useModelStore } from "../store";
import { SelectItem, Select, SelectModal } from "./ui-lib";
import { useMemo } from "react";

export function ModelSelectorModal(props: {
  defaultSelectedValue?: string[];
  onSelectValue?: (values: string[]) => void;
  onClose?: () => void;
  multiple?: boolean;
}) {
  const modelStore = useModelStore();

  const modelItems = useMemo(() => {

    const items: SelectItem<string>[] = [];

    modelStore.providers.forEach((p, pi) => {
      const pItem: SelectItem<string> = {
        title: p.name,
        value: p.key,
        disable: true,
        children: [],
        icon: <img className="model-icon" alt={p.name} src={`cuser/modelicon/${p.name}.png`} />
      };

      p.models.forEach((m, mi) => {
        const item = {
          title: m.name,
          value: `${m.name}@${p.name}`
        };
        pItem.children?.push(item);
      });

      items.push(pItem);
    });

    sys.log.info("items>>>", items.length);

    return items;
  }, [modelStore.providers]);

  return (
    <SelectModal items={modelItems} {...props} />
  );
}

export function ModelSelector(props: {
  defaultSelectedValue?: string[];
  onSelectValue?: (values: string[]) => void;
  multiple?: boolean;
}) {
  const modelStore = useModelStore();

  const modelItems = useMemo(() => {

    const items: SelectItem<string>[] = [];

    modelStore.providers.forEach((p, pi) => {
      const pItem: SelectItem<string> = {
        title: p.name,
        value: p.key,
        disable: true,
        children: [],
        icon: <img className="model-icon" alt={p.name} src={`cuser/modelicon/${p.name}.png`} />
      };

      p.models.forEach((m, mi) => {
        const item = {
          title: m.name,
          value: `${m.name}@${p.name}`
        };
        pItem.children?.push(item);
      });

      items.push(pItem);
    });

    sys.log.info("items>>>", items.length);

    return items;
  }, [modelStore.providers]);

  return (
    <Select items={modelItems} {...props} onDisplayText={(values) => {
      return values[0]
    }} />
  );
}
