import { ignoreCaseIncludes } from '@/js-sdk/struct/string/util';
import type React from 'react';
import { cloneElement } from 'react';
/**
 * 本场搜索切片
 */
export default (Select: React.ReactElement) => {
  return cloneElement(Select, {
    showSearch: true,
    filterOption: filter,
  });
};

export const filter = <Opt extends { label?: any; value?: any }>(input: string, option: Opt) =>
  ignoreCaseIncludes(option?.value, input) || ignoreCaseIncludes(option?.label, input);
