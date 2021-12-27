import SearchSelect from "../SearchSelect";

import {
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Checkbox,
  Radio,
  Select
} from "antd";

type ReactClass = any;
type ReactProps = any;
/**
 * 通过valueType 注册 组件、defaultProps
 * 格式 key: 组件、defaultProps
 */
const valueTypeRegister: Record<string, [ReactClass, ReactProps]> = {
  text: [Input, { placeholder: "请输入" }],
  textarea: [Input.TextArea, { placeholder: "请输入" }],
  date: [DatePicker, { placeholder: "请输入" }],
  dateTime: [DatePicker, { showTime: true, placeholder: "请输入" }],
  time: [TimePicker, { placeholder: "请输入" }],
  dateTimeRange: [
    DatePicker.RangePicker,
    { showTime: true, placeholder: ["请输入", "请输入"] },
  ],
  dateRange: [DatePicker.RangePicker, { placeholder: ["请输入", "请输入"] }],
  money: [InputNumber, { placeholder: "请输入" }],
  digit: [InputNumber, { placeholder: "请输入" }],
  select: [Select, { placeholder: "请选择" }],
  radio: [Radio, {}],
  radioButton: [Radio.Group, {}],
  checkbox: [Checkbox.Group, {}],
  null: [() => null, { _just_placeholder: true }],
};

export default valueTypeRegister;
