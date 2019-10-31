import React, {useState} from 'react';
import PropTypes from 'prop-types';

import './Autocomplete.css';

function Autocomplete({ suggestions }) {
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userInput, setUserInput] = useState('');

  const onChange = event => {
    setUserInput(event.currentTarget.value);
    setFilteredSuggestions(suggestions.filter(
      suggestion => suggestion.toLowerCase().indexOf(event.currentTarget.value.toLowerCase()) > -1,
    ));
    setActiveSuggestion(0);
    setShowSuggestions(true);
  };

  const onClick = event => {
    setActiveSuggestion(0);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setUserInput(event.currentTarget.innerText);
  };

  const onKeyDown = event => {
    if (event.key === 'Enter') {
      setActiveSuggestion(0);
      setShowSuggestions(false);
      setUserInput(filteredSuggestions[activeSuggestion]);
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

  if (showSuggestions && userInput) {
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
          <em>No suggestions, you're on your own!</em>
        </div>
      );
    }
  }

  return (
    <>
      <input type="text" onChange={onChange} onKeyDown={onKeyDown} value={userInput} />
      {suggestionsListComponent}
    </>
  );

}

Autocomplete.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
};


export default Autocomplete;
