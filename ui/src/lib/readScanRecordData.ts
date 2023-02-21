import * as dataUtils from './dataUtils';

const dec = new TextDecoder('utf-8');

const readScanRecordData = (dv: DataView) => {
  const b = dv.getUint8(13);

  return {
    version: dv.getUint8(11),
    type: dv.getUint8(12),
    typeName: dec.decode(
      new Uint8Array(Array.from({ length: 5 }, (_v, i) => dv.getUint8(i + 6))),
    ),
    canBeAdded: dataUtils.getBit(b, 0),
    isCelcius: !dataUtils.getBit(b, 1),
    fanState: dataUtils.getBits(b, 2, 2),
    tmpState: dataUtils.getBits(b, 4, 2),
    humState: dataUtils.getBits(b, 6, 2),
    temp: dataUtils.parseShort(dv, 14) / 100,
    humid: dataUtils.parseShort(dv, 16) / 100,
    // fan:
  };
};

export { readScanRecordData };
