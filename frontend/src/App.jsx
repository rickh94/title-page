import React, { useState } from 'react'
import 'milligram/dist/milligram.min.css'

import Form from './Form'
import Frame from './Frame'

const App = () => {
  const [url, setUrl] = useState('')
  return (
    <div className="container" style={{ height: '94vh' }}>
      <div className="row" style={{ height: '8vh' }} data-testid="app-title" id="app-title">
        <h1>Sheet Music Title Page Creator</h1>
      </div>
      <div className="row" style={{ height: '4vh' }} data-testid="app-heading">
        <h4>Enter Piece Information</h4>
      </div>
      <div className="row" style={{ height: '84vh' }}>
        <Form setUrl={setUrl} url={url} />
        <Frame url={url} />
      </div>
    </div>
  )
}

export default App