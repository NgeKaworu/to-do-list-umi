import { getDenseArr } from '.';

export interface FlatTree {
  label: React.ReactNode;
  key: any;
  genealogy: number[];
  disabled?: boolean;
  payload?: any;
}

export function isChecked(source: FlatTree[], target: FlatTree) {
  return source?.some((v) => v?.genealogy?.join() === target?.genealogy?.join());
}

export function progenyHasChecked(source: FlatTree[], selected: FlatTree[], target: FlatTree) {
  const brother = getBrother(source, target),
    selectedBrother = getBrother(selected, target);
  return isSameFlatTree(brother, selectedBrother);
}

export function isParentNeedPick(source: FlatTree[], selected: FlatTree[], target: FlatTree) {
  const brother = getBrother(source, target),
    selectedBrother = getBrother(selected, target);
  return isSameFlatTree(brother, selectedBrother);
}

export function isSameFlatTree(source: FlatTree[], target: FlatTree[]) {
  if (source?.length !== target?.length) return false;
  let map = {};
  for (let i = 0; i < source?.length; i++) {
    const s = source[i],
      t = target[i],
      sg = s.genealogy?.join(),
      tg = t.genealogy?.join();
    map[sg] = (map[sg] ?? 0) + 1;
    map[tg] = (map[tg] ?? 0) - 1;
  }

  return Object.values(map)?.every((v) => v === 0);
}

export function getParent(source: FlatTree[], target: FlatTree) {
  return source.find(isParent(target));
}

export function isParent(target: FlatTree) {
  const { genealogy } = target,
    pg = genealogy?.slice(0, -1)?.join();

  return (source: FlatTree) => {
    const sg = source?.genealogy?.join();
    return sg === pg;
  };
}

export function getBrother(source: FlatTree[], target: FlatTree) {
  return source.filter(isBrother(target));
}

export function isBrother(target: FlatTree) {
  const { genealogy } = target,
    pg = genealogy?.slice(0, -1)?.join(),
    tg = genealogy?.join();

  return (source: FlatTree) => {
    const sg = source?.genealogy?.join();
    return tg !== sg && tg.length === sg.length && sg.startsWith(pg);
  };
}

export function getProgeny(source: FlatTree[], target: FlatTree) {
  return source.filter(isProgeny(target));
}

export function isProgeny(target: FlatTree) {
  const tg = target?.genealogy?.join();
  return (source: FlatTree) => {
    const sg = source?.genealogy?.join();
    return tg !== sg && sg.startsWith(tg);
  };
}

export function getAble(source: FlatTree[]) {
  return source.filter(isAble);
}

export function isAble(source: FlatTree) {
  return !source?.disabled;
}

export function randomFlatTreeGen(depth = 3, breadth = 3, genealogy: any[] = []): FlatTree[] {
  return depth > 0
    ? getDenseArr(breadth)?.reduce((acc, _, b) => {
        const ng = genealogy?.concat(b);
        return acc.concat(
          {
            label: ng?.join(),
            value: ng?.join(),
            genealogy: ng,
            disabled: (b + depth) % 2 === 0,
          },
          randomFlatTreeGen(depth - 1, breadth, ng),
        );
      }, [])
    : [];
}
