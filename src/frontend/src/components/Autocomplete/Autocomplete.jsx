import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import './Autocomplete.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function Autocomplete({ completionsEndpoint, value, valueActions, onSubmit, placeholder, dirtyActions }) {
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const getSuggestions = async () => {
      try {
        const response = await fetch(completionsEndpoint);
        setSuggestions(await response.json() || []);
      } catch (err) {
        console.error('Could not get suggestions', err);
      }
    };
    // noinspection JSIgnoredPromiseFromCall
    getSuggestions();
  }, []);

  const onChange = event => {
    valueActions.onChange(event);
    setFilteredSuggestions(suggestions.filter(
      suggestion => suggestion.toLowerCase().indexOf(event.currentTarget.value.toLowerCase()) > -1,
    ));
    setActiveSuggestion(0);
    setShowSuggestions(true);
    dirtyActions.setTrue();
  };

  const onClick = event => {
    setActiveSuggestion(0);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    valueActions.setValue(event.currentTarget.innerText);
  };

  const onKeyDown = event => {
    if (!value) {
      return;
    }
    if (!filteredSuggestions.length) {
      if (event.key === 'Enter') {
        onSubmit();
      }
      return;
    }
    if (event.key === 'Enter') {
      setActiveSuggestion(0);
      setShowSuggestions(false);
      valueActions.setValue(filteredSuggestions[activeSuggestion]);
      setFilteredSuggestions([]);
    } else if (event.key === 'ArrowUp') {
      setActiveSuggestion(prevActiveSuggestion =>
        prevActiveSuggestion === 0 ? prevActiveSuggestion : prevActiveSuggestion - 1,
      );
    } else if (event.key === 'ArrowDown') {
      setActiveSuggestion(prevActiveSuggestion =>
        prevActiveSuggestion - 1 === filteredSuggestions.length ?
          prevActiveSuggestion : prevActiveSuggestion + 1,
      );
    }
  };

  let suggestionsListComponent;

  if (showSuggestions && value) {
    if (filteredSuggestions.length) {
      suggestionsListComponent = (
        <ul className="suggestions">
          {filteredSuggestions.map((suggestion, index) => {
            let className;
            if (index === activeSuggestion) {
              className = 'suggestion-active';
            }

            return (
              <li
                className={className}
                key={suggestion}
                onClick={onClick}
              >
                {suggestion}
              </li>
            );
          })}
        </ul>
      );
    } else {
      suggestionsListComponent = (
        <div className="no-suggestions">
          <em>No suggestions</em>
        </div>
      );
    }
  }

  return (
    <>
      <div className="row button-row">
        <div className="column column-90" style={{ padding: 0 }}>
          <input
            type="text"
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={value}
            className="autocomplete-input"
            placeholder={placeholder}
          />
        </div>
        <div className="column column-10" style={{ padding: 0 }}>
          <button className="button button-clear b-0" onClick={onSubmit}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>
      <div className="row">
        <div className="column column-90">
          {suggestionsListComponent}
        </div>
      </div>
    </>
  );

}

Autocomplete.propTypes = {
  completionsEndpoint: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  valueActions: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  dirtyActions: PropTypes.object.isRequired,
};


export default Autocomplete;
