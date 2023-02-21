import * as byteUtils from './byteUtils';

const dec = new TextDecoder('ascii');

const readScanRecordData = (dv: DataView) => {
  const b = dv.getUint8(13);

  return {
    version: dv.getUint8(11),
    type: dv.getUint8(12),
    typeName: dec.decode(
      new Uint8Array(Array.from({ length: 5 }, (_v, i) => dv.getUint8(i + 6))),
    ),
    canBeAdded: byteUtils.getBit(b, 0),
    isDegree: !byteUtils.getBit(b, 1),
    fanState: byteUtils.getBits(b, 2, 2),
    tmpState: byteUtils.getBits(b, 4, 2),
    humState: byteUtils.getBits(b, 6, 2),
    temp: byteUtils.parseShort(dv, 14) / 100,
    humid: byteUtils.parseShort(dv, 16) / 100,
    // fan:
  };
};

export { readScanRecordData };
