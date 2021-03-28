import React, { createContext, useContext, useState } from 'react';

import { Divider, Popconfirm, Button, Select, Radio, Input } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

import { MainTask } from '@/models/task';
import styled from 'styled-components';
import { levelOptions } from '..';

import { useContainer } from 'unstated-next';
import usePollQueue from '../hooks/usePollQueue';
import DebounceRadio from './DebounceRadio';

export interface RecordItemProps {
  onClick: (id: string) => void;
  onRemoveClick: (id: string) => void;
  onEditClick: (record: MainTask) => void;
  onLevelChange: (record: MainTask) => void;
  record: MainTask;
}

const RecordCard = styled.div`
  background-color: #fff;
  margin: 12px;
  padding: 12px;
  padding-top: 20px;
  position: relative;

  overflow-wrap: break-word;

  :hover::after {
    visibility: visible;
  }

  .tools-bar {
    position: absolute;
    top: 0;
    right: 12px;
  }
`;

export default ({
  onClick,
  onRemoveClick,
  onEditClick,
  record,
}: RecordItemProps) => {
  let { id, subTask, title, createAt, updateAt, level } = record;

  const { setMainTaskQueue, setSubTaskQueue } = useContainer(usePollQueue);

  function editClickHandler(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    onEditClick(record);
  }
  function removeClickHandler(e?: React.MouseEvent<HTMLElement, MouseEvent>) {
    e?.stopPropagation();
    onRemoveClick(id);
  }

  function stopPropagation(e?: React.MouseEvent<Element, MouseEvent>) {
    e?.stopPropagation();
  }

  function levelChangeHandler<T>(value: T) {
    console.log('value', value);
  }

  subTask = [
    { title: '456', done: false, originKey: 0 },
    { title: '789', done: true, originKey: 1 },
    { title: '1111', done: false, originKey: 2 },
  ];

  function mainTaskDone(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    e;
    console.log('mainTask', id, (e?.target as HTMLInputElement)?.checked);
  }

  function subTaskDone(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    const originKey = e?.currentTarget?.dataset?.originKey;
    console.log('originKey', originKey);
  }
  return (
    <RecordCard>
      <DebounceRadio onClick={mainTaskDone} interval={3000}>
        <h1>{title}</h1>
      </DebounceRadio>
      <div style={{ marginLeft: '16px' }}>
        {subTask?.map((t) => {
          return (
            <div key={t?.originKey}>
              <DebounceRadio
                data-origin-key={t?.originKey}
                onClick={subTaskDone}
                interval={3000}
              >
                {t?.title}
              </DebounceRadio>
            </div>
          );
        })}
      </div>
      <div className="tools-bar">
        <Select
          size="small"
          bordered={false}
          onClick={stopPropagation}
          onChange={levelChangeHandler}
          value={level}
          options={levelOptions}
        ></Select>
        <Button
          size="small"
          type="text"
          onClick={editClickHandler}
          icon={<EditOutlined />}
        ></Button>
        <Popconfirm
          title={'操作不可逆，请确认'}
          onConfirm={removeClickHandler}
          onCancel={stopPropagation}
        >
          <Button
            size="small"
            type="text"
            danger
            onClick={stopPropagation}
            icon={<DeleteOutlined />}
          ></Button>
        </Popconfirm>
      </div>
    </RecordCard>
  );
};
