import React from 'react';
import PropTypes from 'prop-types';

import './Frame.css';

const Frame = ({ url }) => {
  return (
    <>
    <div className="display-frame-wrapper" data-testid="frame">
      {url && (
        <object
          className="display-frame"
          data={url}
          type="application/pdf"
          data-testid="wrapper-object"
        >
          <embed src={url} type="application/pdf" data-testid="pdf-embed"/>
        </object>
      )}
    </div>
      </>
  );
};

Frame.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Frame;
