export const parseShort = (dv: DataView, i: number) => {
  return ((dv.getUint8(i + 1) & -1) | ((dv.getUint8(i) << 8) & 65280)) & 32767;
};
