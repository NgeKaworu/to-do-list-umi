export function getRandomNum(max: number) {
  return ~~(Math.random() * max);
}

export function getDenseArr(length: number) {
  return Array(length).fill(Object.create(null));
}

export function unique<T>(arr: T[], getKey: (record: T) => any) {
  let set = new Set(),
    res = [];
  for (const record of arr) {
    const key = getKey(record);
    if (set.has(key)) {
      continue;
    }
    set.add(key);
    res.push(record);
  }

  return res;
}

export function uniqueRight<T>(arr: T[], getKey: (record: T) => any) {
  let set = new Set(),
    res = [],
    l = arr?.length;

  while (l--) {
    const record = arr[l],
      key = getKey(record);

    if (set.has(key)) {
      continue;
    }
    set.add(key);
    res.push(record);
  }

  return res;
}
