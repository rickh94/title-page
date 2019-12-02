import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import Autocomplete from '../src/components/Autocomplete/Autocomplete.jsx';
import fetchMock from 'fetch-mock';

import '@testing-library/jest-dom/extend-expect.js';


describe('Autocomplete', () => {
  let dirtyActions;
  let valueActions;
  const onSubmit = jest.fn();
  beforeEach(() => {
    dirtyActions = {
      setTrue: jest.fn(),
      setFalse: jest.fn(),
      toggle: jest.fn(),
    };
    valueActions = {
      setValue: jest.fn(),
      onChange: jest.fn(),
    };
  });
  afterEach(() => {
    cleanup();
    fetchMock.restore();
    onSubmit.mockRestore();
  });
  const basicRender = () => {
    fetchMock.getOnce('/completions/test', {
      status: 200,
      body: ['test', 'apple', 'action', 'testing'],
    });
    return render(<Autocomplete
      completionsEndpoint="/completions/test"
      value=""
      dirtyActions={dirtyActions}
      onSubmit={onSubmit}
      name={'test'}
      valueActions={valueActions}
    />);
  };

  it('matches snapshot', () => {
    const { container } = basicRender();
    expect(container).toMatchSnapshot();
  });

  it('sets value on change', () => {
    const { getByTestId } = basicRender();
    const testEvent = { target: { value: 'test' } };
    fireEvent.change(getByTestId('test-next-input'), testEvent);
    expect(valueActions.onChange).toHaveBeenCalled();
  });

  it('sets dirty on change', () => {
    const { getByTestId } = basicRender();
    const testEvent = { target: { value: 'test' } };
    fireEvent.change(getByTestId('test-next-input'), testEvent);
    expect(dirtyActions.setTrue).toHaveBeenCalled();
  });

  it('shows suggestions on change', async () => {
    const { getByTestId, findAllByTestId, rerender } = basicRender();
    await act(async () => await fetchMock.flush(true));
    await fireEvent.change(getByTestId('test-next-input'), { target: { value: 'test' } });
    rerender(
      <Autocomplete
        completionsEndpoint="/completions/test"
        value="test"
        dirtyActions={dirtyActions}
        onSubmit={jest.fn()}
        name="test"
        valueActions={valueActions}
      />,
    );
    const suggestions = await findAllByTestId('test-suggestion-item');
    expect(suggestions.length).toBe(2);
    const suggestionsContent = suggestions.map(item => item.textContent);
    expect(suggestionsContent).toContain('test');
    expect(suggestionsContent).toContain('testing');
    expect(suggestionsContent).not.toContain('apple');
    expect(suggestionsContent).not.toContain('action');
  });

  it('changes value on suggestion click', async () => {
    const { getByTestId, getAllByTestId, rerender } = basicRender();
    await act(async () => await fetchMock.flush(true));
    await fireEvent.change(getByTestId('test-next-input'), { target: { value: 'test' } });
    rerender(
      <Autocomplete
        completionsEndpoint="/completions/test"
        value="test"
        dirtyActions={dirtyActions}
        onSubmit={jest.fn()}
        name="test"
        valueActions={valueActions}
      />,
    );
    await fireEvent.click(getAllByTestId('test-suggestion-item')[0]);
    expect(valueActions.setValue).toHaveBeenCalledWith('test');
  });

  it('changes value to first suggestion on enter', async () => {
    const { getByTestId, getAllByTestId, rerender } = basicRender();
    await act(async () => await fetchMock.flush(true));
    await fireEvent.change(getByTestId('test-next-input'), { target: { value: 'a' } });
    rerender(
      <Autocomplete
        completionsEndpoint="/completions/test"
        value="a"
        dirtyActions={dirtyActions}
        onSubmit={jest.fn()}
        name="test"
        valueActions={valueActions}
      />,
    );
    const text = getAllByTestId('test-suggestion-item')[0].textContent;
    await fireEvent.keyDown(getByTestId('test-next-input'), { key: 'Enter' });
    expect(valueActions.setValue).toHaveBeenCalledWith(text);
  });

  it('hides suggestions after selection', async () => {
    const { getByTestId, rerender, queryAllByTestId } = basicRender();
    await act(async () => await fetchMock.flush(true));
    await fireEvent.change(getByTestId('test-next-input'), { target: { value: 'a' } });
    rerender(
      <Autocomplete
        completionsEndpoint="/completions/test"
        value="a"
        dirtyActions={dirtyActions}
        onSubmit={jest.fn()}
        name="test"
        valueActions={valueActions}
      />,
    );
    await fireEvent.keyDown(getByTestId('test-next-input'), { key: 'Enter' });
    expect(queryAllByTestId('test-suggestion-item')).toHaveLength(0);
  });

  it('does nothing onKeyDown if not value', async () => {
    const { getByTestId } = basicRender();
    await fireEvent.keyDown(getByTestId('test-next-input'), { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(valueActions.setValue).not.toHaveBeenCalled();
  });

  it('calls submit if enter is pressed and there are no suggestions', async () => {
    fetchMock.getOnce('/completions/test', {
      status: 200,
      body: [],
    });
    const { getByTestId } = render(<Autocomplete
      completionsEndpoint="/completions/test"
      value="123"
      dirtyActions={dirtyActions}
      onSubmit={onSubmit}
      name={'test'}
      valueActions={valueActions}
    />);
    await act(async () => await fetchMock.flush(true));
    await fireEvent.keyDown(getByTestId('test-next-input'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalled();
    expect(valueActions.setValue).not.toHaveBeenCalled();
  });

  it('changes active suggestion on arrow', async () => {
    const { getByTestId, rerender, getAllByTestId } = basicRender();
    await act(async () => await fetchMock.flush(true));

    await fireEvent.change(getByTestId('test-next-input'), { target: { value: 'tes' } });
    rerender(
      <Autocomplete
        completionsEndpoint="/completions/test"
        value="tes"
        dirtyActions={dirtyActions}
        onSubmit={jest.fn()}
        name="test"
        valueActions={valueActions}
      />,
    );
    expect(getAllByTestId('test-suggestion-item')[0]).toHaveClass('suggestion-active');
    expect(getAllByTestId('test-suggestion-item')[1]).not.toHaveClass('suggestion-active');
    // arrow down moves down
    await fireEvent.keyDown(getByTestId('test-next-input'), { key: 'ArrowDown' });
    expect(getAllByTestId('test-suggestion-item')[0]).not.toHaveClass('suggestion-active');
    expect(getAllByTestId('test-suggestion-item')[1]).toHaveClass('suggestion-active');
    // arrow down does nothing at bottom
    await fireEvent.keyDown(getByTestId('test-next-input'), { key: 'ArrowDown' });
    expect(getAllByTestId('test-suggestion-item')[0]).not.toHaveClass('suggestion-active');
    expect(getAllByTestId('test-suggestion-item')[1]).toHaveClass('suggestion-active');
    // arrow up moves up
    await fireEvent.keyDown(getByTestId('test-next-input'), { key: 'ArrowUp' });
    expect(getAllByTestId('test-suggestion-item')[0]).toHaveClass('suggestion-active');
    expect(getAllByTestId('test-suggestion-item')[1]).not.toHaveClass('suggestion-active');
    // arrow up does nothing at top
    await fireEvent.keyDown(getByTestId('test-next-input'), { key: 'ArrowUp' });
    expect(getAllByTestId('test-suggestion-item')[0]).toHaveClass('suggestion-active');
    expect(getAllByTestId('test-suggestion-item')[1]).not.toHaveClass('suggestion-active');
  });

  it('shows no suggestions message if no suggestions', async () => {
    const { getByTestId, queryByTestId, rerender } = basicRender();
    await act(async () => await fetchMock.flush(true));

    expect(queryByTestId('test-no-suggestions')).not.toBeInTheDocument();
    await fireEvent.change(getByTestId('test-next-input'),
      { target: { value: 'no valid suggestions' } },
    );
    rerender(
      <Autocomplete
        completionsEndpoint="/completions/test"
        value="no valid suggestions"
        dirtyActions={dirtyActions}
        onSubmit={jest.fn()}
        name="test"
        valueActions={valueActions}
      />,
    );

    expect(queryByTestId('test-no-suggestions')).toBeInTheDocument();
    expect(queryByTestId('test-suggestions')).not.toBeInTheDocument();
  });
});
