import { chunk } from 'lodash';
import { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useImmer } from 'use-immer';
import {
  NotificationEventHandler,
  useBluetooth,
} from '../services/bluetooth.service';
import { parseScanRecordData } from '../utils/parseScanRecordData';
import {
  DataSerializationFormat,
  serializeBuffer,
} from '../utils/serializeBuffer';

import './index.css';

const serializedDataFormatters: Partial<
  Record<DataSerializationFormat, (str: string) => string>
> = {
  [DataSerializationFormat.hex]: (serialized: string) =>
    chunk(serialized, 2)
      .map((s) => s.join(''))
      .join(' ')
      .toUpperCase(),
};

console.log(parseScanRecordData);

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
      {/* <td>
        <button onClick={() => (window.dataPoint = value)}>Set</button>
      </td> */}
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

interface DataPoint {
  timestamp: Date;
  view: DataView;
}

const DataPointTable: FunctionComponent<{ dataPoints: DataPoint[] }> = ({
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

export const App = () => {
  const bluetooth = useBluetooth();
  const isInitialized = useRef(false);
  const [dataPoints, updateDataPoints] = useImmer<DataPoint[]>([]);

  const notificationHandler = useRef<NotificationEventHandler | null>(null);

  useEffect(() => {
    if (!isInitialized.current) {
      notificationHandler.current = (ev) => {
        const view = ev.target.value;
        if (!view) return;
        const timestamp = new Date();
        updateDataPoints((draft) => {
          draft.unshift({ timestamp, view });
        });
      };

      bluetooth.service.addNotificationHandler(notificationHandler.current);
      isInitialized.current = true;
    }

    return () => {
      if (notificationHandler.current) {
        bluetooth.service.removeNotificationHandler(
          notificationHandler.current,
        );

        notificationHandler.current = null;
      }

      isInitialized.current = false;
    };
  }, [bluetooth, updateDataPoints]);

  const connectToDevice = useCallback(
    async () => await bluetooth.service.connect(),
    [bluetooth],
  );

  return (
    <StyleContainer>
      <div className="actionBar">
        <button onClick={connectToDevice}>Connect</button>
      </div>
      <div className="contents">
        <DataPointTable dataPoints={dataPoints} />
      </div>
    </StyleContainer>
  );
};

const StyleContainer = styled.div`
  padding: 1em;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  button {
    display: block;
    border-radius: 4px;
    background-color: transparent;
    box-shadow: none;
    border: 1px solid #ccc;
    padding: 0.5em 1.5em;
    color: #222;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }

  .actionBar {
    padding: 0 0 1em;
  }

  .contents {
  }

  .contents table {
    width: 100%;
    &,
    & td {
      border: 1px solid;
    }

    pre {
      padding: 0;
      margin: 0;
    }
  }
`;
