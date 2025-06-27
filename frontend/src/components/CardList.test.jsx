import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardList from './CardList';
import * as api from '../api/cards';

jest.mock('../api/cards');

describe('<CardList />', () => {
  const initialCards = [
    { id: 1, name: 'Card A', type_id: 10, set_id: 100, no_in_set: 1, user_id: 1000 },
    { id: 2, name: 'Card B', type_id: 20, set_id: 200, no_in_set: 2, user_id: 2000 },
  ];

  beforeEach(() => {
    api.fetchCards.mockResolvedValue({ data: initialCards });
    api.createCard.mockImplementation(({ name, type_id, set_id, no_in_set, user_id }) =>
      Promise.resolve({ data: { id: 3, name, type_id, set_id, no_in_set, user_id } })
    );
    api.updateCard.mockResolvedValue({});
    api.deleteCard.mockImplementation(id => Promise.resolve({ data: { id } }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and displays cards on mount', async () => {
    render(<CardList />);
    await waitFor(() => expect(api.fetchCards).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.getByText('Card A')).toBeInTheDocument();
      expect(screen.getByText('Card B')).toBeInTheDocument();
    });
  });

  test('filters cards as you type', async () => {
    render(<CardList />);
    // wait for cards to appear
    await waitFor(() => screen.getByText('Card A'));
    const input = screen.getByPlaceholderText('Type to filter...');
    fireEvent.change(input, { target: { value: 'B' } });

    expect(screen.queryByText('Card A')).not.toBeInTheDocument();
    expect(screen.getByText('Card B')).toBeInTheDocument();
  });

  test('adds a new card when form is submitted', async () => {
    render(<CardList />);
    await waitFor(() => screen.getByText('Card A'));

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Card C' } });
    fireEvent.change(screen.getByPlaceholderText('Type ID'), { target: { value: '30' } });
    fireEvent.change(screen.getByPlaceholderText('Set ID'), { target: { value: '300' } });
    fireEvent.change(screen.getByPlaceholderText('No. in Set (opt)'), { target: { value: '3' } });
    fireEvent.change(screen.getByPlaceholderText('User ID'), { target: { value: '3000' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

    await waitFor(() => expect(api.createCard).toHaveBeenCalledWith({
      name: 'Card C',
      type_id: 30,
      set_id: 300,
      no_in_set: 3,
      user_id: 3000,
    }));

    await waitFor(() => expect(screen.getByText('Card C')).toBeInTheDocument());
  });

  test('edits an existing card', async () => {
    render(<CardList />);
    await waitFor(() => screen.getByText('Card A'));

    fireEvent.click(screen.getAllByRole('button', { name: /Edit/i })[0]);
    const nameInput = screen.getByDisplayValue('Card A');
    fireEvent.change(nameInput, { target: { value: 'Card A Edited' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => expect(api.updateCard).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        name: 'Card A Edited',
        type_id: 10,
        set_id: 100,
        no_in_set: 1,
        user_id: 1000,
      })
    ));

    await waitFor(() => expect(screen.getByText('Card A Edited')).toBeInTheDocument());
  });

  test('deletes a card when Delete is clicked', async () => {
    render(<CardList />);
    await waitFor(() => screen.getByText('Card A'));

    fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);
    await waitFor(() => expect(api.deleteCard).toHaveBeenCalledWith(1));

    await waitFor(() => expect(screen.queryByText('Card A')).not.toBeInTheDocument());
  });
});
