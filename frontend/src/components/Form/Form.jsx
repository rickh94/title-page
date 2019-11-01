import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import useInput from 'react-hanger/array/useInput';
import useArray from 'react-hanger/array/useArray';
import useBoolean from 'react-hanger/array/useBoolean';
import Swal from 'sweetalert2';
import { useDropzone } from 'react-dropzone';

import './Form.css';
import Autocomplete from '../Autocomplete/Autocomplete.jsx';

const fetchPost = async (endpoint, body) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (response.status >= 200 && response.status < 300) {
    return data;
  } else {
    throw new Error(data.detail);
  }
};

export const Form = ({ setUrl, url }) => {
  const [[title], titleActions] = useInput('');
  const [[partName], partNameActions] = useInput('');
  const [[partAdditional], partAdditionalActions] = useInput('');
  const [composers, composersActions] = useArray([]);
  const [extraLines, extraLinesActions] = useArray([]);
  const [origFile, setFile] = useState(null);
  const [titlePageFileName, setTitlePageFileName] = useState('');
  const [composerDirty, composerDirtyActions] = useBoolean(false);
  const [extraLinesDirty, extraLinesDirtyActions] = useBoolean(false);

  const clear = () => {
    titleActions.clear();
    partNameActions.clear();
    partAdditionalActions.clear();
    composersActions.clear();
    extraLinesActions.clear();
  };

  const submit = async () => {
    if (composerDirty || extraLinesDirty) {
      await Swal.fire({
        title: 'Data Entered',
        text: 'You have entered information in a list (composer or extra info) but not added it to the page. ' +
          'Please click the plus to add it or delete it from the input.',
        type: 'warning',
      });
      return;
    }
    const data = {
      title,
      composers,
      part: partName,
      extra_info: extraLines,
      part_additional: partAdditional,
    };
    try {
      const response = await fetchPost('/generate', data);
      setUrl(response.url);
      setTitlePageFileName(response.filename);
    } catch (e) {
      await Swal.fire({
        title: 'Error',
        text: e.toString(),
        type: 'error',
      });
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const combine = async () => {
    const formData = new FormData();
    formData.append('title_page_filename', titlePageFileName);
    formData.append('file', origFile);
    try {
      const response = await fetch('/combine', {
        body: formData,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data;',
        },
      });
      const data = await response.json();
      if (response.status >= 200 && response.status < 300) {
        window.open(data.url, '_blank');
      } else {
        Swal.fire({
          title: 'Error',
          text: data.detail,
          type: 'error',
        });
      }
    } catch (e) {
      Swal.fire({
        title: 'Error',
        text: e.toString(),
        type: 'error',
      });
    }
  };

  return (
    <div className="input-form" data-testid="form">
      <label htmlFor="title">Title</label>
      <input
        type="text"
        name="title"
        id="title"
        placeholder="Symphony No. 5"
        value={title}
        onChange={titleActions.onChange}
        data-testid="title"
      />
      <label htmlFor="part">Part Name</label>
      <input
        type="text"
        name="part-name"
        id="part-name"
        placeholder="Violin I"
        value={partName}
        onChange={partNameActions.onChange}
        data-testid="part-name"
      />

      <label htmlFor="part-additional">Additional Part Information</label>
      <input
        type="text"
        name="part-additional"
        id="part-additional"
        placeholder="in Bb"
        value={partAdditional}
        onChange={partAdditionalActions.onChange}
        data-testid="part-additional"
      />
      <ListField
        items={composers}
        actions={composersActions}
        name="composer"
        label="Composers"
        placeholder="Ludwig van Beethoven"
        dirtyActions={composerDirtyActions}
        completionsEndpoint="/completions/composers"
      />
      <ListField
        items={extraLines}
        actions={extraLinesActions}
        name="extra-line"
        label="Extra Information Lines"
        placeholder="in C minor"
        dirtyActions={extraLinesDirtyActions}
      />
      <button className="button" onClick={submit} data-testid="submit-button">
        Submit
      </button>
      <button
        className="button-outline"
        style={{ marginLeft: '1rem' }}
        onClick={clear}
        data-testid="clear-button"
      >
        Clear
      </button>
      <div style={{ paddingTop: '2rem' }} />

      {/*{url && (*/}
      <>
        <p>To add this title page to a file, add it below and click Combine</p>
        {origFile && <p>Current File: {origFile.name}
          <button className="button button-clear" title="Remove File" onClick={() => setFile(null)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </p>}
        <div {...getRootProps()} className="combine-area" data-testid="combine-area">
          <input {...getInputProps()} />
          <p>Drag a file here or click to upload</p>
        </div>
        <button className="button" onClick={combine} data-testid="combine-button">
          Combine
        </button>
      </>
      {/*)}*/}
    </div>
  );
};

export const ListField = ({
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
    <>
      <label htmlFor={`add-${name}`}>{label}</label>
      {completionsEndpoint ?
        <Autocomplete
          id={`add-${name}`}
          completionsEndpoint={completionsEndpoint}
          value={next}
          valueActions={nextActions}
          onSubmit={appendItem}
          placeholder="Ludwig van Beethoven"
          dirtyActions={dirtyActions}
        />
        :
        <div className="row button-row">
          <div className="column column-90" style={{ padding: 0 }}>
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
            />
          </div>
          <div className="column column-10" style={{ padding: 0 }}>
            <button
              className="button button-clear"
              onClick={appendItem}
              data-testid={`${name}-add-button`}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
      }
      <ul id={`${name}s`} data-testid={`${name}-list`}>
        {items.map((item, idx) => (
          <li key={idx} data-testid={`${name}-item-${idx}`}>
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
    </>
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

Form.propTypes = {
  setUrl: PropTypes.func.isRequired,
  url: PropTypes.string,
};

export default Form;
