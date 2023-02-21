import { chunk } from 'lodash';
import { FunctionComponent } from 'react';
import {
  DataSerializationFormat,
  serializeBuffer,
} from '../lib/serializeBuffer';

const serializedDataFormatters: Partial<
  Record<DataSerializationFormat, (str: string) => string>
> = {
  [DataSerializationFormat.hex]: (serialized: string) =>
    chunk(serialized, 2)
      .map((s) => s.join(''))
      .join(' ')
      .toUpperCase(),
};

const SerializedData = ({
  value,
  format,
}: {
  value: DataView;
  format: DataSerializationFormat;
}) => {
  if (!value) return null;

  let serialized = serializeBuffer(value.buffer, format);

  const formatter = serializedDataFormatters[format];
  if (formatter) serialized = formatter(serialized);

  return <pre>{serialized}</pre>;
};

const DataPointRow: FunctionComponent<{ value: DataPoint }> = ({ value }) => {
  return (
    <tr>
      <td>{value.timestamp.toLocaleTimeString()}</td>
      <td>
        <SerializedData
          value={value.view}
          format={DataSerializationFormat.int8}
        />
        <SerializedData
          value={value.view}
          format={DataSerializationFormat.uint8}
        />
        <SerializedData
          value={value.view}
          format={DataSerializationFormat.hex}
        />
        <SerializedData
          value={value.view}
          format={DataSerializationFormat.binary}
        />
      </td>
    </tr>
  );
};

export interface DataPoint {
  timestamp: Date;
  view: DataView;
}

export const DataTable: FunctionComponent<{ dataPoints: DataPoint[] }> = ({
  dataPoints,
}) => {
  return (
    <table className="data-point-table">
      <thead>
        <tr>
          <td colSpan={2}>Data Points</td>
        </tr>
      </thead>
      <tbody>
        {dataPoints.map((point, i) => (
          <DataPointRow key={i} value={point} />
        ))}
      </tbody>
    </table>
  );
};
