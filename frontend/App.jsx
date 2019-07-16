import React, { useState } from 'react'
import 'milligram/dist/milligram.min.css'

import Form from './Form'
import Frame from './Frame'

const App = props => {
  const [url, setUrl] = useState('')
  return (
    <React.Fragment>
      <div className="container" style={{ height: '94vh' }}>
        <div className="row" style={{ height: '8vh' }}>
          <h1>Sheet Music Title Page Creator</h1>
        </div>
        <div className="row" style={{ height: '4vh' }}>
          <h4>Enter Piece Information</h4>
        </div>
        <div className="row" style={{ height: '84vh' }}>
          <Form setUrl={setUrl} />
          <Frame url={url} />
        </div>
      </div>
    </React.Fragment>
  )
}

export default App
