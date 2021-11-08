import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useInfiniteQuery, useQueryClient, useMutation } from 'react-query';

import { Input, Layout, Button, Modal, Form, Radio, Empty, Row, Col, Checkbox, Space } from 'antd';

const { Header, Content, Footer } = Layout;

import { restful as RESTful } from '@/http';

import RecordItem from '@/components/RecordItem';

import { MainTask, Task } from '@/models/task';

import styles from '@/index.less';
import Importer from '@/components/Importer';
import { LEVEL_OPTIONS } from '@/constants';

const limit = 10;
const FormItem = Form.Item;
const InputGroup = Input.Group;

const Flex1 = { flex: 1 };

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

  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ['tasks-list', _search],
    ({ pageParam = 0 }) => {
      const params: { [key: string]: string | number } = Object.fromEntries(
        new URLSearchParams(_search),
      );

      return RESTful.get(`todo-list/v1/task/list`, {
        silence: 'success',
        params: {
          ...params,
          skip: pageParam * limit,
          limit,
          done: true,
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

  const creator = useMutation((data: Task) => RESTful.post(`todo-list/v1/task/create`, data));

  const updater = useMutation((data?: { [key: string]: any }) =>
    RESTful.patch(`todo-list/v1/task/update`, {
      id: curRecrod?.id,
      ...data,
    }),
  );

  const deleter = useMutation((data?: string) => RESTful.delete(`todo-list/v1/task/${data}`));

  function showMore() {
    fetchNextPage();
  }

  async function addTask(value: Task) {
    try {
      await creator.mutateAsync({ ...value, done: false });
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
    inputForm.resetFields();
  }

  async function updateHandler() {
    try {
      const values = await inputForm.validateFields();
      await updater.mutateAsync(values);
      queryClient.invalidateQueries('tasks-list');
      inputForm.resetFields();
      setInputVisable(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeHandler(id: string) {
    try {
      await deleter.mutateAsync(id);
      queryClient.invalidateQueries('tasks-list');
    } catch (e) {
      console.error(e);
    }
  }

  async function itemChangeHandler(values: any) {
    try {
      await updater.mutateAsync(values);
      queryClient.invalidateQueries('tasks-list');
    } catch (e) {
      console.error(e);
    }
  }

  function editHandler(record: MainTask) {
    inputForm.setFieldsValue(record);
    setCurRecord(record);
    setInputVisable(true);
  }

  function multipleAdd(value: string) {
    const pre: Task[] = inputForm.getFieldValue('subTask') || [];
    const list = value.split(/\n/).reduce(
      (acc: Task[], cur: string) =>
        cur !== ''
          ? acc.concat({
              title: cur,
              done: false,
            })
          : acc,
      [],
    );
    inputForm.setFieldsValue({
      subTask: pre?.concat(list),
    });
  }

  return (
    <Layout style={{ height: '100%' }}>
      <Header className={styles['header']}>
        历史记录
        {/* <Button
          type="link"
          size="small"
          onClick={showSortModal}
          style={{ position: 'absolute', right: 0 }}
        >
          排序
        </Button> */}
        <Modal visible={sortVisable} title="排序" onCancel={hideSortModal} onOk={onSortSubmit}>
          <Form onFinish={onSortSubmit} form={sortForm}>
            <FormItem name="sort" label="排序关键字" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio.Button value="reviewAt">复习时间</Radio.Button>
                <Radio.Button value="createAt">添加时间</Radio.Button>
                <Radio.Button value="exp">熟练度</Radio.Button>
              </Radio.Group>
            </FormItem>
            <FormItem name="orderby" label="排序方向" rules={[{ required: true }]}>
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
      <Content style={{ height: '100%', overflowY: 'scroll' }}>
        {pages?.length ? (
          <>
            {pages?.map((record: MainTask) => (
              <RecordItem
                key={record._id}
                record={record}
                onEditClick={editHandler}
                onRemoveClick={removeHandler}
                onChange={itemChangeHandler}
              />
            ))}
            <Button
              type="link"
              loading={isFetching}
              onClick={showMore}
              disabled={!hasNextPage}
              block
            >
              {!hasNextPage ? '没有更多了' : '加载更多'}
            </Button>
          </>
        ) : (
          <Empty className={styles['empty']} />
        )}
      </Content>
      <Footer className={styles['footer']}>
        <Form layout="inline" initialValues={{ level: 0 }} style={Flex1} onFinish={addTask}>
          筛选 undo
          {/* <InputGroup compact style={{ ...Flex1, display: 'flex' }}>
            <FormItem
              name="level"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select placeholder="优先级" options={LEVEL_OPTIONS}></Select>
            </FormItem>
            <FormItem
              name="title"
              rules={[{ required: true, message: '请输入任务名' }]}
              style={Flex1}
            >
              <Input placeholder="添加任务" style={Flex1} />
            </FormItem>
            <FormItem style={{ marginRight: 0 }}>
              <Button type="primary" htmlType="submit" loading={isFetching}>
                新增
              </Button>
            </FormItem>
          </InputGroup> */}
        </Form>
      </Footer>

      <Modal title={'编辑'} visible={inputVisable} onCancel={hideInputModal} onOk={updateHandler}>
        <Form
          form={inputForm}
          onFinish={updateHandler}
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
        >
          <FormItem label="主任务" required style={{ marginBottom: 0 }}>
            <Input.Group>
              <Row gutter={8}>
                <Col span={22}>
                  <FormItem name="title" rules={[{ required: true, message: '任务名不能为空' }]}>
                    <Input />
                  </FormItem>
                </Col>
                <Col span={2} style={{ display: 'flex', justifyContent: 'center' }}>
                  <FormItem name="done" valuePropName="checked">
                    <Checkbox />
                  </FormItem>
                </Col>
              </Row>
            </Input.Group>
          </FormItem>
          <Form.List name="subTask">
            {(fields, { add, remove }) => {
              function onAdd() {
                add();
              }

              return (
                <>
                  <FormItem
                    label={
                      <Space size="large">
                        子任务
                        <a onClick={onAdd}>添加一项</a>
                        <Importer onOk={multipleAdd} tips="输入空格或换行分割子任务">
                          <a>批量添加</a>
                        </Importer>
                      </Space>
                    }
                    required
                  >
                    {fields.map((field) => {
                      function onRemove() {
                        remove(field.name);
                      }
                      return (
                        <FormItem style={{ marginBottom: 0 }} key={field.key}>
                          <Input.Group>
                            <Row gutter={8}>
                              <Col span={20}>
                                <FormItem
                                  name={[field.name, 'title']}
                                  fieldKey={[field.fieldKey, 'title']}
                                  rules={[
                                    {
                                      required: true,
                                      message: '子任务名不能为空',
                                    },
                                  ]}
                                >
                                  <Input />
                                </FormItem>
                              </Col>
                              <Col
                                span={2}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                }}
                              >
                                <FormItem
                                  name={[field.name, 'done']}
                                  fieldKey={[field.fieldKey, 'done']}
                                  valuePropName="checked"
                                >
                                  <Checkbox />
                                </FormItem>
                              </Col>
                              <Col span={2}>
                                <FormItem>
                                  <a onClick={onRemove}>删除</a>
                                </FormItem>
                              </Col>
                            </Row>
                          </Input.Group>
                        </FormItem>
                      );
                    })}
                  </FormItem>
                </>
              );
            }}
          </Form.List>
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
