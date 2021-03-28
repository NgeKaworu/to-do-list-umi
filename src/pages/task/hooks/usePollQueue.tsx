import { MainTask } from '@/models/task';
import { useEffect, useState, useRef } from 'react';
import { createContainer } from 'unstated-next';

export function usePollQueue(interval: number = 5000) {
  const [mainTaskQueue, setMainTaskQueue] = useState(new Set<string>());
  const [subTaskQueue, setSubTaskQueue] = useState(
    new Map<string, Set<number>>(),
  );
  const timer = useRef();

  useEffect(() => {}, [mainTaskQueue, subTaskQueue]);

  return { setMainTaskQueue, setSubTaskQueue };
}

export default createContainer<ReturnType<typeof usePollQueue>, number>(
  usePollQueue,
);
