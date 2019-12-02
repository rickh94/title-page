import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import './Autocomplete.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function Autocomplete({ completionsEndpoint, value, valueActions, onSubmit, placeholder, dirtyActions, name }) {
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const getSuggestions = async () => {
      try {
        const response = await fetch(completionsEndpoint);
        const suggestions = await response.json();
        setSuggestions(suggestions || []);
      } catch (err) {
        console.error('Could not get suggestions', err);
      }
    };
    // noinspection JSIgnoredPromiseFromCall
    getSuggestions();
  }, []);

  const onChange = useCallback(event => {
    valueActions.onChange(event);
    setFilteredSuggestions(suggestions.filter(
      suggestion => suggestion.toLowerCase().indexOf(event.currentTarget.value.toLowerCase()) > -1,
    ));
    setActiveSuggestion(0);
    setShowSuggestions(true);
    dirtyActions.setTrue();
  }, [valueActions, dirtyActions, suggestions]);

  const onClick = useCallback(event => {
    setActiveSuggestion(0);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    valueActions.setValue(event.currentTarget.textContent);
  }, [valueActions, suggestions]);

  const onKeyDown = useCallback(event => {
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
        prevActiveSuggestion + 1 === filteredSuggestions.length ?
          prevActiveSuggestion : prevActiveSuggestion + 1,
      );
    }
  }, [filteredSuggestions, valueActions, value]);

  let suggestionsListComponent;

  if (showSuggestions && value) {
    if (filteredSuggestions.length) {
      suggestionsListComponent = (
        <ul className="suggestions" data-testid={`${name}-suggestions`}>
          {filteredSuggestions.map((suggestion, index) => {
            return (
              <SuggestionItem
                key={suggestion}
                active={index === activeSuggestion}
                suggestion={suggestion}
                name={name}
                onClick={onClick}
              />
            );
          })}
        </ul>
      );
    } else {
      suggestionsListComponent = (
        <div className="no-suggestions">
          <em data-testid={`${name}-no-suggestions`}>No suggestions</em>
        </div>
      );
    }
  }

  return (
    <>
      <div className="row button-row">
        <div className="column column-90" style={{ padding: 0 }}>
          <input
            id={`add-${name}`}
            type="text"
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={value}
            className="autocomplete-input"
            placeholder={placeholder}
            data-testid={`${name}-next-input`}
          />
        </div>
        <div className="column column-10" style={{ padding: 0 }}>
          <button
            className="button button-clear b-0"
            onClick={onSubmit}
            data-testid={`${name}-add-button`}
          >
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
  name: PropTypes.string.isRequired,
};


export default Autocomplete;

export const SuggestionItem = React.memo(function SuggestionItem({ suggestion, name, onClick, active }) {
  return (
    <li
      className={active ? 'suggestion-active' : ''}
      onClick={onClick}
      data-testid={`${name}-suggestion-item`}
    >
      {suggestion}
    </li>
  );
});

SuggestionItem.propTypes = {
  suggestion: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
};
