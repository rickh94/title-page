import React from 'react';
import PropTypes from 'prop-types';

import './Frame.css';

const Frame = ({ url }) => {
  return (
    <div className="display-frame" data-testid="frame">
      {url && (
        <object
          style={{ width: '100%', height: '100%' }}
          data={url}
          type="application/pdf"
          data-testid="wrapper-object"
        >
          <embed src={url} type="application/pdf" data-testid="pdf-embed"/>
        </object>
      )}
    </div>
  );
};

Frame.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Frame;
