export const getBits = (b: number, i: number, i2: number) => {
  return (b >> (8 - i - i2)) & (255 >> (8 - i2));
};
