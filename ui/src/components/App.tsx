import styled from 'styled-components';

import './index.css';

const StyleContainer = styled.div`
  padding: 1em;
  position: relative;

  button {
    display: block;
    border-radius: 4px;
    background-color: transparent;
    box-shadow: none;
    border: 1px solid #ccc;
    padding: 0.5em 1.5em;
    color: #555;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
`;

export const App = () => {
  return (
    <StyleContainer>
      <button>Test</button>
    </StyleContainer>
  );
};
