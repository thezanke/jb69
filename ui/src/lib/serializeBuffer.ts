export enum DataSerializationFormat {
  int8 = 'int8',
  uint8 = 'uint8',
  hex = 'hex',
  binary = 'binary',
}

const radixMap: Pick<
  Record<DataSerializationFormat, number>,
  DataSerializationFormat.hex | DataSerializationFormat.binary
> = {
  [DataSerializationFormat.hex]: 16,
  [DataSerializationFormat.binary]: 2,
};

const padLengthMap: Pick<
  Record<DataSerializationFormat, number>,
  DataSerializationFormat.hex | DataSerializationFormat.binary
> = {
  [DataSerializationFormat.hex]: 2,
  [DataSerializationFormat.binary]: 8,
};

export const serializeBuffer = (
  buffer: ArrayBuffer,
  format = DataSerializationFormat.hex,
) => {
  if (format === DataSerializationFormat.int8) {
    return new Int8Array(buffer).toString();
  }

  if (format === DataSerializationFormat.uint8) {
    return new Uint8Array(buffer).toString();
  }

  const radix = radixMap[format];
  const padLength = padLengthMap[format];

  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(radix).padStart(padLength, '0'))
    .join('');
};
