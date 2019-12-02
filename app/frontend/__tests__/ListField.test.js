import { fireEvent, render } from '@testing-library/react';
import ListField from '../src/components/ListField/ListField';
import React from 'react';

describe('ListField', () => {
  let dirtyActions;
  let mockActions;
  beforeEach(() => {
    dirtyActions = {
      toggle: jest.fn(),
      setTrue: jest.fn(),
      setFalse: jest.fn(),
    };
    mockActions = {
      push: jest.fn(),
      removeIndex: jest.fn(),
    };
  });

  it('matches the snapshot', () => {
    const { container } = render(
      <ListField
        items={['one', 'two', 'three']}
        actions={mockActions}
        name="test-name"
        label="Label Test"
        placeholder="placeholder test"
        dirtyActions={dirtyActions}
      />);

    expect(container).toMatchSnapshot();
  });

  it('render items and remove buttons for each item', () => {
    const { queryByTestId, getByTestId, container } = render(
      <ListField
        items={['one', 'two', 'three']}
        actions={mockActions}
        name="test-name"
        label="Label Test"
        placeholder="placeholder test"
        dirtyActions={dirtyActions}
      />,
    );

    expect(container.querySelectorAll('li').length).toEqual(3);

    expect(queryByTestId('test-name-item-0')).toBeTruthy();
    expect(queryByTestId('test-name-item-1')).toBeTruthy();
    expect(queryByTestId('test-name-item-2')).toBeTruthy();

    expect(getByTestId('test-name-item-0').textContent).toEqual('one');
    expect(getByTestId('test-name-item-1').textContent).toEqual('two');
    expect(getByTestId('test-name-item-2').textContent).toEqual('three');

    expect(queryByTestId('test-name-item-0-remove')).toBeTruthy();
    expect(queryByTestId('test-name-item-1-remove')).toBeTruthy();
    expect(queryByTestId('test-name-item-2-remove')).toBeTruthy();
  });

  it('adds value from input on click', () => {
    const { getByTestId } = render(
      <ListField
        items={[]}
        actions={mockActions}
        name="test-name"
        label="Label Test"
        placeholder="placeholder test"
        dirtyActions={dirtyActions}
      />,
    );
    fireEvent.change(getByTestId('test-name-next-input'), {
      target: { value: 'next value' },
    });
    fireEvent.click(getByTestId('test-name-add-button'));
    expect(mockActions.push).toHaveBeenCalledWith('next value');
    expect(dirtyActions.setFalse).toHaveBeenCalled();
  });

  it('removes item when remove button is clicked', () => {
    const { getByTestId, container } = render(
      <ListField
        items={['one', 'two', 'three']}
        actions={mockActions}
        name="test-name"
        label="Label Test"
        placeholder="placeholder test"
        dirtyActions={dirtyActions}
      />,
    );

    expect(container.querySelectorAll('li').length).toEqual(3);

    fireEvent.click(getByTestId('test-name-item-0-remove'));
    expect(mockActions.removeIndex).toHaveBeenCalledWith(0);

    fireEvent.click(getByTestId('test-name-item-1-remove'));
    expect(mockActions.removeIndex).toHaveBeenCalledWith(1);

    fireEvent.click(getByTestId('test-name-item-2-remove'));
    expect(mockActions.removeIndex).toHaveBeenCalledWith(2);
  });
});
