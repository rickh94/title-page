import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { Form } from '../src/components/Form/Form.jsx';
import fetchMock from 'fetch-mock';
import Swal from 'sweetalert2';

const setUrl = jest.fn();
afterEach(() => {
  cleanup();
  fetchMock.restore();
  setUrl.mockReset();
});

describe('Form', () => {
  const basicRender = () => render(<Form url="" setUrl={setUrl} />);
  const basicFillForm = getByTestId => {
    fireEvent.change(getByTestId('title'), { target: { value: 'Test Title' } });
    fireEvent.change(getByTestId('part-name'), { target: { value: 'Test Part Name' } });
    fireEvent.change(getByTestId('part-additional'), {
      target: { value: 'Additional Part Info' },
    });
    fireEvent.click(getByTestId('submit-button'));
  };

  const beforeCombine = () => {
    window.open = jest.fn();
    const setUrl = jest.fn();
    const { getByTestId } = render(<Form url="http://test.test" setUrl={setUrl} />);
    basicFillForm(getByTestId);
    return {
      getByTestId,
      windowOpen: window.open,
    };
  };

  const performCombine = async (getByTestId) => {
    const mockFile = new File(['one two three'], 'test-file.pdf', {
      type: 'application/pdf',
    });
    mockFile.filename = 'test-file.pdf';
    await fireEvent.drop(getByTestId('combine-area'), {
      target: {
        files: [mockFile],
      },
    });
    await fireEvent.click(getByTestId('combine-button'));
    await act(async () => await fetchMock.flush(true));
  };

  const submitCombine = async () => {
    const swalSpy = jest.spyOn(Swal, 'fire');
    const { getByTestId, windowOpen } = beforeCombine();
    await act(async () => await fetchMock.flush(true));
    await performCombine(getByTestId);
    return {
      swalSpy,
      windowOpen,
    };
  };
  it('matches snapshot', () => {
    const { container } = render(<Form url="" setUrl={jest.fn()} />);
    expect(container).toMatchSnapshot();
  });

  it('submits form data', async done => {
    fetchMock.postOnce('/generate', {
      status: 200,
      body: {
        url: 'http://test.test',
        filename: 'test.pdf',
      },
    });
    const { getByTestId } = basicRender();
    basicFillForm(getByTestId);

    expect(fetchMock.lastOptions().body).toEqual(
      JSON.stringify({
        title: 'Test Title',
        composers: [],
        font: 'Cormorant Garamond',
        part: 'Test Part Name',
        extra_info: [],
        part_additional: 'Additional Part Info',
      }),
    );
    await act(async () => await fetchMock.flush(true));
    expect(setUrl).toHaveBeenCalledWith('http://test.test');
    done();
  });

  it('alerts on submit error', async done => {
    const spy = jest.spyOn(Swal, 'fire');
    fetchMock.postOnce('/generate', {
      throws: new Error('Network Error'),
    });
    const { getByTestId } = basicRender();
    basicFillForm(getByTestId);

    expect(fetchMock.lastOptions().body).toEqual(
      JSON.stringify({
        title: 'Test Title',
        composers: [],
        font: 'Cormorant Garamond',
        part: 'Test Part Name',
        extra_info: [],
        part_additional: 'Additional Part Info',
      }),
    );
    await act(async () => await fetchMock.flush(true));
    expect(spy).toHaveBeenCalledWith({
      title: 'Error',
      text: 'Error: Network Error',
      type: 'error',
    });
    done();
  });

  it('alerts on submit error response', async done => {
    const spy = jest.spyOn(Swal, 'fire');
    fetchMock.postOnce('/generate', {
      status: 400,
      body: {
        detail: 'Wrong Data',
      },
    });
    const { getByTestId } = basicRender();
    basicFillForm(getByTestId);

    expect(fetchMock.lastOptions().body).toEqual(
      JSON.stringify({
        title: 'Test Title',
        composers: [],
        font: 'Cormorant Garamond',
        part: 'Test Part Name',
        extra_info: [],
        part_additional: 'Additional Part Info',
      }),
    );
    await act(async () => await fetchMock.flush(true));
    expect(spy).toHaveBeenCalledWith({
      title: 'Error',
      text: 'Error: Wrong Data',
      type: 'error',
    });
    done();
  });

  it('renders a file upload if a title page has already been generated', () => {
    const { queryByTestId } = render(<Form url="http://test.test" setUrl={jest.fn()} />);
    expect(queryByTestId('combine-area')).toBeTruthy();
    expect(queryByTestId('combine-button')).toBeTruthy();
  });

  it('calls combine correctly', async done => {
    fetchMock.postOnce('/generate', {
      status: 200,
      body: {
        url: 'http://test.test',
        filename: 'title.pdf',
      },
    });
    fetchMock.postOnce('/combine', {
      status: 200,
      body: {
        url: 'http://test.test2',
        filename: 'test.pdf',
      },
    });


    const {getByTestId, windowOpen} = beforeCombine();
    expect(fetchMock.lastOptions().body).toEqual(
      JSON.stringify({
        title: 'Test Title',
        composers: [],
        font: 'Cormorant Garamond',
        part: 'Test Part Name',
        extra_info: [],
        part_additional: 'Additional Part Info',
      }),
    );
    await act(async () => await fetchMock.flush(true));

    await performCombine(getByTestId);
    expect(fetchMock.lastOptions().body.get('file').filename).toEqual('test-file.pdf');
    expect(fetchMock.lastOptions().body.get('title_page_filename')).toEqual('title.pdf');
    expect(windowOpen).toHaveBeenCalledWith('http://test.test2', '_blank');
    done();
  });

  it('alerts if combine fails', async done => {
    fetchMock.postOnce('/generate', {
      status: 200,
      body: {
        url: 'http://test.test',
        filename: 'title.pdf',
      },
    });
    fetchMock.postOnce('/combine', {
      status: 500,
      body: {
        detail: 'Something has gone wrong',
      },
    });
    const { swalSpy } = await submitCombine();
    expect(swalSpy).toHaveBeenCalledWith({
      title: 'Error',
      text: 'Something has gone wrong',
      type: 'error',
    });
    done();
  });

  it('alerts if combine throws an error', async done => {
    fetchMock.postOnce('/generate', {
      status: 200,
      body: {
        url: 'http://test.test',
        filename: 'title.pdf',
      },
    });
    fetchMock.postOnce('/combine', {
      throws: new Error('Network Error'),
    });
    const { swalSpy } = await submitCombine();
    expect(swalSpy).toHaveBeenCalledWith({
      title: 'Error',
      text: 'Error: Network Error',
      type: 'error',
    });
    done();
  });
});
