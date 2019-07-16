import React from 'react'
import PropTypes from 'prop-types'

const Frame = ({ url }) => {
  return (
    <div className="column column-67">
      {url && (
        <object style={{width: '100%', height: '100%'}} data={url} type="application/pdf">
          <embed src={url} type="application/pdf" />
        </object>
      )}
    </div>
  )
}

Frame.propTypes = {
  url: PropTypes.string.isRequired,
}

export default Frame
