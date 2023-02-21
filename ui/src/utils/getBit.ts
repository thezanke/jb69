export const getBit = (b: number, i: number) => {
  return ((b >> (7 - i)) & 1) === 0;
};
