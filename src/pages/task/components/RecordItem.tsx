import React from 'react';

import { Divider, Popconfirm, Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

import theme from '@/theme';
import { MainTask } from '@/models/task';
import styled from 'styled-components';

export interface RecordItemProps {
  onClick: (id: string) => void;
  onRemoveClick: (id: string) => void;
  onEditClick: (record: Record) => void;
  record: Record;
  selected: boolean;
}

interface RecordCardProps {
  percent: number;
  selected: boolean;
}

const RecordCard = styled.div<RecordCardProps>`
  background-color: #fff;
  margin: 12px;
  padding: 12px;
  padding-top: 20px;
  position: relative;
  /* height: calc(100% - 12px); */
  overflow-wrap: break-word;
  /* 进度条 */
  ::before {
    content: ' ';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: ${({ percent }) => percent}%;
    background-image: linear-gradient(to right, red, lightgreen);
  }
  /* 选中状态 */
  ::after {
    content: ' ';
    position: absolute;
    width: 1px;
    height: 100%;
    left: 0;
    top: 0;
    visibility: ${({ selected }) => (selected ? 'visible' : 'hidden')};
    background-color: ${theme['primary-color']};
  }

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
  selected,
  record,
}: RecordItemProps) => {
  const { _id, source, translation, exp: percent } = record;
  function clickHandler(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    onClick(_id);
  }
  function editClickHandler(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    onEditClick(record);
  }
  function removeClickHandler(e?: React.MouseEvent<HTMLElement, MouseEvent>) {
    e?.stopPropagation();
    onRemoveClick(_id);
  }

  function removeClickButtonHandler(
    e?: React.MouseEvent<HTMLElement, MouseEvent>,
  ) {
    e?.stopPropagation();
  }

  return (
    <RecordCard selected={selected} percent={percent} onClick={clickHandler}>
      <div style={{ height: '66px' }}>{source}</div>
      <Divider />
      <div style={{ height: '66px' }}>{translation}</div>
      <div className="tools-bar">
        <Button
          size="small"
          type="text"
          onClick={editClickHandler}
          icon={<EditOutlined />}
        ></Button>
        <Popconfirm
          title={'操作不可逆，请确认'}
          onConfirm={removeClickHandler}
          onCancel={removeClickButtonHandler}
        >
          <Button
            size="small"
            type="text"
            danger
            onClick={removeClickButtonHandler}
            icon={<DeleteOutlined />}
          ></Button>
        </Popconfirm>
      </div>
    </RecordCard>
  );
};
