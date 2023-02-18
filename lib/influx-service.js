import { InfluxDB, Point } from '@influxdata/influxdb-client';

export class InfluxService {
  #writeApi;

  /**
   * @param {{
   *   url: string,
   *   token: string,
   *   org: string,
   *   bucket: string
   * }}
   */
  constructor({ url, token, org, bucket }) {
    this.#writeApi = new InfluxDB({
      url,
      token,
    }).getWriteApi(org, bucket, 'ns');
  }

  /**
   * @param {*} data
   * @param {string} dataType
   * @param {string} characteristicUuid
   */
  async write(data, dataType, characteristicUuid) {
    const point = new Point(dataType)
      .tag('characteristic-uuid', characteristicUuid)
      .stringField('data', data)
      .timestamp(new Date());

    this.#writeApi.writePoint(point);
    await this.#writeApi.flush();
  }

  async close() {
    try {
      await this.#writeApi.close();
      console.log('FINISHED ... now try ./query.ts');
    } catch (e) {
      console.error(e);
    }
  }
}
