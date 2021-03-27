import React, { Fragment, useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';

import {
  Empty,
  Input,
  Layout,
  Button,
  Space,
  Form,
  Skeleton,
  Divider,
} from 'antd';

const { Header, Content, Footer } = Layout;

import { RESTful } from '@/http';
import { mainHost } from '@/http/host';

import { MainTask } from '@/models/task';
import moment from 'moment';

import styles from '@/index.less';
import reviewStyles from './index.less';

type ReviewType = 'normal' | 'success' | 'fail';
export default () => {
  const [form] = Form.useForm();
  const [flag, setFlag] = useState<ReviewType>('normal');
  const [curIdx, setCurIdx] = useState<number>(0);
  const queryClient = useQueryClient();

  const { data } = useQuery('review-list', () => {
    return RESTful.get(`${mainHost()}/record/list`, {
      silence: 'success',
      params: {
        inReview: true,
        skip: 0,
        limit: 0,
      },
    });
  });

  const total = data?.total || 0;

  return (
    <Layout style={{ height: '100%' }}>
      <Header className={styles['header']}>header</Header>
      <Content style={{ overflowY: 'auto', height: '100%' }}>body</Content>
      <Footer className={styles['footer']}>footer</Footer>
    </Layout>
  );
};
