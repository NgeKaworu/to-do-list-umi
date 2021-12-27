import React, { cloneElement, useEffect, useState } from 'react';
import { Empty, Spin } from 'antd';
import ChildrenRender from '../../../components/ChildrenRender';
import { FlatTree } from '../../LieTree/utils/flatTree';
import { Tree } from '../../LieTree/utils/tree';
import { uniqueRight } from '../../LieTree/utils';
import { curry } from '../../..//decorators/utils';

export interface LieTreeAsyncParams {
  request: (value?: Tree) => Promise<FlatTree[]>;
}

export const LieTreeAsync = curry(
  ({ request }: LieTreeAsyncParams, forwardProps: any, LieTree: React.ReactElement) => {
    const [expand, setExpand] = useState<Tree>();
    const [loading, setLoading] = useState<boolean>(true);
    const [flatTrees, setFlatTrees] = useState<FlatTree[]>([]);
    useEffect(() => {
      onExpand();
    }, []);

    async function onExpand(value?: Tree) {
      setLoading(true);
      setExpand(value);
      const res = (await request(value)) ?? [];
      setFlatTrees((pre) => uniqueRight([...pre, ...res], (tree) => tree?.genealogy?.join()));
      setLoading(false);
    }

    return cloneElement(LieTree, {
      selectProps: {
        ...LieTree?.props?.selectProps,
        allowClear: true,
        maxTagCount: 1,
        maxTagTextLength: 5,
      },
      lieTreeProps: {
        ...LieTree?.props?.lieTreeProps,
        ...forwardProps,
        notFoundContent: loading ? (
          <Spin
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
            tip="loading..."
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ),
        flatTrees,
        loading,
        expand,
        onExpand,
      },
    });
  },
);

export default curry((param: LieTreeAsyncParams, LieTree: React.ReactElement) => (
  <ChildrenRender>{(forwardProps) => LieTreeAsync(param, forwardProps, LieTree)}</ChildrenRender>
));
