import * as dotenv from 'dotenv';
dotenv.config();

class ConfigService {
  get influxDb() {
    return {
      url: process.env.INFLUXDB_URL,
      token: process.env.INFLUXDB_TOKEN,
      org: process.env.INFLUXDB_ORG,
      bucket: process.env.INFLUXDB_BUCKET,
    };
  }
}

export const configService = new ConfigService();
