import React from 'react';
import useInput from 'react-hanger/array/useInput';
import Autocomplete from '../Autocomplete/Autocomplete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import './ListField.css';

const ListField = ({
  items,
  actions,
  name,
  label,
  placeholder,
  dirtyActions,
  completionsEndpoint,
}) => {
  const [[next], nextActions] = useInput('');
  const appendItem = () => {
    if (next) {
      actions.push(next);
      nextActions.clear();
      dirtyActions.setFalse();
    }
  };

  const submitIfEnter = event => {
    if (event.key === 'Enter') {
      appendItem();
    }
  };

  return (
    <div className="list-field">
      <label htmlFor={`add-${name}`}>{label}</label>
      {completionsEndpoint ?
        <Autocomplete
          completionsEndpoint={completionsEndpoint}
          value={next}
          valueActions={nextActions}
          onSubmit={appendItem}
          placeholder="Ludwig van Beethoven"
          dirtyActions={dirtyActions}
          name={name}
        />
        :
        <div className="row button-row" style={{ paddingBottom: 0 }}>
          <div className="column column-90" style={{ padding: 0, marginBottom: 0 }}>
            <input
              type="text"
              name={`add-${name}`}
              id={`add-${name}`}
              value={next}
              onChange={e => {
                dirtyActions.setTrue();
                nextActions.onChange(e);
              }}
              onKeyUp={submitIfEnter}
              placeholder={placeholder}
              data-testid={`${name}-next-input`}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="column column-10" style={{ padding: 0 }}>
            <button
              className="button button-clear b-0"
              onClick={appendItem}
              data-testid={`${name}-add-button`}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
      }
      <>
        {items.length > 0 && (
          <ul id={`${name}s`} data-testid={`${name}-list`} className="list-field__list">
            {items.map((item, idx) => (
              <li
                key={idx}
                data-testid={`${name}-item-${idx}`}
                className="list-field__list-item"
              >
                {item}
                <button
                  className="button button-clear"
                  onClick={() => actions.removeIndex(idx)}
                  data-testid={`${name}-item-${idx}-remove`}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              </li>
            ))}
          </ul>
        )
        }
      </>
    </div>
  );
};

ListField.propTypes = {
  items: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  dirtyActions: PropTypes.object.isRequired,
  completionsEndpoint: PropTypes.string,
};

export default ListField;
