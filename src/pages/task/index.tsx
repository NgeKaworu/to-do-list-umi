import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useInfiniteQuery, useQueryClient, useMutation } from 'react-query';

import { Input, Layout, Button, Modal, Form, Radio, Select } from 'antd';

const { Header, Content, Footer } = Layout;

import { RESTful } from '@/http';
import { mainHost } from '@/http/host';

import RecordItem from './components/RecordItem';

import { MainTask, Task } from '@/models/task';

import styles from '@/index.less';

const limit = 10;
const FormItem = Form.Item;
const InputGroup = Input.Group;

const Flex1 = { flex: 1 };

export const levelOptions = [
  { value: 0, label: <span style={{ color: 'green' }}>低</span> },
  { value: 1, label: <span style={{ color: 'blue' }}>中</span> },
  { value: 2, label: <span style={{ color: 'red' }}>高</span> },
];

export default () => {
  const [sortForm] = Form.useForm();
  const [inputForm] = Form.useForm();
  const history = useHistory();
  const _location = history.location;
  const _search = _location.search;
  const params = new URLSearchParams(_search);

  const [sortVisable, setSortVisable] = useState(false);
  const [inputVisable, setInputVisable] = useState(false);

  // 编辑modal使用
  const [curRecrod, setCurRecord] = useState<MainTask>();

  useEffect(() => {
    const params = new URLSearchParams(_search);
    sortForm.setFieldsValue(Object.fromEntries(params.entries()));
  }, [_search]);

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery(
    ['tasks-list', _search],
    ({ pageParam = 0 }) => {
      const params: { [key: string]: string | number } = Object.fromEntries(
        new URLSearchParams(_search),
      );

      return RESTful.get(`${mainHost()}/v1/task/list`, {
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

  const creator = useMutation((data: Task) =>
    RESTful.post(`${mainHost()}/v1/task/create`, { data }),
  );

  const updater = useMutation((data?: { [key: string]: any }) =>
    RESTful.patch(`${mainHost()}/v1/record/update`, {
      data: { id: curRecrod?._id, ...data },
    }),
  );

  const deleter = useMutation((data?: string) =>
    RESTful.delete(`${mainHost()}/record/remove/${data}`),
  );

  async function addTask(value: Task) {
    try {
      await creator.mutateAsync(value);
      queryClient.invalidateQueries('tasks-list');
      inputForm.resetFields();
      setInputVisable(false);
    } catch (e) {
      console.error(e);
    }
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

  function hideInputModal() {
    setInputVisable(false);
  }

  async function updateHandler() {
    try {
      const values = await inputForm.validateFields();
      await updater.mutateAsync(values);
      queryClient.invalidateQueries('records-list');
      inputForm.resetFields();
      setInputVisable(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeHandler(id: string) {
    try {
      deleter.mutate(id);
      queryClient.invalidateQueries('records-list');
    } catch (e) {
      console.error(e);
    }
  }

  async function ItemChangeHandler(values: any) {
    try {
      await updater.mutateAsync(values);
      queryClient.invalidateQueries('records-list');
    } catch (e) {
      console.error(e);
    }
  }

  function editHandler(record: MainTask) {
    inputForm.setFieldsValue(record);
    setCurRecord(record);
    setInputVisable(true);
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
        {pages?.map((record: MainTask) => (
          <RecordItem
            key={record._id}
            record={record}
            onEditClick={editHandler}
            onRemoveClick={removeHandler}
            onChange={ItemChangeHandler}
          />
        ))}
      </Content>
      <Footer className={styles['footer']}>
        <Form
          layout="inline"
          initialValues={{ level: 0 }}
          style={Flex1}
          onFinish={addTask}
        >
          <InputGroup compact style={{ ...Flex1, display: 'flex' }}>
            <FormItem
              name="level"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select placeholder="优先级" options={levelOptions}></Select>
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
        title={'编辑'}
        visible={inputVisable}
        onCancel={hideInputModal}
        onOk={updateHandler}
      >
        <Form form={inputForm} onFinish={updateHandler}>
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
