import React, { useRef, useState } from 'react';
import { Radio, RadioProps } from 'antd';

export default function (
  props: JSX.IntrinsicAttributes &
    RadioProps &
    React.RefAttributes<HTMLInputElement> & { interval?: number },
) {
  const [checked, setChecked] = useState(props?.defaultChecked);
  const timer = useRef<number>();

  function onClick(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    e.persist();
    setChecked((pre) => !pre);

    if (timer.current) {
      window.clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      props?.onClick && props?.onClick(e);
    }, props.interval || 5000);
  }

  return <Radio checked={checked} {...props} onClick={onClick} />;
}
