import React from 'react'
import { render, cleanup } from '@testing-library/react'
import App from '../src/App'
import '@testing-library/jest-dom/extend-expect'

afterEach(cleanup)

describe('App', () => {
  it('matches snapshot', () => {
    const { container } = render(<App />)
    expect(container).toMatchSnapshot()
  })

  it('renders the title and heading', () => {
    const { queryByTestId, getByTestId } = render(<App />)
    expect(queryByTestId('app-title')).toBeTruthy()
    expect(queryByTestId('app-heading')).toBeTruthy()
    expect(getByTestId('app-title')).toHaveTextContent('Sheet Music Title Page Creator')
    expect(getByTestId('app-heading')).toHaveTextContent('Enter Piece Information')
  })

  it('renders the form and the frame', () => {
    const { queryByTestId } = render(<App />)
    expect(queryByTestId('form')).toBeTruthy()
    expect(queryByTestId('frame')).toBeTruthy()
  })
})
