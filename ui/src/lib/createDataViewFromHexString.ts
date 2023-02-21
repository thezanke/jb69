/** Parses a hex string to a data view.
 *  @param hexString test
 */
export const createDataViewFromHexString = (hexString: string) => {
  return new DataView(
    Uint8Array.from(
      hexString
        .replace(/(0x|:|\s|-|,)/g, '')
        .match(/.{1,2}/g)
        ?.map((byte) => parseInt(byte, 16)) ?? [],
    ).buffer,
  );
};
