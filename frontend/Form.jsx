import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import axios from 'axios'

const Form = ({ setUrl }) => {
  const setFromEvent = func => event => {
    func(event.target.value)
  }
  const [title, setTitle] = useState('')
  const [partName, setPartName] = useState('')
  const [partAdditional, setPartAdditional] = useState('')
  const [composers, setComposers] = useState([])
  const [extraLines, setExtraLines] = useState([])

  const clear = () => {
    setTitle('')
    setPartName('')
    setPartAdditional('')
    setComposers([])
    setExtraLines([])
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
      const response = await axios.post('/generate', data)
      setUrl(response.data.url)
      // window.location = response.data.url
    } catch (e) {
      console.error(e)
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
        onChange={setFromEvent(setTitle)}
      />
      <label htmlFor="part">Part Name</label>
      <input
        type="text"
        name="part-name"
        id="part-name"
        placeholder="Violin I"
        value={partName}
        onChange={setFromEvent(setPartName)}
      />

      <label htmlFor="part-additional">Additional Part Information</label>
      <input
        type="text"
        name="part-additional"
        id="part-additional"
        placeholder="in Bb"
        value={partAdditional}
        onChange={setFromEvent(setPartAdditional)}
      />

      <ListField
        items={composers}
        setItems={setComposers}
        name="composer"
        label="Composers"
        placeholder="Ludwig van Beethoven"
      />
      <ListField
        items={extraLines}
        setItems={setExtraLines}
        name="extra-line"
        label="Extra Information Lines"
        placeholder="in C minor"
      />
      <button className="button" onClick={submit}>
        Submit
      </button>
      <button className="button-outline" style={{ marginLeft: '1rem' }} onClick={clear}>
        Clear
      </button>
    </div>
  )
}

const ListField = ({ items, setItems, name, label, placeholder }) => {
  const [next, setNext] = useState('')
  const appendItem = () => {
    setItems(oldItems => {
      oldItems.push(next)
      return oldItems
    })
    setNext('')
  }

  const submitIfEnter = event => {
    const code = event.keyCode ? event.keyCode : event.which
    if (code === 13) {
      appendItem()
    }
  }

  const removeIndex = idx => event => {
    setItems(oldItems => {
      oldItems.splice(idx, 1)
      return oldItems.slice()
    })
  }

  return (
    <React.Fragment>
      <label htmlFor={`add-${name}`}>{label}</label>
      <div className="row" style={{ padding: '0 1rem' }}>
        <input
          type="text"
          name={`add-${name}`}
          id={`add-${name}`}
          value={next}
          onChange={e => setNext(e.target.value)}
          onKeyUp={submitIfEnter}
          placeholder={placeholder}
        />
        <button className="button button-clear" onClick={appendItem}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      <ul id={`${name}s`}>
        {items.map((item, idx) => (
          <li key={idx}>
            {item}
            <button className="button button-clear" onClick={removeIndex(idx)}>
              <FontAwesomeIcon icon={faMinus} />
            </button>
          </li>
        ))}
      </ul>
    </React.Fragment>
  )
}

Form.propTypes = {
  setUrl: PropTypes.func.isRequired,
}

export default Form
