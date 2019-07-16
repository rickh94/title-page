import React from 'react'
import 'milligram/dist/milligram.min.css'

import Form from './Form'

const App = props => (
  <React.Fragment>
    <div className="container">
      <div className="row">
        <h1>Sheet Music Title Page Creator</h1>
      </div>
      <div className="row">
        <h4>Enter Piece Information</h4>
      </div>
      <Form />
    </div>
  </React.Fragment>
)

export default App
