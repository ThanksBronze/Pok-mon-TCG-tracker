import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../api/series', () => ({ fetchSeries: jest.fn() }));
jest.mock('../api/sets', () => ({ fetchSets: jest.fn() }));
jest.mock('../api/cardTypes', () => ({ fetchCardTypes: jest.fn() }));
jest.mock('../api/cards', () => ({
	deleteCard: jest.fn(),
	updateCard: jest.fn()
}));

import CardList from './CardList';
import { fetchSeries } from '../api/series';
import { fetchSets } from '../api/sets';
import { fetchCardTypes } from '../api/cardTypes';
import { deleteCard, updateCard } from '../api/cards';

const dummyCards = [
	{ id: 1, name: 'Alpha', image_small: 'a.png', series_id: null, set_id: null, type_id: null, no_in_set: null },
	{ id: 2, name: 'Beta', image_small: 'b.png', series_id: null, set_id: null, type_id: null, no_in_set: null }
];
const dummySeries = [{ id: 10, name: 'Series A' }];
const dummySets = [{ id: 20, series_id: 10, name_of_expansion: 'Set X' }];
const dummyTypes = [{ id: 30, name: 'Type I' }];

beforeEach(() => {
	fetchSeries.mockResolvedValue({ data: dummySeries });
	fetchSets.mockResolvedValue({ data: dummySets });
	fetchCardTypes.mockResolvedValue({ data: dummyTypes });
	updateCard.mockResolvedValue({ data: { ...dummyCards[0], name: 'UpdatedName' } });
	deleteCard.mockResolvedValue({});
	window.confirm = jest.fn(() => true);
});

afterEach(() => {
	jest.clearAllMocks();
});

test('renders cards and filters by name', async () => {
	render(<CardList cards={dummyCards} />);

	await waitFor(() => expect(fetchSeries).toHaveBeenCalled());

	expect(screen.getByText('Alpha')).toBeInTheDocument();
	expect(screen.getByText('Beta')).toBeInTheDocument();

	const input = screen.getByPlaceholderText('Filter cards…');
	fireEvent.change(input, { target: { value: 'alp' } });

	expect(screen.getByText('Alpha')).toBeInTheDocument();
	expect(screen.queryByText('Beta')).toBeNull();
});

test('opens modal on card click and handles update/delete', async () => {
	render(<CardList cards={dummyCards} />);

	await waitFor(() => expect(fetchCardTypes).toHaveBeenCalled());

	const firstCard = screen.getAllByTestId('card-item')[0];
	fireEvent.click(firstCard);

	const overlay = await screen.findByTestId('modal-overlay');
	expect(overlay).toBeInTheDocument();

	fireEvent.click(screen.getByText('Edit'));
	const nameInput = screen.getByLabelText('Name');
	fireEvent.change(nameInput, { target: { value: 'UpdatedName' } });
	fireEvent.click(screen.getByText('Save'));
	await waitFor(() => expect(updateCard).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'UpdatedName' })));
	await waitFor(() => {
		const modalHeader = within(screen.getByTestId('modal-overlay')).getByRole('heading', { name: 'UpdatedName' });
		expect(modalHeader).toBeInTheDocument();
	});
});