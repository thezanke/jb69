export enum DataSerializationFormat {
  hex,
  binary,
}

const radixMap = {
  [DataSerializationFormat.hex]: 16,
  [DataSerializationFormat.binary]: 2,
};

const padLengthMap = {
  [DataSerializationFormat.hex]: 2,
  [DataSerializationFormat.binary]: 8,
};

export const serializeBuffer = (
  buffer: ArrayBuffer,
  format = DataSerializationFormat.hex,
) => {
  const radix = radixMap[format];
  const padLength = padLengthMap[format];

  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(radix).padStart(padLength, '0'))
    .join('');
};
