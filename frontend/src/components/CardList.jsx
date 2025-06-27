import React, { useEffect, useState } from 'react';
import { fetchCards, deleteCard } from '../api/cards';
import { Link } from 'react-router-dom';

export default function CardList() {
	const [cards, setCards] = useState([]);

	useEffect(() => {
		fetchCards().then(res => setCards(res.data));
	}, []);

	useEffect(() => {
		fetchCards()
			.then(res => {
				if (res && res.data) setCards(res.data);
				else console.error('FetchCards returned invalid response:', res);
			})
			.catch(err => {
				console.error('Failed to fetch cards:', err);
				setCards([]);  // eller visa ett felmeddelande i UI:t
			});
	}, []);

	const handleDelete = async id => {
		await deleteCard(id);
		setCards(cards.filter(c => c.id !== id));
	};

	return (
		<div>
			<h2>My Cards</h2>
			<Link to="/cards/new">+ New Card</Link>
			<ul>
				{cards.map(c => (
					<li key={c.id}>
						{c.name}{' '}
						<Link to={`/cards/${c.id}/edit`}>Edit</Link>{' '}
						<button onClick={() => handleDelete(c.id)}>Delete</button>
					</li>
				))}
			</ul>
		</div>
	);
}