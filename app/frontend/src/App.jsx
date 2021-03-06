import React, { useState } from 'react';
import 'milligram/dist/milligram.min.css';

import './App.css';

import Form from './components/Form/Form.jsx';
import Frame from './components/Frame/Frame.jsx';

const App = () => {
  const [url, setUrl] = useState('');
  return (
    <div className="container app-container">
      <div
        className="row app-title"
        data-testid="app-title"
        id="app-title"
      >
        <h1 className="main-heading">Sheet Music Title Page Creator</h1>
      </div>
      <div className="row app-heading" data-testid="app-heading">
        <h4>Enter Piece Information</h4>
      </div>
      <div className="form-frame-container">
        <Form setUrl={setUrl} url={url} />
        <Frame url={url} />
      </div>
    </div>
  );
};

export default App;
