import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import useInput from 'react-hanger/array/useInput'
import useArray from 'react-hanger/array/useArray'
import Swal from 'sweetalert2'

const fetchPost = async (endpoint, body) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (response.status >= 200 && response.status < 300) {
    return data
  } else {
    throw new Error(data.detail)
  }
}

export const Form = ({ setUrl, url }) => {
  const [[title], titleActions] = useInput('')
  const [[partName], partNameActions] = useInput('')
  const [[partAdditional], partAdditionalActions] = useInput('')
  const [composers, composersActions] = useArray([])
  const [extraLines, extraLinesActions] = useArray([])
  const [origFile, setFile] = useState(null)
  const [titlePageFileName, setTitlePageFileName] = useState('')

  const clear = () => {
    titleActions.clear()
    partNameActions.clear()
    partAdditionalActions.clear()
    composersActions.clear()
    extraLinesActions.clear()
  }

  const submit = async () => {
    const data = {
      title,
      composers,
      part: partName,
      extra_info: extraLines,
      part_additional: partAdditional,
    }
    try {
      const response = await fetchPost('/generate', data)
      setUrl(response.url)
      setTitlePageFileName(response.filename)
    } catch (e) {
      Swal.fire({
        title: 'Error',
        text: e.toString(),
        type: 'error',
      })
    }
  }

  const combine = async () => {
    const formData = new FormData()
    formData.append('title_page_filename', titlePageFileName)
    formData.append('file', origFile)
    try {
      const response = await fetch('/combine', {
        body: formData,
        method: 'POST',
      })
      const data = await response.json()
      if (response.status >= 200 && response.status < 300) {
        window.open(data.url, '_blank')
      } else {
        Swal.fire({
          title: 'Error',
          text: data.detail,
          type: 'error'
        })
      }
    } catch (e) {
      Swal.fire({
        title: 'Error',
        text: e.toString(),
        type: 'error',
      })
    }
  }

  return (
    <div className="column column-33">
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
      />
      <ListField
        items={extraLines}
        actions={extraLinesActions}
        name="extra-line"
        label="Extra Information Lines"
        placeholder="in C minor"
      />
      <button className="button" onClick={submit} data-testid="submit-button">
        Submit
      </button>
      <button className="button-outline" style={{ marginLeft: '1rem' }} onClick={clear}>
        Clear
      </button>
      <div style={{ paddingTop: '2rem' }} />

      {url && (
        <>
          <p>To add this title page to a file, upload it and click Combine</p>
          <label htmlFor="combine-file">Original File (Optional)</label>
          <input
            type="file"
            name="combine-file"
            id="combine-file"
            onChange={e => setFile(e.target.files[0])}
            data-testid="combine-file"
          />
          <button className="button" onClick={combine} data-testid="combine-button">
            Combine
          </button>
        </>
      )}
    </div>
  )
}

export const ListField = ({ items, actions, name, label, placeholder }) => {
  const [[next], nextActions] = useInput('')
  const appendItem = () => {
    actions.push(next)
    nextActions.clear()
  }

  const submitIfEnter = event => {
    const code = event.keyCode ? event.keyCode : event.which
    if (code === 13) {
      appendItem()
    }
  }

  return (
    <>
      <label htmlFor={`add-${name}`}>{label}</label>
      <div className="row" style={{ padding: '0 1rem' }}>
        <input
          type="text"
          name={`add-${name}`}
          id={`add-${name}`}
          value={next}
          onChange={nextActions.onChange}
          onKeyUp={submitIfEnter}
          placeholder={placeholder}
          data-testid={`${name}-next-input`}
        />
        <button
          className="button button-clear"
          onClick={appendItem}
          data-testid={`${name}-add-button`}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
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
  )
}

ListField.propTypes = {
  items: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
}

Form.propTypes = {
  setUrl: PropTypes.func.isRequired,
  url: PropTypes.string,
}

export default Form
