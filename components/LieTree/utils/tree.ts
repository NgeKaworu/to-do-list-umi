export interface Tree {
  children?: Tree[];
  payload?: any;
  label?: React.ReactNode;
  key?: any;
  genealogy: number[];
  disabled?: boolean;
}

export function setTo(root: Tree, path: number[], value: Tree) {
  if (!path?.length) return;
  let cur = root;
  for (let i = 0; i < path?.length; i++) {
    const p = path[i];
    if (!cur?.children) {
      cur.children = [];
    }
    if (!cur?.children?.[p]) {
      cur.children[p] = {
        genealogy: path?.slice(0, i + 1),
      };
    }
    cur = cur?.children[p];
  }
  Object.keys(value)?.forEach((k) => {
    cur[k] = value[k];
  });
}

export function getIn(root: Tree, path?: number[]) {
  if (!path) return;

  let cur: Tree | undefined = root;

  for (const p of path) {
    cur = cur?.children?.[p];
  }

  return cur;
}

export function getProgeny(root: Tree) {
  let res: Tree[] = [];
  for (const node of root?.children ?? []) {
    res = res.concat(node, getProgeny(node));
  }
  return res;
}

export function isProgeny(parent: Tree) {
  const { genealogy } = parent,
    p = genealogy?.join();
  return (child: Tree) => {
    const c = `${child.genealogy?.join()},`;
    return c.startsWith(p);
  };
}

export function isProgenyGenealogyKey(parent: string) {
  return (child: string) => {
    return child.startsWith(`${parent},`);
  };
}

export function getAble(root: Tree): any {
  return root?.disabled
    ? undefined
    : {
        ...root,
        children: root?.children?.map(getAble),
      };
}
