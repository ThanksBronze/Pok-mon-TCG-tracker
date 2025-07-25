import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CardList from '../components/CardList';
import CardModal from '../components/CardModal';

describe('<CardList />', () => {
	const cards = [
		{
			id: 1,
			name: 'Pikachu',
			image_small: 'https://example.com/pika-small.png',
			image_large: 'https://example.com/pika-large.png',
			series_name: 'Base',
			set_name: 'Base Set',
			type_name: 'Electric',
			price_market: 12.34
		},
		{
			id: 2,
			name: 'Charizard',
			image_small: 'https://example.com/char-small.png',
			image_large: 'https://example.com/char-large.png',
			series_name: 'XY',
			set_name: 'XY Promo',
			type_name: 'Fire',
			price_market: 56.78
		}
	];

	test('render all cards with small image and name', () => {
		render(<CardList cards={cards} />);
		expect(screen.getByText('Pikachu')).toBeInTheDocument();
		expect(screen.getByText('Charizard')).toBeInTheDocument();
		const imgs = screen.getAllByRole('img');
		expect(imgs).toHaveLength(2);
		expect(imgs[0]).toHaveAttribute('src', cards[0].image_small);
		expect(imgs[1]).toHaveAttribute('src', cards[1].image_small);
	});

	test('filter cards in search filter', () => {
		render(<CardList cards={cards} />);
		const input = screen.getByPlaceholderText('Filter cards…');
		fireEvent.change(input, { target: { value: 'Char' } });
		expect(screen.queryByText('Pikachu')).toBeNull();
		expect(screen.getByText('Charizard')).toBeInTheDocument();
	});

	test('open modal when card is clicked', () => {
		render(<CardList cards={cards} />);
		fireEvent.click(screen.getByText('Charizard'));
	const overlay = screen.getByTestId('modal-overlay');
	expect(overlay).toBeInTheDocument();

	const modal = within(overlay);

	expect(modal.getByRole('heading', { level: 2 })).toHaveTextContent('Charizard');

	const largeImg = modal.getByRole('img', { name: /Charizard/ });
	expect(largeImg).toHaveAttribute('src', cards[1].image_large);

	expect(modal.getByText('Series: XY')).toBeInTheDocument();
	expect(modal.getByText('Set: XY Promo')).toBeInTheDocument();
	expect(modal.getByText('Type: Fire')).toBeInTheDocument();

	expect(modal.getByText('Market Price: $56.78')).toBeInTheDocument();
	});

	test('close modal when close button is pressed or outside box', () => {
		render(<CardList cards={cards} />);
		fireEvent.click(screen.getByText('Pikachu'));
		const closeBtn = screen.getByRole('button', { name: '×' });
		fireEvent.click(closeBtn);
		expect(screen.queryByTestId('modal-overlay')).toBeNull();

		fireEvent.click(screen.getByText('Pikachu'));
		const overlay = screen.getByTestId('modal-overlay');
		fireEvent.click(overlay);
		expect(screen.queryByTestId('modal-overlay')).toBeNull();
	});
});
