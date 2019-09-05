import React from 'react'
import { render, fireEvent, cleanup, act } from '@testing-library/react'
import { Form, ListField } from '../Form'
import fetchMock from 'fetch-mock'
import Swal from 'sweetalert2'

afterEach(() => {
  cleanup()
  fetchMock.restore()
})

describe('Form', () => {
  it('matches snapshot', () => {
    const { container } = render(<Form url="" setUrl={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  it('submits form data', async done => {
    const setUrl = jest.fn()
    fetchMock.postOnce('/generate', {
      status: 200,
      body: {
        url: 'http://test.test',
        filename: 'test.pdf',
      },
    })
    const { getByTestId } = render(<Form url="" setUrl={setUrl} />)
    fireEvent.change(getByTestId('title'), { target: { value: 'Test Title' } })
    fireEvent.change(getByTestId('part-name'), { target: { value: 'Test Part Name' } })
    fireEvent.change(getByTestId('part-additional'), {
      target: { value: 'Additional Part Info' },
    })
    fireEvent.click(getByTestId('submit-button'))

    expect(fetchMock.lastOptions().body).toEqual(
      JSON.stringify({
        title: 'Test Title',
        composers: [],
        part: 'Test Part Name',
        extra_info: [],
        part_additional: 'Additional Part Info',
      })
    )
    await act(async () => await fetchMock.flush(true))
    expect(setUrl).toHaveBeenCalledWith('http://test.test')
    done()
  })

  it('alerts on submit error', async done => {
    const setUrl = jest.fn()
    const spy = jest.spyOn(Swal, 'fire')
    fetchMock.postOnce('/generate', {
      throws: new Error('Network Error'),
    })
    const { getByTestId } = render(<Form url="" setUrl={setUrl} />)
    fireEvent.change(getByTestId('title'), { target: { value: 'Test Title' } })
    fireEvent.change(getByTestId('part-name'), { target: { value: 'Test Part Name' } })
    fireEvent.change(getByTestId('part-additional'), {
      target: { value: 'Additional Part Info' },
    })
    fireEvent.click(getByTestId('submit-button'))

    expect(fetchMock.lastOptions().body).toEqual(
      JSON.stringify({
        title: 'Test Title',
        composers: [],
        part: 'Test Part Name',
        extra_info: [],
        part_additional: 'Additional Part Info',
      })
    )
    await act(async () => await fetchMock.flush(true))
    expect(spy).toHaveBeenCalledWith({
      title: 'Error',
      text: 'Error: Network Error',
      type: 'error',
    })
    done()
  })

  it('alerts on submit error response', async done => {
    const setUrl = jest.fn()
    const spy = jest.spyOn(Swal, 'fire')
    fetchMock.postOnce('/generate', {
      status: 400,
      body: {
        detail: 'Wrong Data',
      },
    })
    const { getByTestId } = render(<Form url="" setUrl={setUrl} />)
    fireEvent.change(getByTestId('title'), { target: { value: 'Test Title' } })
    fireEvent.change(getByTestId('part-name'), { target: { value: 'Test Part Name' } })
    fireEvent.change(getByTestId('part-additional'), {
      target: { value: 'Additional Part Info' },
    })
    fireEvent.click(getByTestId('submit-button'))

    expect(fetchMock.lastOptions().body).toEqual(
      JSON.stringify({
        title: 'Test Title',
        composers: [],
        part: 'Test Part Name',
        extra_info: [],
        part_additional: 'Additional Part Info',
      })
    )
    await act(async () => await fetchMock.flush(true))
    expect(spy).toHaveBeenCalledWith({
      title: 'Error',
      text: 'Error: Wrong Data',
      type: 'error',
    })
    done()
  })

  it('renders a file upload if a title page has already been generated', () => {
    const { queryByTestId } = render(<Form url="http://test.test" setUrl={jest.fn()} />)
    expect(queryByTestId('combine-file')).toBeTruthy()
    expect(queryByTestId('combine-button')).toBeTruthy()
  })

  it('calls combine correctly', async done => {
    fetchMock.postOnce('/generate', {
      status: 200,
      body: {
        url: 'http://test.test',
        filename: 'title.pdf',
      },
    })
    fetchMock.postOnce('/combine', {
      status: 200,
      body: {
        url: 'http://test.test2',
        filename: 'test.pdf',
      },
    })
    window.open = jest.fn()
    const setUrl = jest.fn()
    const { getByTestId } = render(<Form url="http://test.test" setUrl={setUrl} />)
    fireEvent.change(getByTestId('title'), { target: { value: 'Test Title' } })
    fireEvent.change(getByTestId('part-name'), { target: { value: 'Test Part Name' } })
    fireEvent.change(getByTestId('part-additional'), {
      target: { value: 'Additional Part Info' },
    })
    fireEvent.click(getByTestId('submit-button'))

    expect(fetchMock.lastOptions().body).toEqual(
      JSON.stringify({
        title: 'Test Title',
        composers: [],
        part: 'Test Part Name',
        extra_info: [],
        part_additional: 'Additional Part Info',
      })
    )
    await act(async () => await fetchMock.flush(true))

    const mockFile = new File(['one two three'], 'test-file.pdf', {
      type: 'application/pdf',
    })
    mockFile.filename = 'test-file.pdf'
    await fireEvent.change(getByTestId('combine-file'), {
      target: {
        files: [mockFile],
      },
    })
    await fireEvent.click(getByTestId('combine-button'))

    await act(async () => await fetchMock.flush(true))
    expect(fetchMock.lastOptions().body.get('file').filename).toEqual('test-file.pdf')
    expect(fetchMock.lastOptions().body.get('title_page_filename')).toEqual('title.pdf')
    expect(window.open).toHaveBeenCalledWith('http://test.test2', '_blank')
    done()
  })

  it('alerts if combine fails', async done => {
    fetchMock.postOnce('/generate', {
      status: 200,
      body: {
        url: 'http://test.test',
        filename: 'title.pdf',
      },
    })
    fetchMock.postOnce('/combine', {
      status: 500,
      body: {
        detail: 'Something has gone wrong'
      },
    })
    window.open = jest.fn()
    const spy = jest.spyOn(Swal, 'fire')
    const { getByTestId } = render(<Form url="http://test.test" setUrl={jest.fn()} />)
    fireEvent.change(getByTestId('title'), { target: { value: 'Test Title' } })
    fireEvent.change(getByTestId('part-name'), { target: { value: 'Test Part Name' } })
    fireEvent.change(getByTestId('part-additional'), {
      target: { value: 'Additional Part Info' },
    })
    fireEvent.click(getByTestId('submit-button'))
    await act(async () => await fetchMock.flush(true))

    const mockFile = new File(['one two three'], 'test-file.pdf', {
      type: 'application/pdf',
    })
    mockFile.filename = 'test-file.pdf'
    await fireEvent.change(getByTestId('combine-file'), {
      target: {
        files: [mockFile],
      },
    })
    await fireEvent.click(getByTestId('combine-button'))
    await act(async () => await fetchMock.flush(true))
    expect(spy).toHaveBeenCalledWith({
      title: 'Error',
      text: 'Something has gone wrong',
      type: 'error'
    })
    done()
  })

  it('alerts if combine thows an error', async done => {
    fetchMock.postOnce('/generate', {
      status: 200,
      body: {
        url: 'http://test.test',
        filename: 'title.pdf',
      },
    })
    fetchMock.postOnce('/combine', {
      throws: new Error('Network Error')
    })
    window.open = jest.fn()
    const spy = jest.spyOn(Swal, 'fire')
    const { getByTestId } = render(<Form url="http://test.test" setUrl={jest.fn()} />)
    fireEvent.change(getByTestId('title'), { target: { value: 'Test Title' } })
    fireEvent.change(getByTestId('part-name'), { target: { value: 'Test Part Name' } })
    fireEvent.change(getByTestId('part-additional'), {
      target: { value: 'Additional Part Info' },
    })
    fireEvent.click(getByTestId('submit-button'))
    await act(async () => await fetchMock.flush(true))

    const mockFile = new File(['one two three'], 'test-file.pdf', {
      type: 'application/pdf',
    })
    mockFile.filename = 'test-file.pdf'
    await fireEvent.change(getByTestId('combine-file'), {
      target: {
        files: [mockFile],
      },
    })
    await fireEvent.click(getByTestId('combine-button'))
    await act(async () => await fetchMock.flush(true))
    expect(spy).toHaveBeenCalledWith({
      title: 'Error',
      text: 'Error: Network Error',
      type: 'error'
    })
    done()
  })
})

describe('ListField', () => {
  it('render items and remove buttons for each item', () => {
    const mockActions = {
      push: jest.fn(),
      removeIndex: jest.fn(),
    }
    const { queryByTestId, getByTestId, container } = render(
      <ListField
        items={['one', 'two', 'three']}
        actions={mockActions}
        name="test-name"
        label="Label Test"
        placeholder="placeholder test"
      />
    )

    expect(container.querySelectorAll('li').length).toEqual(3)

    expect(queryByTestId('test-name-item-0')).toBeTruthy()
    expect(queryByTestId('test-name-item-1')).toBeTruthy()
    expect(queryByTestId('test-name-item-2')).toBeTruthy()

    expect(getByTestId('test-name-item-0').textContent).toEqual('one')
    expect(getByTestId('test-name-item-1').textContent).toEqual('two')
    expect(getByTestId('test-name-item-2').textContent).toEqual('three')

    expect(queryByTestId('test-name-item-0-remove')).toBeTruthy()
    expect(queryByTestId('test-name-item-1-remove')).toBeTruthy()
    expect(queryByTestId('test-name-item-2-remove')).toBeTruthy()
  })

  it('adds value from input on click', () => {
    const mockActions = {
      push: jest.fn(),
      removeIndex: jest.fn(),
    }
    const { getByTestId } = render(
      <ListField
        items={[]}
        actions={mockActions}
        name="test-name"
        label="Label Test"
        placeholder="placeholder test"
      />
    )
    fireEvent.change(getByTestId('test-name-next-input'), {
      target: { value: 'next value' },
    })
    fireEvent.click(getByTestId('test-name-add-button'))
    expect(mockActions.push).toHaveBeenCalledWith('next value')
  })

  it('removes item when remove button is clicked', () => {
    const mockActions = {
      push: jest.fn(),
      removeIndex: jest.fn(),
    }
    const { getByTestId, container } = render(
      <ListField
        items={['one', 'two', 'three']}
        actions={mockActions}
        name="test-name"
        label="Label Test"
        placeholder="placeholder test"
      />
    )

    expect(container.querySelectorAll('li').length).toEqual(3)

    fireEvent.click(getByTestId('test-name-item-0-remove'))
    expect(mockActions.removeIndex).toHaveBeenCalledWith(0)

    fireEvent.click(getByTestId('test-name-item-1-remove'))
    expect(mockActions.removeIndex).toHaveBeenCalledWith(1)

    fireEvent.click(getByTestId('test-name-item-2-remove'))
    expect(mockActions.removeIndex).toHaveBeenCalledWith(2)
  })
})
