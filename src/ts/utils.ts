export const enumerate = <T>(arr: T[]): [T, number][] => {
  return arr.map((v: T, i: number) => [v, i]);
};
