export const getBit = (b: number, i: number) => {
  return Number(((b >> (7 - i)) & 1) === 0);
};

export const getBits = (b: number, i: number, i2: number) => {
  return (b >> (8 - i - i2)) & (255 >> (8 - i2));
};

export const parseShort = (dv: DataView, i: number) => {
  return ((dv.getInt8(i + 1) & -1) | ((dv.getInt8(i) << 8) & 65280)) & 32767;
};

export const handleRangeError = <T, U = undefined>(
  fn: () => T,
  fallbackValue?: U,
) => {
  try {
    const value = fn();
    return value;
  } catch (e) {
    if (e instanceof RangeError) return fallbackValue;
    throw e;
  }
};

export const toUint8 = (input: number) => new Uint8Array([input])[0];
