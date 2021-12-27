export type StringLike = { toString?: (...args: any[]) => string };
export const ignoreCase = (str: StringLike) => str?.toString?.()?.toLocaleLowerCase() ?? '';

export const ignoreCaseIncludes = (origin: StringLike, matcher: StringLike) =>
  ignoreCase(origin).includes(ignoreCase(matcher));
