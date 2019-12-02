import React from 'react'
import { render, cleanup } from '@testing-library/react'
import Frame from '../src/components/Frame/Frame.jsx'

afterEach(() => {
  cleanup()
})

const dummyPdfUrl =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

describe('Frame', () => {
  it('matches snapshot', () => {
    const { container } = render(<Frame url={dummyPdfUrl} />)
    expect(container).toMatchSnapshot()
  })

  it('renders an object and embed with url from props', () => {
    const { queryByTestId, getByTestId } = render(<Frame url={dummyPdfUrl} />)
    expect(queryByTestId('wrapper-object')).toBeTruthy()
    expect(queryByTestId('pdf-embed')).toBeTruthy()
    expect(getByTestId('wrapper-object').data).toEqual(dummyPdfUrl)
    expect(getByTestId('pdf-embed').src).toEqual(dummyPdfUrl)
  })

  it('does not render without url', () => {
    const { queryByTestId } = render(<Frame url="" />)
    expect(queryByTestId('wrapper-object')).toBeFalsy()
    expect(queryByTestId('pdf-embed')).toBeFalsy()
  })
})
