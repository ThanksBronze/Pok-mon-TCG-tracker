import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardList from './CardList';

import * as cardsApi from '../api/cards';
import { fetchSeries } from '../api/series';
import { fetchSets } from '../api/sets';
import { fetchCardTypes } from '../api/cardTypes';
import { fetchUsers } from '../api/users';

jest.mock('../api/cards');
jest.mock('../api/series');
jest.mock('../api/sets');
jest.mock('../api/cardTypes');
jest.mock('../api/users');

describe('<CardList />', () => {
	const initialCards = [
		{ id: 1, name: 'Card A', type_id: 10, set_id: 100, no_in_set: 1, user_id: 1000 },
		{ id: 2, name: 'Card B', type_id: 20, set_id: 200, no_in_set: 2, user_id: 2000 },
	];

	beforeEach(() => {
		cardsApi.fetchCards.mockResolvedValue({ data: initialCards });
		cardsApi.createCard.mockImplementation(({ name, type_id, set_id, no_in_set, user_id }) =>
			Promise.resolve({ data: { id: 3, name, type_id, set_id, no_in_set, user_id } })
		);
		cardsApi.updateCard.mockResolvedValue({ data: {} });
		cardsApi.deleteCard.mockResolvedValue({ data: {} });

		fetchSeries.mockResolvedValue({
			data: [{ id: 1, name: 'Serie 1' }]
		});
		fetchSets.mockResolvedValue({
			data: [
				{ id: 100, name_of_expansion: 'Set A', series_id: 1 },
				{ id: 200, name_of_expansion: 'Set B', series_id: 1 },
			]
		});
		fetchCardTypes.mockResolvedValue({
			data: [
				{ id: 10, name: 'Typ X' },
				{ id: 20, name: 'Typ Y' },
			]
		});
		fetchUsers.mockResolvedValue({
			data: [
				{ id: 1000, username: 'Alice' },
				{ id: 2000, username: 'Bob' },
			]
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('fetches and displays cards on mount', async () => {
		render(<CardList />);
		await waitFor(() => expect(cardsApi.fetchCards).toHaveBeenCalled());
		expect(await screen.findByText('Card A')).toBeInTheDocument();
		expect(screen.getByText('Card B')).toBeInTheDocument();
	});

	test('filters cards as you type', async () => {
		render(<CardList />);
		await screen.findByText('Card A');
		const filterInput = screen.getByPlaceholderText('Type to filter...');
		fireEvent.change(filterInput, { target: { value: 'B' } });

		expect(screen.queryByText('Card A')).toBeNull();
		expect(screen.getByText('Card B')).toBeInTheDocument();
	});

	test('adds a new card when form is submitted', async () => {
		render(<CardList />);
		await screen.findByText('Card A');

		fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Card C' } });

		const selects = screen.getAllByRole('combobox');
		fireEvent.change(selects[0], { target: { value: '1' } });    // Serie 1
		fireEvent.change(selects[1], { target: { value: '10' } });   // Typ X
		fireEvent.change(selects[2], { target: { value: '100' } });  // Set A

		fireEvent.change(screen.getByPlaceholderText('No. in Set (opt)'), { target: { value: '3' } });

		fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

		await waitFor(() => {
			expect(cardsApi.createCard).toHaveBeenCalledWith({
				name: 'Card C',
				type_id: 10,
				set_id: 100,
				no_in_set: 3,
			});
		});

		expect(await screen.findByText('Card C')).toBeInTheDocument();
	});

	test('edits an existing card', async () => {
		render(<CardList />);
		await screen.findByText('Card A'); 
		fireEvent.click(screen.getAllByRole('button', { name: /Edit/i })[0]);
		const nameInput = screen.getByDisplayValue('Card A');
		fireEvent.change(nameInput, { target: { value: 'Card A Edited' } });
		fireEvent.click(screen.getByRole('button', { name: /Save/i }));
		await waitFor(() => expect(cardsApi.updateCard).toHaveBeenCalledWith(
			1,
			expect.objectContaining({ name: 'Card A Edited' })
		));
		expect(await screen.findByText('Card A Edited')).toBeInTheDocument();
	});

	test('deletes a card when Delete is clicked', async () => {
		render(<CardList />);
		await screen.findByText('Card A');

		fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);
			await waitFor(() => expect(cardsApi.deleteCard).toHaveBeenCalledWith(1));
			await waitFor(() => expect(screen.queryByText('Card A')).toBeNull());
	});
});