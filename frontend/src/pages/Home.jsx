import React, { useState, useEffect } from 'react';
import { fetchCards as apiFetchCards } from '../api/cards';
import { fetchSeries } from '../api/series';
import { fetchSets } from '../api/sets';
import { fetchCardTypes } from '../api/cardTypes';
import CardForm from '../components/CardForm';
import CardList from '../components/CardList';
import SearchPanel from '../components/SearchPanel';

export default function Home() {
	const [cards, setCards] = useState([]);
	const [filteredCards, setFilteredCards] = useState(null);

	const [seriesList, setSeriesList] = useState([]);
	const [sets, setSets] = useState([]);
	const [types, setTypes] = useState([]);

	useEffect(() => {
		apiFetchCards()
			.then(r => setCards(r.data))
			.catch(console.error);

		fetchSeries()
			.then(r => setSeriesList(r.data))
			.catch(console.error);

		fetchSets()
			.then(r => setSets(r.data))
			.catch(console.error);

		fetchCardTypes()
			.then(r => setTypes(r.data))
			.catch(console.error);
	}, []);

	const handleNewCard = newCard => {
		setCards(cs => [newCard, ...cs]);
	};

	const handleRemoveCard = id => {
		setCards(cs => cs.filter(c => c.id !== id));
		setFilteredCards(fc => (fc ? fc.filter(c => c.id !== id) : null));
	};

	const handleSearchResults = results => {
		setFilteredCards(results);
	};

	const displayCards = filteredCards !== null ? filteredCards : cards;

	return (
		<div className="manage-cards">
			<CardForm
				onSuccess={handleNewCard}
			/>
			<SearchPanel onResults={handleSearchResults} />
			<CardList
				cards={displayCards}
				onDelete={handleRemoveCard}
				seriesList={seriesList}
				sets={sets}
				types={types}
			/>
		</div>
	);
}
