import React, { useCallback } from 'react';
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
  const appendItem = useCallback(() => {
    if (next) {
      actions.push(next);
      nextActions.clear();
      dirtyActions.setFalse();
    }
  }, [actions, next, nextActions, dirtyActions]);

  const submitIfEnter = useCallback(event => {
    if (event.key === 'Enter') {
      appendItem();
    }
  }, [appendItem]);

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
        <div className="row button-row pb-0" >
          <div className="column column-90 mb-0" style={{padding: 0}}>
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
              className="mb-0"
            />
          </div>
          <div className="column column-10" style={{ padding: 0 }}>
            <button
              className="button button-clear mb-0 pb-0"
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
              <ListItem
                key={item}
                item={item}
                onClick={() => actions.removeIndex(idx)}
                name={name}
                idx={idx}
              />
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

export const ListItem = React.memo(function ListItem({ item, onClick, name, idx }) {
  return (
    <li
      className="list-field__list-item"
      data-testid={`${name}-item-${idx}`}
    >
      {item}
      <button
        className="button button-clear"
        onClick={onClick}
        data-testid={`${name}-item-${idx}-remove`}
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
    </li>
  );
});

ListItem.propTypes = {
  item: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  idx: PropTypes.number.isRequired,
};
