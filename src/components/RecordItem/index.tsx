import React from 'react';

import { Popconfirm, Button, Select } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

import { MainTask } from '@/models/task';
import styles from './index.less';

import DebounceRadio from '../DebounceRadio';
import { LEVEL_OPTIONS } from '@/constants';

export interface RecordItemProps {
  onRemoveClick: (id: string) => void;
  onEditClick: (record: MainTask) => void;
  onChange: (record: Partial<MainTask>) => void;
  record: MainTask;
}

export default ({ onRemoveClick, onEditClick, onChange, record }: RecordItemProps) => {
  let { id, subTask, title, level, done } = record;

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

  function levelChangeHandler(value: any) {
    onChange({ id, level: value });
  }

  function mainTaskDone(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    onChange({ id, done: (e?.target as HTMLInputElement)?.checked });
  }

  function subTaskDone(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    const originKey = (e?.target as HTMLInputElement)?.dataset?.originKey;
    onChange({
      id,
      [`subTask.${originKey}.done`]: (e?.target as HTMLInputElement)?.checked,
    });
  }
  return (
    <div className={styles.card}>
      <DebounceRadio onClick={mainTaskDone} interval={3000} defaultChecked={done}>
        <h1>{title}</h1>
      </DebounceRadio>
      <div style={{ marginLeft: '16px' }}>
        {subTask?.map((t, idx) => (
          <div key={idx}>
            <DebounceRadio
              data-origin-key={idx}
              onClick={subTaskDone}
              interval={3000}
              defaultChecked={t.done}
            >
              {t?.title}
            </DebounceRadio>
          </div>
        ))}
      </div>
      <div className={styles['tools-bar']}>
        <Select
          size="small"
          bordered={false}
          onClick={stopPropagation}
          onChange={levelChangeHandler}
          value={level}
          options={LEVEL_OPTIONS}
        />
        <Button size="small" type="text" onClick={editClickHandler} icon={<EditOutlined />} />
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
          />
        </Popconfirm>
      </div>
    </div>
  );
};
