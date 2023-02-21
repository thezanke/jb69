export const getBit = (b: number, i: number) => {
  return Number(((b >> (7 - i)) & 1) === 0);
};

export const getBits = (b: number, i: number, i2: number) => {
  return (b >> (8 - i - i2)) & (255 >> (8 - i2));
};

export const parseShort = (dv: DataView, i: number) => {
  return ((dv.getUint8(i + 1) & -1) | ((dv.getUint8(i) << 8) & 65280)) & 32767;
};
