import React from 'react';
import PropTypes from 'prop-types';

import './FontSelect.css';

function FontSelect({ value, valueActions }) {
  return (
    <>
      <h5>Select Font</h5>
      <div className="font-select">
        <label htmlFor="cormorant-garamond" className="cormorant">
          <input
            type="radio"
            name="font"
            id="cormorant-garamond"
            value="Cormorant Garamond"
            checked={value === 'Cormorant Garamond'}
            onChange={valueActions.onChange}
          />
          {' '}Cormorant Garamond
        </label>
        <label htmlFor="open-sans" className="open-sans">
          <input
            type="radio"
            name="font"
            id="open-sans"
            value="Open Sans"
            checked={value === 'Open Sans'}
            onChange={valueActions.onChange}
          />
          {' '}
          Open Sans
        </label>
        <label htmlFor="montserrat" className="montserrat">
          <input
            type="radio"
            name="font"
            id="montserrat"
            value="Montserrat"
            checked={value === 'Montserrat'}
            onChange={valueActions.onChange}
          />
          {' '}
          Montserrat
        </label>
        <label htmlFor="pt-serif" className="pt-serif">
          <input
            type="radio"
            name="font"
            id="pt-serif"
            value="PT Serif"
            checked={value === 'PT Serif'}
            onChange={valueActions.onChange}
          />
          {' '}
          PT Serif
        </label>
        <label htmlFor="libre-baskerville" className="libre-baskerville">
          <input
            type="radio"
            name="font"
            id="libre-baskerville"
            value="Libre Baskerville"
            checked={value === 'Libre Baskerville'}
            onChange={valueActions.onChange}
          />
          {' '}
          Libre Baskerville
        </label>
        <label htmlFor="amiri" className="amiri">
          <input
            type="radio"
            name="font"
            id="amiri"
            value="Amiri"
            checked={value === 'Amiri'}
            onChange={valueActions.onChange}
          />
          {' '}
          Amiri
        </label>
      </div>
    </>
  );
}

FontSelect.propTypes = {
  value: PropTypes.string.isRequired,
  valueActions: PropTypes.object.isRequired,
};

export default FontSelect;
