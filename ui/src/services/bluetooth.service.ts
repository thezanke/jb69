export class BluetoothService {
  requestScan() {
    return navigator.bluetooth.requestLEScan();
  }
}
