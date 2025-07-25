import React, { useState, useEffect } from 'react';
import { fetchCards as apiFetchCards } from '../api/cards';
import CardForm from '../components/CardForm';
import CardList from '../components/CardList';

export default function Home() {
	const [cards, setCards] = useState([]);

	useEffect(() => {
		apiFetchCards()
			.then(res => setCards(res.data))
			.catch(err => console.error('Fetch cards error:', err));
	}, []);

	const handleNewCard = newCard => {
		setCards(cs => [newCard, ...cs]);
	};

	return (
		<div className="manage-cards">
			<CardForm onSuccess={handleNewCard} />
			<CardList cards={cards} />
		</div>
	);
}
