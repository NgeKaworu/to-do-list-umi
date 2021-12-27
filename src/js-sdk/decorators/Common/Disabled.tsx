import type { ReactElement } from "react";
import { cloneElement } from "react";
/**
 * disabled 切片
 */
export default <P extends any = any>(disabled: boolean) =>
  (Element: ReactElement<P & { disabled: boolean }>) => {
    if (disabled) {
      return cloneElement(Element, { disabled, onClick: undefined });
    }
    return Element;
  };
