import { enableMapSet } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { Root } from './components/Root';

enableMapSet();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  React.createElement(Root),
);
