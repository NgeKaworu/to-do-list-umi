import React, { useState } from 'react';
import { Checkbox, Empty, Input, Space, Spin } from 'antd';
import { AutoSizer, List, ListProps } from 'react-virtualized';
import styles from './index.less';

import { FlatTree } from './utils/flatTree';
import { setTo, getIn, Tree, getProgeny, getAble, isProgenyGenealogyKey } from './utils/tree';
import { uniqueRight } from './utils';

export interface LieTreeProps {
  flatTrees?: FlatTree[];
  onSearch?: (value: string, level: number) => void;

  value?: Tree[];
  onChange?: (trees: Tree[]) => void;

  onExpand?: (tree: Tree) => void;
  expand?: Tree;
  maxExpand?: number;

  filterOption?: (value: string, option: any, level: number) => boolean;

  notFoundContent?: React.ReactNode;
}

export default ({
  flatTrees = [],
  value = [],
  onChange,
  onSearch,
  onExpand,
  expand,
  filterOption,
  notFoundContent,
  maxExpand,
}: LieTreeProps) => {
  const [loading, setLoading] = useState(false);
  const root: Tree = flatTrees?.reduce(
    (acc, cur) => {
      const { genealogy } = cur;
      setTo(acc, genealogy, cur);
      return acc;
    },
    { genealogy: [] },
  );

  const [checkedSet, indeterminateSet]: Array<Set<string>> = value?.reduce(
    (acc: Array<Set<string>>, cur: Tree) => {
      const [checked, indeterminate] = acc,
        { genealogy } = cur,
        curKey = genealogy?.join(),
        parentKey = genealogy?.slice(0, -1)?.join();

      checked.add(curKey);
      indeterminate.add(parentKey);

      return [checked, indeterminate];
    },
    [new Set(), new Set()],
  );

  const showGroup = expand?.genealogy ?? root?.children?.[0]?.genealogy ?? [];

  const [filterGroup, setFilterGroup] = useState<string[]>([]);

  function getRelevantNode(tree: Tree, root: Tree, innerCheckedSet: Set<string> = checkedSet) {
    if (!tree) return [];
    const { genealogy } = tree,
      gk = genealogy?.join() ?? '';
    let parentGenealogy = genealogy?.slice(0, -1),
      parent: Tree | undefined = getIn(root, parentGenealogy),
      bubble2Root: Tree[] = [];

    while (
      parent?.genealogy?.length &&
      !!parent &&
      parent?.children?.every((brother) => {
        const bg = brother?.genealogy!?.join();
        return bg === gk || innerCheckedSet.has(bg);
      })
    ) {
      bubble2Root?.push(parent);
      parent = getIn(root, parent?.genealogy!?.slice(0, -1));
    }

    return ([] as Tree[]).concat(getProgeny(tree), tree, bubble2Root).filter(Boolean);
  }

  function virtualCheck(
    tree: Tree,
    currentValue: Tree[] = value,
    innerCheckedSet: Set<string> = checkedSet,
  ): Promise<Tree[]> {
    return new Promise((res) => {
      requestIdleCallback(() => {
        const currentKey = tree?.genealogy?.join();
        res(
          checkedSet.has(currentKey)
            ? currentValue?.filter((checked) => {
                const checkedKey = checked?.genealogy?.join();
                return (
                  !isProgenyGenealogyKey(checkedKey)(currentKey) &&
                  !isProgenyGenealogyKey(currentKey)(checkedKey) &&
                  checkedKey !== currentKey
                );
              })
            : uniqueRight(
                ([] as Tree[]).concat(
                  currentValue,
                  getRelevantNode(getAble(tree), root, innerCheckedSet),
                ),
                (tree) => tree?.genealogy?.join(),
              ),
        );
      });
    });
  }

  function checkHOF(tree: Tree) {
    return async () => {
      setLoading(true);
      const curValue = await virtualCheck(tree);
      onChange?.(curValue);
      setLoading(false);
    };
  }

  function calcInvert(subTree: Tree[]): Promise<Tree[]> {
    return new Promise((res) => {
      requestIdleCallback(async () => {
        let curValue = value,
          curCheckedSet = checkedSet;
        for await (const s of subTree) {
          curValue = await virtualCheck(s, curValue, curCheckedSet);
          curCheckedSet = curValue?.reduce((acc: Set<string>, cur: Tree) => {
            acc.add(cur?.genealogy!?.join());
            return acc;
          }, new Set());
        }

        res(curValue);
      });
    });
  }

  function checkInvertHOF(subTree: Tree[]) {
    return async () => {
      setLoading(true);
      const curValue = await calcInvert(subTree);
      onChange?.(curValue);
      setLoading(false);
    };
  }

  function calcAll(subTree: Tree[]): Promise<Tree[]> {
    return new Promise((res) => {
      requestIdleCallback(() => {
        let curValue = value,
          curCheckedSet = checkedSet;
        for (const s of subTree) {
          curValue = uniqueRight(
            ([] as Tree[]).concat(curValue, getRelevantNode(getAble(s), root, curCheckedSet)),
            (tree) => tree?.genealogy?.join(),
          );
          curCheckedSet = curValue?.reduce((acc: Set<string>, cur: Tree) => {
            acc.add(cur?.genealogy!?.join());
            return acc;
          }, curCheckedSet);
        }

        res(curValue);
      });
    });
  }

  function checkAllHOF(subTree: Tree[]) {
    return async () => {
      setLoading(true);
      const curValue = await calcAll(subTree);
      onChange?.(curValue);
      setLoading(false);
    };
  }

  function expandHOF(target: Tree) {
    return () => {
      onExpand?.(target);
    };
  }

  function searchHOF(level: number): React.ChangeEventHandler<HTMLInputElement> {
    return (e) => {
      const v = e?.currentTarget?.value;
      onSearch?.(v, level);

      setFilterGroup((fg) => {
        let cp = [...fg];
        cp[level] = v;
        return cp;
      });
    };
  }

  const renderItem: (subTree: Tree[]) => ListProps['rowRenderer'] =
    (subTree) =>
    ({ index, style }) => {
      const current = subTree?.[index];
      const { label, genealogy, disabled } = current,
        gk = genealogy?.join(),
        active = showGroup?.join()?.startsWith(gk),
        isLeaf = !current?.children?.length,
        checked = isLeaf
          ? checkedSet.has(gk)
          : current?.children?.every((child) => checkedSet.has(child?.genealogy?.join())),
        indeterminate = indeterminateSet?.has(gk);

      return (
        <div className={styles['check-wrap']} key={genealogy?.join()} style={style}>
          <Checkbox
            checked={checked}
            indeterminate={!checked && indeterminate}
            disabled={disabled}
            onClick={checkHOF(current)}
          />
          <span
            onClick={expandHOF(current)}
            className={[styles?.label, active && styles?.active]?.join(' ')}
            title={label?.toString()}
          >
            {label}
          </span>
        </div>
      );
    };

  const renderTree = () => {
    let columns: React.ReactNode[] = [];

    for (let level = 0; level <= showGroup?.length; level++) {
      const curKeyword = filterGroup[level] ?? '';
      const subTree = getIn(root, showGroup?.slice(0, level))?.children?.filter(
        (node) => filterOption?.(curKeyword, node, level) ?? true,
      );

      columns.push(
        <Spin spinning={loading} wrapperClassName={styles.spin}>
          <div className={[styles.flex, styles.column].join(' ')} key={level}>
            <Space size="small">
              <a onClick={checkAllHOF(subTree ?? [])}>全选</a>
              <a onClick={checkInvertHOF(subTree ?? [])}>反选</a>
            </Space>
            {filterOption && (
              <Input onChange={searchHOF(level)} size="small" allowClear placeholder="搜索" />
            )}
            <div className={[styles.flex, styles.column].join(' ')} style={{ flex: 1 }}>
              {subTree?.length ? (
                <AutoSizer>
                  {(size) => (
                    <List
                      {...size}
                      rowCount={subTree.length}
                      rowHeight={20}
                      rowRenderer={renderItem(subTree)}
                    />
                  )}
                </AutoSizer>
              ) : (
                notFoundContent ?? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>
        </Spin>,
      );
    }
    return columns?.slice(0, maxExpand);
  };

  return <div className={styles.flex}>{renderTree()}</div>;
};
