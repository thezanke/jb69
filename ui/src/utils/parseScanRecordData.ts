import { getBit } from './getBit';
import { getBits } from './getBits';
import { parseShort } from './getShort';

const dec = new TextDecoder('ascii');

const parseScanRecordData = (dv: DataView) => {
  const b = dv.getUint8(13);

  return {
    version: dv.getUint8(11),
    type: dv.getUint8(12),
    typeName: dec.decode(
      new Uint8Array(Array.from({ length: 5 }, (_v, i) => dv.getUint8(i + 6))),
    ),
    canBeAdded: getBit(b, 0),
    isDegree: !getBit(b, 1),
    fanState: getBits(b, 2, 2),
    tmpState: getBits(b, 4, 2),
    humState: getBits(b, 6, 2),
    temp: parseShort(dv, 14) / 100,
    humid: parseShort(dv, 16) / 100,
    // fan:
  };
};

window.parseScanRecordData = parseScanRecordData;

export { parseScanRecordData };
