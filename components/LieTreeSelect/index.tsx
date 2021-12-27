import { Select, SelectProps } from 'antd';
import LieTree, { LieTreeProps } from '../LieTree';
import { Tree } from '../LieTree/utils/tree';
import styles from './index.less';

export interface LieTreeSelectProps<VT = unknown> {
  selectProps?: SelectProps<VT>;
  lieTreeProps?: LieTreeProps;
}

export default ({ selectProps, lieTreeProps }: LieTreeSelectProps<any>) => {
  const { listHeight = 256 } = selectProps ?? {},
    { value, onChange } = lieTreeProps ?? {},
    [selectValue, selectOptions] =
      value?.reduce(
        (acc: any, tree: Tree) => {
          const [value, options] = acc,
            { label, genealogy } = tree,
            key = genealogy?.join();

          return [
            [...value, key],
            [...options, { label, value: key }],
          ];
        },
        [[], []],
      ) ?? [];

  function dropdownRender() {
    return (
      <div style={{ height: `${listHeight}px` }} className={[styles.dropdown]?.join(' ')}>
        <LieTree {...lieTreeProps} />
      </div>
    );
  }

  const changeHandler: SelectProps<any>['onChange'] = (selected) => {
    onChange?.(value?.filter((node) => selected?.includes(node?.genealogy?.join())) ?? []);
  };

  return (
    <Select
      {...selectProps}
      mode="multiple"
      value={selectValue}
      options={selectOptions}
      onChange={changeHandler}
      dropdownRender={dropdownRender}
    />
  );
};
