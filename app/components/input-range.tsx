import styles from "./input-range.module.scss";
import clsx from "clsx";
import { Checkbox } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import { IconButton } from "./ui-lib";

interface InputRangeProps {
  onChange: (value?: number) => void;
  min: number;
  max: number;
  step: number;
  nullable?: boolean;
  title?: string;
  value?: number;
  className?: string;
}

export function InputRange(props: InputRangeProps) {

  const inputRef = useRef<HTMLInputElement>(null);
  const [disabled, setDisabled] = useState((!props.value && props.nullable) ? true : false);
  const [inputValue, setInputValue] = useState(props.value || 0);

  return (
    <div className={clsx(styles["input-range"], props.className)}>
      {!disabled &&
        <div className={styles["input-range-value"]}>
          {inputValue}
        </div>
      }
      {/* <Slider className={clsx(styles["slider"])} 
      value={Number(value)} 
      min={Number(min)} 
      max={Number(max)} 
      step={Number(step)} 
      onChange={onChange} /> */}

      <IconButton
        icon={<MinusOutlined />}
        disabled={disabled}
        className={styles["input-range-minus"]}
        key="minus"
        onClick={() => {
          const el = inputRef.current;
          if (el) {
            el.stepDown();
            const ev = new Event("input", { bubbles: true });
            el.dispatchEvent(ev);
          }
        }}
      />

      <input
        readOnly={disabled}
        disabled={disabled}
        className={disabled ? styles["input-range-input-disabled"] : styles["input-range-input"]}
        ref={inputRef}
        type="range"
        title={props.title}
        value={inputValue}
        min={props.min}
        max={props.max}
        step={props.step}
        onChange={(e) => {
          setInputValue(e.currentTarget.valueAsNumber);
          props.onChange(e.currentTarget.valueAsNumber);
        }}
      ></input>

      <IconButton
        icon={<PlusOutlined />}
        disabled={disabled}
        className={styles["input-range-plus"]}
        key="plus"
        onClick={() => {
          const el = inputRef.current;
          if (el) {
            el.stepUp();
            const ev = new Event("input", { bubbles: true });
            el.dispatchEvent(ev);
          }
        }}
      />
      {props.nullable &&
        <Checkbox title="是否启用" checked={!disabled} onChange={(e) => {
          setDisabled(!e.target.checked);

          props.onChange(e.target.checked ? inputValue : undefined);
        }} />}
    </div>
  );
}
