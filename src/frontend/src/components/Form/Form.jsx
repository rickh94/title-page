import React, { useCallback, useState, Suspense } from 'react';
import PropTypes from 'prop-types';
import useInput from 'react-hanger/array/useInput';
import useArray from 'react-hanger/array/useArray';
import useBoolean from 'react-hanger/array/useBoolean';
import Swal from 'sweetalert2';
import { useDropzone } from 'react-dropzone';

import './Form.css';
// import FontSelect from '../FontSelect/FontSelect';
import ListField from '../ListField/ListField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const FontSelect = React.lazy(() => import('../FontSelect/FontSelect'));

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
  const [[font], fontActions] = useInput('Cormorant Garamond');
  const [composers, composersActions] = useArray([]);
  const [extraLines, extraLinesActions] = useArray([]);
  const [origFile, setFile] = useState(null);
  const [titlePageFileName, setTitlePageFileName] = useState('');
  const [composerDirty, composerDirtyActions] = useBoolean(false);
  const [extraLinesDirty, extraLinesDirtyActions] = useBoolean(false);
  const [showSelectFont, showSelectFontActions] = useBoolean(false);

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
      font,
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
      <div className="row button-row">
        <button
          className="button-clear px-0"
          title="Show select font"
          onClick={() => showSelectFontActions.toggle()}
          style={{ fontSize: '1.5rem' }}
        >
          Select Font{' '}
          <FontAwesomeIcon
            className="chevron-icon"
            icon={showSelectFont ? faChevronUp : faChevronDown}
          />
        </button>
      </div>
      {showSelectFont &&
      <Suspense fallback={<div>Loading...</div>}>
        <FontSelect value={font} valueActions={fontActions} />
      </Suspense>
      }
      <div className="row button-row mt-1">
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

      </div>
      <div style={{ paddingTop: '2rem' }} />

      {url && (
        <>
          <p>To add this title page to a file, add it below and click Combine</p>
          {origFile && <p>Current File: {origFile.name}</p>}
          <div {...getRootProps()} className="combine-area" data-testid="combine-area">
            <input {...getInputProps()} />
            <p>Drag a file here or click to upload</p>
          </div>
          <button className="button" onClick={combine} data-testid="combine-button">
            Combine
          </button>
        </>
      )}
    </div>
  );
};

Form.propTypes = {
  setUrl: PropTypes.func.isRequired,
  url: PropTypes.string,
};

export default Form;
