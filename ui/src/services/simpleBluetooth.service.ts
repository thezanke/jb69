import { MfrData, readMfrData } from '../lib/readMfrData';

const { bluetooth } = navigator;

type Uuid = string;
type CompanyId = number;

interface SimpleBluetoothOptions {
  services: Uuid[];
  manufacturer: CompanyId;
}

interface SbsEventMap {
  data: CustomEvent<MfrData>;
}

interface SimpleBluetoothEventTarget extends EventTarget {
  addEventListener<K extends keyof SbsEventMap>(
    type: K,
    listener: (ev: SbsEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
}

type TypedEventTarget = { new (): SimpleBluetoothEventTarget };

class SimpleBluetoothService extends (EventTarget as TypedEventTarget) {
  device: BluetoothDevice | null = null;

  handleAdvertisement = (ev: BluetoothAdvertisingEvent) => {
    const mfrDataSet = ev.manufacturerData;

    console.log(mfrDataSet);

    if (mfrDataSet.size > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [_i, mfrData] of mfrDataSet) {
        const decoded = readMfrData(mfrData);
        this.dispatchEvent(new CustomEvent('data', { detail: decoded }));
      }
    }
  };

  async connect(opts: SimpleBluetoothOptions) {
    const device = await bluetooth.requestDevice({
      filters: [
        { manufacturerData: [{ companyIdentifier: opts.manufacturer }] },
      ],
      optionalServices: opts.services,
      optionalManufacturerData: [opts.manufacturer],
    });
    device.addEventListener('advertisementreceived', this.handleAdvertisement);
    await device.watchAdvertisements();
    this.device = device;
  }
}

export const simpleBluetoothService = new SimpleBluetoothService();

export const useSimpleBluetoothService = () => {
  return simpleBluetoothService;
};
