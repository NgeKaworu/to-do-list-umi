import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useHistory } from 'react-router';
import { useInfiniteQuery, useQueryClient, useMutation } from 'react-query';
import { FixedSizeList as List, ListOnItemsRenderedProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import {
  Empty,
  Input,
  Layout,
  Button,
  Menu,
  Modal,
  Form,
  Radio,
  Card,
  Skeleton,
  Select,
} from 'antd';

const { Header, Content, Footer } = Layout;

import { PlusOutlined } from '@ant-design/icons';

import { SelectInfo } from 'rc-menu/lib/interface';

import { RESTful } from '@/http';
import { mainHost } from '@/http/host';

import RecordItem from './components/RecordItem';

import { MainTask } from '@/models/task';

import styles from '@/index.less';

type inputType = '' | '新建' | '编辑';
type OnItemsRendered = (props: ListOnItemsRenderedProps) => any;

const limit = 10;
const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;

const Flex1 = { flex: 1 };

export default () => {
  const [sortForm] = Form.useForm();
  const [inputForm] = Form.useForm();
  const history = useHistory();
  const _location = history.location;
  const _search = _location.search;
  const params = new URLSearchParams(_search);
  const selectedKeys = [params.get('type') || 'all'];

  const [sortVisable, setSortVisable] = useState(false);
  const [inputVisable, setInputVisable] = useState(false);
  const [inputType, setInputType] = useState<inputType>('新建');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentRect, setContentRec] = useState<DOMRect>();

  // 编辑modal使用
  const [curRecrod, setCurRecord] = useState<Record>();

  useLayoutEffect(() => {
    const current = contentRef.current;
    const obj = current?.getBoundingClientRect();
    obj && setContentRec(obj);
  }, [contentRef]);

  useEffect(() => {
    const params = new URLSearchParams(_search);
    sortForm.setFieldsValue(Object.fromEntries(params.entries()));
  }, [_search]);

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery(
    ['records-list', _search],
    ({ pageParam = 0 }) => {
      const params: { [key: string]: string | number } = Object.fromEntries(
        new URLSearchParams(_search),
      );
      return Promise.resolve([]);
      return RESTful.get(`${mainHost()}/record/list`, {
        silence: 'success',
        params: {
          ...params,
          skip: pageParam * limit,
          limit,
        },
      });
    },
    {
      getNextPageParam: (lastPage, pages) => {
        return lastPage?.data?.length === limit ? pages?.length : undefined;
      },
    },
  );

  const datas = data?.pages,
    pages = datas?.reduce((acc, cur) => acc.concat(cur?.data), []),
    total = datas?.[datas?.length - 1]?.total || 0;

  const creator = useMutation(
    (data) => RESTful.post(`${mainHost()}/record/create`, { data }),
    {
      onSuccess() {
        queryClient.invalidateQueries('records-list');
        inputForm.resetFields();
        setInputVisable(false);
      },
    },
  );

  const updater = useMutation(
    (data?: { [key: string]: any }) =>
      RESTful.patch(`${mainHost()}/record/update`, {
        data: { id: curRecrod?._id, ...data },
      }),
    {
      onSuccess() {
        queryClient.invalidateQueries('records-list');
        inputForm.resetFields();
        setInputVisable(false);
      },
    },
  );

  const deleter = useMutation(
    (data?: string) => RESTful.delete(`${mainHost()}/record/remove/${data}`),
    {
      onSuccess() {
        queryClient.invalidateQueries('records-list');
      },
    },
  );

  const reviewer = useMutation(
    (ids: string[]) =>
      RESTful.patch(`${mainHost()}/record/review`, { data: { ids } }),
    {
      onSuccess() {
        queryClient.invalidateQueries('records-list');
        queryClient.invalidateQueries('review-list');
        history.push('/review/');
      },
    },
  );

  const randomReviewer = useMutation(
    (data) => RESTful.patch(`${mainHost()}/record/random-review`, { data }),
    {
      onSuccess() {
        queryClient.invalidateQueries('records-list');
        queryClient.invalidateQueries('review-list');
        history.push('/review/');
      },
    },
  );

  const allReviewer = useMutation(
    (data) => RESTful.get(`${mainHost()}/record/review-all`),
    {
      onSuccess() {
        queryClient.invalidateQueries('records-list');
        queryClient.invalidateQueries('review-list');
        history.push('/review/');
      },
    },
  );

  function reviewHandler() {
    reviewer.mutate(selectedItems);
  }
  function randomReviewHandler() {
    randomReviewer.mutate();
  }

  function reviewAllHandler() {
    allReviewer.mutate();
  }

  function onMenuSelect({ key }: SelectInfo) {
    if (key !== 'all') {
      params.set('type', `${key}`);
    } else {
      params.delete('type');
    }
    history.push({
      pathname: _location.pathname,
      search: params.toString(),
    });
  }

  function showSortModal() {
    setSortVisable(true);
  }

  function hideSortModal() {
    setSortVisable(false);
  }

  function onSortSubmit() {
    sortForm.validateFields().then(({ sort, orderby }) => {
      params.set('sort', sort);
      params.set('orderby', orderby);
      history.push({
        pathname: _location.pathname,
        search: params.toString(),
      });
      setSortVisable(false);
    });
  }

  function onSortCancel() {
    params.delete('sort');
    params.delete('orderby');
    history.push({
      pathname: _location.pathname,
      search: params.toString(),
    });
    sortForm.resetFields();
    setSortVisable(false);
  }

  function showInpurModal(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    setInputType(e.currentTarget.dataset.inputType as inputType);
    setInputVisable(true);
  }

  function hideInputModal() {
    setInputVisable(false);
  }

  function onInputSubmit() {
    inputForm.validateFields().then((values) => {
      switch (inputType) {
        case '新建':
          creator.mutate(values);
          break;
        case '编辑':
          updater.mutate(values);
          break;
        default:
          console.error('invalidate type:', inputType);
      }
    });
  }

  function onItemClick(id: string) {
    setSelectedItems((s) => {
      const checked = s.some((i) => i === id);
      return checked ? s.filter((i) => i !== id) : s.concat(id);
    });
  }

  function onItemRemoveClick(id: string) {
    deleter.mutate(id);
  }

  function onItemEditClick(record: MainTask) {
    inputForm.setFieldsValue(record);
    setCurRecord(record);
    setInputType('编辑');
    setInputVisable(true);
  }

  // react-window-infinite
  // const length = pages?.length || 0;
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  // const itemCount = hasNextPage ? length + 1 : length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isFetching ? () => null : () => fetchNextPage();

  // Every row is loaded except for our loading indicator row.
  // const isItemLoaded = index => !hasNextPage || index < pages.length;
  const isItemLoaded = (index: number) => !hasNextPage || index < pages?.length;

  const getItemKey = (index: number, data: MainTask[]) =>
    data?.[index]?._id || index;

  // Render an item or a loading indicator.
  function renderItem({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) {
    const record = pages[index];
    const selected = selectedItems.some((s) => s === record?._id);

    let content = (
      <Card style={{ margin: '12px' }}>
        <Skeleton />
      </Card>
    );
    if (isItemLoaded(index)) {
      content = (
        <RecordItem
          key={record._id}
          record={record}
          selected={selected}
          onClick={onItemClick}
          onEditClick={onItemEditClick}
          onRemoveClick={onItemRemoveClick}
        />
      );
    }

    return <div style={style}>{content}</div>;
  }

  // Render List
  function renderList({
    onItemsRendered,
    ref,
  }: {
    onItemsRendered: OnItemsRendered;
    ref: React.Ref<any>;
  }) {
    return (
      <List
        style={{ paddingBottom: '12px' }}
        height={contentRect?.height || 0}
        width={'100%'}
        itemCount={total}
        onItemsRendered={onItemsRendered}
        ref={ref}
        itemSize={220}
        itemData={pages}
        itemKey={getItemKey}
      >
        {renderItem}
      </List>
    );
  }

  return (
    <Layout style={{ height: '100%' }}>
      <Header className={styles['header']}>
        所有任务
        <Button
          type="link"
          size="small"
          onClick={showSortModal}
          style={{ position: 'absolute', right: 0 }}
        >
          排序
        </Button>
        <Modal
          visible={sortVisable}
          title="排序"
          onCancel={hideSortModal}
          onOk={onSortSubmit}
        >
          <Form onFinish={onSortSubmit} form={sortForm}>
            <FormItem
              name="sort"
              label="排序关键字"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio.Button value="reviewAt">复习时间</Radio.Button>
                <Radio.Button value="createAt">添加时间</Radio.Button>
                <Radio.Button value="exp">熟练度</Radio.Button>
              </Radio.Group>
            </FormItem>
            <FormItem
              name="orderby"
              label="排序方向"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio.Button value="1">升序</Radio.Button>
                <Radio.Button value="-1">降序</Radio.Button>
              </Radio.Group>
            </FormItem>
            <FormItem>
              <Button style={{ opacity: 0 }} htmlType="submit">
                提交
              </Button>
            </FormItem>
            <FormItem>
              <Button type="dashed" danger onClick={onSortCancel}>
                取消排序
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </Header>
      <Content style={{ height: '100%' }}>
        <div style={{ width: '100%', height: '100%' }} ref={contentRef}>
          {pages?.length ? (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={total}
              loadMoreItems={loadMoreItems}
            >
              {renderList}
            </InfiniteLoader>
          ) : (
            <Empty className={styles['empty']} />
          )}
        </div>
      </Content>
      <Footer className={styles['footer']}>
        <Form layout="inline" initialValues={{ level: 0 }} style={Flex1}>
          <InputGroup compact style={{ ...Flex1, display: 'flex' }}>
            <FormItem
              name="level"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select placeholder="优先级">
                <Option value={0}>
                  <span style={{ color: 'green' }}>低</span>
                </Option>
                <Option value={1}>
                  <span style={{ color: 'blue' }}>中</span>
                </Option>
                <Option value={2}>
                  <span style={{ color: 'red' }}>高</span>
                </Option>
              </Select>
            </FormItem>
            <FormItem
              name="title"
              rules={[{ required: true, message: '请输入任务名' }]}
              style={Flex1}
            >
              <Input placeholder="添加任务" style={Flex1} />
            </FormItem>
            <FormItem style={{ marginRight: 0 }}>
              <Button type="primary" htmlType="submit">
                新增
              </Button>
            </FormItem>
          </InputGroup>
        </Form>
      </Footer>

      <Modal
        title={inputType}
        visible={inputVisable}
        onCancel={hideInputModal}
        onOk={onInputSubmit}
      >
        <Form form={inputForm} onFinish={onInputSubmit}>
          <FormItem name="source" label="原文" rules={[{ required: true }]}>
            <Input.TextArea autoSize allowClear />
          </FormItem>
          <FormItem
            name="translation"
            label="译文"
            rules={[{ required: true }]}
          >
            <Input.TextArea autoSize allowClear />
          </FormItem>
          <FormItem>
            <Button style={{ opacity: 0 }} htmlType="submit">
              提交
            </Button>
          </FormItem>
        </Form>
      </Modal>
    </Layout>
  );
};
